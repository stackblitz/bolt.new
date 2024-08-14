import { useStore } from '@nanostores/react';
import sdk from '@stackblitz/sdk';
import path from 'path';
import { memo, useCallback, useEffect, useState } from 'react';
import type { FileMap } from '~/lib/stores/files';
import { workbenchStore, type ArtifactState } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { WORK_DIR } from '~/utils/constants';

// extract relative path and content from file, wrapped in array for flatMap use
const extractContent = ([file, value]: [string, FileMap[string]]) => {
  // ignore directory entries
  if (!value || value.type !== 'file') {
    return [];
  }

  const relative = path.relative(WORK_DIR, file);
  const parts = relative.split(path.sep);

  // ignore hidden files
  if (parts.some((part) => part.startsWith('.'))) {
    return [];
  }

  return [[relative, value.content]];
};

// subscribe to changes in first artifact's runner actions
const useFirstArtifact = (): [boolean, ArtifactState | undefined] => {
  const [hasLoaded, setHasLoaded] = useState(false);

  // react to artifact changes
  useStore(workbenchStore.artifacts);

  const { firstArtifact } = workbenchStore;

  useEffect(() => {
    if (firstArtifact) {
      return firstArtifact.runner.actions.subscribe((_) => setHasLoaded(workbenchStore.filesCount > 0));
    }

    return undefined;
  }, [firstArtifact]);

  return [hasLoaded, firstArtifact];
};

export const OpenStackBlitz = memo(() => {
  const [artifactLoaded, artifact] = useFirstArtifact();

  const disabled = !artifactLoaded;

  const handleClick = useCallback(() => {
    if (!artifact) {
      return;
    }

    // extract relative path and content from files map
    const workbenchFiles = workbenchStore.files.get();
    const files = Object.fromEntries(Object.entries(workbenchFiles).flatMap(extractContent));

    // we use the first artifact's title for the StackBlitz project
    const { title } = artifact;

    sdk.openProject({
      title,
      template: 'node',
      files,
    });
  }, [artifact]);

  return (
    <button
      className={classNames(
        'relative flex items-stretch p-[1px] overflow-hidden text-xs text-bolt-elements-cta-text rounded-lg bg-bolt-elements-borderColor dark:bg-gray-800',
        {
          'cursor-not-allowed opacity-50': disabled,
          'group hover:bg-gradient-to-t from-accent-900 to-accent-500 hover:text-white': !disabled,
        },
      )}
      onClick={handleClick}
      disabled={disabled}
    >
      <div
        className={classNames(
          'flex items-center gap-1.5 px-3 bg-bolt-elements-cta-background dark:bg-alpha-gray-80 group-hover:bg-transparent rounded-[calc(0.5rem-1px)] group-hover:bg-opacity-0',
          {
            'opacity-50': disabled,
          },
        )}
      >
        <svg width="11" height="16">
          <path
            fill="currentColor"
            d="M4.67 9.85a.3.3 0 0 0-.27-.4H.67a.3.3 0 0 1-.21-.49l7.36-7.9c.22-.24.6 0 .5.3l-1.75 4.8a.3.3 0 0 0 .28.39h3.72c.26 0 .4.3.22.49l-7.37 7.9c-.21.24-.6 0-.49-.3l1.74-4.8Z"
          />
        </svg>
        <span>Open in StackBlitz</span>
      </div>
    </button>
  );
});
