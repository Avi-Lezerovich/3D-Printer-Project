import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import KanbanBoard from '../../components/KanbanBoard';
import TaskStats from './components/TaskStats';
import ViewToggle from './components/ViewToggle';
import AddTaskButton from './components/AddTaskButton';
import AddTaskModal from './components/AddTaskModal';
import TaskList from './components/TaskList';

export default function TaskManagement() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showAddTask, setShowAddTask] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="task-management-container"
    >
      <div className="task-management-header">
        <div className="header-main">
          <div className="header-title-section">
            <h2 className="page-title">Task Management</h2>
            <TaskStats />
          </div>

          <div className="header-actions">
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            <AddTaskButton onClick={() => setShowAddTask(true)} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddTask && <AddTaskModal onClose={() => setShowAddTask(false)} />}
      </AnimatePresence>

      <div className="task-content">
        <AnimatePresence mode="wait">
          {viewMode === 'kanban' ? (
            <motion.div
              key="kanban"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="kanban-view"
            >
              <KanbanBoard />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="list-view"
            >
              <TaskList />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
