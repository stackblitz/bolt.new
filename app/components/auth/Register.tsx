import React, { useState } from 'react';
import { useNavigate } from '@remix-run/react';
import { useAuth } from '~/hooks/useAuth';
import { getOSSUploadPolicy } from '~/utils/aliyunOSS';

// 导入我们刚刚定义的接口
import type { RegisterResponse } from '~/routes/api.auth.register';

export function Register() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }
    if (!avatar) {
      alert('请上传头像');
      return;
    }
    try {
      // 获取OSS上传策略
      const ossPolicy = await getOSSUploadPolicy();

      // 上传头像到OSS
      const formData = new FormData();
      Object.entries(ossPolicy).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', avatar);

      const uploadResponse = await fetch(ossPolicy.host, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('头像上传失败');
      }

      const avatarUrl = `${ossPolicy.host}/${ossPolicy.key}`;

      // 注册用户
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          password,
          nickname,
          avatarUrl,
        }),
      });

      const data = await registerResponse.json() as RegisterResponse;
      if (registerResponse.ok && data.token && data.user) {
        // 注册成功后直接登录
        login(data.token, data.user);
      } else {
        alert(data.error || '注册失败，请稍后再试');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('注册失败，请稍后再试');
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
        <label htmlFor="nickname" className="block text-sm font-medium text-bolt-elements-textPrimary">
          昵称
        </label>
        <input
          type="text"
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-md shadow-sm focus:outline-none focus:ring-bolt-elements-button-primary-background focus:border-bolt-elements-button-primary-background"
        />
      </div>
      <div>
        <label htmlFor="avatar" className="block text-sm font-medium text-bolt-elements-textPrimary">
          头像
        </label>
        <input
          type="file"
          id="avatar"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files?.[0] || null)}
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
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-bolt-elements-textPrimary">
          确认密码
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-md shadow-sm focus:outline-none focus:ring-bolt-elements-button-primary-background focus:border-bolt-elements-button-primary-background"
        />
      </div>
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-bolt-elements-button-primary-text bg-bolt-elements-button-primary-background hover:bg-bolt-elements-button-primary-backgroundHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bolt-elements-button-primary-background"
        >
          注册
        </button>
      </div>
    </form>
  );
}
