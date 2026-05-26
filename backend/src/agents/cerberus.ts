import db from '../database';
import { generateId, daysUntil } from '../utils/helpers';
import nodemailer from 'nodemailer';

interface ExpiringCert {
  id: string;
  crew_member_id: string;
  cert_name: string;
  cert_type: string;
  expiry_date: string;
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  vessel_id: string;
  vessel_name: string;
  crew_email: string | null;
}

// Configure email transport
let transporter: nodemailer.Transporter | null = null;
try {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
} catch (e) {
  console.warn('Email transport not configured. Email alerts disabled.');
}

// The main Cerberus agent scan — called by cron every 6 hours
export async function cerberusScan(): Promise<{ alertsCreated: number; certsUpdated: number }> {
  console.log('[Cerberus] Starting certification scan...');
  let alertsCreated = 0;
  let certsUpdated = 0;

  // 1. Find all active crew with certifications
  const allCerts = db.prepare(`
    SELECT c.*, cm.first_name, cm.last_name, cm.position, cm.department, cm.email as crew_email,
           cm.vessel_id, v.name as vessel_name
    FROM certifications c
    JOIN crew_members cm ON c.crew_member_id = cm.id
    JOIN vessels v ON cm.vessel_id = v.id
    WHERE cm.status = 'active'
    ORDER BY c.expiry_date
  `).all() as ExpiringCert[];

  const now = new Date();

  for (const cert of allCerts) {
    const daysLeft = daysUntil(cert.expiry_date);
    let newStatus: string;

    if (daysLeft < 0) {
      newStatus = 'expired';
    } else if (daysLeft <= 30) {
      newStatus = 'expiring_soon';
    } else {
      newStatus = 'valid';
    }

    // Update cert status if changed
    if (cert.status !== newStatus) {
      db.prepare('UPDATE certifications SET status = ?, updated_at = datetime(\'now\') WHERE id = ?')
        .run(newStatus, cert.id);
      certsUpdated++;
    }

    // Create alerts at key thresholds
    const thresholds = [
      { days: 90, severity: 'info' },
      { days: 60, severity: 'info' },
      { days: 30, severity: 'warning' },
      { days: 14, severity: 'warning' },
      { days: 7, severity: 'critical' },
      { days: 1, severity: 'critical' },
      { days: 0, severity: 'critical' }, // expired today
    ];

    for (const threshold of thresholds) {
      if (daysLeft === threshold.days) {
        const alertId = generateId();
        const title = daysLeft <= 0
          ? `CERTIFICATION EXPIRED: ${cert.cert_name}`
          : `Certification expiring in ${daysLeft} days: ${cert.cert_name}`;

        const message = `${cert.first_name} ${cert.last_name} (${cert.position}) — ${cert.cert_name} (${cert.cert_type}) ${daysLeft <= 0 ? 'expired' : `expires on ${cert.expiry_date} (${daysLeft} days)`}. ${daysLeft > 0 ? 'Schedule renewal training now.' : 'URGENT: Renew immediately to avoid port state detention.'}`;

        // Check if alert already exists for this cert+threshold
        const existingAlert = db.prepare(
          'SELECT id FROM alerts WHERE crew_member_id = ? AND alert_type = \'cert_expiry\' AND title = ? AND created_at > datetime(\'now\', \'-1 day\')'
        ).get(cert.crew_member_id, title);

        if (!existingAlert) {
          db.prepare(`INSERT INTO alerts (id, vessel_id, crew_member_id, alert_type, severity, title, message)
            VALUES (?, ?, ?, 'cert_expiry', ?, ?, ?)`)
            .run(alertId, cert.vessel_id, cert.crew_member_id, threshold.severity, title, message);
          alertsCreated++;

          // Log agent activity
          const logId = generateId();
          db.prepare(`INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, details)
            VALUES (?, ?, 'Cerberus', 'cert_alert', ?, ?)`)
            .run(logId, cert.vessel_id, title, JSON.stringify({ cert_id: cert.id, days_left: daysLeft }));
        }
      }
    }

    // Check dependent certificates
    const dependents = db.prepare('SELECT child_cert_type FROM cert_dependencies WHERE parent_cert_type = ?').all(cert.cert_type) as any[];
    if (dependents.length > 0 && daysLeft <= 30 && daysLeft >= 0) {
      for (const dep of dependents) {
        const depCerts = db.prepare(`
          SELECT c2.* FROM certifications c2
          JOIN crew_members cm2 ON c2.crew_member_id = cm2.id
          WHERE c2.crew_member_id = ? AND c2.cert_type = ? AND cm2.status = 'active'
        `).all(cert.crew_member_id, dep.child_cert_type) as any[];

        for (const dc of depCerts) {
          const depAlertId = generateId();
          const depTitle = `Dependency warning: ${dc.cert_name} requires valid ${cert.cert_name}`;
          const depMsg = `${cert.first_name} ${cert.last_name}'s ${cert.cert_name} expires in ${daysLeft} days. This affects ${dc.cert_name} (${dc.cert_type}). Renew ${cert.cert_name} first.`;

          const existingDepAlert = db.prepare(
            'SELECT id FROM alerts WHERE crew_member_id = ? AND alert_type = \'cert_expiry\' AND title = ? AND created_at > datetime(\'now\', \'-7 day\')'
          ).get(cert.crew_member_id, depTitle);

          if (!existingDepAlert) {
            db.prepare(`INSERT INTO alerts (id, vessel_id, crew_member_id, alert_type, severity, title, message)
              VALUES (?, ?, ?, 'cert_expiry', 'warning', ?, ?)`)
              .run(depAlertId, cert.vessel_id, cert.crew_member_id, depTitle, depMsg);
            alertsCreated++;
          }
        }
      }
    }
  }

  // 2. Scan passport expiries
  const passportExpiring = db.prepare(`
    SELECT cm.*, v.name as vessel_name FROM crew_members cm
    JOIN vessels v ON cm.vessel_id = v.id
    WHERE cm.status = 'active' AND cm.passport_expiry IS NOT NULL
    AND cm.passport_expiry >= date('now') AND cm.passport_expiry <= date('now', '+90 days')
  `).all() as any[];

  for (const crew of passportExpiring) {
    const daysLeft = daysUntil(crew.passport_expiry);
    const alertId = generateId();
    const title = `Passport expiring in ${daysLeft} days: ${crew.first_name} ${crew.last_name}`;
    const existingAlert = db.prepare(
      'SELECT id FROM alerts WHERE crew_member_id = ? AND alert_type = \'passport_expiry\' AND created_at > datetime(\'now\', \'-7 day\')'
    ).get(crew.id);

    if (!existingAlert) {
      db.prepare(`INSERT INTO alerts (id, vessel_id, crew_member_id, alert_type, severity, title, message)
        VALUES (?, ?, ?, 'passport_expiry', 'warning', ?, ?)`)
        .run(alertId, crew.vessel_id, crew.id, title,
          `Passport expires ${crew.passport_expiry}. Renew immediately — crew cannot travel on expired passport.`);
      alertsCreated++;
    }
  }

  // 3. Scan visa expiries
  const visaExpiring = db.prepare(`
    SELECT v.*, cm.first_name, cm.last_name, cm.position, cm.vessel_id, vs.name as vessel_name
    FROM visas v
    JOIN crew_members cm ON v.crew_member_id = cm.id
    JOIN vessels vs ON cm.vessel_id = vs.id
    WHERE cm.status = 'active' AND v.expiry_date >= date('now') AND v.expiry_date <= date('now', '+90 days')
  `).all() as any[];

  for (const visa of visaExpiring) {
    const daysLeft = daysUntil(visa.expiry_date);
    const alertId = generateId();
    const title = `Visa expiring in ${daysLeft} days: ${visa.first_name} ${visa.last_name} — ${visa.visa_type}`;

    const existingAlert = db.prepare(
      'SELECT id FROM alerts WHERE crew_member_id = ? AND alert_type = \'visa_expiry\' AND created_at > datetime(\'now\', \'-7 day\')'
    ).get(visa.crew_member_id);

    if (!existingAlert) {
      db.prepare(`INSERT INTO alerts (id, vessel_id, crew_member_id, alert_type, severity, title, message)
        VALUES (?, ?, ?, 'visa_expiry', daysLeft <= 30 ? 'critical' : 'warning', ?, ?)`)
        .run(alertId, visa.vessel_id, visa.crew_member_id, title,
          `${visa.visa_type} visa expires ${visa.expiry_date}. Initiate renewal immediately.`);
      alertsCreated++;
    }
  }

  // 4. Scan contract ends
  const contractsEnding = db.prepare(`
    SELECT * FROM crew_members
    WHERE status = 'active' AND contract_end_date IS NOT NULL
    AND contract_end_date >= date('now') AND contract_end_date <= date('now', '+60 days')
  `).all() as any[];

  for (const crew of contractsEnding) {
    const daysLeft = daysUntil(crew.contract_end_date);
    const alertId = generateId();
    const title = `Contract ending in ${daysLeft} days: ${crew.first_name} ${crew.last_name} (${crew.position})`;

    const existingAlert = db.prepare(
      'SELECT id FROM alerts WHERE crew_member_id = ? AND alert_type = \'contract_end\' AND created_at > datetime(\'now\', \'-7 day\')'
    ).get(crew.id);

    if (!existingAlert) {
      db.prepare(`INSERT INTO alerts (id, vessel_id, crew_member_id, alert_type, severity, title, message)
        VALUES (?, ?, ?, 'contract_end', daysLeft <= 14 ? 'critical' : 'info', ?, ?)`)
        .run(alertId, crew.vessel_id, crew.id, title,
          `Contract ends ${crew.contract_end_date}. ${daysLeft <= 14 ? 'URGENT: Initiate recruitment/renewal discussion.' : 'Start planning for contract renewal or replacement.'}`);
      alertsCreated++;
    }
  }

  console.log(`[Cerberus] Scan complete. ${alertsCreated} alerts created, ${certsUpdated} cert statuses updated.`);
  return { alertsCreated, certsUpdated };
}

// Generate a recommended renewal plan for a crew member
export function generateRenewalPlan(crewMemberId: string): any {
  const member = db.prepare('SELECT * FROM crew_members WHERE id = ?').get(crewMemberId) as any;
  if (!member) return null;

  const expiringCerts = db.prepare(`
    SELECT * FROM certifications
    WHERE crew_member_id = ? AND expiry_date <= date('now', '+90 days') AND status != 'expired'
    ORDER BY expiry_date
  `).all(crewMemberId) as any[];

  if (expiringCerts.length === 0) {
    return { crew_member: member.first_name + ' ' + member.last_name, message: 'No expiring certifications in the next 90 days.' };
  }

  // Group certs that can be renewed together
  const groups: { certs: any[]; reason: string }[] = [];
  const processed = new Set<number>();

  for (let i = 0; i < expiringCerts.length; i++) {
    if (processed.has(i)) continue;

    const cert = expiringCerts[i];
    const dependencies = db.prepare('SELECT child_cert_type FROM cert_dependencies WHERE parent_cert_type = ?').all(cert.cert_type) as any[];

    if (dependencies.length > 0) {
      // This is a parent cert — find all children that also expire soon
      const group = [cert];
      for (const dep of dependencies) {
        const childCerts = expiringCerts.filter((c, idx) => c.cert_type === dep.child_cert_type && !processed.has(idx));
        group.push(...childCerts);
        childCerts.forEach(c => processed.add(expiringCerts.indexOf(c)));
      }
      groups.push({ certs: group, reason: `${cert.cert_name} is a prerequisite — renew it first, then all dependent certs` });
      processed.add(i);
    } else {
      groups.push({ certs: [cert], reason: 'Standalone certification — can be renewed independently' });
      processed.add(i);
    }
  }

  // Find nearby training providers
  const vessel = db.prepare('SELECT * FROM vessels WHERE id = ?').get(member.vessel_id) as any;
  const providers = db.prepare('SELECT * FROM training_providers ORDER BY rating DESC').all() as any[];

  // Match providers with cert types needed
  const neededTypes = new Set(expiringCerts.map(c => c.cert_type));

  const recommendedProviders = providers.filter(p => {
    const courses = JSON.parse(p.courses_offered);
    return courses.some((c: string) => neededTypes.has(c));
  });

  return {
    crew_member: `${member.first_name} ${member.last_name}`,
    position: member.position,
    vessel: vessel?.name,
    expiring_certs: expiringCerts.map(c => ({
      cert_name: c.cert_name,
      cert_type: c.cert_type,
      expiry_date: c.expiry_date,
      days_left: daysUntil(c.expiry_date)
    })),
    renewal_groups: groups.map(g => ({
      certs: g.certs.map(c => c.cert_name),
      reason: g.reason
    })),
    recommended_providers: recommendedProviders.slice(0, 5).map(p => ({
      name: p.name,
      location: p.location,
      country: p.country,
      rating: p.rating,
      matches: JSON.parse(p.courses_offered).filter((c: string) => neededTypes.has(c))
    }))
  };
}

// Send email notification
export async function sendEmailAlert(to: string, subject: string, html: string): Promise<boolean> {
  if (!transporter) {
    console.log(`[Email] Would send to ${to}: ${subject}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: `[Poseidon] ${subject}`,
      html,
    });
    return true;
  } catch (e) {
    console.error(`[Email] Failed to send to ${to}:`, e);
    return false;
  }
}

export default { cerberusScan, generateRenewalPlan, sendEmailAlert };
