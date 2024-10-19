# Bolt 系统架构

## 1. 核心模块

### 1.1 WebContainer

WebContainer 是整个系统的核心,它提供了在浏览器中运行全栈应用的能力。

- 位置: `app/lib/webcontainer/index.ts`
- 主要功能:
  - 初始化 WebContainer
  - 提供文件系统、Node.js 运行时等功能

### 1.2 文件系统

文件系统模块负责管理项目文件。

- 位置: `app/lib/stores/files.ts`
- 主要功能:
  - 文件的增删改查
  - 文件修改追踪
  - 文件差异计算

### 1.3 编辑器

编辑器模块基于 CodeMirror 实现,提供代码编辑功能。

- 位置: `app/components/editor/codemirror/CodeMirrorEditor.tsx`
- 主要功能:
  - 代码高亮
  - 语法提示
  - 主题切换

### 1.4 AI 集成

AI 集成模块负责与 AI 模型(如 Claude)交互。

- 位置: `app/lib/.server/llm/`
- 主要功能:
  - AI 模型配置
  - 提示词处理
  - 流式响应处理

## 2. 用户界面组件

### 2.1 聊天界面

聊天界面是用户与 AI 交互的主要入口。

- 位置: `app/components/chat/`
- 主要组件:
  - BaseChat: 基础聊天组件
  - Markdown: Markdown 渲染组件
  - CodeBlock: 代码块渲染组件

### 2.2 工作台

工作台集成了编辑器、文件树、预览等功能。

- 位置: `app/components/workbench/`
- 主要组件:
  - Workbench: 工作台主组件
  - EditorPanel: 编辑器面板
  - FileTree: 文件树组件
  - Preview: 预览组件

## 3. 状态管理

系统使用 nanostores 进行状态管理。

- 位置: `app/lib/stores/`
- 主要 store:
  - workbench: 工作台状态
  - editor: 编辑器状态
  - files: 文件系统状态

## 4. 路由和页面

系统使用 Remix 进行路由管理。

- 位置: `app/routes/`
- 主要路由:
  - 根路由: 应用入口
  - 聊天路由: 聊天界面

## 5. 工具和辅助函数

- 位置: `app/utils/`
- 主要功能:
  - 日志记录
  - 类名处理
  - 文件差异计算
  - Markdown 处理

## 6. 样式

系统使用 SCSS 和 UnoCSS 进行样式管理。

- 位置: 
  - `app/styles/`
  - `uno.config.ts`

## 7. 构建和部署

系统使用 Vite 进行构建,部署到 Cloudflare Pages。

- 位置:
  - `vite.config.ts`
  - `wrangler.toml`
