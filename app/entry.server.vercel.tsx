import { installGlobals } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { handleRequest, type EntryContext } from '@vercel/remix';

// Use Node/Undici's native Fetch and Web Streams on Vercel.
// This keeps the fetch response streams compatible with the AI SDK.
installGlobals({ nativeFetch: true });

export default async function handleVercelRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const remixServer = <RemixServer context={remixContext} url={request.url} />;

  return handleRequest(request, responseStatusCode, responseHeaders, remixServer);
}
