import { Router, Response } from 'express';
import db from '../database';
import { generateId } from '../utils/helpers';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/vessels
router.get('/', (req: AuthRequest, res: Response) => {
  const vessels = db.prepare('SELECT * FROM vessels ORDER BY name').all();
  res.json({ vessels });
});

// GET /api/vessels/:vesselId
router.get('/:vesselId', (req: AuthRequest, res: Response) => {
  const vessel = db.prepare('SELECT * FROM vessels WHERE id = ?').get(req.params.vesselId);
  if (!vessel) { res.status(404).json({ error: 'Vessel not found' }); return; }
  res.json({ vessel });
});

// POST /api/vessels
router.post('/', (req: AuthRequest, res: Response) => {
  const id = generateId();
  const { organization_id, name, imo_number, mmsi, flag_state, port_of_registry, length_m,
    beam_m, draft_m, gross_tonnage, build_year, builder, max_crew, max_guests } = req.body;

  const org = db.prepare('SELECT id FROM organizations WHERE id = ?').get(organization_id);
  if (!org) { res.status(404).json({ error: 'Organization not found' }); return; }

  db.prepare(`INSERT INTO vessels (id, organization_id, name, imo_number, mmsi, flag_state, port_of_registry, length_m, beam_m, draft_m, gross_tonnage, build_year, builder, max_crew, max_guests)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, organization_id, name, imo_number || null, mmsi || null, flag_state,
      port_of_registry || null, length_m, beam_m || null, draft_m || null,
      gross_tonnage || null, build_year || null, builder || null, max_crew || 10, max_guests || 8);

  res.status(201).json({ id });
});

// PUT /api/vessels/:vesselId
router.put('/:vesselId', (req: AuthRequest, res: Response) => {
  const fields = ['name', 'imo_number', 'mmsi', 'flag_state', 'port_of_registry',
    'length_m', 'beam_m', 'draft_m', 'gross_tonnage', 'build_year', 'builder',
    'max_crew', 'max_guests', 'status', 'current_location'];

  const updates: string[] = [];
  const values: any[] = [];
  for (const field of fields) {
    if (req.body[field] !== undefined) { updates.push(`${field} = ?`); values.push(req.body[field]); }
  }
  if (updates.length > 0) {
    updates.push('updated_at = datetime(\'now\')');
    values.push(req.params.vesselId);
    db.prepare(`UPDATE vessels SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
  res.json({ message: 'Vessel updated' });
});

export default router;
