import { motion } from 'framer-motion';
import { Clock, Activity, BarChart3 } from 'lucide-react';
import { recentActivity } from '../data';
import { SkeletonCard, LoadingSpinner } from '../../../shared/components/ui/feedback';
import { itemVariants } from '../animations';

interface RecentActivityProps {
  isLoading: boolean;
}

export default function RecentActivity({ isLoading }: RecentActivityProps) {
  return (
    <motion.div 
      className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/50 to-slate-800/40 backdrop-blur-2xl border border-white/10 shadow-2xl"
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-8 pb-6 border-b border-white/10">
        <motion.h3 
          className="text-2xl font-bold text-white mb-2 flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="p-2 mr-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <Activity className="w-6 h-6 text-blue-400" />
          </motion.div>
          Recent Activity
        </motion.h3>
        <p className="text-slate-400 text-base">Latest updates from your 3D printing operations</p>
      </div>

      {/* Activity List */}
      <div className="p-8 space-y-4">
        {isLoading ? (
          // Loading skeletons for activity items
          Array.from({ length: 3 }, (_, i) => (
            <SkeletonCard key={i} showAvatar lines={2} className="bg-slate-700/30 rounded-2xl" />
          ))
        ) : (
          recentActivity.map((activity, index) => {
            const IconComponent = activity.icon;
            return (
              <motion.div
                key={activity.id}
                className="relative overflow-hidden flex items-center space-x-5 p-6 bg-gradient-to-r from-slate-700/40 via-slate-800/30 to-slate-700/40 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ x: 5, scale: 1.02 }}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <motion.div 
                  className="relative p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300 shadow-lg"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                >
                  <IconComponent className="w-6 h-6" />
                </motion.div>
                
                <div className="flex-1 relative">
                  <h4 className="text-white text-lg font-semibold mb-1 group-hover:text-blue-200 transition-colors duration-300">{activity.title}</h4>
                  <p className="text-slate-400 text-base flex items-center">
                    <Clock className="w-4 h-4 mr-2 opacity-70" />
                    {activity.time}
                  </p>
                </div>
                
                {/* Status indicator */}
                <div className={`w-3 h-3 rounded-full ${
                  activity.status === 'success' ? 'bg-green-400' : 'bg-blue-400'
                } animate-pulse shadow-lg`}></div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* View All Button */}
      <div className="p-8 pt-4 border-t border-white/10">
        <motion.button 
          className="w-full py-4 bg-gradient-to-r from-slate-700/50 via-slate-600/50 to-slate-700/50 hover:from-slate-600/70 hover:via-slate-500/70 hover:to-slate-600/70 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-2xl text-slate-200 font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          disabled={isLoading}
          aria-label="View all activity"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <BarChart3 className="w-5 h-5" />
              <span>View All Activity</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}