import React, { Suspense } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';
import Spinner from '../../components/Spinner';
import Scene3DErrorBoundary from '../../components/Scene3DErrorBoundary';
import { achievements } from './data';

const Scene3D = React.lazy(() => import('../../components/Scene3D'));

const Hero = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <motion.header 
      className="portfolio-hero"
      role="banner"
      initial="hidden"
      animate={isVisible && !prefersReducedMotion ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <div className="hero-content">
        <div className="hero-text">
          <motion.h1 className="hero-title" variants={itemVariants}>
            From Scrap to <span className="gradient-text">Specter</span>
          </motion.h1>
          <motion.p className="hero-subtitle" variants={itemVariants}>
            A comprehensive restoration project that transformed electronic waste into a precision manufacturing tool. 
            This case study showcases advanced problem-solving, technical expertise, and attention to detail.
          </motion.p>
          
          <motion.div 
            className="hero-stats"
            role="list"
            aria-label="Key achievements"
            variants={containerVariants}
          >
            {achievements.map((ach: { value: number; label: string; suffix: string; description: string; }) => (
              <motion.div 
                className="stat-card" 
                key={ach.label}
                variants={itemVariants}
                whileHover={prefersReducedMotion ? undefined : { 
                  scale: 1.05, 
                  y: -5,
                  transition: { type: "spring", stiffness: 300 }
                }}
                role="listitem"
                aria-label={`${ach.label} ${ach.value}${ach.suffix}`}
              >
                <span className="stat-value">
                  <AnimatedCounter end={ach.value} suffix={ach.suffix} />
                </span>
                <span className="stat-label">{ach.label}</span>
                <span className="stat-description">{ach.description}</span>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div className="hero-cta" variants={itemVariants}>
            <motion.a 
              className="cta-button cta-primary" 
              href="/docs/restoration_report.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05, y: -2 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              aria-label="Read Technical Report (opens PDF in a new tab)"
            >
              <span>📄</span>
              Read Technical Report
            </motion.a>
            <motion.a 
              className="cta-button cta-secondary" 
              href="/docs/resume.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05, y: -2 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              aria-label="View Resume (opens PDF in a new tab)"
            >
              <span>👤</span>
              View Resume
            </motion.a>
          </motion.div>
        </div>
        
        <motion.div 
          className="hero-visual"
          initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
          animate={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 100 }}
          transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
        >
          <figure aria-label="3D preview of restored printer">
            <Scene3DErrorBoundary>
              <Suspense fallback={<Spinner label="Loading 3D preview…" />}> 
                <Scene3D />
              </Suspense>
            </Scene3DErrorBoundary>
            <figcaption className="visually-hidden">Interactive 3D view. Decorative only.</figcaption>
          </figure>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Hero;
