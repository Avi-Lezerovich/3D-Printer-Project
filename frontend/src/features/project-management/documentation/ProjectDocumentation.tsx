/**
 * Project Documentation
 * Knowledge base and documentation management for the project
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  lastUpdated: string;
  status: 'complete' | 'draft' | 'needs-review';
  wordCount: number;
}

interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  created: string;
  updated: string;
  status: 'published' | 'draft' | 'archived';
}

const DOCUMENT_SECTIONS: DocumentSection[] = [
  {
    id: 'overview',
    title: 'Project Overview',
    icon: '📋',
    description: 'High-level project description, goals, and scope',
    lastUpdated: '2025-01-15',
    status: 'complete',
    wordCount: 847
  },
  {
    id: 'hardware',
    title: 'Hardware Documentation',
    icon: '⚙️',
    description: 'Component specifications, wiring diagrams, and assembly guide',
    lastUpdated: '2025-01-12',
    status: 'complete',
    wordCount: 1523
  },
  {
    id: 'software',
    title: 'Software Architecture',
    icon: '💻',
    description: 'Code structure, API documentation, and development guide',
    lastUpdated: '2025-01-14',
    status: 'draft',
    wordCount: 956
  },
  {
    id: 'user-guide',
    title: 'User Manual',
    icon: '👤',
    description: 'Step-by-step user instructions and troubleshooting',
    lastUpdated: '2025-01-10',
    status: 'needs-review',
    wordCount: 634
  },
  {
    id: 'testing',
    title: 'Testing Procedures',
    icon: '🧪',
    description: 'Quality assurance tests and validation protocols',
    lastUpdated: '2025-01-13',
    status: 'draft',
    wordCount: 423
  },
  {
    id: 'maintenance',
    title: 'Maintenance Guide',
    icon: '🔧',
    description: 'Regular maintenance tasks and troubleshooting',
    lastUpdated: '2025-01-08',
    status: 'draft',
    wordCount: 287
  }
];

const SAMPLE_DOCUMENTS: Document[] = [
  {
    id: 'setup-guide',
    title: 'Initial Setup Guide',
    content: `# 3D Printer Initial Setup Guide

## Prerequisites
- Assembled 3D printer hardware
- Computer with USB port
- Printer filament (PLA recommended for first prints)

## Step 1: Physical Setup
1. Place printer on stable, level surface
2. Check all connections are secure
3. Install filament spool

## Step 2: Software Installation
1. Download and install printer control software
2. Install necessary drivers
3. Configure printer settings

## Step 3: First Print
1. Load a test model
2. Heat the nozzle and bed
3. Start the print and monitor closely

## Troubleshooting
- If print doesn't stick: Adjust bed leveling
- If layers don't stick: Check nozzle temperature
- If print quality is poor: Calibrate settings`,
    category: 'Setup',
    tags: ['setup', 'beginner', 'hardware'],
    author: 'Project Team',
    created: '2025-01-10',
    updated: '2025-01-15',
    status: 'published'
  },
  {
    id: 'calibration',
    title: 'Printer Calibration Process',
    content: `# Printer Calibration Process

## Bed Leveling
Proper bed leveling is crucial for successful prints...

## Temperature Calibration
Different filaments require different temperatures...

## Flow Rate Adjustment
Calibrating the extruder flow rate ensures proper material deposition...`,
    category: 'Calibration',
    tags: ['calibration', 'quality', 'setup'],
    author: 'Project Team',
    created: '2025-01-12',
    updated: '2025-01-14',
    status: 'published'
  }
];

export const ProjectDocumentation: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<DocumentSection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [view, setView] = useState<'sections' | 'documents' | 'search'>('sections');
  const [sections] = useState<DocumentSection[]>(DOCUMENT_SECTIONS);
  const [documents] = useState<Document[]>(SAMPLE_DOCUMENTS);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'var(--pm-success-500)';
      case 'published':
        return 'var(--pm-success-500)';
      case 'draft':
        return 'var(--pm-warning-500)';
      case 'needs-review':
        return 'var(--pm-danger-500)';
      case 'archived':
        return 'var(--pm-gray-400)';
      default:
        return 'var(--pm-gray-400)';
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="project-documentation">
      {/* Header */}
      <div className="documentation-header">
        <div className="header-left">
          <h2>📋 Project Documentation</h2>
          <p>Knowledge base and technical documentation</p>
        </div>
        
        <div className="header-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">🔍</button>
          </div>
          
          <div className="view-toggle">
            <button 
              className={view === 'sections' ? 'active' : ''}
              onClick={() => setView('sections')}
            >
              Sections
            </button>
            <button 
              className={view === 'documents' ? 'active' : ''}
              onClick={() => setView('documents')}
            >
              Documents
            </button>
          </div>
          
          <button className="add-doc-btn">
            + New Document
          </button>
        </div>
      </div>

      {/* Documentation Stats */}
      <div className="doc-stats">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <span className="stat-value">{sections.length}</span>
            <span className="stat-label">Sections</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-value">{sections.filter(s => s.status === 'complete').length}</span>
            <span className="stat-label">Complete</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <span className="stat-value">{sections.reduce((sum, s) => sum + s.wordCount, 0).toLocaleString()}</span>
            <span className="stat-label">Total Words</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-value">{Math.round((sections.filter(s => s.status === 'complete').length / sections.length) * 100)}%</span>
            <span className="stat-label">Completion</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="documentation-content">
        {view === 'sections' && (
          <div className="sections-grid">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                className={`section-card ${section.status}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedSection(section)}
              >
                <div className="section-header">
                  <div className="section-icon">{section.icon}</div>
                  <div className="section-meta">
                    <span className={`status-indicator ${section.status}`}>
                      {section.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                
                <h3 className="section-title">{section.title}</h3>
                <p className="section-description">{section.description}</p>
                
                <div className="section-footer">
                  <div className="section-stats">
                    <span className="word-count">{section.wordCount.toLocaleString()} words</span>
                    <span className="last-updated">Updated {section.lastUpdated}</span>
                  </div>
                  
                  <div 
                    className="status-dot"
                    style={{ backgroundColor: getStatusColor(section.status) }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {view === 'documents' && (
          <div className="documents-list">
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                className="document-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedDocument(doc)}
              >
                <div className="document-header">
                  <h4 className="document-title">{doc.title}</h4>
                  <div className="document-meta">
                    <span className="document-category">{doc.category}</span>
                    <span className={`document-status ${doc.status}`}>
                      {doc.status}
                    </span>
                  </div>
                </div>
                
                <p className="document-preview">
                  {doc.content.substring(0, 150)}...
                </p>
                
                <div className="document-footer">
                  <div className="document-tags">
                    {doc.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="document-info">
                    <span>By {doc.author}</span>
                    <span>Updated {doc.updated}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Section Detail Modal */}
      <AnimatePresence>
        {selectedSection && (
          <motion.div
            className="section-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSection(null)}
          >
            <motion.div
              className="section-detail-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="header-left">
                  <div className="section-icon-large">{selectedSection.icon}</div>
                  <div>
                    <h3>{selectedSection.title}</h3>
                    <p>{selectedSection.description}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedSection(null)}>✕</button>
              </div>
              
              <div className="modal-content">
                <div className="section-details">
                  <div className="detail-row">
                    <span>Status:</span>
                    <span className={`status-badge ${selectedSection.status}`}>
                      {selectedSection.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span>Word Count:</span>
                    <span>{selectedSection.wordCount.toLocaleString()} words</span>
                  </div>
                  <div className="detail-row">
                    <span>Last Updated:</span>
                    <span>{selectedSection.lastUpdated}</span>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button className="btn-primary">Edit Section</button>
                  <button className="btn-secondary">View Documents</button>
                  <button className="btn-outline">Export</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Detail Modal */}
      <AnimatePresence>
        {selectedDocument && (
          <motion.div
            className="document-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDocument(null)}
          >
            <motion.div
              className="document-detail-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h3>{selectedDocument.title}</h3>
                  <div className="document-meta">
                    <span>{selectedDocument.category}</span>
                    <span className={`status ${selectedDocument.status}`}>
                      {selectedDocument.status}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedDocument(null)}>✕</button>
              </div>
              
              <div className="document-content">
                <div className="document-body">
                  {selectedDocument.content.split('\n').map((line, index) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={index}>{line.substring(2)}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={index}>{line.substring(3)}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={index}>{line.substring(4)}</h3>;
                    } else if (line.trim() === '') {
                      return <br key={index} />;
                    } else {
                      return <p key={index}>{line}</p>;
                    }
                  })}
                </div>
                
                <div className="document-sidebar">
                  <div className="sidebar-section">
                    <h4>Document Info</h4>
                    <div className="info-list">
                      <div className="info-item">
                        <span>Author:</span>
                        <span>{selectedDocument.author}</span>
                      </div>
                      <div className="info-item">
                        <span>Created:</span>
                        <span>{selectedDocument.created}</span>
                      </div>
                      <div className="info-item">
                        <span>Updated:</span>
                        <span>{selectedDocument.updated}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="sidebar-section">
                    <h4>Tags</h4>
                    <div className="tag-list">
                      {selectedDocument.tags.map(tag => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="sidebar-actions">
                    <button className="btn-primary">Edit</button>
                    <button className="btn-secondary">Export</button>
                    <button className="btn-outline">Share</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
