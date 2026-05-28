import { Router, Response } from 'express';
import db from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { draftJobDescription, screenCV, generateDevelopmentPlan } from '../agents/mentor';

const router = Router();
router.use(authenticate);

// Draft job description
router.post('/job-description/:vesselId', (req: AuthRequest, res: Response) => {
  const vesselId = req.params.vesselId as string;
  const { position, department } = req.body;
  if (!position) { res.status(400).json({ error: 'Position is required' }); return; }
  const jd = draftJobDescription(vesselId, position, department || 'deck');
  res.json(jd);
});

// Screen CVs
router.post('/screen/:vesselId', (req: AuthRequest, res: Response) => {
  const vesselId = req.params.vesselId as string;
  const { position, candidates } = req.body;
  if (!position || !candidates) { res.status(400).json({ error: 'Position and candidates are required' }); return; }
  const result = screenCV(vesselId, position, candidates);
  res.json(result);
});

// Generate development plan for a crew member
router.get('/development/:crewId', (req: AuthRequest, res: Response) => {
  const crewId = req.params.crewId as string;
  const plan = generateDevelopmentPlan(crewId);
  if (!plan) { res.status(404).json({ error: 'Crew member not found' }); return; }
  res.json(plan);
});

export default router;
