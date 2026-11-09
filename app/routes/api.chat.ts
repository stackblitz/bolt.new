import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { getAIConfig } from '~/lib/.server/llm/api-key';
import { MAX_RESPONSE_SEGMENTS } from '~/lib/.server/llm/constants';
import { CHAT_SYSTEM_PROMPT, CONTINUE_PROMPT } from '~/lib/.server/llm/prompts';
import { generateText, type Messages } from '~/lib/.server/llm/stream-text';

const BUILD_RETRY_PROMPT = `
Your previous response did not contain executable Bolt actions, so no project files could be created.
Do not search, browse, narrate, or provide a plan. Immediately complete the user's original project request.
Return ONLY one valid <boltArtifact id="..." title="..."> with at least one complete
<boltAction type="file" filePath="relative/path">FULL FILE CONTENT</boltAction>.
Add shell actions only when required. Do not wrap the tags in Markdown fences.
`;

function isBuildRequest(messages: Messages) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content || '';
  const text = latestUserMessage.trim();

  if (
    !text ||
    /\b(?:how do i|how can i|how to|what is|what are|explain|teach me|tell me how|show me how|why should i)\b/i.test(text)
  ) {
    return false;
  }

  return /\b(?:build|create|make|generate|develop|implement|scaffold|write|program|fix|update|edit|modify|refactor|debug|design)\b|(?:kirkir\w*|gina|samar da|gyara|sabunta|canza|yi min)/i.test(text);
}

function compactChatMessages(messages: Messages): Messages {
  const selected = messages.slice(-10);
  const maxTotalCharacters = 12_000;
  let remaining = maxTotalCharacters;
  const compacted: Messages = [];

  for (let index = selected.length - 1; index >= 0; index -= 1) {
    const message = selected[index];

    if (remaining <= 0) {
      break;
    }

    const content = message.content || '';
    const keptContent = content.length > remaining
      ? content.slice(-remaining)
      : content;

    compacted.unshift({ ...message, content: keptContent });
    remaining -= keptContent.length;
  }

  return compacted;
}

function hasExecutableArtifact(text: string) {
  const artifact = /<boltArtifact\b([^>]*)>([\s\S]*?)<\/boltArtifact>/i.exec(text);

  if (!artifact) {
    return false;
  }

  const attributes = artifact[1];
  const body = artifact[2];
  const hasId = /\bid="[^"]+"/i.test(attributes);
  const hasTitle = /\btitle="[^"]+"/i.test(attributes);
  const hasFileAction =
    /<boltAction\b(?=[^>]*\btype="file")(?=[^>]*\bfilePath="[^"]+")[^>]*>[\s\S]*?<\/boltAction>/i.test(body);
  const hasShellAction =
    /<boltAction\b(?=[^>]*\btype="shell")[^>]*>[\s\S]*?<\/boltAction>/i.test(body);

  return hasId && hasTitle && (hasFileAction || hasShellAction);
}

/**
 * Safe configuration check for the Preview deployment.
 * Never returns or logs the provider API key itself.
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    const env = context.cloudflare?.env;
    const config = getAIConfig(env);
    const url = new URL(request.url);

    // Verify that the configured provider can produce the executable format used by the builder.
    if (url.searchParams.get('probe') === 'build') {
      try {
        const result = await generateText(
          [{
            role: 'user',
            content: 'Create a tiny HTML page that says BeamCore build probe. Return one complete Bolt artifact with one file action for index.html.',
          }],
          env,
          { maxRetries: 0, maxTokens: 1536 },
        );

        const executable = hasExecutableArtifact(result.text);

        return new Response(JSON.stringify({
          ok: executable,
          provider: config.provider,
          model: config.model,
          apiKeyConfigured: true,
          probe: executable ? 'passed' : 'failed',
          artifactDetected: /<boltArtifact\b/i.test(result.text),
          actionDetected: /<boltAction\b/i.test(result.text),
          finishReason: result.finishReason,
          responsePreview: result.text.slice(0, 180),
        }), {
          status: executable ? 200 : 502,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (probeError) {
        const detail = probeError instanceof Error ? probeError.message : String(probeError);
        console.error('[BeamCore] Build protocol probe failed:', probeError);

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

    // Basic provider connectivity probe.
    if (url.searchParams.get('probe') === '1') {
      try {
        const result = await generateText(
          [{ role: 'user', content: 'Reply with exactly OK.' }],
          env,
          { maxRetries: 0, maxTokens: 128 },
        );

        if (!result.text.trim()) {
          throw new Error('The AI provider accepted the request but returned an empty response.');
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

  let providerLabel = 'AI provider';
  const buildRequest = isBuildRequest(messages);

  try {
    const env = context.cloudflare?.env;
    const config = getAIConfig(env);
    providerLabel = config.provider === 'gemini' ? 'Gemini' : config.provider === 'groq' ? 'Groq' : 'OpenRouter';

    // Keep the response as plain text for the existing useChat text protocol.
    // Ordinary questions use a compact prompt/output budget; project builds keep
    // the complete Bolt instructions and a larger output budget.
    let responseText = '';
    let nextMessages: Messages = buildRequest ? [...messages] : compactChatMessages(messages);

    for (let segment = 0; segment < MAX_RESPONSE_SEGMENTS; segment += 1) {
      const result = await generateText(nextMessages, env, {
        maxRetries: 0,
        maxTokens: buildRequest ? 8192 : 1536,
        ...(buildRequest ? {} : { system: CHAT_SYSTEM_PROMPT }),
      });

      responseText += result.text;

      if (!buildRequest || result.finishReason !== 'length' || segment === MAX_RESPONSE_SEGMENTS - 1) {
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

    // If this is a build/edit request, do not accept a status-only answer as success.
    // Retry once with an explicit executable-output instruction.
    if (buildRequest && !hasExecutableArtifact(responseText)) {
      console.warn('[BeamCore] Build response had no executable Bolt actions; retrying once.');

      const retryResult = await generateText(
        [
          ...messages,
          { role: 'assistant', content: responseText },
          { role: 'user', content: BUILD_RETRY_PROMPT },
        ],
        env,
        { maxRetries: 0, maxTokens: 8192 },
      );

      if (hasExecutableArtifact(retryResult.text)) {
        responseText = retryResult.text;
      } else {
        console.error('[BeamCore] Provider retry still returned no executable Bolt actions.', {
          finishReason: retryResult.finishReason,
          responseLength: retryResult.text.length,
        });
        responseText =
          'I could not start this build because Gemini did not return executable file or command actions. No project files were changed. Please try a smaller build request.';
      }
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

    const isRateLimited = /rate limit|too many requests|resource_exhausted|quota|\\b429\\b/i.test(message);
    const retryAfterMatch = message.match(/(?:try again in|retry after|retry in)\\s+(?:(\\d+)h)?(?:(\\d+)m)?([\\d.]+)s/i);
    const responseHeaders =
      error && typeof error === 'object' && 'responseHeaders' in error
        ? (error as { responseHeaders?: Record<string, string> }).responseHeaders
        : undefined;
    const retryAfterHeader = responseHeaders?.['retry-after'] || responseHeaders?.['Retry-After'];
    const retryAfterSeconds = retryAfterHeader
      ? Math.max(1, Math.ceil(Number(retryAfterHeader)))
      : retryAfterMatch
        ? Math.max(
            1,
            Math.ceil(
              Number(retryAfterMatch[1] || 0) * 3600 +
              Number(retryAfterMatch[2] || 0) * 60 +
              Number(retryAfterMatch[3] || 0),
            ),
          )
        : 30;
    const retryAfterText = retryAfterSeconds >= 3600
      ? Math.ceil(retryAfterSeconds / 3600) + ' hour(s)'
      : retryAfterSeconds >= 60
        ? Math.ceil(retryAfterSeconds / 60) + ' minute(s)'
        : retryAfterSeconds + ' seconds';
    const isAuthError = /\\b401\\b|\\b403\\b|api key.*(invalid|not valid)|unauthorized/i.test(message);
    const isModelError = /\\b404\\b|model.*(not found|unsupported)|not supported for this endpoint/i.test(message);
    const isTemporarilyUnavailable = /service unavailable|\\b503\\b|overloaded|temporarily unavailable/i.test(message);
    const userMessage = isRateLimited
      ? providerLabel + ' has reached its current usage quota. Try again in about ' + retryAfterText + ', or increase the provider quota in its billing/rate-limit settings.'
      : isAuthError
        ? providerLabel + ' rejected its API key. Check the corresponding API key in Vercel Environment Variables.'
        : isModelError
          ? 'The configured ' + providerLabel + ' model is unavailable. Check the model setting in Vercel.'
          : isTemporarilyUnavailable
            ? providerLabel + ' is temporarily unavailable. No project files were changed; please retry shortly.'
            : providerLabel + ' could not complete this request. Check the server logs for details.';

    const status = isRateLimited ? 429 : isTemporarilyUnavailable ? 503 : 502;

    return new Response(JSON.stringify({ error: userMessage }), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...(isRateLimited ? { 'Retry-After': String(retryAfterSeconds) } : {}),
      },
    });
  }
}
