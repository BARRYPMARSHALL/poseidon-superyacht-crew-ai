import db from '../database';
import { generateId, daysUntil, formatCurrency } from '../utils/helpers';

// Plutus: Payroll & Financial Agent
// Generates payroll, SEA templates, budget reports

export async function processPayroll(vesselId: string, periodStart: string, periodEnd: string): Promise<any> {
  console.log(`[Plutus] Processing payroll for ${vesselId} (${periodStart} → ${periodEnd})...`);

  const activeCrew = db.prepare(
    "SELECT * FROM crew_members WHERE vessel_id = ? AND status = 'active'"
  ).all(vesselId) as any[];

  const records: any[] = [];
  let totalPayroll = 0;

  for (const crew of activeCrew) {
    const existing = db.prepare(
      "SELECT id FROM payroll_records WHERE crew_member_id = ? AND period_start = ? AND period_end = ?"
    ).get(crew.id, periodStart, periodEnd);

    if (existing) continue;

    const baseSalary = crew.salary || 0;
    // Prorate: salary is monthly, period might be partial
    const daysInPeriod = daysUntil(periodEnd) - daysUntil(periodStart);
    const monthlySalary = baseSalary;
    const netPay = monthlySalary; // Simplified for MVP

    const recordId = generateId();
    db.prepare(`INSERT INTO payroll_records (id, crew_member_id, period_start, period_end, base_salary, net_pay, currency, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`)
      .run(recordId, crew.id, periodStart, periodEnd, baseSalary, netPay, crew.salary_currency || 'EUR');

    records.push({
      crew: `${crew.first_name} ${crew.last_name}`,
      position: crew.position,
      base: baseSalary,
      net: netPay,
      currency: crew.salary_currency || 'EUR'
    });
    totalPayroll += netPay;
  }

  // Log activity
  const logId = generateId();
  db.prepare(`INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, details)
    VALUES (?, ?, 'Plutus', 'payroll_processed', ?, ?)`)
    .run(logId, vesselId,
      `Payroll processed: ${records.length} crew, ${formatCurrency(totalPayroll)} total`,
      JSON.stringify({ period_start: periodStart, period_end: periodEnd, total: totalPayroll, records: records.length }));

  console.log(`[Plutus] Payroll complete: ${records.length} records, ${formatCurrency(totalPayroll)} total`);
  return { records, total: totalPayroll, currency: 'EUR' };
}

export function generateSEATemplate(crewMemberId: string): any {
  const member = db.prepare(
    'SELECT cm.*, v.name as vessel_name, v.flag_state FROM crew_members cm JOIN vessels v ON cm.vessel_id = v.id WHERE cm.id = ?'
  ).get(crewMemberId) as any;
  if (!member) return null;

  const rotation = db.prepare('SELECT * FROM rotations WHERE crew_member_id = ?').get(crewMemberId) as any;

  const template = {
    seafarer: `${member.first_name} ${member.last_name}`,
    position: member.position,
    vessel: member.vessel_name,
    flag_state: member.flag_state,
    monthly_salary: member.salary || 0,
    currency: member.salary_currency || 'EUR',
    rotation: rotation ? `${rotation.days_on} days on / ${rotation.days_off} days off (${rotation.rotation_pattern})` : 'Standard (90/30)',
    leave_days_per_month: rotation ? Math.round((rotation.days_off / (rotation.days_on + rotation.days_off)) * 30) : 10,
    clauses: [
      'Standard MLC 2006 employment terms apply',
      'Repatriation at employer\'s expense upon contract completion',
      'Annual leave accrued at 2.5 days per month of service',
      'Medical insurance provided throughout employment period',
      'Sick leave: full pay for first 30 days, half pay for next 60 days',
      'Notice period: 30 days by either party'
    ],
    generated_at: new Date().toISOString()
  };

  return template;
}

export function generateBudgetReport(vesselId: string): any {
  const vessel = db.prepare('SELECT * FROM vessels WHERE id = ?').get(vesselId) as any;
  if (!vessel) return null;

  const activeCrew = db.prepare(
    "SELECT * FROM crew_members WHERE vessel_id = ? AND status = 'active'"
  ).all(vesselId) as any[];

  const totalMonthlyPayroll = activeCrew.reduce((sum: number, c: any) => sum + (c.salary || 0), 0);
  const paidThisMonth = db.prepare(
    "SELECT SUM(net_pay) as total FROM payroll_records WHERE crew_member_id IN (SELECT id FROM crew_members WHERE vessel_id = ?) AND status = 'paid'"
  ).get(vesselId) as any;

  const byDepartment: Record<string, { count: number; total: number }> = {};
  for (const crew of activeCrew) {
    const dept = crew.department || 'other';
    if (!byDepartment[dept]) byDepartment[dept] = { count: 0, total: 0 };
    byDepartment[dept].count++;
    byDepartment[dept].total += (crew.salary || 0);
  }

  return {
    vessel: vessel.name,
    report_date: new Date().toISOString(),
    crew_count: activeCrew.length,
    monthly_payroll: {
      total: totalMonthlyPayroll,
      by_department: Object.entries(byDepartment).map(([dept, data]) => ({
        department: dept,
        crew: data.count,
        total_salary: data.total
      }))
    },
    paid_this_month: paidThisMonth?.total || 0,
    estimated_annual_crew_cost: totalMonthlyPayroll * 12 * 1.15, // 15% buffer for overtime, bonuses
    currency: 'EUR'
  };
}

export default { processPayroll, generateSEATemplate, generateBudgetReport };
