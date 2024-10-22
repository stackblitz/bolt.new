import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { validatePhoneNumber } from '~/utils/validation';
import { db } from '~/utils/db.server';
import { hashPassword } from '~/utils/auth.server';

export const action: ActionFunction = async ({ request }) => {
  const { phone, password } = await request.json() as { phone: string, password: string };

  if (!validatePhoneNumber(phone)) {
    return json({ error: '无效的手机号码' }, { status: 400 });
  }

  try {
    const existingUser = await db('users').where({ phone }).first();
    if (existingUser) {
      return json({ error: '该手机号已被注册' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const [userId] = await db('users').insert({
      phone,
      password: hashedPassword
    });

    return json({ success: true, userId });
  } catch (error) {
    console.error('Registration error:', error);
    return json({ error: '注册失败，请稍后再试' }, { status: 500 });
  }
};
