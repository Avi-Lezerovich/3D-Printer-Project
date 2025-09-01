import React, { useState } from 'react';
import { Bell, Mail } from 'lucide-react';
import ToggleSwitch from './ToggleSwitch';
import EnhancedInput from './EnhancedInput';
import CollapsibleSection from './CollapsibleSection';

const NotificationSettings: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [printComplete, setPrintComplete] = useState(true);
  const [errorAlerts, setErrorAlerts] = useState(true);
  const [emailAddress, setEmailAddress] = useState('');

  return (
    <CollapsibleSection 
      title="Notification Settings" 
      icon={<Bell className="w-5 h-5" />}
    >
      <div className="settings-group">
        <ToggleSwitch
          id="print-complete"
          checked={printComplete}
          onChange={(e) => setPrintComplete(e.target.checked)}
          label="Print Completion Alerts"
          description="Get notified when prints finish"
        />
        
        <ToggleSwitch
          id="error-alerts"
          checked={errorAlerts}
          onChange={(e) => setErrorAlerts(e.target.checked)}
          label="Error Alerts"
          description="Get notified about printer errors and issues"
        />
        
        <ToggleSwitch
          id="email-notifications"
          checked={emailNotifications}
          onChange={(e) => setEmailNotifications(e.target.checked)}
          label="Email Notifications"
          description="Receive notifications via email"
        />
        
        {emailNotifications && (
          <EnhancedInput
            id="email-address"
            label="Email Address"
            value={emailAddress}
            onChange={setEmailAddress}
            type="email"
            placeholder="user@example.com"
          />
        )}
      </div>
    </CollapsibleSection>
  );
};

export default NotificationSettings;