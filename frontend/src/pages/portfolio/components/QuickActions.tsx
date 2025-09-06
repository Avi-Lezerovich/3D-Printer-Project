import { motion } from 'framer-motion';
import { Monitor, FileText, BarChart3, Settings } from 'lucide-react';
import { itemVariants } from '../animations';

export default function QuickActions() {
  return (
    <motion.div 
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/50 to-slate-800/40 backdrop-blur-2xl border border-white/10 shadow-2xl"
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-8 pb-6 border-b border-white/10">
        <motion.h3 
          className="text-2xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Quick Actions
        </motion.h3>
        <p className="text-slate-400 text-base">Essential tools at your fingertips</p>
      </div>

      {/* Action Buttons */}
      <div className="p-8 space-y-4">
        <motion.button 
          className="w-full p-6 bg-gradient-to-r from-blue-500/20 via-blue-600/20 to-blue-500/20 hover:from-blue-500/30 hover:via-blue-600/30 hover:to-blue-500/30 backdrop-blur-xl border border-blue-500/30 hover:border-blue-400/50 rounded-2xl text-blue-300 font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-blue-500/20 group"
          aria-label="Navigate to Control Panel"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Monitor className="w-6 h-6" aria-hidden="true" />
          </motion.div>
          <span>Control Panel</span>
          <div className="ml-auto w-2 h-2 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </motion.button>

        <motion.button 
          className="w-full p-6 bg-gradient-to-r from-green-500/20 via-green-600/20 to-green-500/20 hover:from-green-500/30 hover:via-green-600/30 hover:to-green-500/30 backdrop-blur-xl border border-green-500/30 hover:border-green-400/50 rounded-2xl text-green-300 font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-green-500/20 group"
          aria-label="Upload new file"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <FileText className="w-6 h-6" aria-hidden="true" />
          </motion.div>
          <span>Upload File</span>
          <div className="ml-auto w-2 h-2 rounded-full bg-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </motion.button>

        <motion.button 
          className="w-full p-6 bg-gradient-to-r from-purple-500/20 via-purple-600/20 to-purple-500/20 hover:from-purple-500/30 hover:via-purple-600/30 hover:to-purple-500/30 backdrop-blur-xl border border-purple-500/30 hover:border-purple-400/50 rounded-2xl text-purple-300 font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-purple-500/20 group"
          aria-label="View analytics dashboard"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 0.8 }}
          >
            <BarChart3 className="w-6 h-6" aria-hidden="true" />
          </motion.div>
          <span>Analytics</span>
          <div className="ml-auto w-2 h-2 rounded-full bg-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </motion.button>

        <motion.button 
          className="w-full p-6 bg-gradient-to-r from-slate-600/40 via-slate-700/40 to-slate-600/40 hover:from-slate-600/60 hover:via-slate-700/60 hover:to-slate-600/60 backdrop-blur-xl border border-slate-500/40 hover:border-slate-400/60 rounded-2xl text-slate-200 font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-slate-500/20 group"
          aria-label="Open settings"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <Settings className="w-6 h-6" aria-hidden="true" />
          </motion.div>
          <span>Settings</span>
          <div className="ml-auto w-2 h-2 rounded-full bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </motion.button>
      </div>
      
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
    </motion.div>
  );
}