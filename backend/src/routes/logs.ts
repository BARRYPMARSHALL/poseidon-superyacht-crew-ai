import { Router, Response } from 'express';
import db from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/logs/:vesselId — Get agent activity log
router.get('/:vesselId', (req: AuthRequest, res: Response) => {
  const { vesselId } = req.params;
  const { agent, limit } = req.query;
  let sql = 'SELECT * FROM agent_activity_log WHERE vessel_id = ?';
  const params: any[] = [vesselId];

  if (agent && agent !== 'all') {
    sql += ' AND agent_name = ?';
    params.push(agent);
  }

  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(parseInt(limit as string) || 50);

  const logs = db.prepare(sql).all(...params);
  res.json({ logs });
});

// GET /api/logs/:vesselId/stats — Get agent stats
router.get('/:vesselId/stats', (req: AuthRequest, res: Response) => {
  const { vesselId } = req.params;
  const stats = db.prepare(`
    SELECT agent_name, COUNT(*) as count, MAX(created_at) as last_run
    FROM agent_activity_log WHERE vessel_id = ?
    GROUP BY agent_name ORDER BY count DESC
  `).all(vesselId);
  res.json({ stats });
});

export default router;
