import {
  FETCH_MARKET_CHART_REQUEST,
  FETCH_MARKET_CHART_SUCCESS,
  FETCH_MARKET_CHART_FAILURE,
  ADD_SELECTED_CRYPTO,
  REMOVE_SELECTED_CRYPTO,
  SET_CHART_TYPE
} from '../types';

const initialState = {
  chartData: {},
  loading: false,
  error: null,
  selectedCryptos: ['bitcoin'], // Default selected
  chartType: 'line', // line, bar
  timeRange: '7' // days
};

const chartReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MARKET_CHART_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case FETCH_MARKET_CHART_SUCCESS:
      return {
        ...state,
        loading: false,
        chartData: {
          ...state.chartData,
          [action.payload.id]: action.payload.data
        },
        error: null
      };
    case FETCH_MARKET_CHART_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case ADD_SELECTED_CRYPTO:
      if (!state.selectedCryptos.includes(action.payload)) {
        return {
          ...state,
          selectedCryptos: [...state.selectedCryptos, action.payload]
        };
      }
      return state;
    case REMOVE_SELECTED_CRYPTO:
      return {
        ...state,
        selectedCryptos: state.selectedCryptos.filter(
          crypto => crypto !== action.payload
        )
      };
    case SET_CHART_TYPE:
      return {
        ...state,
        chartType: action.payload
      };
    default:
      return state;
  }
};

export default chartReducer;