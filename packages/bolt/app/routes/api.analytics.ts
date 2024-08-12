import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { handleWithAuth } from '~/lib/.server/login';
import { getSession } from '~/lib/.server/sessions';
import { sendEventInternal, type AnalyticsEvent } from '~/lib/analytics';

async function analyticsAction({ request, context }: ActionFunctionArgs) {
  const event: AnalyticsEvent = await request.json();
  const { session } = await getSession(request, context.cloudflare.env);
  const { success, error } = await sendEventInternal(session.data, event);

  if (!success) {
    return json({ error }, { status: 500 });
  }

  return json({ success }, { status: 200 });
}

export async function action(args: ActionFunctionArgs) {
  return handleWithAuth(args, analyticsAction);
}
