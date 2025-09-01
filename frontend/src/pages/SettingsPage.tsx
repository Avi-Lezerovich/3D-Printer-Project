import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../shared/store';
import { 
  Settings as SettingsIcon, Save, RotateCcw, AlertCircle, CheckCircle
} from 'lucide-react';
import { 
  GeneralSettings,
  PrinterSettings, 
  NotificationSettings
} from '../features/settings';
import '../styles/modern-settings.css';

const SettingsPage: React.FC = () => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, []);

  const handleReset = useCallback(() => {
    // Reset all settings to default
    setHasUnsavedChanges(false);
    setSaveStatus('idle');
  }, []);

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="header-left">
          <h1 className="settings-title">
            <SettingsIcon className="w-6 h-6" />
            Settings
          </h1>
          <p className="settings-subtitle">
            Configure your 3D printer system preferences
          </p>
        </div>

        <div className="header-actions">
          <button
            onClick={handleReset}
            className="btn-secondary"
            disabled={!hasUnsavedChanges}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          
          <button
            onClick={handleSave}
            className={`btn-primary ${saveStatus === 'saving' ? 'loading' : ''}`}
            disabled={!hasUnsavedChanges || saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? (
              <div className="spinner" />
            ) : saveStatus === 'saved' ? (
              <CheckCircle className="w-4 h-4" />
            ) : saveStatus === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Error' : 'Save Changes'}
          </button>
        </div>
      </div>

      <motion.div 
        className="settings-sections"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <GeneralSettings />
        <PrinterSettings />
        <NotificationSettings />
      </motion.div>

      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            className="unsaved-changes-banner"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <AlertCircle className="w-5 h-5" />
            <span>You have unsaved changes</span>
            <div className="banner-actions">
              <button onClick={handleReset} className="btn-text">
                Discard
              </button>
              <button onClick={handleSave} className="btn-primary-small">
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;