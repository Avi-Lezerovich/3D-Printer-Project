// Minimal tracing scaffold (Phase 2) – no external collector yet.
// Allows wrapping async operations to measure duration (could integrate with OpenTelemetry later).

export interface Span { name: string; start: number; end?: number; attributes?: Record<string, any> }
const spans: Span[] = []

export function startSpan(name: string, attributes?: Record<string, any>) {
  const span: Span = { name, start: Date.now(), attributes }
  spans.push(span)
  return {
    end(additional?: Record<string, any>) {
      span.end = Date.now()
      if (additional) span.attributes = { ...(span.attributes||{}), ...additional }
      return span
    }
  }
}

export function getSpans() { return spans.slice(-500) }
