import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../shared/store';
import { Home, ArrowLeft, Search, HelpCircle, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  const { sidebarCollapsed } = useAppStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
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

  const popularPages = [
    { name: 'Portfolio', path: '/', icon: Home, description: 'View project showcase' },
    { name: 'Control Panel', path: '/control', icon: Search, description: '3D printer controls' },
    { name: 'Project Management', path: '/management', icon: Search, description: 'Manage tasks and projects' },
    { name: 'Help Center', path: '/help', icon: HelpCircle, description: 'Get support and answers' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div 
        className={`pt-16 min-h-screen flex items-center justify-center transition-all duration-300 ${
          sidebarCollapsed ? 'ml-[70px]' : 'ml-[280px]'
        } max-lg:ml-0`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* 404 Graphic */}
          <motion.div 
            className="mb-8"
            variants={itemVariants}
          >
            <div className="inline-flex items-center justify-center w-32 h-32 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-full mb-6">
              <AlertTriangle className="w-16 h-16 text-orange-400" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
              404
            </h1>
          </motion.div>

          {/* Error Message */}
          <motion.div 
            className="mb-8"
            variants={itemVariants}
          >
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-lg text-slate-400 mb-2">
              Oops! The page you&apos;re looking for seems to have wandered off into the void.
            </p>
            <p className="text-slate-500">
              Don&apos;t worry, even the best 3D printers occasionally miss a layer.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            variants={itemVariants}
          >
            <Link
              to="/"
              className="px-8 py-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 hover:border-blue-500/50 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center space-x-3"
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="px-8 py-4 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/50 hover:border-slate-500/50 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center space-x-3"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </motion.div>

          {/* Popular Pages */}
          <motion.div 
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
            variants={itemVariants}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Popular Pages
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {popularPages.map((page) => {
                const IconComponent = page.icon;
                return (
                  <Link
                    key={page.path}
                    to={page.path}
                    className="flex items-center space-x-3 p-3 bg-slate-700/30 hover:bg-slate-600/40 border border-slate-600/50 hover:border-slate-500/50 rounded-lg transition-all duration-200 text-left group"
                  >
                    <IconComponent className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                    <div>
                      <div className="font-medium text-white group-hover:text-blue-300 transition-colors">
                        {page.name}
                      </div>
                      <div className="text-sm text-slate-400">
                        {page.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Fun Easter Egg */}
          <motion.div 
            className="mt-8 text-center"
            variants={itemVariants}
          >
            <p className="text-sm text-slate-500">
              🔧 This page is currently being 3D printed... Please wait for cooling cycle to complete.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
