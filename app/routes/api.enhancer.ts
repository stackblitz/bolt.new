import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { StreamingTextResponse, parseStreamPart } from 'ai';
import { streamText } from '~/lib/.server/llm/stream-text';
import { stripIndents } from '~/utils/stripIndent';
import type { ProviderInfo } from '~/types/model';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function action(args: ActionFunctionArgs) {
  return enhancerAction(args);
}

async function enhancerAction({ context, request }: ActionFunctionArgs) {
  const { message, model, provider, apiKeys } = await request.json<{
    message: string;
    model: string;
    provider: ProviderInfo;
    apiKeys?: Record<string, string>;
  }>();

  const { name: providerName } = provider;

  // validate 'model' and 'provider' fields
  if (!model || typeof model !== 'string') {
    throw new Response('Invalid or missing model', {
      status: 400,
      statusText: 'Bad Request',
    });
  }

  if (!providerName || typeof providerName !== 'string') {
    throw new Response('Invalid or missing provider', {
      status: 400,
      statusText: 'Bad Request',
    });
  }

  try {
    const result = await streamText(
      [
        {
          role: 'user',
          content:
            `[Model: ${model}]\n\n[Provider: ${providerName}]\n\n` +
            stripIndents`
            You are a professional prompt engineer specializing in crafting precise, effective prompts.
          Your task is to enhance prompts by making them more specific, actionable, and effective.

          I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

          For valid prompts:
          - Make instructions explicit and unambiguous
          - Add relevant context and constraints
          - Remove redundant information
          - Maintain the core intent
          - Ensure the prompt is self-contained
          - Use professional language

          For invalid or unclear prompts:
          - Respond with a clear, professional guidance message
          - Keep responses concise and actionable
          - Maintain a helpful, constructive tone
          - Focus on what the user should provide
          - Use a standard template for consistency

          IMPORTANT: Your response must ONLY contain the enhanced prompt text.
          Do not include any explanations, metadata, or wrapper tags.

          <original_prompt>
            ${message}
          </original_prompt>
        `,
        },
      ],
      context.cloudflare.env,
      undefined,
      apiKeys,
    );

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          try {
            const parsed = parseStreamPart(line);

            if (parsed.type === 'text') {
              controller.enqueue(encoder.encode(parsed.value));
            }
          } catch (e) {
            // skip invalid JSON lines
            console.warn('Failed to parse stream part:', line, e);
          }
        }
      },
    });

    const transformedStream = result.toDataStream().pipeThrough(transformStream);

    return new StreamingTextResponse(transformedStream);
  } catch (error: unknown) {
    console.log(error);

    if (error instanceof Error && error.message?.includes('API key')) {
      throw new Response('Invalid or missing API key', {
        status: 401,
        statusText: 'Unauthorized',
      });
    }

    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
