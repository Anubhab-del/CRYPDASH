import axios from 'axios';

// Use a CORS proxy for development
const USE_PROXY = true;
const CORS_PROXY = 'https://corsproxy.io/?';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Get the full URL with or without proxy
const getUrl = (endpoint) => {
  const url = `${COINGECKO_API}${endpoint}`;
  return USE_PROXY ? `${CORS_PROXY}${encodeURIComponent(url)}` : url;
};

// In-memory cache
const cache = new Map();
const CACHE_DURATION = 60000; // 60 seconds - increased for rate limiting

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests - increased
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 10;
let requestResetTime = Date.now();

// Request queue
let requestQueue = [];
let isProcessingQueue = false;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getCacheKey = (endpoint, params) => {
  return `${endpoint}_${JSON.stringify(params)}`;
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✅ Cache hit:', key);
    return cached.data;
  }
  return null;
};

const setCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log('💾 Cached:', key);
};

const checkRateLimit = async () => {
  const now = Date.now();
  
  // Reset counter every minute
  if (now - requestResetTime > 60000) {
    requestCount = 0;
    requestResetTime = now;
  }
  
  // Check if we've exceeded per-minute limit
  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    const waitTime = 60000 - (now - requestResetTime);
    console.warn(`⏸️ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s`);
    await wait(waitTime);
    requestCount = 0;
    requestResetTime = Date.now();
  }
  
  // Check time since last request
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏱️ Throttling: waiting ${waitTime}ms`);
    await wait(waitTime);
  }
};

const throttledRequest = async (config) => {
  await checkRateLimit();
  
  lastRequestTime = Date.now();
  requestCount++;
  
  console.log(`🌐 Request #${requestCount}:`, config.url);
  
  try {
    return await axios(config);
  } catch (error) {
    // If rate limited, wait and throw error with better message
    if (error.response?.status === 429) {
      console.error('❌ 429 Error - Rate limited!');
      await wait(5000); // Wait 5 seconds before next request
      throw new Error('Rate limit exceeded. Please wait 1 minute.');
    }
    throw error;
  }
};

const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;
  console.log(`📋 Processing queue: ${requestQueue.length} items`);

  while (requestQueue.length > 0) {
    const { config, resolve, reject } = requestQueue.shift();
    
    try {
      const response = await throttledRequest(config);
      resolve(response);
    } catch (error) {
      reject(error);
    }
    
    if (requestQueue.length > 0) {
      await wait(MIN_REQUEST_INTERVAL);
    }
  }

  isProcessingQueue = false;
  console.log('✅ Queue processed');
};

const queuedRequest = (config) => {
  return new Promise((resolve, reject) => {
    requestQueue.push({ config, resolve, reject });
    processQueue();
  });
};

// Mock data fallbacks
const getMockCryptoList = (currency = 'usd') => {
  const mockData = [
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      current_price: 95000,
      market_cap: 1850000000000,
      price_change_percentage_24h: 2.5
    },
    {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      current_price: 3200,
      market_cap: 385000000000,
      price_change_percentage_24h: 1.8
    },
    {
      id: 'tether',
      symbol: 'usdt',
      name: 'Tether',
      image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
      current_price: 1,
      market_cap: 95000000000,
      price_change_percentage_24h: 0.01
    }
  ];
  return mockData;
};

const getMockMarketChart = () => {
  const prices = [];
  const now = Date.now();
  for (let i = 7; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    const price = 95000 + (Math.random() - 0.5) * 10000;
    prices.push([timestamp, price]);
  }
  return { prices };
};

export const apiService = {
  async getCryptoList(currency = 'usd', perPage = 100) {
    const cacheKey = getCacheKey('markets', { currency, perPage });
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const endpoint = `/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=false&price_change_percentage=24h`;
      
      const config = {
        method: 'get',
        url: getUrl(endpoint),
        timeout: 20000
      };

      const response = await queuedRequest(config);
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('⚠️ Using mock data for crypto list');
      const mockData = getMockCryptoList(currency);
      setCache(cacheKey, mockData);
      return mockData;
    }
  },

  async getMarketChart(coinId, currency = 'usd', days = '7') {
    const cacheKey = getCacheKey(`chart_${coinId}`, { currency, days });
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const interval = days === '1' ? 'hourly' : 'daily';
      const endpoint = `/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}&interval=${interval}`;
      
      const config = {
        method: 'get',
        url: getUrl(endpoint),
        timeout: 20000
      };

      const response = await queuedRequest(config);
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error(`⚠️ Using mock data for ${coinId} chart`);
      const mockData = getMockMarketChart();
      setCache(cacheKey, mockData);
      return mockData;
    }
  },

  async getGlobalMarket() {
    const cacheKey = getCacheKey('global', {});
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const endpoint = '/global';
      
      const config = {
        method: 'get',
        url: getUrl(endpoint),
        timeout: 20000
      };

      const response = await queuedRequest(config);
      setCache(cacheKey, response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('⚠️ Using mock data for global market');
      const mockData = {
        total_market_cap: { usd: 2500000000000 },
        total_volume: { usd: 95000000000 }
      };
      setCache(cacheKey, mockData);
      return mockData;
    }
  },

  async getSimplePrices(coinIds, currencies) {
    const cacheKey = getCacheKey('prices', { coinIds, currencies });
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const ids = Array.isArray(coinIds) ? coinIds.join(',') : coinIds;
      const vs = Array.isArray(currencies) ? currencies.join(',') : currencies;
      const endpoint = `/simple/price?ids=${ids}&vs_currencies=${vs}&include_24hr_change=true`;
      
      const config = {
        method: 'get',
        url: getUrl(endpoint),
        timeout: 20000
      };

      const response = await queuedRequest(config);
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('⚠️ Using mock data for exchange rates');
      
      // Generate mock exchange rates
      const mockRates = {};
      const cryptoArray = Array.isArray(coinIds) ? coinIds : [coinIds];
      const currencyArray = Array.isArray(currencies) ? currencies : [currencies];
      
      cryptoArray.forEach(crypto => {
        mockRates[crypto] = {};
        currencyArray.forEach(curr => {
          if (crypto === 'bitcoin') {
            mockRates[crypto][curr] = curr === 'usd' ? 95000 : 
                                      curr === 'eur' ? 87000 :
                                      curr === 'gbp' ? 75000 :
                                      curr === 'inr' ? 7900000 : 95000;
          } else if (crypto === 'ethereum') {
            mockRates[crypto][curr] = curr === 'usd' ? 3200 : 
                                      curr === 'eur' ? 2930 :
                                      curr === 'gbp' ? 2520 :
                                      curr === 'inr' ? 266400 : 3200;
          } else {
            mockRates[crypto][curr] = curr === 'usd' ? 1 : 0.92;
          }
        });
      });
      
      setCache(cacheKey, mockRates);
      return mockRates;
    }
  },

  clearCache() {
    cache.clear();
    requestCount = 0;
    console.log('🗑️ Cache and rate limit cleared');
  }
};