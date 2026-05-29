import { Router, Request, Response } from 'express';
import query from '../database';

const router = Router();

// Public dashboard — NO AUTH required. Shows live metrics for social proof / SEO.
router.get('/dashboard', (_req: Request, res: Response) => {
  try {
    const vesselCount = (query.prepare('SELECT COUNT(*) as count FROM vessels').get() as any)?.count || 0;
    const crewCount = (query.prepare('SELECT COUNT(*) as count FROM crew_members').get() as any)?.count || 0;
    const certCount = (query.prepare('SELECT COUNT(*) as count FROM certifications').get() as any)?.count || 0;
    const expiredCerts = (query.prepare("SELECT COUNT(*) as count FROM certifications WHERE status = 'expired'").get() as any)?.count || 0;
    const activeAlerts = (query.prepare("SELECT COUNT(*) as count FROM alerts WHERE is_resolved = 0").get() as any)?.count || 0;
    const recentAgentLogs = query.prepare(
      'SELECT agent_name, action_summary, created_at FROM agent_activity_log ORDER BY created_at DESC LIMIT 10'
    ).all() as any[];

    const vessels = query.prepare('SELECT name, flag_state, current_location FROM vessels').all() as any[];

    res.json({
      status: 'operational',
      summary: {
        vessels: vesselCount,
        crewMembers: crewCount,
        certifications: certCount,
        expiredCertifications: expiredCerts,
        activeAlerts,
        complianceRate: certCount > 0 ? Math.round(((certCount - expiredCerts) / certCount) * 100) : 100,
      },
      vessels: vessels.map((v: any) => ({
        name: v.name,
        flag: v.flag_state,
        location: v.current_location || 'Not reported',
      })),
      recentActivity: recentAgentLogs.map((l: any) => ({
        agent: l.agent_name,
        action: l.action_summary,
        time: l.created_at,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Public] Dashboard error:', err.message);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

export default router;
