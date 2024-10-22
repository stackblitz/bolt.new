import React, { useState } from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  className?: string;
}

export function Avatar({ src, alt, className = '' }: AvatarProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
    // 设置一个默认的头像 URL
    setImgSrc('/avatars/default-avatar.png');
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
