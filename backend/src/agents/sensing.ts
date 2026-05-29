import db from '../database';
import { generateId } from '../utils/helpers';

// ==============================
// Sensing Agent
// Monitors external environment: competitors, regulations, market trends,
// technology developments, and customer feedback.
// ==============================

interface SensingEvent {
  id: string;
  vessel_id: string;
  category: 'competitor' | 'regulation' | 'market' | 'technology' | 'customer';
  source: string | null;
  title: string;
  description: string | null;
  severity: 'info' | 'warning' | 'critical';
  url: string | null;
  detected_at: string;
  is_actionable: number;
  action_taken: string | null;
  resolved_at: string | null;
  created_at: string;
}

type Category = 'competitor' | 'regulation' | 'market' | 'technology' | 'customer';
type Severity = 'info' | 'warning' | 'critical';

/**
 * Log a new sensing event for a vessel.
 */
export function logSensingEvent(
  vesselId: string,
  category: Category,
  title: string,
  description: string,
  severity?: Severity,
  url?: string,
): SensingEvent {
  const id = generateId();
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  // Determine source from url or category hint
  let source: string | null = null;
  if (url) {
    try {
      const parsed = new URL(url);
      source = parsed.hostname.replace(/^www\./, '');
    } catch {
      source = category;
    }
  } else {
    source = category;
  }

  // Severity defaults to 'info'
  const sev = severity || 'info';

  db.prepare(`
    INSERT INTO sensing_events (id, vessel_id, category, source, title, description, severity, url, detected_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(id, vesselId, category, source, title, description, sev, url || null);

  // Log agent activity
  const logId = generateId();
  db.prepare(`
    INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, details)
    VALUES (?, ?, 'Sensing', 'log_event', ?, ?)
  `).run(logId, vesselId, `Logged ${category} event: ${title}`, JSON.stringify({
    event_id: id,
    category,
    severity: sev,
    source,
    url: url || null,
  }));

  const event = db.prepare('SELECT * FROM sensing_events WHERE id = ?').get(id) as SensingEvent;
  return event;
}

/**
 * Query sensing events with optional filters.
 */
export function getSensingEvents(
  vesselId: string,
  category?: Category,
  actionable?: boolean,
  days?: number,
): SensingEvent[] {
  const conditions: string[] = ['vessel_id = ?'];
  const params: any[] = [vesselId];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (actionable !== undefined) {
    conditions.push('is_actionable = ?');
    params.push(actionable ? 1 : 0);
  }

  if (days !== undefined && days > 0) {
    conditions.push(`detected_at >= datetime('now', ?)`);
    params.push(`-${days} days`);
  }

  const sql = `SELECT * FROM sensing_events WHERE ${conditions.join(' AND ')} ORDER BY detected_at DESC`;

  return db.prepare(sql).all(...params) as SensingEvent[];
}

/**
 * Get urgent events — actionable but not yet acted upon, severity critical or warning.
 */
export function getUrgentEvents(vesselId: string): SensingEvent[] {
  const events = db.prepare(`
    SELECT * FROM sensing_events
    WHERE vessel_id = ?
      AND is_actionable = 1
      AND action_taken IS NULL
      AND resolved_at IS NULL
      AND severity IN ('critical', 'warning')
    ORDER BY
      CASE severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 END,
      detected_at ASC
  `).all(vesselId) as SensingEvent[];

  // Log agent activity
  const logId = generateId();
  db.prepare(`
    INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, details)
    VALUES (?, ?, 'Sensing', 'check_urgent', ?, ?)
  `).run(
    logId,
    vesselId,
    `Checked for urgent events — found ${events.length} urgent`,
    JSON.stringify({ urgent_count: events.length }),
  );

  return events;
}

/**
 * Generate a summary report of recent events grouped by category, with trend analysis.
 */
export function generateSensingReport(vesselId: string): any {
  // Get events from last 90 days
  const events = db.prepare(`
    SELECT * FROM sensing_events
    WHERE vessel_id = ? AND detected_at >= datetime('now', '-90 days')
    ORDER BY detected_at DESC
  `).all(vesselId) as SensingEvent[];

  // Group by category
  const categories: Record<string, SensingEvent[]> = {
    competitor: [],
    regulation: [],
    market: [],
    technology: [],
    customer: [],
  };

  for (const event of events) {
    if (categories[event.category]) {
      categories[event.category].push(event);
    }
  }

  // Build summary per category
  const categorySummaries: any[] = [];
  const severityCounts = { critical: 0, warning: 0, info: 0 };
  let actionableCount = 0;
  let unresolvedCount = 0;

  for (const [cat, catEvents] of Object.entries(categories)) {
    if (catEvents.length === 0) continue;

    const catCritical = catEvents.filter(e => e.severity === 'critical').length;
    const catWarning = catEvents.filter(e => e.severity === 'warning').length;
    const catActionable = catEvents.filter(e => e.is_actionable === 1).length;
    const catResolved = catEvents.filter(e => e.resolved_at !== null).length;

    severityCounts.critical += catCritical;
    severityCounts.warning += catWarning;
    severityCounts.info += catEvents.filter(e => e.severity === 'info').length;
    actionableCount += catActionable;
    unresolvedCount += catEvents.length - catResolved;

    // Get latest event in category
    const latest = catEvents[0];

    categorySummaries.push({
      category: cat,
      total: catEvents.length,
      critical: catCritical,
      warning: catWarning,
      actionable: catActionable,
      resolved: catResolved,
      latest_event: {
        title: latest.title,
        severity: latest.severity,
        detected_at: latest.detected_at,
      },
      top_events: catEvents.slice(0, 5).map(e => ({
        id: e.id,
        title: e.title,
        severity: e.severity,
        is_actionable: e.is_actionable === 1,
        resolved: e.resolved_at !== null,
        detected_at: e.detected_at,
      })),
    });
  }

  // Trend analysis — compare last 30 days vs previous 60
  const recent30 = db.prepare(`
    SELECT COUNT(*) as count FROM sensing_events
    WHERE vessel_id = ? AND detected_at >= datetime('now', '-30 days')
  `).get(vesselId) as any;

  const prev60 = db.prepare(`
    SELECT COUNT(*) as count FROM sensing_events
    WHERE vessel_id = ? AND detected_at >= datetime('now', '-90 days') AND detected_at < datetime('now', '-30 days')
  `).get(vesselId) as any;

  const recentCount = recent30?.count || 0;
  const prevCount = prev60?.count || 0;
  const avgPrevPer30 = Math.round(prevCount / 2); // normalize to 30-day window

  let trend: string;
  let trendDirection: string;
  if (recentCount > avgPrevPer30 * 1.2) {
    trend = 'increasing';
    trendDirection = 'up';
  } else if (recentCount < avgPrevPer30 * 0.8) {
    trend = 'decreasing';
    trendDirection = 'down';
  } else {
    trend = 'stable';
    trendDirection = 'flat';
  }

  const report = {
    vessel_id: vesselId,
    report_period: 'Last 90 days',
    generated_at: new Date().toISOString(),
    summary: {
      total_events: events.length,
      ...severityCounts,
      actionable: actionableCount,
      unresolved: unresolvedCount,
    },
    trend_analysis: {
      recent_30_days: recentCount,
      previous_30_day_avg: avgPrevPer30,
      trend,
      direction: trendDirection,
      interpretation:
        trend === 'increasing'
          ? 'Event frequency is rising — increased monitoring recommended'
          : trend === 'decreasing'
            ? 'Event frequency is declining — current posture effective'
            : 'Event frequency is stable — monitoring is at baseline',
    },
    categories: categorySummaries,
  };

  // Log agent activity
  const logId = generateId();
  db.prepare(`
    INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, details)
    VALUES (?, ?, 'Sensing', 'generate_report', ?, ?)
  `).run(
    logId,
    vesselId,
    `Generated sensing report — ${events.length} events across ${categorySummaries.length} categories, trend: ${trend}`,
    JSON.stringify({
      total_events: events.length,
      trend,
      categories: categorySummaries.length,
    }),
  );

  return report;
}

/**
 * Mark a sensing event as resolved, recording the action taken.
 */
export function resolveEvent(eventId: string, actionTaken: string): SensingEvent | null {
  const existing = db.prepare('SELECT * FROM sensing_events WHERE id = ?').get(eventId) as SensingEvent | undefined;
  if (!existing) {
    return null;
  }

  db.prepare(`
    UPDATE sensing_events
    SET action_taken = ?, resolved_at = datetime('now')
    WHERE id = ?
  `).run(actionTaken, eventId);

  // Log agent activity
  const logId = generateId();
  db.prepare(`
    INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, details)
    VALUES (?, ?, 'Sensing', 'resolve_event', ?, ?)
  `).run(
    logId,
    existing.vessel_id,
    `Resolved event: ${existing.title}`,
    JSON.stringify({
      event_id: eventId,
      category: existing.category,
      severity: existing.severity,
      action_taken: actionTaken,
    }),
  );

  const updated = db.prepare('SELECT * FROM sensing_events WHERE id = ?').get(eventId) as SensingEvent;
  return updated;
}

export default {
  logSensingEvent,
  getSensingEvents,
  getUrgentEvents,
  generateSensingReport,
  resolveEvent,
};
