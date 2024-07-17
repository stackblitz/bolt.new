import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { streamText, type Messages } from '../lib/.server/llm/stream-text';

export async function action({ context, request }: ActionFunctionArgs) {
  const { messages } = await request.json<{ messages: Messages }>();

  try {
    const result = await streamText(messages, context.cloudflare.env, { toolChoice: 'none' });
    return result.toAIStreamResponse();
  } catch (error) {
    console.log(error);

    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
