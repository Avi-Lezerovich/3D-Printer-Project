import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../shared/store';
import { 
  Settings as SettingsIcon, User, Bell, Palette, Shield, Monitor,
  Save, RotateCcw, ChevronDown, Check, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import '../styles/modern-settings.css';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  description?: string;
}

interface ValidationState {
  isValid: boolean;
  message?: string;
  type?: 'error' | 'success' | 'warning';
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
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

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  children, 
  defaultExpanded = false,
  icon 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="collapsible-section">
      <button
        className="collapsible-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium">{title}</span>
        </div>
        <ChevronDown className={`w-5 h-5 collapsible-icon ${isExpanded ? 'expanded' : ''}`} />
      </button>
      <div className={`collapsible-content ${isExpanded ? 'expanded' : ''}`}>
        {children}
      </div>
    </div>
  );
};

const EnhancedInput: React.FC<{
  type?: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  validation?: ValidationState;
  rows?: number;
}> = ({ 
  type = 'text', 
  id, 
  value, 
  onChange, 
  label, 
  placeholder, 
  validation,
  rows 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="settings-input floating-label">
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || ' '}
          rows={rows || 3}
          className={validation?.type === 'error' ? 'validation-error' : 
                   validation?.type === 'success' ? 'validation-success' : ''}
        />
      ) : (
        <input
          type={inputType}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || ' '}
          className={validation?.type === 'error' ? 'validation-error' : 
                   validation?.type === 'success' ? 'validation-success' : ''}
        />
      )}
      <label htmlFor={id}>{label}</label>
      
      {type === 'password' && (
        <button
          type="button"
          className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
      
      {validation?.message && (
        <div className={`validation-message ${validation.type || 'error'}`}>
          {validation.type === 'error' && <AlertCircle className="w-4 h-4" />}
          {validation.type === 'success' && <Check className="w-4 h-4" />}
          <span>{validation.message}</span>
        </div>
      )}
    </div>
  );
};

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
  const { sidebarCollapsed, theme, setTheme } = useAppStore();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  
  const [notifications, setNotifications] = useState({
    printComplete: true,
    lowFilament: false,
    maintenance: true,
    emailNotifications: true,
    pushNotifications: false,
    systemUpdates: true,
    // Advanced notifications
    filamentChange: false,
    temperatureAlerts: true,
    printFailure: true,
    quietHours: false,
  });

  const [profile, setProfile] = useState({
    username: 'Avi Lezerov',
    email: 'avi.lezerov@example.com',
    phone: '+1 (555) 123-4567',
    bio: '3D Printing Enthusiast & Restoration Expert'
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  const [validations, setValidations] = useState<Record<string, ValidationState>>({});

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

  const handleProfileChange = useCallback((field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Real-time validation
    validateField(field, value);
  }, []);

  const validatePasswordField = useCallback((field: string, value: string) => {
    let validation: ValidationState = { isValid: true };

    if (field === 'newPassword') {
      if (value.length > 0 && value.length < 8) {
        validation = {
          isValid: false,
          type: 'error',
          message: 'Password must be at least 8 characters long'
        };
      } else if (value.length >= 8) {
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumbers = /\d/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        if (hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar) {
          validation = {
            isValid: true,
            type: 'success',
            message: 'Strong password'
          };
        } else {
          validation = {
            isValid: false,
            type: 'warning',
            message: 'Password should contain uppercase, lowercase, numbers, and special characters'
          };
        }
      }
    } else if (field === 'confirmPassword') {
      if (value !== security.newPassword) {
        validation = {
          isValid: false,
          type: 'error',
          message: 'Passwords do not match'
        };
      } else if (value.length > 0) {
        validation = {
          isValid: true,
          type: 'success',
          message: 'Passwords match'
        };
      }
    }

    setValidations(prev => ({ ...prev, [field]: validation }));
  }, [security.newPassword]);

  const handleSecurityChange = useCallback((field: string, value: string) => {
    setSecurity(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Real-time validation for passwords
    if (field === 'newPassword' || field === 'confirmPassword') {
      validatePasswordField(field, value);
    }
  }, [validatePasswordField]);

  const validateField = (field: string, value: string) => {
    let validation: ValidationState = { isValid: true };

    switch (field) {
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          validation = {
            isValid: false,
            type: 'error',
            message: 'Please enter a valid email address'
          };
        } else {
          validation = {
            isValid: true,
            type: 'success',
            message: 'Email format is valid'
          };
        }
        break;
      }
      case 'phone': {
        const phoneRegex = /^\+?[\d\s\-()]+$/;
        if (value && !phoneRegex.test(value)) {
          validation = {
            isValid: false,
            type: 'error',
            message: 'Please enter a valid phone number'
          };
        }
        break;
      }
      case 'username': {
        if (value.length < 3) {
          validation = {
            isValid: false,
            type: 'error',
            message: 'Username must be at least 3 characters long'
          };
        } else {
          validation = {
            isValid: true,
            type: 'success',
            message: 'Username looks good'
          };
        }
        break;
      }
      default:
        break;
    }

    setValidations(prev => ({ ...prev, [field]: validation }));
  };



  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // eslint-disable-next-line no-console
      console.log('Settings saved:', { profile, notifications, security });
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    // Immediate visual feedback
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
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
      filamentChange: false,
      temperatureAlerts: true,
      printFailure: true,
      quietHours: false,
    });
    setSecurity({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: false,
    });
    setValidations({});
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
          
          <div className="settings-tab-enhanced">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={activeTab === tab.id ? 'active' : ''}
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
              <div className="setting-group">
                <div className="setting-group-title">
                  <User className="w-6 h-6 text-blue-400" />
                  <h4>Profile Information</h4>
                </div>
                <p className="setting-group-description">
                  Update your personal information and account details. These changes will be reflected across your account.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EnhancedInput
                    id="username"
                    label="Username"
                    value={profile.username}
                    onChange={(value) => handleProfileChange('username', value)}
                    placeholder="Enter your username"
                    validation={validations.username}
                  />
                  
                  <EnhancedInput
                    type="email"
                    id="email"
                    label="Email Address"
                    value={profile.email}
                    onChange={(value) => handleProfileChange('email', value)}
                    placeholder="Enter your email"
                    validation={validations.email}
                  />
                  
                  <EnhancedInput
                    type="tel"
                    id="phone"
                    label="Phone Number"
                    value={profile.phone}
                    onChange={(value) => handleProfileChange('phone', value)}
                    placeholder="Enter your phone number"
                    validation={validations.phone}
                  />
                  
                  <div className="md:col-span-2">
                    <EnhancedInput
                      type="textarea"
                      id="bio"
                      label="Bio"
                      value={profile.bio}
                      onChange={(value) => handleProfileChange('bio', value)}
                      placeholder="Tell us about yourself"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="setting-group">
                <div className="setting-group-title">
                  <Bell className="w-6 h-6 text-blue-400" />
                  <h4>Basic Notifications</h4>
                </div>
                <p className="setting-group-description">
                  Configure when and how you receive notifications about your 3D printing activities.
                </p>
                
                <div className="space-y-4">
                  <ToggleSwitch
                    id="printComplete"
                    checked={notifications.printComplete}
                    onChange={handleNotificationChange}
                    label="Print Complete"
                    description="Get notified when a print job finishes successfully"
                  />
                  <ToggleSwitch
                    id="lowFilament"
                    checked={notifications.lowFilament}
                    onChange={handleNotificationChange}
                    label="Low Filament"
                    description="Alert when filament is running low during printing"
                  />
                  <ToggleSwitch
                    id="maintenance"
                    checked={notifications.maintenance}
                    onChange={handleNotificationChange}
                    label="Maintenance Reminders"
                    description="Scheduled maintenance and cleaning notifications"
                  />
                </div>
              </div>

              <CollapsibleSection
                title="Communication Preferences"
                icon={<Bell className="w-5 h-5 text-blue-400" />}
                defaultExpanded={true}
              >
                <div className="space-y-4">
                  <ToggleSwitch
                    id="emailNotifications"
                    checked={notifications.emailNotifications}
                    onChange={handleNotificationChange}
                    label="Email Notifications"
                    description="Receive detailed notifications via email"
                  />
                  <ToggleSwitch
                    id="pushNotifications"
                    checked={notifications.pushNotifications}
                    onChange={handleNotificationChange}
                    label="Push Notifications"
                    description="Browser and desktop push notifications"
                  />
                  <ToggleSwitch
                    id="systemUpdates"
                    checked={notifications.systemUpdates}
                    onChange={handleNotificationChange}
                    label="System Updates"
                    description="Updates about new features and improvements"
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Advanced Notifications"
                icon={<Shield className="w-5 h-5 text-amber-400" />}
                defaultExpanded={false}
              >
                <div className="space-y-4">
                  <ToggleSwitch
                    id="filamentChange"
                    checked={notifications.filamentChange}
                    onChange={handleNotificationChange}
                    label="Filament Change Required"
                    description="Notify when multi-material prints require filament changes"
                  />
                  <ToggleSwitch
                    id="temperatureAlerts"
                    checked={notifications.temperatureAlerts}
                    onChange={handleNotificationChange}
                    label="Temperature Alerts"
                    description="Warnings for temperature fluctuations or failures"
                  />
                  <ToggleSwitch
                    id="printFailure"
                    checked={notifications.printFailure}
                    onChange={handleNotificationChange}
                    label="Print Failure Detection"
                    description="Immediate alerts when print failures are detected"
                  />
                  <ToggleSwitch
                    id="quietHours"
                    checked={notifications.quietHours}
                    onChange={handleNotificationChange}
                    label="Quiet Hours Mode"
                    description="Reduce notification frequency during specified hours"
                  />
                </div>
              </CollapsibleSection>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="setting-group">
                <div className="setting-group-title">
                  <Palette className="w-6 h-6 text-blue-400" />
                  <h4>Theme & Visual Preferences</h4>
                </div>
                <p className="setting-group-description">
                  Customize the visual appearance of your application. Changes are applied instantly.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-4">Color Theme</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => handleThemeChange('dark')}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                          theme === 'dark'
                            ? 'border-blue-500/50 bg-blue-500/10'
                            : 'border-slate-600/30 bg-slate-700/20 hover:border-slate-500/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
                            <span className="text-xl">🌙</span>
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-white">Dark Theme</div>
                            <div className="text-sm text-slate-400">Easier on the eyes</div>
                          </div>
                        </div>
                        {theme === 'dark' && (
                          <motion.div
                            className="absolute inset-0 border-2 border-blue-400 rounded-xl"
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleThemeChange('light')}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                          theme === 'light'
                            ? 'border-blue-500/50 bg-blue-500/10'
                            : 'border-slate-600/30 bg-slate-700/20 hover:border-slate-500/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                            <span className="text-xl">☀️</span>
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-white">Light Theme</div>
                            <div className="text-sm text-slate-400">Bright and clear</div>
                          </div>
                        </div>
                        {theme === 'light' && (
                          <motion.div
                            className="absolute inset-0 border-2 border-blue-400 rounded-xl"
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <CollapsibleSection
                    title="Display Preferences"
                    icon={<Monitor className="w-5 h-5 text-purple-400" />}
                    defaultExpanded={false}
                  >
                    <div className="space-y-4">
                      <div className="toggle-container">
                        <div className="toggle-content">
                          <label className="toggle-label">Reduce Motion</label>
                          <p className="toggle-description">Minimize animations and transitions</p>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" defaultChecked={false} />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                      
                      <div className="toggle-container">
                        <div className="toggle-content">
                          <label className="toggle-label">High Contrast</label>
                          <p className="toggle-description">Increase color contrast for better visibility</p>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" defaultChecked={false} />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  </CollapsibleSection>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="setting-group">
                <div className="setting-group-title">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <h4>Password & Authentication</h4>
                </div>
                <p className="setting-group-description">
                  Manage your account security settings and authentication methods.
                </p>
                
                <div className="space-y-6">
                  <EnhancedInput
                    type="password"
                    id="currentPassword"
                    label="Current Password"
                    value={security.currentPassword}
                    onChange={(value) => handleSecurityChange('currentPassword', value)}
                    placeholder="Enter your current password"
                  />
                  
                  <EnhancedInput
                    type="password"
                    id="newPassword"
                    label="New Password"
                    value={security.newPassword}
                    onChange={(value) => handleSecurityChange('newPassword', value)}
                    placeholder="Enter new password"
                    validation={validations.newPassword}
                  />
                  
                  <EnhancedInput
                    type="password"
                    id="confirmPassword"
                    label="Confirm New Password"
                    value={security.confirmPassword}
                    onChange={(value) => handleSecurityChange('confirmPassword', value)}
                    placeholder="Confirm your new password"
                    validation={validations.confirmPassword}
                  />
                </div>
              </div>
              
              <CollapsibleSection
                title="Two-Factor Authentication"
                icon={<Shield className="w-5 h-5 text-green-400" />}
                defaultExpanded={false}
              >
                <div className="space-y-4">
                  <div className="toggle-container">
                    <div className="toggle-content">
                      <label className="toggle-label">Enable 2FA</label>
                      <p className="toggle-description">Add an extra layer of security to your account</p>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={security.twoFactorEnabled}
                        onChange={(e) => setSecurity(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  
                  {security.twoFactorEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-green-500/10 border border-green-500/20 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2 text-green-400 font-medium mb-2">
                        <Check className="w-4 h-4" />
                        Two-Factor Authentication Enabled
                      </div>
                      <p className="text-sm text-slate-300">
                        Your account is protected with two-factor authentication.
                      </p>
                    </motion.div>
                  )}
                </div>
              </CollapsibleSection>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="setting-group">
                <div className="setting-group-title">
                  <Monitor className="w-6 h-6 text-blue-400" />
                  <h4>System Information</h4>
                </div>
                <p className="setting-group-description">
                  View system status and manage application settings.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div 
                    className="bg-slate-700/20 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30"
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(71, 85, 105, 0.3)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-sm text-slate-400 mb-1">Application Version</div>
                    <div className="text-white font-medium">v2.1.0</div>
                    <div className="text-xs text-green-400 mt-1">• Latest</div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-slate-700/20 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30"
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(71, 85, 105, 0.3)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-sm text-slate-400 mb-1">Last Update</div>
                    <div className="text-white font-medium">Aug 21, 2025</div>
                    <div className="text-xs text-blue-400 mt-1">• Auto-updates enabled</div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-slate-700/20 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30"
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(71, 85, 105, 0.3)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-sm text-slate-400 mb-1">Storage Used</div>
                    <div className="text-white font-medium">2.3 GB / 10 GB</div>
                    <div className="w-full bg-slate-600/30 rounded-full h-2 mt-2">
                      <motion.div 
                        className="bg-blue-400 h-2 rounded-full" 
                        initial={{ width: 0 }}
                        animate={{ width: '23%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-slate-700/20 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30"
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(71, 85, 105, 0.3)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-sm text-slate-400 mb-1">Connection Status</div>
                    <div className="text-green-400 font-medium flex items-center">
                      <motion.div 
                        className="w-2 h-2 bg-green-400 rounded-full mr-2"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                      Online
                    </div>
                    <div className="text-xs text-slate-400 mt-1">• Connected to printer</div>
                  </motion.div>
                </div>
              </div>
              
              <CollapsibleSection
                title="Advanced System Settings"
                icon={<Shield className="w-5 h-5 text-amber-400" />}
                defaultExpanded={false}
              >
                <div className="space-y-4">
                  <div className="toggle-container">
                    <div className="toggle-content">
                      <label className="toggle-label">Auto-Updates</label>
                      <p className="toggle-description">Automatically install system updates</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked={true} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  
                  <div className="toggle-container">
                    <div className="toggle-content">
                      <label className="toggle-label">Telemetry & Analytics</label>
                      <p className="toggle-description">Help improve the app by sharing usage data</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked={false} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </CollapsibleSection>
            </div>
          )}

          {/* Action Buttons */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center gap-2 text-green-400 font-medium">
                  <Check className="w-5 h-5" />
                  Settings saved successfully!
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-slate-700/50">
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="px-6 py-3 bg-slate-700/30 hover:bg-slate-600/40 text-slate-300 hover:text-white border border-slate-600/30 hover:border-slate-500/50 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Defaults</span>
            </button>
            
            <motion.button
              onClick={handleSave}
              disabled={isLoading}
              className={`px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 min-w-[140px] ${
                isLoading ? 'settings-loading' : ''
              } ${showSuccess ? 'save-success' : ''}`}
              whileHover={!isLoading ? { scale: 1.05 } : {}}
              whileTap={!isLoading ? { scale: 0.95 } : {}}
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
