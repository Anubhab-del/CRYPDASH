import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchExchangeRates } from '../redux/actions/exchangeActions';

const ExchangeRates = () => {
  const dispatch = useDispatch();
  const { exchangeRates, loading, error } = useSelector(state => state.exchange);
  const { baseCurrency, availableCurrencies } = useSelector(state => state.currency);
  const { cryptoList } = useSelector(state => state.crypto);

  const [fromAmount, setFromAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('bitcoin');
  const [toCurrency, setToCurrency] = useState('usd');
  const [result, setResult] = useState(null);
  const [conversionError, setConversionError] = useState('');

  const popularCryptos = cryptoList.slice(0, 20).map(crypto => ({
    id: crypto.id,
    name: crypto.name,
    symbol: crypto.symbol
  }));

  useEffect(() => {
    if (popularCryptos.length > 0) {
      const cryptoIds = popularCryptos.map(c => c.id);
      const currencies = availableCurrencies.map(c => c.code);
      dispatch(fetchExchangeRates(cryptoIds, currencies));
    }
  }, [dispatch, baseCurrency]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
      setConversionError('');
      setResult(null);
    } else {
      setConversionError('Please enter a valid number');
    }
  };

  const isCrypto = (currencyId) => popularCryptos.some(c => c.id === currencyId);
  const isFiat = (currencyCode) => availableCurrencies.some(c => c.code === currencyCode);

  const handleConvert = () => {
    if (!fromAmount || fromAmount === '0' || isNaN(parseFloat(fromAmount))) {
      setConversionError('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(fromAmount);
    let conversionRate = null;

    if (isCrypto(fromCurrency) && isFiat(toCurrency)) {
      const rate = exchangeRates[fromCurrency]?.[toCurrency];
      if (rate) conversionRate = rate;
    } else if (isFiat(fromCurrency) && isCrypto(toCurrency)) {
      const rate = exchangeRates[toCurrency]?.[fromCurrency];
      if (rate) conversionRate = 1 / rate;
    } else if (isCrypto(fromCurrency) && isCrypto(toCurrency)) {
      const fromInUsd = exchangeRates[fromCurrency]?.usd;
      const toInUsd = exchangeRates[toCurrency]?.usd;
      if (fromInUsd && toInUsd) conversionRate = fromInUsd / toInUsd;
    } else if (isFiat(fromCurrency) && isFiat(toCurrency)) {
      const btcInFrom = exchangeRates['bitcoin']?.[fromCurrency];
      const btcInTo = exchangeRates['bitcoin']?.[toCurrency];
      if (btcInFrom && btcInTo) conversionRate = btcInTo / btcInFrom;
    }

    if (conversionRate) {
      const resultValue = (amount * conversionRate).toFixed(8);
      setResult(parseFloat(resultValue));
      setConversionError('');
    } else {
      setConversionError('Conversion rate not available. Please wait for data to load.');
      setResult(null);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setResult(null);
  };

  const handleRetry = () => {
    const cryptoIds = popularCryptos.map(c => c.id);
    const currencies = availableCurrencies.map(c => c.code);
    dispatch(fetchExchangeRates(cryptoIds, currencies));
  };

  return (
    <div className="glass rounded-2xl p-6 hover-lift">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-xl">💱</span>
        </div>
        <div>
          <h2 className="text-xl font-bold gradient-text">Exchange Rates</h2>
          <p className="text-xs text-gray-500">Convert any currency</p>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button onClick={handleRetry} className="text-red-600 hover:text-red-800 text-sm font-semibold">
            Retry
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">From</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={fromAmount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <select
              value={fromCurrency}
              onChange={(e) => { setFromCurrency(e.target.value); setResult(null); }}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all"
            >
              <optgroup label="🪙 Cryptocurrencies">
                {popularCryptos.map((crypto) => (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.name} ({crypto.symbol.toUpperCase()})
                  </option>
                ))}
              </optgroup>
              <optgroup label="💵 Fiat Currencies">
                {availableCurrencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.code.toUpperCase()})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={swapCurrencies}
            className="p-3 hover:bg-purple-50 rounded-full transition-all transform hover:rotate-180 duration-300"
            title="Swap currencies"
          >
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
          <select
            value={toCurrency}
            onChange={(e) => { setToCurrency(e.target.value); setResult(null); }}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all"
          >
            <optgroup label="🪙 Cryptocurrencies">
              {popularCryptos.map((crypto) => (
                <option key={crypto.id} value={crypto.id}>
                  {crypto.name} ({crypto.symbol.toUpperCase()})
                </option>
              ))}
            </optgroup>
            <optgroup label="💵 Fiat Currencies">
              {availableCurrencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code.toUpperCase()})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <button
          onClick={handleConvert}
          disabled={loading || !fromAmount}
          className="btn-primary w-full py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Loading...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Convert Now
            </span>
          )}
        </button>

        {conversionError && (
          <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm animate-fade-in">
            {conversionError}
          </div>
        )}

        {result !== null && !conversionError && (
          <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl animate-fade-in">
            <div className="text-sm text-gray-600 mb-2 font-medium">💰 Result:</div>
            <div className="text-3xl font-bold gradient-text mb-2">
              {result.toLocaleString(undefined, { maximumFractionDigits: 8 })}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span>✨</span>
              <span>
                {fromAmount} {isCrypto(fromCurrency) ? popularCryptos.find(c => c.id === fromCurrency)?.symbol.toUpperCase() : fromCurrency.toUpperCase()} 
                {' = '}
                {result.toLocaleString(undefined, { maximumFractionDigits: 8 })} {isCrypto(toCurrency) ? popularCryptos.find(c => c.id === toCurrency)?.symbol.toUpperCase() : toCurrency.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center text-sm text-gray-500 animate-pulse">
            <div className="inline-flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span className="ml-2">Loading exchange rates...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExchangeRates;