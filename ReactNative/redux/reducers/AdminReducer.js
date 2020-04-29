const initialState = {
   recycleItemList: [],
   recycleCart: [],
   isLoading: true,
   user: {},
   image: null,
   isAdmin: true,
   isSignedIn: false,
 };
 
 const admin = (state = initialState, action) => {
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
         //recycleCart: action.payload,
       };
     case "REMOVE_RECYCLE_ITEMS_FROM_CART":
       return {
         ...state,
         recycleCart: state.recycleCart.filter(
           (item) => item !== action.payload
         ),
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
     default:
       return state;
   }
 };
 
 export default admin;
 