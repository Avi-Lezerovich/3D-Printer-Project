import { useProjectStats } from './useProjectStats';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export function ProjectsAnalyticsPanel(){
  const { stats, isLoading, error } = useProjectStats();
  if(isLoading) return <div className="panel"><h2>Project Analytics</h2><p>Loading…</p></div>;
  if(error) return <div className="panel"><h2>Project Analytics</h2><p role="alert">Failed: {(error as Error).message}</p></div>;
  return <div className="panel" aria-labelledby="proj-analytics-heading">
    <h2 id="proj-analytics-heading">Project Analytics</h2>
    <p className="text-sm opacity-80 mb-2">Total Projects: {stats.total}</p>
    {stats.rows.length === 0 && <p className="text-sm opacity-70">No project data.</p>}
    {stats.rows.length > 0 && <div style={{width:'100%', height:220}}>
      <ResponsiveContainer>
        <BarChart data={stats.rows} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="status" /><YAxis allowDecimals={false} /><Tooltip />
          <Bar dataKey="count" fill="var(--accent, #6366f1)" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>}
    <ul className="mt-3 grid gap-1 text-xs" style={{listStyle:'none',padding:0}}>
      {stats.rows.map(r=> <li key={r.status}><strong>{r.status}</strong>: {r.count} ({r.pct}%)</li>)}
    </ul>
  </div>;
}
