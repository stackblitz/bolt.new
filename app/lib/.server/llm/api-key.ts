// @ts-nocheck
// Preventing TS checks with files presented in the video for a better presentation.
import { env } from 'node:process';

export function getAPIKey(cloudflareEnv: Env, provider: string) {
  /**
   * The `cloudflareEnv` is only used when deployed or when previewing locally.
   * In development the environment variables are available through `env`.
   */
  switch (provider) {
    case 'Anthropic':
      return env.ANTHROPIC_API_KEY || cloudflareEnv.ANTHROPIC_API_KEY;
    case 'OpenAI':
      return env.OPENAI_API_KEY || cloudflareEnv.OPENAI_API_KEY;
    case 'Groq':
      return env.GROQ_API_KEY || cloudflareEnv.GROQ_API_KEY;
    case 'OpenRouter':
      return env.OPEN_ROUTER_API_KEY || cloudflareEnv.OPEN_ROUTER_API_KEY;
    // Bedrock用のAWSクレデンシャルは別途取得
    default:
      return "";
  }
}

export function getAWSCredentials(cloudflareEnv: Env) {
  return {
    accessKeyId: env.AWS_ACCESS_KEY_ID || cloudflareEnv.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || cloudflareEnv.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION || cloudflareEnv.AWS_REGION || 'us-east-1', // デフォルトリージョン
  };
}
