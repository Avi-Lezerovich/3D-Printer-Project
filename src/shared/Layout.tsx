import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './layout.css'
import ThemeToggle from '../components/ThemeToggle'

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [projectSubMenuOpen, setProjectSubMenuOpen] = useState(false)
  const location = useLocation()

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true)
      }
    }
    
    handleResize() // Check on mount
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
  ]

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
  ]

  return (
    <div className="app-shell">
      {/* VS Code Style Global Sidebar */}
      <aside className={`global-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '☰' : '←'}
          </button>
          {!sidebarCollapsed && (
            <div className="sidebar-brand">
              <span className="brand-text">3D Printer Project</span>
            </div>
          )}
        </div>

        <div className="sidebar-content">
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
                          setProjectSubMenuOpen(!projectSubMenuOpen)
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

      {/* Main Content Area */}
      <div className={`main-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>        
        <main className="app-main" role="main">
          <Outlet />
        </main>
        
        <footer className="app-footer">
          © {new Date().getFullYear()} 3D Printer Project • Built with React + Vite
        </footer>
      </div>
    </div>
  )
}
