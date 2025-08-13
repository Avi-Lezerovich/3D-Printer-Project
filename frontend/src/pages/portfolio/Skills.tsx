import { motion, useReducedMotion } from 'framer-motion';
import { skills } from './data';

const Skills = () => {
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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.section 
      className="section-container section-card skills-section"
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={sectionVariants}
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
        {skills.map((item) => (
          <motion.div 
            key={item.skill} 
            className="skill-item"
            variants={itemVariants}
            whileHover={prefersReducedMotion ? undefined : { 
              y: -5,
              transition: { type: "spring", stiffness: 300 }
            }}
          >
            <div className="skill-header">
              <span className="skill-icon" aria-hidden>{item.icon}</span>
              <span className="skill-name">{item.skill}</span>
            </div>
            <div className="skill-bar" aria-label={`${item.skill} proficiency`}>
              <motion.div 
                className="skill-progress"
                initial={prefersReducedMotion ? { width: `${item.level}%` } : { width: 0 }}
                whileInView={{ width: `${item.level}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                role="presentation"
                aria-hidden="true"
              />
            </div>
            <span className="skill-percentage" aria-label={`${item.level} percent`}>{item.level}%</span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default Skills;
