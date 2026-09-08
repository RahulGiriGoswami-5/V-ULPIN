import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import propertiesRouter  from './routes/properties.js';
import governmentRouter  from './routes/government.js';
import analyticsRouter   from './routes/analytics.js';

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => res.json({
  status: 'ok', service: 'V-ULPIN API', version: '1.0.0',
  supabase: !!process.env.SUPABASE_URL,
  timestamp: new Date().toISOString(),
}));

app.use('/api/properties',  propertiesRouter);
app.use('/api/government',  governmentRouter);
app.use('/api/analytics',   analyticsRouter);

app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 V-ULPIN API  →  http://localhost:${PORT}`);
  console.log(`   /api/health`);
  console.log(`   /api/properties`);
  console.log(`   /api/government/properties`);
  console.log(`   /api/analytics/overview`);
  console.log(`   Supabase: ${process.env.SUPABASE_URL ? '✅ Connected' : '⚠️  Mock mode (no .env)'}\n`);
});
