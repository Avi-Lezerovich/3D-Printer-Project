import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, AlertTriangle, Clock, FileText, Printer } from 'lucide-react';
import Modal from '../../../shared/components/ui/feedback/Modal';

interface PrintControlsProps {
  status: string;
  connected: boolean;
  onStatusChange: (status: string) => void;
}

export default function PrintControls({ status, connected, onStatusChange }: PrintControlsProps) {
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [progress, setProgress] = useState(42); // Mock progress

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
      case 'printing': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'paused': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'idle': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'printing': return Play;
      case 'paused': return Pause;
      case 'error': return AlertTriangle;
      default: return Square;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <>
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Printer className="w-5 h-5 mr-2 text-green-400" />
          Print Controls
        </h3>
        
        <div className="space-y-6">
          {/* Status Display */}
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/20">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusColor()}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="font-medium capitalize">{status}</span>
              </div>
              {!connected && (
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Disconnected</span>
                </div>
              )}
            </div>
            
            {status === 'printing' && (
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                <span>2h 15m remaining</span>
              </div>
            )}
          </div>

          {/* Progress Bar (only show when printing) */}
          {(status === 'printing' || status === 'paused') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Print Progress</span>
                <span className="text-sm font-mono text-slate-400">{progress}%</span>
              </div>
              <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* Current File Info */}
          {status !== 'idle' && (
            <div className="flex items-center space-x-3 p-3 bg-slate-700/20 rounded-lg border border-slate-600/10">
              <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">test_print_v2.gcode</p>
                <p className="text-xs text-slate-400">2.4 MB • Estimated 3h 20m</p>
              </div>
            </div>
          )}
          
          {/* Control Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              onClick={handleStart}
              disabled={!connected || status === 'printing'}
              className={`
                p-4 rounded-xl font-semibold text-sm transition-all border
                ${status === 'printing' 
                  ? 'bg-gray-500/20 text-gray-400 border-gray-500/30 cursor-not-allowed'
                  : 'bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30 hover:border-green-500/50'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              whileHover={status !== 'printing' && connected ? { scale: 1.02 } : {}}
              whileTap={status !== 'printing' && connected ? { scale: 0.98 } : {}}
            >
              <Play className="w-5 h-5 mx-auto mb-1" />
              Start
            </motion.button>
            
            <motion.button
              onClick={handlePause}
              disabled={!connected || status === 'idle'}
              className={`
                p-4 rounded-xl font-semibold text-sm transition-all border
                ${status === 'idle'
                  ? 'bg-gray-500/20 text-gray-400 border-gray-500/30 cursor-not-allowed'
                  : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 hover:bg-yellow-500/30 hover:border-yellow-500/50'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              whileHover={status !== 'idle' && connected ? { scale: 1.02 } : {}}
              whileTap={status !== 'idle' && connected ? { scale: 0.98 } : {}}
            >
              <Pause className="w-5 h-5 mx-auto mb-1" />
              {status === 'printing' ? 'Pause' : 'Resume'}
            </motion.button>
            
            <motion.button
              onClick={handleStop}
              disabled={!connected || status === 'idle'}
              className={`
                p-4 rounded-xl font-semibold text-sm transition-all border
                ${status === 'idle'
                  ? 'bg-gray-500/20 text-gray-400 border-gray-500/30 cursor-not-allowed'
                  : 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              whileHover={status !== 'idle' && connected ? { scale: 1.02 } : {}}
              whileTap={status !== 'idle' && connected ? { scale: 0.98 } : {}}
            >
              <Square className="w-5 h-5 mx-auto mb-1" />
              Stop
            </motion.button>
          </div>

          {/* Emergency Stop Warning */}
          {!connected && (
            <div className="flex items-center space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-red-300 font-medium">Printer Disconnected</p>
                <p className="text-red-400/80">Connect to printer to control printing</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stop Confirmation Modal */}
      <Modal
        isOpen={showStopConfirm}
        onClose={() => setShowStopConfirm(false)}
        title="Stop Print Job"
        className="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-300 font-medium">This will immediately stop the print job</p>
              <p className="text-red-400/80 text-sm">This action cannot be undone</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowStopConfirm(false)}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmStop}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Stop Print
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
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