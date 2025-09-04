import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, Printer, Activity, FileText, Clock, Settings,
  TrendingUp, Thermometer, Wifi, CheckCircle, Play,
  BarChart3, Users, Shield, Zap
} from 'lucide-react';
import { useAppStore } from '../shared/store';
import { SkeletonCard, LoadingSpinner } from '../shared/components/ui/feedback';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const quickStats = [
  {
    title: 'Active Printers',
    value: '3',
    change: '+1',
    icon: Printer,
    color: 'blue',
    trend: 'up'
  },
  {
    title: 'Projects Complete',
    value: '847',
    change: '+12%',
    icon: CheckCircle,
    color: 'green',
    trend: 'up'
  },
  {
    title: 'Print Hours',
    value: '2,340',
    change: '+8%',
    icon: Clock,
    color: 'purple',
    trend: 'up'
  },
  {
    title: 'Success Rate',
    value: '96.2%',
    change: '+2.1%',
    icon: TrendingUp,
    color: 'orange',
    trend: 'up'
  }
];

const features = [
  {
    icon: Monitor,
    title: 'Real-time Monitoring',
    description: 'Live temperature tracking, print progress, and system status monitoring.',
    color: 'blue'
  },
  {
    icon: Shield,
    title: 'Secure Access',
    description: 'Enterprise-grade security with role-based access control and audit logging.',
    color: 'green'
  },
  {
    icon: Zap,
    title: 'Performance Analytics',
    description: 'Detailed insights into print quality, material usage, and system performance.',
    color: 'purple'
  },
  {
    icon: Users,
    title: 'Multi-User Support',
    description: 'Collaborative workspace with project management and team coordination.',
    color: 'orange'
  }
];

const recentActivity = [
  {
    id: 1,
    type: 'print_completed',
    title: 'Phone Case v2 print completed successfully',
    time: '2 minutes ago',
    status: 'success',
    icon: Printer
  },
  {
    id: 2,
    type: 'maintenance',
    title: 'Printer #1 maintenance scheduled',
    time: '15 minutes ago',
    status: 'info',
    icon: Settings
  },
  {
    id: 3,
    type: 'print_started',
    title: 'Dragon Miniature print started',
    time: '1 hour ago',
    status: 'info',
    icon: Play
  }
];

export default function Portfolio() {
  const { sidebarCollapsed } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getStatColor = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400';
      case 'green': return 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400';
      case 'purple': return 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400';
      case 'orange': return 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400';
      default: return 'from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-400';
    }
  };

  const getFeatureColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'green': return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'purple': return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      case 'orange': return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
      default: return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 transition-all duration-300 ${
      sidebarCollapsed ? 'ml-16' : 'ml-64'
    }`}>
      {/* Fixed Header with Glassmorphism */}
      <div className="fixed top-0 right-0 left-0 z-20 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl" 
           style={{ marginLeft: sidebarCollapsed ? '64px' : '256px' }}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent mb-2">
                3D Printer Control System
              </h1>
              <p className="text-slate-300 text-base font-medium tracking-wide">
                Professional remote monitoring and control for your 3D printing workflow
              </p>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <div 
                className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 text-green-300 rounded-2xl shadow-lg hover:shadow-green-500/20 transition-all duration-300"
                role="status" 
                aria-live="polite"
                aria-label="System status: All systems online"
              >
                <div className="relative">
                  <Wifi className="w-5 h-5" aria-hidden="true" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <span className="text-sm font-semibold">All Systems Online</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <motion.div 
        className="pt-28 px-8 pb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
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

        {/* Quick Stats */}
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

        {/* Features Grid */}
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

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Recent Activity */}
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

          {/* Quick Actions */}
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
        </div>

        {/* System Status */}
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
              {/* Animated background */}
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
              
              {/* Progress indicator */}
              <div className="mt-4 w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "98.5%" }}
                  transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                ></motion.div>
              </div>
              
              {/* Decorative pulse */}
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
              {/* Animated background */}
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
              
              {/* Temperature indicator */}
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
              
              {/* Decorative thermometer icon */}
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
              {/* Animated background */}
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
              
              {/* Performance chart mockup */}
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
              
              {/* Decorative chart icon */}
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
      </motion.div>

      {/* Bottom spacer */}
      <div className="h-16"></div>
    </div>
  );
}