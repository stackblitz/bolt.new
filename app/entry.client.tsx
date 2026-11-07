import { RemixBrowser } from '@remix-run/react';
import { startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';

// The Cloudflare entry.server.tsx wraps the Remix document in #root.
// Vercel's document entry renders the full HTML document, so hydrate the
// document itself there (Remix's standard document hydration target).
const hydrationTarget =
  import.meta.env.VITE_DEPLOY_TARGET === 'vercel' ? document : document.getElementById('root')!;

startTransition(() => {
  hydrateRoot(hydrationTarget, <RemixBrowser />);
});
