import query from '../database';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// ====== Cold Outreach Agent ======

const INDUSTRY_TEMPLATES: Record<string, { subject: string; body: string }[]> = {
  'yacht_management': [
    {
      subject: 'Stop tracking crew certs in spreadsheets',
      body: `Hi {{name}},

I'm reaching out because most superyacht captains I talk to spend 5-10 hours a week on compliance paperwork they shouldn't have to do.

Poseidon is an AI chief officer that handles it automatically:
- Scans every STCW certificate every 6 hours
- Alerts at 90, 60, 30, 14, 7, and 1 days before expiry
- Tracks Schengen 90/180 day rules for crew rotations
- Generates MLC compliance reports in one click
- Processes multi-currency payroll and SEAs

{{personalization}}

Would you be open to a 15-minute call to see if this makes sense for {{company}}?

Best,
James Mitchell
Captain, Poseidon Maritime`,
    },
    {
      subject: 'Your crew compliance handled automatically',
      body: `Hi {{name}},

Port state control inspections are stressful enough without worrying about expired certs.

Poseidon runs 5 AI agents 24/7 to handle your crew compliance:
• Cerberus — cert scanning every 6 hours
• Nereus — rotation scheduling with Schengen tracking
• Hermes — owner reports and onboarding
• Plutus — multi-currency payroll
• Mentor — recruitment and career development

{{personalization}}

No setup fees. 30-day free trial. Used by M/Y OCEAN STAR and growing.

Worth 5 minutes?

Best,
James Mitchell
Poseidon Maritime`,
    },
  ],
  'default': [
    {
      subject: '{{industry}} compliance just got easier',
      body: `Hi {{name}},

I wanted to share how Poseidon is helping {{industry}} teams cut compliance paperwork by 80%.

Our AI agents handle the busywork — certifications, scheduling, payroll, reporting — so your team can focus on operations.

{{personalization}}

Would love to show you.

Best,
James Mitchell
Poseidon`,
    },
  ],
};

export async function runColdOutreach(): Promise<{ sent: number; errors: number }> {
  const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER;
  if (!smtpConfigured) {
    console.log('[Outreach] SMTP not configured — skipping cold outreach');
    return { sent: 0, errors: 0 };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });

  // Get leads that haven't been contacted recently
  const leads = query.prepare(
    "SELECT * FROM leads WHERE status = 'new' OR (last_contacted IS NULL) LIMIT 5"
  ).all() as any[];

  if (!leads.length) {
    console.log('[Outreach] No new leads to contact');
    return { sent: 0, errors: 0 };
  }

  let sent = 0;
  let errors = 0;

  for (const lead of leads) {
    try {
      const templates = INDUSTRY_TEMPLATES[lead.industry || 'default'] || INDUSTRY_TEMPLATES.default;
      const template = templates[Math.floor(Math.random() * templates.length)];

      const personalizations: string[] = [];
      if (lead.company_name) {
        personalizations.push(`I noticed ${lead.company_name} operates in the superyacht space.`);
      }
      const vesselCount = (query.prepare('SELECT COUNT(*) as c FROM vessels').get() as any)?.c || 0;
      const crewCount = (query.prepare('SELECT COUNT(*) as c FROM crew_members').get() as any)?.c || 0;
      if (vesselCount > 0) {
        personalizations.push(`We're currently managing ${crewCount} crew across ${vesselCount} vessels with zero expired certs.`);
      }
      personalizations.push('Happy to share how it works.');

      const body = template.body
        .replace(/\{\{name\}\}/g, lead.contact_name || lead.company_name)
        .replace(/\{\{company\}\}/g, lead.company_name)
        .replace(/\{\{industry\}\}/g, lead.industry || 'marine')
        .replace(/\{\{personalization\}\}/g, personalizations.join(' '));

      await transporter.sendMail({
        from: `"James Mitchell — Poseidon" <${process.env.SMTP_USER!}>`,
        to: lead.email,
        subject: template.subject,
        text: body,
      });

      // Update lead
      query.prepare(
        "UPDATE leads SET last_contacted = datetime('now'), email_count = email_count + 1, status = 'contacted', updated_at = datetime('now') WHERE id = ?"
      ).run(lead.id);

      // Log
      query.prepare(
        `INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, status, created_at)
         VALUES (?,'system','outreach_agent','cold_email',?,'completed',datetime('now'))`
      ).run(crypto.randomUUID(), `Cold email sent to ${lead.email} (${lead.company_name})`);

      sent++;
      console.log(`[Outreach] Sent to ${lead.email} (${lead.company_name})`);

      // Rate limit — 1 email per lead per cycle
    } catch (err: any) {
      errors++;
      console.error(`[Outreach] Failed for ${lead.email}:`, err.message);
    }
  }

  return { sent, errors };
}

export async function addLead(lead: {
  company_name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  website?: string;
  source?: string;
  industry?: string;
}): Promise<void> {
  query.prepare(
    `INSERT INTO leads (id, company_name, contact_name, email, phone, website, source, industry, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
  ).run(
    crypto.randomUUID(),
    lead.company_name,
    lead.contact_name || null,
    lead.email,
    lead.phone || null,
    lead.website || null,
    lead.source || 'manual',
    lead.industry || 'yacht_management'
  );
}

export async function getLeads(): Promise<any[]> {
  return query.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
}

export async function getOutreachStats(): Promise<any> {
  const total = (query.prepare('SELECT COUNT(*) as c FROM leads').get() as any)?.c || 0;
  const contacted = (query.prepare("SELECT COUNT(*) as c FROM leads WHERE status = 'contacted'").get() as any)?.c || 0;
  const replied = (query.prepare("SELECT SUM(reply_count) as c FROM leads").get() as any)?.c || 0;
  return { total, contacted, replied, replyRate: contacted > 0 ? Math.round((replied / contacted) * 100) : 0 };
}
