import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { fetchGlobalMarket } from '../redux/actions/marketActions';
import { formatCurrency } from '../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

const MarketCapPieChart = () => {
  const dispatch = useDispatch();
  const { globalMarketData, loading } = useSelector(state => state.market);
  const { currencySymbol } = useSelector(state => state.currency);
  const { cryptoList } = useSelector(state => state.crypto);

  useEffect(() => {
    dispatch(fetchGlobalMarket());
  }, [dispatch]);

  if (loading || !globalMarketData) {
    return (
      <div className="glass rounded-2xl p-6 hover-lift">
        <h2 className="text-xl font-bold gradient-text mb-4">Market Cap Distribution</h2>
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const topCryptos = cryptoList.slice(0, 10);
  
  const data = {
    labels: topCryptos.map(crypto => crypto.name),
    datasets: [{
      label: 'Market Cap',
      data: topCryptos.map(crypto => crypto.market_cap),
      backgroundColor: [
        'rgba(102, 126, 234, 0.9)',
        'rgba(239, 68, 68, 0.9)',
        'rgba(34, 197, 94, 0.9)',
        'rgba(168, 85, 247, 0.9)',
        'rgba(249, 115, 22, 0.9)',
        'rgba(59, 130, 246, 0.9)',
        'rgba(236, 72, 153, 0.9)',
        'rgba(20, 184, 166, 0.9)',
        'rgba(251, 191, 36, 0.9)',
        'rgba(139, 92, 246, 0.9)',
      ],
      borderColor: '#fff',
      borderWidth: 3,
      hoverOffset: 15
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          font: { size: 11, weight: 'bold' },
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                return {
                  text: `${label}: ${formatCurrency(value, currencySymbol, 0)}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            return [
              `${label}`,
              `Value: ${formatCurrency(value, currencySymbol, 0)}`,
              `Share: ${percentage}%`
            ];
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  return (
    <div className="glass rounded-2xl p-6 hover-lift">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-xl">📊</span>
        </div>
        <div>
          <h2 className="text-xl font-bold gradient-text">Market Cap Distribution</h2>
          <p className="text-xs text-gray-500">Top 10 Cryptocurrencies</p>
        </div>
      </div>
      
      <div className="h-80 mb-4">
        <Pie data={data} options={options} />
      </div>
      
      <div className="glass-dark p-4 rounded-xl text-center">
        <div className="text-sm text-gray-300 mb-1">🌍 Total Market Cap</div>
        <div className="text-2xl font-bold text-white">
          {formatCurrency(globalMarketData.total_market_cap?.[Object.keys(globalMarketData.total_market_cap)[0]], currencySymbol, 0)}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Across {cryptoList.length}+ cryptocurrencies
        </div>
      </div>
    </div>
  );
};

export default MarketCapPieChart;