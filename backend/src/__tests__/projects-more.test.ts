import { describe, it, expect } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../index.js'

describe('Projects CRUD and method guards', () => {
  const secret = process.env.JWT_SECRET || 'replace_me_dev_only'
  const token = jwt.sign({ sub: 'tester@example.com' }, secret, { expiresIn: '5m' })

  it('405 on unsupported methods for collection', async () => {
    const agent = request.agent(app)
    const csrfRes = await agent.get('/api/csrf-token')
    const csrfToken = csrfRes.body.csrfToken
    const res = await agent
      .patch('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .set('x-csrf-token', csrfToken)
      .send({})
    expect(res.statusCode).toBe(405)
  })

  it('GET /:id returns 404 for missing project', async () => {
    const res = await request(app)
      .get('/api/projects/non-existent-id')
      .set('Authorization', `Bearer ${token}`)
    expect(res.statusCode).toBe(404)
    expect(res.body).toHaveProperty('message')
  })

  it('creates, reads, updates, deletes a project (happy path)', async () => {
    const agent = request.agent(app)
    const csrfRes = await agent.get('/api/csrf-token')
    const csrfToken = csrfRes.body.csrfToken

    // create
    const createRes = await agent
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .set('x-csrf-token', csrfToken)
      .send({ name: 'Proj A', status: 'todo' })
    expect(createRes.statusCode).toBe(201)
    const id = createRes.body.project.id as string

    // get
    const getRes = await agent
      .get(`/api/projects/${id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(getRes.statusCode).toBe(200)
    expect(getRes.body.project.name).toBe('Proj A')

    // update
    const updateRes = await agent
      .put(`/api/projects/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-csrf-token', csrfToken)
      .send({ name: 'Proj A+', status: 'in_progress' })
    expect(updateRes.statusCode).toBe(200)
    expect(updateRes.body.project.status).toBe('in_progress')

    // delete
    const delRes = await agent
      .delete(`/api/projects/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-csrf-token', csrfToken)
    expect(delRes.statusCode).toBe(204)

    // subsequent get -> 404
    const getMissing = await agent
      .get(`/api/projects/${id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(getMissing.statusCode).toBe(404)
  })
})
