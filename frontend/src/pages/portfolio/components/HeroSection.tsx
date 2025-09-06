import { motion } from 'framer-motion';
import { itemVariants } from '../animations';

export default function HeroSection() {
  return (
    <motion.div 
      className="text-center max-w-5xl mx-auto mb-16"
      variants={itemVariants}
    >
      <h2 className="text-6xl font-bold text-white mb-8 leading-tight">
        Welcome to Your
        <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent mt-2">
          3D Printing Dashboard
        </span>
      </h2>
      <p className="text-2xl text-slate-200 leading-relaxed mb-12 font-light max-w-3xl mx-auto">
        Monitor, control, and optimize your 3D printing operations from anywhere. 
        Get real-time insights, manage multiple printers, and ensure perfect prints every time.
      </p>
    </motion.div>
  );
}