import { json } from '@remix-run/cloudflare';
import { db } from '~/lib/db.server';
import { requireUserId } from '~/lib/session.server';

export async function action({ request }) {
  const userId = await requireUserId(request);
  const { planId, billingCycle } = await request.json();

  try {
    // 开始数据库事务
    await db.transaction(async (trx) => {
      // 获取订阅计划详情
      const plan = await trx('subscription_plans').where('_id', planId).first();
      if (!plan) {
        throw new Error('Invalid subscription plan');
      }

      // 计算实际价格和代币数量
      const price = billingCycle === 'yearly' ? plan.price * 10 : plan.price;
      const tokens = billingCycle === 'yearly' ? plan.tokens * 12 : plan.tokens;

      // 创建交易记录
      await trx('user_transactions').insert({
        user_id: userId,
        type: 'subscription',
        plan_id: planId,
        amount: price,
        tokens: tokens,
        status: 'completed', // 假设支付已完成
        payment_method: 'credit_card', // 假设使用信用卡支付
        transaction_id: `sub_${Date.now()}`, // 生成一个简单的交易ID
      });

      // 这里可以添加更多逻辑,如更新用户的订阅状态等
    });

    return json({ success: true, message: '订阅购买成功' });
  } catch (error) {
    console.error('Error purchasing subscription:', error);
    return json({ error: 'Failed to purchase subscription' }, { status: 500 });
  }
}
