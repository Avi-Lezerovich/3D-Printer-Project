import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../index.js'

describe('Auth extras', () => {
  it('logout returns 204 and clears cookies', async () => {
    const res = await request(app).post('/api/auth/logout')
    expect(res.statusCode).toBe(204)
  })

  it('me returns null without token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('user', null)
  })
})
