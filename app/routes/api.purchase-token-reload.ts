import { json } from '@remix-run/cloudflare';
import { db } from '~/utils/db.server';
import SDPay from '~/utils/SDPay.server';
import { requireAuth } from '~/middleware/auth.server';

export interface PurchaseResponse {
    success: boolean;
    paymentData?: {
      // 根据实际返回的数据结构定义
      no: string;
      pay_type: string;
      order_amount: string;
      qr_img: string;
      expires_in: string;
      // ... 其他可能的字段
    };
    error?: string;
  }

export async function action({ request }: { request: Request }) {
  let userId;
  try {
    userId = await requireAuth(request);
  } catch (error) {
    return error as Response;
  }

  const { packId } = await request.json() as { packId: string };

  try {
    // 获取代币充值包详情
    const pack = await db('token_reloads').where('_id', packId).first();
    if (!pack) {
      return json({ error: '无效的代币充值包' }, { status: 400 });
    }

    // 创建 SDPay 实例
    const sdpay = new SDPay();

    // 生成订单号
    const orderNo = `reload_${Date.now()}_${userId}`;

    // 获取支付数据
    const paymentData = await sdpay.createPayment(
      orderNo,
      `${pack.name} 代币充值`,
      'alipay', // 或其他支付方式
      pack.price * 100, // 转换为分
      userId.toString()
    );

    // 创建待处理的交易记录
    await db('user_transactions').insert({
      user_id: userId,
      type: 'token_reload',
      token_reload_id: packId,
      amount: pack.price,
      tokens: pack.tokens,
      status: 'pending',
      payment_method: 'alipay', // 或其他支付方式
      transaction_id: orderNo,
    });

    return json({ success: true, paymentData });
  } catch (error) {
    console.error('初始化代币充值购买时出错:', error);
    return json({ error: '初始化代币充值购买失败' }, { status: 500 });
  }
}