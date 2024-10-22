import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { useState } from 'react';
import { LoginDialog } from '~/components/auth/LoginDialog';
import { RegisterDialog } from '~/components/auth/RegisterDialog';
import { useAuth } from '~/hooks/useAuth';
import { Avatar } from '~/components/ui/Avatar';

export function Header() {
  const chat = useStore(chatStore);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  return (
    <header
      className={classNames(
        'flex items-center justify-between bg-bolt-elements-background-depth-1 p-5 border-b h-[var(--header-height)]',
        {
          'border-transparent': !chat.started,
          'border-bolt-elements-borderColor': chat.started,
        },
      )}
    >
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer">
        <div className="i-ph:sidebar-simple-duotone text-xl" />
        <a href="/" className="text-2xl font-semibold text-accent flex items-center">
          <span className="text-2xl font-bold">多八多</span>
        </a>
      </div>
      <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
        <ClientOnly>{() => <ChatDescription />}</ClientOnly>
      </span>
      <div className="flex items-center gap-4">
        {chat.started && (
          <ClientOnly>
            {() => (
              <div className="mr-1">
                <HeaderActionButtons />
              </div>
            )}
          </ClientOnly>
        )}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            <Avatar src={user.avatarUrl} alt={user.nickname} />
            <span className="text-sm font-medium text-bolt-elements-textPrimary">{user.nickname}</span>
          </div>
        ) : (
          <>
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="px-4 py-2 text-sm font-medium text-bolt-elements-button-secondary-text bg-bolt-elements-button-secondary-background hover:bg-bolt-elements-button-secondary-backgroundHover rounded-md transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-elements-button-secondary-background"
            >
              登录
            </button>
            <button 
              onClick={() => setIsRegisterOpen(true)}
              className="px-4 py-2 text-sm font-medium text-bolt-elements-button-primary-text bg-bolt-elements-button-primary-background hover:bg-bolt-elements-button-primary-backgroundHover rounded-md transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-elements-button-primary-background"
            >
              注册
            </button>
          </>
        )}
      </div>

      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <RegisterDialog isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </header>
  );
}
