import { motion } from 'framer-motion';
import { features } from '../data';
import { getFeatureColor } from '../utils';
import { itemVariants } from '../animations';

export default function FeaturesGrid() {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16"
      variants={itemVariants}
    >
      {features.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <motion.div
            key={index}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/60 via-slate-900/50 to-slate-800/40 backdrop-blur-2xl border border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-500 group"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.7, type: "spring" }}
            whileHover={{ scale: 1.02, y: -8 }}
          >
            {/* Animated gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getFeatureColor(feature.color).replace('bg-', '').replace('/10', '/5')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            <div className="relative p-10">
              <motion.div 
                className={`inline-flex p-5 ${getFeatureColor(feature.color)} rounded-2xl mb-8 shadow-lg`}
                whileHover={{ 
                  scale: 1.15, 
                  rotate: [0, -10, 10, -10, 0],
                  transition: { duration: 0.6 } 
                }}
              >
                <IconComponent className="w-10 h-10" />
              </motion.div>
              
              <h3 className="text-3xl font-bold text-white mb-6 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-200 transition-all duration-500">
                {feature.title}
              </h3>
              
              <p className="text-slate-300 text-lg leading-relaxed group-hover:text-slate-200 transition-colors duration-500">
                {feature.description}
              </p>
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/5 to-white/0 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-lg group-hover:scale-125 transition-transform duration-500"></div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}