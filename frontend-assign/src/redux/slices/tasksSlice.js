import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: {},
  loading: false,
  error: null,
};

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    addTask: (state, action) => {
      const task = action.payload;
      state.tasks[task.id] = task;
    },
    updateTask: (state, action) => {
      const { id, ...updates } = action.payload;
      state.tasks[id] = { ...state.tasks[id], ...updates };
    },
    deleteTask: (state, action) => {
      const id = action.payload;
      delete state.tasks[id];
    },
    setTaskLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTaskError: (state, action) => {
      state.error = action.payload;
    },
    // Optimistic update actions
    optimisticAddTask: (state, action) => {
      const task = action.payload;
      state.tasks[task.id] = task;
    },
    optimisticUpdateTask: (state, action) => {
      const { id, ...updates } = action.payload;
      state.tasks[id] = { ...state.tasks[id], ...updates };
    },
    optimisticDeleteTask: (state, action) => {
      const id = action.payload;
      delete state.tasks[id];
    },
    // Rollback actions for failed operations
    rollbackAddTask: (state, action) => {
      const id = action.payload;
      delete state.tasks[id];
    },
    rollbackUpdateTask: (state, action) => {
      const { id, originalTask } = action.payload;
      state.tasks[id] = originalTask;
    },
    rollbackDeleteTask: (state, action) => {
      const task = action.payload;
      state.tasks[task.id] = task;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  deleteTask,
  setTaskLoading,
  setTaskError,
  optimisticAddTask,
  optimisticUpdateTask,
  optimisticDeleteTask,
  rollbackAddTask,
  rollbackUpdateTask,
  rollbackDeleteTask,
} = tasksSlice.actions;

export default tasksSlice.reducer;