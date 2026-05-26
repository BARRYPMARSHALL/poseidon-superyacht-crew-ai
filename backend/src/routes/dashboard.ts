import { Router, Response } from 'express';
import db from '../database';
import { daysUntil } from '../utils/helpers';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/dashboard/:vesselId
router.get('/:vesselId', (req: AuthRequest, res: Response) => {
  const { vesselId } = req.params;

  const vessel = db.prepare('SELECT * FROM vessels WHERE id = ?').get(vesselId) as any;
  if (!vessel) { res.status(404).json({ error: 'Vessel not found' }); return; }

  // Crew stats
  const crewTotal = db.prepare('SELECT COUNT(*) as count FROM crew_members WHERE vessel_id = ? AND status = \'active\'').get(vesselId) as any;
  const crewOnLeave = db.prepare('SELECT COUNT(*) as count FROM crew_members WHERE vessel_id = ? AND status = \'on_leave\'').get(vesselId) as any;
  const crewByDept = db.prepare('SELECT department, COUNT(*) as count FROM crew_members WHERE vessel_id = ? AND status = \'active\' GROUP BY department').all(vesselId) as any[];

  // Cert expiry summary
  const now = new Date();
  const expired = db.prepare(`SELECT COUNT(*) as count FROM certifications c JOIN crew_members cm ON c.crew_member_id = cm.id WHERE cm.vessel_id = ? AND c.expiry_date < date('now') AND cm.status = 'active'`).get(vesselId) as any;
  const expiring30 = db.prepare(`SELECT COUNT(*) as count FROM certifications c JOIN crew_members cm ON c.crew_member_id = cm.id WHERE cm.vessel_id = ? AND c.expiry_date >= date('now') AND c.expiry_date <= date('now', '+30 days') AND cm.status = 'active'`).get(vesselId) as any;
  const expiring90 = db.prepare(`SELECT COUNT(*) as count FROM certifications c JOIN crew_members cm ON c.crew_member_id = cm.id WHERE cm.vessel_id = ? AND c.expiry_date > date('now', '+30 days') AND c.expiry_date <= date('now', '+90 days') AND cm.status = 'active'`).get(vesselId) as any;

  // Visa expiries
  const visaExpiring = db.prepare(`SELECT COUNT(*) as count FROM visas v JOIN crew_members cm ON v.crew_member_id = cm.id WHERE cm.vessel_id = ? AND v.expiry_date >= date('now') AND v.expiry_date <= date('now', '+90 days') AND cm.status = 'active'`).get(vesselId) as any;

  // Passport expiries
  const passportExpiring = db.prepare(`SELECT COUNT(*) as count FROM crew_members WHERE vessel_id = ? AND status = 'active' AND passport_expiry >= date('now') AND passport_expiry <= date('now', '+90 days')`).get(vesselId) as any;

  // Unresolved alerts
  const criticalAlerts = db.prepare('SELECT COUNT(*) as count FROM alerts WHERE vessel_id = ? AND severity = \'critical\' AND is_resolved = 0').get(vesselId) as any;
  const warningAlerts = db.prepare('SELECT COUNT(*) as count FROM alerts WHERE vessel_id = ? AND severity = \'warning\' AND is_resolved = 0').get(vesselId) as any;

  // Recent agent activity
  const recentActivity = db.prepare('SELECT * FROM agent_activity_log WHERE vessel_id = ? ORDER BY created_at DESC LIMIT 20').all(vesselId);

  // Upcoming contract ends (next 60 days)
  const contractEnds = db.prepare(`SELECT id, first_name, last_name, position, contract_end_date FROM crew_members WHERE vessel_id = ? AND status = 'active' AND contract_end_date >= date('now') AND contract_end_date <= date('now', '+60 days') ORDER BY contract_end_date`).all(vesselId);

  res.json({
    vessel: { name: vessel.name, flag: vessel.flag_state, length: vessel.length_m, status: vessel.status },
    crew: { total: crewTotal.count, on_leave: crewOnLeave.count, by_department: crewByDept },
    certifications: { expired: expired.count, expiring_30_days: expiring30.count, expiring_90_days: expiring90.count },
    visas_expiring_90_days: visaExpiring.count,
    passports_expiring_90_days: passportExpiring.count,
    alerts: { critical: criticalAlerts.count, warnings: warningAlerts.count },
    contracts_ending_60_days: contractEnds,
    recent_activity: recentActivity
  });
});

export default router;
