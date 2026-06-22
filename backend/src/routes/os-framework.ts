import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  captureWorkflow, interviewWorkflow, getWorkflows,
  calculateAiReadiness, generateAutomationPlan
} from '../agents/tacit-knowledge';
import {
  logSensingEvent, getSensingEvents, getUrgentEvents,
  generateSensingReport, resolveEvent
} from '../agents/sensing';
import type { Category } from '../agents/sensing';
import {
  logOutcome, getRecentOutcomes, getFailurePatterns,
  generateImprovements, runLearningCycle
} from '../agents/learning';
import {
  createCheckpoint, rollbackToCheckpoint, getCheckpoints,
  queueForReview, reviewAction, getPendingReviews, getReviewStats
} from '../agents/governance';

const router = Router();

// ====== TACIT KNOWLEDGE ======

router.post('/tacit/workflows', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const result = captureWorkflow({ ...req.body, vesselId: req.body.vessel_id });
    res.json(result);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/tacit/workflows', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vesselId = req.query.vessel_id as string;
    const domain = req.query.domain as string | undefined;
    const workflows = getWorkflows(vesselId, domain);
    res.json({ workflows });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/tacit/interview', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { vessel_id, domain } = req.body;
    const questions = interviewWorkflow(vessel_id, domain);
    res.json({ questions });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/tacit/workflows/:id/readiness', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const score = calculateAiReadiness(req.params.id as string);
    res.json({ ai_readiness: score });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/tacit/workflows/:id/automation-plan', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const plan = generateAutomationPlan(req.params.id as string);
    res.json(plan);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ====== SENSING ======

router.post('/sensing/events', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { vessel_id, category, title, description, severity, url } = req.body;
    const event = logSensingEvent(vessel_id, category, title, description, severity, url);
    res.json(event);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/sensing/events', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vesselId = req.query.vessel_id as string;
    const category = req.query.category as Category | undefined;
    const actionable = req.query.actionable === 'true' ? true : undefined;
    const days = req.query.days ? parseInt(req.query.days as string) : undefined;
    const events = getSensingEvents(vesselId, category, actionable, days);
    res.json({ events });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/sensing/urgent', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vesselId = req.query.vessel_id as string;
    const events = getUrgentEvents(vesselId);
    res.json({ events });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/sensing/report', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vesselId = req.query.vessel_id as string;
    const report = generateSensingReport(vesselId);
    res.json(report);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/sensing/events/:id/resolve', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const event = resolveEvent(req.params.id as string, req.body.action_taken);
    res.json(event);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ====== LEARNING LOOP ======

router.post('/learning/outcomes', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { vessel_id, agent_name, action_type, input_summary, output_summary, outcome, success_score, lessons, suggestions } = req.body;
    const result = logOutcome(vessel_id, agent_name, action_type, input_summary, output_summary, outcome, success_score, lessons, suggestions);
    res.json(result);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/learning/outcomes', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vesselId = req.query.vessel_id as string;
    const agentName = req.query.agent_name as string | undefined;
    const days = req.query.days ? parseInt(req.query.days as string) : undefined;
    const outcomes = getRecentOutcomes(vesselId, agentName, days);
    res.json({ outcomes });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/learning/failure-patterns', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vesselId = req.query.vessel_id as string;
    const days = req.query.days ? parseInt(req.query.days as string) : undefined;
    const patterns = getFailurePatterns(vesselId, days);
    res.json(patterns);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/learning/improvements', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vesselId = req.body.vessel_id;
    const improvements = generateImprovements(vesselId);
    res.json(improvements);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/learning/cycle', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vesselId = req.body.vessel_id;
    const result = runLearningCycle(vesselId);
    res.json(result);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ====== GOVERNANCE ======

router.post('/governance/checkpoints', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { vessel_id, agent_name, snapshot_type, snapshot_data } = req.body;
    const cp = createCheckpoint(vessel_id, agent_name, snapshot_type, snapshot_data);
    res.json(cp);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/governance/checkpoints', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vesselId = req.query.vessel_id as string;
    const agentName = req.query.agent_name as string | undefined;
    const status = req.query.status as string | undefined;
    const cps = getCheckpoints(vesselId, agentName, status);
    res.json({ checkpoints: cps });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/governance/checkpoints/:id/rollback', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = rollbackToCheckpoint(String(req.params.id));
    res.json({ rolled_back: !!snapshot, snapshot_data: snapshot });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/governance/reviews', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { vessel_id, agent_name, action_type, description, context_data, checkpoint_id } = req.body;
    const review = queueForReview(vessel_id, agent_name, action_type, description, context_data, checkpoint_id);
    res.json(review);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/governance/reviews', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vesselId = req.query.vessel_id as string;
    const reviews = getPendingReviews(vesselId);
    res.json({ reviews });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/governance/reviews/:id/decide', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { decision, notes } = req.body;
    const result = reviewAction(String(req.params.id), req.userId!, decision, notes);
    res.json(result);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/governance/reviews/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const vesselId = req.query.vessel_id as string;
    const stats = getReviewStats(vesselId);
    res.json(stats);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
