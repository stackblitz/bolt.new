import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { getAIConfig } from '~/lib/.server/llm/api-key';
import { MAX_RESPONSE_SEGMENTS } from '~/lib/.server/llm/constants';
import { CONTINUE_PROMPT } from '~/lib/.server/llm/prompts';
import { generateText, type Messages } from '~/lib/.server/llm/stream-text';

/**
 * Safe configuration check for the Preview deployment.
 * Never returns or logs the provider API key itself.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const config = getAIConfig();
    const url = new URL(request.url);

    // A safe, server-side provider probe. It never exposes the API key.
    if (url.searchParams.get('probe') === '1') {
      try {
        const result = await generateText(
          [{ role: 'user', content: 'Reply with exactly OK.' }],
          undefined,
          { maxRetries: 0, maxTokens: 8 },
        );

        if (!result.text.trim()) {
          throw new Error('Groq accepted the request but returned an empty response.');
        }

        return new Response(JSON.stringify({
          ok: true,
          provider: config.provider,
          model: config.model,
          apiKeyConfigured: true,
          probe: 'passed',
          responseReceived: true,
          responseLength: result.text.length,
          responsePreview: result.text.slice(0, 80),
        }), { headers: { 'Content-Type': 'application/json' } });
      } catch (probeError) {
        const detail = probeError instanceof Error ? probeError.message : String(probeError);
        console.error('[BeamCore] AI provider probe failed:', probeError);

        return new Response(JSON.stringify({
          ok: false,
          provider: config.provider,
          model: config.model,
          apiKeyConfigured: true,
          probe: 'failed',
          detail,
        }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      provider: config.provider,
      model: config.model,
      apiKeyConfigured: Boolean(config.apiKey),
    }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI provider configuration is unavailable.';
    console.error('[BeamCore] AI configuration check failed:', message);

    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function action(args: ActionFunctionArgs) {
  return chatAction(args);
}

async function chatAction({ context, request }: ActionFunctionArgs) {
  let messages: Messages;

  try {
    const body = await request.json<{ messages: Messages }>();
    messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'A non-empty messages array is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'The chat request body must be valid JSON.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // Use the non-streaming provider API here because Remix's Web Stream
    // polyfill conflicts with the stream parser in this version of the AI SDK.
    // The UI still receives the same plain-text response format, after generation completes.
    let responseText = '';
    let nextMessages: Messages = [...messages];

    for (let segment = 0; segment < MAX_RESPONSE_SEGMENTS; segment += 1) {
      const result = await generateText(nextMessages, context.cloudflare?.env, {
        maxRetries: 0,
      });

      responseText += result.text;

      if (result.finishReason !== 'length' || segment === MAX_RESPONSE_SEGMENTS - 1) {
        break;
      }

      nextMessages = [
        ...nextMessages,
        { role: 'assistant', content: result.text },
        { role: 'user', content: CONTINUE_PROMPT },
      ];
    }

    if (!responseText.trim()) {
      throw new Error('The AI provider returned an empty response.');
    }

    return new Response(responseText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown chat route error';
    console.error('[BeamCore] Chat route failed:', error);

    const isRateLimited = /rate limit|too many requests|\b429\b/i.test(message);
    const retryAfterMatch = message.match(/try again in\s+([\d.]+)\s*s/i);
    const retryAfterSeconds = retryAfterMatch
      ? Math.max(1, Math.ceil(Number(retryAfterMatch[1])))
      : 10;
    const userMessage = isRateLimited
      ? `Groq is temporarily at its token limit. Please wait ${retryAfterSeconds} seconds, then try again.`
      : 'The AI service could not complete this request. Please try again.';

    return new Response(JSON.stringify({ error: userMessage }), {
      status: isRateLimited ? 429 : 502,
      headers: {
        'Content-Type': 'application/json',
        ...(isRateLimited ? { 'Retry-After': String(retryAfterSeconds) } : {}),
      },
    });
  }
}
