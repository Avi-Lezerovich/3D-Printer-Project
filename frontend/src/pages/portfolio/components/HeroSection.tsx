import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, ArrowRight } from 'lucide-react';
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
      
      {/* Demo Button */}
      <motion.div
        className="flex justify-center space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Link to="/demo">
          <motion.button
            className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl font-semibold text-white shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            <div className="relative flex items-center space-x-3">
              <Eye className="w-5 h-5" />
              <span>View Live Demo</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </motion.button>
        </Link>
        
        <Link to="/control">
          <motion.button
            className="group px-8 py-4 bg-slate-800/50 border border-slate-600/50 rounded-2xl font-semibold text-slate-200 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center space-x-3">
              <span>Control Panel</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  );
}