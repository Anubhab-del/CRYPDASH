import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setBaseCurrency } from '../redux/actions/currencyActions';
import { setSearchQuery } from '../redux/actions/cryptoActions';
import Portfolio from './Portfolio';

const Header = () => {
  const dispatch = useDispatch();
  const { baseCurrency, availableCurrencies } = useSelector(state => state.currency);
  const { searchQuery } = useSelector(state => state.crypto);
  const [showPortfolio, setShowPortfolio] = useState(false);

  const handleCurrencyChange = (e) => {
    dispatch(setBaseCurrency(e.target.value));
  };

  const handleSearchChange = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  return (
    <>
      <header className="glass sticky top-0 z-40 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">₿</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  CryptoDash Pro
                </h1>
                <p className="text-xs text-gray-500">Professional Trading Dashboard</p>
              </div>
            </div>

            {/* Search, Currency, and Portfolio */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cryptocurrencies..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full sm:w-64 px-4 py-2.5 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Currency Dropdown */}
              <div className="relative">
                <select
                  value={baseCurrency}
                  onChange={handleCurrencyChange}
                  className="w-full sm:w-40 px-4 py-2.5 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all"
                >
                  {availableCurrencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code.toUpperCase()}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* Portfolio Button */}
              <button
                onClick={() => setShowPortfolio(true)}
                className="btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                My Portfolio
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Portfolio Modal */}
      <Portfolio isOpen={showPortfolio} onClose={() => setShowPortfolio(false)} />
    </>
  );
};

export default Header;