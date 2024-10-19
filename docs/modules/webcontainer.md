# WebContainer 模块

## 概述

WebContainer 模块是 Bolt 系统的核心,它提供了在浏览器中运行全栈应用的能力。

## 实现细节

文件位置: `app/lib/webcontainer/index.ts`

### 初始化

WebContainer 的初始化过程如下:

1. 使用 `WebContainer.boot()` 方法启动 WebContainer
2. 设置工作目录名称
3. 初始化完成后,更新 `webcontainerContext.loaded` 状态

### 热更新处理

该模块使用 Vite 的热更新 API 来保持 WebContainer 实例在开发过程中的持久性:

```typescript
if (import.meta.hot) {
  import.meta.hot.data.webcontainer = webcontainer;
}
```

### 导出

模块导出 `webcontainer` Promise,允许其他模块异步访问 WebContainer 实例。

## 使用方式

其他模块可以通过以下方式使用 WebContainer:

```typescript
import { webcontainer } from '~/lib/webcontainer';
// 使用 WebContainer
webcontainer.then(async (wc) => {
  // 执行文件操作、运行命令等
});
```

## 注意事项

- WebContainer 仅在客户端环境中初始化,服务器端渲染(SSR)时不会执行初始化逻辑
- 使用 WebContainer 时应注意异步操作的处理