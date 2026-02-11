import {
  FETCH_CRYPTO_LIST_REQUEST,
  FETCH_CRYPTO_LIST_SUCCESS,
  FETCH_CRYPTO_LIST_FAILURE,
  SET_SEARCH_QUERY
} from '../types';
import { apiService } from '../../services/apiService';

export const fetchCryptoList = (currency = 'usd', perPage = 100) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_CRYPTO_LIST_REQUEST });
    
    try {
      const data = await apiService.getCryptoList(currency, perPage);
      
      dispatch({
        type: FETCH_CRYPTO_LIST_SUCCESS,
        payload: data
      });
    } catch (error) {
      console.error('Crypto list fetch error:', error);
      
      let errorMessage = 'Failed to fetch cryptocurrency list';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout - API is slow, please try again';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests - please wait 1 minute and try again';
      } else if (!navigator.onLine) {
        errorMessage = 'No internet connection';
      } else if (error.response?.status >= 500) {
        errorMessage = 'CoinGecko server error - please try again later';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      dispatch({
        type: FETCH_CRYPTO_LIST_FAILURE,
        payload: errorMessage
      });
    }
  };
};

export const setSearchQuery = (query) => {
  return {
    type: SET_SEARCH_QUERY,
    payload: query
  };
};