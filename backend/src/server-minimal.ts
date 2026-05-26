import express from 'express';
const app = express();
const PORT = 3100;
app.get('/api/health', (_req, res) => {
  res.json({ status: 'operational', service: 'Poseidon', version: '1.0.0', timestamp: new Date().toISOString() });
});
app.get('/', (_req, res) => res.send('⚓ Poseidon — Superyacht Crew AI'));
app.listen(PORT, '0.0.0.0', () => console.log(`Listening on 0.0.0.0:${PORT}`));
