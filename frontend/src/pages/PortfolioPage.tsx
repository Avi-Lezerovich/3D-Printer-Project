import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, Printer, Activity, FileText, Clock, Settings,
  TrendingUp, Thermometer, Wifi, CheckCircle, Play,
  BarChart3, Users, Shield, Zap
} from 'lucide-react';
import { useAppStore } from '../shared/store';
import { LoadingSpinner, SkeletonCard } from '../shared/components/ui/feedback';
import {
  Hero,
  Skills,
  Timeline,
  ProjectStatus,
  Transformation,
  AnimatedCounter
} from '../features/portfolio';

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
    title: 'System Uptime',
    value: '99.8%',
    change: '+0.2%',
    icon: Activity,
    color: 'purple',
    trend: 'up'
  },
  {
    title: 'Print Success Rate',
    value: '94.2%',
    change: '+2.1%',
    icon: TrendingUp,
    color: 'orange',
    trend: 'up'
  }
];

export default function PortfolioPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="portfolio-loading">
        <LoadingSpinner />
        <div className="loading-skeleton">
          {[1, 2, 3, 4].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="portfolio-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Hero />
      </motion.div>

      <motion.div variants={itemVariants} className="quick-stats">
        <div className="stats-grid">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                className={`stat-card stat-${stat.color}`}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="stat-header">
                  <Icon className="w-6 h-6" />
                  <span className={`trend-indicator trend-${stat.trend}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">
                    <AnimatedCounter value={stat.value} duration={1000 + index * 200} />
                  </h3>
                  <p className="stat-label">{stat.title}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Skills />
      </motion.div>

      <motion.div variants={itemVariants}>
        <ProjectStatus />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Transformation />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Timeline />
      </motion.div>
    </motion.div>
  );
}