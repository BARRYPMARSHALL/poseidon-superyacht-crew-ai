import { Router, Response } from 'express';
import db from '../database';
import { generateId } from '../utils/helpers';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/orgs
router.get('/', (_req: AuthRequest, res: Response) => {
  const orgs = db.prepare('SELECT * FROM organizations ORDER BY name').all();
  res.json({ organizations: orgs });
});

// POST /api/orgs
router.post('/', (req: AuthRequest, res: Response) => {
  const id = generateId();
  const { name, type, email, phone, country } = req.body;
  db.prepare('INSERT INTO organizations (id, name, type, email, phone, country) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, name, type, email || null, phone || null, country || null);
  res.status(201).json({ id });
});

// GET /api/orgs/:orgId/vessels
router.get('/:orgId/vessels', (req: AuthRequest, res: Response) => {
  const vessels = db.prepare('SELECT * FROM vessels WHERE organization_id = ? ORDER BY name').all(req.params.orgId);
  res.json({ vessels });
});

export default router;
