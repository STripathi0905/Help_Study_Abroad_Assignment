import boardsReducer, {
  setColumns,
  updateColumnOrder,
  addTaskToColumn,
  removeTaskFromColumn,
  moveTaskWithinColumn,
  moveTaskBetweenColumns
} from '../boardsSlice';

describe('Boards Slice', () => {
  const initialState = {
    columns: [],
    columnOrder: [],
    loading: false,
    error: null
  };

  test('should return the initial state', () => {
    expect(boardsReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  test('should handle setColumns', () => {
    const columns = [
      { id: 'queue', title: 'To Do', taskIds: ['task-1', 'task-2'] },
      { id: 'in-progress', title: 'In Progress', taskIds: [] },
      { id: 'done', title: 'Done', taskIds: [] }
    ];
    const columnOrder = ['queue', 'in-progress', 'done'];

    const newState = boardsReducer(initialState, setColumns({ columns, columnOrder }));

    expect(newState.columns).toEqual(columns);
    expect(newState.columnOrder).toEqual(columnOrder);
  });

  test('should handle updateColumnOrder', () => {
    const stateWithColumns = {
      ...initialState,
      columns: [
        { id: 'queue', title: 'To Do', taskIds: ['task-1', 'task-2'] },
        { id: 'in-progress', title: 'In Progress', taskIds: [] },
        { id: 'done', title: 'Done', taskIds: [] }
      ],
      columnOrder: ['queue', 'in-progress', 'done']
    };

    const newColumnOrder = ['in-progress', 'queue', 'done'];

    const newState = boardsReducer(stateWithColumns, updateColumnOrder(newColumnOrder));

    expect(newState.columnOrder).toEqual(newColumnOrder);
  });

  test('should handle addTaskToColumn', () => {
    const stateWithColumns = {
      ...initialState,
      columns: [
        { id: 'queue', title: 'To Do', taskIds: [] },
        { id: 'in-progress', title: 'In Progress', taskIds: [] },
        { id: 'done', title: 'Done', taskIds: [] }
      ],
      columnOrder: ['queue', 'in-progress', 'done']
    };

    const newState = boardsReducer(stateWithColumns, addTaskToColumn({ columnId: 'queue', taskId: 'task-1' }));

    expect(newState.columns[0].taskIds).toEqual(['task-1']);
  });

  test('should handle removeTaskFromColumn', () => {
    const stateWithColumns = {
      ...initialState,
      columns: [
        { id: 'queue', title: 'To Do', taskIds: ['task-1', 'task-2'] },
        { id: 'in-progress', title: 'In Progress', taskIds: [] },
        { id: 'done', title: 'Done', taskIds: [] }
      ],
      columnOrder: ['queue', 'in-progress', 'done']
    };

    const newState = boardsReducer(stateWithColumns, removeTaskFromColumn({ columnId: 'queue', taskId: 'task-1' }));

    expect(newState.columns[0].taskIds).toEqual(['task-2']);
  });

  test('should handle moveTaskWithinColumn', () => {
    const stateWithColumns = {
      ...initialState,
      columns: [
        { id: 'queue', title: 'To Do', taskIds: ['task-1', 'task-2', 'task-3'] },
        { id: 'in-progress', title: 'In Progress', taskIds: [] },
        { id: 'done', title: 'Done', taskIds: [] }
      ],
      columnOrder: ['queue', 'in-progress', 'done']
    };

    const newState = boardsReducer(
      stateWithColumns, 
      moveTaskWithinColumn({ 
        columnId: 'queue', 
        sourceIndex: 0, 
        destinationIndex: 2 
      })
    );

    expect(newState.columns[0].taskIds).toEqual(['task-2', 'task-3', 'task-1']);
  });

  test('should handle moveTaskBetweenColumns', () => {
    const stateWithColumns = {
      ...initialState,
      columns: [
        { id: 'queue', title: 'To Do', taskIds: ['task-1', 'task-2'] },
        { id: 'in-progress', title: 'In Progress', taskIds: ['task-3'] },
        { id: 'done', title: 'Done', taskIds: [] }
      ],
      columnOrder: ['queue', 'in-progress', 'done']
    };

    const newState = boardsReducer(
      stateWithColumns, 
      moveTaskBetweenColumns({ 
        sourceColumnId: 'queue', 
        destinationColumnId: 'in-progress', 
        sourceIndex: 0, 
        destinationIndex: 1 
      })
    );

    expect(newState.columns[0].taskIds).toEqual(['task-2']);
    expect(newState.columns[1].taskIds).toEqual(['task-3', 'task-1']);
  });
});