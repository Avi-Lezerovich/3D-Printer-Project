import { motion } from 'framer-motion';
import { Wifi } from 'lucide-react';

interface PortfolioHeaderProps {
  sidebarCollapsed: boolean;
}

export default function PortfolioHeader({ sidebarCollapsed }: PortfolioHeaderProps) {
  return (
    <div 
      className="fixed top-0 right-0 left-0 z-20 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl" 
      style={{ marginLeft: sidebarCollapsed ? '64px' : '256px' }}
    >
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
  );
}