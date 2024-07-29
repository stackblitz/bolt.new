import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { logout } from '~/lib/.server/sessions';

export async function loader({ request, context }: LoaderFunctionArgs) {
  return logout(request, context.cloudflare.env);
}

export default function Logout() {
  return '';
}
