import { useStore } from '@nanostores/react';
import { workspaceStore } from '~/lib/stores/workspace';

interface ArtifactProps {
  messageId: string;
}

export function Artifact({ messageId }: ArtifactProps) {
  const artifacts = useStore(workspaceStore.artifacts);

  const artifact = artifacts[messageId];

  return (
    <button
      className="flex border rounded-lg overflow-hidden items-stretch bg-gray-50/25 w-full"
      onClick={() => {
        const showWorkspace = workspaceStore.showWorkspace.get();
        workspaceStore.showWorkspace.set(!showWorkspace);
      }}
    >
      <div className="border-r flex items-center px-6 bg-gray-100/50">
        {!artifact?.closed ? (
          <div className="i-svg-spinners:90-ring-with-bg scale-130"></div>
        ) : (
          <div className="i-ph:code-bold scale-130 text-gray-600"></div>
        )}
      </div>
      <div className="flex flex-col items-center px-4 p-2.5">
        <div className="text-left w-full">{artifact?.title}</div>
        <small className="w-full text-left">Click to open code</small>
      </div>
    </button>
  );
}
