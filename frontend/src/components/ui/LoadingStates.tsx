import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-[1.5px]',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-[3px]'
  };

  return (
    <div 
      className={`loading-spinner ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );
};

interface LoadingDotsProps {
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ className = '' }) => (
  <div className={`loading-dots ${className}`} role="status" aria-label="Loading">
    <span></span>
    <span></span>
    <span></span>
    <span className="visually-hidden">Loading...</span>
  </div>
);

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  className = '',
  variant = 'rectangular'
}) => {
  const variantClasses = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded-md h-4'
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: variant === 'text' ? '1rem' : typeof height === 'number' ? `${height}px` : height
  };

  return (
    <div 
      className={`loading-skeleton ${variantClasses[variant]} ${className}`}
      style={style}
      role="status"
      aria-label="Loading content"
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );
};

interface SkeletonCardProps {
  showAvatar?: boolean;
  lines?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = false,
  lines = 3,
  className = ''
}) => (
  <div className={`p-4 ${className}`} role="status" aria-label="Loading card">
    <div className="flex items-start space-x-4">
      {showAvatar && (
        <Skeleton variant="circular" width={40} height={40} />
      )}
      <div className="flex-1 space-y-3">
        <Skeleton height={20} width="75%" />
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton 
            key={i} 
            variant="text" 
            width={i === lines - 1 ? '60%' : '100%'} 
          />
        ))}
      </div>
    </div>
    <span className="visually-hidden">Loading card content...</span>
  </div>
);

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  message = 'Loading...'
}) => (
  <div className="relative">
    {children}
    {isLoading && (
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg"
        role="status"
        aria-label={message}
      >
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-white font-medium">{message}</p>
        </div>
      </div>
    )}
  </div>
);