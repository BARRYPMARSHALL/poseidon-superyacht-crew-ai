import { Router, Response } from 'express';
import db from '../database';
import { generateId } from '../utils/helpers';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/compliance/:vesselId/reports
router.get('/:vesselId/reports', (req: AuthRequest, res: Response) => {
  const reports = db.prepare('SELECT * FROM compliance_reports WHERE vessel_id = ? ORDER BY report_date DESC').all(req.params.vesselId);
  res.json({ reports });
});

// POST /api/compliance/:vesselId/generate — generate compliance report
router.post('/:vesselId/generate', (req: AuthRequest, res: Response) => {
  const { vesselId } = req.params;
  const { report_type } = req.body;

  const vessel = db.prepare('SELECT * FROM vessels WHERE id = ?').get(vesselId) as any;
  if (!vessel) { res.status(404).json({ error: 'Vessel not found' }); return; }

  const id = generateId();
  const now = new Date().toISOString().split('T')[0];

  let findings = '';
  let recommendations = '';

  if (report_type === 'mlc_2006') {
    const expiredCerts = db.prepare(`SELECT COUNT(*) as count FROM certifications c JOIN crew_members cm ON c.crew_member_id = cm.id WHERE cm.vessel_id = ? AND c.expiry_date < date('now') AND cm.status = 'active'`).get(vesselId) as any;
    const crewWithoutSEA = db.prepare(`SELECT COUNT(*) as count FROM crew_members cm LEFT JOIN sea_agreements sa ON cm.id = sa.crew_member_id AND sa.status = 'active' WHERE cm.vessel_id = ? AND cm.status = 'active' AND sa.id IS NULL`).get(vesselId) as any;
    const expiringVisas = db.prepare(`SELECT COUNT(*) as count FROM visas v JOIN crew_members cm ON v.crew_member_id = cm.id WHERE cm.vessel_id = ? AND v.expiry_date <= date('now', '+30 days') AND cm.status = 'active'`).get(vesselId) as any;

    findings = `MLC 2006 Compliance Audit — ${vessel.name} (${now})\n\n`;
    findings += `Flag State: ${vessel.flag_state}\n`;
    findings += `Total Active Crew: ${(db.prepare('SELECT COUNT(*) as count FROM crew_members WHERE vessel_id = ? AND status = \'active\'').get(vesselId) as any).count}\n\n`;
    findings += `1. Certification Status: ${expiredCerts.count} expired certifications found.\n`;
    findings += `2. Seafarer Employment Agreements: ${crewWithoutSEA.count} crew members without active SEA.\n`;
    findings += `3. Visa Compliance: ${expiringVisas.count} visas expiring within 30 days.\n`;

    if (expiredCerts.count > 0) recommendations += '- Urgent: Renew all expired certifications immediately. Vessel may be detained at next port state control inspection.\n';
    if (crewWithoutSEA.count > 0) recommendations += '- Required: Issue MLC-compliant SEAs for all crew members. This is a mandatory requirement under MLC 2006 Title 2.\n';
    if (expiringVisas.count > 0) recommendations += '- Action: Initiate visa renewals for crew with imminent expiries.\n';
    if (expiredCerts.count === 0 && crewWithoutSEA.count === 0) recommendations += '- All core MLC requirements appear compliant. Maintain current practices.\n';
  } else if (report_type === 'stcw_audit') {
    const allCerts = db.prepare(`SELECT c.cert_name, c.expiry_date, cm.first_name, cm.last_name, cm.position FROM certifications c JOIN crew_members cm ON c.crew_member_id = cm.id WHERE cm.vessel_id = ? AND cm.status = 'active' ORDER BY c.expiry_date`).all(vesselId) as any[];
    findings = `STCW Compliance Audit — ${vessel.name} (${now})\n\n`;
    findings += `Certificates tracked: ${allCerts.length}\n`;
    const expiring = allCerts.filter(c => daysUntil(c.expiry_date) <= 90);
    findings += `Expiring within 90 days: ${expiring.length}\n\n`;

    for (const c of expiring) {
      const d = daysUntil(c.expiry_date);
      findings += `  - ${c.first_name} ${c.last_name} (${c.position}): ${c.cert_name} expires in ${d} days (${c.expiry_date})\n`;
    }
    recommendations = expiring.length > 0 ? '- Schedule renewal training for the certificates listed above.\n- Check certificate dependencies before booking individual refresher courses.\n' : '- All certificates current. No action required.\n';
  }

  db.prepare(`INSERT INTO compliance_reports (id, vessel_id, report_type, report_date, status, findings, recommendations)
    VALUES (?, ?, ?, ?, 'draft', ?, ?)`)
    .run(id, vesselId, report_type, now, findings, recommendations);

  // Log agent activity
  const logId = generateId();
  db.prepare(`INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, details)
    VALUES (?, ?, 'Hermes', 'compliance_report', '${report_type.toUpperCase()} report generated', ?)`)
    .run(logId, vesselId, JSON.stringify({ report_id: id }));

  res.status(201).json({ id, report_type, report_date: now, findings, recommendations });
});

import { daysUntil } from '../utils/helpers';

// GET /api/compliance/training-providers
router.get('/training-providers', (_req: AuthRequest, res: Response) => {
  const providers = db.prepare('SELECT * FROM training_providers ORDER BY rating DESC').all();
  res.json({ providers });
});

export default router;
