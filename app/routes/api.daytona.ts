import { type ActionFunctionArgs, json } from '@remix-run/cloudflare';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import * as path from 'node:path';

const COOKIE_NAME = 'beamcore_daytona';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const TERMINAL_SESSION_ID = 'beamcore-terminal';
const MAX_SYNC_FILES = 300;
const MAX_SYNC_BYTES = 2_500_000;

type DaytonaFileInput = { path: string; content: string };

let clientPromise: Promise<any> | undefined;

async function getDaytonaClient() {
  const apiKey = process.env.DAYTONA_API_KEY;

  if (!apiKey) {
    throw new Error('DAYTONA_API_KEY is missing from this Vercel Preview deployment.');
  }

  if (!clientPromise) {
    clientPromise = import('@daytona/sdk').then(({ Daytona }) => new Daytona({ apiKey }));
  }

  return clientPromise;
}

function getCookieValue(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const prefix = COOKIE_NAME + '=';
  const item = cookieHeader.split(';').map((value) => value.trim()).find((value) => value.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : undefined;
}

function signSandboxId(sandboxId: string) {
  const key = process.env.DAYTONA_API_KEY || '';
  return createHmac('sha256', key).update('beamcore:' + sandboxId).digest('base64url');
}

function readSandboxId(request: Request) {
  const value = getCookieValue(request);

  if (!value) {
    return undefined;
  }

  const [sandboxId, signature] = value.split('.');

  if (!sandboxId || !signature) {
    return undefined;
  }

  const expected = signSandboxId(sandboxId);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (receivedBuffer.length !== expectedBuffer.length || !timingSafeEqual(receivedBuffer, expectedBuffer)) {
    return undefined;
  }

  return sandboxId;
}

function makeSessionCookie(sandboxId: string) {
  const value = sandboxId + '.' + signSandboxId(sandboxId);

  return COOKIE_NAME + '=' + encodeURIComponent(value) +
    '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + COOKIE_MAX_AGE;
}

function isSafeRelativePath(value: string) {
  const normalized = path.posix.normalize(value.replace(/\\/g, '/'));
  return Boolean(
    value &&
    !path.posix.isAbsolute(value) &&
    normalized !== '.' &&
    normalized !== '..' &&
    !normalized.startsWith('../') &&
    !normalized.includes('\0'),
  );
}

async function ensureParentFolders(sandbox: any, relativePath: string) {
  const folder = path.posix.dirname(relativePath);

  if (!folder || folder === '.') {
    return;
  }

  let current = '';

  for (const segment of folder.split('/')) {
    current = current ? current + '/' + segment : segment;

    try {
      await sandbox.fs.createFolder(current, '755');
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      if (!/exist|already|409/i.test(detail)) {
        throw error;
      }
    }
  }
}

async function getOrCreateSandbox(request: Request) {
  const daytona = await getDaytonaClient();
  const existingId = readSandboxId(request);

  if (existingId) {
    try {
      const sandbox = await daytona.get(existingId);

      if (sandbox.state === 'stopped' || sandbox.state === 'paused' || sandbox.state === 'archived') {
        await sandbox.start(60);
      }

      await sandbox.refreshActivity().catch(() => undefined);

      return { daytona, sandbox, cookie: undefined as string | undefined };
    } catch (error) {
      console.warn('[BeamCore] Saved Daytona sandbox could not be restored; creating a new one.', error);
    }
  }

  const sandbox = await daytona.create({
    language: 'typescript',
    name: 'beamcore-' + randomUUID().slice(0, 8),
    labels: { app: 'beamcore', runtime: 'preview' },
    autoStopInterval: 60,
    autoArchiveInterval: 1440,
  }, { timeout: 90 });

  return { daytona, sandbox, cookie: makeSessionCookie(sandbox.id) };
}

async function ensureTerminalSession(sandbox: any) {
  try {
    await sandbox.process.getSession(TERMINAL_SESSION_ID);
  } catch {
    try {
      await sandbox.process.createSession(TERMINAL_SESSION_ID);
    } catch {
      await sandbox.process.getSession(TERMINAL_SESSION_ID);
    }
  }
}

function detectDevPort(command: string) {
  const explicit = command.match(/(?:--port\s+|--port=|PORT=)(\d{2,5})/i);

  if (explicit) {
    return Number(explicit[1]);
  }

  return /\b(?:next\s+(?:dev|start)|react-scripts\s+start|vite\s+preview|npm\s+start)\b/i.test(command)
    ? 3000
    : 5173;
}

function isDevServerCommand(command: string) {
  return /\b(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?(?:dev|start|preview)\b/i.test(command);
}

function normalizeOutput(result: any) {
  return String(result?.output ?? result?.result ?? result?.stdout ?? result?.artifacts?.stdout ?? '');
}

async function getPreview(sandbox: any, port: number) {
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error('Preview port must be between 1024 and 65535.');
  }

  const signed = await sandbox.getSignedPreviewUrl(port, 3600);

  return {
    port,
    ready: true,
    baseUrl: signed.url,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed.' }, { status: 405 });
  }

  const origin = request.headers.get('origin');

  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) {
        return json({ ok: false, error: 'Cross-origin requests are not allowed.' }, { status: 403 });
      }
    } catch {
      return json({ ok: false, error: 'Invalid request origin.' }, { status: 403 });
    }
  }

  let body: Record<string, any>;

  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const op = body.op;

  if (!['status', 'file', 'sync', 'command', 'preview'].includes(op)) {
    return json({ ok: false, error: 'Unsupported Daytona operation.' }, { status: 400 });
  }

  try {
    const { sandbox, cookie } = await getOrCreateSandbox(request);
    const headers = new Headers({ 'Cache-Control': 'no-store' });

    if (cookie) {
      headers.append('Set-Cookie', cookie);
    }

    if (op === 'status') {
      return json({ ok: true, sandboxState: sandbox.state || 'started' }, { headers });
    }

    if (op === 'file') {
      if (typeof body.path !== 'string' || typeof body.content !== 'string' || !isSafeRelativePath(body.path)) {
        return json({ ok: false, error: 'A safe relative file path and text content are required.' }, { status: 400, headers });
      }

      if (body.content.length > 750_000) {
        return json({ ok: false, error: 'The file is too large to upload in one action.' }, { status: 413, headers });
      }

      await ensureParentFolders(sandbox, body.path);
      await sandbox.fs.uploadFile(Buffer.from(body.content, 'utf8'), body.path);

      return json({ ok: true, path: path.posix.normalize(body.path) }, { headers });
    }

    if (op === 'sync') {
      if (!Array.isArray(body.files) || body.files.length > MAX_SYNC_FILES) {
        return json({ ok: false, error: 'Sync accepts up to ' + MAX_SYNC_FILES + ' files.' }, { status: 400, headers });
      }

      const files = body.files as DaytonaFileInput[];
      let totalBytes = 0;

      for (const file of files) {
        if (!file || typeof file.path !== 'string' || typeof file.content !== 'string' || !isSafeRelativePath(file.path)) {
          return json({ ok: false, error: 'A sync entry contains an invalid path or content.' }, { status: 400, headers });
        }

        totalBytes += Buffer.byteLength(file.content, 'utf8');

        if (totalBytes > MAX_SYNC_BYTES) {
          return json({ ok: false, error: 'Project sync is larger than the 2.5 MB request limit.' }, { status: 413, headers });
        }
      }

      for (const file of files) {
        await ensureParentFolders(sandbox, file.path);
        await sandbox.fs.uploadFile(Buffer.from(file.content, 'utf8'), file.path);
      }

      return json({ ok: true, filesUploaded: files.length }, { headers });
    }

    if (op === 'preview') {
      const port = Number(body.port);

      if (!Number.isInteger(port) || port < 1024 || port > 65535) {
        return json({ ok: false, error: 'Preview port must be between 1024 and 65535.' }, { status: 400, headers });
      }

      const preview = await getPreview(sandbox, port);

      return json({ ok: true, preview }, { headers });
    }

    if (typeof body.command !== 'string' || !body.command.trim() || body.command.length > 8_000) {
      return json({ ok: false, error: 'A command between 1 and 8,000 characters is required.' }, { status: 400, headers });
    }

    await ensureTerminalSession(sandbox);

    const command = body.command.trim();
    const devServer = isDevServerCommand(command);
    const result = await sandbox.process.executeSessionCommand(
      TERMINAL_SESSION_ID,
      {
        command,
        runAsync: devServer,
        suppressInputEcho: true,
      },
      devServer ? 30 : 120,
    );

    let output = normalizeOutput(result);
    let preview: Awaited<ReturnType<typeof getPreview>> | undefined;

    if (devServer) {
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const port = detectDevPort(command);

      try {
        preview = await getPreview(sandbox, port);
      } catch (previewError) {
        const previewDetail = previewError instanceof Error ? previewError.message : String(previewError);
        const logs = await sandbox.process.getEntrypointLogs().catch(() => undefined);
        output += '\n' + (logs?.output || logs?.stdout || '') + '\nPreview is not ready yet: ' + previewDetail;
      }
    }

    const exitCode = typeof result.exitCode === 'number' ? result.exitCode : 0;

    if (!devServer && exitCode !== 0) {
      return json({ ok: false, output, exitCode, error: 'Command exited with code ' + exitCode + '.' }, { status: 422, headers });
    }

    return json({ ok: true, output, exitCode, preview }, { headers });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error('[BeamCore] Daytona operation failed:', detail);

    const status = /not configured|missing from this/i.test(detail) ? 503 : 502;

    return json({
      ok: false,
      error: status === 503
        ? detail
        : 'Daytona could not complete the request: ' + detail,
    }, { status });
  }
}
