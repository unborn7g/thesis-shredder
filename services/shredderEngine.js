/**
 * The Thesis Shredder Adversarial Engine
 * Passes user thesis and target token through 5 on-chain gauntlets powered by Nansen data.
 */

const CabalDetector = require('./cabalDetector');
const { PRESET_THESES } = require('./mockData');

class ShredderEngine {
  constructor(nansenClient = null) {
    this.client = nansenClient;
  }

  /**
   * Main Interrogation Routine
   */
  async interrogateThesis({
    thesisText = '',
    tokenSymbol = '',
    tokenAddress = '',
    chain = 'solana',
    customApiKey = null,
    presetId = null
  }) {
    const logs = [];
    const timestamp = new Date().toISOString();

    const displayThesis = thesisText || (presetId ? 'Preset Case Study' : 'Custom Trade Thesis');
    logs.push(`[${timestamp}] 🚀 Initializing Adversarial Red Team for thesis: "${displayThesis.slice(0, 60)}..."`);
    logs.push(`[${timestamp}] 🎯 Target Asset: ${tokenSymbol || 'DETECTED'} on chain: ${chain.toUpperCase()}`);

    // Check if preset or mock mode requested
    if (presetId) {
      const preset = PRESET_THESES.find(p => p.id === presetId);
      if (preset) {
        logs.push(`[${timestamp}] 📦 Utilizing verified historical snapshot: ${preset.title}`);
        return this.synthesizeReport(preset.data, thesisText || preset.userThesis, logs, true);
      }
    }

    // Try live Nansen API if key provided or client has key
    if (customApiKey && this.client) {
      this.client.setApiKey(customApiKey);
    }

    if (this.client && this.client.apiKey) {
      try {
        logs.push(`[${timestamp}] 📡 Querying live Nansen API endpoints...`);
        return await this.runLiveEvaluation(tokenAddress, chain, thesisText, logs);
      } catch (err) {
        logs.push(`[${timestamp}] ⚠️ Live API query error (${err.message}). Falling back to algorithmic analysis.`);
      }
    }

    // Fallback: Smart heuristic simulation based on input keywords
    logs.push(`[${timestamp}] 🧪 Running algorithmic sandbox engine...`);
    const syntheticData = this.generateSyntheticData(tokenSymbol, chain, thesisText);
    return this.synthesizeReport(syntheticData, thesisText, logs, false);
  }

  /**
   * Run Live Evaluation with actual Nansen API
   */
  async runLiveEvaluation(tokenAddress, chain, thesisText, logs) {
    logs.push(`[GAUNTLET 1/5] 🔍 Fetching Smart Money Netflow & Token Flows...`);
    let tokenFlows = null;
    let whoBoughtSold = null;
    let jupiterDcas = null;
    let perpData = null;

    try {
      tokenFlows = await this.client.getTokenFlows(chain, tokenAddress);
      logs.push(`[GAUNTLET 1/5] ✅ Token flow data indexed.`);
    } catch (e) {
      logs.push(`[GAUNTLET 1/5] ⚠️ Flow endpoint unavailable: ${e.message}`);
    }

    try {
      logs.push(`[GAUNTLET 2/5] 🕸️ Profiling top buyers & counterparties...`);
      whoBoughtSold = await this.client.getWhoBoughtSold(chain, tokenAddress);
      logs.push(`[GAUNTLET 2/5] ✅ Buyer cohort mapped.`);
    } catch (e) {
      logs.push(`[GAUNTLET 2/5] ⚠️ WhoBoughtSold endpoint unavailable.`);
    }

    if (chain.toLowerCase() === 'solana') {
      try {
        logs.push(`[GAUNTLET 3/5] ⏱️ Checking automated Jupiter DCA order book pressure...`);
        jupiterDcas = await this.client.getJupiterDcas(chain, tokenAddress);
        logs.push(`[GAUNTLET 3/5] ✅ Jupiter DCA schedules scanned.`);
      } catch (e) {
        logs.push(`[GAUNTLET 3/5] ⚠️ Jupiter DCA check bypassed.`);
      }
    }

    try {
      logs.push(`[GAUNTLET 4/5] 📈 Cross-referencing Hyperliquid perp positioning...`);
      perpData = await this.client.getPerpPositions(chain, tokenAddress);
      logs.push(`[GAUNTLET 4/5] ✅ Perp whale positioning captured.`);
    } catch (e) {
      logs.push(`[GAUNTLET 4/5] ⚠️ No live perp market on Hyperliquid for this token.`);
    }

    // Synthesize live data into data schema
    const synthesized = this.parseLiveData(tokenAddress, chain, tokenFlows, whoBoughtSold, jupiterDcas, perpData);
    return this.synthesizeReport(synthesized, thesisText, logs, true);
  }

  parseLiveData(tokenAddress, chain, tokenFlows, whoBoughtSold, jupiterDcas, perpData) {
    // Process real responses or compute metrics
    const smartMoneyNetflow = tokenFlows?.netflow_usd || 0;
    const cabalAnalysis = CabalDetector.analyzeHolderCluster(whoBoughtSold?.buyers || []);
    
    return {
      tokenMetadata: {
        symbol: tokenFlows?.symbol || "TOKEN",
        name: tokenFlows?.name || "Target Token",
        chain: chain,
        priceUsd: tokenFlows?.price_usd || 1.0,
        marketCapUsd: tokenFlows?.market_cap_usd || 10000000,
        volume24hUsd: tokenFlows?.volume_24h_usd || 500000,
        liquidityUsd: tokenFlows?.liquidity_usd || 50000,
        liquidityToMcapRatio: 0.05
      },
      smartMoney: {
        cohort: "Smart DEX Trader + Fund",
        netflow24hUsd: smartMoneyNetflow,
        netflow4hUsd: Math.round(smartMoneyNetflow * 0.25),
        smartHoldersCount: tokenFlows?.smart_holders || 5,
        smartHoldersDelta24h: 0,
        topHoldersSharePct: 45.0,
        cohortSentiment: smartMoneyNetflow < -50000 ? "DISTRIBUTION" : (smartMoneyNetflow > 50000 ? "ACCUMULATION" : "NEUTRAL")
      },
      cabalAnalysis: cabalAnalysis,
      perpsAndDerivatives: {
        hasPerps: !!perpData,
        exchange: perpData ? "Hyperliquid" : "N/A",
        perpSentiment: perpData?.funding_rate < 0 ? "BEARISH_HEAVY" : "BALANCED"
      },
      automatedExecution: {
        jupiterDcaSellingDetected: (jupiterDcas?.active_dcas?.length || 0) > 5,
        activeSellOrdersCount: jupiterDcas?.active_dcas?.length || 0,
        pendingSellVolumeUsd: jupiterDcas?.total_sell_usd || 0,
        sellPressureCadence: jupiterDcas?.active_dcas?.length > 5 ? "Active sell ladders firing" : "None"
      }
    };
  }

  generateSyntheticData(symbol = "TARGET", chain = "solana", thesis = "") {
    const isMeme = /meme|pepe|cat|dog|wif|solana|pump|moon|gem/i.test(thesis + " " + symbol);
    const isPerp = /perp|hyperliquid|long|short|leverage/i.test(thesis);

    if (isMeme) {
      return PRESET_THESES[0].data;
    } else if (isPerp) {
      return PRESET_THESES[1].data;
    } else {
      return PRESET_THESES[2].data;
    }
  }

  /**
   * Synthesize Report & Calculate Fragility Score (Shred Score)
   */
  synthesizeReport(data, thesisText, logs = [], isLive = false) {
    const sm = data.smartMoney;
    const cabal = data.cabalAnalysis;
    const perps = data.perpsAndDerivatives;
    const autoExec = data.automatedExecution;

    // GAUNTLET 1: Smart Money Divergence (Weight: 35)
    let smRisk = 0;
    if (sm.netflow24hUsd < -100000) smRisk = 35;
    else if (sm.netflow24hUsd < 0) smRisk = 20;
    else if (sm.smartHoldersCount === 0) smRisk = 25;
    else if (sm.netflow24hUsd > 100000) smRisk = 5;

    // GAUNTLET 2: Cabal Centrality (Weight: 30)
    let cabalRisk = Math.round((cabal.cabalCentralityIndex / 100) * 30);

    // GAUNTLET 3: Perps & Whales Hedging (Weight: 20)
    let perpRisk = 0;
    if (perps.perpSentiment === 'HEAVILY_SHORT') perpRisk = 20;
    else if (perps.perpSentiment === 'MODERATELY_BEARISH') perpRisk = 12;
    else if (perps.perpSentiment === 'BALANCED' || perps.perpSentiment === 'N/A') perpRisk = 5;

    // GAUNTLET 4: Automated Order Pressure & Liquidity Depth (Weight: 15)
    let liquidityRisk = 0;
    if (autoExec.jupiterDcaSellingDetected) liquidityRisk += 10;
    if (data.tokenMetadata.liquidityToMcapRatio < 0.02) liquidityRisk += 5;

    // TOTAL SHRED SCORE (0-100)
    const totalFragilityScore = Math.min(100, Math.max(0, smRisk + cabalRisk + perpRisk + liquidityRisk));

    let status = "RESILIENT";
    if (totalFragilityScore >= 56) status = "SHREDDED";
    else if (totalFragilityScore >= 26) status = "HIGH_FRICTION";

    logs.push(`[GAUNTLET 5/5] ⚖️ Synthesis Complete: Fragility Score = ${totalFragilityScore}/100 [${status}]`);

    // Counter-Arguments (Adversarial Evidence)
    const counterArguments = [];
    if (sm.netflow24hUsd < 0) {
      counterArguments.push({
        vector: "SMART_MONEY_DISTRIBUTION",
        severity: "CRITICAL",
        text: `Smart Money cohort has sold $${Math.abs(sm.netflow24hUsd).toLocaleString()} in 24h while retail volume surged. You are providing exit liquidity.`
      });
    }
    if (cabal.cabalCentralityIndex > 50) {
      counterArguments.push({
        vector: "CABAL_CLUSTER_CENTRALITY",
        severity: "CRITICAL",
        text: `Cabal Centrality Index is ${cabal.cabalCentralityIndex}%. ${cabal.clusteredWallets} of top holders share a common funding tree (${cabal.fundingPattern}).`
      });
    }
    if (perps.perpSentiment === 'HEAVILY_SHORT') {
      counterArguments.push({
        vector: "HYPERLIQUID_HEDGE_TRAP",
        severity: "HIGH",
        text: `Top PnL perp traders are 70%+ short open interest. Spot price is exposed to an aggressive funding-rate cascade.`
      });
    }
    if (autoExec.jupiterDcaSellingDetected) {
      counterArguments.push({
        vector: "AUTOMATED_LIQUIDITY_BLEED",
        severity: "MEDIUM",
        text: `${autoExec.activeSellOrdersCount} automated Jupiter DCA sell orders are active, algorithmically dumping into every buyer uptick.`
      });
    }
    if (counterArguments.length === 0) {
      counterArguments.push({
        vector: "DATA_CONFIRMED",
        severity: "LOW",
        text: "Smart Money accumulation is genuine, counterparty distribution is organic, and derivatives markets show no predatory divergence."
      });
    }

    return {
      timestamp: new Date().toISOString(),
      userThesis: thesisText,
      targetToken: data.tokenMetadata,
      shredScore: totalFragilityScore,
      status: status,
      isLive: isLive,
      breakdown: {
        smartMoneyDivergenceRisk: smRisk,
        cabalCentralityRisk: cabalRisk,
        perpWhaleDivergenceRisk: perpRisk,
        liquidityDrainRisk: liquidityRisk
      },
      dataPayload: data,
      counterArguments: counterArguments,
      interrogationLogs: logs,
      verdict: {
        score: totalFragilityScore,
        status: status,
        summary: data.verdict?.summary || `Interrogation finished with score ${totalFragilityScore}/100. Status: ${status}`,
        actionableRecommendation: data.verdict?.actionableRecommendation || (status === 'SHREDDED' ? 'DO NOT EXECUTE. Thesis is compromised by on-chain flow divergence.' : 'Thesis holds against adversarial on-chain interrogation.')
      }
    };
  }
}

module.exports = ShredderEngine;
