import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../shared/store/authStore';
import { useEffect } from 'react';

export default function Protected({ children }: { children: JSX.Element }) {
  const { user, initialized, refreshSession } = useAuthStore();
  const location = useLocation();

  useEffect(() => { if(!initialized) { refreshSession(); } }, [initialized, refreshSession]);

  if(!initialized) return <div style={{padding:40}}>Checking session…</div>;
  if(!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
