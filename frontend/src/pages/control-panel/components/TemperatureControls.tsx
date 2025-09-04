import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Flame, Target } from 'lucide-react';

interface TemperatureControlsProps {
  hotend: { current: number; target: number };
  bed: { current: number; target: number };
  onTemperatureChange: (type: 'hotend' | 'bed', target: number) => void;
}

export default function TemperatureControls({ 
  hotend, 
  bed, 
  onTemperatureChange 
}: TemperatureControlsProps) {
  const [hotendTarget, setHotendTarget] = useState(hotend.target);
  const [bedTarget, setBedTarget] = useState(bed.target);

  const handleHotendChange = (target: number) => {
    setHotendTarget(target);
    onTemperatureChange('hotend', target);
  };

  const handleBedChange = (target: number) => {
    setBedTarget(target);
    onTemperatureChange('bed', target);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Thermometer className="w-5 h-5 mr-2" />
        Temperature Controls
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hotend Temperature */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-gray-300 flex items-center">
              <Flame className="w-4 h-4 mr-2 text-orange-400" />
              Hotend
            </label>
            <span className="text-white font-mono">
              {hotend.current}°C / {hotend.target}°C
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="300"
              value={hotendTarget}
              onChange={(e) => handleHotendChange(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <input
              type="number"
              min="0"
              max="300"
              value={hotendTarget}
              onChange={(e) => handleHotendChange(Number(e.target.value))}
              className="w-16 px-2 py-1 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div className="flex space-x-2">
            {[0, 180, 200, 220].map((temp) => (
              <motion.button
                key={temp}
                onClick={() => handleHotendChange(temp)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm rounded transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {temp}°C
              </motion.button>
            ))}
          </div>
        </div>

        {/* Bed Temperature */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-gray-300 flex items-center">
              <Target className="w-4 h-4 mr-2 text-blue-400" />
              Bed
            </label>
            <span className="text-white font-mono">
              {bed.current}°C / {bed.target}°C
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="120"
              value={bedTarget}
              onChange={(e) => handleBedChange(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <input
              type="number"
              min="0"
              max="120"
              value={bedTarget}
              onChange={(e) => handleBedChange(Number(e.target.value))}
              className="w-16 px-2 py-1 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div className="flex space-x-2">
            {[0, 50, 60, 80].map((temp) => (
              <motion.button
                key={temp}
                onClick={() => handleBedChange(temp)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-gray-300 text-sm rounded transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {temp}°C
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}