import {
  FETCH_GLOBAL_MARKET_REQUEST,
  FETCH_GLOBAL_MARKET_SUCCESS,
  FETCH_GLOBAL_MARKET_FAILURE
} from '../types';

const initialState = {
  globalMarketData: null,
  loading: false,
  error: null
};

const marketReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_GLOBAL_MARKET_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case FETCH_GLOBAL_MARKET_SUCCESS:
      return {
        ...state,
        loading: false,
        globalMarketData: action.payload,
        error: null
      };
    case FETCH_GLOBAL_MARKET_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

export default marketReducer;