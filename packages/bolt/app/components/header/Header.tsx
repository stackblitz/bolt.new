import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { OpenStackBlitz } from './OpenStackBlitz.client';

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header
      className={classNames('flex items-center bg-white p-5 border-b h-[var(--header-height)]', {
        'border-transparent': !chat.started,
        'border-gray-200': chat.started,
      })}
    >
      <div className="flex items-center gap-2">
        <a href="/" className="text-2xl font-semibold text-accent">
          <img src="/logo_text.svg" width="60px" alt="Bolt Logo" />
        </a>
      </div>
      <div className="ml-auto flex gap-2">
        <ClientOnly>{() => <OpenStackBlitz />}</ClientOnly>
      </div>
    </header>
  );
}
