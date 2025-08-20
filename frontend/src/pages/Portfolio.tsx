import { motion } from 'framer-motion';
import { 
  Monitor, Printer, Activity, FileText, Clock, Settings,
  TrendingUp, Thermometer, Wifi, CheckCircle, Play,
  BarChart3, Users, Shield, Zap
} from 'lucide-react';
import { useAppStore } from '../shared/store';

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
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-all duration-300 ${
      sidebarCollapsed ? 'ml-16' : 'ml-64'
    }`}>
      {/* Fixed Header */}
      <div className="fixed top-0 right-0 left-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50" 
           style={{ marginLeft: sidebarCollapsed ? '64px' : '256px' }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                3D Printer Control System
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Professional remote monitoring and control for your 3D printing workflow
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">All Systems Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <motion.div 
        className="pt-24 px-6 pb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-12"
          variants={itemVariants}
        >
          <h2 className="text-5xl font-bold text-white mb-6">
            Welcome to Your
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              3D Printing Dashboard
            </span>
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed mb-8">
            Monitor, control, and optimize your 3D printing operations from anywhere. 
            Get real-time insights, manage multiple printers, and ensure perfect prints every time.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={itemVariants}
        >
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${getStatColor(stat.color)} backdrop-blur-md border rounded-xl p-6 hover:bg-opacity-80 transition-all duration-300 cursor-pointer group`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${getStatColor(stat.color)} rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.title}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
          variants={itemVariants}
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-8 hover:bg-slate-800/60 transition-all duration-300 group"
              >
                <div className={`inline-flex p-4 ${getFeatureColor(feature.color)} rounded-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div 
            className="lg:col-span-2 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6"
            variants={itemVariants}
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Activity className="w-6 h-6 mr-3 text-blue-400" />
              Recent Activity
            </h3>

            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors duration-200"
                  >
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{activity.title}</h4>
                      <p className="text-slate-400 text-sm">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <button className="w-full py-3 bg-slate-600/50 hover:bg-slate-600/70 border border-slate-500/50 hover:border-slate-400/50 rounded-lg text-slate-300 font-medium transition-all duration-200 flex items-center justify-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>View All Activity</span>
              </button>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6"
            variants={itemVariants}
          >
            <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>

            <div className="space-y-3">
              <button className="w-full p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-lg text-blue-400 font-medium transition-all duration-200 flex items-center justify-center space-x-2">
                <Monitor className="w-5 h-5" />
                <span>Control Panel</span>
              </button>

              <button className="w-full p-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/50 rounded-lg text-green-400 font-medium transition-all duration-200 flex items-center justify-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Upload File</span>
              </button>

              <button className="w-full p-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-lg text-purple-400 font-medium transition-all duration-200 flex items-center justify-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Analytics</span>
              </button>

              <button className="w-full p-4 bg-slate-600/50 hover:bg-slate-600/70 border border-slate-500/50 hover:border-slate-400/50 rounded-lg text-slate-300 font-medium transition-all duration-200 flex items-center justify-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* System Status */}
        <motion.div 
          className="mt-12 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6"
          variants={itemVariants}
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Thermometer className="w-6 h-6 mr-3 text-blue-400" />
            System Status Overview
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400 mb-2">98.5%</div>
              <div className="text-slate-300">Uptime</div>
              <div className="text-xs text-slate-400 mt-1">Last 30 days</div>
            </div>

            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-400 mb-2">24.2°C</div>
              <div className="text-slate-300">Room Temperature</div>
              <div className="text-xs text-slate-400 mt-1">Optimal range</div>
            </div>

            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-400 mb-2">2.1TB</div>
              <div className="text-slate-300">Storage Used</div>
              <div className="text-xs text-slate-400 mt-1">of 5TB available</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
