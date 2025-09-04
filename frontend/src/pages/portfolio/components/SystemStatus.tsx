import { motion } from 'framer-motion';
import { Thermometer, TrendingUp } from 'lucide-react';
import { itemVariants } from '../animations';

export default function SystemStatus() {
  return (
    <motion.div 
      className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/50 to-slate-800/40 backdrop-blur-2xl border border-white/10 shadow-2xl"
      variants={itemVariants}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-8 pb-6 border-b border-white/10">
        <motion.h3 
          className="text-2xl font-bold text-white mb-2 flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="p-2 mr-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30"
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <Thermometer className="w-6 h-6 text-blue-400" />
          </motion.div>
          System Status Overview
        </motion.h3>
        <p className="text-slate-400 text-base">Real-time monitoring of critical system metrics</p>
      </div>

      {/* Status Grid */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Uptime Status */}
        <motion.div 
          className="relative overflow-hidden text-center p-8 bg-gradient-to-br from-green-500/10 via-green-600/5 to-emerald-500/10 backdrop-blur-xl border border-green-500/20 rounded-2xl shadow-lg group cursor-pointer"
          whileHover={{ scale: 1.05, y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <motion.div 
            className="relative text-4xl font-bold text-green-300 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          >
            98.5%
          </motion.div>
          <div className="relative text-slate-200 text-xl font-semibold mb-2">Uptime</div>
          <div className="relative text-slate-400 text-base">Last 30 days</div>
          <div className="mt-4 w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "98.5%" }}
              transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
            ></motion.div>
          </div>
          <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </motion.div>

        {/* Temperature Status */}
        <motion.div 
          className="relative overflow-hidden text-center p-8 bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-cyan-500/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-lg group cursor-pointer"
          whileHover={{ scale: 1.05, y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <motion.div 
            className="relative text-4xl font-bold text-blue-300 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
          >
            24.2°C
          </motion.div>
          <div className="relative text-slate-200 text-xl font-semibold mb-2">Room Temperature</div>
          <div className="relative text-slate-400 text-base">Optimal range</div>
          <div className="mt-4 flex justify-center">
            <motion.div 
              className="w-4 h-4 bg-gradient-to-t from-blue-400 to-cyan-400 rounded-full shadow-lg"
              animate={{ 
                scale: [1, 1.2, 1], 
                boxShadow: ["0 0 5px rgba(59,130,246,0.5)", "0 0 20px rgba(59,130,246,0.8)", "0 0 5px rgba(59,130,246,0.5)"] 
              }}
              transition={{ duration: 2, repeat: Infinity }}
            ></motion.div>
          </div>
          <div className="absolute top-4 right-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Thermometer className="w-5 h-5 text-blue-400/70" />
            </motion.div>
          </div>
        </motion.div>

        {/* Performance Status */}
        <motion.div 
          className="relative overflow-hidden text-center p-8 bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-violet-500/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl shadow-lg group cursor-pointer"
          whileHover={{ scale: 1.05, y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-violet-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <motion.div 
            className="relative text-4xl font-bold text-purple-300 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 200 }}
          >
            99.7%
          </motion.div>
          <div className="relative text-slate-200 text-xl font-semibold mb-2">Print Success Rate</div>
          <div className="relative text-slate-400 text-base">This month</div>
          <div className="mt-4 flex items-end justify-center space-x-1">
            {[0.6, 0.8, 1, 0.7, 0.9, 0.85, 1].map((height, i) => (
              <motion.div
                key={i}
                className="bg-gradient-to-t from-purple-400 to-violet-400 rounded-sm"
                style={{ width: 4 }}
                initial={{ height: 0 }}
                animate={{ height: height * 20 }}
                transition={{ delay: 1.2 + i * 0.1, duration: 0.5 }}
              ></motion.div>
            ))}
          </div>
          <div className="absolute top-4 right-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <TrendingUp className="w-5 h-5 text-purple-400/70" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20"></div>
    </motion.div>
  );
}