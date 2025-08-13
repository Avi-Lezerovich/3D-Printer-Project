/* eslint react/no-unescaped-entities: 0 */
import React, { Suspense, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import BeforeAfter from '../components/BeforeAfter';
import Spinner from '../components/Spinner';
import '../styles/portfolio.css';

const Scene3D = React.lazy(() => import('../components/Scene3D'))

const achievements = [
  { value: 95, label: 'Success Rate', suffix: '%', description: 'Print reliability after restoration' },
  { value: 0.1, label: 'Precision', suffix: 'mm', description: 'Layer accuracy achieved' },
  { value: 40, label: 'Noise Reduction', suffix: '%', description: 'Quieter operation vs original' },
  { value: 15, label: 'Speed Boost', suffix: '%', description: 'Faster print times' },
];

const timeline = [
  {
    step: 'Discovery & Assessment',
    detail: 'Found discarded printer, assessed damage and missing components',
    icon: '🔍',
    duration: '1 week',
    keyTech: ['Visual inspection', 'Component testing', 'Documentation']
  },
  {
    step: 'Complete Teardown',
    detail: 'Disassembled entire machine, cataloged parts, identified failures',
    icon: '🔧',
    duration: '3 days',
    keyTech: ['Mechanical disassembly', 'Part cataloging', 'Failure analysis']
  },
  {
    step: 'Electronics Repair',
    detail: 'Replaced PSU, stepper drivers, rewired hotend and heated bed',
    icon: '⚡',
    duration: '1 week',
    keyTech: ['Circuit analysis', 'Soldering', 'Power supply testing']
  },
  {
    step: 'Mechanical Restoration',
    detail: 'New belts, bearings, rails cleaning and precision alignment',
    icon: '⚙️',
    duration: '4 days',
    keyTech: ['Precision mechanics', 'Bearing replacement', 'Belt tensioning']
  },
  {
    step: 'CAD & Custom Parts',
    detail: 'Designed and printed fan shrouds, cable guides, and upgrades',
    icon: '📐',
    duration: '1 week',
    keyTech: ['CAD design', '3D printing', 'Iterative prototyping']
  },
  {
    step: 'Firmware Configuration',
    detail: 'Flashed Marlin firmware, configured safety limits and features',
    icon: '💻',
    duration: '2 days',
    keyTech: ['Marlin firmware', 'G-code', 'Safety protocols']
  },
  {
    step: 'Precision Calibration',
    detail: 'E-steps, PID tuning, bed leveling, flow rate optimization',
    icon: '🎯',
    duration: '3 days',
    keyTech: ['PID control', 'Calibration algorithms', 'Quality testing']
  },
  {
    step: 'First Successful Print',
    detail: 'Printed a flawless 20mm calibration cube, validating all repairs',
    icon: '🎉',
    duration: '1 day',
    keyTech: ['Print validation', 'Quality assessment', 'Performance metrics']
  },
];

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentCount = progress * end;
      setCount(currentCount);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  const formatCount = (num: number) => {
    if (num < 1) {
      return num.toFixed(1);
    }
    return Math.floor(num);
  };

  return (
    <span>
      {formatCount(count)}
      {suffix}
    </span>
  );
};

export default function Portfolio() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="portfolio-container">
      {/* Skip link for keyboard users */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {/* Floating background elements */}
      <div className="floating-background" aria-hidden="true">
        {[...Array(14)].map((_, i) => (
          <div 
            key={i}
            className="floating-element"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
              animationPlayState: prefersReducedMotion ? 'paused' as const : 'running' as const
            }}
          />
        ))}
      </div>

      <motion.header 
        className="portfolio-hero"
        style={{ y: prefersReducedMotion ? 0 : heroY }}
        role="banner"
      >
        <div className="hero-content">
          <motion.div 
            className="hero-text"
            initial={prefersReducedMotion ? false : { opacity: 0, x: -100 }}
            animate={prefersReducedMotion ? undefined : { opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -100 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.h1 
              className="hero-title"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 50 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            >
              From Scrap to <span className="gradient-text">Specter</span>
            </motion.h1>
            <motion.p 
              className="hero-subtitle"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              A comprehensive restoration project that transformed electronic waste into a precision manufacturing tool. 
              This case study showcases advanced problem-solving, technical expertise, and attention to detail.
            </motion.p>
            
            <motion.div 
              className="hero-stats"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 50 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              role="list"
              aria-label="Key achievements"
            >
              {achievements.map((ach, index) => (
                <motion.div 
                  className="stat-card" 
                  key={index}
                  whileHover={prefersReducedMotion ? undefined : { 
                    scale: 1.05, 
                    y: -5,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 + index * 0.2 }}
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
            
            <motion.div 
              className="hero-cta"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.8 }}
            >
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
          </motion.div>
          
          <motion.div 
            className="hero-visual"
            initial={prefersReducedMotion ? false : { opacity: 0, x: 100 }}
            animate={prefersReducedMotion ? undefined : { opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 100 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          >
            <figure aria-label="3D preview of restored printer">
              <Suspense fallback={<Spinner label="Loading 3D preview…" />}> 
                <Scene3D />
              </Suspense>
              <figcaption className="visually-hidden">Interactive 3D view. Decorative only.</figcaption>
            </figure>
          </motion.div>
        </div>
      </motion.header>

      <main id="main-content" className="portfolio-main" role="main">
        <motion.section 
          className="section-container section-card transformation-section"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 100 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          role="region"
          aria-labelledby="transformation-title"
        >
          <h2 id="transformation-title" className="section-title">
            <span className="section-icon">🔄</span>
            The Transformation
          </h2>
          <p className="section-description">
            Witness the dramatic before-and-after comparison of this restoration project. 
            From a damaged, non-functional printer to a precision manufacturing tool.
          </p>
          <div className="before-after-container">
            <BeforeAfter before="/images/before.svg" after="/images/after.svg" />
          </div>
        </motion.section>

        <motion.section 
          className="section-container section-card timeline-section"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 100 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          role="region"
          aria-labelledby="timeline-title"
        >
          <h2 id="timeline-title" className="section-title">
            <span className="section-icon">📅</span>
            Project Timeline
          </h2>
          <p className="section-description">
            A detailed breakdown of the restoration process, showcasing systematic problem-solving and technical expertise.
          </p>
          <ul className="timeline" role="list" aria-label="Project milestones">
            {timeline.map((item, index) => (
              <motion.li
                className="timeline-item"
                key={index}
                initial={prefersReducedMotion ? false : { opacity: 0, x: -50 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={prefersReducedMotion ? undefined : { 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300 }
                }}
                role="listitem"
                aria-label={`${item.step} (${item.duration})`}
              >
                <div className="timeline-icon" aria-hidden>{item.icon}</div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h3 className="timeline-step">{item.step}</h3>
                    <span className="timeline-duration" aria-label={`Duration ${item.duration}`}>{item.duration}</span>
                  </div>
                  <p className="timeline-detail">{item.detail}</p>
                  <div className="timeline-tech" aria-label="Key technologies used">
                    {item.keyTech.map((tech, techIndex) => (
                      <span key={techIndex} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        <motion.section 
          className="section-container section-card skills-section"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 100 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          role="region"
          aria-labelledby="skills-title"
        >
          <h2 id="skills-title" className="section-title">
            <span className="section-icon">🧰</span> 
            Technical Skills Applied
          </h2>
          <p className="section-description">
            This project required a diverse skill set, combining hardware expertise with software configuration and precision engineering.
          </p>
          <div className="skills-grid">
            {[
              { skill: 'Electronics Repair', level: 95, icon: '⚡' },
              { skill: 'Mechanical Engineering', level: 90, icon: '⚙️' },
              { skill: 'CAD Modeling', level: 85, icon: '📐' },
              { skill: 'Firmware Development', level: 80, icon: '💻' },
              { skill: 'Precision Calibration', level: 92, icon: '🎯' },
              { skill: 'Problem Solving', level: 98, icon: '🧩' }
            ].map((item, index) => (
              <motion.div 
                key={item.skill} 
                className="skill-item"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={prefersReducedMotion ? undefined : { 
                  y: -5,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                <div className="skill-header">
                  <span className="skill-icon" aria-hidden>{item.icon}</span>
                  <span className="skill-name">{item.skill}</span>
                </div>
                <div className="skill-bar">
                  <motion.div 
                    className="skill-progress"
                    initial={prefersReducedMotion ? false : { width: 0 }}
                    whileInView={prefersReducedMotion ? undefined : { width: `${item.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: index * 0.2 + 0.5 }}
                  />
                </div>
                <span className="skill-percentage">{item.level}%</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          className="section-container section-card progress-section"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 100 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          role="region"
          aria-labelledby="status-title"
        >
          <h2 id="status-title" className="section-title">
            <span className="section-icon">📈</span> 
            Project Status
          </h2>
          <div className="status-grid">
            <div className="status-card">
              <h3>Restoration Phase</h3>
              <div className="progress-container">
                <div className="progress-bar" aria-label="Restoration progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={100}>
                  <motion.div 
                    className="progress-fill" 
                    initial={prefersReducedMotion ? false : { width: 0 }}
                    whileInView={prefersReducedMotion ? undefined : { width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, delay: 0.5 }}
                  />
                </div>
                <span className="progress-label">Complete</span>
              </div>
            </div>
            <div className="status-card">
              <h3>Testing & Validation</h3>
              <div className="progress-container">
                <div className="progress-bar">
                  <motion.div 
                    className="progress-fill" 
                    initial={prefersReducedMotion ? false : { width: 0 }}
                    whileInView={prefersReducedMotion ? undefined : { width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, delay: 0.8 }}
                  />
                </div>
                <span className="progress-label">Complete</span>
              </div>
            </div>
            <div className="status-card">
              <h3>Documentation</h3>
              <div className="progress-container">
                <div className="progress-bar">
                  <motion.div 
                    className="progress-fill" 
                    initial={prefersReducedMotion ? false : { width: 0 }}
                    whileInView={prefersReducedMotion ? undefined : { width: '95%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, delay: 1.1 }}
                  />
                </div>
                <span className="progress-label">95% Complete</span>
              </div>
            </div>
          </div>
          <div className="project-summary">
            <p>
              <strong>Project completed successfully!</strong> The restored 3D printer now operates with improved reliability, 
              reduced noise, and enhanced precision compared to its original specifications.
            </p>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
