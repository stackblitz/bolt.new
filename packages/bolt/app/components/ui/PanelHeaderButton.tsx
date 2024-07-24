import { memo } from 'react';
import { classNames } from '../../utils/classNames';

interface PanelHeaderButtonProps {
  className?: string;
  disabledClassName?: string;
  disabled?: boolean;
  children: string | JSX.Element | Array<JSX.Element | string>;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const PanelHeaderButton = memo(
  ({ className, disabledClassName, disabled = false, children, onClick }: PanelHeaderButtonProps) => {
    return (
      <button
        className={classNames(
          'flex items-center gap-1.5 px-1.5 rounded-lg py-0.5 bg-transparent hover:bg-white disabled:cursor-not-allowed',
          {
            [classNames('opacity-30', disabledClassName)]: disabled,
          },
          className,
        )}
        disabled={disabled}
        onClick={(event) => {
          if (disabled) {
            return;
          }

          onClick?.(event);
        }}
      >
        {children}
      </button>
    );
  },
);
