export const formatCurrency = (value, currencySymbol = '$', decimals = 2) => {
  if (value === null || value === undefined) return 'N/A';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1e12) {
    return `${currencySymbol}${(value / 1e12).toFixed(decimals)}T`;
  } else if (absValue >= 1e9) {
    return `${currencySymbol}${(value / 1e9).toFixed(decimals)}B`;
  } else if (absValue >= 1e6) {
    return `${currencySymbol}${(value / 1e6).toFixed(decimals)}M`;
  } else if (absValue >= 1e3) {
    return `${currencySymbol}${(value / 1e3).toFixed(decimals)}K`;
  } else {
    return `${currencySymbol}${value.toFixed(decimals)}`;
  }
};

export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return 'N/A';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};