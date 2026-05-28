import { Router, Response } from 'express';
import db from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateId } from '../utils/helpers';

const router = Router();
router.use(authenticate);

// GET /api/visas/:crewId - Get visas for a crew member
router.get('/:crewId', (req: AuthRequest, res: Response) => {
  const visas = db.prepare('SELECT * FROM visas WHERE crew_member_id = ? ORDER BY expiry_date').all(req.params.crewId);
  res.json({ visas });
});

// POST /api/visas/:crewId - Add visa
router.post('/:crewId', (req: AuthRequest, res: Response) => {
  const { crew_member_id, visa_type, visa_number, issuing_country, issue_date, expiry_date, days_remaining, schengen_zone } = req.body;
  const id = generateId();
  db.prepare(`INSERT INTO visas (id, crew_member_id, visa_type, visa_number, issuing_country, issue_date, expiry_date, days_remaining, schengen_zone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, crew_member_id || req.params.crewId, visa_type, visa_number || null, issuing_country, issue_date, expiry_date, days_remaining || null, schengen_zone ? 1 : 0);
  res.status(201).json({ id, message: 'Visa added' });
});

// PUT /api/visas/:visaId - Update visa
router.put('/:visaId', (req: AuthRequest, res: Response) => {
  const { visaId } = req.params;
  const fields = ['visa_type', 'visa_number', 'issuing_country', 'issue_date', 'expiry_date', 'days_used', 'days_remaining', 'schengen_zone', 'notes'];
  const updates: string[] = [];
  const values: any[] = [];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  }
  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    values.push(visaId);
    db.prepare(`UPDATE visas SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
  res.json({ message: 'Visa updated' });
});

export default router;
