import { SET_BASE_CURRENCY } from '../types';

const initialState = {
  baseCurrency: 'usd',
  currencySymbol: '$',
  availableCurrencies: [
    { code: 'usd', name: 'US Dollar', symbol: '$' },
    { code: 'eur', name: 'Euro', symbol: '€' },
    { code: 'gbp', name: 'British Pound', symbol: '£' },
    { code: 'jpy', name: 'Japanese Yen', symbol: '¥' },
    { code: 'inr', name: 'Indian Rupee', symbol: '₹' },
    { code: 'aud', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'cad', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'chf', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'cny', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'krw', name: 'South Korean Won', symbol: '₩' },
  ]
};

const currencyReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_BASE_CURRENCY:
      const selectedCurrency = state.availableCurrencies.find(
        currency => currency.code === action.payload
      );
      return {
        ...state,
        baseCurrency: action.payload,
        currencySymbol: selectedCurrency ? selectedCurrency.symbol : '$'
      };
    default:
      return state;
  }
};

export default currencyReducer;