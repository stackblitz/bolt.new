import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type TypedResponse,
} from '@remix-run/cloudflare';
import { Form, useActionData } from '@remix-run/react';
import { verifyPassword } from '../lib/.server/login';
import { createUserSession, isAuthenticated } from '../lib/.server/sessions';

interface Errors {
  password?: string;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const authenticated = await isAuthenticated(request, context.cloudflare.env);

  if (authenticated) {
    return redirect('/');
  }

  return json({});
}

export async function action({ request, context }: ActionFunctionArgs): Promise<TypedResponse<{ errors?: Errors }>> {
  const formData = await request.formData();
  const password = String(formData.get('password'));

  const errors: Errors = {};

  if (!password) {
    errors.password = 'Please provide a password';
  }

  if (!verifyPassword(password, context.cloudflare.env)) {
    errors.password = 'Invalid password';
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors });
  }

  return redirect('/', await createUserSession(request, context.cloudflare.env));
}

export default function Login() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Login</h2>
        </div>
        <Form className="mt-8 space-y-6" method="post" noValidate>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="off"
              data-1p-ignore
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none"
              placeholder="Password"
            />
            {actionData?.errors?.password ? (
              <em className="flex items-center space-x-1.5 p-2 mt-2 bg-negative-200 text-negative-600 rounded-lg">
                <div className="i-ph:x-circle text-xl"></div>
                <span>{actionData?.errors.password}</span>
              </em>
            ) : null}
          </div>
          <div>
            <button
              type="submit"
              className="w-full text-white bg-accent-600 hover:bg-accent-700 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
              Login
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
