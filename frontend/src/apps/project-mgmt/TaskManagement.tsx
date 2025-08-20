import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaFire, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import AddTaskModal from './components/AddTaskModal';
import TaskStatistics from './components/TaskStatistics';
import { v4 as uuidv4 } from 'uuid';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// --- MOCK DATA ---
const initialTasks = {
  todo: [
    { id: 'task-1', title: 'Finalize 3D model for printing', priority: 'High' },
    { id: 'task-2', title: 'Order new PLA filament', priority: 'Medium' },
  ],
  inprogress: [
    { id: 'task-3', title: 'Calibrate printer bed', priority: 'High' },
    { id: 'task-4', title: 'Assemble the new extruder', priority: 'Low' },
  ],
  done: [
    { id: 'task-5', title: 'Print test cube', priority: 'Medium' },
    { id: 'task-6', title: 'Upgrade firmware', priority: 'High' },
  ],
};

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'inprogress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

// --- STYLES & CONFIG ---
const priorityStyles = {
  High: { icon: FaFire, color: 'text-red-400' },
  Medium: { icon: FaExclamationCircle, color: 'text-yellow-400' },
  Low: { icon: FaCheckCircle, color: 'text-green-400' },
};

// --- COMPONENTS ---
const TaskCard = ({ task, index }) => {
  const PriorityIcon = priorityStyles[task.priority].icon;
  const priorityColor = priorityStyles[task.priority].color;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-gray-800/50 p-4 rounded-lg border border-white/20 mb-4 
                      ${snapshot.isDragging ? 'ring-2 ring-cyan-400' : ''}`}
        >
          <h4 className="font-bold text-white">{task.title}</h4>
          <div className={`flex items-center gap-2 mt-2 text-sm ${priorityColor}`}>
            <PriorityIcon />
            <span>{task.priority} Priority</span>
          </div>
        </div>
      )}
    </Draggable>
  );
};

const KanbanColumn = ({ col, tasks }) => (
  <div className="flex-1 bg-black/20 p-4 rounded-xl">
    <h3 className="text-xl font-bold text-white mb-4">{col.title} <span className="text-sm font-normal text-white/50">({tasks.length})</span></h3>
    <Droppable droppableId={col.id}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
        >
          {tasks.map((task, index) => <TaskCard key={task.id} task={task} index={index} />)}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
);

// --- MAIN TASK MANAGEMENT COMPONENT ---
const TaskManagement = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddTask = (task) => {
    const newTask = { ...task, id: uuidv4() };
    setTasks(prevTasks => ({
      ...prevTasks,
      todo: [newTask, ...prevTasks.todo],
    }));
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;
    
    if (sourceColId === destColId) {
      const column = tasks[sourceColId];
      const newItems = Array.from(column);
      const [removed] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, removed);

      setTasks({
        ...tasks,
        [sourceColId]: newItems,
      });
    } else {
      const sourceCol = tasks[sourceColId];
      const destCol = tasks[destColId];
      const sourceItems = Array.from(sourceCol);
      const destItems = Array.from(destCol);
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setTasks({
        ...tasks,
        [sourceColId]: sourceItems,
        [destColId]: destItems,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Task Management</h2>
          <p className="text-white/60">Organize, track, and complete project tasks.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors"
        >
          <FaPlus />
          <span>Add New Task</span>
        </button>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col md:flex-row gap-6">
          {COLUMNS.map(col => (
            <KanbanColumn key={col.id} col={col} tasks={tasks[col.id]} />
          ))}
        </div>
      </DragDropContext>

      <TaskStatistics tasks={tasks} />

      <AddTaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTask={handleAddTask}
      />

    </motion.div>
  );
};

export default TaskManagement;