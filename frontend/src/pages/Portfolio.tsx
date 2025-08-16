import { useReducedMotion } from 'framer-motion';
import Hero from './portfolio/Hero';
import Transformation from './portfolio/Transformation';
import Timeline from './portfolio/Timeline';
import Skills from './portfolio/Skills';
import ProjectStatus from './portfolio/ProjectStatus';
import '../styles/portfolio.css';

const FloatingBackground = () => {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="floating-background" aria-hidden="true">
      {[...Array(14)].map((_, i) => (
        <div 
          key={i}
          className="floating-element"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
            animationPlayState: prefersReducedMotion ? 'paused' : 'running'
          }}
        />
      ))}
    </div>
  );
};

export default function Portfolio() {
  return (
    <div className="portfolio-container">
      <FloatingBackground />
      <Hero />
      <main id="main-content" className="portfolio-main" role="main">
        <Transformation />
        <Timeline />
        <Skills />
        <ProjectStatus />
      </main>
    </div>
  );
}
