// Thesis Shredder // Official Nansen Buildathon Frontend Logic

document.addEventListener('DOMContentLoaded', () => {
  const presetsContainer = document.getElementById('presets-container');
  const shredderForm = document.getElementById('shredder-form');
  const thesisInput = document.getElementById('thesis-input');
  const tokenSymbolInput = document.getElementById('token-symbol');
  const chainSelect = document.getElementById('chain-select');
  const tokenAddressInput = document.getElementById('token-address');
  const logContent = document.getElementById('log-content');
  const resultsContent = document.getElementById('results-content');
  const emptyState = document.getElementById('empty-state');
  const verdictIndicator = document.getElementById('verdict-indicator');

  // Score elements
  const shredScoreVal = document.getElementById('shred-score-val');
  const verdictBanner = document.getElementById('verdict-banner');
  const verdictSummary = document.getElementById('verdict-summary');
  const verdictRecommendation = document.getElementById('verdict-recommendation');
  const verdictCard = document.getElementById('verdict-card');

  // Vulnerability bars
  const smRiskVal = document.getElementById('sm-risk-val');
  const smRiskFill = document.getElementById('sm-risk-fill');
  const smRiskNote = document.getElementById('sm-risk-note');

  const cabalRiskVal = document.getElementById('cabal-risk-val');
  const cabalRiskFill = document.getElementById('cabal-risk-fill');
  const cabalRiskNote = document.getElementById('cabal-risk-note');

  const perpRiskVal = document.getElementById('perp-risk-val');
  const perpRiskFill = document.getElementById('perp-risk-fill');
  const perpRiskNote = document.getElementById('perp-risk-note');

  const liqRiskVal = document.getElementById('liq-risk-val');
  const liqRiskFill = document.getElementById('liq-risk-fill');
  const liqRiskNote = document.getElementById('liq-risk-note');

  // Canvas & Details
  const cabalCanvas = document.getElementById('cabal-canvas');
  const clusterSummaryText = document.getElementById('cluster-summary-text');
  const evidenceList = document.getElementById('evidence-list');

  // Buttons & Modals
  const exportBtn = document.getElementById('export-btn');
  const shareXBtn = document.getElementById('share-x-btn');
  const openApiModalBtn = document.getElementById('open-api-modal');
  const closeApiModalBtn = document.getElementById('close-api-modal');
  const apiModal = document.getElementById('api-modal');
  const customApiKeyInput = document.getElementById('custom-api-key');
  const runHarvestSampleBtn = document.getElementById('run-harvest-sample');
  const harvesterLog = document.getElementById('harvester-log');

  let currentReport = null;

  // 1. Fetch Presets
  async function loadPresets() {
    try {
      const res = await fetch('/api/presets');
      const data = await res.json();
      presetsContainer.innerHTML = '';

      data.presets.forEach(p => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'preset-btn';
        btn.innerHTML = `<span>${p.title}</span><span style="color:#00ffa7;font-size:11px;">EVALUATE ➔</span>`;
        btn.addEventListener('click', () => {
          thesisInput.value = p.userThesis;
          tokenSymbolInput.value = p.token;
          chainSelect.value = p.chain;
          tokenAddressInput.value = p.id === 'cabal-solana-trap' ? '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' : '';
          executeInterrogation({ presetId: p.id });
        });
        presetsContainer.appendChild(btn);
      });
    } catch (e) {
      console.warn('Failed to load presets', e);
    }
  }

  loadPresets();

  // 2. Form Submission
  shredderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    executeInterrogation({
      thesisText: thesisInput.value,
      tokenSymbol: tokenSymbolInput.value,
      tokenAddress: tokenAddressInput.value,
      chain: chainSelect.value,
      customApiKey: customApiKeyInput.value.trim() || null
    });
  });

  // 3. Execution Pipeline
  async function executeInterrogation(payload) {
    emptyState.classList.add('hidden');
    resultsContent.classList.remove('hidden');
    verdictIndicator.className = 'chip-badge chip-live';
    verdictIndicator.innerText = 'GAUNTLET EVALUATING';

    appendLog(`[NANSEN] Deploying 5 adversarial gauntlet vectors...`);

    try {
      const res = await fetch('/api/interrogate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(payload.customApiKey ? { 'x-nansen-api-key': payload.customApiKey } : {})
        },
        body: JSON.stringify(payload)
      });

      const report = await res.json();
      currentReport = report;

      // Stream logs
      if (report.interrogationLogs) {
        report.interrogationLogs.forEach(line => appendLog(line));
      }

      renderReport(report);
    } catch (err) {
      appendLog(`[ERROR] Interrogation pipeline failed: ${err.message}`);
    }
  }

  function appendLog(text) {
    const line = document.createElement('div');
    line.className = 't-line';
    line.innerText = text;
    logContent.appendChild(line);
    logContent.scrollTop = logContent.scrollHeight;
  }

  // 4. Render Adversarial Results
  function renderReport(report) {
    const { shredScore, status, breakdown, verdict, dataPayload, counterArguments } = report;

    shredScoreVal.innerText = shredScore;
    verdictIndicator.innerText = status;

    if (status === 'SHREDDED') {
      shredScoreVal.style.color = '#ff2244';
      verdictBanner.className = 'status-pill';
      verdictBanner.innerText = 'SHREDDED // CRITICAL RISK';
      verdictBanner.style.borderColor = '#ff2244';
      verdictBanner.style.color = '#ff2244';
      verdictBanner.style.background = 'rgba(255, 34, 68, 0.15)';
      verdictCard.style.borderColor = 'rgba(255, 34, 68, 0.4)';
      verdictRecommendation.className = 'recommend-pill';
      verdictRecommendation.style.background = 'rgba(255, 34, 68, 0.2)';
      verdictRecommendation.style.color = '#ff6b8b';
      verdictRecommendation.style.borderColor = '#ff6b8b';
    } else if (status === 'HIGH_FRICTION') {
      shredScoreVal.style.color = '#ff7b2b';
      verdictBanner.className = 'status-pill';
      verdictBanner.innerText = 'HIGH FRICTION // DIVERGENCE';
      verdictBanner.style.borderColor = '#ff7b2b';
      verdictBanner.style.color = '#ff7b2b';
      verdictBanner.style.background = 'rgba(255, 123, 43, 0.15)';
      verdictCard.style.borderColor = 'rgba(255, 123, 43, 0.4)';
      verdictRecommendation.className = 'recommend-pill';
      verdictRecommendation.style.background = 'rgba(255, 123, 43, 0.2)';
      verdictRecommendation.style.color = '#ffb700';
      verdictRecommendation.style.borderColor = '#ffb700';
    } else {
      shredScoreVal.style.color = '#00ffa7';
      verdictBanner.className = 'status-pill';
      verdictBanner.innerText = 'RESILIENT // DATA VERIFIED';
      verdictBanner.style.borderColor = '#00ffa7';
      verdictBanner.style.color = '#00ffa7';
      verdictBanner.style.background = 'rgba(0, 255, 167, 0.15)';
      verdictCard.style.borderColor = 'rgba(0, 255, 167, 0.4)';
      verdictRecommendation.className = 'recommend-pill';
      verdictRecommendation.style.background = 'rgba(0, 255, 167, 0.2)';
      verdictRecommendation.style.color = '#00ffa7';
      verdictRecommendation.style.borderColor = '#00ffa7';
    }

    verdictSummary.innerText = verdict.summary;
    verdictRecommendation.innerText = verdict.actionableRecommendation;

    // Gauges
    smRiskVal.innerText = `${breakdown.smartMoneyDivergenceRisk}/35`;
    smRiskFill.style.width = `${(breakdown.smartMoneyDivergenceRisk / 35) * 100}%`;
    smRiskFill.className = breakdown.smartMoneyDivergenceRisk > 20 ? 'meter-bar bar-danger' : 'meter-bar bar-safe';
    smRiskNote.innerText = dataPayload.smartMoney.netflow24hUsd < 0
      ? `Cohort dumping (-$${Math.abs(dataPayload.smartMoney.netflow24hUsd).toLocaleString()})`
      : `Cohort accumulation (+$${dataPayload.smartMoney.netflow24hUsd.toLocaleString()})`;

    cabalRiskVal.innerText = `${breakdown.cabalCentralityRisk}/30`;
    cabalRiskFill.style.width = `${(breakdown.cabalCentralityRisk / 30) * 100}%`;
    cabalRiskFill.className = breakdown.cabalCentralityRisk > 15 ? 'meter-bar bar-danger' : 'meter-bar bar-safe';
    cabalRiskNote.innerText = `Cabal Index: ${dataPayload.cabalAnalysis.cabalCentralityIndex}% (${dataPayload.cabalAnalysis.clusteredWallets} clustered wallets)`;

    perpRiskVal.innerText = `${breakdown.perpWhaleDivergenceRisk}/20`;
    perpRiskFill.style.width = `${(breakdown.perpWhaleDivergenceRisk / 20) * 100}%`;
    perpRiskFill.className = breakdown.perpWhaleDivergenceRisk > 10 ? 'meter-bar bar-warn' : 'meter-bar bar-safe';
    perpRiskNote.innerText = dataPayload.perpsAndDerivatives.hasPerps
      ? `Perp Whales: ${dataPayload.perpsAndDerivatives.perpSentiment}`
      : 'No active Hyperliquid perp pool';

    liqRiskVal.innerText = `${breakdown.liquidityDrainRisk}/15`;
    liqRiskFill.style.width = `${(breakdown.liquidityDrainRisk / 15) * 100}%`;
    liqRiskFill.className = breakdown.liquidityDrainRisk > 5 ? 'meter-bar bar-danger' : 'meter-bar bar-safe';
    liqRiskNote.innerText = dataPayload.automatedExecution.jupiterDcaSellingDetected
      ? `${dataPayload.automatedExecution.activeSellOrdersCount} automated sell ladders firing`
      : 'Normal liquidity cadence';

    // Cabal Visualization
    drawCabalCluster(dataPayload.cabalAnalysis);
    clusterSummaryText.innerHTML = `Funding Tree: <code>${dataPayload.cabalAnalysis.rootFunderAddress}</code> — ${dataPayload.cabalAnalysis.fundingPattern}`;

    // Evidence Dossier
    evidenceList.innerHTML = '';
    counterArguments.forEach(arg => {
      const item = document.createElement('div');
      item.className = `evidence-item ${arg.severity === 'CRITICAL' ? '' : (arg.severity === 'HIGH' ? 'warn' : 'safe')}`;
      item.innerHTML = `
        <span class="evidence-tag">[${arg.vector}]</span>
        <span class="evidence-text">${arg.text}</span>
      `;
      evidenceList.appendChild(item);
    });
  }

  // 5. Canvas Cabal Cluster Visualizer
  function drawCabalCluster(cabal) {
    const ctx = cabalCanvas.getContext('2d');
    const width = cabalCanvas.width;
    const height = cabalCanvas.height;

    ctx.clearRect(0, 0, width, height);

    const isHighRisk = cabal.cabalCentralityIndex > 50;
    const centerX = width / 2;
    const centerY = height / 2;

    // Draw Root Node
    ctx.beginPath();
    ctx.arc(centerX, centerY, 13, 0, Math.PI * 2);
    ctx.fillStyle = isHighRisk ? '#ff2244' : '#00ffa7';
    ctx.shadowBlur = 15;
    ctx.shadowColor = isHighRisk ? '#ff2244' : '#00ffa7';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Root Label
    ctx.fillStyle = '#ffffff';
    ctx.font = '10.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isHighRisk ? 'ROOT DISPERSE' : 'ORGANIC SOURCE', centerX, centerY - 18);

    // Draw Satellites (Buyer Wallets)
    const walletCount = cabal.analyzedTopHolders || 14;
    const radius = 68;

    for (let i = 0; i < walletCount; i++) {
      const angle = (i / walletCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * (radius + (i % 2 === 0 ? 16 : -12));
      const y = centerY + Math.sin(angle) * (radius + (i % 2 === 0 ? 16 : -12));

      const isPuppet = isHighRisk && (i < cabal.clusteredWallets);

      // Connecting Line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = isPuppet ? 'rgba(255, 34, 68, 0.5)' : 'rgba(0, 255, 167, 0.25)';
      ctx.lineWidth = isPuppet ? 1.6 : 0.9;
      ctx.stroke();

      // Satellite Dot
      ctx.beginPath();
      ctx.arc(x, y, isPuppet ? 6.5 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = isPuppet ? '#ff2244' : '#00ffa7';
      ctx.shadowBlur = isPuppet ? 8 : 4;
      ctx.shadowColor = isPuppet ? '#ff2244' : '#00ffa7';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // 6. Copy Dossier
  exportBtn.addEventListener('click', () => {
    if (!currentReport) return;
    const dossierText = `
=== NANSEN THESIS SHREDDER // ADVERSARIAL REPORT ===
Timestamp: ${currentReport.timestamp}
Asset: ${currentReport.targetToken.symbol} (${currentReport.targetToken.chain})
User Thesis: "${currentReport.userThesis}"

SHRED SCORE: ${currentReport.shredScore}/100 [${currentReport.status}]
Directive: ${currentReport.verdict.summary}
Recommendation: ${currentReport.verdict.actionableRecommendation}

Nansen Gauntlet Breakdown:
- Smart Money Divergence: ${currentReport.breakdown.smartMoneyDivergenceRisk}/35
- Cabal Centrality: ${currentReport.breakdown.cabalCentralityRisk}/30 (Index: ${currentReport.dataPayload.cabalAnalysis.cabalCentralityIndex}%)
- Perp Whales Hedging: ${currentReport.breakdown.perpWhaleDivergenceRisk}/20
- Liquidity Drain: ${currentReport.breakdown.liquidityDrainRisk}/15

Verified Nansen Receipts:
${currentReport.counterArguments.map(c => `* [${c.vector}] ${c.text}`).join('\n')}

Surface the Signal. Built for Nansen Meridian Buildathon 2026.
    `.trim();

    navigator.clipboard.writeText(dossierText).then(() => {
      exportBtn.innerHTML = '<span>✅ COPIED TO CLIPBOARD</span>';
      setTimeout(() => { exportBtn.innerHTML = '<span>📋 COPY DUE DILIGENCE DOSSIER</span>'; }, 2000);
    });
  });

  // 7. Share on X
  shareXBtn.addEventListener('click', () => {
    if (!currentReport) return;
    const text = encodeURIComponent(
      `Don't ask AI to confirm your thesis. Make it try to break it. ⚔️\n\n` +
      `Ran my $${currentReport.targetToken.symbol} thesis through @nansen_ai Thesis Shredder for #MeridianBuildathon.\n` +
      `🔥 Shred Score: ${currentReport.shredScore}/100 (${currentReport.status})\n` +
      `Nansen Evidence: ${currentReport.counterArguments[0]?.text || 'Verified with Nansen API'}\n\n` +
      `Surface the Signal.`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  });

  // 8. Modal Management
  openApiModalBtn.addEventListener('click', () => apiModal.classList.remove('hidden'));
  closeApiModalBtn.addEventListener('click', () => apiModal.classList.add('hidden'));

  // 9. Harvester Simulation
  runHarvestSampleBtn.addEventListener('click', async () => {
    runHarvestSampleBtn.innerText = 'LOGGING 50 NANSEN API CALLS...';
    try {
      const res = await fetch('/api/harvest-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 50 })
      });
      const data = await res.json();
      harvesterLog.innerHTML = data.logs.slice(0, 8).join('<br/>') + `<br/>... Successfully logged ${data.callsExecuted} calls to Nansen API.`;
      runHarvestSampleBtn.innerText = 'BATCH COMPLETE (50 CALLS LOGGED)';
    } catch (e) {
      harvesterLog.innerText = 'Harvest failed: ' + e.message;
      runHarvestSampleBtn.innerText = 'SIMULATE BATCH HARVEST (50 CALLS)';
    }
  });

  // Auto-run first preset on load
  setTimeout(() => {
    executeInterrogation({ presetId: 'cabal-solana-trap' });
  }, 350);
});
