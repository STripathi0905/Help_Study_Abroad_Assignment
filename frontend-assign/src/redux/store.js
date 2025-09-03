import { configureStore } from '@reduxjs/toolkit';
import boardsReducer from './slices/boardsSlice';
import tasksReducer from './slices/tasksSlice';
import usersReducer from './slices/usersSlice';
import uiReducer from './slices/uiSlice';
import socketReducer from './slices/socketSlice';

export const store = configureStore({
  reducer: {
    boards: boardsReducer,
    tasks: tasksReducer,
    users: usersReducer,
    ui: uiReducer,
    socket: socketReducer,
  },
});

export default store;