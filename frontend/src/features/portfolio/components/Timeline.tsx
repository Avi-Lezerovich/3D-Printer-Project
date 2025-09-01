import { motion, useReducedMotion } from 'framer-motion';
import { timeline } from './data';

const Timeline = () => {
  const prefersReducedMotion = useReducedMotion();

  const sectionVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: 'easeOut',
        staggerChildren: 0.1 
      } 
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.section 
      className="section-container section-card timeline-section"
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
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
        {timeline.map((item) => (
          <motion.li
            className="timeline-item"
            key={item.step}
            variants={itemVariants}
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
                {item.keyTech.map((tech) => (
                  <span key={tech} className="tech-tag">{tech}</span>
                ))}
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
};

export default Timeline;
