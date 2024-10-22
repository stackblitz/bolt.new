import { type ActionFunction, json } from '@remix-run/cloudflare';
import { db } from '~/utils/db.server';
import { hashPassword } from '~/utils/auth.server';

export const action: ActionFunction = async ({ request }) => {
  const { username, email, password } = (await request.json()) as { username: string; email: string; password: string };
  
  try {
    const hashedPassword = await hashPassword(password);
    const [userId] = await db('users').insert({
      username,
      email,
      password: hashedPassword
    });
    return json({ success: true, userId });
  } catch (error) {
    console.error('Registration error:', error);
    return json({ success: false, error: 'Registration failed' }, { status: 400 });
  }
};
