import { Router, Response } from 'express';
import db from '../database';
import { generateId } from '../utils/helpers';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/crew/:vesselId
router.get('/:vesselId', (req: AuthRequest, res: Response) => {
  const { vesselId } = req.params;
  const crew = db.prepare('SELECT * FROM crew_members WHERE vessel_id = ? ORDER BY department, position').all(vesselId);
  res.json({ crew });
});

// GET /api/crew/:vesselId/:crewId
router.get('/:vesselId/:crewId', (req: AuthRequest, res: Response) => {
  const { vesselId, crewId } = req.params;
  const member = db.prepare('SELECT * FROM crew_members WHERE id = ? AND vessel_id = ?').get(crewId, vesselId);
  if (!member) { res.status(404).json({ error: 'Crew member not found' }); return; }

  const certs = db.prepare('SELECT * FROM certifications WHERE crew_member_id = ? ORDER BY expiry_date').all(crewId);
  const visas = db.prepare('SELECT * FROM visas WHERE crew_member_id = ? ORDER BY expiry_date').all(crewId);
  const rotation = db.prepare('SELECT * FROM rotations WHERE crew_member_id = ?').get(crewId);
  const sea = db.prepare('SELECT * FROM sea_agreements WHERE crew_member_id = ? AND status = \'active\' ORDER BY agreement_date DESC').get(crewId);

  res.json({ member, certifications: certs, visas, rotation, sea_agreement: sea });
});

// POST /api/crew/:vesselId
router.post('/:vesselId', (req: AuthRequest, res: Response) => {
  const { vesselId } = req.params;
  const vessel = db.prepare('SELECT id FROM vessels WHERE id = ?').get(vesselId);
  if (!vessel) { res.status(404).json({ error: 'Vessel not found' }); return; }

  const id = generateId();
  const {
    first_name, last_name, email, phone, nationality, date_of_birth,
    position, department, join_date, contract_end_date, salary, salary_currency,
    bank_details, emergency_contact_name, emergency_contact_phone, next_of_kin,
    passport_number, passport_expiry, passport_country, status
  } = req.body;

  db.prepare(`INSERT INTO crew_members (id, vessel_id, first_name, last_name, email, phone, nationality, date_of_birth, position, department, join_date, contract_end_date, salary, salary_currency, bank_details, emergency_contact_name, emergency_contact_phone, next_of_kin, passport_number, passport_expiry, passport_country, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, vesselId, first_name, last_name, email || null, phone || null, nationality || null,
      date_of_birth || null, position, department || null, join_date || null, contract_end_date || null,
      salary || null, salary_currency || 'EUR', bank_details || null, emergency_contact_name || null,
      emergency_contact_phone || null, next_of_kin || null, passport_number || null,
      passport_expiry || null, passport_country || null, status || 'active');

  // Log agent activity
  const agentLogId = generateId();
  db.prepare(`INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, details)
    VALUES (?, ?, ?, ?, ?, ?)`)
    .run(agentLogId, vesselId, 'system', 'crew_created', `Crew member ${first_name} ${last_name} added`, JSON.stringify({ position }));

  res.status(201).json({ id, message: 'Crew member created' });
});

// PUT /api/crew/:vesselId/:crewId
router.put('/:vesselId/:crewId', (req: AuthRequest, res: Response) => {
  const { vesselId, crewId } = req.params;
  const existing = db.prepare('SELECT id FROM crew_members WHERE id = ? AND vessel_id = ?').get(crewId, vesselId);
  if (!existing) { res.status(404).json({ error: 'Crew member not found' }); return; }

  const fields = ['first_name', 'last_name', 'email', 'phone', 'nationality', 'date_of_birth',
    'position', 'department', 'join_date', 'contract_end_date', 'salary', 'salary_currency',
    'bank_details', 'emergency_contact_name', 'emergency_contact_phone', 'next_of_kin',
    'passport_number', 'passport_expiry', 'passport_country', 'status', 'notes'];

  const updates: string[] = [];
  const values: any[] = [];

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  }

  if (updates.length > 0) {
    updates.push('updated_at = datetime(\'now\')');
    values.push(crewId);
    db.prepare(`UPDATE crew_members SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  res.json({ message: 'Crew member updated' });
});

// DELETE /api/crew/:vesselId/:crewId
router.delete('/:vesselId/:crewId', (req: AuthRequest, res: Response) => {
  const { vesselId, crewId } = req.params;
  const existing = db.prepare('SELECT id FROM crew_members WHERE id = ? AND vessel_id = ?').get(crewId, vesselId);
  if (!existing) { res.status(404).json({ error: 'Crew member not found' }); return; }

  db.prepare('UPDATE crew_members SET status = \'offboarded\', updated_at = datetime(\'now\') WHERE id = ?').run(crewId);
  res.json({ message: 'Crew member offboarded' });
});

export default router;
