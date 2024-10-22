import React, { useState } from 'react';
import { useNavigate } from '@remix-run/react';

export function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      if (response.ok) {
        const data = (await response.json()) as { token: string };
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        // 处理错误
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
