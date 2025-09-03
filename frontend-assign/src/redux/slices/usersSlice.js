import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
};

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    assignUserToTask: (state, action) => {
      // This would typically be handled in the tasks slice
      // but we keep track of assignments here for reference
      const { taskId, userId } = action.payload;
      // Implementation depends on how we track assignments
    },
    removeUserFromTask: (state, action) => {
      const { taskId, userId } = action.payload;
      // Implementation depends on how we track assignments
    },
    setUserLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUserError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setUsers,
  setCurrentUser,
  assignUserToTask,
  removeUserFromTask,
  setUserLoading,
  setUserError,
} = usersSlice.actions;

export default usersSlice.reducer;