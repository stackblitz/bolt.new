import { spawnSync } from 'node:child_process';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const standardEntry = path.join(root, 'app/entry.server.tsx');
const vercelEntry = path.join(root, 'app/entry.server.vercel.tsx');

const originalEntry = await readFile(standardEntry);
const vercelEntryContents = await readFile(vercelEntry);

try {
  // Remix and Vercel expect the platform-specific implementation at the
  // conventional app/entry.server.tsx path during the build.
  await writeFile(standardEntry, vercelEntryContents);

  const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const result = spawnSync(command, ['exec', 'remix', 'vite:build'], {
    cwd: root,
    env: { ...process.env, DEPLOY_TARGET: 'vercel', VITE_DEPLOY_TARGET: 'vercel' },
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `Vercel Remix build failed with exit code ${result.status ?? 'unknown'}${result.signal ? ` (signal ${result.signal})` : ''}.`,
    );
  }
} finally {
  // Restore the Cloudflare entry in the checkout, even when the Vercel build fails.
  await writeFile(standardEntry, originalEntry);
}
