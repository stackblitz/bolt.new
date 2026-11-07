import { TransformStream as WebStreamsTransformStream } from 'web-streams-polyfill/dist/ponyfill.js';
import { RemixServer } from '@remix-run/react';
import { handleRequest, type EntryContext } from '@vercel/remix';

// Remix 2.10's Node globals polyfill ReadableStream/WritableStream but can
// leave Node's native TransformStream in place. Keep all three stream
// constructors from the same ponyfill so AI SDK response parsing is compatible.
Object.defineProperty(globalThis, 'TransformStream', {
  configurable: true,
  writable: true,
  value: WebStreamsTransformStream,
});

export default async function handleVercelRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const remixServer = <RemixServer context={remixContext} url={request.url} />;

  return handleRequest(request, responseStatusCode, responseHeaders, remixServer);
}
