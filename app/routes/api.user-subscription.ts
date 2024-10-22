import { json } from '@remix-run/cloudflare';
import { db } from '~/utils/db.server';
import { requireAuth } from '~/middleware/auth.server';

export async function loader({ request }: { request: Request }) {
    let userId;
    try {
      userId = await requireAuth(request);
    } catch (error) {
      return error as Response;
    }
    
    try {
    const user = await db('users')
      .select('token_balance')
      .where('_id', userId)
      .first();

    const subscription = await db('user_subscriptions')
      .where('user_id', userId)
      .where('expiration_date', '>', db.fn.now())
      .orderBy('expiration_date', 'desc')
      .first();

    const subscriptionPlan = subscription
      ? await db('subscription_plans')
          .where('_id', subscription.plan_id)
          .first()
      : null;

    return json({
      tokenBalance: user.token_balance,
      subscription: subscription
        ? {
            planName: subscriptionPlan.name,
            expirationDate: subscription.expiration_date,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return json({ error: '获取用户订阅信息失败' }, { status: 500 });
  }
}
