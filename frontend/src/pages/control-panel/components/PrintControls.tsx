import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, AlertTriangle } from 'lucide-react';
import Modal from '../../../shared/components/ui/feedback/Modal';

interface PrintControlsProps {
  status: string;
  connected: boolean;
  onStatusChange: (status: string) => void;
}

export default function PrintControls({ status, connected, onStatusChange }: PrintControlsProps) {
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  const handleStart = () => {
    onStatusChange('printing');
  };

  const handlePause = () => {
    const newStatus = status === 'printing' ? 'paused' : 'printing';
    onStatusChange(newStatus);
  };

  const handleStop = () => {
    setShowStopConfirm(true);
  };

  const confirmStop = () => {
    onStatusChange('idle');
    setShowStopConfirm(false);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'printing': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'idle': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <>
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Play className="w-5 h-5 mr-2" />
          Print Controls
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Status:</span>
            <span className={`font-semibold capitalize ${getStatusColor()}`}>
              {status}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Connection:</span>
            <span className={`font-semibold ${connected ? 'text-green-400' : 'text-red-400'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <motion.button
              onClick={handleStart}
              disabled={!connected || status === 'printing'}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
              whileHover={{ scale: connected && status !== 'printing' ? 1.05 : 1 }}
              whileTap={{ scale: connected && status !== 'printing' ? 0.95 : 1 }}
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </motion.button>

            <motion.button
              onClick={handlePause}
              disabled={!connected || status === 'idle'}
              className="px-4 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
              whileHover={{ scale: connected && status !== 'idle' ? 1.05 : 1 }}
              whileTap={{ scale: connected && status !== 'idle' ? 0.95 : 1 }}
            >
              <Pause className="w-4 h-4 mr-2" />
              {status === 'printing' ? 'Pause' : 'Resume'}
            </motion.button>

            <motion.button
              onClick={handleStop}
              disabled={!connected}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
              whileHover={{ scale: connected ? 1.05 : 1 }}
              whileTap={{ scale: connected ? 0.95 : 1 }}
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </motion.button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showStopConfirm}
        onClose={() => setShowStopConfirm(false)}
        title="Confirm Stop"
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
            <p className="text-lg">Are you sure you want to stop the print?</p>
          </div>
          <p className="text-gray-600 mb-6">This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowStopConfirm(false)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmStop}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Stop Print
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}