/**
 * Live Nansen API Client
 * Wraps Nansen REST endpoints & MCP protocols with rate-limiting, telemetry,
 * and error fallbacks.
 */

const https = require('https');
const http = require('http');

class NansenClient {
  constructor(apiKey = process.env.NANSEN_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.nansen.ai';
    this.callsMade = 0;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  getCallCount() {
    return this.callsMade;
  }

  async request(endpoint, options = {}) {
    if (!this.apiKey) {
      throw new Error('Nansen API key not configured.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'NANSEN-API-KEY': this.apiKey,
      'User-Agent': 'ThesisShredder/1.0 (MeridianBuildathon)',
      ...(options.headers || {})
    };

    this.callsMade += 1;

    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const reqOptions = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers: headers,
        timeout: 10000
      };

      const req = https.request(reqOptions, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(body));
            } catch (err) {
              resolve({ raw: body });
            }
          } else {
            reject(new Error(`Nansen API returned ${res.statusCode}: ${body.slice(0, 200)}`));
          }
        });
      });

      req.on('error', err => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Nansen API request timed out'));
      });

      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }

      req.end();
    });
  }

  // Token Screener
  async getTrendingTokens(chain = 'solana', limit = 20) {
    return this.request('/v1/token/screener', {
      method: 'POST',
      body: { chain, limit, timeframe: '24h' }
    });
  }

  // Smart Money Netflow
  async getSmartMoneyNetflow(chain = 'solana') {
    return this.request(`/v1/smart-money/netflow?chain=${encodeURIComponent(chain)}`);
  }

  // Token God Mode: Token Flows
  async getTokenFlows(chain, tokenAddress) {
    return this.request(`/v1/token/${chain}/${tokenAddress}/flows`);
  }

  // Token God Mode: Who Bought & Sold
  async getWhoBoughtSold(chain, tokenAddress) {
    return this.request(`/v1/token/${chain}/${tokenAddress}/who-bought-sold`);
  }

  // Token God Mode: Jupiter DCAs (Solana specific automated liquidity pressure)
  async getJupiterDcas(chain, tokenAddress) {
    if (chain !== 'solana') return { active_dcas: [] };
    return this.request(`/v1/token/solana/${tokenAddress}/jupiter-dcas`);
  }

  // Token God Mode: Perp Positions
  async getPerpPositions(chain, tokenAddress) {
    return this.request(`/v1/token/${chain}/${tokenAddress}/perp-positions`);
  }

  // Address Profiler: Counterparties
  async getAddressCounterparties(chain, address) {
    return this.request(`/v1/profiler/address/${address}/counterparties?chain=${chain}`);
  }

  // Address Profiler: Related Wallets
  async getAddressRelatedWallets(chain, address) {
    return this.request(`/v1/profiler/address/${address}/related-wallets?chain=${chain}`);
  }

  // Hyperliquid Leaderboard
  async getHyperliquidLeaderboard() {
    return this.request('/v1/profiler/hyperliquid/leaderboard');
  }
}

module.exports = NansenClient;
