import { Router, Response } from 'express';
import db from '../database';
import { generateId, hashPassword, verifyPassword, generateToken } from '../utils/helpers';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', (req: AuthRequest, res: Response) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ error: 'Email, password, and name are required' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'A captain with this email already exists. Please sign in instead.' });
    return;
  }

  const userId = generateId();

  // Auto-create an organization for the new user
  const orgId = generateId();
  db.prepare(`INSERT INTO organizations (id, name, type, email) VALUES (?, ?, 'private_owner', ?)`)
    .run(orgId, `${name}'s Fleet`, email);

  // Auto-create a demo vessel
  const vesselId = generateId();
  db.prepare(`INSERT INTO vessels (id, organization_id, name, flag_state, length_m, max_crew, max_guests, status)
    VALUES (?, ?, ?, 'Cayman Islands', 50, 12, 8, 'active')`)
    .run(vesselId, orgId, 'M/Y DEMO VESSEL');

  // Seed 3 demo crew members so the dashboard isn't empty
  const demoCrew = [
    { first: 'Alex', last: 'Demo', position: 'Captain', dept: 'management', nationality: 'British' },
    { first: 'Sam', last: 'Demo', position: 'Chief Officer', dept: 'deck', nationality: 'Australian' },
    { first: 'Jamie', last: 'Demo', position: 'Chief Engineer', dept: 'engineering', nationality: 'New Zealand' },
  ];
  for (const c of demoCrew) {
    const crewId = generateId();
    db.prepare(`INSERT INTO crew_members (id, vessel_id, first_name, last_name, position, department, nationality, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`)
      .run(crewId, vesselId, c.first, c.last, c.position, c.dept, c.nationality);
  }

  // Create user with 30-day trial
  const hash = hashPassword(password);
  const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(`INSERT INTO users (id, organization_id, email, password_hash, name, role, vessel_ids, trial_ends_at, subscription_tier)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'skipper')`)
    .run(userId, orgId, email, hash, name, role || 'captain', JSON.stringify([vesselId]), trialEnd);

  const token = generateToken(userId, role || 'captain');

  // Log agent activity
  const logId = generateId();
  db.prepare(`INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, details)
    VALUES (?, ?, 'system', 'trial_started', '30-day free trial activated', ?)`)
    .run(logId, vesselId, JSON.stringify({ user: name, email }));

  res.status(201).json({
    token,
    user: { id: userId, email, name, role: role || 'captain', organization_id: orgId },
    trial_ends_at: trialEnd,
    vessel_id: vesselId
  });
});

// POST /api/auth/login
router.post('/login', (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !verifyPassword(password, user.password_hash)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  db.prepare('UPDATE users SET last_login = datetime(\'now\') WHERE id = ?').run(user.id);
  const token = generateToken(user.id, user.role);

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization_id: user.organization_id
    },
    trial_ends_at: user.trial_ends_at,
    subscription_tier: user.subscription_tier
  });
});

// GET /api/auth/me — now includes trial info
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = db.prepare('SELECT id, email, name, role, organization_id, trial_ends_at, subscription_tier, created_at FROM users WHERE id = ?').get(req.userId!) as any;
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Check if trial is still active
  const trialActive = user.trial_ends_at && new Date(user.trial_ends_at) > new Date();

  res.json({
    user: {
      ...user,
      trial_active: trialActive,
      days_remaining_in_trial: trialActive
        ? Math.ceil((new Date(user.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0
    }
  });
});

export default router;
