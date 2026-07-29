import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import dashboardReducer from './dashboardSlice';
import tasksReducer from './taskSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    tasks: tasksReducer,
  },
});

// Restore user state from localStorage on app start
const storedUser = localStorage.getItem('user');
if (storedUser) {
  // This will be handled by the reducer, but we can set initial state here
  // For now, we'll let the app handle it during login
}

export default store;
