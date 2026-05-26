import db from '../database';
import { generateId } from '../utils/helpers';

// Hermes: Communication & Reporting Agent
// Generates owner reports, handles crew comms

export async function generateOwnerReport(vesselId: string): Promise<any> {
  const vessel = db.prepare('SELECT * FROM vessels WHERE id = ?').get(vesselId) as any;
  if (!vessel) return null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const monthEnd = now.toISOString().split('T')[0];

  // Crew summary
  const totalCrew = db.prepare('SELECT COUNT(*) as count FROM crew_members WHERE vessel_id = ? AND status = \'active\'').get(vesselId) as any;
  const newJoins = db.prepare('SELECT COUNT(*) as count FROM crew_members WHERE vessel_id = ? AND join_date >= ?').get(vesselId, monthStart) as any;
  const departures = db.prepare('SELECT COUNT(*) as count FROM crew_members WHERE vessel_id = ? AND status = \'offboarded\' AND updated_at >= ?').get(vesselId, monthStart) as any;

  const crewList = db.prepare('SELECT first_name, last_name, position, department FROM crew_members WHERE vessel_id = ? AND status = \'active\' ORDER BY department, position').all(vesselId) as any[];

  // Certification summary
  const expiredCerts = db.prepare(`SELECT COUNT(*) as count FROM certifications c JOIN crew_members cm ON c.crew_member_id = cm.id WHERE cm.vessel_id = ? AND c.expiry_date < date('now') AND cm.status = 'active'`).get(vesselId) as any;
  const renewedCerts = db.prepare(`SELECT COUNT(*) as count FROM certifications WHERE crew_member_id IN (SELECT id FROM crew_members WHERE vessel_id = ?) AND issue_date >= ?`).get(vesselId, monthStart) as any;

  // Payroll summary for the month
  const payroll = db.prepare(`SELECT SUM(net_pay) as total_payroll, currency FROM payroll_records WHERE crew_member_id IN (SELECT id FROM crew_members WHERE vessel_id = ?) AND period_start >= ? AND status = 'paid' GROUP BY currency`).all(vesselId, monthStart) as any[];

  // Recent alerts
  const criticalAlerts = db.prepare('SELECT title, created_at FROM alerts WHERE vessel_id = ? AND severity = \'critical\' AND is_resolved = 0 ORDER BY created_at DESC LIMIT 5').all(vesselId) as any[];
  const warnings = db.prepare('SELECT COUNT(*) as count FROM alerts WHERE vessel_id = ? AND severity = \'warning\' AND is_resolved = 0').get(vesselId) as any;

  // Upcoming needs
  const upcomingExpiries = db.prepare(`SELECT c.cert_name, c.expiry_date, cm.first_name, cm.last_name FROM certifications c JOIN crew_members cm ON c.crew_member_id = cm.id WHERE cm.vessel_id = ? AND c.expiry_date >= date('now') AND c.expiry_date <= date('now', '+30 days') AND cm.status = 'active' ORDER BY c.expiry_date`).all(vesselId) as any[];

  // Generate the report
  const report = {
    vessel: vessel.name,
    flag: vessel.flag_state,
    period: `${monthStart} to ${monthEnd}`,
    generated: now.toISOString(),
    crew: {
      total_active: totalCrew.count,
      new_this_month: newJoins.count,
      departed_this_month: departures.count,
      roster: crewList.map(c => ({ name: `${c.first_name} ${c.last_name}`, position: c.position, department: c.department }))
    },
    certifications: {
      expired: expiredCerts.count,
      renewed_this_month: renewedCerts.count,
      upcoming_expiries_30_days: upcomingExpiries.map(c => ({ cert: c.cert_name, date: c.expiry_date, crew: `${c.first_name} ${c.last_name}` }))
    },
    payroll: payroll.map(p => ({ total: p.total_payroll, currency: p.currency })),
    alerts: {
      critical_open: criticalAlerts.length,
      warnings_open: warnings.count,
      critical_items: criticalAlerts
    },
    recommendations: [] as string[]
  };

  // Auto-generate recommendations
  if (expiredCerts.count > 0) report.recommendations.push(`URGENT: ${expiredCerts.count} certifications have expired. Renew immediately to avoid port state detention.`);
  if (upcomingExpiries.length > 0) report.recommendations.push(`${upcomingExpiries.length} certifications expiring within 30 days. Schedule renewal training now.`);
  if (totalCrew.count < vessel.max_crew * 0.8) report.recommendations.push(`Crew count (${totalCrew.count}) is below 80% of maximum (${vessel.max_crew}). Consider recruitment.`);

  // Save report
  const reportId = generateId();
  db.prepare(`INSERT INTO compliance_reports (id, vessel_id, report_type, report_date, status, findings, recommendations)
    VALUES (?, ?, 'port_state_prep', ?, 'draft', ?, ?)`)
    .run(reportId, vesselId, monthEnd,
      JSON.stringify(report, null, 2),
      JSON.stringify(report.recommendations));

  // Log
  const logId = generateId();
  db.prepare(`INSERT INTO agent_activity_log (id, vessel_id, agent_name, action_type, action_summary, details)
    VALUES (?, ?, 'Hermes', 'owner_report', 'Monthly owner report generated', ?)`)
    .run(logId, vesselId, JSON.stringify({ report_id: reportId }));

  return { report_id: reportId, ...report };
}

export async function generateCrewOnboarding(crewMemberId: string): Promise<any> {
  const member = db.prepare('SELECT cm.*, v.name as vessel_name, v.flag_state FROM crew_members cm JOIN vessels v ON cm.vessel_id = v.id WHERE cm.id = ?').get(crewMemberId) as any;
  if (!member) return null;

  const checklist = [
    { task: 'Sign Seafarer Employment Agreement (SEA)', status: 'pending' },
    { task: 'Submit passport copy and visa documents', status: member.passport_number ? 'complete' : 'pending' },
    { task: 'Upload all STCW certificates', status: 'pending' },
    { task: 'Complete ENG1 medical examination', status: 'pending' },
    { task: 'Set up payroll/bank details', status: member.bank_details ? 'complete' : 'pending' },
    { task: 'Review vessel safety management system (SMS)', status: 'pending' },
    { task: 'Complete familiarization tour', status: 'pending' },
    { task: 'Receive crew handbook and uniform', status: 'pending' },
    { task: 'Emergency contact form submitted', status: member.emergency_contact_name ? 'complete' : 'pending' },
    { task: 'ISPS security awareness briefing', status: 'pending' },
  ];

  return {
    crew_member: `${member.first_name} ${member.last_name}`,
    position: member.position,
    vessel: member.vessel_name,
    flag_state: member.flag_state,
    join_date: member.join_date,
    onboarding_checklist: checklist,
    completed: checklist.filter(c => c.status === 'complete').length,
    total: checklist.length
  };
}

export async function generateCrewOffboarding(crewMemberId: string): Promise<any> {
  const member = db.prepare('SELECT cm.*, v.name as vessel_name FROM crew_members cm JOIN vessels v ON cm.vessel_id = v.id WHERE cm.id = ?').get(crewMemberId) as any;
  if (!member) return null;

  const checklist = [
    { task: 'Return all vessel property (uniforms, keys, equipment)', status: 'pending' },
    { task: 'Final payslip issued', status: 'pending' },
    { task: 'SEA termination notice signed', status: 'pending' },
    { task: 'Exit interview conducted', status: 'pending' },
    { task: 'Certificates/records returned to crew member', status: 'pending' },
    { task: 'Reference letter drafted', status: 'pending' },
    { task: 'Disembarkation travel arranged', status: 'pending' },
    { task: 'Remove from crew list and insurance', status: 'pending' },
    { task: 'Revoke vessel access credentials', status: 'pending' },
    { task: 'Archive crew file', status: 'pending' },
  ];

  return {
    crew_member: `${member.first_name} ${member.last_name}`,
    position: member.position,
    vessel: member.vessel_name,
    contract_end: member.contract_end_date,
    offboarding_checklist: checklist,
    completed: 0,
    total: checklist.length
  };
}

export default { generateOwnerReport, generateCrewOnboarding, generateCrewOffboarding };
