import { useState } from 'react';
import { env } from '~/config/env.client';

interface AvatarProps {
  src: string;
  alt: string;
  className?: string;
}

export function Avatar({ src = '', alt, className = '' }: AvatarProps) {
  const [imgSrc, setImgSrc] = useState(src.startsWith('http') ? src : `${env.OSS_HOST}${src}`);
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
    // 设置一个默认的头像 URL
    setImgSrc(`${env.OSS_HOST}/avatars/default-avatar.png`);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`w-8 h-8 rounded-full object-cover ${className} ${error ? 'opacity-50' : ''}`}
      onError={handleError}
    />
  );
}
