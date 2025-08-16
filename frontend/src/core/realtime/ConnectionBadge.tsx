import { useSocket } from './SocketProvider';

export function ConnectionBadge(){
  const { status, latencyMs } = useSocket();
  const color = status === 'open' ? 'var(--good)' : status === 'connecting' ? 'var(--warn)' : 'var(--bad)';
  const label = status === 'open' ? 'Realtime Connected' : status === 'connecting' ? 'Connecting…' : 'Offline';
  return (
    <div aria-live="polite" style={{ position: 'fixed', bottom: 12, right: 12, background:'var(--panel)', border:'1px solid var(--border)', padding:'6px 10px', borderRadius:8, fontSize:12, display:'flex', gap:8, alignItems:'center'}}>
      <span style={{ width:10, height:10, borderRadius:'50%', background: color }} aria-hidden />
      <span>{label}{ latencyMs != null && status==='open' ? ` (${latencyMs}ms)` : '' }</span>
    </div>
  );
}
