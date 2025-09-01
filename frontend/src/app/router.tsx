import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ErrorBoundary, LoadingFallback } from '../shared/components/common';
import Layout from '../shared/Layout';

// Lazy load pages (thin wrappers)
const Portfolio = lazy(() => import('../pages/PortfolioPage'));
const ControlPanel = lazy(() => import('../pages/ControlPanelPage'));
const Settings = lazy(() => import('../pages/SettingsPage'));
const Help = lazy(() => import('../pages/HelpPage'));
const Login = lazy(() => import('../pages/Login'));
const NotFound = lazy(() => import('../pages/NotFound'));

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
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};