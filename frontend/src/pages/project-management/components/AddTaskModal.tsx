import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAppStore } from '../../../shared/store';

interface AddTaskModalProps {
  onClose: () => void;
}

const AddTaskModal = ({ onClose }: AddTaskModalProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'med' | 'high'>('med');
  const addTask = useAppStore((s) => s.addTask);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), taskPriority);
      onClose();
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="modal-content enhanced">
        <div className="modal-header">
          <h2>Add New Task</h2>
          <button onClick={onClose} className="close-btn">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <input
            type="text"
            placeholder="Task Title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <textarea
            placeholder="Task Description"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
          <select
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value as 'low' | 'med' | 'high')}
          >
            <option value="low">Low Priority</option>
            <option value="med">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
        <div className="modal-footer">
          <button onClick={handleAddTask} className="btn-primary">
            Add Task
          </button>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AddTaskModal;
