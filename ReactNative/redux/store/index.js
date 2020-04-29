import { createStore, combineReducers } from "redux";

import authReducer from "../reducers/AuthReducer";
import adminReducer from '../reducers/AdminReducer';
import recycleItemReducer from "../reducers/RecycleItemReducer";

const store = createStore(
  combineReducers({
    recycleItemList: recycleItemReducer,
    auth: authReducer,
    admin: adminReducer,
  })
);

export default store;
