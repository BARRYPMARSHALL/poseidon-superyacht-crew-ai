import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cron from 'node-cron';
import { initializeDatabase, getDb } from './database';
import { errorHandler, notFound } from './middleware/auth';
import authRoutes from './routes/auth';
import orgRoutes from './routes/orgs';
import vesselRoutes from './routes/vessels';
import crewRoutes from './routes/crew';
import certRoutes from './routes/certs';
import alertRoutes from './routes/alerts';
import dashboardRoutes from './routes/dashboard';
import complianceRoutes from './routes/compliance';
import financeRoutes from './routes/finance';
import recruitmentRoutes from './routes/recruitment';
import visaRoutes from './routes/visas';
import rotationRoutes from './routes/rotations';
import logRoutes from './routes/logs';
import billingRoutes from './routes/billing';
import growthRoutes from './routes/growth';
import ownerRoutes from './routes/owner';
import publicRoutes from './routes/public';
import osFrameworkRoutes from './routes/os-framework';
import { cerberusScan } from './agents/cerberus';
import { nereusScan } from './agents/nereus';
import { runMarketingCycle } from './agents/marketing';
import query from './database';

// Crash handlers — log errors before exit
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught exception:', err.message, err.stack);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled rejection:', reason);
  process.exit(1);
});

const app = express();
const PORT = parseInt(process.env.PORT || '3100', 10);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
      upgradeInsecureRequests: null, // Disable — we're on HTTP for now
    },
  },
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors());
app.use(compression());

// Capture raw body for Stripe webhook (must be BEFORE express.json)
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }), (req: any, _res, next) => {
  req.rawBody = req.body.toString('utf8');
  next();
});

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Simple health check that works BEFORE DB is ready
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'operational',
    service: 'Poseidon — Superyacht Crew AI',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Lazy-load API routes — only register after DB init
let dbReady = false;

app.use('/api/auth', (req, res, next) => {
  if (!dbReady) { res.status(503).json({ error: 'Starting up, please wait...' }); return; }
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/orgs', (_req, _res, next) => dbReady ? next() : _res.status(503).json({ error: 'Starting up...' }));
app.use('/api/orgs', orgRoutes);
app.use('/api/vessels', (_req, _res, next) => dbReady ? next() : _res.status(503).json({ error: 'Starting up...' }));
app.use('/api/vessels', vesselRoutes);
app.use('/api/crew', (_req, _res, next) => dbReady ? next() : _res.status(503).json({ error: 'Starting up...' }));
app.use('/api/crew', crewRoutes);
app.use('/api/certs', (_req, _res, next) => dbReady ? next() : _res.status(503).json({ error: 'Starting up...' }));
app.use('/api/certs', certRoutes);
app.use('/api/alerts', (_req, _res, next) => dbReady ? next() : _res.status(503).json({ error: 'Starting up...' }));
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', (_req, _res, next) => dbReady ? next() : _res.status(503).json({ error: 'Starting up...' }));
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/compliance', (_req, _res, next) => dbReady ? next() : _res.status(503).json({ error: 'Starting up...' }));
app.use('/api/compliance', complianceRoutes);

// Finance & Payroll (Plutus)
app.use('/api/finance', financeRoutes);

// Recruitment (Mentor)
app.use('/api/recruitment', recruitmentRoutes);

// Visas
app.use('/api/visas', visaRoutes);

// Rotations
app.use('/api/rotations', rotationRoutes);

// Agent Activity Log
app.use('/api/logs', logRoutes);

// Billing (Stripe)
app.use('/api/billing', billingRoutes);

// Public (no auth — SEO, social proof, status)
app.use('/api/public', publicRoutes);

// Growth (outreach, Telegram, ads)
app.use('/api/growth', growthRoutes);

// Owner Dashboard (business metrics)
app.use('/api/owner', ownerRoutes);

// OS Framework (tacit knowledge, sensing, learning, governance)
app.use('/api/os', osFrameworkRoutes);

// Serve frontend
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (req.path.includes('.')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

// Start server FIRST, then init DB
app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚓ Poseidon listening on 0.0.0.0:${PORT}`);
  console.log('Starting database initialization...');
});

// Initialize database asynchronously
async function bootstrap(): Promise<void> {
  try {
    console.log('[Bootstrap] Initializing database...');
    await initializeDatabase();

    console.log('[Bootstrap] DB ready — checking for seed...');
    const vesselCount = query.prepare('SELECT COUNT(*) as count FROM vessels').get() as any;
    if (!vesselCount || vesselCount.count === 0) {
      console.log('[Bootstrap] No vessels found — seeding...');
      const { runSeed } = require('./seed');
      runSeed();
      console.log('[Bootstrap] Seed complete.');
    }

    dbReady = true;
    console.log('[Bootstrap] All API routes now active.');

    // Schedule agents
    cron.schedule('0 */6 * * *', async () => { await cerberusScan(); });
    cron.schedule('0 8 * * *', async () => { await nereusScan(); });
    cron.schedule('0 7 * * *', async () => { await runMarketingCycle(); });

    // Initial scan
    setTimeout(async () => {
      try {
        console.log('[Bootstrap] Running agent scans...');
        await cerberusScan();
        await nereusScan();
        console.log('[Bootstrap] Agent scans complete.');
      } catch (e: any) { console.error('[Bootstrap] Scan error:', e.message); }
    }, 3000);

  } catch (e: any) {
    console.error('[FATAL] Bootstrap failed:', e.message, e.stack);
    // Server stays up — health check works, API returns 503
  }
}

bootstrap();

export default app;
