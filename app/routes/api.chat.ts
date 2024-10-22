import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { MAX_RESPONSE_SEGMENTS, MAX_TOKENS } from '~/lib/.server/llm/constants';
import { CONTINUE_PROMPT } from '~/lib/.server/llm/prompts';
import { streamText, type Messages, type StreamingOptions } from '~/lib/.server/llm/stream-text';
import SwitchableStream from '~/lib/.server/llm/switchable-stream';
import { db } from '~/utils/db.server';
import { requireAuth } from '~/middleware/auth.server';

export async function action(args: ActionFunctionArgs) {
  return chatAction(args);
}

async function chatAction({ context, request }: ActionFunctionArgs) {
  let userId;
  try {
    userId = await requireAuth(request);
  } catch (error) {
    return error as Response;
  }

  const { messages, sessionId } = await request.json<{ messages: Messages; sessionId: string }>();

  const stream = new SwitchableStream();

  try {
    const options: StreamingOptions = {
      toolChoice: 'none',
      onFinish: async ({ text: content, finishReason }) => {
        if (finishReason !== 'length') {
          const tokensConsumed = calculateTokensConsumed(messages, content);
          await Promise.all([
            recordTokenConsumption(userId, tokensConsumed),
            recordChatHistory(userId, content, 'assistant', sessionId, tokensConsumed)
          ]);
          return stream.close();
        }

        if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
          throw Error('Cannot continue message: Maximum segments reached');
        }

        const switchesLeft = MAX_RESPONSE_SEGMENTS - stream.switches;

        console.log(`Reached max token limit (${MAX_TOKENS}): Continuing message (${switchesLeft} switches left)`);

        messages.push({ role: 'assistant', content });
        messages.push({ role: 'user', content: CONTINUE_PROMPT });

        const result = await streamText(messages, context.cloudflare.env, options);

        return stream.switchSource(result.toAIStream());
      },
    };

    // 记录用户的消息
    await recordChatHistory(userId, messages[messages.length - 1].content, 'user', sessionId, 0);

    const result = await streamText(messages, context.cloudflare.env, options);

    stream.switchSource(result.toAIStream());

    return new Response(stream.readable, {
      status: 200,
      headers: {
        contentType: 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.log(error);

    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}

async function recordChatHistory(userId: string, message: string, role: 'user' | 'assistant', sessionId: string, tokensUsed: number) {
  try {
    await db('chat_histories').insert({
      user_id: userId,
      message,
      role,
      session_id: sessionId,
      tokens_used: tokensUsed,
    });
  } catch (error) {
    console.error('Error recording chat history:', error);
    // 这里我们只记录错误,不中断流程
  }
}

async function recordTokenConsumption(userId: string, tokensConsumed: number) {
  try {
    await db.transaction(async (trx) => {
      // 记录代币消耗历史
      await trx('token_consumption_history').insert({
        user_id: userId,
        tokens_consumed: tokensConsumed,
        timestamp: new Date(),
      });

      // 更新用户的代币余额
      const updatedUser = await trx('users')
        .where('_id', userId)
        .decrement('token_balance', tokensConsumed)
        .returning('token_balance');

      if (updatedUser[0].token_balance < 0) {
        throw new Error('Insufficient token balance');
      }
    });
  } catch (error: unknown) {
    console.error('Error recording token consumption:', error);
    if (error instanceof Error && error.message === 'Insufficient token balance') {
      throw new Response(null, { status: 402, statusText: 'Payment Required' });
    }
    throw error;
  }
}

function calculateTokensConsumed(messages: Messages, response: string): number {
  // 这里的计算方法需要根据您的具体需求来实现
  // 这只是一个简单的示例
  const totalLength = messages.reduce((sum, message) => sum + message.content.length, 0) + response.length;
  return Math.ceil(totalLength / 4); // 假设每4个字符消耗1个token
}
