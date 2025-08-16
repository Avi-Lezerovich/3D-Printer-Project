/**
 * Project Timeline View
 * Visual timeline showing project milestones, deadlines, and progress
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'overdue';
  category: 'design' | 'development' | 'testing' | 'deployment';
  progress: number;
  dependencies?: string[];
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'milestone' | 'task' | 'meeting' | 'deadline';
  status: 'completed' | 'active' | 'upcoming';
}

const SAMPLE_MILESTONES: Milestone[] = [
  {
    id: '1',
    title: '3D Printer Assembly Complete',
    description: 'All hardware components assembled and calibrated',
    date: '2024-12-15',
    status: 'completed',
    category: 'development',
    progress: 100
  },
  {
    id: '2',
    title: 'Software Integration',
    description: 'Printer firmware and control software setup',
    date: '2024-12-22',
    status: 'completed',
    category: 'development',
    progress: 100
  },
  {
    id: '3',
    title: 'Quality Testing Phase',
    description: 'Print quality tests and calibration validation',
    date: '2025-01-05',
    status: 'in-progress',
    category: 'testing',
    progress: 75
  },
  {
    id: '4',
    title: 'Documentation Complete',
    description: 'User manual and technical documentation',
    date: '2025-01-15',
    status: 'upcoming',
    category: 'development',
    progress: 30
  },
  {
    id: '5',
    title: 'Project Showcase',
    description: 'Final presentation and demonstration',
    date: '2025-02-01',
    status: 'upcoming',
    category: 'deployment',
    progress: 0
  }
];

const SAMPLE_EVENTS: TimelineEvent[] = [
  {
    id: 'e1',
    title: 'Weekly Progress Review',
    description: 'Team sync and progress assessment',
    date: '2025-01-20',
    type: 'meeting',
    status: 'upcoming'
  },
  {
    id: 'e2',
    title: 'Quality Test Results Due',
    description: 'Complete quality assurance testing',
    date: '2025-01-18',
    type: 'deadline',
    status: 'active'
  },
  {
    id: 'e3',
    title: 'Filament Inventory Restock',
    description: 'Order additional printing materials',
    date: '2025-01-25',
    type: 'task',
    status: 'upcoming'
  }
];

export const ProjectTimelineView: React.FC = () => {
  const [view, setView] = useState<'timeline' | 'milestones' | 'calendar'>('timeline');
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [milestones] = useState<Milestone[]>(SAMPLE_MILESTONES);
  const [events] = useState<TimelineEvent[]>(SAMPLE_EVENTS);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'var(--pm-success-500)';
      case 'in-progress':
        return 'var(--pm-primary-500)';
      case 'upcoming':
        return 'var(--pm-gray-400)';
      case 'overdue':
        return 'var(--pm-danger-500)';
      default:
        return 'var(--pm-gray-400)';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'design':
        return '🎨';
      case 'development':
        return '🔧';
      case 'testing':
        return '🧪';
      case 'deployment':
        return '🚀';
      default:
        return '📋';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return '🏁';
      case 'task':
        return '✅';
      case 'meeting':
        return '👥';
      case 'deadline':
        return '⏰';
      default:
        return '📌';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateOverallProgress = () => {
    const totalProgress = milestones.reduce((sum, m) => sum + m.progress, 0);
    return Math.round(totalProgress / milestones.length);
  };

  return (
    <div className="project-timeline-view">
      {/* Header */}
      <div className="timeline-header">
        <div className="header-left">
          <h2>📅 Project Timeline</h2>
          <p>Track milestones, deadlines, and project progress</p>
        </div>
        
        <div className="header-controls">
          <div className="view-toggle">
            <button 
              className={view === 'timeline' ? 'active' : ''}
              onClick={() => setView('timeline')}
            >
              Timeline
            </button>
            <button 
              className={view === 'milestones' ? 'active' : ''}
              onClick={() => setView('milestones')}
            >
              Milestones
            </button>
            <button 
              className={view === 'calendar' ? 'active' : ''}
              onClick={() => setView('calendar')}
            >
              Calendar
            </button>
          </div>
          
          <button className="add-milestone-btn">
            + Add Milestone
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="timeline-progress">
        <div className="progress-stats">
          <div className="stat">
            <span className="stat-value">{calculateOverallProgress()}%</span>
            <span className="stat-label">Overall Progress</span>
          </div>
          <div className="stat">
            <span className="stat-value">{milestones.filter(m => m.status === 'completed').length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat">
            <span className="stat-value">{milestones.filter(m => m.status === 'in-progress').length}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat">
            <span className="stat-value">{milestones.filter(m => m.status === 'upcoming').length}</span>
            <span className="stat-label">Upcoming</span>
          </div>
        </div>
        
        <div className="progress-bar-container">
          <div className="progress-bar">
            <motion.div 
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${calculateOverallProgress()}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="timeline-content">
        {view === 'timeline' && (
          <div className="timeline-view">
            <div className="timeline-track">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  className={`timeline-item ${milestone.status}`}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedMilestone(milestone)}
                >
                  <div className="timeline-marker">
                    <div 
                      className="marker-dot"
                      style={{ backgroundColor: getStatusColor(milestone.status) }}
                    >
                      {getCategoryIcon(milestone.category)}
                    </div>
                  </div>
                  
                  <div className="timeline-content-card">
                    <div className="card-header">
                      <h4>{milestone.title}</h4>
                      <span className="milestone-date">{formatDate(milestone.date)}</span>
                    </div>
                    
                    <p className="milestone-description">{milestone.description}</p>
                    
                    <div className="milestone-progress">
                      <div className="progress-info">
                        <span>Progress: {milestone.progress}%</span>
                        <span className={`status-badge ${milestone.status}`}>
                          {milestone.status.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="mini-progress-bar">
                        <div 
                          className="mini-progress-fill"
                          style={{ 
                            width: `${milestone.progress}%`,
                            backgroundColor: getStatusColor(milestone.status)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {view === 'milestones' && (
          <div className="milestones-grid">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                className={`milestone-card ${milestone.status}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedMilestone(milestone)}
              >
                <div className="milestone-header">
                  <div className="milestone-icon">
                    {getCategoryIcon(milestone.category)}
                  </div>
                  <div className="milestone-meta">
                    <span className="milestone-category">{milestone.category}</span>
                    <span className="milestone-date">{formatDate(milestone.date)}</span>
                  </div>
                </div>
                
                <h3 className="milestone-title">{milestone.title}</h3>
                <p className="milestone-description">{milestone.description}</p>
                
                <div className="milestone-footer">
                  <div className="progress-section">
                    <div className="progress-bar">
                      <motion.div 
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${milestone.progress}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        style={{ backgroundColor: getStatusColor(milestone.status) }}
                      />
                    </div>
                    <span className="progress-text">{milestone.progress}% Complete</span>
                  </div>
                  
                  <span className={`status-indicator ${milestone.status}`}>
                    {milestone.status.replace('-', ' ')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {view === 'calendar' && (
          <div className="calendar-view">
            <div className="calendar-header">
              <h3>Upcoming Events & Deadlines</h3>
            </div>
            
            <div className="events-list">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  className={`event-item ${event.status}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="event-icon">
                    {getTypeIcon(event.type)}
                  </div>
                  
                  <div className="event-content">
                    <h4>{event.title}</h4>
                    <p>{event.description}</p>
                    <span className="event-date">{formatDate(event.date)}</span>
                  </div>
                  
                  <div className={`event-status ${event.status}`}>
                    {event.status}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Milestone Detail Modal */}
      {selectedMilestone && (
        <div className="milestone-detail-overlay" onClick={() => setSelectedMilestone(null)}>
          <motion.div
            className="milestone-detail-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{selectedMilestone.title}</h3>
              <button onClick={() => setSelectedMilestone(null)}>✕</button>
            </div>
            
            <div className="modal-content">
              <div className="milestone-details">
                <div className="detail-row">
                  <span>Category:</span>
                  <span>{selectedMilestone.category}</span>
                </div>
                <div className="detail-row">
                  <span>Due Date:</span>
                  <span>{formatDate(selectedMilestone.date)}</span>
                </div>
                <div className="detail-row">
                  <span>Status:</span>
                  <span className={`status-badge ${selectedMilestone.status}`}>
                    {selectedMilestone.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Progress:</span>
                  <span>{selectedMilestone.progress}%</span>
                </div>
              </div>
              
              <p className="milestone-description">{selectedMilestone.description}</p>
              
              <div className="modal-actions">
                <button className="btn-primary">Edit Milestone</button>
                <button className="btn-secondary">Mark Complete</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
