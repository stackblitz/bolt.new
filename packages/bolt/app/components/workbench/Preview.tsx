import { useStore } from '@nanostores/react';
import { memo, useEffect, useRef, useState } from 'react';
import { workbenchStore } from '../../lib/stores/workbench';
import { IconButton } from '../ui/IconButton';

export const Preview = memo(() => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activePreviewIndex] = useState(0);
  const previews = useStore(workbenchStore.previews);
  const activePreview = previews[activePreviewIndex];

  const [url, setUrl] = useState('');
  const [iframeUrl, setIframeUrl] = useState<string | undefined>();

  useEffect(() => {
    if (activePreview && !iframeUrl) {
      const { baseUrl } = activePreview;

      setUrl(baseUrl);
      setIframeUrl(baseUrl);
    }
  }, [activePreview, iframeUrl]);

  const reloadPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-gray-100 rounded-t-lg p-2 flex items-center space-x-1.5">
        <div className="i-ph:circle-fill text-[#FF5F57]"></div>
        <div className="i-ph:circle-fill text-[#FEBC2E]"></div>
        <div className="i-ph:circle-fill text-[#29CC41]"></div>
        <div className="flex-grow"></div>
      </div>
      <div className="bg-white p-2 flex items-center gap-1">
        <IconButton icon="i-ph:arrow-clockwise" onClick={reloadPreview} />
        <div className="flex items-center gap-1 flex-grow bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 hover:focus-within:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-accent">
          <div className="bg-white rounded-full p-[2px] -ml-1">
            <div className="i-ph:info-bold text-lg"></div>
          </div>
          <input
            className="w-full bg-transparent outline-none"
            type="text"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
            }}
          />
        </div>
      </div>
      <div className="flex-1 bg-white border-t">
        {activePreview ? (
          <iframe ref={iframeRef} className="border-none w-full h-full" src={iframeUrl}></iframe>
        ) : (
          <div className="flex w-full h-full justify-center items-center">No preview available</div>
        )}
      </div>
    </div>
  );
});
