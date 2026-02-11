import {
  FETCH_MARKET_CHART_REQUEST,
  FETCH_MARKET_CHART_SUCCESS,
  FETCH_MARKET_CHART_FAILURE,
  ADD_SELECTED_CRYPTO,
  REMOVE_SELECTED_CRYPTO,
  SET_CHART_TYPE
} from '../types';
import { apiService } from '../../services/apiService';

export const fetchMarketChart = (coinId, currency = 'usd', days = '7') => {
  return async (dispatch) => {
    dispatch({ type: FETCH_MARKET_CHART_REQUEST });
    
    try {
      const data = await apiService.getMarketChart(coinId, currency, days);
      
      dispatch({
        type: FETCH_MARKET_CHART_SUCCESS,
        payload: {
          id: coinId,
          data: data
        }
      });
    } catch (error) {
      console.error('Market chart fetch error:', error);
      
      let errorMessage = 'Failed to fetch chart data';
      
      if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded - chart will load in 1 minute';
      }
      
      dispatch({
        type: FETCH_MARKET_CHART_FAILURE,
        payload: errorMessage
      });
    }
  };
};

export const addSelectedCrypto = (cryptoId) => {
  return {
    type: ADD_SELECTED_CRYPTO,
    payload: cryptoId
  };
};

export const removeSelectedCrypto = (cryptoId) => {
  return {
    type: REMOVE_SELECTED_CRYPTO,
    payload: cryptoId
  };
};

export const setChartType = (chartType) => {
  return {
    type: SET_CHART_TYPE,
    payload: chartType
  };
};