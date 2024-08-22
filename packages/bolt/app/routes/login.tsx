import {
  json,
  redirect,
  redirectDocument,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@remix-run/cloudflare';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { LoadingDots } from '~/components/ui/LoadingDots';
import { createUserSession, isAuthenticated, validateAccessToken } from '~/lib/.server/sessions';
import { identifyUser } from '~/lib/analytics';
import { CLIENT_ID, CLIENT_ORIGIN } from '~/lib/constants';
import { request as doRequest } from '~/lib/fetch';
import { auth, type AuthAPI } from '~/lib/webcontainer/auth.client';
import { logger } from '~/utils/logger';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { session, response } = await isAuthenticated(request, context.cloudflare.env);

  if (session != null) {
    return redirect('/', response);
  }

  const url = new URL(request.url);

  return json(
    {
      redirected: url.searchParams.has('code') || url.searchParams.has('error'),
    },
    response,
  );
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();

  const payload = {
    access: String(formData.get('access')),
    refresh: String(formData.get('refresh')),
  };

  let response: Awaited<ReturnType<typeof doRequest>> | undefined;

  try {
    response = await doRequest(`${CLIENT_ORIGIN}/oauth/token/info`, {
      headers: { authorization: `Bearer ${payload.access}` },
    });

    if (!response.ok) {
      throw await response.json();
    }
  } catch (error) {
    logger.warn('Authentication failed');
    logger.warn(error);

    return json({ error: 'invalid-token' as const }, { status: 401 });
  }

  const boltEnabled = validateAccessToken(payload.access);

  if (!boltEnabled) {
    return json({ error: 'bolt-access' as const }, { status: 401 });
  }

  const identity = await identifyUser(payload.access);

  const tokenInfo: { expires_in: number; created_at: number } = await response.json();

  const init = await createUserSession(request, context.cloudflare.env, { ...payload, ...tokenInfo }, identity);

  return redirectDocument('/', init);
}

type LoginState =
  | {
      kind: 'error';
      error: string;
      description: string;
    }
  | { kind: 'pending' };

const ERRORS = {
  'bolt-access': 'You do not have access to Bolt.',
  'invalid-token': 'Authentication failed.',
};

export default function Login() {
  const { redirected } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (!import.meta.hot?.data.wcAuth) {
      auth.init({ clientId: CLIENT_ID, scope: 'public', editorOrigin: CLIENT_ORIGIN });
    }

    if (import.meta.hot) {
      import.meta.hot.data.wcAuth = true;
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {redirected ? (
        <LoadingDots text="Authenticating" />
      ) : (
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-lg shadow">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Login</h2>
          </div>
          <LoginForm />
          <p className="mt-4 text-sm text-center text-gray-600">
            By using Bolt, you agree to the collection of usage data for analytics.
          </p>
        </div>
      )}
    </div>
  );
}

function LoginForm() {
  const [login, setLogin] = useState<LoginState | null>(null);

  const fetcher = useFetcher<typeof action>();

  useEffect(() => {
    auth.logout({ ignoreRevokeError: true });
  }, []);

  useEffect(() => {
    if (fetcher.data?.error) {
      auth.logout({ ignoreRevokeError: true });

      setLogin({
        kind: 'error' as const,
        ...{ error: fetcher.data.error, description: ERRORS[fetcher.data.error] },
      });
    }
  }, [fetcher.data]);

  async function attemptLogin() {
    startAuthFlow();

    function startAuthFlow() {
      auth.startAuthFlow({ popup: true });

      Promise.race([authEvent(auth, 'auth-failed'), auth.loggedIn()]).then((error) => {
        if (error) {
          setLogin({ kind: 'error', ...error });
        } else {
          onTokens();
        }
      });
    }

    async function onTokens() {
      const tokens = auth.tokens()!;

      fetcher.submit(tokens, {
        method: 'POST',
      });

      setLogin({ kind: 'pending' });
    }
  }

  return (
    <>
      <button
        className="w-full text-white bg-accent-600 hover:bg-accent-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        onClick={attemptLogin}
        disabled={login?.kind === 'pending'}
      >
        {login?.kind === 'pending' ? 'Authenticating...' : 'Continue with StackBlitz'}
      </button>
      {login?.kind === 'error' && (
        <div>
          <h2>
            <code>{login.error}</code>
          </h2>
          <p>{login.description}</p>
        </div>
      )}
    </>
  );
}

interface AuthError {
  error: string;
  description: string;
}

function authEvent(auth: AuthAPI, event: 'logged-out'): Promise<void>;
function authEvent(auth: AuthAPI, event: 'auth-failed'): Promise<AuthError>;
function authEvent(auth: AuthAPI, event: 'logged-out' | 'auth-failed') {
  return new Promise((resolve) => {
    const unsubscribe = auth.on(event as any, (arg: any) => {
      unsubscribe();
      resolve(arg);
    });
  });
}
