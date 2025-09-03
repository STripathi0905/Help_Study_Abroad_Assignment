import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connected: false,
  status: 'disconnected', // 'connected', 'disconnected', 'connecting', 'error'
};

export const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
    setConnectionStatus: (state, action) => {
      state.status = action.payload;
      state.connected = action.payload === 'connected';
    },
  },
});

export const { setConnected, setConnectionStatus } = socketSlice.actions;

export default socketSlice.reducer;