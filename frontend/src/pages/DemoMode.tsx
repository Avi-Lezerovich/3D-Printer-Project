import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Shield, Info } from 'lucide-react';
import { ControlPanelContainer } from '../features/control-panel';

/**
 * Demo Mode Page - Public View-Only Access
 * 
 * This page provides a public, view-only version of the 3D printer control panel
 * that visitors can access without authentication. All controls are disabled
 * but real-time data is still displayed.
 * 
 * Key Features:
 * - No authentication required
 * - View-only mode with disabled controls
 * - Real-time data updates
 * - Professional presentation for interviews/demos
 */

const DemoMode: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Demo Mode Banner */}
      <motion.div 
        className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-blue-500/30 px-6 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Demo Mode - View Only</h1>
              <p className="text-sm text-slate-400">
                Explore the 3D printer control system with real-time data
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-amber-400">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Read-Only Access</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-600/30">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-300">All controls are disabled in demo mode</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Control Panel Content */}
      <div className="relative">
        {/* Demo overlay context */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Subtle overlay to indicate demo mode */}
          <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-amber-400">DEMO</span>
            </div>
          </div>
        </div>

        {/* Pass demo mode context to the control panel */}
        <ControlPanelContainer isDemo={true} />
      </div>

      {/* Demo Mode Footer Info */}
      <motion.div 
        className="bg-slate-900/50 border-t border-slate-700/50 px-6 py-6 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-white mb-2">Real-Time Data</h3>
              <p className="text-xs text-slate-400">
                Live temperature readings, printer status, and system metrics
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-semibold text-white mb-2">Interactive Interface</h3>
              <p className="text-xs text-slate-400">
                Professional control interface with modern design and animations
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-semibold text-white mb-2">Production Ready</h3>
              <p className="text-xs text-slate-400">
                Full-featured system ready for real 3D printer control and monitoring
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DemoMode;