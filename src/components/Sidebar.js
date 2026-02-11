import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCryptoList } from '../redux/actions/cryptoActions';
import { formatCurrency } from '../utils/formatters';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { cryptoList, loading, error } = useSelector(state => state.crypto);
  const { baseCurrency, currencySymbol } = useSelector(state => state.currency);

  useEffect(() => {
    dispatch(fetchCryptoList(baseCurrency, 50));
  }, [dispatch, baseCurrency]);

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-4 hover-lift">
        <h2 className="text-xl font-bold mb-4 gradient-text">Top Cryptocurrencies</h2>
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">₿</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-4 hover-lift">
        <h2 className="text-xl font-bold mb-4 gradient-text">Top Cryptocurrencies</h2>
        <div className="text-red-600 text-center p-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl hover-lift overflow-hidden">
      <div className="glass-dark p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-white">🏆 Top Cryptocurrencies</h2>
        <p className="text-sm text-gray-300 mt-1">By Market Cap</p>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
        {cryptoList.slice(0, 50).map((crypto, index) => (
          <div
            key={crypto.id}
            className="p-4 border-b border-gray-100 hover:bg-purple-50 transition-all cursor-pointer crypto-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <span className="absolute -top-1 -left-1 text-xs font-bold text-purple-600">#{index + 1}</span>
                  <img
                    src={crypto.image}
                    alt={crypto.name}
                    className="w-10 h-10 rounded-full ring-2 ring-purple-100"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 truncate flex items-center gap-2">
                    {crypto.name}
                    {index < 3 && (
                      <span className="text-lg">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 uppercase">
                    {crypto.symbol}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-gray-800">
                  {formatCurrency(crypto.current_price, currencySymbol)}
                </div>
                <div className={`text-sm font-semibold flex items-center gap-1 justify-end ${getChangeColor(crypto.price_change_percentage_24h)}`}>
                  <span>{getChangeIcon(crypto.price_change_percentage_24h)}</span>
                  <span>{crypto.price_change_percentage_24h?.toFixed(2)}%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-500">MCap:</span>
              <span className="font-semibold text-gray-700">
                {formatCurrency(crypto.market_cap, currencySymbol, 0)}
              </span>
            </div>
            
            {/* Mini progress bar */}
            <div className="progress-bar mt-2">
              <div 
                className="progress-fill"
                style={{ width: `${Math.min((crypto.market_cap / cryptoList[0].market_cap) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;