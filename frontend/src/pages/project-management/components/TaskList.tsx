import { motion } from 'framer-motion';
import TaskItem from './TaskItem';
import { useAppStore } from '../../../shared/store';

const TaskList = () => {
  const tasks = useAppStore((s) => s.tasks);

  return (
    <motion.div
      className="task-list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </motion.div>
  );
};

export default TaskList;
