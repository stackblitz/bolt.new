# 工作台模块 (Workbench Module)

## 概述

工作台模块是 Bolt 系统的核心用户界面组件,集成了编辑器、文件树、预览等功能,为用户提供了一个完整的开发环境。

## 实现细节

文件位置: `app/components/workbench/`

### 主要组件

#### 1. Workbench (Workbench.client.tsx)

工作台的主组件,负责整合其他子组件并管理整体布局。

#### 2. EditorPanel (EditorPanel.tsx)

集成了代码编辑器,提供文件编辑功能。

#### 3. FileTree (FileTree.tsx)

显示项目文件结构,允许用户浏览和选择文件。

#### 4. Preview (Preview.tsx)

预览组件,用于实时显示应用运行效果。

#### 5. Terminal (Terminal.tsx)

集成的终端组件,允许用户执行命令行操作。

### 状态管理

工作台使用 nanostores 进行状态管理:

```typescript
import { atom, map } from 'nanostores';

export const showWorkbench = atom(false);
export const currentView = atom<'code' | 'preview'>('code');
export const unsavedFiles = atom(new Set<string>());
```

## 使用方式

在 React 应用中使用工作台组件:

```tsx
import { Workbench } from '~/components/workbench/Workbench.client';

function App() {
  return (
    <div className="app-container">
      <Workbench chatStarted={true} isStreaming={false} />
    </div>
  );
}
```

## 注意事项

- 工作台布局应考虑响应式设计,适应不同屏幕尺寸
- 文件树组件应优化大型项目的性能,考虑实现虚拟滚动
- 预览组件需要注意安全性,防止恶意代码执行
- 终端组件应限制某些危险操作,保护用户系统安全
