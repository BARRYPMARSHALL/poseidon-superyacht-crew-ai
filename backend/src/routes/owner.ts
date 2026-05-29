import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getDb } from '../database';

const router = Router();

// GET /api/owner/dashboard — Business health at a glance
router.get('/dashboard', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const db = getDb();

    // --- Revenue ---
    const paidUsers = db.prepare(
      `SELECT COUNT(*) as c FROM users WHERE subscription_tier IN ('skipper','captain')`
    ).get() as any;
    const skipperCount = db.prepare(
      `SELECT COUNT(*) as c FROM users WHERE subscription_tier = 'skipper'`
    ).get() as any;
    const captainCount = db.prepare(
      `SELECT COUNT(*) as c FROM users WHERE subscription_tier = 'captain'`
    ).get() as any;
    const trialUsers = db.prepare(
      `SELECT COUNT(*) as c FROM users WHERE trial_ends_at > datetime('now')`
    ).get() as any;
    const totalUsers = db.prepare(`SELECT COUNT(*) as c FROM users`).get() as any;

    // MRR: Skipper=$499, Captain=$799 (monthly)
    const mrr = (skipperCount?.c || 0) * 499 + (captainCount?.c || 0) * 799;

    // --- Users (30d) ---
    const newUsers30d = db.prepare(
      `SELECT COUNT(*) as c FROM users WHERE created_at > datetime('now', '-30 days')`
    ).get() as any;

    // --- Vessels / Crew ---
    const vesselCount = db.prepare(`SELECT COUNT(*) as c FROM vessels`).get() as any;
    const crewCount = db.prepare(`SELECT COUNT(*) as c FROM crew_members WHERE status = 'active'`).get() as any;
    const expiringCerts90d = db.prepare(
      `SELECT COUNT(*) as c FROM certifications WHERE expiry_date <= datetime('now', '+90 days') AND expiry_date > datetime('now') AND status = 'valid'`
    ).get() as any;
    const openAlerts = db.prepare(
      `SELECT COUNT(*) as c FROM alerts WHERE is_resolved = 0`
    ).get() as any;

    // --- Agent Activity (24h) ---
    const agentActivity24h = db.prepare(
      `SELECT COUNT(*) as c FROM agent_activity_log WHERE created_at > datetime('now', '-24 hours')`
    ).get() as any;
    const agentErrors24h = db.prepare(
      `SELECT COUNT(*) as c FROM agent_activity_log WHERE status = 'error' AND created_at > datetime('now', '-24 hours')`
    ).get() as any;
    const lastAgentRun = db.prepare(
      `SELECT created_at, agent_name, action_type FROM agent_activity_log ORDER BY created_at DESC LIMIT 1`
    ).get() as any;

    // --- Agent Activity by Agent ---
    const agentBreakdown = db.prepare(
      `SELECT agent_name, COUNT(*) as count FROM agent_activity_log WHERE created_at > datetime('now', '-7 days') GROUP BY agent_name ORDER BY count DESC`
    ).all() as any[];

    // --- Growth ---
    const leadCount = db.prepare(`SELECT COUNT(*) as c FROM leads`).get() as any;
    const newLeads30d = db.prepare(
      `SELECT COUNT(*) as c FROM leads WHERE created_at > datetime('now', '-30 days')`
    ).get() as any;
    const contactedLeads = db.prepare(
      `SELECT COUNT(*) as c FROM leads WHERE status = 'contacted'`
    ).get() as any;
    const emailSentCount = db.prepare(
      `SELECT COALESCE(SUM(email_count), 0) as c FROM leads`
    ).get() as any;
    const replyCount = db.prepare(
      `SELECT COALESCE(SUM(reply_count), 0) as c FROM leads`
    ).get() as any;
    const activeCampaigns = db.prepare(
      `SELECT COUNT(*) as c FROM ad_campaigns WHERE status = 'active'`
    ).get() as any;
    const telegramChats = db.prepare(
      `SELECT COUNT(*) as c FROM telegram_chats WHERE is_active = 1`
    ).get() as any;

    // --- Recent Activity (last 10 events) ---
    const recentActivity = db.prepare(
      `SELECT created_at, agent_name, action_type, action_summary, status FROM agent_activity_log ORDER BY created_at DESC LIMIT 10`
    ).all() as any[];

    // --- System Health ---
    const dbSize = db.prepare(
      `SELECT page_count * page_size as size FROM pragma_page_count, pragma_page_size`
    ).get() as any;

    // --- User breakdown ---
    const usersByRole = db.prepare(
      `SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY count DESC`
    ).all() as any[];

    // --- Weekly revenue — count new signups per day (30d) ---
    const signups30d = db.prepare(
      `SELECT date(created_at) as day, COUNT(*) as count FROM users WHERE created_at > datetime('now', '-30 days') GROUP BY date(created_at) ORDER BY day`
    ).all() as any[];

    res.json({
      revenue: {
        mrr,
        monthly: { skipper: skipperCount?.c || 0, captain: captainCount?.c || 0 },
        paidUsers: paidUsers?.c || 0,
        trialUsers: trialUsers?.c || 0,
        totalUsers: totalUsers?.c || 0,
      },
      operations: {
        vessels: vesselCount?.c || 0,
        crew: crewCount?.c || 0,
        expiringCertsIn90d: expiringCerts90d?.c || 0,
        openAlerts: openAlerts?.c || 0,
      },
      agents: {
        activity24h: agentActivity24h?.c || 0,
        errors24h: agentErrors24h?.c || 0,
        lastRun: lastAgentRun || null,
        breakdown7d: agentBreakdown,
      },
      growth: {
        totalLeads: leadCount?.c || 0,
        newLeads30d: newLeads30d?.c || 0,
        contactedLeads: contactedLeads?.c || 0,
        emailsSent: emailSentCount?.c || 0,
        repliesReceived: replyCount?.c || 0,
        activeAdCampaigns: activeCampaigns?.c || 0,
        telegramChats: telegramChats?.c || 0,
      },
      recentActivity,
      system: {
        dbSizeBytes: dbSize?.size || 0,
        dbSizeMB: Math.round((dbSize?.size || 0) / (1024 * 1024) * 100) / 100,
        newUsers30d: newUsers30d?.c || 0,
        signups30d,
      },
      usersByRole,
    });
  } catch (err: any) {
    console.error('[Owner Dashboard] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
