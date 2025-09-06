import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/index.css'
import { AppQueryProvider } from './core/query/QueryProvider'
import { SocketProvider } from './core/realtime/SocketProvider'
import { lazy, Suspense } from 'react'
import { LoadingFallback } from './shared/components/ui/feedback'
import { ErrorBoundary } from './shared/components/common'
import Layout from './shared/Layout'
// Restore original rich page implementations pending micro-frontend parity
const Portfolio = lazy(()=> import('./pages/Portfolio'))
const ControlPanel = lazy(()=> import('./pages/ControlPanel'))
const DemoMode = lazy(()=> import('./pages/DemoMode'))
const Settings = lazy(()=> import('./pages/Settings'))
const Help = lazy(()=> import('./pages/Help'))
const Login = lazy(()=> import('./pages/Login'))
const NotFound = lazy(()=> import('./pages/NotFound'))

const createSuspenseWrapper = (Component: React.ComponentType, message?: string) => (
  <Suspense fallback={<LoadingFallback message={message} />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      { 
        index: true, 
        element: createSuspenseWrapper(Portfolio, 'Loading portfolio...') 
      },
      { 
        path: 'control', 
        element: createSuspenseWrapper(ControlPanel, 'Loading control panel...') 
      },
      { 
        path: 'demo', 
        element: createSuspenseWrapper(DemoMode, 'Loading demo mode...') 
      },
      { 
        path: 'settings', 
        element: createSuspenseWrapper(Settings, 'Loading settings...') 
      },
      { 
        path: 'help', 
        element: createSuspenseWrapper(Help, 'Loading help...') 
      },
      { 
        path: 'login', 
        element: createSuspenseWrapper(Login, 'Loading login...') 
      },
      { 
        path: '*', 
        element: createSuspenseWrapper(NotFound, 'Page not found...') 
      },
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