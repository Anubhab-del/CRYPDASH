import {
  FETCH_GLOBAL_MARKET_REQUEST,
  FETCH_GLOBAL_MARKET_SUCCESS,
  FETCH_GLOBAL_MARKET_FAILURE
} from '../types';
import { apiService } from '../../services/apiService';

export const fetchGlobalMarket = () => {
  return async (dispatch) => {
    dispatch({ type: FETCH_GLOBAL_MARKET_REQUEST });
    
    try {
      const data = await apiService.getGlobalMarket();
      
      dispatch({
        type: FETCH_GLOBAL_MARKET_SUCCESS,
        payload: data
      });
    } catch (error) {
      console.error('Global market fetch error:', error);
      
      dispatch({
        type: FETCH_GLOBAL_MARKET_FAILURE,
        payload: 'Failed to fetch global market data'
      });
    }
  };
};