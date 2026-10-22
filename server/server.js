require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const connectDB  = require('./config/db');
const seedData   = require('./utils/seedCities');
const { initCronCollector } = require('./jobs/cronCollector');
const cityRoutes = require('./routes/cityRoutes');
const aqiRoutes  = require('./routes/aqiRoutes');

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/cities', cityRoutes);
app.use('/api/aqi',    aqiRoutes);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'UP', timestamp: new Date().toISOString() })
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` })
);

// ── Global error handler ───────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  await seedData();
  initCronCollector();

  app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════');
    console.log(`  AQI Aggregator API  →  http://localhost:${PORT}`);
    console.log(`  Health check        →  http://localhost:${PORT}/api/health`);
    console.log('═══════════════════════════════════════════════');
  });
})();
