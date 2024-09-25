import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { default as IndexRoute } from './_index';
import { loadWithAuth } from '~/lib/.server/auth';

export async function loader(args: LoaderFunctionArgs) {
  return loadWithAuth(args, async (_args, session) => json({ id: args.params.id, avatar: session.avatar }));
}

export default IndexRoute;
