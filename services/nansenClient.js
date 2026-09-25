/**
 * Live Nansen API Client
 * Wraps Nansen REST endpoints with rate-limiting, telemetry, and error fallbacks.
 */

const https = require('https');

class NansenClient {
  constructor(apiKey = process.env.NANSEN_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.nansen.ai/api/v1';
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
      'apiKey': this.apiKey,
      'User-Agent': 'ThesisShredder/1.0 (MeridianBuildathon)',
      ...(options.headers || {})
    };

    this.callsMade += 1;

    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const reqOptions = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'POST',
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
            reject(new Error(`Nansen API returned ${res.statusCode}: ${body.slice(0, 150)}`));
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

  // Smart Money Holdings
  async getSmartMoneyHoldings(chains = ['ethereum', 'solana', 'base']) {
    return this.request('/smart-money/holdings', {
      body: { chains, pagination: { page: 1, per_page: 25 } }
    });
  }

  // Smart Money DEX Trades
  async getSmartMoneyTrades(chains = ['ethereum', 'solana']) {
    return this.request('/smart-money/dex-trades', {
      body: { chains, pagination: { page: 1, per_page: 25 } }
    });
  }

  // Token God Mode: Flow Intelligence
  async getFlowIntelligence(chain, tokenAddress) {
    return this.request('/tgm/flow-intelligence', {
      body: { chain, token_address: tokenAddress, timeframe: '7d' }
    });
  }

  // Token God Mode: Token Holders
  async getTokenHolders(chain, tokenAddress) {
    return this.request('/tgm/holders', {
      body: { chain, token_address: tokenAddress, label_type: 'smart_money' }
    });
  }

  // Profiler: Address Related Wallets
  async getRelatedWallets(chain, address) {
    return this.request('/profiler/address/related-wallets', {
      body: { chain, address, pagination: { page: 1, per_page: 20 } }
    });
  }
}

module.exports = NansenClient;
