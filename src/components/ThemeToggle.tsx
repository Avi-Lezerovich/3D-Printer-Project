import { useEffect, useState } from 'react'

export default function ThemeToggle(){
  const [theme, setTheme] = useState<'dark'|'light'>(()=> (localStorage.getItem('theme') as 'dark'|'light') || 'dark')
  useEffect(()=>{
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  },[theme])
  return (
    <button className="btn" aria-label="Toggle theme" onClick={()=> setTheme(t=> t==='dark'?'light':'dark')}>
      {theme==='dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}
