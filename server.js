const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const NansenClient = require('./services/nansenClient');
const ShredderEngine = require('./services/shredderEngine');
const { PRESET_THESES } = require('./services/mockData');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Nansen Client and Shredder Engine
const nansenClient = new NansenClient(process.env.NANSEN_API_KEY || '');
const shredder = new ShredderEngine(nansenClient);

/**
 * Health & Config Status
 */
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    name: 'Thesis Shredder',
    hackathon: 'Nansen Meridian Buildathon 2026',
    hasEnvApiKey: Boolean(process.env.NANSEN_API_KEY),
    callsLoggedSession: nansenClient.getCallCount(),
    targetDeadline: '2026-09-27T23:59:59Z'
  });
});

/**
 * Get Available Preset Theses (Instant Offline Demos)
 */
app.get('/api/presets', (req, res) => {
  res.json({
    presets: PRESET_THESES.map(p => ({
      id: p.id,
      title: p.title,
      token: p.token,
      chain: p.chain,
      userThesis: p.userThesis
    }))
  });
});

/**
 * Interrogate User Thesis
 */
app.post('/api/interrogate', async (req, res) => {
  try {
    const {
      thesisText = '',
      tokenSymbol = '',
      tokenAddress = '',
      chain = 'solana',
      customApiKey = null,
      presetId = null
    } = req.body;

    if (!thesisText && !presetId) {
      return res.status(400).json({ error: 'Thesis text or presetId is required.' });
    }

    const report = await shredder.interrogateThesis({
      thesisText,
      tokenSymbol,
      tokenAddress,
      chain,
      customApiKey: customApiKey || req.headers['x-nansen-api-key'],
      presetId
    });

    res.json(report);
  } catch (err) {
    console.error('Interrogation error:', err);
    res.status(500).json({
      error: 'Interrogation failure',
      details: err.message
    });
  }
});

/**
 * Harvester Trigger Simulation (for demoing 1,000 API calls flow)
 */
app.post('/api/harvest-sample', async (req, res) => {
  const count = parseInt(req.body.count || '10', 10);
  const log = [];
  log.push(`Started harvesting ${count} sample API queries across chains...`);
  
  for (let i = 1; i <= Math.min(count, 50); i++) {
    log.push(`[CALL #${i}] GET /v1/token/screener?chain=solana&offset=${i * 10} -> 200 OK`);
  }
  
  res.json({
    success: true,
    callsExecuted: Math.min(count, 50),
    logs: log
  });
});

// Fallback to index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Bind to 0.0.0.0 for live preview proxy
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`🚀 THESIS SHREDDER is live on http://0.0.0.0:${PORT}`);
  console.log(`📡 Meridian Buildathon 2026 Engine Ready`);
  console.log(`=================================================`);
});
