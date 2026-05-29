// @ts-nocheck
import query from '../database';
import crypto from 'crypto';

// ====== Meta Ads Agent ======

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
const META_AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || '';
const META_API = 'https://graph.facebook.com/v22.0';

interface CampaignResult {
  success: boolean;
  campaignId?: string;
  error?: string;
}

// Create a Meta ad campaign for Poseidon
export async function createAdCampaign(
  name: string,
  dailyBudgetCents: number,
  objective: string = 'LEAD_GENERATION'
): Promise<CampaignResult> {
  if (!META_ACCESS_TOKEN || !META_AD_ACCOUNT_ID) {
    return { success: false, error: 'Meta Ads not configured — set META_ACCESS_TOKEN and META_AD_ACCOUNT_ID' };
  }

  try {
    // 1. Create campaign
    const campaignRes = await fetch(
      `${META_API}/act_${META_AD_ACCOUNT_ID}/campaigns`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          objective,
          status: 'PAUSED', // Start paused — review before activating
          special_ad_categories: [],
          access_token: META_ACCESS_TOKEN,
        }),
      }
    );
    const campaignData = await campaignRes.json();
    if (!campaignData.id) {
      return { success: false, error: `Meta API error: ${JSON.stringify(campaignData)}` };
    }

    const campaignId = campaignData.id;

    // 2. Create ad set
    const adSetRes = await fetch(
      `${META_API}/act_${META_AD_ACCOUNT_ID}/adsets`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${name} — Ad Set`,
          campaign_id: campaignId,
          daily_budget: dailyBudgetCents,
          billing_event: 'IMPRESSIONS',
          optimization_goal: 'LEAD_GENERATION',
          targeting: {
            geo_locations: {
              countries: ['US', 'GB', 'FR', 'IT', 'MC', 'CH'],
            },
            interests: [
              { id: '6003139266461', name: 'Luxury travel' },
              { id: '6003210276544', name: 'Yachting' },
              { id: '6003160141317', name: 'Boating' },
            ],
            age_min: 25,
            age_max: 65,
          },
          status: 'PAUSED',
          access_token: META_ACCESS_TOKEN,
        }),
      }
    );
    const adSetData = await adSetRes.json();
    if (!adSetData.id) {
      return { success: false, error: `Ad set creation failed: ${JSON.stringify(adSetData)}` };
    }

    // Store in database
    query.prepare(
      `INSERT INTO ad_campaigns (id, platform, campaign_name, status, daily_budget_cents, meta_campaign_id, created_at, updated_at)
       VALUES (?, 'meta', ?, 'paused', ?, ?, datetime('now'), datetime('now'))`
    ).run(crypto.randomUUID(), name, dailyBudgetCents, campaignId);

    // Log
    query.prepare(
      `INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, details, status, created_at)
       VALUES (?,'system','ads_agent','campaign_created',?,'Paused — review before activating','completed',datetime('now'))`
    ).run(crypto.randomUUID(), `Meta campaign "${name}" created (budget: $${(dailyBudgetCents/100).toFixed(2)}/day)`);

    return { success: true, campaignId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Activate a paused campaign
export async function activateCampaign(campaignId: string): Promise<CampaignResult> {
  if (!META_ACCESS_TOKEN) return { success: false, error: 'Meta Ads not configured' };
  try {
    const res = await fetch(
      `${META_API}/${campaignId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE', access_token: META_ACCESS_TOKEN }),
      }
    );
    const data = await res.json();
    if (data.success !== undefined && !data.success) {
      return { success: false, error: `Activation failed: ${JSON.stringify(data)}` };
    }
    query.prepare("UPDATE ad_campaigns SET status = 'active', updated_at = datetime('now') WHERE meta_campaign_id = ?").run(campaignId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Get campaign performance metrics
export async function getCampaignInsights(campaignId: string): Promise<any> {
  if (!META_ACCESS_TOKEN) return { error: 'Meta Ads not configured' };
  try {
    const res = await fetch(
      `${META_API}/${campaignId}/insights?fields=impressions,clicks,spend,ctr,cpc,leads&date_preset=last_30d&access_token=${META_ACCESS_TOKEN}`
    );
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { error: err.message };
  }
}

// Get all campaigns from database
export async function getLocalCampaigns(): Promise<any[]> {
  return query.prepare('SELECT * FROM ad_campaigns ORDER BY created_at DESC').all();
}

// Auto-create suggested campaign (called by marketing cron)
export async function autoCreateCampaign(): Promise<CampaignResult> {
  const crewCount = (query.prepare('SELECT COUNT(*) as c FROM crew_members').get() as any)?.c || 0;
  return createAdCampaign(
    `Poseidon — Superyacht Crew AI (${new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })})`,
    2000, // $20/day default budget
    'LEAD_GENERATION'
  );
}
