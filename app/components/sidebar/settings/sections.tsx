import { Button } from "~/components/ui/button";
import type { NetlifyUser } from "~/types/netlify";
import { useStore } from '@nanostores/react';
import { themeStore, toggleTheme } from '~/lib/stores/theme';
import { useEffect, useState } from 'react';

export type Section = 'general' | 'appearance' | 'editor' | 'tokens' | 'applications';

export interface SectionContent {
  title: string;
  description?: string;
  content: React.ReactNode;
}

interface SectionsProps {
  netlifyUser: NetlifyUser | null;
  onNetlifyConnect: () => void;
  onNetlifyDisconnect: () => void;
}

export const createSections = ({ netlifyUser, onNetlifyConnect, onNetlifyDisconnect }: SectionsProps): Record<Section, SectionContent> => {
  const ThemeSelector = () => {
    const theme = useStore(themeStore);
    const [domLoaded, setDomLoaded] = useState(false);

    useEffect(() => {
      setDomLoaded(true);
    }, []);

    if (!domLoaded) return null;

    return (
      <select 
        className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white"
        value={theme}
        onChange={(e) => {
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(e.target.value);
          themeStore.set(e.target.value as 'light' | 'dark');
        }}
      >
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    );
  };

  return {
    general: {
      title: "Chat",
      content: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Delete all chats</p>
            </div>
            <Button className="bg-red-600/20 hover:bg-red-600/50 text-red-500 px-4 py-2 rounded-md">
              Delete
            </Button>
          </div>
        </div>
      )
    },
    appearance: {
      title: "Appearance",
      description: "Customize the look and feel of your workspace",
      content: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-bolt-elements-textPrimary text-sm">Theme</h3>
              <p className="text-gray-400 text-sm">Choose your preferred theme</p>
            </div>
            <ThemeSelector />
          </div>
        </div>
      )
    },
    editor: {
      title: "Editor Settings",
      description: "Customize your coding environment",
      content: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-bolt-elements-textPrimary text-sm">Font Size</h3>
              <p className="text-gray-400 text-sm">Adjust the editor font size</p>
            </div>
            <input
              type="number"
              min="8"
              max="24"
              className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white w-20"
              defaultValue="14"
            />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-bolt-elements-textPrimary text-sm">Tab Size</h3>
              <p className="text-gray-400 text-sm">Number of spaces for tabs</p>
            </div>
            <select className="bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white">
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
            </select>
          </div>
        </div>
      )
    },
    tokens: {
      title: "Tokens",
      description: "Monitor your token usage",
      content: (
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-bolt-elements-textPrimary">405,000 tokens used</span>
                <span className="text-bolt-elements-textTertiary">1,000,000 total</span>
              </div>
              <div className="w-full h-2 bg-bolt-elements-background-depth-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-bolt-elements-button-primary-background rounded-full"
                  style={{ width: '40.5%' }} // 405k/1M = 40.5%
                />
              </div>
              <p className="text-xs text-bolt-elements-textTertiary">
                595,000 tokens remaining
              </p>
            </div>
          </div>
        </div>
      )
    },
    applications: {
      title: "Applications",
      description: "Connect and manage your external applications",
      content: (
        <div className="space-y-6">
          <div className="flex gap-2 justify-between items-start">
            <div className="flex flex-col items-start gap-3">
              <span className="text-bolt-elements-textPrimary">Netlify</span>
              <span className="text-bolt-elements-textTertiary text-sm max-w-[80%]">Connect your Netlify account to enable deployments from Bolt</span>
            </div>
            {netlifyUser ? (
              <div className="flex gap-2">
                <Button 
                  onClick={onNetlifyDisconnect}
                  className="bg-red-600/20 hover:bg-red-600/50 text-red-500 px-4 py-2 rounded-md"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button 
                onClick={onNetlifyConnect}
                className="bg-bolt-elements-button-primary-background hover:bg-[#0066FF]/90 text-white px-8 py-2 rounded-md"
              >
                Connect
              </Button>
            )}
          </div>
        </div>
      )
    }
  };
};