import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';

export const meta: MetaFunction = () => {
  return [{ title: 'Bolt' }, { name: 'description', content: 'Talk with Bolt, an AI assistant from StackBlitz' }];
};

export const loader = () => json({});

export default function Index() {
  return (
    <div className="relative flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
      <div className="absolute top-[-50vh] left-1/2 transform -translate-x-1/2 w-[200vw] h-[100vh] rounded-[50%]"
           style={{
             background: `radial-gradient(
               50% 50% at 50% 50%,
               rgba(26, 139, 157, 0.15) 0%,
               rgba(15, 76, 117, 0.08) 45%,
               rgba(0, 11, 24, 0) 100%
             )`
           }}
      />
      
      {/* Secondary glow effect */}
      <div className="absolute top-[-20vh] left-1/2 transform -translate-x-1/2 w-[150vw] h-[70vh] rounded-[50%]"
           style={{
             background: `radial-gradient(
               50% 50% at 50% 50%,
               rgba(26, 139, 157, 0.1) 0%,
               rgba(15, 76, 117, 0.05) 70%,
               rgba(0, 11, 24, 0) 100%
             )`
           }}
      />
    </div>
  );
}
