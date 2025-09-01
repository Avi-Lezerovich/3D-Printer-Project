import { motion } from 'framer-motion';
import './hero.css';

export default function Hero() {
  return (
    <div className="panel hero-container">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hero-title"
      >
        Salvaged → Restored: Professional 3D Printer Build
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="hero-description"
      >
        Self-taught firmware, CAD, and mechanical tuning. A complete turnaround from e-waste to high-precision
        additive manufacturing.
      </motion.p>
      <div className="hero-buttons">
        <a className="panel" href="/docs/restoration_report.pdf" download>
          Download Report
        </a>
        <a className="panel" href="#contact" onClick={(e) => e.preventDefault()}>
          Contact Me
        </a>
      </div>
      <div className="hero-stats">
        {[
          { k: 'Accuracy', v: '±0.1 mm' },
          { k: 'Success', v: '95%+' },
          { k: 'Noise', v: '-40%' },
          { k: 'Speed', v: '-15% time' },
        ].map((m) => (
          <div key={m.k} className="panel hero-stat">
            <div className="hero-stat-value">{m.v}</div>
            <div className="hero-stat-key">{m.k}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
