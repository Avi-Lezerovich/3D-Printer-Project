import { motion } from 'framer-motion';

interface ViewToggleProps {
  viewMode: 'kanban' | 'list';
  setViewMode: (mode: 'kanban' | 'list') => void;
}

const ViewToggle = ({ viewMode, setViewMode }: ViewToggleProps) => {
  return (
    <div className="view-toggle">
      <motion.button
        className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
        onClick={() => setViewMode('kanban')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className="visually-hidden">Kanban View</span>
        <i className="fas fa-th-large"></i>
      </motion.button>
      <motion.button
        className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
        onClick={() => setViewMode('list')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className="visually-hidden">List View</span>
        <i className="fas fa-list"></i>
      </motion.button>
    </div>
  );
};

export default ViewToggle;
