/// <reference types="vitest" />
import request from 'supertest'
import app from '../index.js'

// Basic integration tests for refresh token flow

describe('auth refresh flow', () => {
  let refreshToken: string | undefined
  let accessToken: string | undefined
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
    accessToken = res.body.token
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
