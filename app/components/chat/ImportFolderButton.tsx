import React from 'react';
import type { Message } from 'ai';
import { toast } from 'react-toastify';
import ignore from 'ignore';

interface ImportFolderButtonProps {
  className?: string;
  importChat?: (description: string, messages: Message[]) => Promise<void>;
}

// Common patterns to ignore, similar to .gitignore
const IGNORE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
  '.cache/**',
  '.vscode/**',
  '.idea/**',
  '**/*.log',
  '**/.DS_Store',
  '**/npm-debug.log*',
  '**/yarn-debug.log*',
  '**/yarn-error.log*',
];

const ig = ignore().add(IGNORE_PATTERNS);
const generateId = () => Math.random().toString(36).substring(2, 15);

const isBinaryFile = async (file: File): Promise<boolean> => {
  const chunkSize = 1024; // Read the first 1 KB of the file
  const buffer = new Uint8Array(await file.slice(0, chunkSize).arrayBuffer());

  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];

    if (byte === 0 || (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13)) {
      return true; // Found a binary character
    }
  }

  return false;
};

export const ImportFolderButton: React.FC<ImportFolderButtonProps> = ({ className, importChat }) => {
  const shouldIncludeFile = (path: string): boolean => {
    return !ig.ignores(path);
  };

  const createChatFromFolder = async (files: File[], binaryFiles: string[]) => {
    const fileArtifacts = await Promise.all(
      files.map(async (file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            const content = reader.result as string;
            const relativePath = file.webkitRelativePath.split('/').slice(1).join('/');
            resolve(
              `<boltAction type="file" filePath="${relativePath}">
${content}
</boltAction>`,
            );
          };
          reader.onerror = reject;
          reader.readAsText(file);
        });
      }),
    );

    const binaryFilesMessage =
      binaryFiles.length > 0
        ? `\n\nSkipped ${binaryFiles.length} binary files:\n${binaryFiles.map((f) => `- ${f}`).join('\n')}`
        : '';

    const message: Message = {
      role: 'assistant',
      content: `I'll help you set up these files.${binaryFilesMessage}

<boltArtifact id="imported-files" title="Imported Files">
${fileArtifacts.join('\n\n')}
</boltArtifact>`,
      id: generateId(),
      createdAt: new Date(),
    };

    const userMessage: Message = {
      role: 'user',
      id: generateId(),
      content: 'Import my files',
      createdAt: new Date(),
    };

    const description = `Folder Import: ${files[0].webkitRelativePath.split('/')[0]}`;

    if (importChat) {
      await importChat(description, [userMessage, message]);
    }
  };

  return (
    <>
      <input
        type="file"
        id="folder-import"
        className="hidden"
        webkitdirectory=""
        directory=""
        onChange={async (e) => {
          const allFiles = Array.from(e.target.files || []);
          const filteredFiles = allFiles.filter((file) => shouldIncludeFile(file.webkitRelativePath));

          if (filteredFiles.length === 0) {
            toast.error('No files found in the selected folder');
            return;
          }

          try {
            const fileChecks = await Promise.all(
              filteredFiles.map(async (file) => ({
                file,
                isBinary: await isBinaryFile(file),
              })),
            );

            const textFiles = fileChecks.filter((f) => !f.isBinary).map((f) => f.file);
            const binaryFilePaths = fileChecks
              .filter((f) => f.isBinary)
              .map((f) => f.file.webkitRelativePath.split('/').slice(1).join('/'));

            if (textFiles.length === 0) {
              toast.error('No text files found in the selected folder');
              return;
            }

            if (binaryFilePaths.length > 0) {
              toast.info(`Skipping ${binaryFilePaths.length} binary files`);
            }

            await createChatFromFolder(textFiles, binaryFilePaths);
          } catch (error) {
            console.error('Failed to import folder:', error);
            toast.error('Failed to import folder');
          }

          e.target.value = ''; // Reset file input
        }}
        {...({} as any)} // if removed webkitdirectory will throw errors as unknow attribute
      />
      <button
        onClick={() => {
          const input = document.getElementById('folder-import');
          input?.click();
        }}
        className={className}
      >
        <div className="i-ph:upload-simple" />
        Import Folder
      </button>
    </>
  );
};
