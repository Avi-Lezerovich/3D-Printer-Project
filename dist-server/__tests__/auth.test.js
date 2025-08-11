import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';
describe('Auth routes', () => {
    it('returns health ok', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('ok');
    });
    it('rejects invalid login', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: 'bad', password: 'short' });
        expect(res.statusCode).toBe(400);
    });
});
