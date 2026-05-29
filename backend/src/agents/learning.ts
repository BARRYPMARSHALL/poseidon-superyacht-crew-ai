import db from '../database';
import { generateId } from '../utils/helpers';

// ───────────────────────────────────────────────
// Learning Loop Agent
// Captures agent outcomes, analyzes failure patterns,
// and generates concrete improvement suggestions.
// ───────────────────────────────────────────────

/**
 * Record an agent outcome into agent_outcomes table.
 * Also logs the action to agent_activity_log.
 */
export function logOutcome(
  vesselId: string,
  agentName: string,
  actionType: string,
  inputSummary: string,
  outputSummary: string,
  outcome: 'success' | 'failure' | 'partial' | 'unknown',
  successScore: number,
  lessons?: string,
  suggestions?: string,
): { id: string } {
  const id = generateId();
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO agent_outcomes
      (id, vessel_id, agent_name, action_type, input_summary, output_summary,
       outcome, success_score, lessons, improvement_suggestions, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, vesselId, agentName, actionType, inputSummary, outputSummary,
    outcome, successScore, lessons || null, suggestions || null, createdAt,
  );

  // Log to activity log
  const logId = generateId();
  db.prepare(`
    INSERT INTO agent_activity_log
      (id, vessel_id, agent_name, action_type, action_summary, details, status)
    VALUES (?, ?, ?, ?, ?, ?, 'completed')
  `).run(
    logId, vesselId, 'Learning', 'log_outcome',
    `${agentName} — ${actionType} — ${outcome} (score: ${successScore})`,
    JSON.stringify({ outcome_id: id, lessons: lessons || null, suggestions: suggestions || null }),
  );

  return { id };
}

/**
 * Fetch recent outcomes for a vessel, optionally filtered by agent and time range.
 */
export function getRecentOutcomes(
  vesselId: string,
  agentName?: string,
  days: number = 7,
): any[] {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  let sql = `
    SELECT * FROM agent_outcomes
    WHERE vessel_id = ? AND created_at >= ?
  `;
  const params: any[] = [vesselId, cutoff];

  if (agentName) {
    sql += ' AND agent_name = ?';
    params.push(agentName);
  }

  sql += ' ORDER BY created_at DESC';

  return db.prepare(sql).all(...params) as any[];
}

/**
 * Analyse failures to find patterns.
 * Returns which agents fail most, what action types fail most,
 * average success scores by agent, and time-based failure distribution.
 */
export function getFailurePatterns(
  vesselId: string,
  days: number = 30,
): {
  total_outcomes: number;
  total_failures: number;
  failure_rate: number;
  by_agent: { agent_name: string; total: number; failures: number; failure_rate: number; avg_score: number }[];
  by_action_type: { action_type: string; total: number; failures: number; failure_rate: number }[];
  hourly_distribution: { hour: number; failures: number; total: number; failure_rate: number }[];
} {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const outcomes = db.prepare(`
    SELECT * FROM agent_outcomes
    WHERE vessel_id = ? AND created_at >= ?
    ORDER BY created_at
  `).all(vesselId, cutoff) as any[];

  const totalOutcomes = outcomes.length;
  const failures = outcomes.filter((o: any) => o.outcome === 'failure');
  const totalFailures = failures.length;
  const failureRate = totalOutcomes > 0 ? Math.round((totalFailures / totalOutcomes) * 10000) / 100 : 0;

  // --- By agent ---
  const agentMap = new Map<string, { total: number; failures: number; scoreSum: number }>();
  for (const o of outcomes) {
    const entry = agentMap.get(o.agent_name) || { total: 0, failures: 0, scoreSum: 0 };
    entry.total++;
    entry.scoreSum += o.success_score || 0;
    if (o.outcome === 'failure') entry.failures++;
    agentMap.set(o.agent_name, entry);
  }
  const byAgent = Array.from(agentMap.entries()).map(([name, stats]) => ({
    agent_name: name,
    total: stats.total,
    failures: stats.failures,
    failure_rate: Math.round((stats.failures / stats.total) * 10000) / 100,
    avg_score: Math.round(stats.scoreSum / stats.total),
  })).sort((a, b) => b.failure_rate - a.failure_rate);

  // --- By action type ---
  const actionMap = new Map<string, { total: number; failures: number }>();
  for (const o of outcomes) {
    const entry = actionMap.get(o.action_type) || { total: 0, failures: 0 };
    entry.total++;
    if (o.outcome === 'failure') entry.failures++;
    actionMap.set(o.action_type, entry);
  }
  const byActionType = Array.from(actionMap.entries()).map(([type, stats]) => ({
    action_type: type,
    total: stats.total,
    failures: stats.failures,
    failure_rate: Math.round((stats.failures / stats.total) * 10000) / 100,
  })).sort((a, b) => b.failure_rate - a.failure_rate);

  // --- Hourly distribution ---
  const hourMap = new Map<number, { failures: number; total: number }>();
  for (let h = 0; h < 24; h++) hourMap.set(h, { failures: 0, total: 0 });
  for (const o of outcomes) {
    const hour = new Date(o.created_at).getUTCHours();
    const entry = hourMap.get(hour)!;
    entry.total++;
    if (o.outcome === 'failure') entry.failures++;
  }
  const hourlyDistribution = Array.from(hourMap.entries()).map(([hour, stats]) => ({
    hour,
    failures: stats.failures,
    total: stats.total,
    failure_rate: stats.total > 0 ? Math.round((stats.failures / stats.total) * 10000) / 100 : 0,
  }));

  return {
    total_outcomes: totalOutcomes,
    total_failures: totalFailures,
    failure_rate: failureRate,
    by_agent: byAgent,
    by_action_type: byActionType,
    hourly_distribution: hourlyDistribution,
  };
}

/**
 * Review the last 30 days of outcomes and generate concrete improvement
 * suggestions for each agent that has recorded outcomes.
 */
export function generateImprovements(vesselId: string): {
  generated_at: string;
  improvements: {
    agent_name: string;
    total_outcomes: number;
    failures: number;
    success_rate: number;
    current_issues: string[];
    suggestions: string[];
  }[];
} {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const outcomes = db.prepare(`
    SELECT * FROM agent_outcomes
    WHERE vessel_id = ? AND created_at >= ?
    ORDER BY agent_name, created_at
  `).all(vesselId, cutoff) as any[];

  // Group by agent
  const agentGroups = new Map<string, any[]>();
  for (const o of outcomes) {
    const group = agentGroups.get(o.agent_name) || [];
    group.push(o);
    agentGroups.set(o.agent_name, group);
  }

  const improvements: {
    agent_name: string;
    total_outcomes: number;
    failures: number;
    success_rate: number;
    current_issues: string[];
    suggestions: string[];
  }[] = [];

  for (const [agentName, agentOutcomes] of agentGroups.entries()) {
    const total = agentOutcomes.length;
    const failures = agentOutcomes.filter((o: any) => o.outcome === 'failure').length;
    const partials = agentOutcomes.filter((o: any) => o.outcome === 'partial').length;
    const successRate = Math.round(((total - failures) / total) * 10000) / 100;

    // Collect past lessons and suggestions
    const pastLessons = agentOutcomes
      .filter((o: any) => o.lessons)
      .map((o: any) => o.lessons);

    const pastSuggestions = agentOutcomes
      .filter((o: any) => o.improvement_suggestions)
      .map((o: any) => o.improvement_suggestions);

    // Identify failing action types
    const failingActions = new Map<string, number>();
    for (const o of agentOutcomes) {
      if (o.outcome === 'failure') {
        failingActions.set(o.action_type, (failingActions.get(o.action_type) || 0) + 1);
      }
    }

    // Generate current issues based on data
    const currentIssues: string[] = [];
    if (failures > 0) {
      currentIssues.push(`${failures} failure(s) out of ${total} actions (${Math.round((failures / total) * 100)}% failure rate)`);
    }
    if (partials > 0) {
      currentIssues.push(`${partials} partial outcome(s) — actions completing but with reduced quality`);
    }
    if (failingActions.size > 0) {
      const worstAction = Array.from(failingActions.entries()).sort((a, b) => b[1] - a[1])[0];
      currentIssues.push(`Most problematic action type: "${worstAction[0]}" (${worstAction[1]} failures)`);
    }
    const lowScoreOutcomes = agentOutcomes.filter((o: any) => o.success_score !== null && o.success_score < 50);
    if (lowScoreOutcomes.length > 0) {
      currentIssues.push(`${lowScoreOutcomes.length} outcome(s) scored below 50 — investigate root cause`);
    }

    // Generate suggestions
    const suggestions: string[] = [];
    if (failures > 0) {
      suggestions.push(`Review and refine input handling for the ${failingActions.size} action type(s) showing recurrent failures`);
      suggestions.push('Add additional validation or pre-checks before executing high-failure-rate actions');
    }
    if (partials > 0) {
      suggestions.push('Investigate partial outcomes to determine if timeout, data quality, or dependency issues are the cause');
    }
    if (total > 10 && successRate < 80) {
      suggestions.push('Consider human-in-the-loop approval for actions with historically low success rates');
    }
    // Incorporate historical improvement suggestions
    const uniquePastSuggestions = [...new Set(pastSuggestions)];
    if (uniquePastSuggestions.length > 0) {
      const unresolvedSuggestions = uniquePastSuggestions.slice(0, 3);
      suggestions.push(`Previously suggested improvements to revisit: ${unresolvedSuggestions.join('; ')}`);
    }

    // If no specific issues, suggest continued monitoring
    if (currentIssues.length === 0) {
      currentIssues.push('No significant issues detected in the review period');
    }
    if (suggestions.length === 0) {
      suggestions.push('Continue monitoring — no actionable improvements identified at this time');
    }

    improvements.push({
      agent_name: agentName,
      total_outcomes: total,
      failures,
      success_rate: successRate,
      current_issues: currentIssues,
      suggestions,
    });
  }

  // Log the improvement generation activity
  const logId = generateId();
  db.prepare(`
    INSERT INTO agent_activity_log
      (id, vessel_id, agent_name, action_type, action_summary, details, status)
    VALUES (?, ?, ?, ?, ?, ?, 'completed')
  `).run(
    logId, vesselId, 'Learning', 'generate_improvements',
    `Generated improvements for ${improvements.length} agent(s)`,
    JSON.stringify({ agent_count: improvements.length, agents: improvements.map(i => i.agent_name) }),
  );

  return {
    generated_at: new Date().toISOString(),
    improvements,
  };
}

/**
 * Orchestrator: collect recent outcomes, find failure patterns,
 * generate improvements, and log everything.
 *
 * Returns a comprehensive learning cycle report.
 */
export function runLearningCycle(vesselId: string): {
  cycle_id: string;
  executed_at: string;
  vessel_id: string;
  outcomes_count: number;
  failure_patterns: ReturnType<typeof getFailurePatterns>;
  improvements: ReturnType<typeof generateImprovements>;
} {
  const cycleId = generateId();
  const executedAt = new Date().toISOString();

  console.log(`[Learning] Starting learning cycle ${cycleId} for vessel ${vesselId}`);

  // Step 1: Collect recent outcomes (last 30 days)
  const outcomes = getRecentOutcomes(vesselId, undefined, 30);
  console.log(`[Learning] Collected ${outcomes.length} outcomes`);

  // Step 2: Find failure patterns
  const failurePatterns = getFailurePatterns(vesselId, 30);
  console.log(`[Learning] Failure rate: ${failurePatterns.failure_rate}%`);

  // Step 3: Generate improvements
  const improvements = generateImprovements(vesselId);
  console.log(`[Learning] Generated improvements for ${improvements.improvements.length} agent(s)`);

  // Step 4: Log the cycle to activity log
  const logId = generateId();
  db.prepare(`
    INSERT INTO agent_activity_log
      (id, vessel_id, agent_name, action_type, action_summary, details, status)
    VALUES (?, ?, ?, ?, ?, ?, 'completed')
  `).run(
    logId, vesselId, 'Learning', 'learning_cycle',
    `Learning cycle ${cycleId} — ${outcomes.length} outcomes, ${failurePatterns.total_failures} failures, ${improvements.improvements.length} agent improvements`,
    JSON.stringify({
      cycle_id: cycleId,
      outcomes_count: outcomes.length,
      total_failures: failurePatterns.total_failures,
      failure_rate: failurePatterns.failure_rate,
      agents_improved: improvements.improvements.length,
      worst_agent: failurePatterns.by_agent[0]?.agent_name || null,
    }),
  );

  console.log(`[Learning] Cycle ${cycleId} complete`);

  return {
    cycle_id: cycleId,
    executed_at: executedAt,
    vessel_id: vesselId,
    outcomes_count: outcomes.length,
    failure_patterns: failurePatterns,
    improvements,
  };
}

export default {
  logOutcome,
  getRecentOutcomes,
  getFailurePatterns,
  generateImprovements,
  runLearningCycle,
};
