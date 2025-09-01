import React, { Suspense } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Spinner } from '../shared/components/ui/feedback'

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="shadow px-4 py-3 flex gap-4 bg-white dark:bg-gray-900">
        <nav className="flex gap-4 text-sm">
          <NavLink to="/" className={({isActive})=> isActive ? 'font-semibold' : ''}>Dashboard</NavLink>
          <NavLink to="/control" className={({isActive})=> isActive ? 'font-semibold' : ''}>Control Panel</NavLink>
          <NavLink to="/settings" className={({isActive})=> isActive ? 'font-semibold' : ''}>Settings</NavLink>
          <NavLink to="/help" className={({isActive})=> isActive ? 'font-semibold' : ''}>Help</NavLink>
        </nav>
      </header>
      <main className="flex-1 p-4">
        <Suspense fallback={<Spinner />}> <Outlet /> </Suspense>
      </main>
    </div>
  )
}

export default AppShell
