import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { addLead, getLeads, getOutreachStats, runColdOutreach } from '../agents/outreach';
import { handleTelegramWebhook, sendDailyTelegramSummary } from '../agents/telegram';
import { createAdCampaign, activateCampaign, getCampaignInsights, getLocalCampaigns, autoCreateCampaign } from '../agents/ads';

const router = Router();

// ====== Outreach Routes ======

router.get('/outreach/leads', authenticate, async (_req: AuthRequest, res: Response) => {
  const leads = await getLeads();
  res.json({ leads });
});

router.post('/outreach/leads', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await addLead(req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/outreach/stats', authenticate, async (_req: AuthRequest, res: Response) => {
  const stats = await getOutreachStats();
  res.json(stats);
});

router.post('/outreach/run', authenticate, async (_req: AuthRequest, res: Response) => {
  const result = await runColdOutreach();
  res.json(result);
});

// ====== Telegram Routes ======

router.post('/telegram/webhook', async (req: Request, res: Response) => {
  const result = await handleTelegramWebhook(req.body);
  res.json({ ok: result });
});

router.get('/telegram/send-test', authenticate, async (req: AuthRequest, res: Response) => {
  const { notifyCaptainTelegram } = require('../agents/telegram');
  const sent = await notifyCaptainTelegram(req.userId!, '🧪 Test notification from Poseidon');
  res.json({ sent });
});

// ====== Ads Routes ======

router.get('/ads/campaigns', authenticate, async (_req: AuthRequest, res: Response) => {
  const campaigns = await getLocalCampaigns();
  res.json({ campaigns });
});

router.post('/ads/campaigns', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, dailyBudgetCents, objective } = req.body;
    const result = await createAdCampaign(
      name || `Poseidon Campaign ${new Date().toLocaleDateString()}`,
      dailyBudgetCents || 2000,
      objective || 'LEAD_GENERATION'
    );
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ads/campaigns/:id/activate', authenticate, async (req: AuthRequest, res: Response) => {
  const result = await activateCampaign(req.params.id);
  res.json(result);
});

router.get('/ads/campaigns/:id/insights', authenticate, async (req: AuthRequest, res: Response) => {
  const insights = await getCampaignInsights(req.params.id);
  res.json(insights);
});

router.post('/ads/auto-create', authenticate, async (_req: AuthRequest, res: Response) => {
  const result = await autoCreateCampaign();
  res.json(result);
});

export default router;
