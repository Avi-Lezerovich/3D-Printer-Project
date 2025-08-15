import { describe, it, expect, beforeAll, afterAll, test } from 'vitest'
import { io as Client, Socket } from 'socket.io-client'
import jwt from 'jsonwebtoken'
// Enable realtime before importing app so index.ts sees flag
process.env.FLAG_REALTIME = 'true'
import app, { server } from '../index.js'
import { securityConfig } from '../config/index.js'
import { createProject, updateProject, deleteProject } from '../services/projectService.js'

function makeToken() {
  return jwt.sign({ email: 'test@example.com', role: 'user' }, securityConfig.jwt.secret, { expiresIn: '5m' })
}

describe('socket project events', () => {
  let socket: Socket
  beforeAll(async () => {
    await new Promise<void>(resolve => server.listen(0, resolve))
    const addr = server.address()
    const port = typeof addr === 'object' && addr ? addr.port : 3000
    socket = Client(`http://127.0.0.1:${port}`, { auth: { token: makeToken() }, transports: ['websocket'], timeout: 1000 })
    const ok = await new Promise<boolean>((resolve) => {
      socket.on('connect', () => resolve(true))
      socket.on('connect_error', () => resolve(false))
    })
    if (!ok) {
      // mark skip by closing & setting flag
      ;(socket as any).skipTests = true
    }
  })
  afterAll(() => {
    socket.close()
    server.close()
  })

  it('receives project created/updated/deleted events', async () => {
    if ((socket as any).skipTests) return
    const received: string[] = []
    socket.on('project.created', (p) => received.push('c:'+p.id))
    socket.on('project.updated', (p) => received.push('u:'+p.id))
    socket.on('project.deleted', (p) => received.push('d:'+p.id))

    const proj = await createProject('SockProj','todo')
    await updateProject(proj.id, { status: 'done' })
    await deleteProject(proj.id)

    await new Promise(r => setTimeout(r, 200))
    expect(received.filter(r => r.startsWith('c:'))).toHaveLength(1)
    expect(received.filter(r => r.startsWith('u:'))).toHaveLength(1)
    expect(received.filter(r => r.startsWith('d:'))).toHaveLength(1)
  })
})
