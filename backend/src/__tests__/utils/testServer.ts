// Minimal helper for future integration/e2e tests
import app, { server } from '../../index.js'

export function getTestApp() { return app }
export function closeTestServer() { try { server.close() } catch { /* ignore */ } }
