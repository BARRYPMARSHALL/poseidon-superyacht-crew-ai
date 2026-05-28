import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'poseidon.db');
const WASM_PATH = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');

let db: any;

function saveDb(): void {
  try {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch {}
}

export function getDb(): any {
  if (!db) throw new Error('Database not initialized');
  return db;
}

async function initDb(): Promise<any> {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const config: any = {};
  if (fs.existsSync(WASM_PATH)) {
    config.wasmBinary = fs.readFileSync(WASM_PATH);
  } else {
    config.locateFile = (file: string) => path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file);
  }

  const SQL = await initSqlJs(config);

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    return new SQL.Database(fileBuffer);
  }
  return new SQL.Database();
}

export async function initializeDatabase(): Promise<void> {
  db = await initDb();

  db.run('PRAGMA journal_mode=WAL');
  db.run('PRAGMA foreign_keys=ON');

  const tables = [
    `CREATE TABLE IF NOT EXISTS organizations (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, email TEXT, phone TEXT, country TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS vessels (id TEXT PRIMARY KEY, organization_id TEXT NOT NULL, name TEXT NOT NULL, imo_number TEXT, mmsi TEXT, flag_state TEXT NOT NULL, port_of_registry TEXT, length_m REAL NOT NULL, beam_m REAL, draft_m REAL, gross_tonnage REAL, build_year INTEGER, builder TEXT, max_crew INTEGER DEFAULT 10, max_guests INTEGER DEFAULT 8, current_location TEXT, status TEXT DEFAULT 'active', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS crew_members (id TEXT PRIMARY KEY, vessel_id TEXT NOT NULL, first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT, phone TEXT, nationality TEXT, date_of_birth TEXT, position TEXT NOT NULL, department TEXT, join_date TEXT, contract_end_date TEXT, salary REAL, salary_currency TEXT DEFAULT 'EUR', bank_details TEXT, emergency_contact_name TEXT, emergency_contact_phone TEXT, next_of_kin TEXT, passport_number TEXT, passport_expiry TEXT, passport_country TEXT, status TEXT DEFAULT 'active', photo_url TEXT, notes TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS certifications (id TEXT PRIMARY KEY, crew_member_id TEXT NOT NULL, cert_type TEXT NOT NULL, cert_name TEXT NOT NULL, cert_number TEXT, issuing_authority TEXT NOT NULL, flag_state TEXT, issue_date TEXT NOT NULL, expiry_date TEXT NOT NULL, revalidation_required INTEGER DEFAULT 1, revalidation_window_days INTEGER DEFAULT 90, digital_copy_url TEXT, status TEXT DEFAULT 'valid', notes TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS cert_dependencies (id TEXT PRIMARY KEY, parent_cert_type TEXT NOT NULL, child_cert_type TEXT NOT NULL, UNIQUE(parent_cert_type, child_cert_type))`,
    `CREATE TABLE IF NOT EXISTS visas (id TEXT PRIMARY KEY, crew_member_id TEXT NOT NULL, visa_type TEXT NOT NULL, visa_number TEXT, issuing_country TEXT NOT NULL, issue_date TEXT NOT NULL, expiry_date TEXT NOT NULL, days_used INTEGER DEFAULT 0, days_remaining INTEGER, schengen_zone INTEGER DEFAULT 0, notes TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS rotations (id TEXT PRIMARY KEY, crew_member_id TEXT NOT NULL, rotation_pattern TEXT NOT NULL, days_on INTEGER NOT NULL, days_off INTEGER NOT NULL, current_tour_start TEXT, current_tour_end TEXT, next_tour_start TEXT, handover_notes TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS payroll_records (id TEXT PRIMARY KEY, crew_member_id TEXT NOT NULL, period_start TEXT NOT NULL, period_end TEXT NOT NULL, base_salary REAL NOT NULL, overtime_hours REAL DEFAULT 0, overtime_rate REAL, bonuses REAL DEFAULT 0, deductions REAL DEFAULT 0, tax_withheld REAL DEFAULT 0, net_pay REAL NOT NULL, currency TEXT DEFAULT 'EUR', status TEXT DEFAULT 'pending', paid_date TEXT, notes TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS sea_agreements (id TEXT PRIMARY KEY, crew_member_id TEXT NOT NULL, agreement_date TEXT NOT NULL, flag_state TEXT NOT NULL, position TEXT NOT NULL, salary REAL NOT NULL, salary_currency TEXT DEFAULT 'EUR', leave_days INTEGER DEFAULT 30, rotation_pattern TEXT, terms_summary TEXT, signed_url TEXT, status TEXT DEFAULT 'active', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS agent_activity_log (id TEXT PRIMARY KEY, vessel_id TEXT NOT NULL, agent_name TEXT NOT NULL, action_type TEXT NOT NULL, action_summary TEXT NOT NULL, details TEXT, status TEXT DEFAULT 'completed', requires_approval INTEGER DEFAULT 0, approved_by TEXT, approved_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS compliance_reports (id TEXT PRIMARY KEY, vessel_id TEXT NOT NULL, report_type TEXT NOT NULL, report_date TEXT NOT NULL, status TEXT NOT NULL, findings TEXT, recommendations TEXT, report_url TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS training_providers (id TEXT PRIMARY KEY, name TEXT NOT NULL, location TEXT NOT NULL, country TEXT NOT NULL, latitude REAL, longitude REAL, courses_offered TEXT NOT NULL, website TEXT, email TEXT, phone TEXT, rating REAL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS alerts (id TEXT PRIMARY KEY, vessel_id TEXT NOT NULL, crew_member_id TEXT, alert_type TEXT NOT NULL, severity TEXT NOT NULL DEFAULT 'info', title TEXT NOT NULL, message TEXT NOT NULL, is_read INTEGER DEFAULT 0, is_resolved INTEGER DEFAULT 0, resolved_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')))`,
    `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, organization_id TEXT, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL, vessel_ids TEXT, trial_ends_at TEXT, subscription_tier TEXT DEFAULT 'skipper', last_login TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')))`,
  ];
  for (const t of tables) db.run(t);

  // Seed cert dependencies
  const depCheck = db.exec('SELECT COUNT(*) FROM cert_dependencies');
  if (!depCheck.length || (depCheck[0]?.values?.[0]?.[0] as number) === 0) {
    const deps = [
      ['dep1','STCW_BST','STCW_PSSR'],['dep2','STCW_BST','STCW_PST'],
      ['dep3','STCW_BST','STCW_FIRE_PREVENTION'],['dep4','STCW_BST','STCW_FIRST_AID'],
      ['dep5','STCW_BST','STCW_PSA'],['dep6','STCW_AFT','STCW_ADV_FIRE'],
      ['dep7','STCW_PSCRB','STCW_FAST_RESCUE'],['dep8','STCW_MEDICAL_I','STCW_MEDICAL_II'],
      ['dep9','OOW_DECK','CHIEF_MATE'],['dep10','CHIEF_MATE','MASTER_3000'],
      ['dep11','MASTER_3000','MASTER_UNLIMITED'],
    ];
    for (const d of deps) db.run('INSERT INTO cert_dependencies (id,parent_cert_type,child_cert_type) VALUES (?,?,?)', d);
  }

  // Seed providers
  const tpCheck = db.exec('SELECT COUNT(*) FROM training_providers');
  if (!tpCheck.length || (tpCheck[0]?.values?.[0]?.[0] as number) === 0) {
    const providers = [
      ['tp1','Warsash Maritime School','Southampton','UK',50.8933,-1.3203,'["STCW_BST","STCW_AFT","GMDSS"]','https://warsash.solent.ac.uk','warsash@solent.ac.uk',4.5],
      ['tp2','Bluewater Training','Antibes','France',43.5805,7.1210,'["STCW_BST","STCW_AFT","PDSD","ENG1"]','https://bluewateryachting.com','training@bluewateryachting.com',4.7],
      ['tp3','Maritime Professional Training','Fort Lauderdale','USA',26.1224,-80.1276,'["STCW_BST","STCW_AFT","GMDSS"]','https://mptusa.com','info@mptusa.com',4.6],
      ['tp4','Australian Maritime College','Launceston','Australia',-41.3518,147.1250,'["STCW_BST","STCW_AFT","GMDSS"]','https://amc.edu.au','amc@utas.edu.au',4.4],
    ];
    for (const p of providers) db.run('INSERT INTO training_providers (id,name,location,country,latitude,longitude,courses_offered,website,email,rating) VALUES (?,?,?,?,?,?,?,?,?,?)', p);
  }

  saveDb();
  console.log('[DB] Initialized successfully');
}

// =========== Wrapper ===========

function rowToObject(stmt: any): any {
  const cols = stmt.getColumnNames();
  const vals = stmt.get();
  const obj: any = {};
  cols.forEach((c: string, i: number) => obj[c] = vals[i]);
  return obj;
}

const query = {
  prepare: (sql: string) => ({
    run: (...params: any[]) => {
      const d = getDb();
      d.run(sql, params.length ? params : undefined);
      saveDb();
      return { changes: d.getRowsModified() };
    },
    get: (...params: any[]) => {
      const d = getDb();
      const stmt = d.prepare(sql);
      if (params.length) stmt.bind(params);
      if (stmt.step()) { const obj = rowToObject(stmt); stmt.free(); return obj; }
      stmt.free();
      return undefined;
    },
    all: (...params: any[]) => {
      const d = getDb();
      const results: any[] = [];
      const stmt = d.prepare(sql);
      if (params.length) stmt.bind(params);
      while (stmt.step()) results.push(rowToObject(stmt));
      stmt.free();
      return results;
    },
  }),
  run: (sql: string, params?: any[]) => {
    const d = getDb();
    if (params) d.run(sql, params); else d.run(sql);
    saveDb();
    return { changes: d.getRowsModified() };
  },
};

export default query;
