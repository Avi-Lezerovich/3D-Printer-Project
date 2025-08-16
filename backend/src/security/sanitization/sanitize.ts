// Basic input sanitization helpers (Phase 2 scaffold)
// Intentionally lightweight; extend with library if risk profile increases.

export function sanitizeString(input: string): string {
  // Match NULL, backspace, tab, newline, carriage return, quotes, backslash, percent
  // Removed \x1a (SUB) to satisfy no-control-regex rule; not commonly encountered in typical HTTP JSON bodies.
  return input.replace(/[\0\b\t\n\r"'\\%]/g, c => {
    switch (c) {
      case '\0': return ''
      case '\n': return ' '
      case '\r': return ' '
      case '"':
      case "'":
      case '\\':
      case '%': return ''
      default: return ''
    }
  }).trim()
}

export function deepSanitize<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'string') return sanitizeString(obj) as any
  if (Array.isArray(obj)) return obj.map(v => deepSanitize(v)) as any
  if (typeof obj === 'object') {
    const out: any = {}
    for (const [k,v] of Object.entries(obj as any)) out[k] = deepSanitize(v)
    return out
  }
  return obj
}
