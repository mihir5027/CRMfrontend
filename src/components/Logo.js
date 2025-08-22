import React from 'react';

const Logo = ({ size = 'default', className = '', variant = 'default' }) => {
  const sizeClasses = {
    small: 'text-lg',
    default: 'text-xl',
    large: 'text-2xl',
    xl: 'text-3xl'
  };

  const iconSizes = {
    small: 'w-6 h-6',
    default: 'w-8 h-8',
    large: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo Icon */}
      <div className={`${iconSizes[size]} mr-3 flex-shrink-0`}>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main blue shape (N/M letterform) */}
          <path 
            d="M8 8 L8 40 L16 40 L16 16 L32 40 L40 40 L40 8 L32 8 L32 32 L16 8 Z" 
            fill={isDark ? "#60A5FA" : "#2563EB"}
          />
          {/* Orange-yellow accent shape */}
          <path 
            d="M32 32 L36 32 L36 36 L32 36 Z" 
            fill="#F59E0B"
          />
        </svg>
      </div>
      
      {/* Company Name */}
      <div className="flex flex-col">
        <span className={`font-bold ${isDark ? 'text-blue-300' : 'text-blue-600'} ${sizeClasses[size]}`}>
          Noven
        </span>
        <span className={`font-medium ${isDark ? 'text-blue-200' : 'text-gray-500'} ${size === 'small' ? 'text-xs' : 'text-sm'}`}>
          Group
        </span>
      </div>
    </div>
  );
};

export default Logo;
