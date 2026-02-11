import { combineReducers } from 'redux';
import currencyReducer from './currencyReducer';
import cryptoReducer from './cryptoReducer';
import chartReducer from './chartReducer';
import marketReducer from './marketReducer';
import exchangeReducer from './exchangeReducer';

const rootReducer = combineReducers({
  currency: currencyReducer,
  crypto: cryptoReducer,
  chart: chartReducer,
  market: marketReducer,
  exchange: exchangeReducer
});

export default rootReducer;