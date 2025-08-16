import client from 'prom-client'

// Central registry to allow future extension (e.g., OpenTelemetry bridge)
export const registry = new client.Registry()
client.collectDefaultMetrics({ register: registry })

export const httpLatency = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Request latency in seconds',
  labelNames: ['method','route','status'],
  buckets: [0.01,0.05,0.1,0.25,0.5,1,2,5]
})

export const authLogins = new client.Counter({ name: 'auth_logins_total', help: 'Total successful logins' })
export const projectsCreated = new client.Counter({ name: 'projects_created_total', help: 'Total projects created' })
export const refreshLatency = new client.Histogram({ name: 'auth_refresh_latency_seconds', help: 'Latency of refresh token rotation', buckets: [0.005,0.01,0.025,0.05,0.1,0.25,0.5] })

registry.registerMetric(httpLatency)
registry.registerMetric(authLogins)
registry.registerMetric(projectsCreated)
registry.registerMetric(refreshLatency)

export function metricsMiddleware() {
  return (req: any, res: any, next: any) => {
    const start = process.hrtime.bigint()
    res.on('finish', () => {
      const durNs = Number(process.hrtime.bigint() - start)
      const route = (req as any).route?.path || req.path
      httpLatency.labels(req.method, route, String(res.statusCode)).observe(durNs / 1e9)
    })
    next()
  }
}

export function exposePrometheus(app: any) {
  app.get('/metrics', async (_req: any, res: any) => {
    res.setHeader('Content-Type', registry.contentType)
    res.end(await registry.metrics())
  })
}
