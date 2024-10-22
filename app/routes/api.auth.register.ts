import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { validatePhoneNumber } from '~/utils/validation';
import { db } from '~/utils/db.server';
import { hashPassword, createToken } from '~/utils/auth.server';

export interface RegisterResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    phone: string;
    nickname: string;
    avatarUrl: string;
  };
  error?: string;
}

export const action: ActionFunction = async ({ request }) => {
  const { phone, password, nickname, avatarUrl } = await request.json() as { phone: string, password: string, nickname: string, avatarUrl: string };

  if (!validatePhoneNumber(phone)) {
    const response: RegisterResponse = { success: false, error: '无效的手机号码' };
    return json(response, { status: 400 });
  }

  try {
    const existingUser = await db('users').where({ phone }).first();
    if (existingUser) {
      const response: RegisterResponse = { success: false, error: '该手机号已被注册' };
      return json(response, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const [userId] = await db('users').insert({
      phone,
      password: hashedPassword,
      nickname,
      avatar_url: avatarUrl
    });

    const token = createToken(userId.toString());
    const user = { id: userId, phone, nickname, avatarUrl };

    const response: RegisterResponse = { success: true, token, user };
    return json(response);
  } catch (error) {
    console.error('Registration error:', error);
    const response: RegisterResponse = { success: false, error: '注册失败，请稍后再试' };
    return json(response, { status: 500 });
  }
};
