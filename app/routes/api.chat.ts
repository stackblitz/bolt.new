import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { MAX_RESPONSE_SEGMENTS, MAX_TOKENS } from '~/lib/.server/llm/constants';
import { CONTINUE_PROMPT } from '~/lib/.server/llm/prompts';
import { streamText, type Messages, type StreamingOptions } from '~/lib/.server/llm/stream-text';
import SwitchableStream from '~/lib/.server/llm/switchable-stream';
import type { Provider } from '~/lib/stores/provider';
import { createClient } from '~/utils/supabase.server';

export async function action(args: ActionFunctionArgs) {
  return chatAction(args);
}
//TODO: change to getSession for all getUser!!!
async function chatAction({ context, request }: ActionFunctionArgs) {
  const { supabase, getUser } = createClient(request);
  const user = await getUser();

  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }
  
  const { messages, provider } = await request.json<{ messages: Messages; provider: Provider }>();

  const stream = new SwitchableStream();

  try {
    const options: StreamingOptions = {
      toolChoice: 'none',
      onFinish: async ({ text: content, finishReason }) => {
        if (finishReason !== 'length') {
          return stream.close();
        }

        if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
          throw new Error('Cannot continue message: Maximum segments reached');
        }

        const switchesLeft = MAX_RESPONSE_SEGMENTS - stream.switches;

        console.log(`Reached max token limit (${MAX_TOKENS}): Continuing message (${switchesLeft} switches left)`);

        messages.push({ role: 'assistant', content });
        messages.push({ role: 'user', content: CONTINUE_PROMPT });

        const result = await streamText(messages, context.cloudflare.env, provider, options);

        return stream.switchSource(result.toAIStream());
      },
    };

    const result = await streamText(messages, context.cloudflare.env, provider, options);

    stream.switchSource(result.toAIStream());

    return new Response(stream.readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Chat action error:', error);
    stream.close(); // Ensure the stream is closed on error
    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
