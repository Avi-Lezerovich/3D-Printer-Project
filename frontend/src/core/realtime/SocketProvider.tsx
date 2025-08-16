import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../state/authStore';

interface SocketContextValue {
  socket: Socket | null;
  status: 'idle' | 'connecting' | 'open' | 'error' | 'closed';
  lastHeartbeat: number | null;
  latencyMs: number | null;
}

const SocketCtx = createContext<SocketContextValue | undefined>(undefined);

export interface SocketProviderProps { children: React.ReactNode; enable?: boolean }

const DEFAULT_URL = (import.meta.env.VITE_API_BASE as string | undefined) || 'http://localhost:3000';

export function SocketProvider({ children, enable }: SocketProviderProps){
  const enabled = enable ?? (import.meta.env.VITE_ENABLE_REALTIME !== 'false');
  const [status, setStatus] = useState<SocketContextValue['status']>('idle');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<number | null>(null);
  const [latencyMs, setLatency] = useState<number | null>(null);
  const lastPing = useRef<number | null>(null);
  const qc = useQueryClient();
  const token = useAuthStore(s => s.token);

  useEffect(()=>{
    if(!enabled){ return; }
    // Require auth token to establish (avoids unauth errors spam)
    if(!token){ return; }
    setStatus('connecting');
    const s = io(DEFAULT_URL, { withCredentials: true, autoConnect: true, auth: { token } });
    setSocket(s);
    s.on('connect', ()=>{ setStatus('open'); });
    s.on('disconnect', ()=>{ setStatus('closed'); });
    s.on('connect_error', ()=>{ setStatus(prev=> prev==='open'? 'open':'error'); });
    s.on('heartbeat', ()=>{
      setLastHeartbeat(Date.now());
      if(lastPing.current){ setLatency(Date.now() - lastPing.current); }
      lastPing.current = Date.now();
    });
    const invalidateProjects = () => qc.invalidateQueries({ queryKey: ['projects'] });
    s.on('project.created', invalidateProjects);
    s.on('project.updated', invalidateProjects);
    s.on('project.deleted', invalidateProjects);
    return () => { s.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, token]);

  const value: SocketContextValue = { socket, status, lastHeartbeat, latencyMs };
  return <SocketCtx.Provider value={value}>{children}</SocketCtx.Provider>;
}

export function useSocket(){
  const ctx = useContext(SocketCtx);
  if(!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
