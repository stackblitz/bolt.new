import { createCookieSessionStorage, redirect, type Session as RemixSession } from '@remix-run/cloudflare';
import { decodeJwt } from 'jose';
import { CLIENT_ID, CLIENT_ORIGIN } from '~/lib/constants';
import { request as doRequest } from '~/lib/fetch';
import { logger } from '~/utils/logger';
import type { Identity } from '~/lib/analytics';
import { decrypt, encrypt } from '~/lib/crypto';

const DEV_SESSION_SECRET = import.meta.env.DEV ? 'LZQMrERo3Ewn/AbpSYJ9aw==' : undefined;
const DEV_PAYLOAD_SECRET = import.meta.env.DEV ? '2zAyrhjcdFeXk0YEDzilMXbdrGAiR+8ACIUgFNfjLaI=' : undefined;

const TOKEN_KEY = 't';
const EXPIRES_KEY = 'e';
const USER_ID_KEY = 'u';
const SEGMENT_KEY = 's';
const AVATAR_KEY = 'a';
const ENCRYPTED_KEY = 'd';

interface PrivateSession {
  [TOKEN_KEY]: string;
  [EXPIRES_KEY]: number;
  [USER_ID_KEY]?: string;
  [SEGMENT_KEY]?: string;
}

interface PublicSession {
  [ENCRYPTED_KEY]: string;
  [AVATAR_KEY]?: string;
}

export interface Session {
  userId?: string;
  segmentWriteKey?: string;
  avatar?: string;
}

export async function isAuthenticated(request: Request, env: Env) {
  const { session, sessionStorage } = await getSession(request, env);

  const sessionData: PrivateSession | null = await decryptSessionData(env, session.get(ENCRYPTED_KEY));

  const header = async (cookie: Promise<string>) => ({ headers: { 'Set-Cookie': await cookie } });
  const destroy = () => header(sessionStorage.destroySession(session));

  if (sessionData?.[TOKEN_KEY] == null) {
    return { session: null, response: await destroy() };
  }

  const expiresAt = sessionData[EXPIRES_KEY] ?? 0;

  if (Date.now() < expiresAt) {
    return { session: getSessionData(session, sessionData) };
  }

  logger.debug('Renewing token');

  let data: Awaited<ReturnType<typeof refreshToken>> | null = null;

  try {
    data = await refreshToken(sessionData[TOKEN_KEY]);
  } catch (error) {
    // we can ignore the error here because it's handled below
    logger.error(error);
  }

  if (data != null) {
    const expiresAt = cookieExpiration(data.expires_in, data.created_at);

    const newSessionData = { ...sessionData, [EXPIRES_KEY]: expiresAt };
    const encryptedData = await encryptSessionData(env, newSessionData);

    session.set(ENCRYPTED_KEY, encryptedData);

    return {
      session: getSessionData(session, newSessionData),
      response: await header(sessionStorage.commitSession(session)),
    };
  } else {
    return { session: null, response: await destroy() };
  }
}

export async function createUserSession(
  request: Request,
  env: Env,
  tokens: { refresh: string; expires_in: number; created_at: number },
  identity?: Identity,
): Promise<ResponseInit> {
  const { session, sessionStorage } = await getSession(request, env);

  const expiresAt = cookieExpiration(tokens.expires_in, tokens.created_at);

  const sessionData: PrivateSession = {
    [TOKEN_KEY]: tokens.refresh,
    [EXPIRES_KEY]: expiresAt,
    [USER_ID_KEY]: identity?.userId ?? undefined,
    [SEGMENT_KEY]: identity?.segmentWriteKey ?? undefined,
  };

  const encryptedData = await encryptSessionData(env, sessionData);
  session.set(ENCRYPTED_KEY, encryptedData);
  session.set(AVATAR_KEY, identity?.avatar);

  return {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: 3600 * 24 * 30, // 1 month
      }),
    },
  };
}

function getSessionStorage(cloudflareEnv: Env) {
  return createCookieSessionStorage<PublicSession>({
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

  const sessionData = await decryptSessionData(env, session.get(ENCRYPTED_KEY));

  if (sessionData) {
    revokeToken(sessionData[TOKEN_KEY]);
  }

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

function getSessionData(session: RemixSession<PublicSession>, data: PrivateSession): Session {
  return {
    userId: data?.[USER_ID_KEY],
    segmentWriteKey: data?.[SEGMENT_KEY],
    avatar: session.get(AVATAR_KEY),
  };
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
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(`Unable to refresh token\n${response.status} ${JSON.stringify(body)}`);
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
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
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

async function decryptSessionData(env: Env, encryptedData?: string) {
  const decryptedData = encryptedData ? await decrypt(payloadSecret(env), encryptedData) : undefined;
  const sessionData: PrivateSession | null = JSON.parse(decryptedData ?? 'null');

  return sessionData;
}

async function encryptSessionData(env: Env, sessionData: PrivateSession) {
  return await encrypt(payloadSecret(env), JSON.stringify(sessionData));
}

function payloadSecret(env: Env) {
  return DEV_PAYLOAD_SECRET || env.PAYLOAD_SECRET;
}
