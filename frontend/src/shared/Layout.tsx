import { useEffect } from 'react';
import { useAppStore } from './store';
import SkipToContent from './components/accessibility/SkipToContent';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import Toasts from './components/ui/feedback/Toasts';
import './layout.css';
import { ConnectionBadge } from '../core/realtime/ConnectionBadge';

export default function Layout() {
  const { setSidebarCollapsed } = useAppStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  return (
    <div className="app-shell">
      <SkipToContent />
      <Sidebar />
      <MainContent />
      <Toasts />
      <ConnectionBadge />
    </div>
  );
}
