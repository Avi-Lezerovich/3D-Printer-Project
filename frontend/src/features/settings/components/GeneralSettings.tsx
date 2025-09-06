import React, { useState } from 'react';
import { User } from 'lucide-react';
import ToggleSwitch from './ToggleSwitch';
import EnhancedInput from './EnhancedInput';
import CollapsibleSection from './CollapsibleSection';

const GeneralSettings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [username, setUsername] = useState('User');

  return (
    <CollapsibleSection 
      title="General Settings" 
      icon={<User className="w-5 h-5" />}
      defaultExpanded={true}
    >
      <div className="settings-group">
        <EnhancedInput
          id="username"
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="Enter your username"
        />
        
        <ToggleSwitch
          id="notifications"
          checked={notifications}
          onChange={(e) => setNotifications(e.target.checked)}
          label="Enable Notifications"
          description="Receive alerts about print status and system events"
        />
        
        <ToggleSwitch
          id="autosave"
          checked={autoSave}
          onChange={(e) => setAutoSave(e.target.checked)}
          label="Auto-save Settings"
          description="Automatically save changes to settings"
        />
      </div>
    </CollapsibleSection>
  );
};

export default GeneralSettings;