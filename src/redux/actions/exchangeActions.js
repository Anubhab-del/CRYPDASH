import {
  FETCH_EXCHANGE_RATE_REQUEST,
  FETCH_EXCHANGE_RATE_SUCCESS,
  FETCH_EXCHANGE_RATE_FAILURE
} from '../types';
import { apiService } from '../../services/apiService';

export const fetchExchangeRates = (ids, currencies) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_EXCHANGE_RATE_REQUEST });
    
    try {
      const data = await apiService.getSimplePrices(ids, currencies);
      
      dispatch({
        type: FETCH_EXCHANGE_RATE_SUCCESS,
        payload: data
      });
    } catch (error) {
      console.error('Exchange rates fetch error:', error);
      
      dispatch({
        type: FETCH_EXCHANGE_RATE_FAILURE,
        payload: 'Failed to fetch exchange rates'
      });
    }
  };
};