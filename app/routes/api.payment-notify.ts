import { json } from '@remix-run/cloudflare';
import { db } from '~/utils/db.server';
import SDPay, { type SDNotifyBody } from '~/utils/SDPay.server';

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const notifyParams = Object.fromEntries(formData) as unknown as SDNotifyBody;

  const sdpay = new SDPay();

  if (!sdpay.verifyNotify(notifyParams)) {
    return json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    await db.transaction(async (trx) => {
      // 更新交易状态
      await trx('user_transactions')
        .where('transaction_id', notifyParams.order_no)
        .update({
          status: 'completed',
          _update: db.fn.now(),
        });

      // 获取交易详情
      const transaction = await trx('user_transactions')
        .where('transaction_id', notifyParams.order_no)
        .first();

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // 更新用户的代币余额
      await trx('users')
        .where('_id', transaction.user_id)
        .increment('token_balance', transaction.tokens);
    });

    return json({ success: true });
  } catch (error) {
    console.error('Error processing payment notification:', error);
    return json({ error: 'Failed to process payment notification' }, { status: 500 });
  }
}