# AI 集成模块 (AI Integration Module)

## 概述

AI 集成模块是 Bolt 系统与 AI 模型(如 Claude)交互的核心。它负责 AI 模型的配置、提示词处理和流式响应处理等功能。

## 实现细节

文件位置: `app/lib/.server/llm/`

### 主要组件

#### 1. API 密钥管理 (api-key.ts)

负责安全地管理和验证 AI 服务的 API 密钥。

#### 2. 基础 URL 配置 (base-url.ts)

配置 AI 服务的基础 URL,支持不同环境(如开发、生产)的 URL 切换。

#### 3. 常量定义 (constants.ts)

定义了与 AI 集成相关的常量,如模型名称、超时时间等。

#### 4. 模型配置 (model.ts)

配置不同 AI 模型的参数,如温度、最大 token 数等。

#### 5. 提示词模板 (prompts.ts)

定义和管理用于与 AI 模型交互的提示词模板。

#### 6. 文本流处理 (stream-text.ts)

处理 AI 模型的流式文本响应,支持实时显示生成的内容。

#### 7. 可切换流实现 (switchable-stream.ts)

允许在不同的流处理方式之间切换,提高系统的灵活性。

## 使用方式

以下是一个使用 AI 集成模块的��例:

```typescript
import { createChatCompletion } from '~/lib/.server/llm/model';
import { SYSTEM_PROMPT } from '~/lib/.server/llm/prompts';

async function getAIResponse(userInput: string) {
  const response = await createChatCompletion({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userInput }
    ],
    stream: true
  });

  // 处理流式响应
  for await (const chunk of response) {
    console.log(chunk.choices[0]?.delta?.content || '');
  }
}
```

## 注意事项

- API 密钥应妥善保管,避免泄露
- 考虑实现请求速率限制,避免超出 AI 服务的使用配额
- 流式响应处理应考虑网络异常情况的处理
- 提示词模板应根据不同场景进行优化,以获得最佳的 AI 响应
