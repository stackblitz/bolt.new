import { Menu, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useAuth } from '~/hooks/useAuth';
import { Avatar } from '~/components/ui/Avatar';
import { ProfileDialog } from '~/components/auth/ProfileDialog';
import { SubscriptionDialog } from '~/components/auth/SubscriptionDialog';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex items-center gap-x-1.5 rounded-md bg-bolt-elements-background-depth-1 px-3 py-2 text-sm font-medium text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-elements-button-primary-background">
            <Avatar src={user.avatarUrl} alt={user.nickname} />
            <span className="ml-2">{user.nickname}</span>
            <div className="i-ph:caret-down-fill text-bolt-elements-textSecondary" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-bolt-elements-background-depth-1 shadow-lg ring-1 ring-bolt-elements-borderColor focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setIsProfileOpen(true)}
                    className={`${
                      active ? 'bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary' : 'text-bolt-elements-textSecondary'
                    } block w-full text-left px-4 py-2 text-sm transition-colors duration-150 ease-in-out`}
                  >
                    个人信息
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setIsSubscriptionOpen(true)}
                    className={`${
                      active ? 'bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary' : 'text-bolt-elements-textSecondary'
                    } block w-full text-left px-4 py-2 text-sm transition-colors duration-150 ease-in-out`}
                  >
                    订阅信息
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={logout}
                    className={`${
                      active ? 'bg-bolt-elements-background-depth-2 text-bolt-elements-textPrimary' : 'text-bolt-elements-textSecondary'
                    } block w-full text-left px-4 py-2 text-sm transition-colors duration-150 ease-in-out`}
                  >
                    退出登录
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      <ProfileDialog isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SubscriptionDialog isOpen={isSubscriptionOpen} onClose={() => setIsSubscriptionOpen(false)} />
    </>
  );
}
