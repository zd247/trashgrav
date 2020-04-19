import { createStore, combineReducers } from "redux";

import authReducer from "../reducers/AuthReducer";
import recycleItemReducer from "../reducers/RecycleItemReducer";
const store = createStore(
  combineReducers({
    recycleItemList: recycleItemReducer,
    auth: authReducer,
  })
);

export default store;
