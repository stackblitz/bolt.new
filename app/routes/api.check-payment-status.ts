import { json } from '@remix-run/cloudflare';
import { db } from '~/utils/db.server';

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const orderNo = url.searchParams.get('orderNo');

  if (!orderNo) {
    return json({ error: 'Order number is required' }, { status: 400 });
  }

  try {
    const transaction = await db('user_transactions')
      .where('transaction_id', orderNo)
      .first();

    if (!transaction) {
      return json({ error: 'Transaction not found' }, { status: 404 });
    }

    return json({ status: transaction.status });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return json({ error: 'Failed to check payment status' }, { status: 500 });
  }
}
