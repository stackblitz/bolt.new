import { useStore } from '@nanostores/react';
import { description } from './useChatHistory';

export function ChatDescription() {
  return useStore(description);
}
