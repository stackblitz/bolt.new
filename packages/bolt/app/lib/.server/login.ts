import { env } from 'node:process';
import { isAuthenticated } from './sessions';
import { json, redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';

export function verifyPassword(password: string, cloudflareEnv: Env) {
  const loginPassword = env.LOGIN_PASSWORD || cloudflareEnv.LOGIN_PASSWORD;

  return password === loginPassword;
}

type RequestArgs = Pick<LoaderFunctionArgs, 'request' | 'context'>;

export async function handleAuthRequest<T extends RequestArgs>(args: T, body: object = {}) {
  const { request, context } = args;
  const { authenticated, response } = await isAuthenticated(request, context.cloudflare.env);

  if (authenticated) {
    return json(body, response);
  }

  return redirect('/login', response);
}

export async function handleWithAuth<T extends RequestArgs>(args: T, handler: (args: T) => Promise<Response>) {
  const { request, context } = args;
  const { authenticated, response } = await isAuthenticated(request, context.cloudflare.env);

  if (authenticated) {
    const handlerResponse = await handler(args);

    if (response) {
      for (const [key, value] of Object.entries(response.headers)) {
        handlerResponse.headers.append(key, value);
      }
    }

    return handlerResponse;
  }

  return json({}, { status: 401 });
}
