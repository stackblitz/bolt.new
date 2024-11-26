import { Button } from "../../ui/button";
import { Modal } from "../../ui/Modal";
import { useState, useCallback, useEffect } from "react";
import { Settings as SettingsIcon, X, Link, Code, Paintbrush, Timer, Coins } from "lucide-react";
import type { NetlifyUser, NetlifyApiResponse } from "../../../types/netlify";
import { createSections, type Section } from "./sections";
import { IconButton } from "~/components/ui/IconButton";

interface SettingsProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function Settings({ isOpen = false, onOpenChange }: SettingsProps) {
    const [activeSection, setActiveSection] = useState<Section>('general');
    const [netlifyUser, setNetlifyUser] = useState<NetlifyUser | null>(null);

    const fetchNetlifyUser = useCallback(async () => {
        try {
            const response = await fetch('/api/netlify?action=user');
            const data = await response.json() as NetlifyApiResponse;
            setNetlifyUser(data.user);
        } catch (error) {
            console.error('Error fetching Netlify user:', error);
            setNetlifyUser(null);
        }
    }, []);

    const handleNetlifyDisconnect = useCallback(async () => {
        try {
            await fetch('/api/netlify?action=disconnect', { method: 'POST' });
            setNetlifyUser(null);
        } catch (error) {
            console.error('Error disconnecting from Netlify:', error);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNetlifyUser();
        }
    }, [isOpen, fetchNetlifyUser]);

    const handleNetlifyConnect = useCallback(() => {
        const state = crypto.randomUUID();
        localStorage.setItem('netlifyState', state);

        const authUrl = new URL('https://app.netlify.com/authorize');
        authUrl.searchParams.append('client_id', import.meta.env.VITE_NETLIFY_CLIENT_ID);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('redirect_uri', `${window.location.origin}/connect/netlify`);
        authUrl.searchParams.append('state', state);

        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
            authUrl.toString(),
            'Connect Netlify',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        let popupClosed = false;
        const timer = setInterval(async () => {
            if (popup?.closed && !popupClosed) {
                popupClosed = true;
                clearInterval(timer);
                localStorage.removeItem('netlifyState');
                
                // Add delay to ensure token is saved
                await new Promise(resolve => setTimeout(resolve, 1000));
                await fetchNetlifyUser();
                
                console.log('Popup closed, user data fetched');
            }
        }, 5000);

        return () => {
            clearInterval(timer);
        };
    }, [fetchNetlifyUser]);

    const sections = createSections({
        netlifyUser,
        onNetlifyConnect: handleNetlifyConnect,
        onNetlifyDisconnect: handleNetlifyDisconnect
    });

    return (
        <div className="flex items-center gap-0">
            <IconButton
                className="ml-auto"
                icon={'i-ph:gear-duotone'}
                size="xl"
                title="Settings"
                onClick={() => onOpenChange?.(true)}
            />
            <Modal 
                isOpen={isOpen} 
                onClose={() => onOpenChange?.(false)}
            >
                <div className="h-[400px] min-w-[700px] max-w-[700px] max-h-[85vh] bg-bolt-elements-background-depth-1 w-full rounded-lg flex font-light text-bolt-elements-textPrimary text-md">
                    {/* Sidebar */}
                        <nav className="bg-bolt-elements-background-depth-1 border-r border-bolt-elements-borderColor p-4 min-w-[25%] space-y-1.5 rounded-l-lg font-normal">
                            <button
                                onClick={() => setActiveSection('general')}
                                className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm transition-colors ${
                                    activeSection === 'general' 
                                        ? 'bg-bolt-elements-item-backgroundActive' 
                                        : 'bg-transparent hover:bg-bolt-elements-item-backgroundActive'
                                }`}
                            >
                                <span className="i-ph:gear-six-duotone scale-120"></span>
                                <span>General</span>
                            </button>
                            <button
                                onClick={() => setActiveSection('appearance')}
                                className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm transition-colors ${
                                    activeSection === 'appearance' 
                                        ? 'bg-bolt-elements-item-backgroundActive' 
                                        : 'bg-transparent hover:bg-bolt-elements-item-backgroundActive'
                                }`}
                            >
                                <span className="i-ph:paint-brush-fill scale-120"></span>
                                <span>Appearance</span>
                            </button>
                            <button
                                onClick={() => setActiveSection('editor')}
                                className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm transition-colors ${
                                    activeSection === 'editor' 
                                        ? 'bg-bolt-elements-item-backgroundActive' 
                                        : 'bg-transparent hover:bg-bolt-elements-item-backgroundActive'
                                }`}
                            >
                                <span className="i-ph:code-simple scale-120"></span>
                                <span>Editor</span>
                            </button>
                            <button
                                onClick={() => setActiveSection('tokens')}
                                className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm transition-colors ${
                                    activeSection === 'tokens' 
                                        ? 'bg-bolt-elements-item-backgroundActive' 
                                        : 'bg-transparent hover:bg-bolt-elements-item-backgroundActive'
                                }`}
                            >
                                <span className="i-ph:coin-vertical scale-120"></span>
                                <span>Tokens</span>
                            </button>
                            <button
                                onClick={() => setActiveSection('applications')}
                                className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm transition-colors ${
                                    activeSection === 'applications' 
                                        ? 'bg-bolt-elements-item-backgroundActive' 
                                        : 'bg-transparent hover:bg-bolt-elements-item-backgroundActive'
                                }`}
                            >
                                <span className="i-ph:link-light scale-120"></span>
                                <span>Applications</span>
                            </button>
                        </nav>

                    {/* Content */}
                    <div className="flex items-start justify-center w-full p-6 bg-bolt-elements-background-depth-2 rounded-r-lg text-lg font-medium">
                        <div className="space-y-6 w-full">
                            <div>
                                <h1 className="text-bolt-elements-textPrimary">
                                    {sections[activeSection as Section].title}
                                </h1>
                                <p className="text-bolt-elements-textTertiary mt-1 text-sm">
                                    {sections[activeSection as Section].description}
                                </p>
                            </div>
                            <div className="font-normal text-sm">
                                {sections[activeSection as Section].content}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

// Sidebar Button Component
interface SidebarButtonProps {
    icon: React.ReactNode;
    text: string;
    isActive: boolean;
    onClick: () => void;
}

function SidebarButton({ icon, text, isActive, onClick }: SidebarButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                isActive 
                    ? 'bg-zinc-800/90 text-white' 
                    : 'text-gray-400 hover:bg-zinc-800/50 hover:text-white'
            }`}
        >
            {icon}
            <span>{text}</span>
        </button>
    );
}