type Step = { title: string; detail: string }

export default function Timeline({ steps }: { steps: Step[] }){
  return (
    <ol style={{listStyle:'none',margin:0,padding:0}}>
      {steps.map((s,i)=> (
        <li key={i} style={{display:'grid',gridTemplateColumns:'32px 1fr',gap:12,alignItems:'start',marginBottom:12}}>
          <div style={{width:32,height:32,borderRadius:16,background:'var(--accent)',display:'grid',placeItems:'center',fontWeight:700}}>{i+1}</div>
          <div className="panel">
            <div style={{fontWeight:700}}>{s.title}</div>
            <div style={{color:'var(--muted)'}}>{s.detail}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}
