import { motion, useReducedMotion } from 'framer-motion';
import BeforeAfter from '../../../components/BeforeAfter';

const Transformation = () => {
  const prefersReducedMotion = useReducedMotion();

  const sectionVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <motion.section 
      className="section-container section-card transformation-section"
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={sectionVariants}
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
  );
};

export default Transformation;
