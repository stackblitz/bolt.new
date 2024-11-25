import * as Dialog from '@radix-ui/react-dialog';
import { type ChatHistoryItem } from '~/lib/persistence';
import WithTooltip from '~/components/ui/Tooltip';

interface HistoryItemProps {
  item: ChatHistoryItem;
  onDelete?: (event: React.UIEvent) => void;
  onDuplicate?: (id: string) => void;
  exportChat: (id?: string) => void;
}

export function HistoryItem({ item, onDelete, onDuplicate, exportChat }: HistoryItemProps) {
  return (
    <div className="group rounded-md text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 overflow-hidden flex justify-between items-center px-2 py-1">
      <a href={`/chat/${item.urlId}`} className="flex w-full relative truncate block">
        {item.description}
        <div className="absolute right-0 z-1 top-0 bottom-0 bg-gradient-to-l from-bolt-elements-background-depth-2 group-hover:from-bolt-elements-background-depth-3 box-content pl-3 to-transparent w-10 flex justify-end group-hover:w-15 group-hover:from-99%">
          <div className="flex items-center p-1 text-bolt-elements-textSecondary opacity-0 group-hover:opacity-100 transition-opacity">
            <WithTooltip tooltip="Export chat">
              <button
                type="button"
                className="i-ph:download-simple scale-110 mr-2 hover:text-bolt-elements-item-contentAccent"
                onClick={(event) => {
                  event.preventDefault();
                  exportChat(item.id);
                }}
                title="Export chat"
              />
            </WithTooltip>
            {onDuplicate && (
              <WithTooltip tooltip="Duplicate chat">
                <button
                  type="button"
                  className="i-ph:copy scale-110 mr-2 hover:text-bolt-elements-item-contentAccent"
                  onClick={() => onDuplicate?.(item.id)}
                  title="Duplicate chat"
                />
              </WithTooltip>
            )}
            <Dialog.Trigger asChild>
              <WithTooltip tooltip="Delete chat">
                <button
                  type="button"
                  className="i-ph:trash scale-110 hover:text-bolt-elements-button-danger-text"
                  onClick={(event) => {
                    event.preventDefault();
                    onDelete?.(event);
                  }}
                />
              </WithTooltip>
            </Dialog.Trigger>
          </div>
        </div>
      </a>
    </div>
  );
}
