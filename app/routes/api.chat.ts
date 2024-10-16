import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { MAX_RESPONSE_SEGMENTS, MAX_TOKENS } from '~/lib/.server/llm/constants';
import { CONTINUE_PROMPT } from '~/lib/.server/llm/prompts';
import { streamText, streamTextOpenAI, streamTextBedrock, type Messages, type StreamingOptions } from '~/lib/.server/llm/stream-text';
import SwitchableStream from '~/lib/.server/llm/switchable-stream';

export async function action(args: ActionFunctionArgs) {
  return chatAction(args);
}

async function chatAction({ context, request }: ActionFunctionArgs) {
  let { messages, selectedModel } = await request.json<{ messages: Messages; selectedModel: string }>();

  const stream = new SwitchableStream();

  try {
    const options: StreamingOptions = {
      onFinish: async ({ text: content, finishReason }) => {
        if (finishReason !== 'length') {
          return stream.close();
        }

        if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
          throw Error('Cannot continue message: Maximum segments reached');
        }

        const switchesLeft = MAX_RESPONSE_SEGMENTS - stream.switches;

        console.log(`Reached max token limit (${MAX_TOKENS}): Continuing message (${switchesLeft} switches left)`);

        messages.push({ role: 'assistant', content });
        messages.push({ role: 'user', content: CONTINUE_PROMPT });

        let result;
        if (selectedModel === 'bedrock') {
          result = await streamTextBedrock(messages, context.cloudflare.env, 'anthropic.claude-3-5-sonnet-20240620-v1:0', options);
        } else if (selectedModel === 'openai') {
          result = await streamTextOpenAI(messages, context.cloudflare.env, 'gpt-3.5-turbo', options);
        } else {
          result = await streamText(messages, context.cloudflare.env, options);
        }

        return stream.switchSource(result.toAIStream());
      },
    };

    let result;
    if (selectedModel === 'bedrock') {
      result = await streamTextBedrock(messages, context.cloudflare.env, 'anthropic.claude-3-5-sonnet-20240620-v1:0', options);
    } else if (selectedModel === 'openai') {
      result = await streamTextOpenAI(messages, context.cloudflare.env, 'gpt-3.5-turbo', options);
    } else {
      result = await streamText(messages, context.cloudflare.env, options);
    }

    stream.switchSource(result.toAIStream());

    return new Response(stream.readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Unhandled error:', error);

    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
