import { useMetrics } from './useMetrics';

export function MetricsPanel(){
  const { data, isLoading, error } = useMetrics();
  if(isLoading) return <div className="panel"><h2>Runtime Metrics</h2><p>Loading…</p></div>;
  if(error) return <div className="panel"><h2>Runtime Metrics</h2><p role="alert">Failed: {(error as Error).message}</p></div>;
  if(!data) return null;
  const mb = (data.memoryRss / 1024 / 1024).toFixed(1);
  return <div className="panel" aria-labelledby="metrics-heading">
    <h2 id="metrics-heading">Runtime Metrics</h2>
    <ul className="grid gap-1 text-sm" style={{listStyle:'none',padding:0}}>
      <li><strong>Total Requests</strong>: {data.reqTotal}</li>
      <li><strong>Active Requests</strong>: {data.reqActive}</li>
      <li><strong>Memory RSS</strong>: {mb} MB</li>
    </ul>
    <small className="opacity-70">Updated {new Date(data.fetchedAt).toLocaleTimeString()}</small>
  </div>;
}
