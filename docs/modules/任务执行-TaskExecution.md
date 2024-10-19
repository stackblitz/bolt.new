# 任务执行模块 (Task Execution Module)

## 概述

任务执行模块是 Bolt 系统的核心功能之一,负责解析和执行 AI 响应中的任务指令。这个模块增强了用户与 AI 助手之间的交互,使开发过程更加直观和高效。

## 实现细节

文件位置: `app/lib/runtime/action-runner.ts`

### 主要类: ActionRunner

`ActionRunner` 类是任务执行模块的核心,它负责管理和执行 AI 响应中的任务。

#### 主要属性

- `#webcontainer`: WebContainer 实例的 Promise
- `#currentExecutionPromise`: 当前执行任务的 Promise
- `actions`: 存储所有任务的 Map

#### 主要方法

1. `addAction(data: ActionCallbackData)`: 添加新的任务
2. `runAction(data: ActionCallbackData)`: 运行指定的任务
3. `#executeAction(actionId: string)`: 执行单个任务
4. `#runShellAction(action: ActionState)`: 执行 shell 类型的任务
5. `#runFileAction(action: ActionState)`: 执行文件操作类型的任务

### 任务类型

任务执行模块支持两种主要类型的任务:

- Shell 操作: 执行 shell 命令
- 文件操作: 创建、修改文件

## 使用方式

在处理 AI 响应时,系统会自动使用 `ActionRunner` 来执行相关任务。开发者可以通过以下方式与此功能交互:

```typescript
import { ActionRunner } from '~/lib/runtime/action-runner';
import { webcontainer } from '~/lib/webcontainer';

const actionRunner = new ActionRunner(webcontainer);

// 添加任务
actionRunner.addAction({
  actionId: 'action1',
  action: {
    type: 'shell',
    content: 'npm install lodash'
  }
});

// 运行任务
actionRunner.runAction({
  actionId: 'action1',
  action: {
    type: 'shell',
    content: 'npm install lodash'
  }
});
```

## 任务执行与终端交互

任务执行模块与终端组件之间有密切的交互,特别是在执行 shell 类型的任务时。这种交互主要通过以下方式实现:

1. 输出流重定向: 当执行 shell 命令时,命令的输出会被重定向到终端组件,使用户能够实时看到命令执行的结果。

2. 进程管理: `ActionRunner` 负责创建和管理 shell 进程,而终端组件则负责显示这些进程的输出。

3. 状态同步: 任务的执行状态(如开始、进行中、完成、失败)会实时同步到终端组件,以便用户了解当前任务的执行情况。

4. 交互式输入: 对于需要用户输入的 shell 命令,终端组件可以捕获用户输入并传递给正在执行的进程。

### 示例代码

以下是 `ActionRunner` 中与终端交互的部分代码示例:

```typescript
async #runShellAction(action: ActionState) {
  if (action.type !== 'shell') {
    unreachable('Expected shell action');
  }

  const webcontainer = await this.#webcontainer;

  const process = await webcontainer.spawn('jsh', ['-c', action.content], {
    env: { npm_config_yes: true },
  });

  action.abortSignal.addEventListener('abort', () => {
    process.kill();
  });

  // 将进程输出重定向到终端
  process.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log(data); // 这里可以替换为向终端组件发送数据的逻辑
      },
    }),
  );

  const exitCode = await process.exit;

  // 更新任务状态,终端组件可以订阅这个状态变化
  this.#updateAction(action.id, { status: exitCode === 0 ? 'complete' : 'failed' });
}
```

在这个例子中,shell 命令的输出被重定向到一个 `WritableStream`,这个流可以连接到终端组件,实现实时显示命令输出。同时,任务的状态更新也可以被终端组件订阅,以显示任务的执行进度和结果。

## 安全考虑

为确保系统安全,任务执行模块实施了以下安全措施:

1. 使用 WebContainer 提供的安全沙箱环境执行任务
2. 限制可执行的任务类型
3. 提供任务中断机制

## 错误处理

任务执行过程中可能遇到的错误会被捕获并记录,同时更新任务状态为 "failed"。这些错误信息也会通过终端组件显示给用户。

## 性能优化

为了保证在处理多个任务时的性能,任务执行模块采用了以下优化策略:

1. 任务队列: 使用 Promise 链式执行任务,避免并发执行导致的问题
2. 状态管理: 使用 nanostores 进行高效的状态管理和更新

## 扩展性

任务执行模块设计为可扩展的,允许轻松添加新的任务类型。要添加新的任务类型,需要:

1. 在 `ActionState` 类型中定义新的任务结构
2. 在 `ActionRunner` 类中实现相应的执行逻辑
3. 更新 AI 模型,使其能够生成新任务类型的指令
4. 如果需要,为新任务类型添加相应的终端交互逻辑

## 注意事项

- 确保 AI 响应的格式符合预定义的任务指令结构
- 定期审查和更新可执行的任务类型,以适应新的需求和潜在的安全风险
- 监控任务执行的性能,及时优化高耗时或高资源消耗的操作
- 在设计新的任务类型时,考虑如何在终端中展示其执行过程和结果
