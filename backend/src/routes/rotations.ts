import { Router, Response } from 'express';
import db from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateId } from '../utils/helpers';

const router = Router();
router.use(authenticate);

// GET /api/rotations/:vesselId
router.get('/:vesselId', (req: AuthRequest, res: Response) => {
  const rotations = db.prepare(`
    SELECT r.*, cm.first_name, cm.last_name, cm.position, cm.department, cm.status as crew_status
    FROM rotations r
    JOIN crew_members cm ON r.crew_member_id = cm.id
    WHERE cm.vessel_id = ?
    ORDER BY r.current_tour_end
  `).all(req.params.vesselId);
  res.json({ rotations });
});

// POST /api/rotations/:crewId — Create/update rotation for a crew member
router.post('/:crewId', (req: AuthRequest, res: Response) => {
  const { crewId } = req.params;
  const { rotation_pattern, days_on, days_off, current_tour_start, current_tour_end, next_tour_start } = req.body;

  const existing = db.prepare('SELECT id FROM rotations WHERE crew_member_id = ?').get(crewId);
  const updates = { rotation_pattern, days_on, days_off, current_tour_start, current_tour_end, next_tour_start };

  if (existing) {
    const sets: string[] = [];
    const vals: any[] = [];
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) { sets.push(`${k} = ?`); vals.push(v); }
    }
    if (sets.length > 0) {
      sets.push("updated_at = datetime('now')");
      vals.push(existing.id);
      db.prepare(`UPDATE rotations SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    }
    res.json({ message: 'Rotation updated', id: existing.id });
  } else {
    const id = generateId();
    db.prepare(`INSERT INTO rotations (id, crew_member_id, rotation_pattern, days_on, days_off, current_tour_start, current_tour_end, next_tour_start)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(id, crewId, rotation_pattern || '3:1', days_on || 90, days_off || 30, current_tour_start || null, current_tour_end || null, next_tour_start || null);
    res.status(201).json({ message: 'Rotation created', id });
  }
});

export default router;
