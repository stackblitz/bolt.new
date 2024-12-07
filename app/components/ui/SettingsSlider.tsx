import { motion } from 'framer-motion';
import { memo } from 'react';
import { classNames } from '~/utils/classNames';

interface SliderOption<T> {
  value: T;
  text: string;
}

export interface SliderOptions<T> {
  left: SliderOption<T>;
  right: SliderOption<T>;
}

interface SettingsSliderProps<T> {
  selected: T;
  options: SliderOptions<T>;
  setSelected?: (selected: T) => void;
}

export const SettingsSlider = memo(<T,>({ selected, options, setSelected }: SettingsSliderProps<T>) => {
  const isLeftSelected = selected === options.left.value;

  return (
    <div className="relative flex items-center bg-bolt-elements-prompt-background rounded-lg">
      <motion.div
        className={classNames(
          'absolute h-full bg-green-500 transition-all duration-300 rounded-lg',
          isLeftSelected ? 'left-0 w-1/2' : 'right-0 w-1/2'
        )}
        initial={false}
        animate={{
          x: isLeftSelected ? 0 : '100%',
          opacity: 0.2
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
      />
      <button
        onClick={() => setSelected?.(options.left.value)}
        className={classNames(
          'relative z-10 flex-1 p-2 rounded-lg text-sm transition-colors duration-200',
          isLeftSelected ? 'text-white' : 'text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary'
        )}
      >
        {options.left.text}
      </button>
      <button
        onClick={() => setSelected?.(options.right.value)}
        className={classNames(
          'relative z-10 flex-1 p-2 rounded-lg text-sm transition-colors duration-200',
          !isLeftSelected ? 'text-white' : 'text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary'
        )}
      >
        {options.right.text}
      </button>
    </div>
  );
}); 