import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home } from 'lucide-react';

export default function MovementControls() {
  const moveAxis = (axis: string, direction: number, distance: number = 10) => {
    console.log(`Moving ${axis} axis ${direction > 0 ? '+' : '-'}${distance}mm`);
  };

  const homeAll = () => {
    console.log('Homing all axes');
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <ArrowUp className="w-5 h-5 mr-2" />
        Movement Controls
      </h3>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div></div>
        <motion.button
          onClick={() => moveAxis('Y', 1)}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
        <div></div>
        
        <motion.button
          onClick={() => moveAxis('X', -1)}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        
        <motion.button
          onClick={homeAll}
          className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Home className="w-5 h-5" />
        </motion.button>
        
        <motion.button
          onClick={() => moveAxis('X', 1)}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowRight className="w-5 h-5" />
        </motion.button>
        
        <div></div>
        <motion.button
          onClick={() => moveAxis('Y', -1)}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowDown className="w-5 h-5" />
        </motion.button>
        <div></div>
      </div>

      <div className="flex gap-2 justify-center">
        <motion.button
          onClick={() => moveAxis('Z', 1)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUp className="w-4 h-4 mr-1" />
          Z+
        </motion.button>
        
        <motion.button
          onClick={() => moveAxis('Z', -1)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowDown className="w-4 h-4 mr-1" />
          Z-
        </motion.button>
      </div>
    </div>
  );
}