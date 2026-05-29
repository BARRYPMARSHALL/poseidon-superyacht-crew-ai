import db from '../database';
import { generateId } from '../utils/helpers';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeChecksum(data: Record<string, any>): string {
  const json = JSON.stringify(data);
  let sum = 0;
  for (let i = 0; i < json.length; i++) {
    sum += json.charCodeAt(i);
  }
  return String(sum);
}

function logActivity(vesselId: string, agentName: string, actionType: string, summary: string, details?: string): void {
  const id = generateId();
  db.prepare(
    `INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, details)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, vesselId, agentName, actionType, summary, details || null);
}

// ─── Checkpoints ──────────────────────────────────────────────────────────────

/**
 * Serializes agent state to JSON, computes a simple character-sum checksum,
 * stores the checkpoint, and returns the new checkpoint id.
 */
export function createCheckpoint(
  vesselId: string,
  agentName: string,
  snapshotType: string,
  snapshotData: Record<string, any>,
): string {
  const id = generateId();
  const snapshotJson = JSON.stringify(snapshotData);
  const checksum = computeChecksum(snapshotData);

  db.prepare(
    `INSERT INTO agent_checkpoints (id, vessel_id, agent_name, snapshot_type, snapshot_data, checksum, status)
     VALUES (?, ?, ?, ?, ?, ?, 'active')`
  ).run(id, vesselId, agentName, snapshotType, snapshotJson, checksum);

  logActivity(vesselId, agentName, 'checkpoint_created', `Checkpoint created: ${snapshotType}`, JSON.stringify({ checkpoint_id: id }));

  return id;
}

/**
 * Rolls back to a given checkpoint by marking it (and all descendant checkpoints)
 * as rolled_back. Returns the snapshot_data so the caller can restore state.
 */
export function rollbackToCheckpoint(checkpointId: string): Record<string, any> | null {
  const checkpoint = db.prepare('SELECT * FROM agent_checkpoints WHERE id = ?').get(checkpointId) as any;
  if (!checkpoint) return null;

  // Mark target checkpoint as rolled_back
  db.prepare(
    `UPDATE agent_checkpoints SET status = 'rolled_back', rolled_back_at = datetime('now') WHERE id = ?`
  ).run(checkpointId);

  // Recursively find and roll back child checkpoints
  rollbackChildren(checkpointId);

  logActivity(
    checkpoint.vessel_id,
    checkpoint.agent_name,
    'checkpoint_rolled_back',
    `Rolled back to checkpoint: ${checkpoint.snapshot_type}`,
    JSON.stringify({ checkpoint_id: checkpointId }),
  );

  return JSON.parse(checkpoint.snapshot_data);
}

function rollbackChildren(parentId: string): void {
  const children = db.prepare(
    'SELECT id FROM agent_checkpoints WHERE parent_checkpoint_id = ? AND status = ?'
  ).all(parentId, 'active') as any[];

  for (const child of children) {
    db.prepare(
      `UPDATE agent_checkpoints SET status = 'rolled_back', rolled_back_at = datetime('now') WHERE id = ?`
    ).run(child.id);
    rollbackChildren(child.id);
  }
}

/**
 * Query checkpoints for a vessel, optionally filtered by agent_name and/or status.
 */
export function getCheckpoints(
  vesselId: string,
  agentName?: string,
  status?: string,
): any[] {
  const conditions: string[] = ['vessel_id = ?'];
  const params: any[] = [vesselId];

  if (agentName) {
    conditions.push('agent_name = ?');
    params.push(agentName);
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  const sql = `SELECT * FROM agent_checkpoints WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
  return db.prepare(sql).all(...params);
}

// ─── Human Review Queue ───────────────────────────────────────────────────────

/**
 * Adds an action to the human review queue for manual approval.
 */
export function queueForReview(
  vesselId: string,
  agentName: string,
  actionType: string,
  description: string,
  contextData: Record<string, any>,
  checkpointId?: string,
): string {
  const id = generateId();

  db.prepare(
    `INSERT INTO human_review_queue (id, vessel_id, agent_name, action_type, description, context_data, status, checkpoint_id)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`
  ).run(id, vesselId, agentName, actionType, description, JSON.stringify(contextData), checkpointId || null);

  logActivity(
    vesselId,
    agentName,
    'review_requested',
    `Action queued for human review: ${actionType}`,
    JSON.stringify({ review_id: id, description }),
  );

  return id;
}

/**
 * Approves or rejects a queued review action.
 * If rejected and the review has an associated checkpoint, auto-rolls back.
 */
export function reviewAction(
  reviewId: string,
  reviewerId: string,
  decision: 'approved' | 'rejected',
  notes: string,
): any {
  const review = db.prepare('SELECT * FROM human_review_queue WHERE id = ?').get(reviewId) as any;
  if (!review) return null;
  if (review.status !== 'pending') return { error: 'Review already processed', review };

  db.prepare(
    `UPDATE human_review_queue SET status = ?, reviewed_by = ?, reviewed_at = datetime('now'), reviewer_notes = ? WHERE id = ?`
  ).run(decision, reviewerId, notes, reviewId);

  // If rejected and has a checkpoint, auto-rollback
  if (decision === 'rejected' && review.checkpoint_id) {
    rollbackToCheckpoint(review.checkpoint_id);
  }

  const actionDesc = decision === 'approved' ? 'approved' : 'rejected';
  logActivity(
    review.vessel_id,
    review.agent_name,
    `review_${actionDesc}`,
    `Review ${actionDesc}: ${review.action_type}`,
    JSON.stringify({ review_id: reviewId, reviewer: reviewerId, notes }),
  );

  return {
    id: reviewId,
    status: decision,
    reviewed_by: reviewerId,
    reviewed_at: new Date().toISOString(),
    reviewer_notes: notes,
  };
}

/**
 * Returns all pending reviews for a vessel.
 */
export function getPendingReviews(vesselId: string): any[] {
  return db.prepare(
    'SELECT * FROM human_review_queue WHERE vessel_id = ? AND status = ? ORDER BY created_at ASC'
  ).all(vesselId, 'pending');
}

/**
 * Returns review statistics for a vessel: total, pending, approved, rejected,
 * and average review time in hours.
 */
export function getReviewStats(vesselId: string): {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageReviewTimeHours: number | null;
} {
  const total = db.prepare(
    'SELECT COUNT(*) as count FROM human_review_queue WHERE vessel_id = ?'
  ).get(vesselId) as any;

  const pending = db.prepare(
    "SELECT COUNT(*) as count FROM human_review_queue WHERE vessel_id = ? AND status = 'pending'"
  ).get(vesselId) as any;

  const approved = db.prepare(
    "SELECT COUNT(*) as count FROM human_review_queue WHERE vessel_id = ? AND status = 'approved'"
  ).get(vesselId) as any;

  const rejected = db.prepare(
    "SELECT COUNT(*) as count FROM human_review_queue WHERE vessel_id = ? AND status = 'rejected'"
  ).get(vesselId) as any;

  // Average review time: timediff between reviewed_at and created_at in hours
  const avgRow = db.prepare(`
    SELECT AVG(
      (julianday(reviewed_at) - julianday(created_at)) * 24
    ) as avg_hours
    FROM human_review_queue
    WHERE vessel_id = ? AND reviewed_at IS NOT NULL
  `).get(vesselId) as any;

  return {
    total: total?.count ?? 0,
    pending: pending?.count ?? 0,
    approved: approved?.count ?? 0,
    rejected: rejected?.count ?? 0,
    averageReviewTimeHours: avgRow?.avg_hours ?? null,
  };
}

export default {
  createCheckpoint,
  rollbackToCheckpoint,
  getCheckpoints,
  queueForReview,
  reviewAction,
  getPendingReviews,
  getReviewStats,
};
