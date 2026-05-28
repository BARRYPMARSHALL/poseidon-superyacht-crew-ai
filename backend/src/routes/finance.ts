import { Router, Response } from 'express';
import db from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { processPayroll, generateSEATemplate, generateBudgetReport } from '../agents/plutus';
import { generateId } from '../utils/helpers';

const router = Router();
router.use(authenticate);

// Process payroll for a period
router.post('/payroll/:vesselId', async (req: AuthRequest, res: Response) => {
  const vesselId = req.params.vesselId as string;
  const { period_start, period_end } = req.body;
  if (!period_start || !period_end) {
    res.status(400).json({ error: 'period_start and period_end are required' });
    return;
  }
  const result = await processPayroll(vesselId, period_start, period_end);
  res.json(result);
});

// Get payroll records for a vessel
router.get('/payroll/:vesselId', (req: AuthRequest, res: Response) => {
  const vesselId = req.params.vesselId as string;
  const records = db.prepare(`
    SELECT pr.*, cm.first_name, cm.last_name, cm.position, cm.department
    FROM payroll_records pr
    JOIN crew_members cm ON pr.crew_member_id = cm.id
    WHERE cm.vessel_id = ?
    ORDER BY pr.created_at DESC
  `).all(vesselId);
  res.json({ records });
});

// Pay a payroll record
router.put('/payroll/:recordId/pay', (req: AuthRequest, res: Response) => {
  const { recordId } = req.params;
  db.prepare("UPDATE payroll_records SET status = 'paid', paid_date = datetime('now') WHERE id = ?").run(recordId);
  res.json({ message: 'Payroll record marked as paid' });
});

// Generate SEA template for a crew member
router.get('/sea/:crewId', (req: AuthRequest, res: Response) => {
  const crewId = req.params.crewId as string;
  const template = generateSEATemplate(crewId);
  if (!template) { res.status(404).json({ error: 'Crew member not found' }); return; }
  res.json(template);
});

// Save SEA agreement
router.post('/sea', (req: AuthRequest, res: Response) => {
  const { crew_member_id, agreement_date, flag_state, position, salary, salary_currency, leave_days, rotation_pattern } = req.body;
  if (!crew_member_id || !agreement_date || !flag_state || !position || !salary) {
    res.status(400).json({ error: 'Required fields missing' });
    return;
  }
  const id = generateId();
  db.prepare(`INSERT INTO sea_agreements (id, crew_member_id, agreement_date, flag_state, position, salary, salary_currency, leave_days, rotation_pattern, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`)
    .run(id, crew_member_id, agreement_date, flag_state, position, salary, salary_currency || 'EUR', leave_days || 30, rotation_pattern || '3:1');
  res.status(201).json({ id, message: 'SEA agreement saved' });
});

// Get SEA agreements for a crew member
router.get('/sea/crew/:crewId', (req: AuthRequest, res: Response) => {
  const agreements = db.prepare("SELECT * FROM sea_agreements WHERE crew_member_id = ? ORDER BY created_at DESC").all(req.params.crewId);
  res.json({ agreements });
});

// Generate budget report
router.post('/budget/:vesselId', (req: AuthRequest, res: Response) => {
  const vesselId = req.params.vesselId as string;
  const report = generateBudgetReport(vesselId);
  if (!report) { res.status(404).json({ error: 'Vessel not found' }); return; }
  res.json(report);
});

export default router;
