import React, { useState } from 'react';
import { useAuth } from '~/hooks/useAuth';
import type { LoginResponse } from '~/routes/api.auth.login';

export function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });
      const data = (await response.json()) as LoginResponse;
      if (response.ok && data.token && data.user) {
        login(data.token, data.user);
        // 登录成功后的处理,例如重定向或显示成功消息
      } else {
        setError(data.error || '登录失败，请检查您的手机号和密码');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('登录失败，请稍后再试');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-bolt-elements-textPrimary">
          手机号
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-md shadow-sm focus:outline-none focus:ring-bolt-elements-button-primary-background focus:border-bolt-elements-button-primary-background"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-bolt-elements-textPrimary">
          密码
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-md shadow-sm focus:outline-none focus:ring-bolt-elements-button-primary-background focus:border-bolt-elements-button-primary-background"
        />
      </div>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-bolt-elements-button-primary-text bg-bolt-elements-button-primary-background hover:bg-bolt-elements-button-primary-backgroundHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-elements-button-primary-background"
        >
          登录
        </button>
      </div>
    </form>
  );
}
