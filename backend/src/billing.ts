// @ts-nocheck
import Stripe from 'stripe';

const KEY: string = process.env.STRIPE_SECRET_KEY || '';

let stripe: any = null;

export function getStripe(): any {
  if (!stripe) {
    if (!KEY) throw new Error('STRIPE_SECRET_KEY not configured');
    stripe = new Stripe(KEY, { apiVersion: '2025-04-30' });
  }
  return stripe;
}

export function isStripeConfigured(): boolean {
  return !!KEY;
}

export interface PlanConfig {
  id: string;
  name: string;
  price: number;
  priceId?: string;
  features: string[];
}

export const PLANS: PlanConfig[] = [
  {
    id: 'skipper',
    name: 'Skipper',
    price: 499,
    features: ['Up to 15 crew members', 'Cerberus + Nereus agents', 'Basic alerts', 'Email support'],
  },
  {
    id: 'captain',
    name: 'Captain',
    price: 799,
    features: ['Up to 30 crew members', 'All 5 AI agents', 'Full compliance + owner reports', 'Priority support'],
  },
];

export async function createCheckoutSession(
  planId: string,
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const s = getStripe();
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error(`Unknown plan: ${planId}`);

  if (plan.priceId) {
    const session = await s.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: plan.priceId, quantity: 1 }],
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session.url;
  }

  const product = await s.products.create({
    name: `Poseidon — ${plan.name}`,
    description: plan.features.join(', '),
  });

  const price = await s.prices.create({
    product: product.id,
    unit_amount: plan.price * 100,
    currency: 'usd',
    recurring: { interval: 'month' },
  });

  const session = await s.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: price.id, quantity: 1 }],
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session.url;
}

export async function handleWebhook(
  body: string,
  signature: string
): Promise<{ received: boolean; event?: string; subscriptionId?: string; customerEmail?: string }> {
  const s = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;
  if (webhookSecret) {
    event = s.webhooks.constructEvent(body, signature, webhookSecret);
  } else {
    event = JSON.parse(body);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      return {
        received: true,
        event: event.type,
        subscriptionId: session.subscription,
        customerEmail: session.customer_email,
      };
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      return { received: true, event: event.type, subscriptionId: subscription.id };
    }
    default:
      return { received: true, event: event.type };
  }
}
