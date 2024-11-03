import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { ProviderSelector } from '../chat/ProviderSelector';
import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { createClient } from '~/utils/supabase.client';
import { Link, useLoaderData } from '@remix-run/react';
import AuthComponent from '~/components/auth/Auth';
import { useState, useEffect } from 'react';
import { Modal } from '~/components/ui/Modal';
import { Button } from '../ui/button';
import { useAuth } from '~/lib/hooks/useAuth';

export function Header() {
  const chat = useStore(chatStore);
  const { user, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <header
      className={classNames(
        'flex items-center justify-between gap-2 p-5 border-b h-[var(--header-height)] z-20',
        {
          'border-transparent': !chat.started,
          'border-bolt-elements-borderColor': chat.started,
        },
      )}
    >
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer">
        <a href="/" className="text-2xl font-semibold text-accent flex items-center">
          <span className="i-bolt:logo-text?mask w-[46px] inline-block" />
        </a>
      </div>
      <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
        <ClientOnly>{() => <ChatDescription />}</ClientOnly>
      </span>
      <div className="flex items-center gap-4">
        {/* <ClientOnly>{() => <ProviderSelector />}</ClientOnly> */}
        {chat.started && (
          <ClientOnly>
            {() => (
              <div className="mr-1 flex">
                <HeaderActionButtons />
              </div>
            )}
          </ClientOnly>
        )}
      </div>
      <ClientOnly>
        {() => (
          <>
            {!user && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-transparent hover:scale text-bolt-elements-textPrimary font-bold py-2 px-4 rounded"
              >
                Log In
              </button>
            )}
          </>
        )}
      </ClientOnly>
      <ClientOnly>
        {() => (
          <Modal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)}>
            <AuthComponent onClose={() => setIsAuthModalOpen(false)} />
          </Modal>
        )}
      </ClientOnly>
    </header>
  );
}
