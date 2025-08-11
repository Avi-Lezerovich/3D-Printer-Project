import { Outlet, NavLink } from 'react-router-dom'
import { useState } from 'react'
import './layout.css'
import ThemeToggle from '../components/ThemeToggle'
import Breadcrumbs from '../components/Breadcrumbs'

export default function Layout() {
  const [open, setOpen] = useState(false)
  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="menu-btn btn" onClick={() => setOpen(!open)} aria-label="Toggle menu">☰</button>
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
          <NavLink to="/">Hero</NavLink>
          <NavLink to="/control">Dashboard</NavLink>
          <NavLink to="/management">Tasks</NavLink>
        </div>
        <div className="side-section">
          <div className="side-title">Help</div>
          <a href="#" onClick={(e)=>e.preventDefault()}>Docs</a>
          <a href="#" onClick={(e)=>e.preventDefault()}>Settings</a>
        </div>
      </aside>
      <main className="app-main" role="main">
        <div style={{marginBottom:12}}>
          <Breadcrumbs />
        </div>
        <Outlet />
      </main>
      <footer className="app-footer">© {new Date().getFullYear()} 3D Printer Project • Built with React + Vite</footer>
    </div>
  )
}
