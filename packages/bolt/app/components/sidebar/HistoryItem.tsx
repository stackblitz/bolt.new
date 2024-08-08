import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { db, deleteId, type ChatHistory } from '~/lib/persistence';
import { logger } from '~/utils/logger';

export function HistoryItem({ item, loadEntries }: { item: ChatHistory; loadEntries: () => void }) {
  const [requestingDelete, setRequestingDelete] = useState(false);
  const [hovering, setHovering] = useState(false);
  const hoverRef = useRef<HTMLDivElement>(null);

  const deleteItem = useCallback((event: React.UIEvent) => {
    event.preventDefault();

    if (db) {
      deleteId(db, item.id)
        .then(() => loadEntries())
        .catch((error) => {
          toast.error('Failed to delete conversation');
          logger.error(error);
        });
    }
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;

    function mouseEnter() {
      setHovering(true);

      if (timeout) {
        clearTimeout(timeout);
      }
    }

    function mouseLeave() {
      setHovering(false);

      // wait for animation to finish before unsetting
      timeout = setTimeout(() => {
        setRequestingDelete(false);
      }, 200);
    }

    hoverRef.current?.addEventListener('mouseenter', mouseEnter);
    hoverRef.current?.addEventListener('mouseleave', mouseLeave);

    return () => {
      hoverRef.current?.removeEventListener('mouseenter', mouseEnter);
      hoverRef.current?.removeEventListener('mouseleave', mouseLeave);
    };
  }, []);

  return (
    <div
      ref={hoverRef}
      className="group rounded-md text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 overflow-hidden flex justify-between items-center px-2 py-1"
    >
      <a href={`/chat/${item.urlId}`} className="flex w-full relative truncate block">
        {item.description}
        <div className="absolute right-0 z-1 top-0 bottom-0 bg-gradient-to-l from-bolt-elements-background-depth-2 group-hover:from-bolt-elements-background-depth-3 to-transparent w-10 flex justify-end group-hover:w-15 group-hover:from-45%">
          {hovering && (
            <div className="flex items-center p-1 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary">
              {requestingDelete ? (
                <button className="i-ph:check scale-110" onClick={deleteItem} />
              ) : (
                <button
                  className="i-ph:trash scale-110"
                  onClick={(event) => {
                    event.preventDefault();
                    setRequestingDelete(true);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </a>
    </div>
  );
}
