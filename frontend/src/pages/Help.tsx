import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../shared/store';
import { 
  HelpCircle, Search, ChevronRight, Book, MessageSquare, 
  Mail, ExternalLink, Play, Settings, Printer, BarChart3, FileText,
  Lightbulb, AlertTriangle, CheckCircle
} from 'lucide-react';

const faqs = [
  {
    id: 1,
    question: 'How do I start a new print?',
    answer: 'Navigate to the Control Panel, upload your G-code file using the file upload component, then click the "Print" button. Make sure the printer is connected and properly heated before starting.',
    category: 'printing',
    icon: Play,
  },
  {
    id: 2,
    question: 'How can I check the printer status?',
    answer: 'The Printer Dashboard on the Control Panel shows real-time status including temperature, progress, connection status, and current job information.',
    category: 'monitoring',
    icon: Printer,
  },
  {
    id: 3,
    question: 'How do I configure system settings?',
    answer: 'Navigate to Settings to configure printer parameters, temperature thresholds, notification preferences, and system behavior.',
    category: 'configuration',
    icon: Settings,
  },
  {
    id: 4,
    question: 'How do I upload G-code files?',
    answer: 'Go to Control Panel > File Management. Drag and drop your .gcode files or click "Upload" to browse your computer. Files will be added to the print queue.',
    category: 'files',
    icon: FileText,
  },
  {
    id: 5,
    question: 'What file formats are supported?',
    answer: 'The system supports G-code files (.gcode, .g), STL files for slicing preview, and various image formats for documentation.',
    category: 'files',
    icon: FileText,
  },
  {
    id: 6,
    question: 'How do I configure printer settings?',
    answer: 'Access Settings > System to configure printer parameters, notification preferences, and system settings.',
    category: 'configuration',
    icon: Settings,
  },
  {
    id: 7,
    question: 'What should I do if the print fails?',
    answer: 'Check the error logs in the Control Panel, verify filament levels, ensure proper bed adhesion, and review temperature settings. Most issues are related to these common factors.',
    category: 'troubleshooting',
    icon: AlertTriangle,
  },
  {
    id: 8,
    question: 'How do I monitor print progress?',
    answer: 'Use the Control Panel to view real-time print progress, temperature monitoring, webcam feed, and detailed print statistics.',
    category: 'monitoring',
    icon: BarChart3,
  }
];

const categories = [
  { id: 'all', label: 'All Topics', icon: Book },
  { id: 'printing', label: 'Printing', icon: Play },
  { id: 'monitoring', label: 'Monitoring', icon: Printer },
  { id: 'management', label: 'Management', icon: BarChart3 },
  { id: 'files', label: 'File Management', icon: FileText },
  { id: 'configuration', label: 'Configuration', icon: Settings },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertTriangle },
];

const quickLinks = [
  {
    title: 'Getting Started Guide',
    description: 'Complete setup and first print tutorial',
    icon: Book,
    href: '/docs/getting-started',
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step video guides',
    icon: Play,
    href: '/docs/tutorials',
  },
  {
    title: 'Contact Support',
    description: 'Get help from our team',
    icon: MessageSquare,
    href: 'mailto:support@3dprinter-project.com',
  },
  {
    title: 'Report Issue',
    description: 'Report bugs or request features',
    icon: Mail,
    href: 'https://github.com/issues',
  },
];

interface FaqItemProps {
  faq: typeof faqs[0];
  isOpen: boolean;
  onClick: () => void;
}

const FaqItem: React.FC<FaqItemProps> = ({ faq, isOpen, onClick }) => {
  const IconComponent = faq.icon;
  
  return (
    <motion.div 
      className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg overflow-hidden"
      initial={false}
      animate={{ 
        borderColor: isOpen ? 'rgba(59, 130, 246, 0.3)' : 'rgba(71, 85, 105, 0.5)' 
      }}
    >
      <button
        className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-700/20 transition-colors duration-200"
        onClick={onClick}
      >
        <div className="flex items-center space-x-3">
          <IconComponent className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-white">{faq.question}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 pl-12 text-slate-300 leading-relaxed">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

export default function Help() {
  const { sidebarCollapsed } = useAppStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = faqs;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(f => f.category === selectedCategory);
    }
    
    if (q) {
      filtered = filtered.filter(f => 
        f.question.toLowerCase().includes(q) || 
        f.answer.toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [query, selectedCategory]);

  const handleFaqClick = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Fixed Header */}
      <div 
        className={`fixed top-0 z-50 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 transition-all duration-300 ${
          sidebarCollapsed ? 'left-[70px] right-0' : 'left-[280px] right-0'
        } max-lg:left-0 max-lg:right-0`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center justify-center mb-2">
              <HelpCircle className="w-8 h-8 text-blue-400 mr-3" />
              Help & Support Center
            </h1>
            <p className="text-slate-400">Find answers, guides, and get the support you need</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div 
        className="pt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Quick Links */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={itemVariants}
        >
          {quickLinks.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <motion.a
                key={index}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : '_self'}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 hover:bg-slate-700/30 hover:border-blue-500/30 transition-all duration-200 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className="w-6 h-6 text-blue-400" />
                  {link.href.startsWith('http') && (
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  )}
                </div>
                <h3 className="font-semibold text-white mb-1">{link.title}</h3>
                <p className="text-sm text-slate-400">{link.description}</p>
              </motion.a>
            );
          })}
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 mb-8"
          variants={itemVariants}
        >
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for help topics..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-700/30 text-slate-400 hover:bg-slate-600/30 hover:text-slate-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Frequently Asked Questions
            </h2>
            <div className="text-sm text-slate-400">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
            </div>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-8 text-center">
              <Lightbulb className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No results found</h3>
              <p className="text-slate-400">Try adjusting your search terms or category filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <FaqItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openFaq === faq.id}
                  onClick={() => handleFaqClick(faq.id)}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Still Need Help Section */}
        <motion.div 
          className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 mt-8 text-center"
          variants={itemVariants}
        >
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Still need help?</h3>
          <p className="text-slate-400 mb-4">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@3dprinter-project.com"
              className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 hover:border-blue-500/50 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>Email Support</span>
            </a>
            <a
              href="https://github.com/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 border border-slate-600/50 hover:border-slate-500/50 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Report Issue</span>
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
