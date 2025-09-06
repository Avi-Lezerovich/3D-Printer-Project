import { useState } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Flame, Target, TrendingUp, TrendingDown } from 'lucide-react';

interface TemperatureControlsProps {
  hotend: { current: number; target: number };
  bed: { current: number; target: number };
  onTemperatureChange: (type: 'hotend' | 'bed', target: number) => void;
  isDemo?: boolean;
}

export default function TemperatureControls({ 
  hotend, 
  bed, 
  onTemperatureChange,
  isDemo = false
}: TemperatureControlsProps) {
  const [hotendTarget, setHotendTarget] = useState(hotend.target);
  const [bedTarget, setBedTarget] = useState(bed.target);

  const handleHotendChange = (target: number) => {
    if (isDemo) return; // Disable in demo mode
    setHotendTarget(target);
    onTemperatureChange('hotend', target);
  };

  const handleBedChange = (target: number) => {
    if (isDemo) return; // Disable in demo mode
    setBedTarget(target);
    onTemperatureChange('bed', target);
  };

  const getTemperatureStatus = (current: number, target: number) => {
    const diff = Math.abs(current - target);
    if (diff <= 2) return 'stable';
    return current < target ? 'heating' : 'cooling';
  };

  const getTemperatureColor = (current: number, target: number, type: 'hotend' | 'bed') => {
    const maxTemp = type === 'hotend' ? 280 : 120;
    const warningTemp = type === 'hotend' ? 200 : 80;
    
    if (current >= maxTemp * 0.9) return 'text-red-400';
    if (current >= warningTemp) return 'text-yellow-400';
    if (current >= target * 0.8) return 'text-green-400';
    return 'text-blue-400';
  };

  const presetTemperatures = {
    hotend: [0, 185, 200, 210, 220, 240],
    bed: [0, 50, 60, 70, 80, 100]
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Thermometer className="w-5 h-5 mr-2 text-orange-400" />
        Temperature Controls
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hotend Temperature */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-gray-300 font-medium">Hotend</span>
            </div>
            <div className="flex items-center space-x-2">
              {getTemperatureStatus(hotend.current, hotend.target) === 'heating' && (
                <TrendingUp className="w-4 h-4 text-green-400 animate-pulse" />
              )}
              {getTemperatureStatus(hotend.current, hotend.target) === 'cooling' && (
                <TrendingDown className="w-4 h-4 text-blue-400 animate-pulse" />
              )}
              <span className={`text-lg font-mono font-bold ${getTemperatureColor(hotend.current, hotend.target, 'hotend')}`}>
                {hotend.current}°C
              </span>
              <span className="text-slate-400">/</span>
              <span className="text-orange-400 font-mono font-semibold">
                {hotend.target}°C
              </span>
            </div>
          </div>
          
          {/* Temperature Progress Bar */}
          <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((hotend.current / 300) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
            {hotend.target > 0 && (
              <div
                className="absolute inset-y-0 w-1 bg-orange-300 opacity-80"
                style={{ left: `${Math.min((hotend.target / 300) * 100, 100)}%` }}
              />
            )}
          </div>
          
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {presetTemperatures.hotend.map((temp) => (
              <motion.button
                key={temp}
                onClick={isDemo ? undefined : () => handleHotendChange(temp)}
                disabled={isDemo}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isDemo
                    ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                    : hotendTarget === temp
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'bg-slate-700/50 text-slate-300 border border-slate-600/30 hover:bg-slate-600/50'
                } disabled:opacity-50`}
                whileHover={!isDemo ? { scale: 1.05 } : {}}
                whileTap={!isDemo ? { scale: 0.95 } : {}}
              >
                {temp}°
              </motion.button>
            ))}
          </div>
          
          {/* Custom Input */}
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-orange-400" />
            <input
              type="number"
              min="0"
              max="300"
              value={hotendTarget}
              onChange={(e) => setHotendTarget(Number(e.target.value))}
              onBlur={() => handleHotendChange(hotendTarget)}
              className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-white text-sm focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50"
              placeholder="Target temperature"
            />
            <span className="text-slate-400 text-sm">°C</span>
          </div>
        </div>

        {/* Bed Temperature */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300 font-medium">Heated Bed</span>
            </div>
            <div className="flex items-center space-x-2">
              {getTemperatureStatus(bed.current, bed.target) === 'heating' && (
                <TrendingUp className="w-4 h-4 text-green-400 animate-pulse" />
              )}
              {getTemperatureStatus(bed.current, bed.target) === 'cooling' && (
                <TrendingDown className="w-4 h-4 text-blue-400 animate-pulse" />
              )}
              <span className={`text-lg font-mono font-bold ${getTemperatureColor(bed.current, bed.target, 'bed')}`}>
                {bed.current}°C
              </span>
              <span className="text-slate-400">/</span>
              <span className="text-blue-400 font-mono font-semibold">
                {bed.target}°C
              </span>
            </div>
          </div>
          
          {/* Temperature Progress Bar */}
          <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((bed.current / 120) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
            {bed.target > 0 && (
              <div
                className="absolute inset-y-0 w-1 bg-blue-300 opacity-80"
                style={{ left: `${Math.min((bed.target / 120) * 100, 100)}%` }}
              />
            )}
          </div>
          
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {presetTemperatures.bed.map((temp) => (
              <motion.button
                key={temp}
                onClick={isDemo ? undefined : () => handleBedChange(temp)}
                disabled={isDemo}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isDemo
                    ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                    : bedTarget === temp
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-slate-700/50 text-slate-300 border border-slate-600/30 hover:bg-slate-600/50'
                } disabled:opacity-50`}
                whileHover={!isDemo ? { scale: 1.05 } : {}}
                whileTap={!isDemo ? { scale: 0.95 } : {}}
              >
                {temp}°
              </motion.button>
            ))}
          </div>
          
          {/* Custom Input */}
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-blue-400" />
            <input
              type="number"
              min="0"
              max="120"
              value={bedTarget}
              onChange={(e) => setBedTarget(Number(e.target.value))}
              onBlur={() => handleBedChange(bedTarget)}
              className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
              placeholder="Target temperature"
            />
            <span className="text-slate-400 text-sm">°C</span>
          </div>
        </div>
      </div>
    </div>
  );
}
