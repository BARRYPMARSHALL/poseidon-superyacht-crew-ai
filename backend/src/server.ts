import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cron from 'node-cron';
import { initializeDatabase } from './database';
import { errorHandler, notFound } from './middleware/auth';
import authRoutes from './routes/auth';
import orgRoutes from './routes/orgs';
import vesselRoutes from './routes/vessels';
import crewRoutes from './routes/crew';
import certRoutes from './routes/certs';
import alertRoutes from './routes/alerts';
import dashboardRoutes from './routes/dashboard';
import complianceRoutes from './routes/compliance';
import { cerberusScan } from './agents/cerberus';
import { nereusScan } from './agents/nereus';
import db from './database';
import { generateId } from './utils/helpers';

const app = express();
const PORT = parseInt(process.env.POSEIDON_PORT || '3100');

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/vessels', vesselRoutes);
app.use('/api/crew', crewRoutes);
app.use('/api/certs', certRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/compliance', complianceRoutes);

// Agent API endpoints
app.get('/api/agents/cerberus/scan', async (_req, res) => {
  try {
    const result = await cerberusScan();
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/agents/nereus/scan', async (_req, res) => {
  try {
    const result = await nereusScan();
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/agents/cerberus/renewal-plan/:crewId', (req, res) => {
  const { generateRenewalPlan } = require('./agents/cerberus');
  try {
    const plan = generateRenewalPlan(req.params.crewId);
    res.json(plan || { error: 'Crew member not found' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/agents/nereus/rotation-plan/:vesselId', (req, res) => {
  const { getRotationPlan } = require('./agents/nereus');
  try {
    const plan = getRotationPlan(req.params.vesselId);
    res.json(plan);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/agents/hermes/owner-report/:vesselId', async (req, res) => {
  const { generateOwnerReport } = require('./agents/hermes');
  try {
    const report = await generateOwnerReport(req.params.vesselId);
    res.json(report);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/agents/hermes/onboarding/:crewId', async (req, res) => {
  const { generateCrewOnboarding } = require('./agents/hermes');
  try {
    const result = await generateCrewOnboarding(req.params.crewId);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/agents/hermes/offboarding/:crewId', async (req, res) => {
  const { generateCrewOffboarding } = require('./agents/hermes');
  try {
    const result = await generateCrewOffboarding(req.params.crewId);
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Serve frontend in production
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'operational',
    service: 'Poseidon — Superyacht Crew AI',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    agents: ['Cerberus', 'Nereus', 'Plutus', 'Hermes', 'Mentor']
  });
});

// SPA fallback — serve index.html for any non-API route (Express 5 compatible)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (req.path.includes('.')) return next(); // static files
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Initialize database and check if seed needed
initializeDatabase();

// Auto-seed if no vessels exist (first deploy on Railway / fresh DB)
const vesselCount = db.prepare('SELECT COUNT(*) as count FROM vessels').get() as any;
if (vesselCount.count === 0) {
  console.log('[Init] No vessels found — running seed...');
  const { runSeed } = require('./seed');
  runSeed(db, generateId);
  console.log('[Init] Seed complete.');
}

// Schedule agents
// Cerberus: Every 6 hours (cert scanning)
cron.schedule('0 */6 * * *', async () => {
  console.log('[Scheduler] Running Cerberus scan...');
  await cerberusScan();
});

// Nereus: Daily at 8am (rotation checks)
cron.schedule('0 8 * * *', async () => {
  console.log('[Scheduler] Running Nereus scan...');
  await nereusScan();
});

// Hermes: Monthly owner report on 1st of each month
cron.schedule('0 9 1 * *', async () => {
  console.log('[Scheduler] Generating monthly owner reports...');
  const { generateOwnerReport } = require('./agents/hermes');
  const vessels = require('./database').default.prepare('SELECT id FROM vessels WHERE status = \'active\'').all() as any[];
  for (const v of vessels) {
    await generateOwnerReport(v.id);
  }
});

// Wrap startup in try/catch for Railway debugging
async function start(): Promise<void> {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚓ Poseidon running on 0.0.0.0:${PORT}`);
    console.log(`   DB path: ${process.env.DATABASE_PATH || 'default'}`);
    console.log(`   Agents: Cerberus (every 6h), Nereus (daily 8am), Hermes (monthly 1st)`);
    console.log(`   Health: :${PORT}/api/health`);

    // Run initial scans on startup
    setTimeout(async () => {
      try {
        console.log('[Startup] Running initial agent scans...');
        await cerberusScan();
        await nereusScan();
        console.log('[Startup] Initial scans complete.');
      } catch (e: any) {
        console.error('[Startup] Agent scan error:', e.message);
      }
    }, 3000);
  });
}

start().catch(e => {
  console.error('[FATAL] Server startup failed:', e.message, e.stack);
  process.exit(1);
});

export default app;

