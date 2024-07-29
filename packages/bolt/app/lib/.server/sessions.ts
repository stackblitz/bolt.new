import { createCookieSessionStorage, redirect } from '@remix-run/cloudflare';
import { decodeJwt } from 'jose';
import { request as doRequest } from '~/lib/fetch';
import { CLIENT_ID, CLIENT_ORIGIN } from '~/lib/constants';
import { logger } from '~/utils/logger';

const DEV_SESSION_SECRET = import.meta.env.DEV ? 'LZQMrERo3Ewn/AbpSYJ9aw==' : undefined;

interface SessionData {
  refresh: string;
  expiresAt: number;
}

export async function isAuthenticated(request: Request, env: Env) {
  const { session, sessionStorage } = await getSession(request, env);
  const token = session.get('refresh');

  const header = async (cookie: Promise<string>) => ({ headers: { 'Set-Cookie': await cookie } });
  const destroy = () => header(sessionStorage.destroySession(session));

  if (token == null) {
    return { authenticated: false as const, response: await destroy() };
  }

  const expiresAt = session.get('expiresAt') ?? 0;

  if (Date.now() < expiresAt) {
    return { authenticated: true as const };
  }

  let data: Awaited<ReturnType<typeof refreshToken>> | null = null;

  try {
    data = await refreshToken(token);
  } catch {
    // ignore
  }

  if (data != null) {
    const expiresAt = cookieExpiration(data.expires_in, data.created_at);
    session.set('expiresAt', expiresAt);

    return { authenticated: true as const, response: await header(sessionStorage.commitSession(session)) };
  } else {
    return { authenticated: false as const, response: await destroy() };
  }
}

export async function createUserSession(
  request: Request,
  env: Env,
  tokens: { refresh: string; expires_in: number; created_at: number },
): Promise<ResponseInit> {
  const { session, sessionStorage } = await getSession(request, env);

  const expiresAt = cookieExpiration(tokens.expires_in, tokens.created_at);

  session.set('refresh', tokens.refresh);
  session.set('expiresAt', expiresAt);

  return {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: 3600 * 24 * 30, // 1 month
      }),
    },
  };
}

function getSessionStorage(cloudflareEnv: Env) {
  return createCookieSessionStorage<SessionData>({
    cookie: {
      name: '__session',
      httpOnly: true,
      path: '/',
      secrets: [DEV_SESSION_SECRET || cloudflareEnv.SESSION_SECRET],
      secure: import.meta.env.PROD,
    },
  });
}

export async function logout(request: Request, env: Env) {
  const { session, sessionStorage } = await getSession(request, env);

  revokeToken(session.get('refresh'));

  return redirect('/login', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}

export function validateAccessToken(access: string) {
  const jwtPayload = decodeJwt(access);

  return jwtPayload.bolt === true;
}

async function getSession(request: Request, env: Env) {
  const sessionStorage = getSessionStorage(env);
  const cookie = request.headers.get('Cookie');

  return { session: await sessionStorage.getSession(cookie), sessionStorage };
}

async function refreshToken(refresh: string): Promise<{ expires_in: number; created_at: number }> {
  const response = await doRequest(`${CLIENT_ORIGIN}/oauth/token`, {
    method: 'POST',
    body: urlParams({ grant_type: 'refresh_token', client_id: CLIENT_ID, refresh_token: refresh }),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(`Unable to refresh token\n${JSON.stringify(body)}`);
  }

  const { access_token: access } = body;

  if (!validateAccessToken(access)) {
    throw new Error('User is no longer authorized for Bolt');
  }

  return body;
}

function cookieExpiration(expireIn: number, createdAt: number) {
  return (expireIn + createdAt - 10 * 60) * 1000;
}

async function revokeToken(refresh?: string) {
  if (refresh == null) {
    return;
  }

  try {
    const response = await doRequest(`${CLIENT_ORIGIN}/oauth/revoke`, {
      method: 'POST',
      body: urlParams({
        token: refresh,
        token_type_hint: 'refresh_token',
        client_id: CLIENT_ID,
      }),
    });

    if (!response.ok) {
      throw new Error(`Unable to revoke token: ${response.status}`);
    }
  } catch (error) {
    logger.debug(error);
    return;
  }
}

function urlParams(data: Record<string, string>) {
  const encoded = new URLSearchParams();

  for (const [key, value] of Object.entries(data)) {
    encoded.append(key, value);
  }

  return encoded;
}
