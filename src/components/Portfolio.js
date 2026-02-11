import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { portfolioService } from '../services/portfolioService';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { Pie } from 'react-chartjs-2';

const Portfolio = ({ isOpen, onClose }) => {
  const { cryptoList } = useSelector(state => state.crypto);
  const { currencySymbol } = useSelector(state => state.currency);
  
  const [portfolio, setPortfolio] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  const [newHolding, setNewHolding] = useState({
    coinId: 'bitcoin',
    amount: '',
    averagePrice: ''
  });
  
  const [newAlert, setNewAlert] = useState({
    coinId: 'bitcoin',
    type: 'above',
    targetPrice: ''
  });

  useEffect(() => {
    loadPortfolioData();
    const interval = setInterval(checkPriceAlerts, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadPortfolioData = () => {
    setPortfolio(portfolioService.getPortfolio());
    setAlerts(portfolioService.getAlerts());
    setTransactions(portfolioService.getTransactions());
  };

  const checkPriceAlerts = () => {
    if (cryptoList.length === 0) return;
    
    const prices = {};
    cryptoList.forEach(crypto => {
      prices[crypto.id] = crypto.current_price;
    });
    
    const triggered = portfolioService.checkAlerts(prices);
    if (triggered.length > 0) {
      triggered.forEach(alert => {
        showNotification(alert);
      });
      loadPortfolioData();
    }
  };

  const showNotification = (alert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🔔 Price Alert Triggered!', {
        body: `${alert.coinName} is now ${alert.type} ${currencySymbol}${alert.targetPrice}`,
        icon: alert.coinImage
      });
    } else {
      alert(`🔔 ${alert.coinName} is now ${alert.type} ${currencySymbol}${alert.targetPrice}`);
    }
  };

  const handleAddHolding = () => {
    if (!newHolding.amount || !newHolding.averagePrice) {
      alert('Please fill in all fields');
      return;
    }
    
    const coin = cryptoList.find(c => c.id === newHolding.coinId);
    portfolioService.updateHolding({
      ...newHolding,
      amount: parseFloat(newHolding.amount),
      averagePrice: parseFloat(newHolding.averagePrice),
      coinName: coin?.name,
      coinSymbol: coin?.symbol,
      coinImage: coin?.image
    });
    
    portfolioService.addTransaction({
      type: 'buy',
      coinId: newHolding.coinId,
      coinName: coin?.name,
      amount: parseFloat(newHolding.amount),
      price: parseFloat(newHolding.averagePrice),
      total: parseFloat(newHolding.amount) * parseFloat(newHolding.averagePrice)
    });
    
    loadPortfolioData();
    setShowAddModal(false);
    setNewHolding({ coinId: 'bitcoin', amount: '', averagePrice: '' });
  };

  const handleRemoveHolding = (coinId) => {
    if (window.confirm('Remove this holding?')) {
      portfolioService.removeHolding(coinId);
      loadPortfolioData();
    }
  };

  const handleAddAlert = () => {
    if (!newAlert.targetPrice) {
      alert('Please enter target price');
      return;
    }
    
    const coin = cryptoList.find(c => c.id === newAlert.coinId);
    portfolioService.addAlert({
      ...newAlert,
      targetPrice: parseFloat(newAlert.targetPrice),
      coinName: coin?.name,
      coinImage: coin?.image
    });
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    loadPortfolioData();
    setShowAlertModal(false);
    setNewAlert({ coinId: 'bitcoin', type: 'above', targetPrice: '' });
  };

  const handleRemoveAlert = (id) => {
    portfolioService.removeAlert(id);
    loadPortfolioData();
  };

  // Calculate current prices
  const currentPrices = {};
  cryptoList.forEach(crypto => {
    currentPrices[crypto.id] = crypto.current_price;
  });

  const stats = portfolioService.calculateProfitLoss(portfolio, currentPrices);

  // Prepare pie chart data
  const portfolioChartData = {
    labels: portfolio.map(h => h.coinName),
    datasets: [{
      data: portfolio.map(h => h.amount * (currentPrices[h.coinId] || 0)),
      backgroundColor: [
        'rgba(102, 126, 234, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(249, 115, 22, 0.8)',
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 glass-dark p-6 flex items-center justify-between border-b border-gray-200 rounded-t-2xl">
          <div>
            <h2 className="text-3xl font-bold text-white">💼 My Portfolio</h2>
            <p className="text-gray-300 mt-1">Track your crypto investments</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat-card p-4 rounded-lg hover-lift">
              <div className="text-sm text-gray-600 mb-1">Total Invested</div>
              <div className="text-2xl font-bold gradient-text">
                {formatCurrency(stats.totalInvested, currencySymbol, 2)}
              </div>
            </div>
            
            <div className="stat-card p-4 rounded-lg hover-lift">
              <div className="text-sm text-gray-600 mb-1">Current Value</div>
              <div className="text-2xl font-bold gradient-text">
                {formatCurrency(stats.currentValue, currencySymbol, 2)}
              </div>
            </div>
            
            <div className="stat-card p-4 rounded-lg hover-lift">
              <div className="text-sm text-gray-600 mb-1">Profit/Loss</div>
              <div className={`text-2xl font-bold ${stats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.profitLoss >= 0 ? '+' : ''}{formatCurrency(stats.profitLoss, currencySymbol, 2)}
              </div>
            </div>
            
            <div className="stat-card p-4 rounded-lg hover-lift">
              <div className="text-sm text-gray-600 mb-1">ROI</div>
              <div className={`text-2xl font-bold ${stats.profitLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.profitLossPercent >= 0 ? '+' : ''}{stats.profitLossPercent.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex-1"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Holding
              </span>
            </button>
            
            <button
              onClick={() => setShowAlertModal(true)}
              className="btn-primary flex-1"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Set Alert
              </span>
            </button>
          </div>

          {/* Holdings and Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Holdings Table */}
            <div className="glass rounded-xl p-4">
              <h3 className="text-lg font-bold mb-4 gradient-text">Holdings</h3>
              {portfolio.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="font-medium">No holdings yet</p>
                  <p className="text-sm mt-1">Add your first crypto holding</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {portfolio.map(holding => {
                    const currentPrice = currentPrices[holding.coinId] || 0;
                    const currentValue = holding.amount * currentPrice;
                    const profitLoss = currentValue - (holding.amount * holding.averagePrice);
                    const profitLossPercent = ((currentPrice - holding.averagePrice) / holding.averagePrice) * 100;
                    
                    return (
                      <div key={holding.id} className="crypto-card p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <img src={holding.coinImage} alt={holding.coinName} className="w-8 h-8 rounded-full" />
                            <div>
                              <div className="font-bold">{holding.coinName}</div>
                              <div className="text-sm text-gray-500">{formatNumber(holding.amount, 4)} {holding.coinSymbol.toUpperCase()}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveHolding(holding.coinId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Avg Price: </span>
                            <span className="font-semibold">{formatCurrency(holding.averagePrice, currencySymbol)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Current: </span>
                            <span className="font-semibold">{formatCurrency(currentPrice, currencySymbol)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Value: </span>
                            <span className="font-semibold">{formatCurrency(currentValue, currencySymbol)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">P/L: </span>
                            <span className={profitLoss >= 0 ? 'badge-success' : 'badge-danger'}>
                              {profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Portfolio Distribution Chart */}
            <div className="glass rounded-xl p-4">
              <h3 className="text-lg font-bold mb-4 gradient-text">Distribution</h3>
              {portfolio.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Add holdings to see distribution
                </div>
              ) : (
                <div className="h-64">
                  <Pie data={portfolioChartData} options={{ maintainAspectRatio: false }} />
                </div>
              )}
            </div>
          </div>

          {/* Price Alerts */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-lg font-bold mb-4 gradient-text">Price Alerts ({alerts.length})</h3>
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No price alerts set
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {alerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg border ${alert.triggered ? 'bg-green-50 border-green-300' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img src={alert.coinImage} alt={alert.coinName} className="w-6 h-6 rounded-full" />
                        <span className="font-semibold text-sm">{alert.coinName}</span>
                      </div>
                      {!alert.triggered && (
                        <button
                          onClick={() => handleRemoveAlert(alert.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Alert when </span>
                      <span className="font-semibold">{alert.type} {formatCurrency(alert.targetPrice, currencySymbol)}</span>
                    </div>
                    {alert.triggered && (
                      <div className="mt-2 text-xs text-green-600 font-medium">
                        ✓ Triggered
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="glass rounded-xl p-4">
            <h3 className="text-lg font-bold mb-4 gradient-text">Recent Transactions</h3>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'buy' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {tx.type === 'buy' ? '📈' : '📉'}
                      </div>
                      <div>
                        <div className="font-semibold">{tx.type.toUpperCase()} {tx.coinName}</div>
                        <div className="text-sm text-gray-500">{new Date(tx.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatNumber(tx.amount, 4)}</div>
                      <div className="text-sm text-gray-500">@ {formatCurrency(tx.price, currencySymbol)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Holding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full animate-fade-in">
            <h3 className="text-2xl font-bold mb-4 gradient-text">Add Holding</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cryptocurrency</label>
                <select
                  value={newHolding.coinId}
                  onChange={(e) => setNewHolding({ ...newHolding, coinId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {cryptoList.slice(0, 50).map(crypto => (
                    <option key={crypto.id} value={crypto.id}>
                      {crypto.name} ({crypto.symbol.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  step="0.00000001"
                  value={newHolding.amount}
                  onChange={(e) => setNewHolding({ ...newHolding, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Average Buy Price ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  value={newHolding.averagePrice}
                  onChange={(e) => setNewHolding({ ...newHolding, averagePrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddHolding}
                className="btn-primary flex-1"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full animate-fade-in">
            <h3 className="text-2xl font-bold mb-4 gradient-text">Set Price Alert</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cryptocurrency</label>
                <select
                  value={newAlert.coinId}
                  onChange={(e) => setNewAlert({ ...newAlert, coinId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {cryptoList.slice(0, 50).map(crypto => (
                    <option key={crypto.id} value={crypto.id}>
                      {crypto.name} ({crypto.symbol.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Alert Type</label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="above">Price Above</option>
                  <option value="below">Price Below</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Target Price ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAlert.targetPrice}
                  onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAlertModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAlert}
                className="btn-primary flex-1"
              >
                Set Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;