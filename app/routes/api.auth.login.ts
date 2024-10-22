import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { validatePhoneNumber } from '~/utils/validation';
import { verifyLogin, createToken } from '~/utils/auth.server';

export interface LoginResponse {
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
  const { phone, password } = (await request.json()) as { phone: string; password: string };

  if (!validatePhoneNumber(phone)) {
    return json({ error: '无效的手机号码' }, { status: 400 });
  }

  try {
    const user = await verifyLogin(phone, password);
    if (!user) {
      return json({ error: '手机号或密码不正确' }, { status: 401 });
    }

    const token = createToken(user._id.toString());
    const response: LoginResponse = {
      success: true,
      token,
      user: {
        id: user._id,
        phone: user.phone,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
      },
    };
    return json(response);
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: '登录失败，请稍后再试' }, { status: 500 });
  }
};
