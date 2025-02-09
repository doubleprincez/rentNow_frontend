import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice'; 
import agentReducer from './agentSlice';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    agent: agentReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
