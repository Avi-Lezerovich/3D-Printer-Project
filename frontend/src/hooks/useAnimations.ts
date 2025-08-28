import { tokens } from '../design-system';

export const useAnimations = () => {
  const { duration, easing } = tokens.animation;

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: duration.normal / 1000, ease: easing.easeOut }
  };

  const slideUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { 
      duration: duration.normal / 1000, 
      ease: easing.easeOut,
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  };

  const slideDown = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { 
      duration: duration.normal / 1000, 
      ease: easing.easeOut 
    }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { 
      duration: duration.fast / 1000, 
      ease: easing.easeOut 
    }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const buttonPress = {
    whileTap: { scale: 0.98 },
    whileHover: { scale: 1.02 },
    transition: { duration: duration.fast / 1000 }
  };

  const cardHover = {
    whileHover: { 
      y: -4,
      boxShadow: tokens.shadows.xl,
      transition: { duration: duration.fast / 1000 }
    },
    whileTap: { scale: 0.98 }
  };

  const pulseAnimation = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: easing.easeInOut
      }
    }
  };

  const statusIndicator = (status: 'good' | 'warn' | 'bad') => ({
    initial: { scale: 0 },
    animate: { 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    exit: { scale: 0 }
  });

  return {
    fadeIn,
    slideUp,
    slideDown,
    scaleIn,
    staggerChildren,
    buttonPress,
    cardHover,
    pulseAnimation,
    statusIndicator,
    durations: duration,
    easings: easing
  };
};