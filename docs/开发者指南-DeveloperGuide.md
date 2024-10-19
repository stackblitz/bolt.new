# Bolt 开发者指南 (Bolt Developer Guide)

## 1. 项目概述

Bolt 是一个基于浏览器的 AI 辅助开发工具,允许用户通过对话式交互来创建、编辑和部署全栈 Web 应用。本指南旨在帮助新开发者快速理解项目结构并开始贡献代码。

## 2. 技术栈

- 前端框架: React
- 路由管理: Remix
- 状态管理: nanostores
- 样式: SCSS 和 UnoCSS
- 编辑器: CodeMirror
- 构建工具: Vite
- 部署平台: Cloudflare Pages

## 3. 项目结构

```
bolt.new/
├── app/
│ ├── components/     # React 组件
│ ├── lib/            # 核心库和功能模块
│ ├── routes/         # Remix 路由
│ ├── styles/         # 全局样式
│ └── utils/          # 工具函数
├── public/           # 静态资源
├── docs/             # 项目文档
└── ...               # 配置文件等
```

## 4. 核心模块

- [WebContainer](./modules/webcontainer.md): 浏览器中的全栈运行环境
- [文件系统](./modules/文件系统-FileSystem.md): 管理项目文件
- [编辑器](./modules/编辑器-Editor.md): 代码编辑功能
- [AI 集成](./modules/AI集成-AIIntegration.md): 与 AI 模型交互
- [工作台](./modules/工作台-Workbench.md): 集成开发环境
- [聊天界面](./modules/聊天界面-ChatInterface.md): 用户与 AI 交互的主要入口
- [状态管理](./modules/状态管理-StateManagement.md): 全局状态管理
- [路由和页面](./modules/路由和页面-RoutesAndPages.md): 应用路由结构
- [工具和辅助函数](./modules/工具和辅助函数-UtilsAndHelpers.md): 通用工具函数
- [任务执行](./modules/任务执行-TaskExecution.md): AI 响应的任务执行和终端显示

## 5. 开发流程

1. 克隆仓库: `git clone https://github.com/stackblitz/bolt.new.git`
2. 安装依赖: `pnpm install`
3. 启动开发服务器: `pnpm dev`
4. 在浏览器中访问 `http://localhost:3000`

## 6. 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 配置的代码风格
- 组件使用函数式组件和 Hooks
- 使用 nanostores 进行状态管理

## 7. 测试

- 单元测试: 使用 Jest 框架
- 组件测试: 使用 React Testing Library
- 运行测试: `pnpm test`

## 8. 构建和部署

- 构建项目: `pnpm build`
- 部署到 Cloudflare Pages: 通过 GitHub Actions 自动部署

## 9. 贡献指南

1. Fork 项目仓库
2. 创建功能分支: `git checkout -b feature/AmazingFeature`
3. 提交更改: `git commit -m 'Add some AmazingFeature'`
4. 推送到分支: `git push origin feature/AmazingFeature`
5. 开启一个 Pull Request

## 10. 有用的资源

- [Remix 文档](https://remix.run/docs/en/main)
- [React 文档](https://reactjs.org/docs/getting-started.html)
- [nanostores 文档](https://github.com/nanostores/nanostores#readme)
- [CodeMirror 文档](https://codemirror.net/docs/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)

## 11. 常见问题解答

(这里可以添加一些常见的开发问题和解决方案)

## 12. 联系方式

如有任何问题或建议,请通过以下方式联系我们:

- GitHub Issues: [https://github.com/stackblitz/bolt.new/issues](https://github.com/stackblitz/bolt.new/issues)
- 邮箱: support@stackblitz.com

## 13. AI 响应任务执行和终端显示

Bolt 系统的一个关键特性是能够根据 AI 的响应执行各种任务，并将命令执行过程实时显示在终端中。这个功能增强了用户与 AI 助手之间的交互，使得开发过程更加直观和高效。

### 实现细节

- 位置: `app/lib/runtime/action-runner.ts`
- 主要类: `ActionRunner`

### 主要功能

1. 解析 AI 响应中的任务指令
2. 执行相应的操作（如文件修改、安装依赖等）
3. 将执行过程实时显示在终端组件中

### 使用方式

在处理 AI 响应时，系统会自动识别和执行相关任务。开发者可以通过以下方式与此功能交互：

```typescript
import { ActionRunner } from '~/lib/runtime/action-runner';

// 创建 ActionRunner 实例
const actionRunner = new ActionRunner(webcontainer);

// 执行 AI 响应中的任务
await actionRunner.run(aiResponse);
```

### 注意事项

- 确保 AI 响应的格式符合预定义的任务指令结构
- 考虑任务执行的安全性，避免执行潜在的危险操作
- 优化终端显示的性能，特别是在处理大量输出时
- 提供适当的错误处理和用户反馈机制

更多详细信息，请参阅 [任务执行模块文档](./modules/任务执行-TaskExecution.md)。

欢迎加入 Bolt 开发社区,一起打造下一代的 AI 辅助开发工具!
