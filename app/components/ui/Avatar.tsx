import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  className?: string;
}

export function Avatar({ src, alt, className = '' }: AvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={`w-8 h-8 rounded-full object-cover ${className}`}
    />
  );
}
