import { installGlobals } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { handleRequest, type EntryContext } from '@vercel/remix';

// Use Undici/native Fetch so the response body stream and TransformStream
// constructors come from the same Node Web Streams implementation.
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
