import { json, redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '../components/chat/BaseChat';
import { Chat } from '../components/chat/Chat.client';
import { Header } from '../components/Header';
import { isAuthenticated } from '../lib/.server/sessions';

export const meta: MetaFunction = () => {
  return [{ title: 'Bolt' }, { name: 'description', content: 'Talk with Bolt, an AI assistant from StackBlitz' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticated = await isAuthenticated(request, context.cloudflare.env);

  if (import.meta.env.DEV || authenticated) {
    return json({});
  }

  return redirect('/login');
}

export default function Index() {
  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
    </div>
  );
}
