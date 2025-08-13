import { create } from 'zustand'

type PrinterStatus = 'idle' | 'printing' | 'paused' | 'error'

type Job = { id: string; name: string; progress: number; status: 'queued'|'running'|'done'|'failed' }

type Task = { id:number; title:string; status:'todo'|'doing'|'done'; priority:'low'|'med'|'high' }

interface AppState {
  status: PrinterStatus
  hotend: number
  bed: number
  queue: Job[]
  tasks: Task[]
  connected: boolean
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  setTemps: (hotend:number, bed:number)=>void
  setStatus: (s:PrinterStatus)=>void
  setConnected: (c:boolean)=>void
  addJob: (j:Job)=>void
  updateJob: (id:string, patch: Partial<Job>)=>void
  moveTask: (taskId:number, newStatus:'todo'|'doing'|'done')=>void
  addTask: (title:string, priority:'low'|'med'|'high')=>void
  editTask: (taskId:number, title:string, priority:'low'|'med'|'high')=>void
  deleteTask: (taskId:number)=>void
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const STORAGE_KEY = 'printer-app-state-v1'

function loadInitial(){
  try{ const raw = localStorage.getItem(STORAGE_KEY); if(!raw) return null; return JSON.parse(raw) as Partial<AppState> }catch{ return null }
}

export const useAppStore = create<AppState>((set) => ({
  status: 'idle',
  hotend: 200,
  bed: 60,
  connected: false,
  queue: [{ id: '1', name: 'example.gcode', progress: 0, status: 'queued' }],
  tasks: [
    {id:1,title:'Replace stepper drivers',status:'todo',priority:'high'},
    {id:2,title:'Design fan shroud in CAD',status:'doing',priority:'med'},
    {id:3,title:'Calibrate PID',status:'done',priority:'med'},
  ],
  theme: 'light',
  sidebarCollapsed: false,
  setTemps: (hotend, bed) => set({ hotend, bed }),
  setStatus: (s) => set({ status: s }),
  setConnected: (c) => set({ connected: c }),
  addJob: (j) => set((st) => ({ queue: [...st.queue, j] })),
  updateJob: (id, patch) => set((st)=>({ queue: st.queue.map(j=> j.id===id? { ...j, ...patch }: j ) })),
  moveTask: (taskId, newStatus) => set((st)=>({ 
    tasks: st.tasks.map(t=> t.id===taskId ? {...t, status: newStatus} : t) 
  })),
  addTask: (title, priority) => set((st)=>({ 
    tasks: [...st.tasks, {id: Date.now(), title, status: 'todo' as const, priority}] 
  })),
  editTask: (taskId, title, priority) => set((st)=>({
    tasks: st.tasks.map(t=> t.id===taskId ? {...t, title, priority} : t)
  })),
  deleteTask: (taskId) => set((st)=>({
    tasks: st.tasks.filter(t=> t.id !== taskId)
  })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))

// hydrate from localStorage
const initial = loadInitial()
if(initial){
  useAppStore.setState({
    status: initial.status ?? 'idle',
    hotend: initial.hotend ?? 200,
    bed: initial.bed ?? 60,
    connected: initial.connected ?? false,
    queue: initial.queue ?? [],
    tasks: initial.tasks ?? [],
  })
}

// persist changes
useAppStore.subscribe((state)=>{
  const toSave = { status: state.status, hotend: state.hotend, bed: state.bed, connected: state.connected, queue: state.queue, tasks: state.tasks }
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)) }catch{}
})
