import { motion, HTMLMotionProps } from 'framer-motion';
import { useAnimations } from '../../../../hooks/useAnimations';
import { ReactNode } from 'react';

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'hover' | 'press';
  delay?: number;
}

export default function AnimatedCard({ 
  children, 
  variant = 'default', 
  delay = 0, 
  className = '',
  ...motionProps 
}: AnimatedCardProps) {
  const { slideUp, cardHover } = useAnimations();

  const getVariant = () => {
    switch (variant) {
      case 'hover':
        return cardHover;
      case 'press':
        return { ...cardHover, whileTap: { scale: 0.98 } };
      default:
        return {};
    }
  };

  return (
    <motion.div
      {...slideUp}
      {...getVariant()}
      transition={{
        ...slideUp.transition,
        delay
      }}
      className={`panel ${className}`}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}