import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice'; 
import agentReducer from './agentSlice';
import adminReducer from './adminSlice';
import dashboardSlice from './dashboardSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    agent: agentReducer,
    admin: adminReducer,
    dashboard: dashboardSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
