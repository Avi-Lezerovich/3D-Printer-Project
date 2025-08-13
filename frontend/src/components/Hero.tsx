import { motion } from 'framer-motion'

export default function Hero(){
  return (
    <div className="panel" style={{padding:'32px'}}>
      <motion.h1 initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.5}}>
        Salvaged → Restored: Professional 3D Printer Build
      </motion.h1>
      <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}} style={{marginTop:8, color:'var(--muted)'}}>
        Self-taught firmware, CAD, and mechanical tuning. A complete turnaround from e-waste to high-precision additive manufacturing.
      </motion.p>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:16}}>
        <a className="panel" href="/docs/restoration_report.pdf" download>Download Report</a>
        <a className="panel" href="#contact" onClick={(e)=>e.preventDefault()}>Contact Me</a>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(120px,1fr))',gap:12,marginTop:16}}>
        {[
          {k:'Accuracy', v:'±0.1 mm'},
          {k:'Success', v:'95%+'},
          {k:'Noise', v:'-40%'},
          {k:'Speed', v:'-15% time'},
        ].map((m)=>(
          <div key={m.k} className="panel" style={{textAlign:'center'}}>
            <div style={{fontSize:18,fontWeight:700}}>{m.v}</div>
            <div style={{color:'var(--muted)'}}>{m.k}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
