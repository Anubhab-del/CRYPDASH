import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCryptoList } from '../redux/actions/cryptoActions';
import Sidebar from './Sidebar';
import ExchangeRates from './ExchangeRates';
import MarketCapPieChart from './MarketCapPieChart';
import PriceChart from './PriceChart';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { baseCurrency } = useSelector(state => state.currency);
  const { searchQuery, cryptoList, error, loading } = useSelector(state => state.crypto);
  const [lastCurrency, setLastCurrency] = useState(baseCurrency);
  const [showRateLimitWarning, setShowRateLimitWarning] = useState(false);

  useEffect(() => {
    if (baseCurrency !== lastCurrency) {
      console.log('Currency changed, fetching new data...');
      dispatch(fetchCryptoList(baseCurrency));
      setLastCurrency(baseCurrency);
    }
  }, [dispatch, baseCurrency, lastCurrency]);

  useEffect(() => {
    if (cryptoList.length === 0) {
      dispatch(fetchCryptoList(baseCurrency));
    }
  }, []);

  useEffect(() => {
    if (error && error.includes('Rate limit')) {
      setShowRateLimitWarning(true);
      setTimeout(() => setShowRateLimitWarning(false), 10000);
    }
  }, [error]);

  const filteredCryptoList = searchQuery
    ? cryptoList.filter(crypto =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : cryptoList;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Rate Limit Warning */}
        {showRateLimitWarning && (
          <div className="mb-4 glass rounded-xl p-4 border-l-4 border-yellow-400 animate-fade-in">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-yellow-800 font-semibold mb-1">⚡ API Rate Limited</h3>
                <p className="text-yellow-700 text-sm mb-2">
                  CoinGecko's free API has strict limits. Using cached data when available.
                </p>
                <p className="text-yellow-600 text-xs">
                  💡 Tip: Wait 60 seconds between currency changes for best results.
                </p>
              </div>
              <button
                onClick={() => setShowRateLimitWarning(false)}
                className="text-yellow-600 hover:text-yellow-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Global Error Message */}
        {error && (
          <div className="mb-4 glass rounded-xl p-4 bg-red-50 border-l-4 border-red-500 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-red-800 font-medium">{error}</p>
                  <p className="text-red-600 text-sm">Using cached data. Wait before retrying.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  dispatch(fetchCryptoList(baseCurrency));
                  setShowRateLimitWarning(false);
                }}
                disabled={loading}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Retry'}
              </button>
            </div>
          </div>
        )}

        {/* Search Results Banner */}
        {searchQuery && (
          <div className="mb-4 glass rounded-xl p-4 border-l-4 border-blue-500 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-blue-800 font-medium">
                  🔍 Found {filteredCryptoList.length} results for "{searchQuery}"
                </span>
              </div>
              <button
                onClick={() => dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 animate-slide-in">
            <Sidebar />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <PriceChart />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <ExchangeRates />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <MarketCapPieChart />
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Grid */}
        {searchQuery && filteredCryptoList.length > 0 && (
          <div className="mt-6 glass rounded-2xl p-6 animate-fade-in">
            <h2 className="text-xl font-bold gradient-text mb-4">🔎 Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCryptoList.map((crypto) => (
                <div
                  key={crypto.id}
                  className="crypto-card glass p-4 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-12 h-12 rounded-full ring-2 ring-purple-100"
                    />
                    <div>
                      <div className="font-bold text-gray-800">{crypto.name}</div>
                      <div className="text-sm text-gray-500 uppercase">{crypto.symbol}</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-bold">${crypto.current_price?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">24h:</span>
                      <span className={crypto.price_change_percentage_24h >= 0 ? 'badge-success' : 'badge-danger'}>
                        {crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h?.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">MCap:</span>
                      <span className="font-semibold text-xs">
                        ${(crypto.market_cap / 1e9).toFixed(2)}B
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Stats Badge */}
      <div className="fixed bottom-6 left-6 glass-dark rounded-xl p-3 text-white text-xs z-40 hidden lg:block animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live Data • {cryptoList.length} Coins</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;