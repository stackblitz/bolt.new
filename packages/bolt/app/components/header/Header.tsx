import { ClientOnly } from 'remix-utils/client-only';
import { OpenStackBlitz } from './OpenStackBlitz.client';

export function Header() {
  return (
    <header className="flex items-center bg-white p-4 border-b border-gray-200 h-[var(--header-height)]">
      <div className="flex items-center gap-2">
        <div className="text-2xl font-semibold text-accent">Bolt</div>
      </div>
      <div className="ml-auto">
        <ClientOnly>{() => <OpenStackBlitz />}</ClientOnly>
      </div>
    </header>
  );
}
