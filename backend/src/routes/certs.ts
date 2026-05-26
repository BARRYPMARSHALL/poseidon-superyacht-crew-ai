import { Router, Response } from 'express';
import db from '../database';
import { generateId, daysUntil } from '../utils/helpers';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/certs/crew/:crewId
router.get('/crew/:crewId', (req: AuthRequest, res: Response) => {
  const certs = db.prepare('SELECT * FROM certifications WHERE crew_member_id = ? ORDER BY expiry_date').all(req.params.crewId);
  const enriched = (certs as any[]).map(c => ({ ...c, days_until_expiry: daysUntil(c.expiry_date) }));
  res.json({ certifications: enriched });
});

// GET /api/certs/vessel/:vesselId/expiring
router.get('/vessel/:vesselId/expiring', (req: AuthRequest, res: Response) => {
  const { vesselId } = req.params;
  const days = parseInt(req.query.days as string) || 90;
  const now = new Date();
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const certs = db.prepare(`
    SELECT c.*, cm.first_name, cm.last_name, cm.position, cm.department
    FROM certifications c
    JOIN crew_members cm ON c.crew_member_id = cm.id
    WHERE cm.vessel_id = ? AND c.expiry_date <= ? AND c.status != 'expired'
    ORDER BY c.expiry_date
  `).all(vesselId, cutoff);

  const enriched = (certs as any[]).map(c => ({ ...c, days_until_expiry: daysUntil(c.expiry_date) }));
  res.json({ expiring_certs: enriched, count: enriched.length });
});

// POST /api/certs/crew/:crewId
router.post('/crew/:crewId', (req: AuthRequest, res: Response) => {
  const { crewId } = req.params;
  const member = db.prepare('SELECT id, vessel_id FROM crew_members WHERE id = ?').get(crewId) as any;
  if (!member) { res.status(404).json({ error: 'Crew member not found' }); return; }

  const id = generateId();
  const { cert_type, cert_name, cert_number, issuing_authority, flag_state, issue_date, expiry_date, revalidation_required, revalidation_window_days, digital_copy_url, notes } = req.body;

  const remainingDays = daysUntil(expiry_date);
  let status = 'valid';
  if (remainingDays < 0) status = 'expired';
  else if (remainingDays <= 30) status = 'expiring_soon';

  db.prepare(`INSERT INTO certifications (id, crew_member_id, cert_type, cert_name, cert_number, issuing_authority, flag_state, issue_date, expiry_date, revalidation_required, revalidation_window_days, digital_copy_url, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, crewId, cert_type, cert_name, cert_number || null, issuing_authority,
      flag_state || null, issue_date, expiry_date, revalidation_required !== false ? 1 : 0,
      revalidation_window_days || 90, digital_copy_url || null, status, notes || null);

  res.status(201).json({ id, status, days_until_expiry: remainingDays });
});

// PUT /api/certs/:certId
router.put('/:certId', (req: AuthRequest, res: Response) => {
  const { certId } = req.params;
  const existing = db.prepare('SELECT id FROM certifications WHERE id = ?').get(certId);
  if (!existing) { res.status(404).json({ error: 'Certification not found' }); return; }

  const fields = ['cert_type', 'cert_name', 'cert_number', 'issuing_authority', 'flag_state',
    'issue_date', 'expiry_date', 'revalidation_required', 'revalidation_window_days', 'digital_copy_url', 'status', 'notes'];

  const updates: string[] = [];
  const values: any[] = [];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  }

  if (req.body.expiry_date) {
    const remainingDays = daysUntil(req.body.expiry_date);
    let status = 'valid';
    if (remainingDays < 0) status = 'expired';
    else if (remainingDays <= 30) status = 'expiring_soon';
    updates.push('status = ?');
    values.push(status);
  }

  if (updates.length > 0) {
    updates.push('updated_at = datetime(\'now\')');
    values.push(certId);
    db.prepare(`UPDATE certifications SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  res.json({ message: 'Certification updated' });
});

// DELETE /api/certs/:certId
router.delete('/:certId', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM certifications WHERE id = ?').run(req.params.certId);
  res.json({ message: 'Certification deleted' });
});

export default router;
