import { createCookieSessionStorage, redirect } from '@remix-run/cloudflare';
import { env } from 'node:process';

const USER_SESSION_KEY = 'userId';

function createSessionStorage(cloudflareEnv: Env) {
  return createCookieSessionStorage({
    cookie: {
      name: '__session',
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secrets: [env.SESSION_SECRET || cloudflareEnv.SESSION_SECRET],
      secure: false,
    },
  });
}

export async function getSession(request: Request, env: Env) {
  const sessionStorage = createSessionStorage(env);
  const cookie = request.headers.get('Cookie');

  return { session: await sessionStorage.getSession(cookie), sessionStorage };
}

export async function logout(request: Request, env: Env) {
  const { session, sessionStorage } = await getSession(request, env);

  return redirect('/login', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}

export async function isAuthenticated(request: Request, env: Env) {
  const { session } = await getSession(request, env);
  const userId = session.get(USER_SESSION_KEY);

  return !!userId;
}

export async function createUserSession(request: Request, env: Env): Promise<ResponseInit> {
  const { session, sessionStorage } = await getSession(request, env);

  session.set(USER_SESSION_KEY, 'anonymous_user');

  return {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 7, // 7 days,
      }),
    },
  };
}
