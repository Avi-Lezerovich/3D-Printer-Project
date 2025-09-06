import { motion } from 'framer-motion';
import { quickStats } from '../data';
import { getStatColor } from '../utils';
import { itemVariants } from '../animations';

export default function QuickStatsGrid() {
  return (
    <motion.section 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
      variants={itemVariants}
      aria-label="System statistics"
    >
      {quickStats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <motion.div
            key={index}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer group"
            role="button"
            tabIndex={0}
            aria-label={`${stat.title}: ${stat.value}, ${stat.change}`}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6, type: "spring", stiffness: 100 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Handle click action
              }
            }}
          >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getStatColor(stat.color)} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
            
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <motion.div 
                  className={`p-4 bg-gradient-to-br ${getStatColor(stat.color)} rounded-2xl shadow-lg`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <IconComponent className="w-7 h-7" aria-hidden="true" />
                </motion.div>
                <motion.div 
                  className={`text-base font-semibold px-3 py-1 rounded-full ${stat.trend === 'up' ? 'text-green-300 bg-green-500/20 border border-green-500/30' : 'text-red-300 bg-red-500/20 border border-red-500/30'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                >
                  {stat.change}
                </motion.div>
              </div>
              <motion.div 
                className="text-4xl font-bold text-white mb-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-slate-300 text-lg font-medium">{stat.title}</div>
            </div>
          </motion.div>
        );
      })}
    </motion.section>
  );
}