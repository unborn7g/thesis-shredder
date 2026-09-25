#!/usr/bin/env node
/**
 * NANSEN 1,000 API CALLS HARVESTER (Node.js)
 * Usage:
 *   export NANSEN_API_KEY="your-key-here"
 *   node scripts/harvest_1000_calls.js --target 1000 --delay 250
 */

const https = require('https');
const fs = require('fs');

const API_KEY = process.env.NANSEN_API_KEY || process.argv[2];
const TARGET_CALLS = parseInt(process.env.TARGET_CALLS || '1000', 10);
const DELAY_MS = 250;
const CHAINS = ['solana', 'base', 'ethereum', 'arbitrum', 'polygon', 'bsc'];

if (!API_KEY) {
  console.error('❌ Error: Set NANSEN_API_KEY environment variable or pass key as argument.');
  process.exit(1);
}

function makeCall(index) {
  return new Promise((resolve) => {
    const chain = CHAINS[index % CHAINS.length];
    const isScreener = index % 2 === 0;
    const path = isScreener ? '/v1/token/screener' : `/v1/smart-money/netflow?chain=${chain}`;
    const method = isScreener ? 'POST' : 'GET';
    const body = isScreener ? JSON.stringify({ chain, limit: 10, timeframe: '24h' }) : null;

    const options = {
      hostname: 'api.nansen.ai',
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'NANSEN-API-KEY': API_KEY,
        'User-Agent': 'NansenMeridianHarvester-Node/1.0',
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {})
      },
      timeout: 10000
    };

    const start = Date.now();
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const ms = Date.now() - start;
        resolve({
          callId: index,
          status: res.statusCode,
          chain,
          ms,
          ok: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });

    req.on('error', (err) => resolve({ callId: index, status: 500, error: err.message, ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ callId: index, status: 408, ok: false }); });

    if (body) req.write(body);
    req.end();
  });
}

async function run() {
  console.log(`🚀 Node.js Nansen 1,000 Harvester started. Target: ${TARGET_CALLS}`);
  let success = 0;

  for (let i = 1; i <= TARGET_CALLS; i++) {
    const res = await makeCall(i);
    if (res.ok) success++;
    const pct = ((i / TARGET_CALLS) * 100).toFixed(1);
    console.log(`[${i}/${TARGET_CALLS}] [${pct}%] ${res.chain} -> HTTP ${res.status} (${res.ms || 0}ms)`);
    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  console.log(`🎉 Finished: ${success}/${TARGET_CALLS} successful calls logged.`);
}

run();
