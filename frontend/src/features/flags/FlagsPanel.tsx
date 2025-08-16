import { useEffect, useState } from 'react';
import { apiClient } from '../../core/api/client';

interface FlagsResponse { flags: Record<string, boolean> }
interface FeatureFlags { [k: string]: boolean }

export function FlagsPanel(){
  const [flags, setFlags] = useState<FeatureFlags>({});
  const [error, setError] = useState<string | null>(null);
  useEffect(()=>{ (async ()=>{
  try{ const data = await apiClient.get<FlagsResponse>('/api/v1/flags'); setFlags(data.flags || {}); }
  catch(e){ setError(e instanceof Error ? e.message : 'Failed to load flags'); }
  })(); },[]);
  return <div className="panel" aria-labelledby="flags-heading">
    <h2 id="flags-heading">Feature Flags</h2>
    { error && <p role="alert" className="text-red-500">{error}</p> }
    <ul>{ Object.entries(flags).map(([k,v])=> <li key={k}><code>{k}</code>: { String(v) }</li>) }</ul>
  </div>;
}
