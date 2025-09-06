import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, Move3D, Minus, Plus } from 'lucide-react';

export default function MovementControls() {
  const [distance, setDistance] = useState(10);
  const [isHoming, setIsHoming] = useState(false);

  const moveAxis = async (axis: string, direction: number) => {
    // TODO: Implement actual movement logic here
    console.info(`Moving ${axis} axis by ${direction * distance}mm`);
  };

  const homeAll = async () => {
    setIsHoming(true);
    
    // Simulate homing process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsHoming(false);
  };

  const distances = [0.1, 1, 10, 50, 100];

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Move3D className="w-5 h-5 mr-2 text-blue-400" />
        Movement Controls
      </h3>
      
      {/* Distance Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">Movement Distance (mm)</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {distances.map((dist) => (
            <motion.button
              key={dist}
              onClick={() => setDistance(dist)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                distance === dist
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-slate-700/50 text-slate-300 border border-slate-600/30 hover:bg-slate-600/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {dist}
            </motion.button>
          ))}
        </div>
        
        {/* Custom Distance Input */}
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0.1"
            max="1000"
            step="0.1"
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-20 px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50"
          />
          <span className="text-slate-400 text-sm">mm</span>
        </div>
      </div>
      
      {/* XY Movement Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div></div>
        <motion.button
          onClick={() => moveAxis('Y', 1)}
          className="p-4 bg-gradient-to-br from-blue-600/80 to-blue-700/80 hover:from-blue-500/80 hover:to-blue-600/80 text-white rounded-xl flex items-center justify-center transition-all shadow-lg border border-blue-500/20"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          title={`Move Y +${distance}mm`}
        >
          <ArrowUp className="w-6 h-6" />
        </motion.button>
        <div></div>
        
        <motion.button
          onClick={() => moveAxis('X', -1)}
          className="p-4 bg-gradient-to-br from-blue-600/80 to-blue-700/80 hover:from-blue-500/80 hover:to-blue-600/80 text-white rounded-xl flex items-center justify-center transition-all shadow-lg border border-blue-500/20"
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          title={`Move X -${distance}mm`}
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        
        <motion.button
          onClick={homeAll}
          disabled={isHoming}
          className="p-4 bg-gradient-to-br from-purple-600/80 to-purple-700/80 hover:from-purple-500/80 hover:to-purple-600/80 text-white rounded-xl flex items-center justify-center transition-all shadow-lg border border-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={isHoming ? {} : { scale: 1.05 }}
          whileTap={isHoming ? {} : { scale: 0.95 }}
          title="Home All Axes"
        >
          {isHoming ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Home className="w-6 h-6" />
          )}
        </motion.button>
        
        <motion.button
          onClick={() => moveAxis('X', 1)}
          className="p-4 bg-gradient-to-br from-blue-600/80 to-blue-700/80 hover:from-blue-500/80 hover:to-blue-600/80 text-white rounded-xl flex items-center justify-center transition-all shadow-lg border border-blue-500/20"
          whileHover={{ scale: 1.05, x: 2 }}
          whileTap={{ scale: 0.95 }}
          title={`Move X +${distance}mm`}
        >
          <ArrowRight className="w-6 h-6" />
        </motion.button>
        
        <div></div>
        <motion.button
          onClick={() => moveAxis('Y', -1)}
          className="p-4 bg-gradient-to-br from-blue-600/80 to-blue-700/80 hover:from-blue-500/80 hover:to-blue-600/80 text-white rounded-xl flex items-center justify-center transition-all shadow-lg border border-blue-500/20"
          whileHover={{ scale: 1.05, y: 2 }}
          whileTap={{ scale: 0.95 }}
          title={`Move Y -${distance}mm`}
        >
          <ArrowDown className="w-6 h-6" />
        </motion.button>
        <div></div>
      </div>
      
      {/* Z-Axis Controls */}
      <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/20">
        <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center">
          Z-Axis Movement
        </h4>
        <div className="flex items-center justify-center space-x-4">
          <motion.button
            onClick={() => moveAxis('Z', -1)}
            className="p-3 bg-gradient-to-br from-green-600/80 to-green-700/80 hover:from-green-500/80 hover:to-green-600/80 text-white rounded-lg flex items-center justify-center transition-all shadow-lg border border-green-500/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={`Move Z -${distance}mm (Down)`}
          >
            <Minus className="w-5 h-5" />
          </motion.button>
          
          <span className="text-slate-400 text-sm font-mono min-w-[60px] text-center">
            Z: 0.00
          </span>
          
          <motion.button
            onClick={() => moveAxis('Z', 1)}
            className="p-3 bg-gradient-to-br from-green-600/80 to-green-700/80 hover:from-green-500/80 hover:to-green-600/80 text-white rounded-lg flex items-center justify-center transition-all shadow-lg border border-green-500/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={`Move Z +${distance}mm (Up)`}
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
