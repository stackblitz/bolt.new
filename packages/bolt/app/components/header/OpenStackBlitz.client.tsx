import path from 'path';
import { useStore } from '@nanostores/react';
import sdk from '@stackblitz/sdk';
import type { FileMap } from '~/lib/stores/files';
import { workbenchStore, type ArtifactState } from '~/lib/stores/workbench';
import { WORK_DIR } from '~/utils/constants';
import { memo, useCallback, useEffect, useState } from 'react';

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

  if (!artifactLoaded) {
    return null;
  }

  return (
    <a onClick={handleClick} className="cursor-pointer">
      <img alt="Open in StackBlitz" src="https://developer.stackblitz.com/img/open_in_stackblitz.svg" />
    </a>
  );
});
