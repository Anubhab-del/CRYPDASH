import {
  FETCH_EXCHANGE_RATE_REQUEST,
  FETCH_EXCHANGE_RATE_SUCCESS,
  FETCH_EXCHANGE_RATE_FAILURE
} from '../types';

const initialState = {
  exchangeRates: {},
  loading: false,
  error: null
};

const exchangeReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_EXCHANGE_RATE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case FETCH_EXCHANGE_RATE_SUCCESS:
      return {
        ...state,
        loading: false,
        exchangeRates: action.payload,
        error: null
      };
    case FETCH_EXCHANGE_RATE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

export default exchangeReducer;