import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/index.css'
import Layout from './shared/Layout'
import { lazy, Suspense } from 'react'
import Spinner from './components/Spinner'
import ErrorBoundary from './components/ErrorBoundary'
const Portfolio = lazy(()=> import('./pages/Portfolio'))
const ControlPanel = lazy(()=> import('./pages/ControlPanel'))
const ProjectManagement = lazy(()=> import('./pages/ProjectManagement'))
const Settings = lazy(()=> import('./pages/Settings'))
const Help = lazy(()=> import('./pages/Help'))
const Login = lazy(()=> import('./pages/Login'))
const NotFound = lazy(()=> import('./pages/NotFound'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
    { index: true, element: <Suspense fallback={<Spinner />}><Portfolio /></Suspense> },
    { path: 'control', element: <Suspense fallback={<Spinner />}><ControlPanel /></Suspense> },
    { path: 'management', element: <Suspense fallback={<Spinner />}><ProjectManagement /></Suspense> },
    { path: 'settings', element: <Suspense fallback={<Spinner />}><Settings /></Suspense> },
    { path: 'help', element: <Suspense fallback={<Spinner />}><Help /></Suspense> },
  { path: 'login', element: <Suspense fallback={<Spinner />}><Login /></Suspense> },
      { path: '*', element: <Suspense fallback={<Spinner />}><NotFound /></Suspense> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>,
)
