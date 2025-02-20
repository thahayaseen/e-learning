import { configureStore } from "@reduxjs/toolkit";
import User from "./features/User";
import theam from './features/theam'
// import {persistStore,persistReducer} from "redux-persist";

const stores = configureStore({
  reducer: {
    User,
    theam:theam
  },
});
export default stores;
export type storeType = ReturnType<typeof stores.getState>;
export type AppDispatch=typeof stores.dispatch
