import { useEffect, useRef, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAppStore } from '../../../../shared/store'

type Point = { t: number; hotend: number; bed: number }

export default function TemperatureChart(){
  const hotend = useAppStore(s=>s.hotend)
  const bed = useAppStore(s=>s.bed)
  const [data, setData] = useState<Point[]>([])
  const timer = useRef<number | null>(null)

  useEffect(()=>{
    // seed few points
    const now = Date.now()
    setData([
      { t: now-40000, hotend: hotend-5, bed: bed-2 },
      { t: now-30000, hotend: hotend-3, bed: bed-1 },
      { t: now-20000, hotend: hotend-2, bed: bed-1 },
      { t: now-10000, hotend: hotend-1, bed: bed },
      { t: now, hotend, bed },
    ])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  useEffect(()=>{
    // pseudo live update using current set temps with small noise
    timer.current = window.setInterval(()=>{
      setData(prev => {
        const next: Point = {
          t: Date.now(),
          hotend: Math.max(0, hotend + (Math.random()*2-1)),
          bed: Math.max(0, bed + (Math.random()*1-0.5))
        }
        const arr = [...prev, next]
        return arr.slice(-30) // last 30 points
      })
    }, 2000)
    return ()=> { if(timer.current) window.clearInterval(timer.current) }
  },[hotend, bed])

  return (
    <div style={{width:'100%',height:240}}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <XAxis dataKey="t" tickFormatter={(v)=> new Date(v).toLocaleTimeString()} minTickGap={40} stroke="#7fb6e6"/>
          <YAxis domain={[0, Math.max(260, hotend+20)]} stroke="#7fb6e6"/>
          <Tooltip labelFormatter={(v)=> new Date(v as number).toLocaleTimeString()} />
          <Legend />
          <Line type="monotone" dataKey="hotend" stroke="#00aef0" dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="bed" stroke="#37d67a" dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
