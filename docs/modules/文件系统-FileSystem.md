# 文件系统模块 (File System Module)

## 概述

文件系统模块是 Bolt 系统的核心组件之一,负责管理项目文件。它提供了文件的增删改查、修改追踪和差异计算等功能。

## 实现细节

文件位置: `app/lib/stores/files.ts`

### 主要类: FilesStore

`FilesStore` 类是文件系统模块的核心,它使用 nanostores 来管理文件状态。

#### 主要属性

- `files`: 存储文件内容的 Map
- `modifiedFiles`: 追踪已修改文件的 Set

#### 主要方法

1. `setFiles(files: FileMap)`: 设置文件系统的初始状态
2. `getFile(filePath: string)`: 获取指定路径的文件
3. `writeFile(filePath: string, content: string)`: 写入文件内容
4. `deleteFile(filePath: string)`: 删除指定文件
5. `renameFile(oldPath: string, newPath: string)`: 重命名文件
6. `resetFile(filePath: string)`: 重置文件到初始状态

### 文件差异计算

文件系统模块使用 `diff` 库来计算文件的差异:

```typescript
import { createTwoFilesPatch } from 'diff';

// ...

diffFiles(fileName: string, oldFileContent: string, newFileContent: string) {
  return createTwoFilesPatch(fileName, fileName, oldFileContent, newFileContent);
}
```

## 使用方式

其他模块可以通过以下方式使用文件系统:

```typescript
import { filesStore } from '~/lib/stores/files';

// 读取文件
const fileContent = filesStore.getFile('/path/to/file.js');

// 写入文件
filesStore.writeFile('/path/to/newfile.js', 'console.log("Hello, World!");');

// 监听文件变化
filesStore.subscribe((files) => {
  console.log('Files have been updated:', files);
});
```

## 注意事项

- 文件操作应考虑异步处理,特别是在与 WebContainer 交互时
- 大文件操作可能会影响性能,应考虑分块处理或虚拟化
- 文件修改追踪对于实现撤销/重做功能很重要
