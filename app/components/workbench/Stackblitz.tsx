import { useStore } from '@nanostores/react';
import { LightningBoltIcon } from '@radix-ui/react-icons';
import sdk from '@stackblitz/sdk';
import { workbenchStore } from '~/lib/stores/workbench';

interface FileData {
  type: 'file' | 'folder';
  content?: string;
  isBinary?: boolean;
}

interface FileMap {
  [path: string]: FileData;
}

export function Stackblitz() {
  const files = useStore(workbenchStore.files) as FileMap;
  const { firstArtifact } = workbenchStore;

  function OpenInStackblitz() {
    const projectFiles = Object.entries(files).reduce((acc, [path, fileData]) => {
      if (!fileData || fileData.type === 'folder') {
        return acc;
      }

      const relativePath = path.replace('/home/project/', '');
      
      if (fileData.content) {
        acc[relativePath] = fileData.content;
      }
      
      return acc;
    }, {} as Record<string, string>);

    sdk.openProject(
      {
        files: projectFiles,
        title: firstArtifact?.id ?? 'Description of My Project',
        description: firstArtifact?.title ?? 'My Project',
        template: 'node',
        dependencies: JSON.parse(files['/home/project/package.json'].content || '{}').dependencies,
      },
      {
        newWindow: true,
      }
    );
  }

  return (
    <button
      className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-bolt-elements-code-background hover:bg-gray-700 text-bolt-elements-button-secondary-text text-xs rounded-md"
      onClick={OpenInStackblitz}
    >
      <LightningBoltIcon className="w-4 h-4" /> Open in Stackblitz
    </button>
  );
}
