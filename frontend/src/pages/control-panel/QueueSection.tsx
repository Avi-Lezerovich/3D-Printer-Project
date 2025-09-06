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
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Queue Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5" />
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Print Queue</h3>
                <p className="text-sm text-slate-400">Manage your printing tasks</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                <span className="text-lg font-bold text-white">{queue.length}</span>
                <span className="text-sm text-slate-400">{queue.length === 1 ? 'item' : 'items'}</span>
              </div>
              <motion.button 
                className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium hover:border-red-400/50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear All
              </motion.button>
            </div>
          </div>

          {/* Enhanced Queue Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div 
              className="relative overflow-hidden rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {queue.filter(item => item.status === 'queued').length}
                  </div>
                  <div className="text-xs text-slate-400">Queued</div>
                </div>
              </div>
              <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((queue.filter(item => item.status === 'queued').length / Math.max(queue.length, 1)) * 100, 100)}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </motion.div>

            <motion.div 
              className="relative overflow-hidden rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20">
                  <Play className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">
                    {queue.filter(item => item.status === 'running').length}
                  </div>
                  <div className="text-xs text-slate-400">Running</div>
                </div>
              </div>
              <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((queue.filter(item => item.status === 'running').length / Math.max(queue.length, 1)) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </motion.div>

            <motion.div 
              className="relative overflow-hidden rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">
                    {queue.filter(item => item.status === 'done').length}
                  </div>
                  <div className="text-xs text-slate-400">Completed</div>
                </div>
              </div>
              <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((queue.filter(item => item.status === 'done').length / Math.max(queue.length, 1)) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>
            </motion.div>

            <motion.div 
              className="relative overflow-hidden rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-400">
                    {queue.filter(item => item.status === 'failed').length}
                  </div>
                  <div className="text-xs text-slate-400">Failed</div>
                </div>
              </div>
              <div className="h-1 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((queue.filter(item => item.status === 'failed').length / Math.max(queue.length, 1)) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Queue Items */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5" />
        <div className="relative p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20">
              <Layers className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Queue Items</h4>
              <p className="text-sm text-slate-400">Current printing queue</p>
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="text-center py-16">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-24 h-24 mx-auto mb-6 p-6 rounded-3xl bg-white/10 border border-white/20">
                  <FileText className="w-12 h-12 mx-auto text-slate-400" />
                </div>
                <p className="text-xl font-bold text-white mb-2">Queue is empty</p>
                <p className="text-sm text-slate-400">Upload files to start printing</p>
                <motion.div
                  className="mt-6 inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/30 rounded-xl text-teal-300"
                  animate={{ 
                    boxShadow: [
                      "0 0 20px rgba(20, 184, 166, 0.3)",
                      "0 0 30px rgba(20, 184, 166, 0.5)",
                      "0 0 20px rgba(20, 184, 166, 0.3)"
                    ]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "easeInOut"
                  }}
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Ready to Queue</span>
                </motion.div>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[32rem] overflow-y-auto">
              <AnimatePresence>
                {queue.map((item, index) => (
                  <motion.div
                    key={item.id}
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="relative overflow-hidden rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        {/* Enhanced Status Icon */}
                        <div className={`p-3 rounded-xl border ${
                          item.status === 'queued' ? 'bg-yellow-500/20 border-yellow-500/30' :
                          item.status === 'running' ? 'bg-green-500/20 border-green-500/30' :
                          item.status === 'done' ? 'bg-blue-500/20 border-blue-500/30' :
                          item.status === 'failed' ? 'bg-red-500/20 border-red-500/30' :
                          'bg-slate-500/20 border-slate-500/30'
                        }`}>
                          {getStatusIcon(item.status)}
                        </div>

                        {/* Enhanced File Info */}
                        <div className="flex-1 min-w-0">
                          <h5 className="text-lg font-bold text-white truncate mb-2">
                            {item.name}
                          </h5>
                          <div className="flex items-center space-x-6 text-sm text-slate-400">
                            <span className="flex items-center space-x-1">
                              <Timer className="w-4 h-4" />
                              <span>2h 30m est.</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Layers className="w-4 h-4" />
                              <span>245 layers</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Added today</span>
                            </span>
                          </div>
                          
                          {/* Queue Position */}
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              index === 0 ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'
                            }`}>
                              {index === 0 ? 'Next in queue' : `Position ${index + 1}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div className="flex items-center space-x-2 ml-6">
                        <motion.button
                          onClick={() => handleMoveUp(item.id, index)}
                          disabled={index === 0 || item.status === 'running'}
                          className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 hover:border-blue-400/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                          whileHover={{ scale: index === 0 || item.status === 'running' ? 1 : 1.1 }}
                          whileTap={{ scale: index === 0 || item.status === 'running' ? 1 : 0.9 }}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleMoveDown(item.id, index)}
                          disabled={index === queue.length - 1 || item.status === 'running'}
                          className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 hover:border-blue-400/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                          whileHover={{ scale: index === queue.length - 1 || item.status === 'running' ? 1 : 1.1 }}
                          whileTap={{ scale: index === queue.length - 1 || item.status === 'running' ? 1 : 0.9 }}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={handleRemove}
                          disabled={item.status === 'running'}
                          className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:border-red-400/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Remove"
                          whileHover={{ scale: item.status === 'running' ? 1 : 1.1 }}
                          whileTap={{ scale: item.status === 'running' ? 1 : 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Enhanced Progress Bar for Running Items */}
                    {item.status === 'running' && (
                      <motion.div 
                        className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center space-x-3">
                            <motion.div
                              className="w-6 h-6 border-2 border-green-500/30 border-t-green-500 rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <span className="text-sm font-medium text-white">Printing in progress...</span>
                          </div>
                          <span className="text-lg font-bold text-green-400">65%</span>
                        </div>
                        <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: '65%' }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                          <span>Layer 159 of 245</span>
                          <span>1h 30m remaining</span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QueueSection;
