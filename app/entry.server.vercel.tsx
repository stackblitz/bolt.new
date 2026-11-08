import { createReadableStreamFromReadable, type EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { PassThrough } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';

const ABORT_DELAY = 5_000;

export default function handleVercelRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  if (request.method.toUpperCase() === 'HEAD') {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  }

  return new Promise<Response>((resolve, reject) => {
    let shellRendered = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        onShellReady() {
          shellRendered = true;

          const body = new PassThrough({
            final(callback) {
              if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = undefined;
              }

              callback();
            },
          });

          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set('Content-Type', 'text/html; charset=utf-8');
          responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
          responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

          pipe(body);

          resolve(
            new Response(stream, {
              status: responseStatusCode,
              headers: responseHeaders,
            }),
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          console.error('[BeamCore] Vercel SSR render error:', error);

          if (shellRendered) {
            // The response has already started streaming; retain the original status.
            responseStatusCode = 200;
          }
        },
      },
    );

    timeoutId = setTimeout(() => {
      abort();
    }, ABORT_DELAY);
  });
}
