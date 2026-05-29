import db from '../database';
import { generateId } from '../utils/helpers';

// =========== Types ===========

interface WorkflowParams {
  name: string;
  domain: string;
  steps: StepDescription[];
  vesselId: string;
  triggers?: string[];
  inputs?: string[];
  outputs?: string[];
  exceptions?: string[];
  toolsUsed?: string[];
  frequency?: string;
  owner?: string;
  estimatedHoursMonthly?: number;
  notes?: string;
}

interface StepDescription {
  description: string;
  isStructured: boolean;
  hasKnownInputs: boolean;
  hasKnownOutputs: boolean;
  hasExceptionsHandled: boolean;
  requiresHumanJudgment: boolean;
  isRepeatable: boolean;
}

interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  prompt: string;
}

// =========== Agent Activity Logging ===========

function logActivity(vesselId: string, actionType: string, summary: string, details: any, status: string = 'completed'): void {
  try {
    const id = generateId();
    db.prepare(
      'INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, details, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, vesselId, 'tacit_knowledge', actionType, summary, JSON.stringify(details), status);
  } catch (e) {
    console.error('[TacitKnowledge] Failed to log activity:', e);
  }
}

// =========== Scoring Helpers ===========

function calculateReadinessFromSteps(steps: StepDescription[]): number {
  if (!steps || steps.length === 0) return 0;

  let score = 0;
  const maxScore = 10;

  for (const step of steps) {
    let stepScore = 0;
    if (step.isStructured) stepScore += 2;
    if (step.hasKnownInputs) stepScore += 2;
    if (step.hasKnownOutputs) stepScore += 2;
    if (step.hasExceptionsHandled) stepScore += 1.5;
    if (step.isRepeatable) stepScore += 1.5;
    if (!step.requiresHumanJudgment) stepScore += 1;
    stepScore = Math.min(stepScore, 10);
    score += stepScore;
  }

  const average = score / steps.length;
  return Math.round(Math.min(average, maxScore));
}

// =========== Main Exports ===========

/**
 * Captures a workflow with its steps and stores it in the database.
 * Auto-calculates ai_readiness based on how structured/repeatable the steps are.
 */
export function captureWorkflow(params: WorkflowParams): any {
  const { vesselId, name, domain, steps, triggers, inputs, outputs, exceptions, toolsUsed, frequency, owner, estimatedHoursMonthly, notes } = params;

  if (!name || !domain || !steps || steps.length === 0) {
    throw new Error('Workflow name, domain, and at least one step are required');
  }

  const id = generateId();
  const aiReadiness = calculateReadinessFromSteps(steps);
  const now = new Date().toISOString();

  // Build full step records
  const stepRecords = steps.map((s, i) => ({
    stepNumber: i + 1,
    description: s.description,
    isStructured: s.isStructured,
    hasKnownInputs: s.hasKnownInputs,
    hasKnownOutputs: s.hasKnownOutputs,
    hasExceptionsHandled: s.hasExceptionsHandled,
    requiresHumanJudgment: s.requiresHumanJudgment,
    isRepeatable: s.isRepeatable,
  }));

  const isDocumented = steps.every(s => s.isStructured && s.hasKnownInputs && s.hasKnownOutputs) ? 1 : 0;

  db.prepare(`
    INSERT INTO workflows (id, vessel_id, name, domain, steps, triggers, inputs, outputs, exceptions, tools_used, frequency, owner, estimated_hours_monthly, ai_readiness, is_documented, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    vesselId,
    name,
    domain,
    JSON.stringify(stepRecords),
    triggers ? JSON.stringify(triggers) : null,
    inputs ? JSON.stringify(inputs) : null,
    outputs ? JSON.stringify(outputs) : null,
    exceptions ? JSON.stringify(exceptions) : null,
    toolsUsed ? JSON.stringify(toolsUsed) : null,
    frequency || null,
    owner || null,
    estimatedHoursMonthly || null,
    aiReadiness,
    isDocumented,
    notes || null,
    now,
    now
  );

  logActivity(vesselId, 'capture', `Captured workflow: ${name}`, {
    workflowId: id,
    domain,
    stepCount: steps.length,
    aiReadiness,
  });

  return {
    id,
    name,
    domain,
    steps: stepRecords,
    ai_readiness: aiReadiness,
    is_documented: isDocumented === 1,
  };
}

/**
 * Generates a structured interview prompt to extract undocumented knowledge
 * from a domain expert. Returns questions as a JSON array.
 */
export function interviewWorkflow(vesselId: string, domain: string): InterviewQuestion[] {
  const vesselName = vesselId
    ? (db.prepare('SELECT name FROM vessels WHERE id = ?').get(vesselId) as any)?.name || 'Unknown Vessel'
    : 'Unknown Vessel';

  const questions: InterviewQuestion[] = [
    {
      id: 'q1',
      category: 'overview',
      question: 'What is the name and purpose of this workflow?',
      prompt: `Describe the workflow you want to document for ${vesselName} in the domain of ${domain}. Provide a clear, descriptive name and explain the overall goal or outcome of this workflow.`,
    },
    {
      id: 'q2',
      category: 'triggers',
      question: 'What event or condition kicks off this workflow?',
      prompt: `Think about what starts this process. Is it a scheduled time, a specific event (e.g., guest arrival, port departure, equipment alarm), a request from someone, or something else? Describe the trigger as precisely as possible.`,
    },
    {
      id: 'q3',
      category: 'inputs',
      question: 'What information, tools, or resources are needed before starting?',
      prompt: `List everything you need to have ready before performing this workflow. This could include: documents, data from other systems, physical tools/equipment, approvals from others, or prerequisite checks. Be specific.`,
    },
    {
      id: 'q4',
      category: 'steps',
      question: 'Walk through the steps of this workflow in order. What do you do first, second, third, etc.?',
      prompt: `Describe each step of the workflow in sequence. For each step, include:
• What you actually do (the action)
• Where you do it (which system, which location on the vessel)
• Who is involved (if others are part of the step)
• How long it typically takes
• Any decisions you need to make at this step
• What tells you the step is done correctly
List the steps in numbered order (Step 1, Step 2, etc.).`,
    },
    {
      id: 'q5',
      category: 'outputs',
      question: 'What results, documents, records, or outcomes does this workflow produce?',
      prompt: `When the workflow is complete, what is produced? This could include: completed forms/reports, updated status in a system, physical changes (e.g., equipment configured), notifications sent to others, or records that need to be filed.`,
    },
    {
      id: 'q6',
      category: 'exceptions',
      question: 'What can go wrong? Describe common problems, edge cases, or deviations from the normal flow.',
      prompt: `Think about situations where things don't go as planned:
• What are the most common problems or errors?
• What do you do when something is missing or incorrect?
• How do you handle delays or emergencies?
• Are there seasonal or situational variations?
• What safety or compliance issues might arise?
For each problem, describe how you handle it and who you escalate to.`,
    },
    {
      id: 'q7',
      category: 'tools',
      question: 'What tools, software, equipment, or external services do you use?',
      prompt: `List all tools and resources used in this workflow:
• Software applications and which features you use
• Physical equipment or tools
• External contacts or third-party services
• Reference materials (manuals, checklists, guides)
For each tool, note whether there's a substitute if it's unavailable.`,
    },
    {
      id: 'q8',
      category: 'frequency',
      question: 'How often is this workflow performed and how long does it usually take?',
      prompt: `Estimate the frequency (e.g., multiple times daily, daily, weekly, monthly, per charter, per port call) and the average time each execution takes. Also note if the time varies significantly based on circumstances.`,
    },
    {
      id: 'q9',
      category: 'knowledge',
      question: 'What tacit knowledge or experience is critical to doing this workflow well?',
      prompt: `This is the most important question. Beyond what's written in manuals or checklists, what do you just know from experience? Examples:
• Subtle warning signs that something is off
• Tricks to do it faster or more safely
• Relationships between different systems or crew roles
• Things that are 'obvious' to an experienced person but a newcomer would miss
• Gut feelings or judgments that come with practice`,
    },
    {
      id: 'q10',
      category: 'automation',
      question: 'Which parts of this workflow do you think could be automated, and which require human judgment?',
      prompt: `Reflect on each step and consider:
• Which steps follow rigid rules or checklists → likely automatable
• Which steps require interpreting ambiguous information → human judgment
• Which steps need physical presence on the vessel → may need a hybrid approach
• Are there any steps you wish a computer could handle for you?
Be honest — some things can't or shouldn't be automated in a superyacht environment.`,
    },
    {
      id: 'q11',
      category: 'owner',
      question: 'Who is primarily responsible for this workflow, and who else needs to be involved?',
      prompt: `Identify the primary owner (job title or role) who is accountable for this workflow being done correctly. Also list any other crew members, departments, or external parties that need to participate or be notified.`,
    },
  ];

  logActivity(vesselId, 'interview', `Generated interview questions for domain: ${domain}`, {
    domain,
    questionCount: questions.length,
    vesselName,
  });

  return questions;
}

/**
 * Returns workflows, optionally filtered by domain.
 */
export function getWorkflows(vesselId: string, domain?: string): any[] {
  let sql = 'SELECT * FROM workflows WHERE vessel_id = ?';
  const params: any[] = [vesselId];

  if (domain) {
    sql += ' AND domain = ?';
    params.push(domain);
  }

  sql += ' ORDER BY created_at DESC';

  const workflows = db.prepare(sql).all(...params) as any[];

  // Parse JSON fields for convenience
  return workflows.map(w => ({
    ...w,
    steps: w.steps ? JSON.parse(w.steps) : [],
    triggers: w.triggers ? JSON.parse(w.triggers) : null,
    inputs: w.inputs ? JSON.parse(w.inputs) : null,
    outputs: w.outputs ? JSON.parse(w.outputs) : null,
    exceptions: w.exceptions ? JSON.parse(w.exceptions) : null,
    tools_used: w.tools_used ? JSON.parse(w.tools_used) : null,
  }));
}

/**
 * Analyzes the steps of a workflow and updates the ai_readiness score (0-10).
 * Scoring criteria:
 * - Are steps clearly defined and structured?
 * - Are inputs/outputs known?
 * - Are exceptions handled?
 * - Are steps repeatable?
 * - Do steps require human judgment?
 */
export function calculateAiReadiness(workflowId: string): number {
  const workflow = db.prepare('SELECT * FROM workflows WHERE id = ?').get(workflowId) as any;

  if (!workflow) {
    throw new Error(`Workflow not found: ${workflowId}`);
  }

  let steps: any[];
  try {
    steps = JSON.parse(workflow.steps);
  } catch {
    steps = [];
  }

  if (!steps || steps.length === 0) {
    // If no detailed step records exist, try to infer from the workflow metadata
    const score = inferReadinessFromMetadata(workflow);
    db.prepare('UPDATE workflows SET ai_readiness = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(score, workflowId);

    logActivity(workflow.vessel_id, 'calculate_readiness', `Calculated AI readiness for workflow: ${workflow.name}`, {
      workflowId,
      score,
      method: 'metadata_inference',
    });

    return score;
  }

  const score = calculateReadinessFromSteps(steps);

  db.prepare('UPDATE workflows SET ai_readiness = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .run(score, workflowId);

  logActivity(workflow.vessel_id, 'calculate_readiness', `Calculated AI readiness for workflow: ${workflow.name}`, {
    workflowId,
    score,
    method: 'step_analysis',
    stepCount: steps.length,
  });

  return score;
}

/**
 * Fallback scoring from metadata when detailed step records aren't available.
 */
function inferReadinessFromMetadata(workflow: any): number {
  let score = 0;

  // Points for having defined inputs
  if (workflow.inputs && workflow.inputs !== 'null' && workflow.inputs !== '[]') {
    try {
      const inputs = JSON.parse(workflow.inputs);
      if (Array.isArray(inputs) && inputs.length > 0) score += 2;
    } catch { /* not parseable, no points */ }
  }

  // Points for having defined outputs
  if (workflow.outputs && workflow.outputs !== 'null' && workflow.outputs !== '[]') {
    try {
      const outputs = JSON.parse(workflow.outputs);
      if (Array.isArray(outputs) && outputs.length > 0) score += 2;
    } catch { /* not parseable, no points */ }
  }

  // Points for having exceptions defined
  if (workflow.exceptions && workflow.exceptions !== 'null' && workflow.exceptions !== '[]') {
    try {
      const exceptions = JSON.parse(workflow.exceptions);
      if (Array.isArray(exceptions) && exceptions.length > 0) score += 1.5;
    } catch { /* not parseable, no points */ }
  }

  // Points for having triggers
  if (workflow.triggers && workflow.triggers !== 'null' && workflow.triggers !== '[]') {
    try {
      const triggers = JSON.parse(workflow.triggers);
      if (Array.isArray(triggers) && triggers.length > 0) score += 1;
    } catch { /* not parseable, no points */ }
  }

  // Points for having tools defined
  if (workflow.tools_used && workflow.tools_used !== 'null' && workflow.tools_used !== '[]') {
    try {
      const tools = JSON.parse(workflow.tools_used);
      if (Array.isArray(tools) && tools.length > 0) score += 1;
    } catch { /* not parseable, no points */ }
  }

  // Points for having frequency
  if (workflow.frequency) score += 0.5;

  // Points for having an owner
  if (workflow.owner) score += 0.5;

  // Points for having estimated hours
  if (workflow.estimated_hours_monthly !== null && workflow.estimated_hours_monthly > 0) score += 0.5;

  // Points for being previously documented
  if (workflow.is_documented) score += 1.5;

  return Math.min(Math.round(score), 10);
}

/**
 * Generates an automation plan for a workflow, showing which steps can be
 * automated immediately vs which need more knowledge or human judgment.
 */
export function generateAutomationPlan(workflowId: string): any {
  const workflow = db.prepare('SELECT * FROM workflows WHERE id = ?').get(workflowId) as any;

  if (!workflow) {
    throw new Error(`Workflow not found: ${workflowId}`);
  }

  let steps: any[];
  try {
    steps = JSON.parse(workflow.steps);
  } catch {
    steps = [];
  }

  const plan: {
    workflowName: string;
    domain: string;
    overallReadiness: number;
    automatableNow: any[];
    needsMoreKnowledge: any[];
    requiresHumanJudgment: any[];
    summary: {
      totalSteps: number;
      automatableImmediately: number;
      needsKnowledgeCapture: number;
      humanRequired: number;
    };
    recommendations: string[];
  } = {
    workflowName: workflow.name,
    domain: workflow.domain,
    overallReadiness: workflow.ai_readiness,
    automatableNow: [],
    needsMoreKnowledge: [],
    requiresHumanJudgment: [],
    summary: { totalSteps: 0, automatableImmediately: 0, needsKnowledgeCapture: 0, humanRequired: 0 },
    recommendations: [],
  };

  if (steps.length === 0) {
    plan.recommendations.push('No detailed step records exist. Run interviewWorkflow() to capture step-level knowledge first.');
    plan.summary.totalSteps = 0;
    return plan;
  }

  plan.summary.totalSteps = steps.length;

  for (const step of steps) {
    const classification = classifyStep(step);
    switch (classification) {
      case 'automatable':
        plan.automatableNow.push({
          stepNumber: step.stepNumber,
          description: step.description,
          reason: 'Structured, known inputs/outputs, no human judgment required, exceptions handled',
        });
        plan.summary.automatableImmediately++;
        break;
      case 'needs_knowledge':
        plan.needsMoreKnowledge.push({
          stepNumber: step.stepNumber,
          description: step.description,
          missing: [],
        });
        if (!step.hasKnownInputs) {
          plan.needsMoreKnowledge[plan.needsMoreKnowledge.length - 1].missing.push('Inputs not fully defined');
        }
        if (!step.hasKnownOutputs) {
          plan.needsMoreKnowledge[plan.needsMoreKnowledge.length - 1].missing.push('Outputs not fully defined');
        }
        if (!step.hasExceptionsHandled) {
          plan.needsMoreKnowledge[plan.needsMoreKnowledge.length - 1].missing.push('Exceptions/edge cases not handled');
        }
        if (!step.isStructured) {
          plan.needsMoreKnowledge[plan.needsMoreKnowledge.length - 1].missing.push('Step lacks structured definition');
        }
        plan.summary.needsKnowledgeCapture++;
        break;
      case 'human':
        plan.requiresHumanJudgment.push({
          stepNumber: step.stepNumber,
          description: step.description,
          reason: 'Requires human judgment or physical presence',
        });
        plan.summary.humanRequired++;
        break;
    }
  }

  // Generate recommendations
  if (plan.summary.automatableImmediately > 0) {
    plan.recommendations.push(
      `${plan.summary.automatableImmediately} step(s) can be automated immediately with current information.`
    );
  }

  if (plan.summary.needsKnowledgeCapture > 0) {
    plan.recommendations.push(
      `${plan.summary.needsKnowledgeCapture} step(s) need more knowledge capture before automation is viable. Use interviewWorkflow() to gather missing details.`
    );
  }

  if (plan.summary.humanRequired > 0) {
    plan.recommendations.push(
      `${plan.summary.humanRequired} step(s) require human judgment and should remain human-performed or use a human-in-the-loop approach.`
    );
  }

  // Overall readiness guidance
  if (workflow.ai_readiness >= 7) {
    plan.recommendations.push('Overall AI readiness is high. Consider building an automated workflow prototype.');
  } else if (workflow.ai_readiness >= 4) {
    plan.recommendations.push('Moderate AI readiness. Focus on documenting edge cases and exception handling first.');
  } else {
    plan.recommendations.push('Low AI readiness. Prioritize structured knowledge capture sessions with domain experts.');
  }

  logActivity(workflow.vessel_id, 'automation_plan', `Generated automation plan for workflow: ${workflow.name}`, {
    workflowId,
    automatableCount: plan.summary.automatableImmediately,
    needsKnowledgeCount: plan.summary.needsKnowledgeCapture,
    humanRequiredCount: plan.summary.humanRequired,
  });

  return plan;
}

/**
 * Classifies a single step as automatable, needs more knowledge, or requires human judgment.
 */
function classifyStep(step: any): 'automatable' | 'needs_knowledge' | 'human' {
  // If the step explicitly requires human judgment, it stays human
  if (step.requiresHumanJudgment) {
    return 'human';
  }

  // If the step is structured and has known inputs/outputs and handles exceptions, it's automatable
  const isAutomatable = step.isStructured &&
    step.hasKnownInputs &&
    step.hasKnownOutputs &&
    step.hasExceptionsHandled &&
    step.isRepeatable;

  if (isAutomatable) {
    return 'automatable';
  }

  // If it's structured but missing some info, it needs more knowledge
  if (step.isStructured) {
    return 'needs_knowledge';
  }

  // Otherwise, it needs more knowledge capture
  return 'needs_knowledge';
}

export default { captureWorkflow, interviewWorkflow, getWorkflows, calculateAiReadiness, generateAutomationPlan };
