
import React from 'react';
import { motion } from 'framer-motion';
import { FaFlagCheckered, FaRocket, FaWrench, FaPrint } from 'react-icons/fa';

// --- MOCK DATA ---
const milestones = [
  {
    icon: FaWrench,
    title: 'Phase 1: Restoration & Assembly',
    status: 'Completed',
    progress: 100,
    achievements: ['Sourced all replacement parts', 'Reassembled the main frame', 'Upgraded the firmware'],
    tech: ['Research', 'Hardware']
  },
  {
    icon: FaRocket,
    title: 'Phase 2: Calibration & First Print',
    status: 'In-Progress',
    progress: 75,
    achievements: ['Calibrated X, Y, and Z axes', 'Leveled the print bed', 'Successfully printed test cube'],
    tech: ['Calibration', 'Testing']
  },
  {
    icon: FaPrint,
    title: 'Phase 3: Advanced Printing & Optimization',
    status: 'Upcoming',
    progress: 10,
    achievements: ['Fine-tune slicer settings', 'Experiment with exotic filaments'],
    tech: ['Optimization', 'Slic3r']
  },
  {
    icon: FaFlagCheckered,
    title: 'Phase 4: Project Complete',
    status: 'Upcoming',
    progress: 0,
    achievements: ['Publish project showcase', 'Document all findings'],
    tech: ['Documentation', 'Portfolio']
  }
];

const statusStyles = {
  Completed: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  'In-Progress': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  Upcoming: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50' },
};

// --- MAIN MILESTONES COMPONENT ---
const Milestones = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative pl-8">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-700" />

        {milestones.map((milestone, index) => (
          <div key={index} className="mb-12 relative">
            {/* Icon circle */}
            <div className={`absolute -left-8 top-1 w-8 h-8 rounded-full flex items-center justify-center ${statusStyles[milestone.status].bg} border-2 ${statusStyles[milestone.status].border}`}>
              <milestone.icon className={statusStyles[milestone.status].text} />
            </div>

            <div className={`p-6 rounded-xl bg-black/20 border ${statusStyles[milestone.status].border}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">{milestone.title}</h3>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${statusStyles[milestone.status].bg} ${statusStyles[milestone.status].text}`}>
                  {milestone.status}
                </span>
              </div>

              <div className="mb-4">
                <div className="w-full bg-gray-800/50 rounded-full h-2.5 border border-white/20 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${milestone.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>

              <ul className="space-y-2 text-white/80 mb-4">
                {milestone.achievements.map((ach, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <FaFlagCheckered className="text-cyan-400" />
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2">
                {milestone.tech.map(tech => (
                  <span key={tech} className="bg-gray-700/70 text-cyan-300 text-xs font-medium px-2 py-1 rounded-full">{tech}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Milestones;
