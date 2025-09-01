import { motion, useReducedMotion } from 'framer-motion';

const ProgressBar = ({ progress, label }: { progress: string, label: string }) => {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="progress-container">
      <div className="progress-bar" aria-label={`${label} progress`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={parseInt(progress)}>
        <motion.div 
          className="progress-fill" 
          initial={prefersReducedMotion ? { width: progress } : { width: 0 }}
          whileInView={{ width: progress }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
      </div>
      <span className="progress-label">{label}</span>
    </div>
  );
};

const ProjectStatus = () => {
  const prefersReducedMotion = useReducedMotion();

  const sectionVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: 'easeOut',
      } 
    },
  };

  return (
    <motion.section 
      className="section-container section-card progress-section"
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={sectionVariants}
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
          <ProgressBar progress="100%" label="Complete" />
        </div>
        <div className="status-card">
          <h3>Testing & Validation</h3>
          <ProgressBar progress="100%" label="Complete" />
        </div>
        <div className="status-card">
          <h3>Documentation</h3>
          <ProgressBar progress="95%" label="95% Complete" />
        </div>
      </div>
      <div className="project-summary">
        <p>
          <strong>Project completed successfully!</strong> The restored 3D printer now operates with improved reliability, 
          reduced noise, and enhanced precision compared to its original specifications.
        </p>
      </div>
    </motion.section>
  );
};

export default ProjectStatus;
