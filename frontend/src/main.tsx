import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/index.css'
import { AppQueryProvider } from './core/query/QueryProvider'
import { SocketProvider } from './core/realtime/SocketProvider'
import { lazy, Suspense } from 'react'
import Spinner from './components/Spinner'
import ErrorBoundary from './components/ErrorBoundary'
import AppShell from './shell/AppShell'
// Micro-frontends
const PortfolioApp = lazy(()=> import('./apps/portfolio'))
const ControlPanelApp = lazy(()=> import('./apps/control-panel'))
const ProjectMgmtApp = lazy(()=> import('./apps/project-mgmt'))
// Legacy / shared pages (keep for now)
const ProjectAnalytics = lazy(()=> import('./pages/ProjectAnalytics'))
const Settings = lazy(()=> import('./pages/Settings'))
const Help = lazy(()=> import('./pages/Help'))
const Login = lazy(()=> import('./pages/Login'))
const NotFound = lazy(()=> import('./pages/NotFound'))
const Observability = lazy(()=> import('./pages/Observability'))

const router = createBrowserRouter([
  {
    path: '/',
  element: <AppShell />,
    errorElement: <ErrorBoundary />,
    children: [
  { index: true, element: <Suspense fallback={<Spinner />}><PortfolioApp /></Suspense> },
  { path: 'control', element: <Suspense fallback={<Spinner />}><ControlPanelApp /></Suspense> },
  { path: 'management', element: <Suspense fallback={<Spinner />}><ProjectMgmtApp /></Suspense> },
  { path: 'projects/analytics', element: <Suspense fallback={<Spinner />}><ProjectAnalytics /></Suspense> },
    { path: 'settings', element: <Suspense fallback={<Spinner />}><Settings /></Suspense> },
    { path: 'help', element: <Suspense fallback={<Spinner />}><Help /></Suspense> },
  { path: 'observability', element: <Suspense fallback={<Spinner />}><Observability /></Suspense> },
  { path: 'login', element: <Suspense fallback={<Spinner />}><Login /></Suspense> },
      { path: '*', element: <Suspense fallback={<Spinner />}><NotFound /></Suspense> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppQueryProvider>
        <SocketProvider>
          <RouterProvider router={router} />
        </SocketProvider>
      </AppQueryProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
