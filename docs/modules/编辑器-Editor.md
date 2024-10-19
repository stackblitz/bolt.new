# 编辑器模块 (Editor Module)

## 概述

编辑器模块基于 CodeMirror 实现,为 Bolt 系统提供强大的代码编辑功能。它支持语法高亮、自动补全、主题切换等特性。

## 实现细节

文件位置: `app/components/editor/codemirror/CodeMirrorEditor.tsx`

### 主要组件: CodeMirrorEditor

`CodeMirrorEditor` 组件是编辑器模块的核心,它封装了 CodeMirror 的功能并提供了额外的定制。

#### 主要属性

- `value`: 编辑器的当前内容
- `onChange`: 内容变化时的回调函数
- `language`: 当前编辑的语言
- `theme`: 编辑器主题
- `readOnly`: 是否为只读模式

#### 主要功能

1. 语法高亮: 根据文件类型自动应用相应的语法高亮
2. 自动补全: 提供智能的代码补全建议
3. 主题切换: 支持明暗主题切换
4. 行号显示: 显示代码行号,便于定位
5. 括号匹配: 自动匹配括号,提高编码效率

### 编辑器状态管理

编辑器状态使用 nanostores 进行管理:

```typescript
import { atom, map } from 'nanostores';

export const selectedFile = atom<string | undefined>();
export const documents = map<Record<string, EditorDocument>>({});
```

## 使用方式

在 React 组件中使用 CodeMirrorEditor:

```tsx
import { CodeMirrorEditor } from '~/components/editor/codemirror/CodeMirrorEditor';

function MyEditor() {
  const [code, setCode] = useState('console.log("Hello, Bolt!");');

  return (
    <CodeMirrorEditor
      value={code}
      onChange={setCode}
      language="javascript"
      theme="dark"
    />
  );
}
```

## 注意事项

- 大文件加载可能会影响性能,考虑实现虚拟滚动或分块加载
- 编辑器的主题应与整体 UI 主题保持一致
- 考虑实现自定义快捷键和命令,以提高用户效率
