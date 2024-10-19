# 状态管理模块 (State Management Module)

## 概述

状态管理模块使用 nanostores 来管理 Bolt 系统的全局状态。它提供了一种轻量级、高效的方式来处理跨组件的状态共享和更新。

## 实现细节

文件位置: `app/lib/stores/`

### 主要 Store

#### 1. workbenchStore (workbench.ts)

管理工作台相关的状态,如当前视图、未保存文件等。

#### 2. editorStore (editor.ts)

管理编辑器相关的状态,如当前选中的文件、文档内容等。

#### 3. filesStore (files.ts)

管理文件系统相关的状态,如文件列表、修改状态等。

#### 4. themeStore (theme.ts)

管理应用主题相关的状态,如当前主题设置。

### 核心概念

- Atom: 用于存储单一值的状态单元
- Map: 用于存储键值对集合的状态单元
- Computed: 基于其他状态计算得出的派生状态

### 示例代码

```typescript
import { atom, map, computed } from 'nanostores';

export const selectedFile = atom<string | undefined>();
export const files = map<Record<string, FileContent>>({});

export const currentFileContent = computed(
  [selectedFile, files],
  (selected, filesMap) => selected ? filesMap[selected] : undefined
);
```

## 使用方式

在 React 组件中使用状态:

```tsx
import { useStore } from '@nanostores/react';
import { selectedFile, currentFileContent } from '~/lib/stores/editor';

function EditorComponent() {
  const selected = useStore(selectedFile);
  const content = useStore(currentFileContent);

  // 使用 selected 和 content 渲染组件
}
```

## 注意事项

- 避免过度使用全局状态,优先考虑组件本地状态
- 对于频繁更新的状态,考虑使用 computed 来优化性能
- 确保在组件卸载时正确清理订阅,避免内存泄漏
- 考虑实现状态持久化,以支持会话恢复功能
- 在使用异步操作更新状态时,注意处理竞态条件
