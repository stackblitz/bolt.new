import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { streamText } from '~/lib/.server/llm/stream-text';
import { stripIndents } from '~/utils/stripIndent';

const encoder = new TextEncoder();

// 模拟数据生成函数
function* mockDataGenerator(message: string) {
  const mockResponse = `您好！我希望开发一个功能完善的考勤管理系统。该系统应该包括以下功能：

1. 员工签到和签退功能
2. 请假和加班申请管理
3. 考勤数据统计和报表生成
4. 管理员后台管理界面
5. 移动端适配，方便员工随时查看和操作
6. 与公司现有人事系统的集成

请问您能帮我设计这个系统的基本架构和主要功能模块吗？我希望使用React作为前端框架，Node.js作为后端，MongoDB作为数据库。同时，我也想了解一下如何确保系统的安全性和数据隐私保护。谢谢！`;

  for (let i = 0; i < mockResponse.length; i += 2) {
    yield mockResponse.slice(i, i + 2);
  }
}

// 环境变量或配置来控制是否使用模拟数据
// const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';
const USE_MOCK_DATA = true;

export async function action({ context, request }: ActionFunctionArgs) {
  const { message } = await request.json<{ message: string }>();

  try {
    if (USE_MOCK_DATA) {
      // 使用模拟数据
      const stream = new ReadableStream({
        async start(controller) {
          for (const chunk of mockDataGenerator(message)) {
            controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
            await new Promise(resolve => setTimeout(resolve, 50)); // 模拟延迟
          }
          controller.enqueue(encoder.encode('e:{"finishReason":"unknown","usage":{"promptTokens":null,"completionTokens":null},"isContinued":false}\n'));
          controller.enqueue(encoder.encode('d:{"finishReason":"unknown","usage":{"promptTokens":null,"completionTokens":null}}\n'));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    } else {
      // 使用实际 AI 服务
      const result = await streamText(
        [
          {
            role: 'user',
            content: stripIndents`
            I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

            IMPORTANT: Only respond with the improved prompt and nothing else!

            Also, please ensure your response is entirely in Chinese.

            <original_prompt>
              ${message}
            </original_prompt>
          `,
          },
        ],
        context.cloudflare.env,
      );

      return result.toDataStreamResponse();
    }
  } catch (error) {
    console.log(error);

    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
