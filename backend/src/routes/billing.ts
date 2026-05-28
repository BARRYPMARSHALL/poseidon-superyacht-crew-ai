import { Router, Request, Response } from 'express';
import { createCheckoutSession, handleWebhook, isStripeConfigured, PLANS } from '../billing';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get available plans
router.get('/plans', (_req: Request, res: Response) => {
  res.json({ plans: PLANS, configured: isStripeConfigured() });
});

// Create a checkout session (requires auth)
router.post('/checkout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { planId, successUrl, cancelUrl } = req.body;
    if (!planId || !successUrl || !cancelUrl) {
      res.status(400).json({ error: 'Missing required fields: planId, successUrl, cancelUrl' });
      return;
    }

    const userEmail = (req as any).userEmail || 'customer@example.com';
    const url = await createCheckoutSession(planId, userEmail, successUrl, cancelUrl);
    res.json({ url });
  } catch (err: any) {
    console.error('[Billing] Checkout error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Stripe webhook (raw body needed — routes are registered before JSON middleware in server.ts)
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    if (!sig) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      res.status(400).json({ error: 'Missing raw body' });
      return;
    }

    const result = await handleWebhook(rawBody, sig);
    res.json(result);
  } catch (err: any) {
    console.error('[Billing] Webhook error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
