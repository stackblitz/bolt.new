import { json } from '@remix-run/cloudflare';
import { db } from '~/utils/db.server';

export async function loader() {
  try {
    const plans = await db.select().from('subscription_plans').where('is_active', true);
    return json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return json({ error: 'Failed to fetch subscription plans' }, { status: 500 });
  }
}
