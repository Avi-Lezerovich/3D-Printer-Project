import { forwardRef, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { announceToScreenReader } from '../../../utils/accessibility';

// Type for motion props that excludes conflicting HTML event handlers
type MotionOnlyProps = Omit<HTMLMotionProps<"button">, 
  | 'children' 
  | 'className' 
  | 'onClick' 
  | 'disabled' 
  | 'ref'
  | 'onDrag'
  | 'onDragStart' 
  | 'onDragEnd'
  | 'onAnimationStart'
  | 'onAnimationComplete'
  | keyof ButtonHTMLAttributes<HTMLButtonElement>
>;

interface AccessibleButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'type'
  | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'
  | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onDragOver' | 'onDragEnter' | 'onDragLeave' | 'onDrop'
> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  announceOnClick?: string;
  motionProps?: MotionOnlyProps;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    announceOnClick,
    motionProps,
    className = '',
    onClick,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = 'btn inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = {
      primary: 'btn-primary focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
      danger: 'btn-danger focus:ring-red-500',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm gap-2',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-3',
    };

    const isDisabled = disabled || loading;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (announceOnClick && !isDisabled) {
        announceToScreenReader(announceOnClick, 'polite');
      }
      
      if (onClick && !isDisabled) {
        onClick(event);
      }
    };

    const buttonContent = (
      <>
        {loading && (
          <Loader2 
            className={`animate-spin ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`}
            aria-hidden="true"
          />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span aria-hidden="true">{icon}</span>
        )}
        
        <span>
          {loading ? (loadingText || children) : children}
        </span>
        
        {!loading && icon && iconPosition === 'right' && (
          <span aria-hidden="true">{icon}</span>
        )}
      </>
    );

    const buttonClasses = `
      ${baseClasses}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${fullWidth ? 'w-full' : ''}
      ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      ${className}
    `.trim();

    if (motionProps) {
      return (
        <motion.button
          ref={ref}
          className={buttonClasses}
          onClick={handleClick}
          disabled={isDisabled}
          aria-disabled={isDisabled}
          aria-busy={loading}
          {...props}
          {...motionProps}
        >
          {buttonContent}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        onClick={handleClick}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;