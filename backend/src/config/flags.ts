// Simple feature flag system: env-driven with in-process overrides.
// Usage: if (flagEnabled('NEW_REFRESH_FLOW')) { ... }

const runtimeOverrides = new Map<string, boolean>()

export function flagEnabled(name: string): boolean {
  if (runtimeOverrides.has(name)) return !!runtimeOverrides.get(name)
  const envVal = process.env[`FLAG_${name}`]
  if (envVal === undefined) return false
  return ['1','true','on','yes','enabled'].includes(envVal.toLowerCase())
}

export function setFlag(name: string, value: boolean) {
  runtimeOverrides.set(name, value)
}

export function listFlags() {
  const entries: Record<string, boolean> = {}
  for (const [k,v] of runtimeOverrides.entries()) entries[k] = v
  for (const k of Object.keys(process.env).filter(k => k.startsWith('FLAG_'))) {
    const name = k.substring(5)
    if (!(name in entries)) entries[name] = flagEnabled(name)
  }
  return entries
}
