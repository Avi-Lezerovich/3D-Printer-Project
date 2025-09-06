import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../shared/store';
import { containerVariants } from './portfolio/animations';
import {
  PortfolioHeader,
  HeroSection,
  QuickStatsGrid,
  FeaturesGrid,
  RecentActivity,
  QuickActions,
  SystemStatus
} from './portfolio/components';

export default function Portfolio() {
  const { sidebarCollapsed } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 transition-all duration-300 ${
      sidebarCollapsed ? 'ml-16' : 'ml-64'
    }`}>
      <PortfolioHeader sidebarCollapsed={sidebarCollapsed} />

      <motion.div 
        className="pt-28 px-8 pb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <HeroSection />
        <QuickStatsGrid />
        <FeaturesGrid />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <RecentActivity isLoading={isLoading} />
          <QuickActions />
        </div>

        <SystemStatus />
      </motion.div>

      <div className="h-16"></div>
    </div>
  );
}