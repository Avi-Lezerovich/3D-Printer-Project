// Portfolio Animation Configurations
import type { Variants } from 'framer-motion';

export const portfolioAnimations = {
  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  } as Variants,

  itemVariants: {
    hidden: { 
      opacity: 0, 
      y: 24 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  } as Variants,

  statsCardVariants: {
    hidden: { 
      opacity: 0, 
      scale: 0.95 
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'backOut'
      }
    }
  } as Variants
};
