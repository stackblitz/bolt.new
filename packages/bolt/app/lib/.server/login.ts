import { json, redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { isAuthenticated } from './sessions';

type RequestArgs = Pick<LoaderFunctionArgs, 'request' | 'context'>;

export async function handleAuthRequest<T extends RequestArgs>(args: T, body: object = {}) {
  const { request, context } = args;
  const { authenticated, response } = await isAuthenticated(request, context.cloudflare.env);

  if (authenticated || import.meta.env.VITE_DISABLE_AUTH) {
    return json(body, response);
  }

  return redirect('/login', response);
}

export async function handleWithAuth<T extends RequestArgs>(args: T, handler: (args: T) => Promise<Response>) {
  const { request, context } = args;
  const { authenticated, response } = await isAuthenticated(request, context.cloudflare.env);

  if (authenticated || import.meta.env.VITE_DISABLE_AUTH) {
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
