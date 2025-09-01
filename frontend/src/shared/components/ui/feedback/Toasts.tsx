import { useAppStore, Toast } from '../shared/store';

function ToastItem({ t }: { t: Toast }) {
  const dismiss = useAppStore(s=> s.dismissToast);
  return (
    <div
      role="status"
      aria-live={t.variant === 'error' ? 'assertive' : 'polite'}
      className={`toast toast-${t.variant}`}
      style={{
        background: 'var(--panel-bg, #222)',
        color: 'var(--text-on-accent, #fff)',
        padding: '12px 14px',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,.35)',
        display: 'grid',
        gap: 4,
        minWidth: 240,
        position: 'relative'
      }}
    >
      <strong style={{fontSize:14}}>{t.title || t.variant.toUpperCase()}</strong>
      <div style={{fontSize:13,lineHeight:1.3}}>{t.message}</div>
      <button onClick={()=>dismiss(t.id)} aria-label="Dismiss" style={{position:'absolute',top:4,right:6,background:'transparent',color:'inherit',border:'none',cursor:'pointer'}}>×</button>
    </div>
  );
}

export default function Toasts(){
  const toasts = useAppStore(s=> s.toasts);
  if(!toasts.length) return null;
  return (
    <div
      aria-label="Notifications"
      style={{
        position: 'fixed',
        zIndex: 1100,
        bottom: 12,
        right: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 'clamp(260px, 30vw, 360px)'
      }}
    >
      {toasts.slice(-5).map(t=> <ToastItem key={t.id} t={t} />)}
    </div>
  );
}
