import { useStore } from '@nanostores/react';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { Stackblitz } from '../workbench/Stackblitz';
import { Deploy } from '../workbench/Deploy';
import Download from '../workbench/Download';
import React, { useState, useRef, useEffect } from 'react';

interface HeaderActionButtonsProps {}

export function HeaderActionButtons({}: HeaderActionButtonsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex gap-1 sm:gap-2">
      <div className="hidden sm:block">
        <Download />
      </div>
      <div className="hidden sm:block">
        <Stackblitz />
      </div>
      <div className="hidden sm:block">
        <Deploy />
      </div>

      <div className="relative block sm:hidden" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-transparent p-1.5 rounded-md
                     hover:bg-bolt-elements-item-backgroundActive"
        >
          <div className="i-ph:caret-down text-bolt-elements-textTertiary" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 py-2
                        bg-bolt-elements-background-depth-2 
                        border border-bolt-elements-borderColor 
                        rounded-md shadow-lg z-50">
            <div className="space-y-1">
              <ActionButton>
                <Download />
              </ActionButton>
              <ActionButton>
                <Stackblitz />
              </ActionButton>
              <ActionButton>
                <Deploy />
              </ActionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Mobile action button wrapper
function ActionButton({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full px-2">
      {React.cloneElement(children as React.ReactElement, {
        className: 'w-full justify-start py-2 px-3 hover:bg-bolt-elements-item-backgroundActive rounded-md'
      })}
    </div>
  );
}

interface ButtonProps {
  active?: boolean;
  disabled?: boolean;
  children?: any;
  onClick?: VoidFunction;
}

function Button({ active = false, disabled = false, children, onClick }: ButtonProps) {
  return (
    <button
      className={classNames(
        'flex items-center gap-2 p-1 sm:p-1.5 rounded-md transition-colors duration-150', 
        {
          'bg-bolt-elements-item-backgroundDefault hover:bg-bolt-elements-item-backgroundActive text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary':
            !active,
          'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent': active && !disabled,
          'bg-bolt-elements-item-backgroundDefault text-alpha-gray-20 dark:text-alpha-white-20 cursor-not-allowed':
            disabled,
        })}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
