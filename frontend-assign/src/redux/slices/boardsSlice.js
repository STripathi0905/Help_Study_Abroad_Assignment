import { createSlice } from '@reduxjs/toolkit';

// Helper function to create a deep copy of the state
const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

const initialState = {
  columns: [
    { id: 'queue', title: 'Queue', taskIds: [] },
    { id: 'in-progress', title: 'In Progress', taskIds: [] },
    { id: 'done', title: 'Done', taskIds: [] },
  ],
  columnOrder: ['queue', 'in-progress', 'done'],
  loading: false,
  error: null,
};

export const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setColumns: (state, action) => {
      state.columns = action.payload;
    },
    moveTask: (state, action) => {
      const { source, destination, taskId } = action.payload;
      
      // Remove from source column
      const sourceColumn = state.columns.find(col => col.id === source.droppableId);
      sourceColumn.taskIds = sourceColumn.taskIds.filter(id => id !== taskId);
      
      // Add to destination column
      const destinationColumn = state.columns.find(col => col.id === destination.droppableId);
      destinationColumn.taskIds.splice(destination.index, 0, taskId);
    },
    // Optimistic move task action
    optimisticMoveTask: (state, action) => {
      const { source, destination, taskId } = action.payload;
      
      // Store the current state for potential rollback
      state.previousState = deepCopy({
        columns: state.columns,
        columnOrder: state.columnOrder
      });
      
      // Remove from source column
      const sourceColumn = state.columns.find(col => col.id === source.droppableId);
      sourceColumn.taskIds = sourceColumn.taskIds.filter(id => id !== taskId);
      
      // Add to destination column
      const destinationColumn = state.columns.find(col => col.id === destination.droppableId);
      destinationColumn.taskIds.splice(destination.index, 0, taskId);
    },
    // Rollback move task action
    rollbackMoveTask: (state) => {
      // Restore the previous state if it exists
      if (state.previousState) {
        state.columns = state.previousState.columns;
        state.columnOrder = state.previousState.columnOrder;
        state.previousState = null;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setColumns, moveTask, optimisticMoveTask, rollbackMoveTask, setLoading, setError } = boardsSlice.actions;

export default boardsSlice.reducer;