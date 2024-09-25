import { map } from 'nanostores';
import { workbenchStore } from './workbench';

export interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  ctrlOrMetaKey?: boolean;
  action: () => void;
}

export interface Shortcuts {
  toggleTerminal: Shortcut;
}

export interface Settings {
  shortcuts: Shortcuts;
}

export const shortcutsStore = map<Shortcuts>({
  toggleTerminal: {
    key: 'j',
    ctrlOrMetaKey: true,
    action: () => workbenchStore.toggleTerminal(),
  },
});

export const settingsStore = map<Settings>({
  shortcuts: shortcutsStore.get(),
});

shortcutsStore.subscribe((shortcuts) => {
  settingsStore.set({
    ...settingsStore.get(),
    shortcuts,
  });
});
