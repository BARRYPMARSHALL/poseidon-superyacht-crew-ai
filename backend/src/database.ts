import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/poseidon.db';

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase(): void {
  db.exec(`
    -- Organizations (management companies or individual owners)
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('management_company', 'private_owner', 'charter_operator')),
      email TEXT,
      phone TEXT,
      country TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Vessels (superyachts)
    CREATE TABLE IF NOT EXISTS vessels (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      imo_number TEXT,
      mmsi TEXT,
      flag_state TEXT NOT NULL,
      port_of_registry TEXT,
      length_m REAL NOT NULL,
      beam_m REAL,
      draft_m REAL,
      gross_tonnage REAL,
      build_year INTEGER,
      builder TEXT,
      hull_material TEXT,
      max_crew INTEGER DEFAULT 10,
      max_guests INTEGER DEFAULT 8,
      current_location TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'maintenance', 'laid_up', 'in_build')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Crew members
    CREATE TABLE IF NOT EXISTS crew_members (
      id TEXT PRIMARY KEY,
      vessel_id TEXT NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      nationality TEXT,
      date_of_birth TEXT,
      position TEXT NOT NULL,
      department TEXT CHECK(department IN ('deck', 'engineering', 'interior', 'galley', 'medical', 'management')),
      join_date TEXT,
      contract_end_date TEXT,
      salary REAL,
      salary_currency TEXT DEFAULT 'EUR',
      bank_details TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      next_of_kin TEXT,
      passport_number TEXT,
      passport_expiry TEXT,
      passport_country TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'on_leave', 'offboarded', 'pending')),
      photo_url TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Certifications (STCW, flag state, medical, etc.)
    CREATE TABLE IF NOT EXISTS certifications (
      id TEXT PRIMARY KEY,
      crew_member_id TEXT NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
      cert_type TEXT NOT NULL,
      cert_name TEXT NOT NULL,
      cert_number TEXT,
      issuing_authority TEXT NOT NULL,
      flag_state TEXT,
      issue_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      revalidation_required INTEGER DEFAULT 1,
      revalidation_window_days INTEGER DEFAULT 90,
      digital_copy_url TEXT,
      status TEXT DEFAULT 'valid' CHECK(status IN ('valid', 'expiring_soon', 'expired', 'pending_renewal')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Cert dependencies (e.g., BST required for Advanced Fire Fighting)
    CREATE TABLE IF NOT EXISTS cert_dependencies (
      id TEXT PRIMARY KEY,
      parent_cert_type TEXT NOT NULL,
      child_cert_type TEXT NOT NULL,
      UNIQUE(parent_cert_type, child_cert_type)
    );

    -- Visas
    CREATE TABLE IF NOT EXISTS visas (
      id TEXT PRIMARY KEY,
      crew_member_id TEXT NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
      visa_type TEXT NOT NULL,
      visa_number TEXT,
      issuing_country TEXT NOT NULL,
      issue_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      days_used INTEGER DEFAULT 0,
      days_remaining INTEGER,
      schengen_zone INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Rotation schedules
    CREATE TABLE IF NOT EXISTS rotations (
      id TEXT PRIMARY KEY,
      crew_member_id TEXT NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
      rotation_pattern TEXT NOT NULL, -- e.g., '3:1', '2:2', '10:10'
      days_on INTEGER NOT NULL,
      days_off INTEGER NOT NULL,
      current_tour_start TEXT,
      current_tour_end TEXT,
      next_tour_start TEXT,
      handover_notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Payroll records
    CREATE TABLE IF NOT EXISTS payroll_records (
      id TEXT PRIMARY KEY,
      crew_member_id TEXT NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      base_salary REAL NOT NULL,
      overtime_hours REAL DEFAULT 0,
      overtime_rate REAL,
      bonuses REAL DEFAULT 0,
      deductions REAL DEFAULT 0,
      tax_withheld REAL DEFAULT 0,
      net_pay REAL NOT NULL,
      currency TEXT DEFAULT 'EUR',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'cancelled')),
      paid_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- SEA (Seafarer Employment Agreement) templates and records
    CREATE TABLE IF NOT EXISTS sea_agreements (
      id TEXT PRIMARY KEY,
      crew_member_id TEXT NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
      agreement_date TEXT NOT NULL,
      flag_state TEXT NOT NULL,
      position TEXT NOT NULL,
      salary REAL NOT NULL,
      salary_currency TEXT DEFAULT 'EUR',
      leave_days INTEGER DEFAULT 30,
      rotation_pattern TEXT,
      terms_summary TEXT,
      signed_url TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'terminated')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Agent activity log (everything the AI does)
    CREATE TABLE IF NOT EXISTS agent_activity_log (
      id TEXT PRIMARY KEY,
      vessel_id TEXT NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
      agent_name TEXT NOT NULL,
      action_type TEXT NOT NULL,
      action_summary TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'completed' CHECK(status IN ('pending_approval', 'completed', 'failed', 'cancelled')),
      requires_approval INTEGER DEFAULT 0,
      approved_by TEXT,
      approved_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Compliance reports
    CREATE TABLE IF NOT EXISTS compliance_reports (
      id TEXT PRIMARY KEY,
      vessel_id TEXT NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
      report_type TEXT NOT NULL CHECK(report_type IN ('mlc_2006', 'ism', 'stcw_audit', 'flag_state', 'port_state_prep')),
      report_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('draft', 'final', 'submitted')),
      findings TEXT,
      recommendations TEXT,
      report_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Training providers
    CREATE TABLE IF NOT EXISTS training_providers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      country TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      courses_offered TEXT NOT NULL, -- JSON array of cert types
      website TEXT,
      email TEXT,
      phone TEXT,
      rating REAL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Alerts/Notifications
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      vessel_id TEXT NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
      crew_member_id TEXT REFERENCES crew_members(id) ON DELETE SET NULL,
      alert_type TEXT NOT NULL CHECK(alert_type IN ('cert_expiry', 'visa_expiry', 'passport_expiry', 'rotation_due', 'contract_end', 'compliance_due', 'budget_alert', 'custom')),
      severity TEXT NOT NULL DEFAULT 'info' CHECK(severity IN ('critical', 'warning', 'info')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      is_resolved INTEGER DEFAULT 0,
      resolved_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Users (dashboard access)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      organization_id TEXT REFERENCES organizations(id) ON DELETE SET NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'captain', 'officer', 'owner', 'crew', 'readonly')),
      vessel_ids TEXT, -- JSON array, null = all org vessels
      last_login TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_crew_vessel ON crew_members(vessel_id);
    CREATE INDEX IF NOT EXISTS idx_certs_crew ON certifications(crew_member_id);
    CREATE INDEX IF NOT EXISTS idx_certs_expiry ON certifications(expiry_date);
    CREATE INDEX IF NOT EXISTS idx_certs_status ON certifications(status);
    CREATE INDEX IF NOT EXISTS idx_visas_crew ON visas(crew_member_id);
    CREATE INDEX IF NOT EXISTS idx_visas_expiry ON visas(expiry_date);
    CREATE INDEX IF NOT EXISTS idx_rotations_crew ON rotations(crew_member_id);
    CREATE INDEX IF NOT EXISTS idx_payroll_crew ON payroll_records(crew_member_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_vessel ON alerts(vessel_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_unread ON alerts(is_read) WHERE is_read = 0;
    CREATE INDEX IF NOT EXISTS idx_agent_log_vessel ON agent_activity_log(vessel_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    -- Default cert dependencies
    INSERT OR IGNORE INTO cert_dependencies (id, parent_cert_type, child_cert_type) VALUES
      ('dep1', 'STCW_BST', 'STCW_PSSR'),
      ('dep2', 'STCW_BST', 'STCW_PST'),
      ('dep3', 'STCW_BST', 'STCW_FIRE_PREVENTION'),
      ('dep4', 'STCW_BST', 'STCW_FIRST_AID'),
      ('dep5', 'STCW_BST', 'STCW_PSA'),
      ('dep6', 'STCW_AFT', 'STCW_ADV_FIRE'),
      ('dep7', 'STCW_PSCRB', 'STCW_FAST_RESCUE'),
      ('dep8', 'STCW_MEDICAL_I', 'STCW_MEDICAL_II'),
      ('dep9', 'OOW_DECK', 'CHIEF_MATE'),
      ('dep10', 'CHIEF_MATE', 'MASTER_3000'),
      ('dep11', 'MASTER_3000', 'MASTER_UNLIMITED');

    -- Seed training providers
    INSERT OR IGNORE INTO training_providers (id, name, location, country, latitude, longitude, courses_offered, website, email, rating) VALUES
      ('tp1', 'Warsash Maritime School', 'Southampton', 'UK', 50.8933, -1.3203, '["STCW_BST","STCW_AFT","STCW_PSCRB","STCW_MEDICAL_I","STCW_MEDICAL_II","OOW_DECK","CHIEF_MATE","MASTER_3000","GMDSS"]', 'https://warsash.solent.ac.uk', 'warsash@solent.ac.uk', 4.5),
      ('tp2', 'Bluewater Training', 'Antibes', 'France', 43.5805, 7.1210, '["STCW_BST","STCW_AFT","STCW_PSCRB","STCW_FIRST_AID","STCW_MEDICAL_I","ENG1","PDSD"]', 'https://bluewateryachting.com', 'training@bluewateryachting.com', 4.7),
      ('tp3', 'Maritime Professional Training', 'Fort Lauderdale', 'USA', 26.1224, -80.1276, '["STCW_BST","STCW_AFT","STCW_PSCRB","OOW_DECK","CHIEF_MATE","MASTER_3000","GMDSS","STCW_MEDICAL_I"]', 'https://mptusa.com', 'info@mptusa.com', 4.6),
      ('tp4', 'Australian Maritime College', 'Launceston', 'Australia', -41.3518, 147.1250, '["STCW_BST","STCW_AFT","STCW_PSCRB","OOW_DECK","CHIEF_MATE","MASTER_3000","GMDSS","ENG1_EQUIVALENT"]', 'https://amc.edu.au', 'amc@utas.edu.au', 4.4),
      ('tp5', 'STCW Direct', 'Palma de Mallorca', 'Spain', 39.5696, 2.6502, '["STCW_BST","STCW_AFT","STCW_PSCRB","STCW_FIRST_AID","STCW_MEDICAL_I","PDSD","ENG1"]', 'https://stcwdirect.com', 'info@stcwdirect.com', 4.3),
      ('tp6', 'Flying Fish', 'Cowes', 'UK', 50.7628, -1.3049, '["STCW_BST","STCW_PSCRB","STCW_FIRST_AID","PDSD","RYA_YACHTMASTER"]', 'https://flyingfishonline.com', 'info@flyingfishonline.com', 4.2),
      ('tp7', 'Seascope Maritime Training', 'Nice', 'France', 43.7102, 7.2620, '["STCW_BST","STCW_AFT","STCW_MEDICAL_I","STCW_MEDICAL_II","GMDSS","OOW_ENGINEERING"]', 'https://seascope.fr', 'contact@seascope.fr', 4.1),
      ('tp8', 'RYA Training Centre - Sydney', 'Sydney', 'Australia', -33.8555, 151.2135, '["STCW_BST","STCW_PSCRB","STCW_FIRST_AID","RYA_YACHTMASTER","PDSD"]', 'https://rya.org.au', 'training@rya.org.au', 4.0);
  `);

  console.log('Database initialized successfully');
}

export default db;
