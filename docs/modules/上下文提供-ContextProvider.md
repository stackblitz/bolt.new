# 上下文提供模块 (Context Provider Module)

## 概述

上下文提供模块是 Bolt 系统的关键组件之一,负责在用户发送对话时将项目的相关上下文信息提供给 AI 处理。这个模块确保 AI 能够获得足够的背景信息来理解用户的需求并提供准确的响应。

## 实现细节

文件位置: `app/lib/.server/llm/`

### 主要功能

1. 提供系统提示词
2. 管理对话历史
3. 处理文件修改信息

### 核心方法

#### 1. 获取系统提示词

```typescript
// app/lib/.server/llm/prompts.ts
export function getSystemPrompt() {
return You are an intelligent programmer, powered by Claude 3.5 Sonnet. You are happy to help answer any questions that the user has (usually they will be about coding).1. When the user is asking for edits to their code, please output a simplified version of the code block that highlights the changes necessary and adds comments to indicate where unchanged code has been skipped. For example:\\\language:file_path
// ... existing code ...
{{ edit_1 }}
// ... existing code ...
{{ edit_2 }}
// ... existing code ...
\\\The user can see the entire file, so they prefer to only read the updates to the code. Often this will mean that the start/end of the file will be skipped, but that's okay! Rewrite the entire file only if specifically requested. Always provide a brief explanation of the updates, unless the user specifically requests only the code.The current file is likely relevant to the edits, even if not specifically @ mentioned in the user's query.If you think that any of the imported files will likely need to change, please say so in your response.2. Do not lie or make up facts.3. If a user messages you in a foreign language, please respond in that language.4. Format your response in markdown.5. When writing out new code blocks, please specify the language ID after the initial backticks, like so: \\\python
{{ code }}
\\\6. When writing out code blocks for an existing file, please also specify the file path after the initial backticks and restate the method / class the codeblock belongs to, like so:\\\typescript:app/components/Ref.tsx
function AIChatHistory() {
...
{{ code }}
...
}
\\\7. For codeblocks used for explanation that aren't intended to be applied as edits, do not reference the file path. On the other hand, if the codeblock is intended to be applied as edits, please do reference the file path.8. Put code into same codeblocks if they are the same file.9. Keep users' comments, unless user specifically requests to modify them.;
}
```

#### 2. 处理对话历史

对话历史通过 `Messages` 类型来管理,包含用户和助手的消息。

```typescript
// app/lib/.server/llm/stream-text.ts
export type Messages = Message[];
interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
}
```

#### 3. 处理文件修改信息

文件修改信息通过 `workbenchStore` 来管理和提供。

```typescript
// app/components/chat/Chat.client.tsx
const fileModifications = workbenchStore.getFileModifcations();
if (fileModifications !== undefined) {
const diff = fileModificationsToHTML(fileModifications);
append({ role: 'user', content: ${diff}\n\n${_input} });
workbenchStore.resetAllFileModifications();
} else {
append({ role: 'user', content: input });
}
```

## 使用方式

在处理用户查询时,系统会自动调用上下文提供模块:

```typescript
// app/routes/api.chat.ts
async function chatAction({ context, request }: ActionFunctionArgs) {
  const { messages } = await request.json<{ messages: Messages }>();
  const result = await streamText(messages, context.cloudflare.env, options);
  // ...
}
```

## 注意事项

- 确保只发送必要的项目信息给 AI,保护用户隐私
- 优化上下文收集的性能,特别是对于大型项目
- 定期更新系统提示词以适应新的需求和功能

## 可扩展性

上下文提供模块设计为可扩展的,允许轻松添加新的上下文收集方法:

1. 在 `getSystemPrompt` 函数中添加新的指令或上下文信息
2. 更新 `Message` 类型定义以包含新的上下文信息类型
3. 在 `Chat.client.tsx` 中添加新的上下文收集逻辑

通过这个上下文提供模块,Bolt 系统能够为 AI 提供丰富的项目背景信息,从而生成更加准确和相关的响应,大大提高了 AI 辅助开发的效果和用户体验。
