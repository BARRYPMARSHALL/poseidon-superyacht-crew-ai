import db from '../database';
import { generateId, daysUntil } from '../utils/helpers';

// Nereus: Rotation & Scheduling Agent
// Runs daily to check rotation schedules and flag issues

export async function nereusScan(): Promise<{ alertsCreated: number }> {
  console.log('[Nereus] Starting rotation scan...');
  let alertsCreated = 0;

  // Find all active crew with rotations
  const rotations = db.prepare(`
    SELECT r.*, cm.first_name, cm.last_name, cm.position, cm.vessel_id,
           v.name as vessel_name
    FROM rotations r
    JOIN crew_members cm ON r.crew_member_id = cm.id
    JOIN vessels v ON cm.vessel_id = v.id
    WHERE cm.status IN ('active', 'on_leave')
    ORDER BY r.next_tour_start
  `).all() as any[];

  const now = new Date();

  for (const rot of rotations) {
    // Check if current tour is ending soon
    if (rot.current_tour_end) {
      const daysToEnd = daysUntil(rot.current_tour_end);
      if (daysToEnd >= 0 && daysToEnd <= 14) {
        const alertId = generateId();
        const title = `Tour ending in ${daysToEnd} days: ${rot.first_name} ${rot.last_name}`;

        const existingAlert = db.prepare(
          'SELECT id FROM alerts WHERE crew_member_id = ? AND alert_type = \'rotation_due\' AND created_at > datetime(\'now\', \'-3 day\')'
        ).get(rot.crew_member_id);

        if (!existingAlert) {
          db.prepare(`INSERT INTO alerts (id, vessel_id, crew_member_id, alert_type, severity, title, message)
            VALUES (?, ?, ?, 'rotation_due', 'info', ?, ?)`)
            .run(alertId, rot.vessel_id, rot.crew_member_id, title,
              `Current rotation tour ends ${rot.current_tour_end}. Prepare handover notes and confirm replacement crew travel. Next tour starts: ${rot.next_tour_start || 'Not scheduled'}.`);
          alertsCreated++;
        }
      }
    }

    // Check if next tour starts soon and no replacement arranged
    if (rot.next_tour_start) {
      const daysToNext = daysUntil(rot.next_tour_start);
      if (daysToNext >= 0 && daysToNext <= 21) {
        // Check if the returning crew member has valid certs
        const expiringCerts = db.prepare(`
          SELECT COUNT(*) as count FROM certifications
          WHERE crew_member_id = ? AND expiry_date <= date('now', '+30 days') AND status != 'expired'
        `).get(rot.crew_member_id) as any;

        if (expiringCerts.count > 0) {
          const alertId = generateId();
          const title = `Returning crew has expiring certs: ${rot.first_name} ${rot.last_name}`;
          const existingAlert = db.prepare(
            'SELECT id FROM alerts WHERE crew_member_id = ? AND alert_type = \'rotation_due\' AND title = ? AND created_at > datetime(\'now\', \'-7 day\')'
          ).get(rot.crew_member_id, title);

          if (!existingAlert) {
            db.prepare(`INSERT INTO alerts (id, vessel_id, crew_member_id, alert_type, severity, title, message)
              VALUES (?, ?, ?, 'rotation_due', 'warning', ?, ?)`)
              .run(alertId, rot.vessel_id, rot.crew_member_id, title,
                `${rot.first_name} ${rot.last_name} returns from leave ${rot.next_tour_start} but has ${expiringCerts.count} certification(s) expiring within 30 days. Renew before return.`);
            alertsCreated++;
          }
        }
      }
    }
  }

  // Scan Schengen visa compliance for crew in Mediterranean
  const schengenCrew = db.prepare(`
    SELECT v.*, cm.first_name, cm.last_name, cm.position, cm.vessel_id, vs.name as vessel_name
    FROM visas v
    JOIN crew_members cm ON v.crew_member_id = cm.id
    JOIN vessels vs ON cm.vessel_id = vs.id
    WHERE cm.status = 'active' AND v.schengen_zone = 1
    AND (v.days_used IS NOT NULL OR v.days_remaining IS NOT NULL)
  `).all() as any[];

  for (const entry of schengenCrew) {
    if (entry.days_remaining !== null && entry.days_remaining <= 20) {
      const alertId = generateId();
      const title = `Schengen days running low: ${entry.first_name} ${entry.last_name}`;
      const existingAlert = db.prepare(
        'SELECT id FROM alerts WHERE crew_member_id = ? AND alert_type = \'visa_expiry\' AND title LIKE \'%Schengen%\' AND created_at > datetime(\'now\', \'-14 day\')'
      ).get(entry.crew_member_id);

      if (!existingAlert) {
        db.prepare(`INSERT INTO alerts (id, vessel_id, crew_member_id, alert_type, severity, title, message)
          VALUES (?, ?, ?, 'visa_expiry', 'critical', ?, ?)`)
          .run(alertId, entry.vessel_id, entry.crew_member_id, title,
            `Only ${entry.days_remaining} Schengen days remaining for ${entry.first_name} ${entry.last_name}. Arrange rotation out of Schengen zone immediately to avoid overstay.`);
        alertsCreated++;
      }
    }
  }

  console.log(`[Nereus] Scan complete. ${alertsCreated} alerts created.`);
  return { alertsCreated };
}

export function getRotationPlan(vesselId: string): any {
  const rotations = db.prepare(`
    SELECT r.*, cm.first_name, cm.last_name, cm.position, cm.department,
           cm.status as crew_status
    FROM rotations r
    JOIN crew_members cm ON r.crew_member_id = cm.id
    WHERE cm.vessel_id = ? AND cm.status IN ('active', 'on_leave')
    ORDER BY r.current_tour_end
  `).all(vesselId);

  return {
    vessel_id: vesselId,
    rotation_count: (rotations as any[]).length,
    rotations: (rotations as any[]).map(r => ({
      crew: `${r.first_name} ${r.last_name}`,
      position: r.position,
      department: r.department,
      pattern: r.rotation_pattern,
      current_tour: r.current_tour_start ? `${r.current_tour_start} → ${r.current_tour_end}` : null,
      next_tour: r.next_tour_start ? `Starts ${r.next_tour_start}` : 'Not scheduled',
      status: r.crew_status
    }))
  };
}

export default { nereusScan, getRotationPlan };
