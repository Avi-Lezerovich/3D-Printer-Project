import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../shared/store';
import { 
  Clock, FileText, Play, Trash2, ArrowUp, ArrowDown,
  CheckCircle, AlertCircle, Loader2, Calendar, Layers, Timer
} from 'lucide-react';

const QueueSection = () => {
  const { queue } = useAppStore((state) => ({
    queue: state.queue,
  }));

  const handleMoveUp = (_id: string, index: number) => {
    void _id; // reference to avoid unused var lint until reorder logic implemented
    if (index > 0) {
      // Logic to reorder queue items would go here
      // TODO: implement queue reorder (move up)
    }
  };

  const handleMoveDown = (_id: string, index: number) => {
    void _id; // reference to avoid unused var lint until reorder logic implemented
    if (index < queue.length - 1) {
      // Logic to reorder queue items would go here
      // TODO: implement queue reorder (move down)
    }
  };

  const handleRemove = () => {
    // Logic to remove from queue would go here
    // TODO: implement queue removal
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'running': return <Loader2 className="w-4 h-4 text-green-400 animate-spin" />;
      case 'done': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'running': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'done': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'failed': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const listItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    },
    exit: {
      x: 100,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Queue Header */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Print Queue
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              {queue.length} {queue.length === 1 ? 'item' : 'items'}
            </div>
            <button className="glass-button px-3 py-1 text-xs">
              Clear All
            </button>
          </div>
        </div>

        {/* Queue Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-3 text-center">
            <div className="text-2xl font-bold text-white">
              {queue.filter(item => item.status === 'queued').length}
            </div>
            <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Queued
            </div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {queue.filter(item => item.status === 'running').length}
            </div>
            <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <Play className="w-3 h-3" />
              Running
            </div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {queue.filter(item => item.status === 'done').length}
            </div>
            <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Done
            </div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-2xl font-bold text-red-400">
              {queue.filter(item => item.status === 'failed').length}
            </div>
            <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Failed
            </div>
          </div>
        </div>
      </motion.div>

      {/* Queue Items */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h4 className="font-medium text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          Queue Items
        </h4>

        {queue.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Queue is empty</p>
            <p className="text-sm">Add files to start printing</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {queue.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={listItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="glass-card p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Status Icon */}
                      <div className={`p-2 rounded-lg border ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-white truncate">
                          {item.name}
                        </h5>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            2h 30m est.
                          </span>
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            245 layers
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Added today
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleMoveUp(item.id, index)}
                        disabled={index === 0 || item.status === 'running'}
                        className="glass-button p-2 disabled:opacity-30"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(item.id, index)}
                        disabled={index === queue.length - 1 || item.status === 'running'}
                        className="glass-button p-2 disabled:opacity-30"
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleRemove}
                        disabled={item.status === 'running'}
                        className="glass-button p-2 hover:bg-red-500/20 hover:border-red-500/30 disabled:opacity-30"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar for Running Items */}
                  {item.status === 'running' && (
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-medium">65%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '65%' }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default QueueSection;
