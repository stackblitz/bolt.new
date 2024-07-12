import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { StreamingTextResponse, convertToCoreMessages, parseStreamPart, streamText } from 'ai';
import { getAPIKey } from '~/lib/.server/llm/api-key';
import { getAnthropicModel } from '~/lib/.server/llm/model';
import { systemPrompt } from '~/lib/.server/llm/prompts';
import { stripIndents } from '~/utils/stripIndent';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function action({ context, request }: ActionFunctionArgs) {
  const { message } = await request.json<{ message: string }>();

  try {
    const result = await streamText({
      model: getAnthropicModel(getAPIKey(context.cloudflare.env)),
      system: systemPrompt,
      messages: convertToCoreMessages([
        {
          role: 'user',
          content: stripIndents`
            I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

            IMPORTANT: Only respond with the improved prompt and nothing else!

            <original_prompt>
              ${message}
            </original_prompt>
          `,
        },
      ]),
    });

    if (import.meta.env.DEV) {
      result.usage.then((usage) => {
        console.log('Usage', usage);
      });
    }

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const processedChunk = decoder
          .decode(chunk)
          .split('\n')
          .filter((line) => line !== '')
          .map(parseStreamPart)
          .map((part) => part.value)
          .join('');

        controller.enqueue(encoder.encode(processedChunk));
      },
    });

    const transformedStream = result.toAIStream().pipeThrough(transformStream);

    return new StreamingTextResponse(transformedStream);
  } catch (error) {
    console.log(error);

    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
