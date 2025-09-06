import { motion } from 'framer-motion';

export function LoadingSpinner() {
  return (
    <motion.div
      className="loading-spinner"
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
      style={{
        width: '40px',
        height: '40px',
        border: '3px solid #f3f4f6',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        margin: '20px auto'
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <motion.div
      className="skeleton-card"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      style={{
        width: '100%',
        height: '120px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        margin: '8px 0'
      }}
    />
  );
}
