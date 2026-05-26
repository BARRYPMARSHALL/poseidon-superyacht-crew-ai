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
    res.status(409).json({ error: 'User already exists' });
    return;
  }

  const id = generateId();
  const hash = hashPassword(password);
  db.prepare(`INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)`)
    .run(id, email, hash, name, role || 'captain');

  const token = generateToken(id, role || 'captain');
  res.status(201).json({ token, user: { id, email, name, role: role || 'captain' } });
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
    }
  });
});

// GET /api/auth/me
router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = db.prepare('SELECT id, email, name, role, organization_id FROM users WHERE id = ?').get(req.userId!) as any;
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
});

export default router;
