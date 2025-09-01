import { motion, HTMLMotionProps } from 'framer-motion';
import { useAnimations } from '../../hooks/useAnimations';
import { ReactNode } from 'react';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'danger' | 'warn' | 'default';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export default function AnimatedButton({ 
  children, 
  variant = 'default', 
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...motionProps 
}: AnimatedButtonProps) {
  const { buttonPress } = useAnimations();

  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'btn-primary';
      case 'danger': return 'btn-danger';
      case 'warn': return 'btn-warn';
      default: return '';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-sm p-sm';
      case 'lg': return 'text-lg p-lg';
      default: return '';
    }
  };

  return (
    <motion.button
      {...buttonPress}
      className={`btn ${getVariantClass()} ${getSizeClass()} ${className}`}
      disabled={disabled || loading}
      whileTap={disabled || loading ? undefined : buttonPress.whileTap}
      whileHover={disabled || loading ? undefined : buttonPress.whileHover}
      {...motionProps}
    >
      {loading ? (
        <div className="flex items-center gap-sm">
          <div className="loading-spinner" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}