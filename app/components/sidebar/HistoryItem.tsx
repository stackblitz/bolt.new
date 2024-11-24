import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useRef, useState } from 'react';
import { type ChatHistoryItem } from '~/lib/persistence';
import WithTooltip from '~/components/ui/Tooltip';

interface HistoryItemProps {
  item: ChatHistoryItem;
  onDelete?: (event: React.UIEvent) => void;
  onDuplicate?: (id: string) => void;
  exportChat: (id?: string) => void;
}

export function HistoryItem({ item, onDelete, onDuplicate, exportChat }: HistoryItemProps) {
  const [hovering, setHovering] = useState(false);
  const hoverRef = useRef<HTMLDivElement>(null);

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
        <div className="absolute right-0 z-1 top-0 bottom-0 bg-gradient-to-l from-bolt-elements-background-depth-2 group-hover:from-bolt-elements-background-depth-3 box-content pl-3 to-transparent w-10 flex justify-end group-hover:w-15 group-hover:from-99%">
          {hovering && (
            <div className="flex items-center p-1 text-bolt-elements-textSecondary">
              <WithTooltip tooltip="Export chat">
                <button
                  className="i-ph:download-simple scale-110 mr-2"
                  onClick={(event) => {
                    event.preventDefault();
                    exportChat(item.id);

                    //exportChat(item.messages, item.description);
                  }}
                  title="Export chat"
                />
              </WithTooltip>
              {onDuplicate && (
                <WithTooltip tooltip="Duplicate chat">
                  <button
                    className="i-ph:copy scale-110 mr-2"
                    onClick={() => onDuplicate?.(item.id)}
                    title="Duplicate chat"
                  />
                </WithTooltip>
              )}
              <Dialog.Trigger asChild>
                <WithTooltip tooltip="Delete chat">
                  <button
                    className="i-ph:trash scale-110"
                    onClick={(event) => {
                      // we prevent the default so we don't trigger the anchor above
                      event.preventDefault();
                      onDelete?.(event);
                    }}
                  />
                </WithTooltip>
              </Dialog.Trigger>
            </div>
          )}
        </div>
      </a>
    </div>
  );
}
