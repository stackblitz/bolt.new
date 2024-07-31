import { useStore } from '@nanostores/react';
import { useEffect } from 'react';
import { shortcutsStore, type Shortcuts } from '~/lib/stores/settings';

class ShortcutEventEmitter {
  #emitter = new EventTarget();

  dispatch(type: keyof Shortcuts) {
    this.#emitter.dispatchEvent(new Event(type));
  }

  on(type: keyof Shortcuts, cb: VoidFunction) {
    this.#emitter.addEventListener(type, cb);

    return () => {
      this.#emitter.removeEventListener(type, cb);
    };
  }
}

export const shortcutEventEmitter = new ShortcutEventEmitter();

export function useShortcuts(): void {
  const shortcuts = useStore(shortcutsStore);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const { key, ctrlKey, shiftKey, altKey, metaKey } = event;

      for (const name in shortcuts) {
        const shortcut = shortcuts[name as keyof Shortcuts];

        if (
          shortcut.key.toLowerCase() === key.toLowerCase() &&
          (shortcut.ctrlOrMetaKey
            ? ctrlKey || metaKey
            : (shortcut.ctrlKey === undefined || shortcut.ctrlKey === ctrlKey) &&
              (shortcut.metaKey === undefined || shortcut.metaKey === metaKey)) &&
          (shortcut.shiftKey === undefined || shortcut.shiftKey === shiftKey) &&
          (shortcut.altKey === undefined || shortcut.altKey === altKey)
        ) {
          shortcutEventEmitter.dispatch(name as keyof Shortcuts);
          event.preventDefault();
          event.stopPropagation();

          shortcut.action();

          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}
