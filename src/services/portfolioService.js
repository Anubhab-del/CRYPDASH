// Portfolio management with localStorage
const PORTFOLIO_KEY = 'crypto_portfolio';
const ALERTS_KEY = 'crypto_alerts';
const TRANSACTIONS_KEY = 'crypto_transactions';

export const portfolioService = {
  // Get portfolio
  getPortfolio() {
    const data = localStorage.getItem(PORTFOLIO_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Add or update holding
  updateHolding(holding) {
    const portfolio = this.getPortfolio();
    const existingIndex = portfolio.findIndex(h => h.coinId === holding.coinId);
    
    if (existingIndex >= 0) {
      portfolio[existingIndex] = {
        ...portfolio[existingIndex],
        amount: holding.amount,
        averagePrice: holding.averagePrice,
        updatedAt: new Date().toISOString()
      };
    } else {
      portfolio.push({
        ...holding,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
    return portfolio;
  },

  // Remove holding
  removeHolding(coinId) {
    let portfolio = this.getPortfolio();
    portfolio = portfolio.filter(h => h.coinId !== coinId);
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
    return portfolio;
  },

  // Get alerts
  getAlerts() {
    const data = localStorage.getItem(ALERTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Add alert
  addAlert(alert) {
    const alerts = this.getAlerts();
    alerts.push({
      ...alert,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      triggered: false
    });
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    return alerts;
  },

  // Remove alert
  removeAlert(id) {
    let alerts = this.getAlerts();
    alerts = alerts.filter(a => a.id !== id);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    return alerts;
  },

  // Check alerts
  checkAlerts(currentPrices) {
    const alerts = this.getAlerts();
    const triggered = [];
    
    const updatedAlerts = alerts.map(alert => {
      const price = currentPrices[alert.coinId];
      if (!price || alert.triggered) return alert;
      
      let shouldTrigger = false;
      if (alert.type === 'above' && price >= alert.targetPrice) {
        shouldTrigger = true;
      } else if (alert.type === 'below' && price <= alert.targetPrice) {
        shouldTrigger = true;
      }
      
      if (shouldTrigger) {
        triggered.push(alert);
        return { ...alert, triggered: true, triggeredAt: new Date().toISOString() };
      }
      
      return alert;
    });
    
    localStorage.setItem(ALERTS_KEY, JSON.stringify(updatedAlerts));
    return triggered;
  },

  // Get transactions
  getTransactions() {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Add transaction
  addTransaction(transaction) {
    const transactions = this.getTransactions();
    transactions.unshift({
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    return transactions;
  },

  // Calculate portfolio value
  calculatePortfolioValue(portfolio, currentPrices) {
    return portfolio.reduce((total, holding) => {
      const currentPrice = currentPrices[holding.coinId] || 0;
      return total + (holding.amount * currentPrice);
    }, 0);
  },

  // Calculate profit/loss
  calculateProfitLoss(portfolio, currentPrices) {
    let totalInvested = 0;
    let currentValue = 0;
    
    portfolio.forEach(holding => {
      totalInvested += holding.amount * holding.averagePrice;
      const currentPrice = currentPrices[holding.coinId] || 0;
      currentValue += holding.amount * currentPrice;
    });
    
    const profitLoss = currentValue - totalInvested;
    const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
    
    return {
      totalInvested,
      currentValue,
      profitLoss,
      profitLossPercent
    };
  }
};