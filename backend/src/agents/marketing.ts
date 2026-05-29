import query from '../database';
import nodemailer from 'nodemailer';

// ====== Daily Captain Email ======

export async function sendDailyCaptainEmails(): Promise<{ sent: number; errors: number }> {
  const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER;
  if (!smtpConfigured) {
    console.log('[CaptainEmail] SMTP not configured — skipping');
    return { sent: 0, errors: 0 };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  const users = query.prepare('SELECT id, email, name FROM users WHERE email IS NOT NULL').all() as any[];
  let sent = 0;
  let errors = 0;

  for (const user of users) {
    try {
      const vessels = query.prepare(
        'SELECT id, name FROM vessels WHERE organization_id = (SELECT organization_id FROM users WHERE id = ?)'
      ).all(user.id) as any[];

      if (!vessels.length) continue;
      const vesselId = vessels[0].id;

      // Gather daily metrics
      const crewCount = (query.prepare('SELECT COUNT(*) as c FROM crew_members WHERE vessel_id = ?').get(vesselId) as any)?.c || 0;
      const expiredCerts = (query.prepare(
        "SELECT COUNT(*) as c FROM certifications c JOIN crew_members m ON c.crew_member_id = m.id WHERE m.vessel_id = ? AND c.status = 'expired'"
      ).get(vesselId) as any)?.c || 0;
      const expiringCerts = (query.prepare(
        "SELECT COUNT(*) as c FROM certifications c JOIN crew_members m ON c.crew_member_id = m.id WHERE m.vessel_id = ? AND c.expiry_date BETWEEN date('now') AND date('now', '+30 days') AND c.status = 'valid'"
      ).get(vesselId) as any)?.c || 0;
      const activeAlerts = (query.prepare(
        'SELECT COUNT(*) as c FROM alerts WHERE vessel_id = ? AND is_resolved = 0'
      ).get(vesselId) as any)?.c || 0;
      const recentAgentLogs = query.prepare(
        "SELECT agent_name, action_summary FROM agent_activity_log WHERE vessel_id = ? AND created_at > datetime('now', '-24 hours') ORDER BY created_at DESC LIMIT 5"
      ).all(vesselId) as any[];

      const vesselName = vessels[0].name;
      const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

      // Build HTML email
      const alertsSection = activeAlerts > 0
        ? `<div style="background:#fbeaea;border:1px solid #c62828;padding:12px;border-radius:6px;margin:12px 0;">
            <strong style="color:#c62828;">⚠ ${activeAlerts} active alert${activeAlerts > 1 ? 's' : ''} requiring attention</strong>
           </div>`
        : `<div style="background:#f4f8f4;border:1px solid #2e7d32;padding:12px;border-radius:6px;margin:12px 0;">
            <strong style="color:#2e7d32;">✓ All clear — no active alerts</strong>
           </div>`;

      const agentActivity = recentAgentLogs.length
        ? recentAgentLogs.map((l: any) =>
            `<tr><td style="padding:4px 8px;font-size:13px;color:#555;">${l.agent_name}</td><td style="padding:4px 8px;font-size:13px;color:#333;">${l.action_summary}</td></tr>`
          ).join('')
        : '<tr><td colspan="2" style="padding:8px;font-size:13px;color:#999;text-align:center;">No agent activity in the last 24 hours</td></tr>';

      const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Georgia,Times,serif;background:#f5f5f5;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0d5c0;">
<div style="background:#0a1628;padding:24px;text-align:center;">
<div style="font-size:32px;margin-bottom:8px;">⚓</div>
<h1 style="color:#c9a84c;font-size:20px;margin:0;font-family:Georgia,serif;">Poseidon — Daily Captain Report</h1>
<p style="color:#8b9bb4;font-size:13px;margin:4px 0 0;">${date}</p>
</div>
<div style="padding:24px;">
<p style="font-size:15px;color:#333;margin:0 0 16px;">Good morning, Captain <strong>${user.name}</strong>,</p>
${alertsSection}
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
<tr>
<td style="width:33%;padding:12px;text-align:center;background:#f8f6f0;border:1px solid #e0d5c0;">
<div style="font-size:24px;font-weight:bold;color:#0a1628;">${crewCount}</div>
<div style="font-size:11px;color:#8b9bb4;text-transform:uppercase;letter-spacing:1px;">Crew</div>
</td>
<td style="width:33%;padding:12px;text-align:center;background:#f8f6f0;border:1px solid #e0d5c0;">
<div style="font-size:24px;font-weight:bold;color:#c62828;">${expiredCerts}</div>
<div style="font-size:11px;color:#8b9bb4;text-transform:uppercase;letter-spacing:1px;">Expired Certs</div>
</td>
<td style="width:33%;padding:12px;text-align:center;background:#f8f6f0;border:1px solid #e0d5c0;">
<div style="font-size:24px;font-weight:bold;color:#e65100;">${expiringCerts}</div>
<div style="font-size:11px;color:#8b9bb4;text-transform:uppercase;letter-spacing:1px;">Expiring ≤30d</div>
</td>
</tr>
</table>
<h3 style="font-size:14px;color:#333;margin:16px 0 8px;border-bottom:1px solid #e0d5c0;padding-bottom:6px;">Recent Agent Activity</h3>
<table style="width:100%;border-collapse:collapse;">
${agentActivity}
</table>
<div style="margin-top:20px;padding-top:16px;border-top:1px solid #e0d5c0;text-align:center;">
<a href="https://poseidon-superyacht-crew-ai-production.up.railway.app/app" style="background:#c9a84c;color:#0a1628;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:13px;">View Full Bridge →</a>
<p style="font-size:11px;color:#999;margin-top:12px;">Poseidon — AI Chief Officer for ${vesselName}</p>
</div>
</div>
</div>
</body>
</html>`;

      await transporter.sendMail({
        from: `"Poseidon" <${process.env.SMTP_USER!}>`,
        to: user.email,
        subject: `⚓ ${vesselName} — Daily Captain Report | ${date}`,
        html,
      });

      // Log the email
      query.prepare(
        `INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, details, status, created_at)
         VALUES (?, ?, 'captain_email', 'email', ?, ?, 'completed', datetime('now'))`
      ).run(
        require('crypto').randomUUID(),
        vesselId,
        `Daily email sent to ${user.email}`,
        JSON.stringify({ crewCount, expiredCerts, expiringCerts, activeAlerts })
      );

      sent++;
      console.log(`[CaptainEmail] Sent to ${user.email} (${vesselName})`);
    } catch (err: any) {
      errors++;
      console.error(`[CaptainEmail] Failed for ${user.email}:`, err.message);
    }
  }

  return { sent, errors };
}

// ====== Twitter Content Generator ======

export async function generateTwitterContent(): Promise<string[]> {
  try {
    const expiredCerts = (query.prepare("SELECT COUNT(*) as c FROM certifications WHERE status = 'expired'").get() as any)?.c || 0;
    const crewCount = (query.prepare('SELECT COUNT(*) as c FROM crew_members').get() as any)?.c || 0;
    const vesselCount = (query.prepare('SELECT COUNT(*) as c FROM vessels').get() as any)?.c || 0;

    const tips = [
      `⚓ Superyacht compliance tip: ${expiredCerts} expired certifications tracked across ${vesselCount} vessels. Cerberus catches these before port state control does. Poseidon scans every 6 hours.`,
      `📋 MLC compliance doesn't have to be a spreadsheet nightmare. AI agents track every STCW cert, visa expiry, and rotation automatically. ${crewCount} crew members monitored 24/7.`,
      `🛑 Port state control boarding tomorrow? Poseidon generates a complete compliance report in seconds. Certificates, visas, SEAs — all in one view. Try it free: poseidon.maritime`,
      `🌊 Rotation scheduling for superyacht crew is hard. Nereus handles 3:1, 2:2, and custom patterns. Schengen 90/180 day tracking built in. No overstays.`,
      `💰 Payroll across multiple currencies? SEAs for every crew member? Plutus agent handles it. Budget vs actual reporting for owners. Everything in one place.`,
      `🎓 Building a crew from scratch? Mentor agent drafts job descriptions, screens CVs, and creates career development plans. From bosun to chief officer.`,
      `⚓ ${crewCount} crew members, ${vesselCount} vessels, zero expired certs missed. That's what happens when you have an AI chief officer working 24/7.`,
    ];

    return tips;
  } catch {
    return ['⚓ AI-powered crew management for superyachts. Compliance, rotations, payroll — handled. Poseidon scans every cert every 6 hours.'];
  }
}

// ====== Marketing Orchestrator ======

export async function runMarketingCycle(): Promise<void> {
  console.log('[Marketing] Starting daily marketing cycle...');

  // 1. Send daily captain emails
  console.log('[Marketing] Sending captain emails...');
  const emailResult = await sendDailyCaptainEmails();
  console.log(`[Marketing] Emails: ${emailResult.sent} sent, ${emailResult.errors} errors`);

  // 2. Generate Twitter content for the next post
  console.log('[Marketing] Generating social content...');
  const tweets = await generateTwitterContent();
  if (tweets.length > 0) {
    query.prepare(
      `INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, status, created_at)
       VALUES (?,'system','marketing_agent','content_generated',?,'completed',datetime('now'))`
    ).run(require('crypto').randomUUID(), `Generated ${tweets.length} social posts for queue`);
  }

  // 3. Run cold outreach
  console.log('[Marketing] Running cold outreach...');
  try {
    const { runColdOutreach } = require('./outreach');
    const outreachResult = await runColdOutreach();
    console.log(`[Marketing] Outreach: ${outreachResult.sent} sent, ${outreachResult.errors} errors`);
  } catch (err: any) {
    console.error('[Marketing] Outreach error:', err.message);
  }

  // 4. Send Telegram daily summary
  console.log('[Marketing] Sending Telegram summaries...');
  try {
    const { sendDailyTelegramSummary } = require('./telegram');
    const telegramSent = await sendDailyTelegramSummary();
    console.log(`[Marketing] Telegram: ${telegramSent} sent`);
  } catch (err: any) {
    console.error('[Marketing] Telegram error:', err.message);
  }

  // 5. Auto-create ad campaign suggestion
  console.log('[Marketing] Checking ad campaigns...');
  try {
    const { getLocalCampaigns } = require('./ads');
    const campaigns = await getLocalCampaigns();
    if (campaigns.length === 0) {
      console.log('[Marketing] No ad campaigns found — generating suggestion');
      query.prepare(
        `INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, status, created_at)
         VALUES (?,'system','ads_agent','campaign_suggested',?,'completed',datetime('now'))`
      ).run(require('crypto').randomUUID(),
        'No active ad campaigns. Set META_ACCESS_TOKEN and META_AD_ACCOUNT_ID to enable auto-creation.');
    } else {
      const active = campaigns.filter((c: any) => c.status === 'active');
      console.log(`[Marketing] ${active.length} active campaigns, ${campaigns.length} total`);
    }
  } catch (err: any) {
    console.error('[Marketing] Ads check error:', err.message);
  }

  console.log('[Marketing] Daily marketing cycle complete.');
}
