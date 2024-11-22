import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

const WithTooltip = ({ tooltip, children, sideOffset = 5, className = '', arrowClassName = '', tooltipStyle = {} }) => {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        {children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className={`bg-bolt-elements-tooltip-background text-bolt-elements-textPrimary px-3 py-2 rounded-lg text-sm shadow-lg ${className}`}
          sideOffset={sideOffset}
          style={{ zIndex: 2000, backgroundColor: "white", ...tooltipStyle }}
        >
          {tooltip}
          <Tooltip.Arrow className={`fill-bolt-elements-tooltip-background ${arrowClassName}`} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};

export default WithTooltip;
