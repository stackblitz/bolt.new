import WithTooltip from '~/components/ui/Tooltip';
import { IconButton } from '~/components/ui/IconButton';
import React from 'react';

export const ExportChatButton = ({ exportChat }: { exportChat?: () => void }) => {
  return (
    <WithTooltip tooltip="Export Chat">
      <IconButton title="Export Chat" onClick={() => exportChat?.()}>
        <div className="i-ph:download-simple text-xl"></div>
      </IconButton>
    </WithTooltip>
  );
};
