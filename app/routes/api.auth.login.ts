import { json } from '@remix-run/cloudflare';
import { type ActionFunction } from '@remix-run/node';
import { verifyLogin, createToken } from '~/utils/auth.server';

export const action: ActionFunction = async ({ request }) => {
  const { email, password } = (await request.json()) as { email: string; password: string };
  
  const user = await verifyLogin(email, password);
  if (!user) {
    return json({ success: false, error: 'Invalid credentials' }, { status: 400 });
  }
  
  const token = createToken(user._id.toString());
  return json({ success: true, token });
};
