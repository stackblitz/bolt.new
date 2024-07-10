import { AnimatePresence, cubicBezier, motion } from 'framer-motion';

interface SendButtonProps {
  show: boolean;
  onClick?: VoidFunction;
}

const customEasingFn = cubicBezier(0.4, 0, 0.2, 1);

export function SendButton({ show, onClick }: SendButtonProps) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.button
          className="absolute flex justify-center items-center top-[18px] right-[22px] p-1 bg-accent hover:brightness-110 color-white rounded-md w-[34px] h-[34px]"
          transition={{ ease: customEasingFn, duration: 0.17 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          onClick={(event) => {
            event.preventDefault();
            onClick?.();
          }}
        >
          <div className="i-ph:arrow-right text-xl"></div>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
