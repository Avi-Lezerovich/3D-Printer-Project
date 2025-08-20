
import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, color }) => (
  <div className={`bg-gray-800/50 p-4 rounded-lg border border-white/20 text-center ${color}`}>
    <p className="text-sm font-medium text-white/70">{label}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const TaskStatistics = ({ tasks }) => {
  const todoCount = tasks.todo.length;
  const inprogressCount = tasks.inprogress.length;
  const doneCount = tasks.done.length;
  const totalTasks = todoCount + inprogressCount + doneCount;
  const completionPercentage = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-white mb-4">Project Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard label="Total Tasks" value={totalTasks} color="text-white" />
        <StatCard label="To Do" value={todoCount} color="text-yellow-400" />
        <StatCard label="In Progress" value={inprogressCount} color="text-blue-400" />
        <StatCard label="Completed" value={doneCount} color="text-green-400" />
      </div>
      <div>
        <h4 className="text-lg font-medium text-white mb-2">Overall Progress</h4>
        <div className="w-full bg-gray-800/50 rounded-full h-6 border border-white/20 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-6 flex items-center justify-center text-sm font-bold text-white"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            {completionPercentage}%
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TaskStatistics;
