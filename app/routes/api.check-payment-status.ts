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

  const url = new URL(request.url);
  const orderNo = url.searchParams.get('orderNo');

  if (!orderNo) {
    return json({ error: '订单号不能为空' }, { status: 400 });
  }

  try {
    const transaction = await db('user_transactions')
      .where('transaction_id', orderNo)
      .where('user_id', userId)
      .first();

    if (!transaction) {
      return json({ error: '订单不存在' }, { status: 404 });
    }

    return json({ status: transaction.status });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return json({ error: '检查支付状态失败' }, { status: 500 });
  }
}
