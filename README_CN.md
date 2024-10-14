# Bolt 开源代码库

![Bolt Open Source Codebase](./public/social_preview_index.jpg)

> 欢迎来到 **Bolt** 开源代码库! 本仓库包含了一个使用 bolt.new 核心组件的简单示例应用,旨在帮助你开始构建基于 StackBlitz 的 **WebContainer API** 驱动的 **AI 驱动软件开发工具**。

### 为什么选择 Bolt + WebContainer API 进行开发

通过使用 Bolt + WebContainer API 构建,你可以创建基于浏览器的应用程序,让用户直接在浏览器中**提示、运行、编辑和部署**全栈 Web 应用,无需虚拟机。借助 WebContainer API,你可以构建应用程序,让 AI 直接访问和完全控制用户浏览器标签页内的 **Node.js 服务器**、**文件系统**、**包管理器**和**开发终端**。这种强大的组合允许你创建一种新类型的开发工具,支持所有主流 JavaScript 库和 Node 包,无需远程环境或本地安装即可开箱即用。

### Bolt(本仓库)与 [Bolt.new](https://bolt.new) 有什么区别?

- **Bolt.new**: 这是 StackBlitz 的**商业产品** - 一个托管的、基于浏览器的 AI 开发工具,使用户能够直接在浏览器中提、运行、编辑和部署全栈 Web 应用程序。它基于 [Bolt 开源仓库](https://github.com/stackblitz/bolt.new) 构建,并由 StackBlitz 的 **WebContainer API** 提供支持。

- **Bolt(本仓库)**: 这个开源仓库提供了用于构建 **Bolt.new** 的核心组件。该仓库包含 Bolt 的 UI 界面以及使用 [Remix Run](https://remix.run/) 构建的服务器组件。通过利用这个仓库和 StackBlitz 的 **WebContainer API**,你可以创建自己的 AI 驱动的开发工具和完全在浏览器中运行的全栈应用程序。

# 开始使用 Bolt 进行开发

Bolt 将 AI 的能力与沙盒化的开发环境相结合,创造了一种协作体验,让代码可以由助手和程序员共同开发。Bolt 结合了 [WebContainer API](https://webcontainers.io/api)、[Claude Sonnet 3.5](https://www.anthropic.com/news/claude-3-5-sonnet)、[Remix](https://remix.run/) 和 [AI SDK](https://sdk.vercel.ai/)。

### WebContainer API

Bolt 使用 [WebContainers](https://webcontainers.io/) 在浏览器中运行生成的代码。WebContainers 为 Bolt 提供了一个使用 [WebContainer API](https://webcontainers.io/api) 的全栈沙盒环境。WebContainers 直接在浏览器中运行全栈应用程序,无需云托管 AI 代理的成本和安全隐患。WebContainers 是交互式和可编辑的,使 Bolt 的 AI 能够运行码并理解用户的任何更改。

[WebContainer API](https://webcontainers.io) 对个人和开源使用是免费的。如果你正在构建商业用途的应用程序,可以在[这里](https://stackblitz.com/pricing#webcontainer-api)了解更多关于我们的 WebContainer API 商业使用定价。

### Remix 应用

Bolt 使用 [Remix](https://remix.run/) 构建,并使用 [CloudFlare Pages](https://pages.cloudflare.com/) 和 [CloudFlare Workers](https://workers.cloudflare.com/) 部署。

### AI SDK 集成

Bolt 使用 [AI SDK](https://github.com/vercel/ai) 与 AI 模型集成。目前,Bolt 支持使用 Anthropic 的 Claude Sonnet 3.5。
你可以从 [Anthropic API 控制台](https://console.anthropic.com/) 获取 API 密钥以在 Bolt 中使用。
看看 [Bolt 如何使用 AI SDK](https://github.com/stackblitz/bolt.new/tree/main/app/lib/.server/llm)

## 先决条件

在开始之前,请确保已安装以下内容:

- Node.js (v20.15.1)
- pnpm (v9.4.0)

## 设置

1. 克隆仓库(如果你还没有):

```bash
git clone https://github.com/stackblitz/bolt.new.git
```

2. 安装依赖:

```bash
pnpm install
```

3. 在根目录创建一个 `.env.local` 文件,并添加你的 Anthropic API 密钥:

ANTHROPIC_API_KEY=XXX


可选地,你可以设置调试级别:

VITE_LOG_LEVEL=debug


**重要**: 永不要将你的 `.env.local` 文件提交到版本控制。它已经包含在 .gitignore 中。

## 项目结构

以下是 Bolt 项目的详细目录结构:

```
bolt.new/
├── app/
│ ├── components/
│ │ ├── chat/ # 聊天相关组件
│ │ ├── editor/ # 编辑器相关组件
│ │ ├── header/ # 头部组件
│ │ ├── sidebar/ # 侧边栏组件
│ │ ├── ui/ # 通用UI组件
│ │ └── workbench/ # 工作台组件
│ ├── lib/
│ │ ├── .server/
│ │ │ └── llm/ # 语言模型相关代码
│ │ │ ├── api-key.ts # API密钥处理
│ │ │ ├── base-url.ts # 基础URL配置
│ │ │ ├── constants.ts # 常量定义
│ │ │ ├── model.ts # 模型配置
│ │ │ ├── prompts.ts # 提示词模板
│ │ │ ├── stream-text.ts # 文本流处理
│ │ │ └── switchable-stream.ts # 可切换流实现
│ │ ├── ai/ # AI 相关功能
│ │ ├── hooks/ # React hooks
│ │ ├── persistence/ # 数据持久化
│ │ ├── runtime/ # 运行时相关代码
│ │ └── stores/ # 状态管理
│ ├── routes/ # Remix 路由
│ ├── styles/
│ │ ├── components/ # 组件特定样式
│ │ └── index.scss # 主样式文件
│ └── utils/ # 工具函数
├── public/ # 静态资源
│ └── icons/ # 图标文件
├── types/ # TypeScript 类型定义
├── .editorconfig # 编辑器配置
├── .env.example # 环境变量示例
├── .eslintignore # ESLint 忽略配置
├── .gitignore # Git 忽略配置
├── .prettierignore # Prettier 忽略配置
├── .prettierrc # Prettier 配置
├── eslint.config.mjs # ESLint 配置
├── package.json # 项目依赖和脚本
├── pnpm-lock.yaml # pnpm 锁文件
├── README.md # 英文说明文档
├── README_CN.md # 中文说明文档
├── tsconfig.json # TypeScript 配置
├── uno.config.ts # UnoCSS 配置
└── vite.config.ts # Vite 配置文件


主要目录和文件说明:

- `app/`: 包含应用程序的主要源代码。
  - `components/`: 包含所有 React 组件,按功能分类。
  - `lib/`: 包含核心库和工具。
    - `.server/`: 包含服务器端代码。
      - `llm/`: 语言模型相关代码。
        - `api-key.ts`: 处理 API 密钥的逻辑。
        - `base-url.ts`: 配置基础 URL。
        - `constants.ts`: 定义常量。
        - `model.ts`: 配置和初始化语言模型。
        - `prompts.ts`: 定义系统提示和其他提示模板。
        - `stream-text.ts`: 处理文本流的逻辑。
        - `switchable-stream.ts`: 实现可切换的流。
    - `ai/`: 包含 AI 相关功能。
    - `hooks/`: 包含自定义 React hooks。
    - `persistence/`: 包含数据持久化相关代码。
    - `runtime/`: 包含运行时相关代码。
    - `stores/`: 包含状态管理相关代码。
  - `routes/`: 包含 Remix 路由定义。
  - `styles/`: 包含全局样式文件和组件特定样式。
  - `utils/`: 包含通用工具函数。
- `public/`: 包含静态资源文件,如图标。
- `types/`: 包含 TypeScript 类型定义。
- 根目录下的配置文件:
  - `.editorconfig`: 编辑器配置文件。
  - `.env.example`: 环境变量示例文件。
  - `.eslintignore` 和 `eslint.config.mjs`: ESLint 相关配置。
  - `.gitignore`: Git 忽略文件配置。
  - `.prettierignore` 和 `.prettierrc`: Prettier 代码格式化配置。
  - `package.json`: 项目依赖和脚本定义。
  - `tsconfig.json`: TypeScript 配置文件。
  - `uno.config.ts`: UnoCSS 配置文件。
  - `vite.config.ts`: Vite 构建工具的配置文件。

## 可用脚本

- `pnpm run dev`: 启动开发服务器。
- `pnpm run build`: 构建项目。
- `pnpm run start`: 使用 Wrangler Pages 在本地运行构建的应用程序。此脚本使用 `bindings.sh` 设置必要的绑定,因此你不必重复环境变量。
- `pnpm run preview`: 构建项目然后在本地启动,用于测试生产构建。注意,HTTP 流目前无法按预期与 `wrangler pages dev` 一起工作。
- `pnpm test`: 使用 Vitest 运行测试套件。
- `pnpm run typecheck`: 运行 TypeScript 类型检查。
- `pnpm run typegen`: 使用 Wrangler 生成 TypeScript 类型。
- `pnpm run deploy`: 构建项目并将其部署到 Cloudflare Pages。

## 开发

要启动开发服务器:

```bash
pnpm run dev
```

这将启动 Remix Vite 开发服务器。

## 测试

运行测试套件:

```bash
pnpm test
```

## 部署

要将应用程序部署到 Cloudflare Pages:

```bash
pnpm run deploy
```

确保你拥有必要的权限,并且 Wrangler 已正确配置为你的 Cloudflare 账户。
