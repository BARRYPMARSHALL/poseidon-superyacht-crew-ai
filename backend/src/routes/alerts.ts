import { Router, Response } from 'express';
import db from '../database';
import { generateId } from '../utils/helpers';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/alerts/:vesselId
router.get('/:vesselId', (req: AuthRequest, res: Response) => {
  const { vesselId } = req.params;
  const { severity, unresolved } = req.query;

  let query = 'SELECT * FROM alerts WHERE vessel_id = ?';
  const params: any[] = [vesselId];

  if (severity) { query += ' AND severity = ?'; params.push(severity); }
  if (unresolved === 'true') { query += ' AND is_resolved = 0'; }

  query += ' ORDER BY created_at DESC LIMIT 100';
  const alerts = db.prepare(query).all(...params);
  res.json({ alerts });
});

// GET /api/alerts/:vesselId/count
router.get('/:vesselId/count', (req: AuthRequest, res: Response) => {
  const { vesselId } = req.params;
  const critical = db.prepare('SELECT COUNT(*) as count FROM alerts WHERE vessel_id = ? AND severity = \'critical\' AND is_resolved = 0').get(vesselId) as any;
  const warnings = db.prepare('SELECT COUNT(*) as count FROM alerts WHERE vessel_id = ? AND severity = \'warning\' AND is_resolved = 0').get(vesselId) as any;
  const total = db.prepare('SELECT COUNT(*) as count FROM alerts WHERE vessel_id = ? AND is_resolved = 0').get(vesselId) as any;

  res.json({
    critical: critical.count,
    warnings: warnings.count,
    total_unresolved: total.count
  });
});

// PUT /api/alerts/:alertId/read
router.put('/:alertId/read', (req: AuthRequest, res: Response) => {
  db.prepare('UPDATE alerts SET is_read = 1 WHERE id = ?').run(req.params.alertId);
  res.json({ message: 'Alert marked read' });
});

// PUT /api/alerts/:alertId/resolve
router.put('/:alertId/resolve', (req: AuthRequest, res: Response) => {
  db.prepare('UPDATE alerts SET is_resolved = 1, resolved_at = datetime(\'now\') WHERE id = ?').run(req.params.alertId);
  res.json({ message: 'Alert resolved' });
});

// POST /api/alerts/:vesselId — manually create alert (for testing)
router.post('/:vesselId', (req: AuthRequest, res: Response) => {
  const id = generateId();
  const { crew_member_id, alert_type, severity, title, message } = req.body;
  db.prepare(`INSERT INTO alerts (id, vessel_id, crew_member_id, alert_type, severity, title, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(id, req.params.vesselId, crew_member_id || null, alert_type, severity, title, message);
  res.status(201).json({ id });
});

export default router;
