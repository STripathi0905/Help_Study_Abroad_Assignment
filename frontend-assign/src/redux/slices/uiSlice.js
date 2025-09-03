import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  filters: {
    assignee: [],
    tags: [],
    priority: [],
  },
  searchTerm: '',
  isLoading: false,
  notifications: [],
  isDarkMode: false,
  connectionStatus: 'disconnected', // 'connected', 'disconnected', 'connecting', 'error'
  activeUsers: [],
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      const { filterType, value } = action.payload;
      state.filters[filterType] = value;
    },
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      const id = action.payload;
      state.notifications = state.notifications.filter(notification => notification.id !== id);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },
    setActiveUsers: (state, action) => {
      state.activeUsers = action.payload;
    },
  },
});

export const {
  setFilter,
  setFilters,
  clearFilters,
  setSearchTerm,
  setIsLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  toggleDarkMode,
  setConnectionStatus,
  setActiveUsers,
} = uiSlice.actions;

export default uiSlice.reducer;