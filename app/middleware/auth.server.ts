import { json } from '@remix-run/cloudflare';
import { verifyToken } from '~/utils/auth.server';

export async function requireAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    throw json({ error: '缺少授权头' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    throw json({ error: '无效的令牌' }, { status: 401 });
  }

  return payload.userId;
}
