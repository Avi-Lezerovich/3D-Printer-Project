import React from 'react';
import classNames from 'classnames';

type Variant = 'primary' | 'danger' | 'warn' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'ghost',
  size = 'md',
  isLoading,
  iconLeft,
  iconRight,
  children,
  className,
  disabled,
  ...rest
}) => {
  return (
    <button
      className={classNames('btn', {
        'btn-primary': variant === 'primary',
        'btn-danger': variant === 'danger',
        'btn-warn': variant === 'warn'
      }, size && `btn-${size}`, className)}
      disabled={disabled || isLoading}
      {...rest}
    >
      {iconLeft && <span aria-hidden>{iconLeft}</span>}
      <span>{isLoading ? '…' : children}</span>
      {iconRight && <span aria-hidden>{iconRight}</span>}
    </button>
  );
};

export default Button;
