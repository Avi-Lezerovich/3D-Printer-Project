import React from 'react';
import { motion, MotionProps } from 'framer-motion';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  actions?: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  variant?: 'default' | 'enhanced' | 'card';
  animate?: boolean;
  motionProps?: MotionProps;
}

export const Panel: React.FC<PanelProps> = ({ 
  title, 
  actions, 
  as: Tag = 'section', 
  children, 
  variant = 'default',
  animate = false,
  motionProps,
  className = '',
  ...rest 
}) => {
  const baseClassName = `panel ${variant !== 'default' ? `panel-${variant}` : ''} ${className}`.trim();
  
  if (animate) {
    const MotionComponent = motion.div;
    return (
      <MotionComponent
        className={baseClassName}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 12 }}
        {...(motionProps || {})}
      >
        {(title || actions) && (
          <header className="panel-header">
            {title && <h2 className="panel-title">{title}</h2>}
            {actions && <div className="panel-actions">{actions}</div>}
          </header>
        )}
        <div className="panel-content">
          {children}
        </div>
      </MotionComponent>
    );
  }

  const Component = Tag as unknown as React.ElementType;
  return (
    <Component className={baseClassName} {...rest}>
      {(title || actions) && (
        <header className="panel-header">
          {title && <h2 className="panel-title">{title}</h2>}
          {actions && <div className="panel-actions">{actions}</div>}
        </header>
      )}
      <div className="panel-content">
        {children}
      </div>
    </Component>
  );
};

export default Panel;
