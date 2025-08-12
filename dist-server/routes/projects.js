import { Router } from 'express';
import crypto from 'node:crypto';
import { body, param, validationResult } from 'express-validator';
import { setCache } from '../middleware/cacheMiddleware.js';
const projects = new Map();
const router = Router();
router.get('/', setCache(10), (_req, res) => {
    res.json({ projects: Array.from(projects.values()) });
});
router.get('/:id', setCache(10), (req, res) => {
    const id = req.params.id;
    const proj = projects.get(id);
    if (!proj)
        return res.status(404).json({ message: 'Project not found' });
    res.json({ project: proj });
});
router.post('/', body('name').isString().trim().isLength({ min: 1, max: 100 }), body('status').optional().isIn(['todo', 'in_progress', 'done']), (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const id = crypto.randomUUID();
    const project = {
        id,
        name: req.body.name.trim(),
        status: req.body.status || 'todo',
        createdAt: new Date().toISOString(),
    };
    projects.set(id, project);
    res.status(201).json({ project });
});
router.put('/:id', param('id').isString(), body('name').optional().isString().trim().isLength({ min: 1, max: 100 }), body('status').optional().isIn(['todo', 'in_progress', 'done']), (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const id = req.params.id;
    const proj = projects.get(id);
    if (!proj)
        return res.status(404).json({ message: 'Project not found' });
    const name = req.body.name?.trim();
    const status = req.body.status;
    const next = { ...proj, ...(name ? { name } : {}), ...(status ? { status } : {}) };
    projects.set(id, next);
    res.json({ project: next });
});
router.delete('/:id', param('id').isString(), (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const id = req.params.id;
    projects.delete(id);
    res.status(204).end();
});
// 405 for unsupported methods on collection and item
router.all('/', (_req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
router.all('/:id', (_req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
export default router;
