import {
  FETCH_CRYPTO_LIST_REQUEST,
  FETCH_CRYPTO_LIST_SUCCESS,
  FETCH_CRYPTO_LIST_FAILURE,
  SET_SEARCH_QUERY
} from '../types';

const initialState = {
  cryptoList: [],
  loading: false,
  error: null,
  searchQuery: ''
};

const cryptoReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CRYPTO_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case FETCH_CRYPTO_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        cryptoList: action.payload,
        error: null
      };
    case FETCH_CRYPTO_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload
      };
    default:
      return state;
  }
};

export default cryptoReducer;