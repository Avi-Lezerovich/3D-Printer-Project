import { useState, useEffect } from 'react';
import { apiClient } from '../../core/api/client';

interface AuditEvent { type: string; at: string; userEmail?: string; ip?: string; version: number; [k: string]: any }

export function AuditLogPanel(){
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(()=>{ (async ()=>{
    setLoading(true); setError(null);
    try {
      const data = await apiClient.get<{ events?: AuditEvent[] }>('/api/v1/audit').catch(()=>({ events: [] }));
      setEvents(data.events || []);
    } catch(e:any){ setError(e.message); }
    finally { setLoading(false); }
  })(); },[]);
  return <div className="panel" aria-labelledby="audit-heading">
    <h2 id="audit-heading">Security Audit Log</h2>
    {loading && <p>Loading…</p>}
    {error && <p role="alert" className="text-red-500">{error}</p>}
    {!loading && !events.length && <p className="text-sm opacity-70">No events (or audit disabled).</p>}
    {!!events.length && <ol style={{maxHeight:280,overflow:'auto',paddingLeft:16}}>
      {events.slice(-200).reverse().map(ev => <li key={ev.at+ev.type} className="mb-1 text-sm">
        <code>{ev.type}</code> – {ev.userEmail || 'n/a'} <span className="opacity-60">{new Date(ev.at).toLocaleTimeString()}</span>
      </li>)}
    </ol>}
  </div>;
}
