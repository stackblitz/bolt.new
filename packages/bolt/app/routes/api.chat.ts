import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { convertToCoreMessages, streamText } from 'ai';
import { getAPIKey } from '~/lib/.server/llm/api-key';
import { getAnthropicModel } from '~/lib/.server/llm/model';
import { systemPrompt } from '~/lib/.server/llm/prompts';

interface ToolResult<Name extends string, Args, Result> {
  toolCallId: string;
  toolName: Name;
  args: Args;
  result: Result;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
}

export async function action({ context, request }: ActionFunctionArgs) {
  const { messages } = await request.json<{ messages: Message[] }>();

  try {
    const result = await streamText({
      model: getAnthropicModel(getAPIKey(context.cloudflare.env)),
      messages: convertToCoreMessages(messages),
      toolChoice: 'none',
      onFinish: ({ finishReason, usage, warnings }) => {
        console.log({ finishReason, usage, warnings });
      },
      system: systemPrompt,
    });

    return result.toAIStreamResponse();
  } catch (error) {
    console.log(error);

    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
