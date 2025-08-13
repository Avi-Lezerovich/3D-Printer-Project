import React from 'react';
import '../styles/settings.css';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange }) => (
  <label className="toggle-switch">
    <input type="checkbox" id={id} checked={checked} onChange={onChange} />
    <span className="slider"></span>
  </label>
);

export default function Settings() {
  const [notifications, setNotifications] = React.useState({
    printComplete: true,
    lowFilament: false,
    maintenance: true,
  });

  const [theme, setTheme] = React.useState('dark');

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications({
      ...notifications,
      [e.target.id]: e.target.checked,
    });
  };

  return (
    <div>
      <h1>Settings</h1>
      <div className="settings-container">
        <div className="settings-card">
          <h2>User Profile</h2>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" defaultValue="Avi Lezerov" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" defaultValue="avi.lezerov@example.com" />
          </div>
          <button className="btn btn-primary">Update Profile</button>
        </div>

        <div className="settings-card">
          <h2>Theme</h2>
          <div className="theme-settings">
            <div className="setting-item">
              <span>Dark Mode</span>
              <ToggleSwitch
                id="darkMode"
                checked={theme === 'dark'}
                onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h2>Notifications</h2>
          <div className="notification-settings">
            <div className="setting-item">
              <span>Print Complete</span>
              <ToggleSwitch
                id="printComplete"
                checked={notifications.printComplete}
                onChange={handleNotificationChange}
              />
            </div>
            <div className="setting-item">
              <span>Low Filament Warning</span>
              <ToggleSwitch
                id="lowFilament"
                checked={notifications.lowFilament}
                onChange={handleNotificationChange}
              />
            </div>
            <div className="setting-item">
              <span>Maintenance Reminders</span>
              <ToggleSwitch
                id="maintenance"
                checked={notifications.maintenance}
                onChange={handleNotificationChange}
              />
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h2>Integrations</h2>
          <p>Connect to third-party services.</p>
          {/* Add integration options here */}
        </div>
      </div>
    </div>
  );
}
