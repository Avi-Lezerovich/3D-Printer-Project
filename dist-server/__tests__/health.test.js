import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index.js';
describe('Health', () => {
    it('GET /api/health -> 200', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('status', 'ok');
    });
});
