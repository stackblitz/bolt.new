import { IconButton } from './ui/IconButton';

export function Header() {
  return (
    <header className="flex items-center bg-white p-4 border-b border-gray-200 h-[var(--header-height)]">
      <div className="flex items-center gap-2">
        <div className="text-2xl font-semibold text-accent">Bolt</div>
      </div>
      <IconButton icon="i-ph:gear-duotone" className="ml-auto" />
    </header>
  );
}
