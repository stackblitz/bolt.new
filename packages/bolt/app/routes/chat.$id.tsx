import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { default as IndexRoute } from './_index';
import { handleAuthRequest } from '~/lib/.server/login';

export async function loader(args: LoaderFunctionArgs) {
  return handleAuthRequest(args, { id: args.params.id });
}

export default IndexRoute;
