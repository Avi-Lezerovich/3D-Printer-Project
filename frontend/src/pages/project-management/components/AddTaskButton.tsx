import { motion } from 'framer-motion';

interface AddTaskButtonProps {
  onClick: () => void;
}

const AddTaskButton = ({ onClick }: AddTaskButtonProps) => {
  return (
    <motion.button
      className="add-task-btn"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="btn-icon">+</span>
      <span className="btn-text">Add Task</span>
    </motion.button>
  );
};

export default AddTaskButton;
