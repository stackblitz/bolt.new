import { memo } from 'react';
import type { FileMap } from '../../lib/stores/files';
import { WORK_DIR } from '../../utils/constants';
import { renderLogger } from '../../utils/logger';
import { FileTree } from './FileTree';

interface FileTreePanelProps {
  files?: FileMap;
  selectedFile?: string;
  onFileSelect?: (value?: string) => void;
}

export const FileTreePanel = memo(({ files, selectedFile, onFileSelect }: FileTreePanelProps) => {
  renderLogger.trace('FileTreePanel');

  return (
    <div className="border-r h-full">
      <FileTree files={files} rootFolder={WORK_DIR} selectedFile={selectedFile} onFileSelect={onFileSelect} />
    </div>
  );
});
