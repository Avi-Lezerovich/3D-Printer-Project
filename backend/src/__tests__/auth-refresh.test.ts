/// <reference types="vitest/globals" />
// Vitest global reference ensures describe/it/expect are typed in editors
import request from 'supertest'
import app from '../index.js'

// Basic integration tests for refresh token flow

describe('auth refresh flow', () => {
  let refreshToken: string | undefined
  const email = 'demo@example.com'
  const password = 'Password123!'

  it('logs in and obtains refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200)
    expect(res.body.refreshToken).toBeDefined()
    expect(res.body.token).toBeDefined()
    refreshToken = res.body.refreshToken
  })

  it('rotates refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200)
    expect(res.body.refreshToken).toBeDefined()
    expect(res.body.token).toBeDefined()
    expect(res.body.refreshToken).not.toEqual(refreshToken)
    refreshToken = res.body.refreshToken
  })

  it('rejects invalid refresh token', async () => {
    await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'invalid' })
      .expect(401)
  })
})
