import { RemixServer } from '@remix-run/react';
import { handleRequest, type EntryContext } from '@vercel/remix';

/**
 * Vercel-specific Remix server entry.
 *
 * The default BeamCore entry.server.tsx is tailored to Cloudflare's streaming
 * runtime. Vercel provides its own handler to adapt Remix SSR to Vercel
 * Functions, so keep the Cloudflare entry untouched and use this one only
 * for Vercel builds.
 */
export default function handleVercelRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const remixServer = <RemixServer context={remixContext} url={request.url} />;

  return handleRequest(request, responseStatusCode, responseHeaders, remixServer);
}
