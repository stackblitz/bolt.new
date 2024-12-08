import { motion } from 'framer-motion';
import { memo } from 'react';
import { classNames } from '~/utils/classNames';
import '~/styles/components/SettingsSlider.scss';

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
    <div className="settings-slider">
      <motion.div
        className={classNames(
          'settings-slider__thumb',
          isLeftSelected ? 'settings-slider__thumb--left' : 'settings-slider__thumb--right'
        )}
        initial={false}
        animate={{
          x: isLeftSelected ? 0 : '100%',
          opacity: 0.2,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      />
      <button
        onClick={() => setSelected?.(options.left.value)}
        className={classNames(
          'settings-slider__button',
          isLeftSelected ? 'settings-slider__button--selected' : 'settings-slider__button--unselected'
        )}
      >
        {options.left.text}
      </button>
      <button
        onClick={() => setSelected?.(options.right.value)}
        className={classNames(
          'settings-slider__button',
          !isLeftSelected ? 'settings-slider__button--selected' : 'settings-slider__button--unselected'
        )}
      >
        {options.right.text}
      </button>
    </div>
  );
});
