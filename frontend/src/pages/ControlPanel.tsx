import { motion } from 'framer-motion';
import { Panel } from '../design-system/Panel';
import Header from './control-panel/Header';
import StatusSection from './control-panel/StatusSection';
import ControlsSection from './control-panel/ControlsSection';
import FileUploadSection from './control-panel/FileUploadSection';
import QueueSection from './control-panel/QueueSection';
import ChartSection from './control-panel/ChartSection';
import WebcamSection from './control-panel/WebcamSection';
import '../design-system/index.css';
import '../styles/control-panel.css';

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

export default function ControlPanel() {
  return (
    <div className="control-panel-layout">
      <Header />
      <motion.div 
        className="control-panel-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Panel 
          className="status-overview" 
          animate={true} 
          variant="enhanced"
          motionProps={{ variants: itemVariants }}
        >
          <StatusSection />
        </Panel>
        
        <Panel 
          className="printer-controls" 
          animate={true} 
          variant="enhanced"
          motionProps={{ variants: itemVariants }}
        >
          <ControlsSection />
        </Panel>
        
        <Panel 
          className="webcam-feed" 
          animate={true} 
          variant="enhanced"
          motionProps={{ variants: itemVariants }}
        >
          <WebcamSection />
        </Panel>
        
        <Panel 
          className="file-management" 
          animate={true} 
          variant="enhanced"
          motionProps={{ variants: itemVariants }}
        >
          <FileUploadSection />
        </Panel>
        
        <Panel 
          className="print-queue" 
          animate={true} 
          variant="enhanced"
          motionProps={{ variants: itemVariants }}
        >
          <QueueSection />
        </Panel>
        
        <Panel 
          className="temperature-monitoring" 
          animate={true} 
          variant="enhanced"
          motionProps={{ variants: itemVariants }}
        >
          <ChartSection />
        </Panel>
      </motion.div>
    </div>
  );
}
