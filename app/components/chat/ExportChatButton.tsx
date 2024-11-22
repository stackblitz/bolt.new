import WithTooltip from '~/components/ui/Tooltip';
import { IconButton } from '~/components/ui/IconButton';
import { exportChat } from '~/utils/chatExport';
import React from 'react';
import type { Message } from 'ai';

export const ExportChatButton = ({description, messages}: {description: string, messages: Message[]}) => {
  return (<WithTooltip tooltip="Export Chat">
    <IconButton
      title="Export Chat"
      onClick={() => exportChat(messages || [], description)}
    >
      <div className="i-ph:download-simple text-xl"></div>
    </IconButton>
  </WithTooltip>);
}
