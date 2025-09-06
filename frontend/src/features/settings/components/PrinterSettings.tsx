import React, { useState } from 'react';
import { Printer } from 'lucide-react';
import ToggleSwitch from './ToggleSwitch';
import EnhancedInput from './EnhancedInput';
import CollapsibleSection from './CollapsibleSection';

const PrinterSettings: React.FC = () => {
  const [hotendTemp, setHotendTemp] = useState('200');
  const [bedTemp, setBedTemp] = useState('60');
  const [autoHome, setAutoHome] = useState(true);
  const [temperatureMonitoring, setTemperatureMonitoring] = useState(true);

  return (
    <CollapsibleSection 
      title="Printer Settings" 
      icon={<Printer className="w-5 h-5" />}
    >
      <div className="settings-group">
        <EnhancedInput
          id="hotend-temp"
          label="Default Hotend Temperature (°C)"
          value={hotendTemp}
          onChange={setHotendTemp}
          type="number"
          placeholder="200"
        />
        
        <EnhancedInput
          id="bed-temp"
          label="Default Bed Temperature (°C)"
          value={bedTemp}
          onChange={setBedTemp}
          type="number"
          placeholder="60"
        />
        
        <ToggleSwitch
          id="auto-home"
          checked={autoHome}
          onChange={(e) => setAutoHome(e.target.checked)}
          label="Auto Home Before Print"
          description="Automatically home all axes before starting a print"
        />
        
        <ToggleSwitch
          id="temp-monitoring"
          checked={temperatureMonitoring}
          onChange={(e) => setTemperatureMonitoring(e.target.checked)}
          label="Temperature Monitoring"
          description="Continuously monitor and log temperatures"
        />
      </div>
    </CollapsibleSection>
  );
};

export default PrinterSettings;