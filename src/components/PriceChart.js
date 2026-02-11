import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import {
  fetchMarketChart,
  setChartType,
  addSelectedCrypto,
  removeSelectedCrypto
} from '../redux/actions/chartActions';
import { formatDate, formatCurrency } from '../utils/formatters';

// Register Chart.js components INCLUDING TimeScale
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

const PriceChart = () => {
  const dispatch = useDispatch();
  const { chartData, loading, selectedCryptos, chartType, error } = useSelector(state => state.chart);
  const { baseCurrency, currencySymbol } = useSelector(state => state.currency);
  const { cryptoList } = useSelector(state => state.crypto);
  
  const [timeRange, setTimeRange] = useState('7');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    selectedCryptos.forEach(cryptoId => {
      dispatch(fetchMarketChart(cryptoId, baseCurrency, timeRange));
    });
  }, [dispatch, selectedCryptos, baseCurrency, timeRange]);

  const colors = [
    { border: 'rgb(102, 126, 234)', bg: 'rgba(102, 126, 234, 0.1)' },
    { border: 'rgb(239, 68, 68)', bg: 'rgba(239, 68, 68, 0.1)' },
    { border: 'rgb(34, 197, 94)', bg: 'rgba(34, 197, 94, 0.1)' },
    { border: 'rgb(168, 85, 247)', bg: 'rgba(168, 85, 247, 0.1)' },
    { border: 'rgb(249, 115, 22)', bg: 'rgba(249, 115, 22, 0.1)' },
  ];

  const prepareChartData = () => {
    const datasets = selectedCryptos.map((cryptoId, index) => {
      const data = chartData[cryptoId];
      if (!data || !data.prices) return null;

      const crypto = cryptoList.find(c => c.id === cryptoId);
      const colorSet = colors[index % colors.length];

      return {
        label: crypto?.name || cryptoId,
        data: data.prices.map(price => ({
          x: price[0],
          y: price[1]
        })),
        borderColor: colorSet.border,
        backgroundColor: colorSet.bg,
        borderWidth: 3,
        fill: chartType === 'line',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
      };
    }).filter(Boolean);

    const labels = chartData[selectedCryptos[0]]?.prices.map(price => price[0]) || [];

    return {
      labels,
      datasets
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'bold',
            family: 'Inter'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          title: (context) => {
            return formatDate(context[0].parsed.x);
          },
          label: (context) => {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y, currencySymbol)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: timeRange === '1' ? 'hour' : 'day',
          displayFormats: {
            hour: 'MMM d, HH:mm',
            day: 'MMM d'
          }
        },
        ticks: {
          maxTicksLimit: 8,
          font: {
            family: 'Inter'
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          callback: (value) => formatCurrency(value, currencySymbol),
          font: {
            family: 'Inter'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  const handleAddCrypto = (cryptoId) => {
    if (selectedCryptos.length < 5) {
      dispatch(addSelectedCrypto(cryptoId));
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemoveCrypto = (cryptoId) => {
    if (selectedCryptos.length > 1) {
      dispatch(removeSelectedCrypto(cryptoId));
    }
  };

  const handleRetry = () => {
    selectedCryptos.forEach(cryptoId => {
      dispatch(fetchMarketChart(cryptoId, baseCurrency, timeRange));
    });
  };

  const filteredCryptos = cryptoList.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10);

  const ChartComponent = chartType === 'line' ? Line : Bar;

  // Check if chart data is available
  const hasChartData = selectedCryptos.some(cryptoId => chartData[cryptoId]?.prices);

  return (
    <div className="glass rounded-2xl p-6 hover-lift">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">📈</span>
          </div>
          <div>
            <h2 className="text-xl font-bold gradient-text">Price Chart</h2>
            <p className="text-xs text-gray-500">Compare multiple cryptocurrencies</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Chart Type Selector */}
          <select
            value={chartType}
            onChange={(e) => dispatch(setChartType(e.target.value))}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all"
          >
            <option value="line">📊 Line Chart</option>
            <option value="bar">📊 Bar Chart</option>
          </select>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all"
          >
            <option value="1">⏰ 24 Hours</option>
            <option value="7">📅 7 Days</option>
            <option value="30">📅 30 Days</option>
            <option value="90">📅 90 Days</option>
            <option value="365">📅 1 Year</option>
          </select>

          {/* Add Cryptocurrency Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={selectedCryptos.length >= 5}
              className="btn-primary px-6 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Crypto
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-72 glass border border-gray-200 rounded-xl shadow-xl z-10 animate-fade-in">
                <div className="p-3 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="🔍 Search cryptocurrencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    autoFocus
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredCryptos.map(crypto => (
                    <button
                      key={crypto.id}
                      onClick={() => handleAddCrypto(crypto.id)}
                      disabled={selectedCryptos.includes(crypto.id)}
                      className="w-full px-4 py-3 text-left hover:bg-purple-50 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all crypto-card"
                    >
                      <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full ring-2 ring-purple-100" />
                      <div>
                        <div className="font-semibold text-gray-800">{crypto.name}</div>
                        <div className="text-sm text-gray-500">{crypto.symbol.toUpperCase()}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Cryptocurrencies Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedCryptos.map((cryptoId, index) => {
          const crypto = cryptoList.find(c => c.id === cryptoId);
          return (
            <div
              key={cryptoId}
              className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold animate-fade-in"
              style={{
                backgroundColor: colors[index % colors.length].bg,
                border: `2px solid ${colors[index % colors.length].border}`
              }}
            >
              {crypto?.image && (
                <img src={crypto.image} alt={crypto.name} className="w-5 h-5 rounded-full" />
              )}
              <span>{crypto?.name || cryptoId}</span>
              {selectedCryptos.length > 1 && (
                <button
                  onClick={() => handleRemoveCrypto(cryptoId)}
                  className="hover:bg-white hover:bg-opacity-50 rounded-full p-1 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <p className="text-red-600 text-sm">Please wait a moment before trying again</p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Chart */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-96">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
          <p className="text-gray-500 mt-4 text-sm font-medium">Loading chart data...</p>
        </div>
      ) : !hasChartData ? (
        <div className="flex flex-col justify-center items-center h-96 text-gray-500 animate-fade-in">
          <svg className="w-16 h-16 mb-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-semibold">No chart data available</p>
          <p className="text-sm mt-2">Data is loading, please wait...</p>
          <button
            onClick={handleRetry}
            className="btn-primary mt-4 px-6 py-2.5 rounded-xl"
          >
            🔄 Reload Chart
          </button>
        </div>
      ) : (
        <div className="h-96 p-2">
          <ChartComponent data={prepareChartData()} options={options} />
        </div>
      )}

      {selectedCryptos.length >= 5 && (
        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-xl text-yellow-800 text-sm font-medium animate-fade-in">
          ⚠️ Maximum 5 cryptocurrencies can be compared at once. Remove one to add another.
        </div>
      )}
    </div>
  );
};

export default PriceChart;