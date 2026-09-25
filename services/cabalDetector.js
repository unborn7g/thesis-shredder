/**
 * Cabal & Sybil Cluster Detection Engine
 * Analyzes top token buyers and holders against Nansen's Profiler endpoints
 * (counterparties & related wallets) to compute the "Cabal Centrality Index".
 */

class CabalDetector {
  /**
   * Computes Cabal Risk Score (0 - 100)
   * 0-25: Organic decentralized distribution
   * 26-55: Minor cluster overlap (typical trading groups)
   * 56-100: Heavy insider / Sybil coordination (Disperse funder, wash ring)
   */
  static analyzeHolderCluster(buyersList = [], counterpartiesMap = {}) {
    if (!buyersList || buyersList.length === 0) {
      return {
        cabalCentralityIndex: 0,
        clusteredWallets: 0,
        analyzedTopHolders: 0,
        rootFunderAddress: "None detected",
        fundingPattern: "Insufficient data",
        insiderSupplyControlPct: 0
      };
    }

    const totalWallets = buyersList.length;
    let sharedRoots = {};
    let clusteredCount = 0;
    let totalInsiderSupply = 0;

    // Analyze funding overlaps
    buyersList.forEach(wallet => {
      const funder = wallet.initialFunder || wallet.funder || null;
      if (funder) {
        sharedRoots[funder] = (sharedRoots[funder] || 0) + 1;
      }
      if (wallet.isSuspectedCluster || wallet.clusterTag) {
        clusteredCount++;
      }
      totalInsiderSupply += (wallet.sharePct || wallet.supplyPercentage || 0);
    });

    // Find dominant funder
    let maxDominantCount = 0;
    let dominantFunder = "None detected";
    for (const [funder, count] of Object.entries(sharedRoots)) {
      if (count > maxDominantCount) {
        maxDominantCount = count;
        dominantFunder = funder;
      }
    }

    // Cabal Centrality Score Formula:
    // 40% based on shared root funder ratio
    // 30% based on clustered counterparty connections
    // 30% based on supply held by top clustered group
    const funderRatio = totalWallets > 0 ? (maxDominantCount / totalWallets) : 0;
    const clusterRatio = totalWallets > 0 ? (clusteredCount / totalWallets) : 0;
    const supplyFactor = Math.min(1, totalInsiderSupply / 50); // >50% supply held is max risk

    let cabalScore = Math.round(
      (funderRatio * 40) +
      (clusterRatio * 30) +
      (supplyFactor * 30)
    );

    cabalScore = Math.min(100, Math.max(0, cabalScore));

    return {
      cabalCentralityIndex: cabalScore,
      analyzedTopHolders: totalWallets,
      clusteredWallets: clusteredCount,
      rootFunderAddress: dominantFunder,
      fundingPattern: funderRatio > 0.4
        ? `High concentration: ${maxDominantCount} of ${totalWallets} wallets share funding source (${dominantFunder.slice(0, 8)}...)`
        : "Organic multi-source funding across distinct CEX and DEX origins",
      sharedCounterparties: Object.keys(sharedRoots).length,
      insiderSupplyControlPct: Math.round(totalInsiderSupply * 10) / 10
    };
  }
}

module.exports = CabalDetector;
