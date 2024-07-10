import { memo } from 'react';
import { classNames } from '~/utils/classNames';

type IconSize = 'sm' | 'md' | 'xl';

interface BaseIconButtonProps {
  size?: IconSize;
  className?: string;
  iconClassName?: string;
  disabledClassName?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

type IconButtonWithoutChildrenProps = {
  icon: string;
  children?: undefined;
} & BaseIconButtonProps;

type IconButtonWithChildrenProps = {
  icon?: undefined;
  children: string | JSX.Element | JSX.Element[];
} & BaseIconButtonProps;

type IconButtonProps = IconButtonWithoutChildrenProps | IconButtonWithChildrenProps;

export const IconButton = memo(
  ({
    icon,
    size = 'xl',
    className,
    iconClassName,
    disabledClassName,
    disabled = false,
    onClick,
    children,
  }: IconButtonProps) => {
    return (
      <button
        className={classNames(
          'flex items-center text-gray-600 enabled:hover:text-gray-900 rounded-md p-1 enabled:hover:bg-gray-200/80 disabled:cursor-not-allowed',
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
        {children ? children : <div className={classNames(icon, getIconSize(size), iconClassName)}></div>}
      </button>
    );
  },
);

function getIconSize(size: IconSize) {
  if (size === 'sm') {
    return 'text-sm';
  } else if (size === 'md') {
    return 'text-md';
  } else {
    return 'text-xl';
  }
}
