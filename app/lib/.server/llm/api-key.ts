import { env } from 'node:process';

export function getAPIKey(cloudflareEnv: Env) {
  return env.ANTHROPIC_API_KEY || cloudflareEnv.ANTHROPIC_API_KEY;
}

export function getOpenAIAPIKey(cloudflareEnv: Env) {
  return env.OPENAI_API_KEY || cloudflareEnv.OPENAI_API_KEY;
}

export function getAWSCredentials(cloudflareEnv: Env) {
  return {
    accessKeyId: env.AWS_ACCESS_KEY_ID || cloudflareEnv.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || cloudflareEnv.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION || cloudflareEnv.AWS_REGION || 'ap-northeast-1'
  };
}
