import type { Task, TaskDependency } from '@3d/shared'

export function computeCriticalPath(tasks: Task[], deps: TaskDependency[]) {
  const taskMap = new Map(tasks.map(t => [t.id, t]))
  const incoming = new Map<string, TaskDependency[]>()
  deps.forEach(d => { incoming.set(d.toTaskId, [ ...(incoming.get(d.toTaskId) || []), d ]) })
  const memo = new Map<string, { length: number; path: string[] }>()
  function dfs(id: string) {
    if (memo.has(id)) return memo.get(id)!
    const preds = (incoming.get(id) || []).map(d => d.fromTaskId)
    if (!preds.length) {
      const base = { length: 1, path: [id] }
      memo.set(id, base)
      return base
    }
    let best = { length: 0, path: [] as string[] }
    preds.forEach(pid => {
      const r = dfs(pid)
      if (r.length > best.length) best = r
    })
    const result = { length: best.length + 1, path: [...best.path, id] }
    memo.set(id, result)
    return result
  }
  let global = { length: 0, path: [] as string[] }
  tasks.forEach(t => {
    const r = dfs(t.id)
    if (r.length > global.length) global = r
  })
  return global.path.map(id => taskMap.get(id)!).filter(Boolean)
}
