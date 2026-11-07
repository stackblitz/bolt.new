import { RemixServer } from '@remix-run/react';
import { handleRequest, type EntryContext } from '@vercel/remix';

export default async function handleVercelRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const remixServer = <RemixServer context={remixContext} url={request.url} />;

  return handleRequest(request, responseStatusCode, responseHeaders, remixServer);
}
