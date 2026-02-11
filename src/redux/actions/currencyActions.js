import { SET_BASE_CURRENCY } from '../types';

export const setBaseCurrency = (currency) => {
  return {
    type: SET_BASE_CURRENCY,
    payload: currency
  };
};