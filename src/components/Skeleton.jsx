import React from 'react';

const Skeleton = ({ 
  width = '100%', 
  height = '1rem', 
  borderRadius = 'var(--border-radius-sm)', 
  className = '', 
  variant = 'base', // 'base' or 'glass'
  style = {} 
}) => {
  const baseClass = variant === 'glass' ? 'skeleton-glass' : 'skeleton';
  
  return (
    <div 
      className={`${baseClass} ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
};

export default Skeleton;
