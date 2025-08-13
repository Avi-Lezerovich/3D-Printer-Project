import { motion, useReducedMotion } from 'framer-motion';

export default function ProjectHero() {
  const shouldReduceMotion = useReducedMotion();

  const heroVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      className="project-hero"
      variants={heroVariants}
      initial={shouldReduceMotion ? 'visible' : 'hidden'}
      animate="visible"
    >
      <div className="hero-content">
      </div>
    </motion.div>
  );
}
