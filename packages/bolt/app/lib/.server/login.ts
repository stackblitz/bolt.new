import { env } from 'node:process';
import { isAuthenticated } from './sessions';
import { json, redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';

export function verifyPassword(password: string, cloudflareEnv: Env) {
  const loginPassword = env.LOGIN_PASSWORD || cloudflareEnv.LOGIN_PASSWORD;

  return password === loginPassword;
}

export async function handleAuthRequest({ request, context }: LoaderFunctionArgs, body: object = {}) {
  const authenticated = await isAuthenticated(request, context.cloudflare.env);

  if (import.meta.env.DEV || authenticated) {
    return json(body);
  }

  return redirect('/login');
}
