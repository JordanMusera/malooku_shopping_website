'use client'
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import userReducer from './userSlice';
import orderReducer from './orderSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    user: userReducer,
    order: orderReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
