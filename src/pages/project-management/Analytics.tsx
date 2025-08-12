import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProjectMetric, SkillDemonstration } from './types';

export default function Analytics() {
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetric[]>([]);
  const [skillDemonstrations, setSkillDemonstrations] = useState<SkillDemonstration[]>([]);

  useEffect(() => {
    // Initialize project metrics
    setProjectMetrics([
      {
        id: 'print-success-rate',
        label: 'Print Success Rate',
        value: 87,
        unit: '%',
        trend: 'up',
        change: 5,
        description: 'Percentage of prints completed without failure'
      },
      {
        id: 'avg-print-time',
        label: 'Average Print Time',
        value: 4.2,
        unit: 'hours',
        trend: 'down',
        change: -0.8,
        description: 'Mean duration for completed prints'
      },
      {
        id: 'filament-efficiency',
        label: 'Filament Efficiency',
        value: 92,
        unit: '%',
        trend: 'up',
        change: 3,
        description: 'Material utilization rate'
      },
      {
        id: 'project-completion',
        label: 'Project Completion',
        value: 68,
        unit: '%',
        trend: 'stable',
        change: 0,
        description: 'Overall project progress'
      },
      {
        id: 'cost-per-print',
        label: 'Cost per Print',
        value: 3.45,
        unit: '$',
        trend: 'down',
        change: -0.23,
        description: 'Average material and energy cost'
      },
      {
        id: 'maintenance-hours',
        label: 'Maintenance Hours',
        value: 2.1,
        unit: 'hrs/week',
        trend: 'down',
        change: -0.4,
        description: 'Time spent on printer maintenance'
      }
    ] as ProjectMetric[]);

    // Initialize skill demonstrations
    setSkillDemonstrations([
      {
        skill: 'CAD Design',
        projects: ['Custom Phone Holder', 'Miniature Robot', 'Architectural Model'],
        proficiency: 85,
        evidence: 'Complex parametric designs, assembly constraints, simulation validation',
        tools: ['Fusion 360', 'SolidWorks', 'Blender']
      },
      {
        skill: 'Problem Solving',
        projects: ['Bed Leveling Automation', 'Filament Runout Detection', 'Print Quality Optimization'],
        proficiency: 90,
        evidence: 'Systematic debugging, root cause analysis, iterative improvements',
        tools: ['Analytical thinking', 'Scientific method', 'Data analysis']
      },
      {
        skill: 'Project Management',
        projects: ['Multi-part Assembly', 'Client Commission', 'Educational Workshop'],
        proficiency: 78,
        evidence: 'Timeline planning, resource allocation, stakeholder communication',
        tools: ['Kanban boards', 'Budget tracking', 'Progress reporting']
      },
      {
        skill: 'Quality Control',
        projects: ['Dimensional Accuracy Testing', 'Surface Finish Optimization', 'Stress Testing'],
        proficiency: 82,
        evidence: 'Measurement protocols, testing procedures, continuous improvement',
        tools: ['Calipers', 'Test fixtures', 'Statistical analysis']
      },
      {
        skill: 'Technical Documentation',
        projects: ['Print Settings Guide', 'Maintenance Manual', 'Training Materials'],
        proficiency: 75,
        evidence: 'Clear instructions, visual aids, version control, user feedback',
        tools: ['Technical writing', 'Photography', 'Diagramming']
      }
    ]);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  const getTrendClass = (trend: string) => {
    switch (trend) {
      case 'up': return 'trend-up';
      case 'down': return 'trend-down';
      case 'stable': return 'trend-stable';
      default: return 'trend-unknown';
    }
  };

  const getProficiencyLevel = (proficiency: number) => {
    if (proficiency >= 90) return 'Expert';
    if (proficiency >= 75) return 'Advanced';
    if (proficiency >= 60) return 'Intermediate';
    if (proficiency >= 40) return 'Beginner';
    return 'Learning';
  };

  const getProficiencyClass = (proficiency: number) => {
    if (proficiency >= 90) return 'expert';
    if (proficiency >= 75) return 'advanced';
    if (proficiency >= 60) return 'intermediate';
    if (proficiency >= 40) return 'beginner';
    return 'learning';
  };

  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="tab-content"
    >
      <h3>Analytics & Metrics</h3>

      <div className="metrics-section">
        <h4>Project Performance</h4>
        <div className="metrics-grid">
          {projectMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              className="metric-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="metric-header">
                <h5>{metric.label}</h5>
                {metric.trend && (
                  <span className={`trend-indicator ${getTrendClass(metric.trend)}`}>
                    {getTrendIcon(metric.trend)}
                  </span>
                )}
              </div>
              
              <div className="metric-value">
                <span className="value">{metric.value}</span>
                <span className="unit">{metric.unit}</span>
              </div>
              
              {metric.change !== undefined && metric.change !== 0 && metric.trend && (
                <div className={`metric-change ${getTrendClass(metric.trend)}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}
                  {metric.unit === '%' ? 'pp' : metric.unit}
                </div>
              )}
              
              <p className="metric-description">{metric.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="skills-section">
        <h4>Skill Demonstrations</h4>
        <div className="skills-grid">
          {skillDemonstrations.map((skill, index) => (
            <motion.div
              key={skill.skill}
              className="skill-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="skill-header">
                <h5>{skill.skill}</h5>
                <div className={`proficiency-badge ${getProficiencyClass(skill.proficiency)}`}>
                  {getProficiencyLevel(skill.proficiency)}
                </div>
              </div>
              
              <div className="proficiency-bar">
                <div 
                  className="proficiency-fill"
                  style={{ width: `${skill.proficiency}%` }}
                ></div>
                <span className="proficiency-value">{skill.proficiency}%</span>
              </div>
              
              <div className="skill-details">
                <div className="projects-list">
                  <strong>Projects:</strong>
                  <ul>
                    {skill.projects.map((project, idx) => (
                      <li key={idx}>{project}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="evidence">
                  <strong>Evidence:</strong>
                  <p>{skill.evidence}</p>
                </div>
                
                <div className="tools">
                  <strong>Tools:</strong>
                  <div className="tools-tags">
                    {skill.tools.map((tool, idx) => (
                      <span key={idx} className="tool-tag">{tool}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="insights-section">
        <h4>Key Insights</h4>
        <div className="insights-grid">
          <motion.div 
            className="insight-card success"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="insight-icon">✅</div>
            <div className="insight-content">
              <h6>Strongest Area</h6>
              <p>Problem Solving shows excellent performance with 90% proficiency and systematic approach to challenges.</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="insight-card improvement"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <h6>Growth Opportunity</h6>
              <p>Technical Documentation could benefit from more structured approach and standardized templates.</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="insight-card trend"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <h6>Performance Trend</h6>
              <p>Print success rate improving consistently, indicating better process optimization and learning curve.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
