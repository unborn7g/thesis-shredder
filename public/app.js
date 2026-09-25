// Thesis Shredder // Fluid Nansen Interactive Engine

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

  // Score Elements
  const shredScoreVal = document.getElementById('shred-score-val');
  const radialGaugeFill = document.getElementById('radial-gauge-fill');
  const scoreBanner = document.getElementById('score-banner');
  const verdictBanner = document.getElementById('verdict-banner');
  const verdictRecommendation = document.getElementById('verdict-recommendation');
  const verdictSummary = document.getElementById('verdict-summary');

  // Vulnerability Meters
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

  // Actions & Modal
  const exportBtn = document.getElementById('export-btn');
  const shareXBtn = document.getElementById('share-x-btn');
  const openApiModalBtn = document.getElementById('open-api-modal');
  const closeApiModalBtn = document.getElementById('close-api-modal');
  const apiModal = document.getElementById('api-modal');
  const customApiKeyInput = document.getElementById('custom-api-key');
  const runHarvestSampleBtn = document.getElementById('run-harvest-sample');
  const harvesterLog = document.getElementById('harvester-log');

  let currentReport = null;
  let activeTabElement = null;

  // 1. Fetch Presets
  async function loadPresets() {
    try {
      const res = await fetch('/api/presets');
      const data = await res.json();
      presetsContainer.innerHTML = '';

      data.presets.forEach((p, idx) => {
        const tab = document.createElement('div');
        tab.className = `preset-tab ${idx === 0 ? 'active' : ''}`;
        if (idx === 0) activeTabElement = tab;

        tab.innerHTML = `
          <div class="preset-info">
            <span class="preset-title">${p.title}</span>
            <span class="preset-meta">${p.token} • ${p.chain.toUpperCase()}</span>
          </div>
          <span class="preset-arrow">➔</span>
        `;

        tab.onclick = () => {
          if (activeTabElement) activeTabElement.classList.remove('active');
          tab.classList.add('active');
          activeTabElement = tab;

          thesisInput.value = p.userThesis;
          tokenSymbolInput.value = p.token;
          chainSelect.value = p.chain;
          tokenAddressInput.value = p.id === 'cabal-solana-trap' ? '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' : '';
          executeInterrogation({ presetId: p.id });
        };

        presetsContainer.appendChild(tab);
      });
    } catch (e) {
      console.warn('Failed to load presets', e);
    }
  }

  loadPresets();

  // 2. Form Submission
  shredderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (activeTabElement) activeTabElement.classList.remove('active');

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
    verdictIndicator.innerText = 'GAUNTLET EVALUATING';
    verdictIndicator.style.borderColor = '#00ffa7';
    verdictIndicator.style.color = '#00ffa7';

    appendLog(`[NANSEN] Initiating adversarial evaluation...`);

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
    line.className = 'console-row';
    line.innerText = text;
    logContent.appendChild(line);
    logContent.scrollTop = logContent.scrollHeight;
  }

  // 4. Render Adversarial Results
  function renderReport(report) {
    const { shredScore, status, breakdown, verdict, dataPayload, counterArguments } = report;

    // Animated Score Count-up
    animateValue(shredScoreVal, parseInt(shredScoreVal.innerText) || 0, shredScore, 600);

    // Update Radial SVG Gauge
    const circumference = 251.327; // 2 * PI * 40
    const offset = circumference * (1 - (shredScore / 100));
    radialGaugeFill.style.strokeDashoffset = offset;

    verdictIndicator.innerText = status;

    if (status === 'SHREDDED') {
      radialGaugeFill.style.stroke = '#ff2244';
      shredScoreVal.style.color = '#ff2244';
      scoreBanner.style.borderColor = 'rgba(255, 34, 68, 0.4)';
      verdictBanner.innerText = 'SHREDDED // CRITICAL RISK';
      verdictBanner.style.color = '#ff2244';
      verdictRecommendation.innerText = 'DO NOT ENTER';
      verdictRecommendation.style.background = 'rgba(255, 34, 68, 0.15)';
      verdictRecommendation.style.color = '#ff6b8b';
      verdictRecommendation.style.borderColor = 'rgba(255, 34, 68, 0.4)';
    } else if (status === 'HIGH_FRICTION') {
      radialGaugeFill.style.stroke = '#ff7b2b';
      shredScoreVal.style.color = '#ff7b2b';
      scoreBanner.style.borderColor = 'rgba(255, 123, 43, 0.4)';
      verdictBanner.innerText = 'HIGH FRICTION // DIVERGENCE';
      verdictBanner.style.color = '#ff7b2b';
      verdictRecommendation.innerText = 'TIGHTEN STOPS / HEDGE';
      verdictRecommendation.style.background = 'rgba(255, 123, 43, 0.15)';
      verdictRecommendation.style.color = '#ffb700';
      verdictRecommendation.style.borderColor = 'rgba(255, 123, 43, 0.4)';
    } else {
      radialGaugeFill.style.stroke = '#00ffa7';
      shredScoreVal.style.color = '#00ffa7';
      scoreBanner.style.borderColor = 'rgba(0, 255, 167, 0.4)';
      verdictBanner.innerText = 'RESILIENT // DATA VERIFIED';
      verdictBanner.style.color = '#00ffa7';
      verdictRecommendation.innerText = 'THESIS VALIDATED';
      verdictRecommendation.style.background = 'rgba(0, 255, 167, 0.15)';
      verdictRecommendation.style.color = '#00ffa7';
      verdictRecommendation.style.borderColor = 'rgba(0, 255, 167, 0.4)';
    }

    verdictSummary.innerText = verdict.summary;

    // Vulnerability Fill Bars
    smRiskVal.innerText = `${breakdown.smartMoneyDivergenceRisk}/35`;
    smRiskFill.style.width = `${(breakdown.smartMoneyDivergenceRisk / 35) * 100}%`;
    smRiskFill.style.backgroundColor = breakdown.smartMoneyDivergenceRisk > 20 ? '#ff2244' : '#00ffa7';
    smRiskNote.innerText = dataPayload.smartMoney.netflow24hUsd < 0
      ? `Cohort dumping (-$${Math.abs(dataPayload.smartMoney.netflow24hUsd).toLocaleString()})`
      : `Cohort accumulation (+$${dataPayload.smartMoney.netflow24hUsd.toLocaleString()})`;

    cabalRiskVal.innerText = `${breakdown.cabalCentralityRisk}/30`;
    cabalRiskFill.style.width = `${(breakdown.cabalCentralityRisk / 30) * 100}%`;
    cabalRiskFill.style.backgroundColor = breakdown.cabalCentralityRisk > 15 ? '#ff2244' : '#00ffa7';
    cabalRiskNote.innerText = `Cabal Index: ${dataPayload.cabalAnalysis.cabalCentralityIndex}% (${dataPayload.cabalAnalysis.clusteredWallets} clustered wallets)`;

    perpRiskVal.innerText = `${breakdown.perpWhaleDivergenceRisk}/20`;
    perpRiskFill.style.width = `${(breakdown.perpWhaleDivergenceRisk / 20) * 100}%`;
    perpRiskFill.style.backgroundColor = breakdown.perpWhaleDivergenceRisk > 10 ? '#ff7b2b' : '#00ffa7';
    perpRiskNote.innerText = dataPayload.perpsAndDerivatives.hasPerps
      ? `Perp Whales: ${dataPayload.perpsAndDerivatives.perpSentiment}`
      : 'No active Hyperliquid perp pool';

    liqRiskVal.innerText = `${breakdown.liquidityDrainRisk}/15`;
    liqRiskFill.style.width = `${(breakdown.liquidityDrainRisk / 15) * 100}%`;
    liqRiskFill.style.backgroundColor = breakdown.liquidityDrainRisk > 5 ? '#ff2244' : '#00ffa7';
    liqRiskNote.innerText = dataPayload.automatedExecution.jupiterDcaSellingDetected
      ? `${dataPayload.automatedExecution.activeSellOrdersCount} automated sell ladders firing`
      : 'Normal liquidity cadence';

    // Draw Cabal Cluster
    drawCabalCluster(dataPayload.cabalAnalysis);
    clusterSummaryText.innerHTML = `Funding Tree: <code>${dataPayload.cabalAnalysis.rootFunderAddress}</code> — ${dataPayload.cabalAnalysis.fundingPattern}`;

    // Evidence Dossier
    evidenceList.innerHTML = '';
    counterArguments.forEach(arg => {
      const item = document.createElement('div');
      item.className = `evidence-row ${arg.severity === 'CRITICAL' ? '' : (arg.severity === 'HIGH' ? 'warn' : 'safe')}`;
      item.innerHTML = `
        <span class="ev-tag">[${arg.vector}]</span>
        <span class="ev-text">${arg.text}</span>
      `;
      evidenceList.appendChild(item);
    });
  }

  // Number count-up animation
  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerText = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.innerText = end;
      }
    };
    window.requestAnimationFrame(step);
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
    ctx.shadowBlur = 18;
    ctx.shadowColor = isHighRisk ? '#ff2244' : '#00ffa7';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Root Label
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isHighRisk ? 'DISPERSE ROOT' : 'ORGANIC SOURCE', centerX, centerY - 17);

    // Satellites
    const walletCount = cabal.analyzedTopHolders || 14;
    const radius = 64;

    for (let i = 0; i < walletCount; i++) {
      const angle = (i / walletCount) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * (radius + (i % 2 === 0 ? 15 : -10));
      const y = centerY + Math.sin(angle) * (radius + (i % 2 === 0 ? 15 : -10));

      const isPuppet = isHighRisk && (i < cabal.clusteredWallets);

      // Curved Line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.quadraticCurveTo(
        (centerX + x) / 2 + (i % 2 === 0 ? 10 : -10),
        (centerY + y) / 2 + (i % 2 === 0 ? -10 : 10),
        x, y
      );
      ctx.strokeStyle = isPuppet ? 'rgba(255, 34, 68, 0.45)' : 'rgba(0, 255, 167, 0.25)';
      ctx.lineWidth = isPuppet ? 1.6 : 0.9;
      ctx.stroke();

      // Satellite Dot
      ctx.beginPath();
      ctx.arc(x, y, isPuppet ? 6 : 4, 0, Math.PI * 2);
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
=== NANSEN THESIS SHREDDER REPORT ===
Asset: ${currentReport.targetToken.symbol} (${currentReport.targetToken.chain})
Thesis: "${currentReport.userThesis}"

SHRED SCORE: ${currentReport.shredScore}/100 [${currentReport.status}]
Directive: ${currentReport.verdict.summary}

Nansen Intelligence Vectors:
- Smart Money Divergence: ${currentReport.breakdown.smartMoneyDivergenceRisk}/35
- Cabal Centrality Index: ${currentReport.dataPayload.cabalAnalysis.cabalCentralityIndex}%
- Perp Whale Hedging: ${currentReport.breakdown.perpWhaleDivergenceRisk}/20
- Liquidity Drain Risk: ${currentReport.breakdown.liquidityDrainRisk}/15

Surface the Signal. Built for Nansen Meridian Buildathon 2026.
    `.trim();

    navigator.clipboard.writeText(dossierText).then(() => {
      exportBtn.innerText = '✅ Copied to Clipboard';
      setTimeout(() => { exportBtn.innerText = 'Copy Due Diligence Dossier'; }, 2000);
    });
  });

  // 7. Share on X
  shareXBtn.addEventListener('click', () => {
    if (!currentReport) return;
    const text = encodeURIComponent(
      `Don't ask AI to confirm your thesis. Make it try to break it. ⚔️\n\n` +
      `Tested my $${currentReport.targetToken.symbol} trade idea through @nansen_ai Thesis Shredder for #MeridianBuildathon.\n` +
      `🔥 Result: Fragility Score ${currentReport.shredScore}/100 (${currentReport.status})\n\n` +
      `Surface the Signal.`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  });

  // 8. Modal Management
  openApiModalBtn.addEventListener('click', () => apiModal.classList.remove('hidden'));
  closeApiModalBtn.addEventListener('click', () => apiModal.classList.add('hidden'));

  // 9. Harvester Simulation
  runHarvestSampleBtn.addEventListener('click', async () => {
    runHarvestSampleBtn.innerText = 'Logging 50 Nansen API calls...';
    try {
      const res = await fetch('/api/harvest-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 50 })
      });
      const data = await res.json();
      harvesterLog.innerHTML = data.logs.slice(0, 8).join('<br/>') + `<br/>... Successfully logged ${data.callsExecuted} calls.`;
      runHarvestSampleBtn.innerText = 'Batch Complete (50 Calls Logged)';
    } catch (e) {
      harvesterLog.innerText = 'Harvest failed: ' + e.message;
      runHarvestSampleBtn.innerText = 'Execute 50 Sample Calls';
    }
  });

  // Auto-run first preset on load
  setTimeout(() => {
    executeInterrogation({ presetId: 'cabal-solana-trap' });
  }, 350);
});
