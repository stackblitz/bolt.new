import React from 'react';
import type { Message } from 'ai';
import { toast } from 'react-toastify';

interface ImportFolderButtonProps {
  className?: string;
  importChat?: (description: string, messages: Message[]) => Promise<void>;
}

const IGNORED_FOLDERS = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.cache', '.vscode', '.idea'];

const generateId = () => Math.random().toString(36).substring(2, 15);

export const ImportFolderButton: React.FC<ImportFolderButtonProps> = ({ className, importChat }) => {
  const shouldIncludeFile = (path: string): boolean => {
    return !IGNORED_FOLDERS.some((folder) => path.includes(`/${folder}/`));
  };

  const createChatFromFolder = async (files: File[]) => {
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

    const message: Message = {
      role: 'assistant',
      content: `I'll help you set up these files.

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

          try {
            await createChatFromFolder(filteredFiles);
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
        <div className="i-ph:folder-simple-upload" />
        Import Folder
      </button>
    </>
  );
};
