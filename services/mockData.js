/**
 * High-fidelity historical on-chain snapshots mimicking real Nansen API responses.
 * Used for instant demo runs, unit tests, and offline evaluations by judges.
 */

const PRESET_THESES = [
  {
    id: "cabal-solana-trap",
    title: "🚩 The Insider Cabal Launch ($CATNIP on Solana)",
    token: "CATNIP",
    tokenAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    chain: "solana",
    userThesis: "Longing $CATNIP because it just broke out with $5M volume and Twitter callers say Smart Money is aggressively buying.",
    data: {
      tokenMetadata: {
        symbol: "CATNIP",
        name: "Catnip Protocol",
        chain: "solana",
        priceUsd: 0.042,
        marketCapUsd: 42000000,
        volume24hUsd: 5820000,
        liquidityUsd: 610000,
        liquidityToMcapRatio: 0.0145 // dangerously low (1.45%)
      },
      smartMoney: {
        cohort: "Smart DEX Trader + Fund",
        netflow24hUsd: -412000, // actively dumping
        netflow4hUsd: -188000,
        smartHoldersCount: 2,
        smartHoldersDelta24h: -5, // 5 smart money wallets completely exited
        topHoldersSharePct: 78.4,
        cohortSentiment: "AGGRESSIVE_DISTRIBUTION"
      },
      cabalAnalysis: {
        cabalCentralityIndex: 92, // 92/100 cabal risk!
        analyzedTopHolders: 15,
        clusteredWallets: 11,
        rootFunderAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
        fundingPattern: "Disperse.app multi-transfer 18 minutes prior to Raydium pool initialization",
        sharedCounterparties: 8,
        insiderSupplyControlPct: 64.2
      },
      perpsAndDerivatives: {
        hasPerps: false,
        exchange: "N/A",
        perpSentiment: "N/A"
      },
      automatedExecution: {
        jupiterDcaSellingDetected: true,
        activeSellOrdersCount: 28,
        pendingSellVolumeUsd: 380000,
        sellPressureCadence: "Orders firing every 180 seconds into DEX liquidity"
      },
      verdict: {
        score: 91, // 0-100 fragility score
        status: "SHREDDED",
        summary: "CRITICAL COMPROMISE: You are buying exit liquidity. 11 of the top 15 wallets are part of a coordinated Sybil cabal funded from a single wallet 18 mins before launch. Smart Money is dumping (-$412K) while automated Jupiter DCAs continuously bleed the liquidity pool.",
        actionableRecommendation: "DO NOT LONG. High probability of rug/liquidity pull within 12-24 hours."
      }
    }
  },
  {
    id: "hyperliquid-perp-divergence",
    title: "⚡ The Perp Divergence Trap ($VIRTUAL on Base)",
    token: "VIRTUAL",
    tokenAddress: "0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b",
    chain: "base",
    userThesis: "Buying $VIRTUAL for the AI Agent narrative breakout. Daily spot chart looks ready for price discovery.",
    data: {
      tokenMetadata: {
        symbol: "VIRTUAL",
        name: "Virtual Protocol",
        chain: "base",
        priceUsd: 1.84,
        marketCapUsd: 1840000000,
        volume24hUsd: 48900000,
        liquidityUsd: 18400000,
        liquidityToMcapRatio: 0.01
      },
      smartMoney: {
        cohort: "Smart DEX Trader + Fund",
        netflow24hUsd: 380000, // mild spot accumulation
        netflow4hUsd: -95000,
        smartHoldersCount: 24,
        smartHoldersDelta24h: 1,
        topHoldersSharePct: 34.2,
        cohortSentiment: "MILD_ACCUMULATION"
      },
      cabalAnalysis: {
        cabalCentralityIndex: 18,
        analyzedTopHolders: 20,
        clusteredWallets: 2,
        rootFunderAddress: "None detected (Decentralized holder base)",
        fundingPattern: "Independent CEX on-ramps (Coinbase, OKX, Binance)",
        sharedCounterparties: 1,
        insiderSupplyControlPct: 8.5
      },
      perpsAndDerivatives: {
        hasPerps: true,
        exchange: "Hyperliquid",
        perpSentiment: "HEAVILY_SHORT",
        topPnlWhalePositioning: "74% Short ($16.8M short OI vs $5.9M long OI)",
        fundingRateHourly: -0.018,
        openInterestChange24hPct: 42.5,
        divergenceFlag: "HIGH_RISK_HEDGING: Top 10 PnL perp traders are aggressively opening shorts into spot breakout"
      },
      automatedExecution: {
        jupiterDcaSellingDetected: false,
        activeSellOrdersCount: 0,
        pendingSellVolumeUsd: 0,
        sellPressureCadence: "Normal market flow"
      },
      verdict: {
        score: 58,
        status: "HIGH_FRICTION",
        summary: "DIVERGENCE WARNING: Spot fundamentals look decent, but Hyperliquid perp intelligence reveals top-ranking PnL whales are 74% net short. Institutional funds appear to be spot-accumulating while using perps to hedge or actively anticipating a harsh leverage flush.",
        actionableRecommendation: "Wait for perp open interest liquidation flush before entering spot, or tighten stop-loss."
      }
    }
  },
  {
    id: "validated-defi-conviction",
    title: "💎 The High-Conviction Institutional Accumulation ($AAVE on Ethereum)",
    token: "AAVE",
    tokenAddress: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
    chain: "ethereum",
    userThesis: "Accumulating $AAVE on 3-month support. Protocol revenue is up 40% and tokenomics fee switch is approaching.",
    data: {
      tokenMetadata: {
        symbol: "AAVE",
        name: "Aave Token",
        chain: "ethereum",
        priceUsd: 168.50,
        marketCapUsd: 2520000000,
        volume24hUsd: 185000000,
        liquidityUsd: 94000000,
        liquidityToMcapRatio: 0.037
      },
      smartMoney: {
        cohort: "Smart DEX Trader + Fund",
        netflow24hUsd: 4250000, // strong accumulation
        netflow4hUsd: 1200000,
        smartHoldersCount: 68,
        smartHoldersDelta24h: 4,
        topHoldersSharePct: 22.1,
        cohortSentiment: "STRONG_ACCUMULATION"
      },
      cabalAnalysis: {
        cabalCentralityIndex: 4,
        analyzedTopHolders: 25,
        clusteredWallets: 0,
        rootFunderAddress: "None",
        fundingPattern: "Fully organic institutional custody (Fireblocks, Anchorage, Gnosis Safe)",
        sharedCounterparties: 0,
        insiderSupplyControlPct: 3.1
      },
      perpsAndDerivatives: {
        hasPerps: true,
        exchange: "Hyperliquid / Binance",
        perpSentiment: "MODERATELY_BULLISH",
        topPnlWhalePositioning: "62% Long ($38.5M long OI vs $23.6M short OI)",
        fundingRateHourly: 0.004,
        openInterestChange24hPct: 8.2,
        divergenceFlag: "ALIGNED: Spot smart money flows and perp positioning are both positive"
      },
      automatedExecution: {
        jupiterDcaSellingDetected: false,
        activeSellOrdersCount: 0,
        pendingSellVolumeUsd: 0,
        sellPressureCadence: "No predatory automated liquidation triggers found"
      },
      verdict: {
        score: 14,
        status: "RESILIENT",
        summary: "THESIS VALIDATED: On-chain data strongly backs your thesis. Smart Money cohorts bought +$4.25M in the last 24h, holder distribution is institutional and decentralized, and top PnL perp traders are aligned long.",
        actionableRecommendation: "THESIS HOLDS. Strong risk-reward profile backed by real institutional accumulation."
      }
    }
  },
  {
    id: "sybil-wash-circular",
    title: "⚠️ The Fake Volume Sybil Ring ($WASH on Arbitrum)",
    token: "WASH",
    tokenAddress: "0x34a1239847120389148209384729384719238123",
    chain: "arbitrum",
    userThesis: "Token is trending #1 on DEX screeners with 3,000% volume surge in 6 hours. Expecting continuation.",
    data: {
      tokenMetadata: {
        symbol: "WASH",
        name: "WashAI Token",
        chain: "arbitrum",
        priceUsd: 0.0089,
        marketCapUsd: 8900000,
        volume24hUsd: 32000000, // $32M fake volume on $8.9M mcap!
        liquidityUsd: 120000,   // $120k liquidity!
        liquidityToMcapRatio: 0.013
      },
      smartMoney: {
        cohort: "Smart DEX Trader + Fund",
        netflow24hUsd: 0,
        netflow4hUsd: 0,
        smartHoldersCount: 0, // Zero smart money!
        smartHoldersDelta24h: 0,
        topHoldersSharePct: 91.2,
        cohortSentiment: "ZERO_SMART_MONEY_INTEREST"
      },
      cabalAnalysis: {
        cabalCentralityIndex: 96,
        analyzedTopHolders: 20,
        clusteredWallets: 18,
        rootFunderAddress: "0x19a842bC78201C319D8b7b25E2e46b0b2e2d8471",
        fundingPattern: "Circular wash-trading loops between 4 bot clusters swapping back and forth to spoof DEX volume bots",
        sharedCounterparties: 14,
        insiderSupplyControlPct: 88.4
      },
      perpsAndDerivatives: {
        hasPerps: false,
        exchange: "N/A",
        perpSentiment: "N/A"
      },
      automatedExecution: {
        jupiterDcaSellingDetected: false,
        activeSellOrdersCount: 0,
        pendingSellVolumeUsd: 0,
        sellPressureCadence: "Bots executing circular swaps every 12 seconds"
      },
      verdict: {
        score: 96,
        status: "SHREDDED",
        summary: "100% ARTIFICIAL VOLUME: 18 of the top 20 wallets are bots engaging in circular wash trading to fake screener rankings. Real Smart Money has zero holdings or exposure. Liquidity is paper-thin ($120K) against $32M reported volume.",
        actionableRecommendation: "ABSOLUTE AVOID. High slippage and immediate honeypot / dump probability."
      }
    }
  }
];

module.exports = {
  PRESET_THESES
};
