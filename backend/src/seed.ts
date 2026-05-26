// Seed script: Creates a realistic demo vessel with crew, certs, and data
import { initializeDatabase } from './database';
import db from './database';
import { generateId } from './utils/helpers';

initializeDatabase();

console.log('Seeding demo data...');

// Organization
const orgId = generateId();
db.prepare(`INSERT INTO organizations (id, name, type, email, country) VALUES (?, ?, ?, ?, ?)`)
  .run(orgId, 'Poseidon Yacht Management', 'management_company', 'ops@poseidon-yachts.com', 'Australia');

// Vessel — 65m superyacht
const vesselId = generateId();
db.prepare(`INSERT INTO vessels (id, organization_id, name, imo_number, mmsi, flag_state, port_of_registry, length_m, beam_m, draft_m, gross_tonnage, build_year, builder, max_crew, max_guests, current_location)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(vesselId, orgId, 'M/Y OCEAN STAR', 'IMO9876543', '235112233', 'Cayman Islands', 'George Town', 65.0, 11.2, 3.8, 1450, 2022, 'Feadship', 18, 12, 'Monaco, France');

// Seed crew (16 members across all departments)
interface CrewSeed {
  first_name: string; last_name: string; position: string; department: string;
  nationality: string; join_date: string; contract_end_date: string;
  salary: number; salary_currency: string; email: string;
  passport_number: string; passport_expiry: string;
}

const crewData: CrewSeed[] = [
  { first_name: 'James', last_name: 'Mitchell', position: 'Captain', department: 'management', nationality: 'British', join_date: '2024-03-01', contract_end_date: '2027-03-01', salary: 18000, salary_currency: 'EUR', email: 'j.mitchell@oceanstar.yacht', passport_number: 'GB12345678', passport_expiry: '2028-06-15' },
  { first_name: 'Sofia', last_name: 'Andersson', position: 'Chief Officer', department: 'deck', nationality: 'Swedish', join_date: '2024-06-15', contract_end_date: '2026-12-15', salary: 9500, salary_currency: 'EUR', email: 's.andersson@oceanstar.yacht', passport_number: 'SE87654321', passport_expiry: '2029-03-22' },
  { first_name: 'Marco', last_name: 'Rossi', position: 'Second Officer', department: 'deck', nationality: 'Italian', join_date: '2025-01-10', contract_end_date: '2027-01-10', salary: 6200, salary_currency: 'EUR', email: 'm.rossi@oceanstar.yacht', passport_number: 'IT45678901', passport_expiry: '2028-11-05' },
  { first_name: 'Liam', last_name: 'O\'Brien', position: 'Bosun', department: 'deck', nationality: 'Irish', join_date: '2025-03-20', contract_end_date: '2026-09-20', salary: 4800, salary_currency: 'EUR', email: 'l.obrien@oceanstar.yacht', passport_number: 'IE78901234', passport_expiry: '2029-07-18' },
  { first_name: 'Carlos', last_name: 'Santos', position: 'Lead Deckhand', department: 'deck', nationality: 'Spanish', join_date: '2025-08-01', contract_end_date: '2027-02-01', salary: 3500, salary_currency: 'EUR', email: 'c.santos@oceanstar.yacht', passport_number: 'ES34567890', passport_expiry: '2028-04-30' },
  { first_name: 'Kai', last_name: 'Tanaka', position: 'Deckhand', department: 'deck', nationality: 'Japanese', join_date: '2026-01-15', contract_end_date: '2027-07-15', salary: 2800, salary_currency: 'EUR', email: 'k.tanaka@oceanstar.yacht', passport_number: 'JP90123456', passport_expiry: '2030-01-20' },
  { first_name: 'Erik', last_name: 'Johansson', position: 'Chief Engineer', department: 'engineering', nationality: 'Norwegian', join_date: '2024-04-01', contract_end_date: '2027-04-01', salary: 12000, salary_currency: 'EUR', email: 'e.johansson@oceanstar.yacht', passport_number: 'NO56789012', passport_expiry: '2028-09-10' },
  { first_name: 'Dmitri', last_name: 'Volkov', position: 'Second Engineer', department: 'engineering', nationality: 'Russian', join_date: '2025-05-10', contract_end_date: '2027-05-10', salary: 7500, salary_currency: 'EUR', email: 'd.volkov@oceanstar.yacht', passport_number: 'RU23456789', passport_expiry: '2027-02-14' },
  { first_name: 'Yuki', last_name: 'Nakamura', position: 'ETO', department: 'engineering', nationality: 'Japanese', join_date: '2025-09-01', contract_end_date: '2027-03-01', salary: 6500, salary_currency: 'EUR', email: 'y.nakamura@oceanstar.yacht', passport_number: 'JP89012345', passport_expiry: '2029-08-25' },
  { first_name: 'Emily', last_name: 'Chen', position: 'Chief Stewardess', department: 'interior', nationality: 'Australian', join_date: '2025-02-01', contract_end_date: '2027-02-01', salary: 7000, salary_currency: 'EUR', email: 'e.chen@oceanstar.yacht', passport_number: 'AU11223344', passport_expiry: '2029-12-05' },
  { first_name: 'Isabella', last_name: 'Ferrari', position: 'Second Stewardess', department: 'interior', nationality: 'Italian', join_date: '2025-06-15', contract_end_date: '2027-06-15', salary: 4200, salary_currency: 'EUR', email: 'i.ferrari@oceanstar.yacht', passport_number: 'IT99887766', passport_expiry: '2028-05-20' },
  { first_name: 'Sophie', last_name: 'Dubois', position: 'Stewardess', department: 'interior', nationality: 'French', join_date: '2026-02-01', contract_end_date: '2027-08-01', salary: 3200, salary_currency: 'EUR', email: 's.dubois@oceanstar.yacht', passport_number: 'FR55667788', passport_expiry: '2029-10-15' },
  { first_name: 'Pierre', last_name: 'Laurent', position: 'Head Chef', department: 'galley', nationality: 'French', join_date: '2024-09-01', contract_end_date: '2027-03-01', salary: 9000, salary_currency: 'EUR', email: 'p.laurent@oceanstar.yacht', passport_number: 'FR11223344', passport_expiry: '2028-07-30' },
  { first_name: 'Ana', last_name: 'Garcia', position: 'Sous Chef', department: 'galley', nationality: 'Spanish', join_date: '2025-11-01', contract_end_date: '2027-05-01', salary: 5000, salary_currency: 'EUR', email: 'a.garcia@oceanstar.yacht', passport_number: 'ES44556677', passport_expiry: '2029-02-28' },
  { first_name: 'Thomas', last_name: 'Mueller', position: 'Chief Purser', department: 'management', nationality: 'German', join_date: '2025-04-01', contract_end_date: '2027-04-01', salary: 8000, salary_currency: 'EUR', email: 't.mueller@oceanstar.yacht', passport_number: 'DE77889900', passport_expiry: '2028-11-30' },
  { first_name: 'Hannah', last_name: 'Williams', position: 'Deck/Medic', department: 'deck', nationality: 'New Zealand', join_date: '2026-04-01', contract_end_date: '2027-10-01', salary: 4000, salary_currency: 'EUR', email: 'h.williams@oceanstar.yacht', passport_number: 'NZ33445566', passport_expiry: '2030-05-12' },
];

for (const crew of crewData) {
  const crewId = generateId();
  db.prepare(`INSERT INTO crew_members (id, vessel_id, first_name, last_name, email, nationality, position, department, join_date, contract_end_date, salary, salary_currency, passport_number, passport_expiry)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(crewId, vesselId, crew.first_name, crew.last_name, crew.email, crew.nationality,
      crew.position, crew.department, crew.join_date, crew.contract_end_date,
      crew.salary, crew.salary_currency, crew.passport_number, crew.passport_expiry);
}

// Fetch crew IDs for cert seeding
const crewMembers = db.prepare('SELECT id, position, first_name, last_name FROM crew_members WHERE vessel_id = ?').all(vesselId) as any[];

// Certifications for each crew member
interface CertSeed {
  crew_pos: string; cert_type: string; cert_name: string; issuing_authority: string;
  issue_date: string; expiry_date: string;
}

const certTemplates: Record<string, CertSeed[]> = {
  'Captain': [
    { cert_type: 'MASTER_3000', cert_name: 'Master 3000GT', issuing_authority: 'MCA', issue_date: '2023-06-15', expiry_date: '2028-06-15' },
    { cert_type: 'STCW_BST', cert_name: 'STCW Basic Safety Training', issuing_authority: 'MCA', issue_date: '2023-01-10', expiry_date: '2028-01-10' },
    { cert_type: 'STCW_AFT', cert_name: 'STCW Advanced Fire Fighting', issuing_authority: 'MCA', issue_date: '2023-02-20', expiry_date: '2028-02-20' },
    { cert_type: 'STCW_PSCRB', cert_name: 'Proficiency in Survival Craft', issuing_authority: 'MCA', issue_date: '2023-03-15', expiry_date: '2028-03-15' },
    { cert_type: 'STCW_MEDICAL_II', cert_name: 'Medical Care Onboard', issuing_authority: 'MCA', issue_date: '2024-01-20', expiry_date: '2029-01-20' },
    { cert_type: 'GMDSS', cert_name: 'GMDSS General Operator', issuing_authority: 'AMSA', issue_date: '2023-05-10', expiry_date: '2028-05-10' },
    { cert_type: 'ENG1', cert_name: 'ENG1 Medical Certificate', issuing_authority: 'MCA Approved Doctor', issue_date: '2025-03-01', expiry_date: '2026-06-01' },
  ],
  'Chief Officer': [
    { cert_type: 'CHIEF_MATE', cert_name: 'Chief Mate 3000GT', issuing_authority: 'Swedish Transport Agency', issue_date: '2023-08-10', expiry_date: '2028-08-10' },
    { cert_type: 'STCW_BST', cert_name: 'STCW Basic Safety Training', issuing_authority: 'Swedish Transport Agency', issue_date: '2023-03-15', expiry_date: '2028-03-15' },
    { cert_type: 'STCW_AFT', cert_name: 'STCW Advanced Fire Fighting', issuing_authority: 'Warsash Maritime', issue_date: '2023-04-20', expiry_date: '2026-04-20' },
    { cert_type: 'STCW_PSCRB', cert_name: 'Proficiency in Survival Craft', issuing_authority: 'Warsash Maritime', issue_date: '2023-05-10', expiry_date: '2026-05-10' },
    { cert_type: 'STCW_MEDICAL_I', cert_name: 'Medical First Aid', issuing_authority: 'Bluewater Training', issue_date: '2024-02-15', expiry_date: '2026-07-15' },
    { cert_type: 'GMDSS', cert_name: 'GMDSS General Operator', issuing_authority: 'Flying Fish', issue_date: '2023-06-01', expiry_date: '2028-06-01' },
    { cert_type: 'ENG1', cert_name: 'ENG1 Medical Certificate', issuing_authority: 'MCA Approved Doctor', issue_date: '2025-06-01', expiry_date: '2026-08-01' },
  ],
  'Second Officer': [
    { cert_type: 'OOW_DECK', cert_name: 'OOW Deck 3000GT', issuing_authority: 'Italian Coast Guard', issue_date: '2024-02-10', expiry_date: '2029-02-10' },
    { cert_type: 'STCW_BST', cert_name: 'STCW Basic Safety Training', issuing_authority: 'Seascope Maritime', issue_date: '2024-01-05', expiry_date: '2029-01-05' },
    { cert_type: 'STCW_AFT', cert_name: 'STCW Advanced Fire Fighting', issuing_authority: 'Seascope Maritime', issue_date: '2024-02-15', expiry_date: '2026-05-15' },
    { cert_type: 'STCW_PSCRB', cert_name: 'Proficiency in Survival Craft', issuing_authority: 'Seascope Maritime', issue_date: '2024-03-01', expiry_date: '2026-06-01' },
    { cert_type: 'ENG1', cert_name: 'ENG1 Medical Certificate', issuing_authority: 'MCA Approved Doctor', issue_date: '2025-11-01', expiry_date: '2027-01-01' },
  ],
  'Bosun': [
    { cert_type: 'STCW_BST', cert_name: 'STCW Basic Safety Training', issuing_authority: 'Bluewater Training', issue_date: '2024-05-10', expiry_date: '2026-07-10' },
    { cert_type: 'STCW_PSCRB', cert_name: 'Proficiency in Survival Craft', issuing_authority: 'Bluewater Training', issue_date: '2024-06-01', expiry_date: '2026-08-01' },
    { cert_type: 'STCW_FIRST_AID', cert_name: 'STCW Elementary First Aid', issuing_authority: 'Bluewater Training', issue_date: '2024-04-20', expiry_date: '2026-06-20' },
    { cert_type: 'PDSD', cert_name: 'Proficiency in Designated Security Duties', issuing_authority: 'STCW Direct', issue_date: '2025-02-01', expiry_date: '2030-02-01' },
    { cert_type: 'ENG1', cert_name: 'ENG1 Medical Certificate', issuing_authority: 'MCA Approved Doctor', issue_date: '2025-09-01', expiry_date: '2027-09-01' },
  ],
  'Lead Deckhand': [
    { cert_type: 'STCW_BST', cert_name: 'STCW Basic Safety Training', issuing_authority: 'STCW Direct', issue_date: '2025-02-15', expiry_date: '2026-04-15' },
    { cert_type: 'STCW_FIRST_AID', cert_name: 'STCW Elementary First Aid', issuing_authority: 'STCW Direct', issue_date: '2025-01-20', expiry_date: '2026-03-20' },
    { cert_type: 'PDSD', cert_name: 'Proficiency in Designated Security Duties', issuing_authority: 'STCW Direct', issue_date: '2025-03-01', expiry_date: '2030-03-01' },
    { cert_type: 'ENG1', cert_name: 'ENG1 Medical Certificate', issuing_authority: 'MCA Approved Doctor', issue_date: '2025-08-01', expiry_date: '2027-08-01' },
  ],
  'Deckhand': [
    { cert_type: 'STCW_BST', cert_name: 'STCW Basic Safety Training', issuing_authority: 'Maritime Professional Training', issue_date: '2025-06-10', expiry_date: '2026-11-10' },
    { cert_type: 'STCW_FIRST_AID', cert_name: 'STCW Elementary First Aid', issuing_authority: 'Maritime Professional Training', issue_date: '2025-05-20', expiry_date: '2026-10-20' },
    { cert_type: 'ENG1', cert_name: 'ENG1 Medical Certificate', issuing_authority: 'MCA Approved Doctor', issue_date: '2026-01-01', expiry_date: '2028-01-01' },
  ],
  'Chief Engineer': [
    { cert_type: 'OOW_ENGINEERING', cert_name: 'Chief Engineer 3000kW', issuing_authority: 'Norwegian Maritime Authority', issue_date: '2022-09-15', expiry_date: '2027-09-15' },
    { cert_type: 'STCW_BST', cert_name: 'STCW Basic Safety Training', issuing_authority: 'AMC Launceston', issue_date: '2023-03-10', expiry_date: '2028-03-10' },
    { cert_type: 'STCW_AFT', cert_name: 'STCW Advanced Fire Fighting', issuing_authority: 'AMC Launceston', issue_date: '2023-04-15', expiry_date: '2026-08-15' },
    { cert_type: 'STCW_PSCRB', cert_name: 'Proficiency in Survival Craft', issuing_authority: 'AMC Launceston', issue_date: '2023-05-01', expiry_date: '2026-09-01' },
    { cert_type: 'STCW_MEDICAL_I', cert_name: 'Medical First Aid', issuing_authority: 'Bluewater Training', issue_date: '2024-03-10', expiry_date: '2029-03-10' },
    { cert_type: 'ENG1', cert_name: 'ENG1 Medical Certificate', issuing_authority: 'MCA Approved Doctor', issue_date: '2025-04-01', expiry_date: '2027-04-01' },
  ],
  'Second Engineer': [
    { cert_type: 'OOW_ENGINEERING', cert_name: 'Second Engineer 3000kW', issuing_authority: 'Russian Maritime Register', issue_date: '2024-02-10', expiry_date: '2029-02-10' },
    { cert_type: 'STCW_BST', cert_name: 'STCW Basic Safety Training', issuing_authority: 'Warsash Maritime', issue_date: '2024-01-05', expiry_date: '2026-07-05' },
    { cert_type: 'STCW_AFT', cert_name: 'STCW Advanced Fire Fighting', issuing_authority: 'Warsash Maritime', issue_date: '2024-02-20', expiry_date: '2026-04-20' },
    { cert_type: 'ENG1', cert_name: 'ENG1 Medical Certificate', issuing_authority: 'MCA Approved Doctor', issue_date: '2025-05-01', expiry_date: '2027-05-01' },
  ],
  'ETO': [
    { cert_type: 'STCW_BST', cert_name: 'STCW Basic Safety Training', issuing_authority: 'Maritime Professional Training', issue_date: '2025-01-10', expiry_date: '2026-10-10' },
    { cert_type: 'STCW_AFT', cert_name: 'STCW Advanced Fire Fighting', issuing_authority: 'Maritime Professional Training', issue_date: '2025-02-15', expiry_date: '2026-09-15' },
    { cert_type: 'ENG1', cert_name: 'ENG1 Medical Certificate', issuing_authority: 'MCA Approved Doctor', issue_date: '2025-09-01', expiry_date: '2027-09-01' },
  ],
  'Chief Stewardess': [
    { cert_type: 'STCW_BST', cert_name: 'STCW Basic Safety Training', issuing_authority: 'Australian Maritime College', issue_date: '2024-06-10', expiry_date: '2026-06-10' },
    { cert_type: 'STCW_FIRST_AID', cert_name: 'STCW Elementary First Aid', issuing_authority: 'Australian Maritime College', issue_date: '2024-05-20', expiry_date: '2026-05-20' },
    { cert_type: 'PDSD', cert_name: 'Proficiency in Designated Security Duties', issuing_authority: 'RYA Sydney', issue_date: '2024-07-01', expiry_date: '2029-07-01' },
    { cert_type: 'ENG1', cert_name: 'ENG1 Medical Certificate', issuing_authority: 'MCA Approved Doctor', issue_date: '2025-11-01', expiry_date: '2027-11-01' },
  ],
  'Second Stewardess': [
    { cert_type: 'STCW_BST', cert_name: 'STCW Basic Safety Training', issuing_authority: 'Bluewater Training', issue_date: '2025-03-10', expiry_date: '2026-03-10' },
    { cert_type: 'STCW_FIRST_AID', cert_name: 'STCW Elementary First Aid', issuing_authority: 'Bluewater Training', issue_date: '2025-02-20', expiry_date: '2026-02-20' },
    { cert_type: 'ENG1', cert_name: 'ENG1 Medical Certificate', issuing_authority: 'MCA Approved Doctor', issue_date: '2025-11-01', expiry_date: '2027-11-01' },
  ],
  'Stewardess': [
    { cert_type: 'STCW_BST', cert_name: 'STCW Basic Safety Training', issuing_authority: 'Seascope Maritime', issue_date: '2025-08-10', expiry_date: '2027-08-10' },
    { cert_type: 'STCW_FIRST_AID', cert_name: 'STCW Elementary First Aid', issuing_authority: 'Seascope Maritime', issue_date: '2025-07-20', expiry_date: '2027-07-20' },
    { cert_type: 'ENG1', cert_name: 'ENG1 Medical Certificate', issuing_authority: 'MCA Approved Doctor', issue_date: '2025-12-01', expiry_date: '2027-12-01' },
  ],
  'Head Chef': [
    { cert_type: 'STCW_BST', cert_name: 'STCW Basic Safety Training', issuing_authority: 'Bluewater Training', issue_date: '2023-08-10', expiry_date: '2026-08-10' },
    { cert_type: 'STCW_FIRST_AID', cert_name: 'STCW Elementary First Aid', issuing_authority: 'Bluewater Training', issue_date: '2023-07-20', expiry_date: '2026-07-20' },
    { cert_type: 'PDSD', cert_name: 'Proficiency in Designated Security Duties', issuing_authority: 'STCW Direct', issue_date: '2024-01-15', expiry_date: '2029-01-15' },
    { cert_type: 'ENG1', cert_name: 'ENG1 Medical Certificate', issuing_authority: 'MCA Approved Doctor', issue_date: '2025-09-01', expiry_date: '2027-09-01' },
  ],
  'Sous Chef': [
    { cert_type: 'STCW_BST', cert_name: 'STCW Basic Safety Training', issuing_authority: 'STCW Direct', issue_date: '2025-05-10', expiry_date: '2026-09-10' },
    { cert_type: 'STCW_FIRST_AID', cert_name: 'STCW Elementary First Aid', issuing_authority: 'STCW Direct', issue_date: '2025-04-20', expiry_date: '2026-08-20' },
    { cert_type: 'ENG1', cert_name: 'ENG1 Medical Certificate', issuing_authority: 'MCA Approved Doctor', issue_date: '2025-11-01', expiry_date: '2027-11-01' },
  ],
  'Chief Purser': [
    { cert_type: 'STCW_BST', cert_name: 'STCW Basic Safety Training', issuing_authority: 'Warsash Maritime', issue_date: '2024-04-10', expiry_date: '2026-06-10' },
    { cert_type: 'STCW_FIRST_AID', cert_name: 'STCW Elementary First Aid', issuing_authority: 'Warsash Maritime', issue_date: '2024-03-20', expiry_date: '2026-05-20' },
    { cert_type: 'PDSD', cert_name: 'Proficiency in Designated Security Duties', issuing_authority: 'Flying Fish', issue_date: '2024-05-01', expiry_date: '2029-05-01' },
    { cert_type: 'ENG1', cert_name: 'ENG1 Medical Certificate', issuing_authority: 'MCA Approved Doctor', issue_date: '2025-10-01', expiry_date: '2027-10-01' },
  ],
  'Deck/Medic': [
    { cert_type: 'STCW_BST', cert_name: 'STCW Basic Safety Training', issuing_authority: 'Maritime Professional Training', issue_date: '2025-08-10', expiry_date: '2026-09-10' },
    { cert_type: 'STCW_MEDICAL_I', cert_name: 'Medical First Aid', issuing_authority: 'Maritime Professional Training', issue_date: '2025-09-01', expiry_date: '2026-10-01' },
    { cert_type: 'STCW_MEDICAL_II', cert_name: 'Medical Care Onboard', issuing_authority: 'Maritime Professional Training', issue_date: '2025-10-01', expiry_date: '2026-11-01' },
    { cert_type: 'ENG1', cert_name: 'ENG1 Medical Certificate', issuing_authority: 'MCA Approved Doctor', issue_date: '2026-04-01', expiry_date: '2028-04-01' },
  ],
};

for (const member of crewMembers) {
  const templates = certTemplates[member.position] || certTemplates['Deckhand'];
  for (const ct of templates) {
    const certId = generateId();
    db.prepare(`INSERT INTO certifications (id, crew_member_id, cert_type, cert_name, issuing_authority, issue_date, expiry_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(certId, member.id, ct.cert_type, ct.cert_name, ct.issuing_authority, ct.issue_date, ct.expiry_date);
  }
}

// Add rotations for all crew
for (const member of crewMembers) {
  const rotId = generateId();
  const pattern = member.position === 'Captain' ? '2:2' : '3:1';
  const daysOn = member.position === 'Captain' ? 60 : 90;
  const daysOff = member.position === 'Captain' ? 60 : 30;
  db.prepare(`INSERT INTO rotations (id, crew_member_id, rotation_pattern, days_on, days_off)
    VALUES (?, ?, ?, ?, ?)`)
    .run(rotId, member.id, pattern, daysOn, daysOff);
}

// Add a demo user
const userId = generateId();
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('captain123', 12);
const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
db.prepare(`INSERT INTO users (id, organization_id, email, password_hash, name, role, vessel_ids, trial_ends_at, subscription_tier)
  VALUES (?, ?, ?, ?, ?, 'captain', ?, ?, 'captain')`)
  .run(userId, orgId, 'captain@oceanstar.yacht', hash, 'James Mitchell', JSON.stringify([vesselId]), trialEnd);

console.log('✅ Demo data seeded successfully!');
console.log(`   Organization: ${orgId}`);
console.log(`   Vessel ID: ${vesselId}`);
console.log(`   Vessel: M/Y OCEAN STAR (65m Feadship, Cayman Islands)`);
console.log(`   Crew: ${crewData.length} members`);
console.log(`   Login: captain@oceanstar.yacht / captain123`);
console.log(`   API: http://localhost:3100`);
console.log(`   Health: http://localhost:3100/api/health`);

process.exit(0);
