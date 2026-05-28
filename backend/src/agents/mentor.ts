import db from '../database';
import { generateId } from '../utils/helpers';

// Mentor: Recruitment & Development Agent
// Drafts job descriptions, screens candidates, tracks development

export function draftJobDescription(vesselId: string, position: string, department: string): any {
  const vessel = db.prepare('SELECT * FROM vessels WHERE id = ?').get(vesselId) as any;
  if (!vessel) return null;

  const templates: Record<string, any> = {
    'Captain': {
      requirements: ['Master 3000GT or higher', 'STCW BST + AFT', '10+ years experience', 'ENG1 Medical', 'Yacht-specific experience required'],
      responsibilities: ['Overall command and safety', 'Crew management and training', 'Owner and charter guest relations', 'Budget management', 'MLC 2006 compliance'],
      salary_range: { min: 15000, max: 25000, currency: 'EUR' }
    },
    'Chief Officer': {
      requirements: ['Chief Mate 3000GT', 'STCW BST + AFT', '5+ years experience', 'ENG1 Medical', 'PSCRB certification'],
      responsibilities: ['Deck department management', 'Navigation watchkeeping', 'Safety equipment maintenance', 'Crew training coordination', 'Port clearance and documentation'],
      salary_range: { min: 8000, max: 12000, currency: 'EUR' }
    },
    'Chief Engineer': {
      requirements: ['Chief Engineer 3000kW', 'STCW BST', '8+ years experience', 'ENG1 Medical'],
      responsibilities: ['Engine department management', 'Planned maintenance system', 'Fuel and lubes management', 'Spare parts inventory', 'Classification survey coordination'],
      salary_range: { min: 10000, max: 16000, currency: 'EUR' }
    },
    'Bosun': {
      requirements: ['STCW BST', 'Yachtmaster or equivalent', '3+ years experience', 'ENG1 Medical', 'PDSD certification'],
      responsibilities: ['Deck maintenance supervision', 'Tender and water sports operations', 'Paint and varnish work', 'Line handling and mooring', 'Deck stores management'],
      salary_range: { min: 4000, max: 5500, currency: 'EUR' }
    },
    'Deckhand': {
      requirements: ['STCW BST', 'ENG1 Medical', 'Previous yacht experience preferred'],
      responsibilities: ['Deck maintenance', 'Guest water sports assistance', 'Watchkeeping duties', 'Tender operation', 'General vessel upkeep'],
      salary_range: { min: 2500, max: 3500, currency: 'EUR' }
    },
    'Chief Stewardess': {
      requirements: ['STCW BST', 'ENG1 Medical', '5+ years interior experience', 'PDSD certification', 'Wine/hospitality training preferred'],
      responsibilities: ['Interior department management', 'Guest service standards', 'Linen and provisions inventory', 'Cabin and public area maintenance', 'Laundry management'],
      salary_range: { min: 5500, max: 8500, currency: 'EUR' }
    },
    'Head Chef': {
      requirements: ['STCW BST', 'ENG1 Medical', 'Culinary degree or equivalent', '8+ years experience', 'Proven fine dining track record'],
      responsibilities: ['Menu planning and preparation', 'Provisions ordering and inventory', 'Galley hygiene and HACCP', 'Guest dietary requirements', 'Galley budget management'],
      salary_range: { min: 7000, max: 11000, currency: 'EUR' }
    }
  };

  const template = templates[position] || {
    requirements: ['STCW BST', 'ENG1 Medical', 'Relevant experience'],
    responsibilities: ['Department duties as assigned', 'Compliance with vessel policies'],
    salary_range: { min: 3000, max: 5000, currency: 'EUR' }
  };

  return {
    vessel: vessel.name,
    position,
    department,
    flag_state: vessel.flag_state,
    ...template,
    generated_at: new Date().toISOString()
  };
}

export function screenCV(vesselId: string, position: string, candidates: { name: string; experience: string; certs: string[]; availability: string }[]): any {
  // Simple keyword-based screening
  const positionReqs = draftJobDescription(vesselId, position, 'deck').requirements;

  const results = candidates.map(candidate => {
    const experienceYears = parseInt(candidate.experience) || 0;
    const certsMatch = positionReqs.filter((req: string) =>
      candidate.certs.some(c => c.toLowerCase().includes(req.split(' ')[0].toLowerCase()))
    ).length;
    const score = Math.min(100, Math.round(
      (certsMatch / positionReqs.length * 50) +
      Math.min(experienceYears * 5, 30) +
      (candidate.availability === 'immediate' ? 20 : candidate.availability === '30_days' ? 10 : 0)
    ));

    return {
      name: candidate.name,
      score,
      experience_years: experienceYears,
      certs_match: `${certsMatch}/${positionReqs.length}`,
      availability: candidate.availability,
      recommendation: score >= 70 ? 'Shortlist' : score >= 40 ? 'Consider' : 'Pass'
    };
  });

  results.sort((a, b) => b.score - a.score);

  return {
    position,
    candidates: results,
    shortlisted: results.filter(r => r.recommendation === 'Shortlist').length,
    total: results.length
  };
}

export function generateDevelopmentPlan(crewMemberId: string): any {
  const member = db.prepare('SELECT * FROM crew_members WHERE id = ?').get(crewMemberId) as any;
  if (!member) return null;

  const certs = db.prepare(
    'SELECT * FROM certifications WHERE crew_member_id = ? ORDER BY expiry_date'
  ).all(crewMemberId) as any[];

  const careerPath: Record<string, string[]> = {
    'Deckhand': ['Lead Deckhand', 'Bosun', 'Second Officer', 'Chief Officer', 'Captain'],
    'Lead Deckhand': ['Bosun', 'Second Officer', 'Chief Officer', 'Captain'],
    'Bosun': ['Second Officer', 'Chief Officer', 'Captain'],
    'Second Officer': ['Chief Officer', 'Captain'],
    'Chief Officer': ['Captain'],
    'Captain': ['Fleet Captain', 'Marine Superintendent'],
    'Stewardess': ['Second Stewardess', 'Chief Stewardess', 'Purser'],
    'Second Stewardess': ['Chief Stewardess', 'Purser'],
    'Chief Stewardess': ['Purser', 'Charter Manager'],
    'Sous Chef': ['Head Chef', 'Executive Chef'],
    'Head Chef': ['Executive Chef', 'F&B Manager'],
    'Second Engineer': ['Chief Engineer'],
    'Chief Engineer': ['Fleet Engineer', 'Technical Superintendent'],
    'ETO': ['Senior ETO', 'Chief Engineer']
  };

  const nextRole = (careerPath[member.position] || [])[0] || null;

  // Check missing certs for next role
  const existingCertTypes = new Set(certs.map(c => c.cert_type));
  const missingCerts: string[] = [];

  if (nextRole) {
    // Common certs needed for advancement
    const advancementCerts: Record<string, string[]> = {
      'Chief Officer': ['STCW_AFT', 'STCW_PSCRB', 'CHIEF_MATE'],
      'Captain': ['MASTER_3000', 'STCW_AFT'],
      'Chief Engineer': ['OOW_ENGINEERING'],
      'Bosun': ['PDSD']
    };

    const needed = advancementCerts[nextRole] || [];
    for (const cert of needed) {
      if (!existingCertTypes.has(cert)) {
        missingCerts.push(cert);
      }
    }
  }

  // Training recommendations
  const expiringCerts = certs.filter(c => {
    const daysLeft = Math.ceil((new Date(c.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 90 && daysLeft >= 0;
  });

  return {
    crew_member: `${member.first_name} ${member.last_name}`,
    current_position: member.position,
    next_role: nextRole,
    career_path: careerPath[member.position] || [],
    expiring_certs: expiringCerts.map(c => ({
      cert: c.cert_name,
      expires: c.expiry_date
    })),
    missing_certs_for_promotion: missingCerts,
    recommendations: [
      ...(nextRole ? [`Target: ${nextRole} — start preparing`] : []),
      ...(missingCerts.length ? [`Obtain: ${missingCerts.join(', ')}`] : []),
      ...(expiringCerts.length ? [`Renew: ${expiringCerts.length} cert(s) expiring soon`] : []),
      'Update CV and crew profile quarterly',
      'Complete any outstanding sea service requirements'
    ]
  };
}

export default { draftJobDescription, screenCV, generateDevelopmentPlan };
