/**
 * Settings Panel
 * Configuration and preferences management for the project management system
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ProjectSettings {
  general: {
    projectName: string;
    description: string;
    timezone: string;
    dateFormat: string;
    currency: string;
  };
  notifications: {
    desktopNotifications: boolean;
    emailNotifications: boolean;
    soundEnabled: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
    showAnimations: boolean;
    primaryColor: string;
  };
  data: {
    autoSave: boolean;
    autoSaveInterval: number;
    backupEnabled: boolean;
    retentionPeriod: number;
  };
  integrations: {
    gitIntegration: boolean;
    calendarSync: boolean;
    slackNotifications: boolean;
    exportFormats: string[];
  };
}

const DEFAULT_SETTINGS: ProjectSettings = {
  general: {
    projectName: '3D Printer Project',
    description: 'Advanced 3D printer development and management system',
    timezone: 'America/New_York',
    dateFormat: 'MM/dd/yyyy',
    currency: 'USD'
  },
  notifications: {
    desktopNotifications: true,
    emailNotifications: false,
    soundEnabled: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    }
  },
  appearance: {
    theme: 'light',
    compactMode: false,
    showAnimations: true,
    primaryColor: '#0ea5e9'
  },
  data: {
    autoSave: true,
    autoSaveInterval: 5,
    backupEnabled: true,
    retentionPeriod: 30
  },
  integrations: {
    gitIntegration: false,
    calendarSync: false,
    slackNotifications: false,
    exportFormats: ['JSON', 'CSV']
  }
};

export const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<ProjectSettings>(DEFAULT_SETTINGS);
  const [activeSection, setActiveSection] = useState<keyof ProjectSettings>('general');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const settingSections = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'data', label: 'Data & Backup', icon: '💾' },
    { id: 'integrations', label: 'Integrations', icon: '🔌' }
  ] as const;

  const updateSetting = <K extends keyof ProjectSettings>(
    section: K,
    key: keyof ProjectSettings[K],
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const updateNestedSetting = <K extends keyof ProjectSettings>(
    section: K,
    nestedKey: keyof ProjectSettings[K],
    key: string,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedKey]: {
          ...(prev[section][nestedKey] as any),
          [key]: value
        }
      }
    }));
    setUnsavedChanges(true);
  };

  const saveSettings = () => {
    // Here you would typically save to backend/localStorage
    console.log('Saving settings:', settings);
    setUnsavedChanges(false);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setUnsavedChanges(true);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project-settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="settings-panel">
      {/* Header */}
      <div className="settings-header">
        <div className="header-left">
          <h2>⚙️ Settings</h2>
          <p>Configure your project management preferences</p>
        </div>
        
        <div className="header-actions">
          {unsavedChanges && (
            <div className="unsaved-indicator">
              <span>●</span> Unsaved changes
            </div>
          )}
          <button onClick={exportSettings} className="btn-secondary">
            Export Settings
          </button>
          <button onClick={resetSettings} className="btn-outline">
            Reset to Default
          </button>
          <button 
            onClick={saveSettings} 
            className="btn-primary"
            disabled={!unsavedChanges}
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="settings-body">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {settingSections.map(section => (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-label">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {activeSection === 'general' && (
            <motion.div
              className="settings-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3>General Settings</h3>
              
              <div className="setting-group">
                <label className="setting-label">
                  Project Name
                  <input
                    type="text"
                    value={settings.general.projectName}
                    onChange={(e) => updateSetting('general', 'projectName', e.target.value)}
                    className="setting-input"
                  />
                </label>
                
                <label className="setting-label">
                  Description
                  <textarea
                    value={settings.general.description}
                    onChange={(e) => updateSetting('general', 'description', e.target.value)}
                    className="setting-textarea"
                    rows={3}
                  />
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  Timezone
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                    className="setting-select"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="UTC">UTC</option>
                  </select>
                </label>
                
                <label className="setting-label">
                  Date Format
                  <select
                    value={settings.general.dateFormat}
                    onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
                    className="setting-select"
                  >
                    <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                    <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                    <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                  </select>
                </label>
                
                <label className="setting-label">
                  Currency
                  <select
                    value={settings.general.currency}
                    onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                    className="setting-select"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                  </select>
                </label>
              </div>
            </motion.div>
          )}

          {activeSection === 'notifications' && (
            <motion.div
              className="settings-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3>Notification Settings</h3>
              
              <div className="setting-group">
                <div className="setting-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.desktopNotifications}
                      onChange={(e) => updateSetting('notifications', 'desktopNotifications', e.target.checked)}
                    />
                    <span className="toggle-switch"></span>
                    Desktop Notifications
                  </label>
                  <p className="setting-description">
                    Show system notifications for important updates
                  </p>
                </div>
                
                <div className="setting-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                    />
                    <span className="toggle-switch"></span>
                    Email Notifications
                  </label>
                  <p className="setting-description">
                    Receive notifications via email for critical events
                  </p>
                </div>
                
                <div className="setting-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.soundEnabled}
                      onChange={(e) => updateSetting('notifications', 'soundEnabled', e.target.checked)}
                    />
                    <span className="toggle-switch"></span>
                    Sound Notifications
                  </label>
                  <p className="setting-description">
                    Play sound alerts for notifications
                  </p>
                </div>
              </div>

              <div className="setting-group">
                <div className="setting-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.quietHours.enabled}
                      onChange={(e) => updateNestedSetting('notifications', 'quietHours', 'enabled', e.target.checked)}
                    />
                    <span className="toggle-switch"></span>
                    Quiet Hours
                  </label>
                  <p className="setting-description">
                    Disable notifications during specified hours
                  </p>
                </div>
                
                {settings.notifications.quietHours.enabled && (
                  <div className="quiet-hours-config">
                    <label className="setting-label">
                      Start Time
                      <input
                        type="time"
                        value={settings.notifications.quietHours.start}
                        onChange={(e) => updateNestedSetting('notifications', 'quietHours', 'start', e.target.value)}
                        className="setting-input"
                      />
                    </label>
                    
                    <label className="setting-label">
                      End Time
                      <input
                        type="time"
                        value={settings.notifications.quietHours.end}
                        onChange={(e) => updateNestedSetting('notifications', 'quietHours', 'end', e.target.value)}
                        className="setting-input"
                      />
                    </label>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSection === 'appearance' && (
            <motion.div
              className="settings-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3>Appearance Settings</h3>
              
              <div className="setting-group">
                <label className="setting-label">
                  Theme
                  <select
                    value={settings.appearance.theme}
                    onChange={(e) => updateSetting('appearance', 'theme', e.target.value as 'light' | 'dark' | 'auto')}
                    className="setting-select"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </label>
                
                <label className="setting-label">
                  Primary Color
                  <input
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                    className="setting-color"
                  />
                </label>
              </div>

              <div className="setting-group">
                <div className="setting-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.appearance.compactMode}
                      onChange={(e) => updateSetting('appearance', 'compactMode', e.target.checked)}
                    />
                    <span className="toggle-switch"></span>
                    Compact Mode
                  </label>
                  <p className="setting-description">
                    Use smaller spacing and components for more content
                  </p>
                </div>
                
                <div className="setting-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.appearance.showAnimations}
                      onChange={(e) => updateSetting('appearance', 'showAnimations', e.target.checked)}
                    />
                    <span className="toggle-switch"></span>
                    Animations
                  </label>
                  <p className="setting-description">
                    Enable smooth transitions and animations
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'data' && (
            <motion.div
              className="settings-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3>Data & Backup Settings</h3>
              
              <div className="setting-group">
                <div className="setting-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.data.autoSave}
                      onChange={(e) => updateSetting('data', 'autoSave', e.target.checked)}
                    />
                    <span className="toggle-switch"></span>
                    Auto-save
                  </label>
                  <p className="setting-description">
                    Automatically save changes as you work
                  </p>
                </div>
                
                {settings.data.autoSave && (
                  <label className="setting-label">
                    Auto-save Interval (minutes)
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settings.data.autoSaveInterval}
                      onChange={(e) => updateSetting('data', 'autoSaveInterval', parseInt(e.target.value))}
                      className="setting-input"
                    />
                  </label>
                )}
              </div>

              <div className="setting-group">
                <div className="setting-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.data.backupEnabled}
                      onChange={(e) => updateSetting('data', 'backupEnabled', e.target.checked)}
                    />
                    <span className="toggle-switch"></span>
                    Automatic Backups
                  </label>
                  <p className="setting-description">
                    Create regular backups of your project data
                  </p>
                </div>
                
                <label className="setting-label">
                  Retention Period (days)
                  <input
                    type="number"
                    min="7"
                    max="365"
                    value={settings.data.retentionPeriod}
                    onChange={(e) => updateSetting('data', 'retentionPeriod', parseInt(e.target.value))}
                    className="setting-input"
                  />
                </label>
              </div>

              <div className="data-actions">
                <button className="btn-secondary">Export Data</button>
                <button className="btn-secondary">Import Data</button>
                <button className="btn-outline">Clear All Data</button>
              </div>
            </motion.div>
          )}

          {activeSection === 'integrations' && (
            <motion.div
              className="settings-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3>Integration Settings</h3>
              
              <div className="setting-group">
                <div className="setting-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.integrations.gitIntegration}
                      onChange={(e) => updateSetting('integrations', 'gitIntegration', e.target.checked)}
                    />
                    <span className="toggle-switch"></span>
                    Git Integration
                  </label>
                  <p className="setting-description">
                    Sync project data with Git repository
                  </p>
                </div>
                
                <div className="setting-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.integrations.calendarSync}
                      onChange={(e) => updateSetting('integrations', 'calendarSync', e.target.checked)}
                    />
                    <span className="toggle-switch"></span>
                    Calendar Sync
                  </label>
                  <p className="setting-description">
                    Sync milestones and deadlines with your calendar
                  </p>
                </div>
                
                <div className="setting-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.integrations.slackNotifications}
                      onChange={(e) => updateSetting('integrations', 'slackNotifications', e.target.checked)}
                    />
                    <span className="toggle-switch"></span>
                    Slack Notifications
                  </label>
                  <p className="setting-description">
                    Send notifications to Slack channels
                  </p>
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">Export Formats</label>
                <div className="checkbox-group">
                  {['JSON', 'CSV', 'XML', 'PDF'].map(format => (
                    <label key={format} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={settings.integrations.exportFormats.includes(format)}
                        onChange={(e) => {
                          const formats = e.target.checked
                            ? [...settings.integrations.exportFormats, format]
                            : settings.integrations.exportFormats.filter(f => f !== format);
                          updateSetting('integrations', 'exportFormats', formats);
                        }}
                      />
                      {format}
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
