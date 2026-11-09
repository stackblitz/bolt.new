import { useStore } from '@nanostores/react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { IconButton } from '~/components/ui/IconButton';
import { refreshDaytonaPreview, remotePreviewStore } from '~/lib/daytona.client';
import { workbenchStore } from '~/lib/stores/workbench';
import { PortDropdown } from './PortDropdown';

export const Preview = memo(() => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isPortDropdownOpen, setIsPortDropdownOpen] = useState(false);
  const hasSelectedPreview = useRef(false);
  const previews = useStore(workbenchStore.previews);
  const remotePreview = useStore(remotePreviewStore);
  const activePreview = previews[activePreviewIndex];

  const currentBaseUrl = remotePreview?.baseUrl || activePreview?.baseUrl;
  const [url, setUrl] = useState('');
  const [iframeUrl, setIframeUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!currentBaseUrl) {
      setUrl('');
      setIframeUrl(undefined);
      return;
    }

    setUrl(currentBaseUrl);
    setIframeUrl(currentBaseUrl);
  }, [currentBaseUrl]);

  const validateUrl = useCallback(
    (value: string) => {
      if (!currentBaseUrl) {
        return false;
      }

      if (value === currentBaseUrl) {
        return true;
      }

      return value.startsWith(currentBaseUrl) && ['/', '?', '#'].includes(value.charAt(currentBaseUrl.length));
    },
    [currentBaseUrl],
  );

  const findMinPortIndex = useCallback(
    (minIndex: number, preview: { port: number }, index: number, array: { port: number }[]) => {
      return preview.port < array[minIndex].port ? index : minIndex;
    },
    [],
  );

  useEffect(() => {
    if (!remotePreview && previews.length > 1 && !hasSelectedPreview.current) {
      setActivePreviewIndex(previews.reduce(findMinPortIndex, 0));
    }
  }, [previews, remotePreview, findMinPortIndex]);

  const reloadPreview = () => {
    if (remotePreview) {
      void refreshDaytonaPreview(remotePreview.port).catch((error) => {
        console.error('[BeamCore] Could not refresh Daytona preview:', error);
      });
      return;
    }

    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {isPortDropdownOpen && (
        <div className="z-iframe-overlay w-full h-full absolute" onClick={() => setIsPortDropdownOpen(false)} />
      )}
      <div className="bg-bolt-elements-background-depth-2 p-2 flex items-center gap-1.5">
        <IconButton icon="i-ph:arrow-clockwise" onClick={reloadPreview} />
        <div className="flex items-center gap-1 flex-grow bg-bolt-elements-preview-addressBar-background border border-bolt-elements-borderColor text-bolt-elements-preview-addressBar-text rounded-full px-3 py-1 text-sm">
          <input
            ref={inputRef}
            className="w-full bg-transparent outline-none"
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && validateUrl(url)) {
                setIframeUrl(url);
                inputRef.current?.blur();
              }
            }}
          />
        </div>
        {!remotePreview && previews.length > 1 && (
          <PortDropdown
            activePreviewIndex={activePreviewIndex}
            setActivePreviewIndex={setActivePreviewIndex}
            isDropdownOpen={isPortDropdownOpen}
            setHasSelectedPreview={(value) => (hasSelectedPreview.current = value)}
            setIsDropdownOpen={setIsPortDropdownOpen}
            previews={previews}
          />
        )}
      </div>
      <div className="flex-1 border-t border-bolt-elements-borderColor">
        {iframeUrl ? (
          <iframe ref={iframeRef} className="border-none w-full h-full bg-white" src={iframeUrl} />
        ) : (
          <div className="flex w-full h-full justify-center items-center bg-white">No preview available</div>
        )}
      </div>
    </div>
  );
});
