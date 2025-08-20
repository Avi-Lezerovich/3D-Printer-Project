import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../shared/store';
import { 
  Home, Monitor, FolderKanban, Settings, HelpCircle, FileText, 
  User, ChevronLeft, ChevronRight, ChevronDown, Activity,
  BarChart3, DollarSign, Package, Printer, Eye
} from 'lucide-react';

interface NavigationItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  description: string;
  color: string;
  hasSubMenu?: boolean;
  subItems?: SubMenuItem[];
  external?: boolean;
}

interface SubMenuItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const [projectSubMenuOpen, setProjectSubMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
    { 
      key: 'portfolio', 
      label: 'Dashboard', 
      icon: Home, 
      path: '/',
      description: 'Main dashboard & overview',
      color: 'blue'
    },
    { 
      key: 'control', 
      label: 'Control Panel', 
      icon: Monitor, 
      path: '/control',
      description: '3D printer monitoring',
      color: 'green'
    },
    { 
      key: 'management', 
      label: 'Project Management', 
      icon: FolderKanban, 
      path: '/management',
      description: 'Tasks & project tracking',
      color: 'purple',
      hasSubMenu: true,
      subItems: [
        { key: 'overview', label: 'Task Management', icon: Activity, path: '/management?tab=overview' },
        { key: 'budget', label: 'Budget Tracker', icon: DollarSign, path: '/management?tab=budget' },
        { key: 'inventory', label: 'Inventory', icon: Package, path: '/management?tab=inventory' },
        { key: 'analytics', label: 'Analytics', icon: BarChart3, path: '/management?tab=analytics' },
      ]
    },
    {
      key: 'projects',
      label: 'Project Analytics',
      icon: BarChart3,
      path: '/projects/analytics',
      description: 'Project insights & metrics',
      color: 'cyan'
    },
    {
      key: 'observability',
      label: 'Observability',
      icon: Eye,
      path: '/observability',
      description: 'System monitoring',
      color: 'yellow'
    },
    { 
      key: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      path: '/settings',
      description: 'App configuration',
      color: 'slate'
    },
    { 
      key: 'help', 
      label: 'Help', 
      icon: HelpCircle, 
      path: '/help',
      description: 'Documentation & support',
      color: 'orange'
    }
  ];

  const resourceItems: NavigationItem[] = [
    {
      key: 'report',
      label: 'Technical Report',
      icon: FileText,
      path: '/docs/restoration_report.pdf',
      external: true,
      description: 'Project documentation',
      color: 'cyan'
    },
    {
      key: 'resume',
      label: 'Resume',
      icon: User,
      path: '/docs/resume.pdf',
      external: true,
      description: 'Professional resume',
      color: 'pink'
    }
  ];

  const getColorClasses = (color: string, isActive: boolean = false): string => {
    const colorMap: Record<string, string> = {
      blue: isActive 
        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
        : 'hover:bg-blue-500/10 hover:text-blue-400',
      green: isActive 
        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
        : 'hover:bg-green-500/10 hover:text-green-400',
      purple: isActive 
        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
        : 'hover:bg-purple-500/10 hover:text-purple-400',
      slate: isActive 
        ? 'bg-slate-500/20 text-slate-300 border-slate-500/30' 
        : 'hover:bg-slate-500/10 hover:text-slate-300',
      orange: isActive 
        ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' 
        : 'hover:bg-orange-500/10 hover:text-orange-400',
      cyan: isActive 
        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' 
        : 'hover:bg-cyan-500/10 hover:text-cyan-400',
      pink: isActive 
        ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' 
        : 'hover:bg-pink-500/10 hover:text-pink-400',
      yellow: isActive 
        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
        : 'hover:bg-yellow-500/10 hover:text-yellow-400',
    };
    return colorMap[color] || colorMap.slate;
  };

  const sidebarVariants = {
    expanded: { 
      width: 280,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    collapsed: { 
      width: 64,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { delay: 0.1, duration: 0.3 }
    }
  };

  const subMenuVariants = {
    hidden: { 
      opacity: 0,
      height: 0,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.3, type: "spring", stiffness: 300, damping: 25 }
    }
  };

  const renderNavigationItem = (item: NavigationItem) => {
    const isActive = location.pathname === item.path || 
      (item.hasSubMenu && location.pathname.startsWith('/management'));
    const IconComponent = item.icon;

    if (item.hasSubMenu) {
      return (
        <div key={item.key}>
          <button
            onClick={() => setProjectSubMenuOpen(!projectSubMenuOpen)}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-slate-300 border border-transparent transition-all duration-200 group ${
              getColorClasses(item.color, isActive)
            } ${isActive ? 'border-opacity-100' : 'border-opacity-0'}`}
            title={sidebarCollapsed ? item.label : undefined}
          >
            <div className="flex items-center space-x-3">
              <IconComponent className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
            </div>
            {!sidebarCollapsed && (
              <ChevronDown 
                className={`w-4 h-4 transition-transform duration-200 ${
                  projectSubMenuOpen ? 'rotate-180' : ''
                }`} 
              />
            )}
          </button>
          
          <AnimatePresence>
            {!sidebarCollapsed && projectSubMenuOpen && (
              <motion.div
                variants={subMenuVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="ml-4 mt-1 space-y-1"
              >
                {item.subItems?.map((subItem) => {
                  const SubIconComponent = subItem.icon;
                  const isSubActive = location.search.includes(subItem.key);
                  
                  return (
                    <NavLink
                      key={subItem.key}
                      to={subItem.path}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        isSubActive 
                          ? 'bg-slate-700/50 text-white' 
                          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                      }`}
                    >
                      <SubIconComponent className="w-4 h-4" />
                      <span>{subItem.label}</span>
                    </NavLink>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    if (item.external) {
      return (
        <a
          key={item.key}
          href={item.path}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-slate-300 border border-transparent transition-all duration-200 group ${
            getColorClasses(item.color, false)
          }`}
          title={sidebarCollapsed ? item.label : undefined}
        >
          <IconComponent className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <span className="font-medium block truncate">{item.label}</span>
              <span className="text-xs text-slate-500 block truncate">{item.description}</span>
            </div>
          )}
        </a>
      );
    }

    return (
      <NavLink
        key={item.key}
        to={item.path}
        className={({ isActive: navLinkActive }) => 
          `flex items-center space-x-3 px-3 py-3 rounded-lg text-slate-300 border border-transparent transition-all duration-200 group ${
            getColorClasses(item.color, navLinkActive || isActive)
          } ${navLinkActive || isActive ? 'border-opacity-100' : 'border-opacity-0'}`
        }
        title={sidebarCollapsed ? item.label : undefined}
      >
        <IconComponent className="w-5 h-5 flex-shrink-0" />
        {!sidebarCollapsed && (
          <div className="flex-1 min-w-0">
            <span className="font-medium block truncate">{item.label}</span>
            <span className="text-xs text-slate-500 block truncate">{item.description}</span>
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <motion.aside 
      className="fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-md border-r border-slate-700/50 z-40 flex flex-col"
      variants={sidebarVariants}
      animate={sidebarCollapsed ? 'collapsed' : 'expanded'}
      initial={false}
      aria-label="Primary Navigation"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/50">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              className="flex items-center space-x-3"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              key="brand"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">3D Control</h1>
                <p className="text-slate-400 text-xs">Professional Suite</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-200 ${
            sidebarCollapsed ? 'mx-auto' : ''
          }`}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Main Navigation */}
        <div className="px-3 mb-8">
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                className="mb-4"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">
                  Navigation
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="space-y-2">
            {navigationItems.map(renderNavigationItem)}
          </div>
        </div>

        {/* Resources Section */}
        {!sidebarCollapsed && (
          <div className="px-3">
            <AnimatePresence>
              <motion.div
                className="mb-4"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">
                  Resources
                </h2>
              </motion.div>
            </AnimatePresence>
            
            <div className="space-y-2">
              {resourceItems.map(renderNavigationItem)}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700/50 p-4">
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              className="text-center"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <p className="text-xs text-slate-500 mb-1">3D Printer Control</p>
              <p className="text-xs text-slate-600">v1.0.0</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
