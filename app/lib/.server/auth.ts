import { json, redirect, type LoaderFunctionArgs, type TypedResponse } from '@remix-run/cloudflare';
import { isAuthenticated, type Session } from './sessions';

type RequestArgs = Pick<LoaderFunctionArgs, 'request' | 'context'>;

export async function loadWithAuth<T extends RequestArgs>(
  args: T,
  handler: (args: T, session: Session) => Promise<Response>,
) {
  return handleWithAuth(args, handler, (response) => redirect('/login', response));
}

export async function actionWithAuth<T extends RequestArgs>(
  args: T,
  handler: (args: T, session: Session) => Promise<TypedResponse>,
) {
  return await handleWithAuth(args, handler, (response) => json({}, { status: 401, ...response }));
}

async function handleWithAuth<T extends RequestArgs, R extends TypedResponse>(
  args: T,
  handler: (args: T, session: Session) => Promise<R>,
  fallback: (partial: ResponseInit) => R,
) {
  const { request, context } = args;
  const { session, response } = await isAuthenticated(request, context.cloudflare.env);

  if (session == null && !import.meta.env.VITE_DISABLE_AUTH) {
    return fallback(response);
  }

  const handlerResponse = await handler(args, session || {});

  if (response) {
    for (const [key, value] of Object.entries(response.headers)) {
      handlerResponse.headers.append(key, value);
    }
  }

  return handlerResponse;
}
