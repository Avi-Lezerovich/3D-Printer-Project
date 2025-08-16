import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../shared/store';

const QueueSection = () => {
  const { queue } = useAppStore((state) => ({
    queue: state.queue,
  }));

  const handleMoveUp = (id: string, index: number) => {
    if (index > 0) {
      // Logic to reorder queue items would go here
      console.log('Move up', id);
    }
  };

  const handleMoveDown = (id: string, index: number) => {
    if (index < queue.length - 1) {
      // Logic to reorder queue items would go here
      console.log('Move down', id);
    }
  };

  const handleRemove = (id: string) => {
    // Logic to remove from queue would go here
    console.log('Remove', id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued': return '⏳';
      case 'running': return '🖨️';
      case 'done': return '✅';
      case 'failed': return '❌';
      default: return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'var(--muted)';
      case 'running': return 'var(--good)';
      case 'done': return 'var(--good)';
      case 'failed': return 'var(--bad)';
      default: return 'var(--text-soft)';
    }
  };

  return (
    <section className="panel queue-section">
      <div className="queue-header">
        <h2>📋 Print Queue</h2>
        <div className="queue-stats">
          <span className="queue-count">{queue.length} items</span>
        </div>
      </div>

      <div className="queue-container">
        <AnimatePresence>
          {queue.length === 0 ? (
            <motion.div 
              className="queue-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="empty-icon">📭</div>
              <p>No items in queue</p>
              <small>Upload a file to get started</small>
            </motion.div>
          ) : (
            <motion.ul className="print-queue" layout>
              {queue.map((item, index) => (
                <motion.li
                  key={item.id}
                  className={`print-queue-item ${item.status}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  style={{ '--status-color': getStatusColor(item.status) } as React.CSSProperties}
                >
                  <div className="queue-item-content">
                    <div className="queue-item-main">
                      <div className="item-icon">{getStatusIcon(item.status)}</div>
                      <div className="queue-item-info">
                        <div className="queue-item-name">{item.name}</div>
                        <div className="queue-item-details">
                          <span className="queue-item-status">{item.status}</span>
                          {item.status === 'running' && (
                            <span className="queue-item-progress">{item.progress}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="queue-item-actions">
                      {item.status === 'queued' && (
                        <>
                          <motion.button
                            className="queue-btn queue-btn-up"
                            onClick={() => handleMoveUp(item.id, index)}
                            disabled={index === 0}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Move up"
                          >
                            ↑
                          </motion.button>
                          <motion.button
                            className="queue-btn queue-btn-down"
                            onClick={() => handleMoveDown(item.id, index)}
                            disabled={index === queue.length - 1}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Move down"
                          >
                            ↓
                          </motion.button>
                        </>
                      )}
                      <motion.button
                        className="queue-btn queue-btn-remove"
                        onClick={() => handleRemove(item.id)}
                        disabled={item.status === 'running'}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Remove"
                      >
                        ×
                      </motion.button>
                    </div>
                  </div>
                  
                  {item.status === 'running' && (
                    <div className="queue-progress-bar">
                      <div 
                        className="queue-progress-fill" 
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default QueueSection;
