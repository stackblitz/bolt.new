import { memo } from 'react';
import type { FileMap } from '~/lib/stores/files';
import { WORK_DIR } from '~/utils/constants';
import { renderLogger } from '~/utils/logger';
import { FileTree } from './FileTree';

interface FileTreePanelProps {
  files?: FileMap;
  selectedFile?: string;
  unsavedFiles?: Set<string>;
  onFileSelect?: (value?: string) => void;
}

export const FileTreePanel = memo(({ files, unsavedFiles, selectedFile, onFileSelect }: FileTreePanelProps) => {
  renderLogger.trace('FileTreePanel');

  return (
    <div className="flex-1 overflow-y-scroll">
      <FileTree
        className="h-full"
        files={files}
        unsavedFiles={unsavedFiles}
        rootFolder={WORK_DIR}
        selectedFile={selectedFile}
        onFileSelect={onFileSelect}
      />
    </div>
  );
});
