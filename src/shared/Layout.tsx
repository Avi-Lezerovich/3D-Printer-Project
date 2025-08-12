import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './layout.css'
import ThemeToggle from '../components/ThemeToggle'
import Breadcrumbs from '../components/Breadcrumbs'

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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
      description: 'Tasks & project tracking'
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
        <header className="app-header">
          <div className="header-content">
            <Breadcrumbs />
          </div>
        </header>
        
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
