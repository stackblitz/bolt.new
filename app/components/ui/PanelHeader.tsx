import { classNames } from '~/utils/classNames';

interface PanelHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export const PanelHeader = ({ children, className }: PanelHeaderProps) => {
  return (
    <div
      className={classNames(
        'flex items-center bg-bolt-elements-background-depth-2 border-y border-bolt-elements-borderColor gap-1.5 h-[var(--panel-header-height)] p-2',
        className,
      )}
    >
      {children}
    </div>
  );
};
