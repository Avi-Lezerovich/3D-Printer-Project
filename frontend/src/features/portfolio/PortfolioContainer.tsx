import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Hero, 
  Skills, 
  Timeline, 
  ProjectStatus, 
  Transformation, 
  AnimatedCounter 
} from './components';
import { LoadingSpinner, SkeletonCard } from '../../shared/components/ui/feedback';
import { portfolioAnimations } from './animations';
import { usePortfolioStats } from './hooks';

const { containerVariants, itemVariants } = portfolioAnimations;

/**
 * Professional Portfolio Container Component
 * 
 * Enterprise-grade portfolio implementation showcasing:
 * - Clean separation of concerns
 * - Custom hooks for business logic
 * - TypeScript integration
 * - Responsive animations with loading states
 * - Modular component composition
 */
export default function PortfolioContainer() {
  const [isLoading, setIsLoading] = useState(true);
  const { quickStats } = usePortfolioStats();
  
  useEffect(() => {
    // Simulate realistic loading for portfolio content
    const loadingTimer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(loadingTimer);
  }, []);

  if (isLoading) {
    return (
      <div className="portfolio-loading">
        <LoadingSpinner />
        <div className="loading-skeleton">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
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
      {/* Hero Section */}
      <motion.div variants={itemVariants}>
        <Hero />
      </motion.div>

      {/* Quick Stats Section */}
      <motion.div variants={itemVariants} className="quick-stats">
        <div className="stats-grid">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            // Parse numeric value from stat.value string
            const numericValue = parseFloat(stat.value.replace(/[^0-9.]/g, '')) || 0;
            
            return (
              <motion.div
                key={stat.title}
                className={`stat-card stat-${stat.color}`}
                variants={itemVariants}
                whileHover={{ 
                  y: -4, 
                  transition: { duration: 0.2 } 
                }}
              >
                <div className="stat-header">
                  <IconComponent className="w-6 h-6" />
                  <span className={`trend-indicator trend-${stat.trend}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">
                    <AnimatedCounter 
                      end={numericValue}
                      duration={1000 + index * 200}
                      suffix={stat.value.replace(/[0-9.]/g, '')}
                    />
                  </h3>
                  <p className="stat-label">{stat.title}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Portfolio Content Sections */}
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
