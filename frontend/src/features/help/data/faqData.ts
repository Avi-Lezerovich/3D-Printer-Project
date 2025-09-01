import { Play, Printer, Settings, FileText, Lightbulb, AlertTriangle } from 'lucide-react';

export const faqs = [
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
    question: 'What should I do if a print fails?',
    answer: 'Check the printer status, review error logs, ensure proper bed adhesion, and verify that filament is loaded correctly. Check temperature stability.',
    category: 'troubleshooting',
    icon: AlertTriangle,
  },
  {
    id: 8,
    question: 'How do I optimize print quality?',
    answer: 'Ensure proper bed leveling, use appropriate print speeds, maintain consistent temperatures, and choose the right layer height for your project.',
    category: 'tips',
    icon: Lightbulb,
  },
];

export const categories = [
  { id: 'all', name: 'All Topics', count: faqs.length },
  { id: 'printing', name: 'Printing', count: faqs.filter(f => f.category === 'printing').length },
  { id: 'monitoring', name: 'Monitoring', count: faqs.filter(f => f.category === 'monitoring').length },
  { id: 'configuration', name: 'Configuration', count: faqs.filter(f => f.category === 'configuration').length },
  { id: 'files', name: 'File Management', count: faqs.filter(f => f.category === 'files').length },
  { id: 'troubleshooting', name: 'Troubleshooting', count: faqs.filter(f => f.category === 'troubleshooting').length },
  { id: 'tips', name: 'Tips & Tricks', count: faqs.filter(f => f.category === 'tips').length },
];