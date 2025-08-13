import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '../../shared/store';
import ThemeToggle from '../ThemeToggle';
import './sidebar.css';

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const location = useLocation();
  const [projectSubMenuOpen, setProjectSubMenuOpen] = React.useState(false);


  const navigationItems = [
    { 
      key: 'portfolio', 
      label: 'Portfolio', 
      icon: '🏠', 
      path: '/',
      description: 'Project showcase & overview'
    },
    { 
      key: 'control', 
      label: 'Control Panel', 
      icon: '🎛️', 
      path: '/control',
      description: '3D printer monitoring'
    },
    { 
      key: 'management', 
      label: 'Project Management', 
      icon: '📋', 
      path: '/management',
      description: 'Tasks & project tracking',
      hasSubMenu: true,
      subItems: [
        { key: 'overview', label: 'Task Management', icon: '📋', path: '/management?tab=overview' },
        { key: 'budget', label: 'Budget Tracker', icon: '💰', path: '/management?tab=budget' },
        { key: 'inventory', label: 'Inventory', icon: '📦', path: '/management?tab=inventory' },
        { key: 'analytics', label: 'Analytics', icon: '📊', path: '/management?tab=analytics' },
      ]
    },
    { 
      key: 'settings', 
      label: 'Settings', 
      icon: '⚙️', 
      path: '/settings',
      description: 'App configuration'
    },
    { 
      key: 'help', 
      label: 'Help', 
      icon: '❓', 
      path: '/help',
      description: 'Documentation & support'
    }
  ];

  const resourceItems = [
    {
      key: 'report',
      label: 'Technical Report',
      icon: '📄',
      path: '/docs/restoration_report.pdf',
      external: true,
      description: 'Project documentation'
    },
    {
      key: 'resume',
      label: 'Resume',
      icon: '👤',
      path: '/docs/resume.pdf',
      external: true,
      description: 'Professional resume'
    }
  ];

  return (
    <aside className={`global-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} aria-label="Primary">
      <div className="sidebar-header">
        <button 
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-controls="sidebar-content"
          aria-expanded={!sidebarCollapsed}
        >
          {sidebarCollapsed ? '☰' : '←'}
        </button>
        {!sidebarCollapsed && (
          <div className="sidebar-brand">
            <span className="brand-text">3D Printer Project</span>
          </div>
        )}
      </div>

      <div id="sidebar-content" className="sidebar-content" role="navigation" aria-label="Main">
        <div className="sidebar-section">
          {!sidebarCollapsed && <div className="sidebar-section-title">Navigation</div>}
          {navigationItems.map((item) => (
            <div key={item.key}>
              {item.hasSubMenu ? (
                <div className="sidebar-item-with-submenu">
                  <div
                    className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => {
                      if (!sidebarCollapsed) {
                        setProjectSubMenuOpen(!projectSubMenuOpen);
                      }
                    }}
                    title={item.description}
                  >
                    <span className="sidebar-icon">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <div className="sidebar-item-content">
                        <span className="sidebar-label">{item.label}</span>
                        <span className="sidebar-description">{item.description}</span>
                      </div>
                    )}
                    {!sidebarCollapsed && (
                      <span className={`submenu-arrow ${projectSubMenuOpen ? 'open' : ''}`}>
                        ▶
                      </span>
                    )}
                  </div>
                  {!sidebarCollapsed && projectSubMenuOpen && (
                    <div className="sidebar-submenu">
                      {item.subItems?.map((subItem) => (
                        <a
                          key={subItem.key}
                          href={subItem.path}
                          className={`sidebar-subitem ${location.search.includes(`tab=${subItem.key}`) ? 'active' : ''}`}
                          title={subItem.label}
                        >
                          <span className="sidebar-icon">{subItem.icon}</span>
                          <span className="sidebar-label">{subItem.label}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={({ isActive }) => 
                    `sidebar-item ${isActive ? 'active' : ''}`
                  }
                  title={item.description}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <div className="sidebar-item-content">
                      <span className="sidebar-label">{item.label}</span>
                      <span className="sidebar-description">{item.description}</span>
                    </div>
                  )}
                </NavLink>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-section">
          {!sidebarCollapsed && <div className="sidebar-section-title">Resources</div>}
          {resourceItems.map((item) => (
            <a
              key={item.key}
              href={item.path}
              target="_blank"
              rel="noreferrer"
              className="sidebar-item external"
              title={item.description}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!sidebarCollapsed && (
                <div className="sidebar-item-content">
                  <span className="sidebar-label">{item.label}</span>
                  <span className="sidebar-description">{item.description}</span>
                </div>
              )}
            </a>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-item">
          <span className="sidebar-icon">🎨</span>
          {!sidebarCollapsed && (
            <div className="sidebar-item-content">
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
