import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import jwt from 'jsonwebtoken';
describe('Projects routes', () => {
    const secret = process.env.JWT_SECRET || 'replace_me_dev_only';
    const token = jwt.sign({ sub: 'tester@example.com' }, secret, { expiresIn: '5m' });
    it('lists empty projects', async () => {
        const res = await request(app).get('/api/projects').set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('projects');
    });
    it('creates a project with CSRF', async () => {
        const agent = request.agent(app);
        const csrfRes = await agent.get('/api/csrf-token');
        const csrfToken = csrfRes.body.csrfToken;
        const res = await agent
            .post('/api/projects')
            .set('Authorization', `Bearer ${token}`)
            .set('x-csrf-token', csrfToken)
            .send({ name: 'Test' });
        expect(res.statusCode).toBe(201);
    });
});
