import { describe, it, expect } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../index.js'

describe('Security and error handling', () => {
  const secret = process.env.JWT_SECRET || 'replace_me_dev_only'
  const token = jwt.sign({ sub: 'tester@example.com' }, secret, { expiresIn: '5m' })

  it('GET /api/auth/login -> 405 Method Not Allowed', async () => {
    const res = await request(app).get('/api/auth/login')
    expect(res.statusCode).toBe(405)
    expect(res.body).toHaveProperty('message', 'Method Not Allowed')
  })

  it('unknown route -> 404 Not Found (JSON)', async () => {
    const res = await request(app).get('/api/unknown-path')
    expect(res.statusCode).toBe(404)
    expect(res.body).toHaveProperty('message', 'Not Found')
  })

  it('protected route without auth -> 401 and WWW-Authenticate header', async () => {
    const res = await request(app).get('/api/projects')
    expect(res.statusCode).toBe(401)
    expect(res.headers['www-authenticate']).toContain('Bearer')
    expect(res.body).toHaveProperty('message')
  })

  it('state-changing request without CSRF header -> 403 (with cookie present)', async () => {
    const agent = request.agent(app)
    // Fetch CSRF cookie (but intentionally do not send the header later)
    const csrfRes = await agent.get('/api/csrf-token')
    expect(csrfRes.statusCode).toBe(200)
    const res = await agent
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      // do NOT set x-csrf-token header on purpose
      .send({ name: 'No CSRF' })
    expect(res.statusCode).toBe(403)
    // csurf default message
    expect(typeof res.body?.message).toBe('string')
  })
})
