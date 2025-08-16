import React, { Suspense } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import Spinner from '../components/Spinner'

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="shadow px-4 py-3 flex gap-4 bg-white dark:bg-gray-900">
        <nav className="flex gap-4 text-sm">
          <NavLink to="/" className={({isActive})=> isActive ? 'font-semibold' : ''}>Portfolio</NavLink>
          <NavLink to="/control" className={({isActive})=> isActive ? 'font-semibold' : ''}>Control</NavLink>
          <NavLink to="/management" className={({isActive})=> isActive ? 'font-semibold' : ''}>Projects</NavLink>
        </nav>
      </header>
      <main className="flex-1 p-4">
        <Suspense fallback={<Spinner />}> <Outlet /> </Suspense>
      </main>
    </div>
  )
}

export default AppShell
