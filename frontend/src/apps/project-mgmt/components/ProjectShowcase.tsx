
import React from 'react';
import { motion } from 'framer-motion';
import { FaAward, FaCode, FaTools, FaProjectDiagram, FaCheckCircle } from 'react-icons/fa';

// --- MOCK DATA ---
const showcaseData = {
  overview: {
    duration: '12 Weeks',
    completion: '95%',
    budget: '$500',
    status: 'On Track'
  },
  skills: [
    { name: 'React & TypeScript', level: 90 },
    { name: 'Node.js & Backend', level: 75 },
    { name: 'UI/UX Design & Animation', level: 85 },
    { name: 'Project Management', level: 95 },
  ],
  achievements: [
    'Implemented a full-featured Kanban board with drag-and-drop.',
    'Designed and built a responsive, glass-morphism UI from scratch.',
    'Developed a comprehensive analytics and statistics dashboard.',
    'Reduced initial load time by 30% through code splitting.'
  ],
  techStack: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Framer Motion', 'Vite']
};

// --- COMPONENTS ---
const OverviewCard = ({ label, value }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg text-center">
    <p className="text-sm text-white/70">{label}</p>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

const SkillBar = ({ skill }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="font-medium text-white">{skill.name}</span>
      <span className="text-sm font-bold text-cyan-400">{skill.level}%</span>
    </div>
    <div className="w-full bg-gray-800/50 rounded-full h-2.5 border border-white/20 overflow-hidden">
      <motion.div 
        className="bg-cyan-400 h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${skill.level}%` }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </div>
  </div>
);

const Section = ({ icon, title, children }) => (
  <div className="bg-black/20 p-6 rounded-xl">
    <div className="flex items-center gap-3 mb-4">
      {React.createElement(icon, { className: 'text-2xl text-cyan-400' })}
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    {children}
  </div>
);

// --- MAIN SHOWCASE COMPONENT ---
const ProjectShowcase = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-white"
    >
      {/* Left Column */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Section icon={FaProjectDiagram} title="Project Overview">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <OverviewCard label="Duration" value={showcaseData.overview.duration} />
            <OverviewCard label="Completion" value={showcaseData.overview.completion} />
            <OverviewCard label="Budget" value={showcaseData.overview.budget} />
            <OverviewCard label="Status" value={showcaseData.overview.status} />
          </div>
        </Section>
        <Section icon={FaAward} title="Technical Achievements">
          <ul className="space-y-3">
            {showcaseData.achievements.map((ach, i) => (
              <li key={i} className="flex items-start gap-3">
                <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                <span>{ach}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-6">
        <Section icon={FaCode} title="Skills Demonstration">
          <div className="space-y-4">
            {showcaseData.skills.map(skill => <SkillBar key={skill.name} skill={skill} />)}
          </div>
        </Section>
        <Section icon={FaTools} title="Technology Stack">
          <div className="flex flex-wrap gap-2">
            {showcaseData.techStack.map(tech => (
              <span key={tech} className="bg-gray-700/70 text-cyan-300 text-sm font-medium px-3 py-1 rounded-full">{tech}</span>
            ))}
          </div>
        </Section>
      </div>
    </motion.div>
  );
};

export default ProjectShowcase;
