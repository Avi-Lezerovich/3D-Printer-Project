import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../shared/store';
import { 
  Settings as SettingsIcon, User, Bell, Palette, Shield, Monitor,
  Save, RotateCcw
} from 'lucide-react';
import '../styles/modern-settings.css';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  description?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label, description }) => (
  <div className="toggle-container">
    <div className="toggle-content">
      <label htmlFor={id} className="toggle-label">{label}</label>
      {description && <p className="toggle-description">{description}</p>}
    </div>
    <label className="toggle-switch">
      <input type="checkbox" id={id} checked={checked} onChange={onChange} />
      <span className="toggle-slider"></span>
    </label>
  </div>
);

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

export default function Settings() {
  const { sidebarCollapsed, theme } = useAppStore();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    printComplete: true,
    lowFilament: false,
    maintenance: true,
    emailNotifications: true,
    pushNotifications: false,
    systemUpdates: true,
  });

  const [profile, setProfile] = useState({
    username: 'Avi Lezerov',
    email: 'avi.lezerov@example.com',
    phone: '+1 (555) 123-4567',
    bio: '3D Printing Enthusiast & Restoration Expert'
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications({
      ...notifications,
      [e.target.id]: e.target.checked,
    });
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfile({
      ...profile,
      [field]: value,
    });
  };

  const handleSave = () => {
    // Implement save functionality
    // eslint-disable-next-line no-console
    console.log('Settings saved:', { profile, notifications });
  };

  const handleReset = () => {
    // Reset to defaults
    setProfile({
      username: 'Avi Lezerov',
      email: 'avi.lezerov@example.com',
      phone: '+1 (555) 123-4567',
      bio: '3D Printing Enthusiast & Restoration Expert'
    });
    setNotifications({
      printComplete: true,
      lowFilament: false,
      maintenance: true,
      emailNotifications: true,
      pushNotifications: false,
      systemUpdates: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Fixed Navigation Tabs */}
      <div 
        className={`fixed top-0 z-50 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 transition-all duration-300 ${
          sidebarCollapsed ? 'left-[70px] right-0' : 'left-[280px] right-0'
        } max-lg:left-0 max-lg:right-0`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center">
                <SettingsIcon className="w-7 h-7 text-blue-400 mr-3" />
                Settings & Preferences
              </h1>
              <p className="text-slate-400 text-sm">Customize your 3D Printer Project experience</p>
            </div>
          </div>
          
          <div className="flex space-x-1 bg-slate-800/50 backdrop-blur-sm p-1 rounded-xl border border-slate-700/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:block">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content with top padding */}
      <motion.div 
        className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Tab Content */}
        <motion.div 
          className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"
          variants={itemVariants}
        >
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <User className="w-6 h-6 text-blue-400 mr-3" />
                  Profile Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                    <input
                      type="text"
                      id="username"
                      value={profile.username}
                      onChange={(e) => handleProfileChange('username', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={profile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                    <textarea
                      id="bio"
                      rows={3}
                      value={profile.bio}
                      onChange={(e) => handleProfileChange('bio', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Bell className="w-6 h-6 text-blue-400 mr-3" />
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <ToggleSwitch
                    id="printComplete"
                    checked={notifications.printComplete}
                    onChange={handleNotificationChange}
                    label="Print Complete"
                    description="Get notified when a print job finishes"
                  />
                  <ToggleSwitch
                    id="lowFilament"
                    checked={notifications.lowFilament}
                    onChange={handleNotificationChange}
                    label="Low Filament"
                    description="Alert when filament is running low"
                  />
                  <ToggleSwitch
                    id="maintenance"
                    checked={notifications.maintenance}
                    onChange={handleNotificationChange}
                    label="Maintenance Reminders"
                    description="Scheduled maintenance notifications"
                  />
                  <ToggleSwitch
                    id="emailNotifications"
                    checked={notifications.emailNotifications}
                    onChange={handleNotificationChange}
                    label="Email Notifications"
                    description="Receive notifications via email"
                  />
                  <ToggleSwitch
                    id="pushNotifications"
                    checked={notifications.pushNotifications}
                    onChange={handleNotificationChange}
                    label="Push Notifications"
                    description="Browser push notifications"
                  />
                  <ToggleSwitch
                    id="systemUpdates"
                    checked={notifications.systemUpdates}
                    onChange={handleNotificationChange}
                    label="System Updates"
                    description="Updates about new features and improvements"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Palette className="w-6 h-6 text-blue-400 mr-3" />
                  Appearance & Theme
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">Color Theme</label>
                    <div className="flex space-x-4">
                      <button
                        className={`px-4 py-3 rounded-lg border transition-all duration-200 flex items-center space-x-2 ${
                          theme === 'dark'
                            ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                            : 'bg-slate-700/30 border-slate-600/50 text-slate-400 hover:bg-slate-600/30'
                        }`}
                      >
                        <span>🌙</span>
                        <span>Dark Theme</span>
                      </button>
                      <button
                        className={`px-4 py-3 rounded-lg border transition-all duration-200 flex items-center space-x-2 ${
                          theme === 'light'
                            ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                            : 'bg-slate-700/30 border-slate-600/50 text-slate-400 hover:bg-slate-600/30'
                        }`}
                      >
                        <span>☀️</span>
                        <span>Light Theme</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Shield className="w-6 h-6 text-blue-400 mr-3" />
                  Security & Privacy
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Monitor className="w-6 h-6 text-blue-400 mr-3" />
                  System Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-1">Application Version</div>
                    <div className="text-white font-medium">v2.1.0</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-1">Last Update</div>
                    <div className="text-white font-medium">Aug 21, 2025</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-1">Storage Used</div>
                    <div className="text-white font-medium">2.3 GB / 10 GB</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-sm text-slate-400 mb-1">Connection Status</div>
                    <div className="text-green-400 font-medium flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Online
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-slate-700/50">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/50 hover:border-slate-500/50 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Defaults</span>
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 hover:border-blue-500/50 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
