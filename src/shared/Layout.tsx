import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './layout.css'
import ThemeToggle from '../components/ThemeToggle'
import Breadcrumbs from '../components/Breadcrumbs'

export default function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setOpen(false)
  }, [location])

  return (
    <div className="app-shell">
      <header className="app-header">
        <button 
          className="menu-btn btn" 
          onClick={() => setOpen(!open)} 
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          ☰
        </button>
        <div className="brand" aria-label="Site title">3D Printer Project System</div>
        <nav className="top-nav" aria-label="Primary">
          <NavLink to="/" end>Portfolio</NavLink>
          <NavLink to="/control">Control Panel</NavLink>
          <NavLink to="/management">Project Management</NavLink>
          <NavLink to="/settings">Settings</NavLink>
          <NavLink to="/help">Help</NavLink>
        </nav>
        <div style={{marginLeft:'auto'}}>
          <ThemeToggle />
        </div>
      </header>
      
      <aside className={"side-nav " + (open ? 'open' : '')} aria-label="Sidebar">
        <div className="side-section">
          <div className="side-title">Quick Access</div>
          <NavLink to="/" onClick={() => setOpen(false)}>
            <span className="nav-icon">🏠</span>
            Portfolio Home
          </NavLink>
          <NavLink to="/control" onClick={() => setOpen(false)}>
            <span className="nav-icon">🎛️</span>
            Control Dashboard
          </NavLink>
          <NavLink to="/management" onClick={() => setOpen(false)}>
            <span className="nav-icon">📋</span>
            Project Tasks
          </NavLink>
        </div>
        
        <div className="side-section">
          <div className="side-title">Tools</div>
          <NavLink to="/settings" onClick={() => setOpen(false)}>
            <span className="nav-icon">⚙️</span>
            Settings
          </NavLink>
          <NavLink to="/help" onClick={() => setOpen(false)}>
            <span className="nav-icon">❓</span>
            Help & Docs
          </NavLink>
        </div>
        
        <div className="side-section">
          <div className="side-title">Project Info</div>
          <a href="/docs/restoration_report.pdf" target="_blank" rel="noreferrer">
            <span className="nav-icon">📄</span>
            Technical Report
          </a>
          <a href="/docs/resume.pdf" target="_blank" rel="noreferrer">
            <span className="nav-icon">👤</span>
            Resume
          </a>
        </div>
      </aside>
      
      <main className="app-main" role="main">
        <div style={{marginBottom:12}}>
          <Breadcrumbs />
        </div>
        <Outlet />
      </main>
      
      <footer className="app-footer">
        © {new Date().getFullYear()} 3D Printer Project • Built with React + Vite
      </footer>
    </div>
  )
}
