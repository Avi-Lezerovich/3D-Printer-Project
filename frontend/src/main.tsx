import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/index.css'
import Layout from './shared/Layout'
import { lazy, Suspense } from 'react'
import Spinner from './components/Spinner'
const Portfolio = lazy(()=> import('./pages/Portfolio'))
const ControlPanel = lazy(()=> import('./pages/ControlPanel'))
const ProjectManagement = lazy(()=> import('./pages/ProjectManagement'))
const Settings = lazy(()=> import('./pages/Settings'))
const Help = lazy(()=> import('./pages/Help'))
const Login = lazy(()=> import('./pages/Login'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
    { index: true, element: <Suspense fallback={<Spinner />}><Portfolio /></Suspense> },
    { path: 'control', element: <Suspense fallback={<Spinner />}><ControlPanel /></Suspense> },
    { path: 'management', element: <Suspense fallback={<Spinner />}><ProjectManagement /></Suspense> },
    { path: 'settings', element: <Suspense fallback={<Spinner />}><Settings /></Suspense> },
    { path: 'help', element: <Suspense fallback={<Spinner />}><Help /></Suspense> },
  { path: 'login', element: <Suspense fallback={<Spinner />}><Login /></Suspense> },
      { path: '*', element: <div style={{ padding: 24 }}>Not Found</div> },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
