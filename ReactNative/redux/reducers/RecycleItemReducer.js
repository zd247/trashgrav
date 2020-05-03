const initialState = {
  recycleItemList: [],
  recycleCart: [],
  isLoading: true,
  user: {},
  totalWeight: 0,
  totalPrice: 0,
  driver: {},
  location: {},
  order: {
    items: [],
    customer: {},
    driver: {},
    totalPrice: 0,
    totalWeight: 0,
    location: {},
  }
};

const recycles = (state = initialState, action) => {
  switch (action.type) {
    case "LOAD_RECYCLE_ITEMS_FROM_SERVER":
      return {
        ...state,
        recycleItemList: action.payload,
      };
    case "LOAD_USER_FROM_SERVER":
      return {
        ...state,
        user: action.payload,
      };
    case "ADD_RECYCLE_ITEMS_TO_CART":
      return {
        ...state,
        recycleCart: [...state.recycleCart, action.payload],
        totalPrice: state.totalPrice + action.payload.price,
        totalWeight: state.totalWeight + action.payload.weight,
        //recycleCart: action.payload,
      };
    case "REMOVE_RECYCLE_ITEMS_FROM_CART":
      return {
        ...state,
        recycleCart: state.recycleCart.filter(
          (item) => item !== action.payload
        ),
        totalPrice: state.totalPrice - action.payload.price,
        totalWeight: state.totalWeight - action.payload.weight,
      };
    case "UPDATE_USER_INFORMATION":
      return {
        ...state,
        user: action.payload,
      };
    case "UPDATE_USER_IMAGE":
      return {
        ...state,
        image: action.payload,
      };
    case "TOGGLE_IS_LOADING_ITEMS":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "UPDATE_ORDER":
      return {
        ...state,
        order: { item: state.recycleCart, customer: state.user, totalWeight: state.totalWeight, totalPrice: state.totalPrice },
      };
    case "UPDATE_ORDER_TOTAL_WEIGHT":
      return {
        ...state,
        totalWeight: action.payload,
      };
    case "UPDATE_ORDER_LOCATION":
      return {
        ...state,
        location: action.payload,
      };
    default:
      return state;
  }
};

export default recycles