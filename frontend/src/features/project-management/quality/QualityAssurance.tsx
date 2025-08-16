/**
 * Quality Assurance
 * Testing protocols, quality metrics, and validation procedures
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QualityTest {
  id: string;
  name: string;
  description: string;
  category: 'functional' | 'performance' | 'usability' | 'reliability';
  status: 'passed' | 'failed' | 'pending' | 'skipped';
  priority: 'high' | 'medium' | 'low';
  lastRun: string;
  duration: string;
  result?: string;
  coverage?: number;
}

interface QualityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: 'performance' | 'quality' | 'reliability' | 'user-experience';
}

interface IssueReport {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'major' | 'minor' | 'trivial';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignee: string;
  created: string;
  updated: string;
}

const QUALITY_TESTS: QualityTest[] = [
  {
    id: 'print-quality',
    name: 'Print Quality Assessment',
    description: 'Evaluate dimensional accuracy, surface finish, and structural integrity',
    category: 'functional',
    status: 'passed',
    priority: 'high',
    lastRun: '2025-01-15',
    duration: '2h 30m',
    result: 'All dimensional tolerances met within ±0.1mm',
    coverage: 95
  },
  {
    id: 'temperature-stability',
    name: 'Temperature Stability Test',
    description: 'Monitor nozzle and bed temperature consistency during printing',
    category: 'performance',
    status: 'passed',
    priority: 'high',
    lastRun: '2025-01-14',
    duration: '4h 15m',
    result: 'Temperature variance within ±2°C tolerance',
    coverage: 100
  },
  {
    id: 'filament-compatibility',
    name: 'Filament Compatibility Check',
    description: 'Test compatibility with various filament types and brands',
    category: 'functional',
    status: 'pending',
    priority: 'medium',
    lastRun: '2025-01-10',
    duration: '1h 45m',
    coverage: 60
  },
  {
    id: 'user-interface',
    name: 'User Interface Testing',
    description: 'Validate control panel responsiveness and usability',
    category: 'usability',
    status: 'passed',
    priority: 'medium',
    lastRun: '2025-01-13',
    duration: '45m',
    result: 'All UI elements responsive, intuitive navigation confirmed',
    coverage: 88
  },
  {
    id: 'stress-test',
    name: '24-Hour Stress Test',
    description: 'Continuous operation test to validate long-term reliability',
    category: 'reliability',
    status: 'failed',
    priority: 'high',
    lastRun: '2025-01-12',
    duration: '24h 0m',
    result: 'Print head calibration drift detected after 18 hours',
    coverage: 75
  }
];

const QUALITY_METRICS: QualityMetric[] = [
  {
    id: 'accuracy',
    name: 'Dimensional Accuracy',
    value: 98.5,
    target: 95,
    unit: '%',
    trend: 'up',
    category: 'quality'
  },
  {
    id: 'reliability',
    name: 'System Reliability',
    value: 94.2,
    target: 90,
    unit: '%',
    trend: 'stable',
    category: 'reliability'
  },
  {
    id: 'print-speed',
    name: 'Average Print Speed',
    value: 85,
    target: 80,
    unit: 'mm/s',
    trend: 'up',
    category: 'performance'
  },
  {
    id: 'success-rate',
    name: 'Print Success Rate',
    value: 92.8,
    target: 85,
    unit: '%',
    trend: 'up',
    category: 'quality'
  }
];

const ISSUE_REPORTS: IssueReport[] = [
  {
    id: 'issue-1',
    title: 'Calibration Drift in Extended Prints',
    description: 'Print head loses calibration during prints longer than 18 hours',
    severity: 'major',
    status: 'in-progress',
    assignee: 'Engineering Team',
    created: '2025-01-12',
    updated: '2025-01-15'
  },
  {
    id: 'issue-2',
    title: 'Inconsistent First Layer Adhesion',
    description: 'First layer adhesion varies across different areas of the print bed',
    severity: 'minor',
    status: 'resolved',
    assignee: 'QA Team',
    created: '2025-01-08',
    updated: '2025-01-14'
  }
];

export const QualityAssurance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tests' | 'metrics' | 'issues' | 'reports'>('tests');
  const [selectedTest, setSelectedTest] = useState<QualityTest | null>(null);
  const [tests] = useState<QualityTest[]>(QUALITY_TESTS);
  const [metrics] = useState<QualityMetric[]>(QUALITY_METRICS);
  const [issues] = useState<IssueReport[]>(ISSUE_REPORTS);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
      case 'resolved':
      case 'closed':
        return 'var(--pm-success-500)';
      case 'failed':
      case 'critical':
      case 'major':
        return 'var(--pm-danger-500)';
      case 'pending':
      case 'in-progress':
      case 'minor':
        return 'var(--pm-warning-500)';
      case 'skipped':
      case 'trivial':
        return 'var(--pm-gray-400)';
      default:
        return 'var(--pm-gray-400)';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'var(--pm-danger-500)';
      case 'medium':
        return 'var(--pm-warning-500)';
      case 'low':
        return 'var(--pm-success-500)';
      default:
        return 'var(--pm-gray-400)';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'functional':
        return '⚙️';
      case 'performance':
        return '⚡';
      case 'usability':
        return '👤';
      case 'reliability':
        return '🛡️';
      case 'quality':
        return '💎';
      case 'user-experience':
        return '😊';
      default:
        return '📊';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '➡️';
    }
  };

  const calculateOverallQuality = () => {
    const passedTests = tests.filter(t => t.status === 'passed').length;
    const totalTests = tests.length;
    return Math.round((passedTests / totalTests) * 100);
  };

  return (
    <div className="quality-assurance">
      {/* Header */}
      <div className="qa-header">
        <div className="header-left">
          <h2>🎯 Quality Assurance</h2>
          <p>Testing protocols, metrics, and quality validation</p>
        </div>
        
        <div className="header-actions">
          <button className="run-tests-btn">
            ▶️ Run All Tests
          </button>
          <button className="new-test-btn">
            + New Test
          </button>
        </div>
      </div>

      {/* Quality Overview */}
      <div className="qa-overview">
        <div className="overview-card">
          <div className="overview-metric">
            <span className="metric-value">{calculateOverallQuality()}%</span>
            <span className="metric-label">Overall Quality Score</span>
          </div>
          <div className="quality-ring">
            <svg width="80" height="80">
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="6"
              />
              <motion.circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="var(--pm-success-500)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 35}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
                animate={{ 
                  strokeDashoffset: 2 * Math.PI * 35 * (1 - calculateOverallQuality() / 100)
                }}
                transition={{ duration: 1.5, delay: 0.5 }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px' }}
              />
            </svg>
          </div>
        </div>
        
        <div className="overview-stats">
          <div className="stat">
            <span className="stat-value">{tests.filter(t => t.status === 'passed').length}</span>
            <span className="stat-label">Tests Passed</span>
          </div>
          <div className="stat">
            <span className="stat-value">{tests.filter(t => t.status === 'failed').length}</span>
            <span className="stat-label">Tests Failed</span>
          </div>
          <div className="stat">
            <span className="stat-value">{issues.filter(i => i.status === 'open' || i.status === 'in-progress').length}</span>
            <span className="stat-label">Open Issues</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="qa-navigation">
        <button 
          className={activeTab === 'tests' ? 'active' : ''}
          onClick={() => setActiveTab('tests')}
        >
          🧪 Test Suite
        </button>
        <button 
          className={activeTab === 'metrics' ? 'active' : ''}
          onClick={() => setActiveTab('metrics')}
        >
          📊 Quality Metrics
        </button>
        <button 
          className={activeTab === 'issues' ? 'active' : ''}
          onClick={() => setActiveTab('issues')}
        >
          🐛 Issue Tracking
        </button>
        <button 
          className={activeTab === 'reports' ? 'active' : ''}
          onClick={() => setActiveTab('reports')}
        >
          📋 Test Reports
        </button>
      </div>

      {/* Content */}
      <div className="qa-content">
        {activeTab === 'tests' && (
          <div className="tests-view">
            <div className="tests-grid">
              {tests.map((test, index) => (
                <motion.div
                  key={test.id}
                  className={`test-card ${test.status}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedTest(test)}
                >
                  <div className="test-header">
                    <div className="test-category">
                      <span className="category-icon">{getCategoryIcon(test.category)}</span>
                      <span className="category-name">{test.category}</span>
                    </div>
                    <div 
                      className="priority-indicator"
                      style={{ backgroundColor: getPriorityColor(test.priority) }}
                    >
                      {test.priority}
                    </div>
                  </div>
                  
                  <h3 className="test-name">{test.name}</h3>
                  <p className="test-description">{test.description}</p>
                  
                  <div className="test-meta">
                    <div className="meta-item">
                      <span>Last Run:</span>
                      <span>{test.lastRun}</span>
                    </div>
                    <div className="meta-item">
                      <span>Duration:</span>
                      <span>{test.duration}</span>
                    </div>
                    {test.coverage && (
                      <div className="meta-item">
                        <span>Coverage:</span>
                        <span>{test.coverage}%</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="test-status">
                    <span 
                      className={`status-badge ${test.status}`}
                      style={{ backgroundColor: getStatusColor(test.status) }}
                    >
                      {test.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="metrics-view">
            <div className="metrics-grid">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.id}
                  className="metric-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="metric-header">
                    <div className="metric-category">
                      <span className="category-icon">{getCategoryIcon(metric.category)}</span>
                      <span className="trend-icon">{getTrendIcon(metric.trend)}</span>
                    </div>
                  </div>
                  
                  <div className="metric-content">
                    <h3 className="metric-name">{metric.name}</h3>
                    <div className="metric-value-display">
                      <span className="metric-current">{metric.value}</span>
                      <span className="metric-unit">{metric.unit}</span>
                    </div>
                    <div className="metric-target">
                      Target: {metric.target}{metric.unit}
                    </div>
                  </div>
                  
                  <div className="metric-progress">
                    <div className="progress-bar">
                      <motion.div 
                        className={`progress-fill ${metric.value >= metric.target ? 'success' : 'warning'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                      />
                    </div>
                    <span className="progress-percentage">
                      {Math.round((metric.value / metric.target) * 100)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="issues-view">
            <div className="issues-list">
              {issues.map((issue, index) => (
                <motion.div
                  key={issue.id}
                  className={`issue-item ${issue.status}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="issue-header">
                    <div className="issue-priority">
                      <span 
                        className={`severity-badge ${issue.severity}`}
                        style={{ backgroundColor: getStatusColor(issue.severity) }}
                      >
                        {issue.severity}
                      </span>
                    </div>
                    <div className="issue-meta">
                      <span className="issue-id">#{issue.id}</span>
                      <span className="issue-date">Created {issue.created}</span>
                    </div>
                  </div>
                  
                  <h3 className="issue-title">{issue.title}</h3>
                  <p className="issue-description">{issue.description}</p>
                  
                  <div className="issue-footer">
                    <div className="issue-assignee">
                      <span>Assigned to: {issue.assignee}</span>
                    </div>
                    <div className="issue-status">
                      <span 
                        className={`status-badge ${issue.status}`}
                        style={{ backgroundColor: getStatusColor(issue.status) }}
                      >
                        {issue.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-view">
            <div className="reports-placeholder">
              <div className="placeholder-icon">📋</div>
              <h3>Test Reports</h3>
              <p>Detailed test reports and quality assessments will be displayed here.</p>
              <button className="btn-primary">Generate Report</button>
            </div>
          </div>
        )}
      </div>

      {/* Test Detail Modal */}
      <AnimatePresence>
        {selectedTest && (
          <motion.div
            className="test-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTest(null)}
          >
            <motion.div
              className="test-detail-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h3>{selectedTest.name}</h3>
                  <p>{selectedTest.description}</p>
                </div>
                <button onClick={() => setSelectedTest(null)}>✕</button>
              </div>
              
              <div className="modal-content">
                <div className="test-details-grid">
                  <div className="detail-section">
                    <h4>Test Information</h4>
                    <div className="detail-list">
                      <div className="detail-item">
                        <span>Category:</span>
                        <span>{selectedTest.category}</span>
                      </div>
                      <div className="detail-item">
                        <span>Priority:</span>
                        <span className={`priority ${selectedTest.priority}`}>
                          {selectedTest.priority}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span>Status:</span>
                        <span className={`status ${selectedTest.status}`}>
                          {selectedTest.status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span>Last Run:</span>
                        <span>{selectedTest.lastRun}</span>
                      </div>
                      <div className="detail-item">
                        <span>Duration:</span>
                        <span>{selectedTest.duration}</span>
                      </div>
                      {selectedTest.coverage && (
                        <div className="detail-item">
                          <span>Coverage:</span>
                          <span>{selectedTest.coverage}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedTest.result && (
                    <div className="detail-section">
                      <h4>Test Results</h4>
                      <p className="test-result">{selectedTest.result}</p>
                    </div>
                  )}
                </div>
                
                <div className="modal-actions">
                  <button className="btn-primary">Run Test</button>
                  <button className="btn-secondary">Edit Test</button>
                  <button className="btn-outline">View History</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
