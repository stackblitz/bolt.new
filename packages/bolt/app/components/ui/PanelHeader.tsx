import { memo } from 'react';
import { classNames } from '~/utils/classNames';

interface PanelHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export const PanelHeader = memo(({ className, children }: PanelHeaderProps) => {
  return (
    <div className={classNames('flex items-center gap-2 bg-gray-50 border-b px-4 py-1 min-h-[34px]', className)}>
      {children}
    </div>
  );
});
