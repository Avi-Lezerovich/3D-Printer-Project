import { motion } from 'framer-motion';
import { useAppStore } from '../../../shared/store';

const TaskStats = () => {
  const tasks = useAppStore((s) => s.tasks);

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    doing: tasks.filter((t) => t.status === 'doing').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const statItems = [
    { label: 'Total Tasks', value: taskStats.total, color: '#f1f5f9' },
    { label: 'To Do', value: taskStats.todo, color: '#6b7280' },
    { label: 'In Progress', value: taskStats.doing, color: '#3b82f6' },
    { label: 'Completed', value: taskStats.done, color: '#10b981' },
  ];

  return (
    <motion.div
      className="task-stats"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {statItems.map((item, index) => (
        <>
          <div className="stat-item" key={item.label}>
            <span className="stat-value" style={{ color: item.color }}>
              {item.value}
            </span>
            <span className="stat-label">{item.label}</span>
          </div>
          {index < statItems.length - 1 && <div className="stat-divider" />}
        </>
      ))}
    </motion.div>
  );
};

export default TaskStats;
