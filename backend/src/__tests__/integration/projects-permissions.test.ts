import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../index.js'

// Basic integration test for permission enforcement

describe('Projects permissions', () => {
  it('rejects unauthenticated create', async () => {
    const res = await request(app).post('/api/v1/projects').send({ name: 'X' })
  expect(res.status).toBe(403)
  })
})
