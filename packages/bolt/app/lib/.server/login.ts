import { env } from 'node:process';

export function verifyPassword(password: string, cloudflareEnv: Env) {
  const loginPassword = env.LOGIN_PASSWORD || cloudflareEnv.LOGIN_PASSWORD;

  return password === loginPassword;
}
