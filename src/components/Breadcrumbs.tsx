import { Link, useLocation } from 'react-router-dom'

const label: Record<string,string> = {
  '': 'Portfolio',
  control: 'Control Panel',
  management: 'Project Management',
  settings: 'Settings',
  help: 'Help'
}

export default function Breadcrumbs(){
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean)
  const crumbs = ['/', ...parts.map((_,i)=> '/' + parts.slice(0,i+1).join('/'))]
  return (
    <nav aria-label="Breadcrumb" style={{display:'flex',gap:8,alignItems:'center',color:'var(--muted)'}}>
      {crumbs.map((p,i)=>{
        const seg = p === '/' ? '' : p.split('/').pop() || ''
        const name = label[seg] ?? seg
        const last = i === crumbs.length-1
        return (
          <span key={p}>
            {i>0 && <span style={{margin:"0 6px"}}>›</span>}
            {last ? <span>{name}</span> : <Link to={p}>{name}</Link>}
          </span>
        )
      })}
    </nav>
  )
}
