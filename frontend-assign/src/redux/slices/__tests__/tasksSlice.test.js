import tasksReducer, {
  addTask,
  updateTask,
  deleteTask,
  moveTask,
  optimisticAddTask,
  rollbackAddTask
} from '../tasksSlice';

describe('Tasks Slice', () => {
  const initialState = {
    tasks: [],
    loading: false,
    error: null
  };

  test('should return the initial state', () => {
    expect(tasksReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  test('should handle addTask', () => {
    const task = {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'queue',
      priority: 'high'
    };

    const newState = tasksReducer(initialState, addTask(task));

    expect(newState.tasks).toHaveLength(1);
    expect(newState.tasks[0]).toEqual(task);
  });

  test('should handle optimisticAddTask', () => {
    const task = {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'queue',
      priority: 'high',
      isOptimistic: true
    };

    const newState = tasksReducer(initialState, optimisticAddTask(task));

    expect(newState.tasks).toHaveLength(1);
    expect(newState.tasks[0]).toEqual(task);
    expect(newState.tasks[0].isOptimistic).toBe(true);
  });

  test('should handle rollbackAddTask', () => {
    const task = {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'queue',
      priority: 'high',
      isOptimistic: true
    };

    const stateWithTask = {
      ...initialState,
      tasks: [task]
    };

    const newState = tasksReducer(stateWithTask, rollbackAddTask(task.id));

    expect(newState.tasks).toHaveLength(0);
  });

  test('should handle updateTask', () => {
    const task = {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'queue',
      priority: 'high'
    };

    const stateWithTask = {
      ...initialState,
      tasks: [task]
    };

    const updatedTask = {
      ...task,
      title: 'Updated Task',
      priority: 'medium'
    };

    const newState = tasksReducer(stateWithTask, updateTask(updatedTask));

    expect(newState.tasks).toHaveLength(1);
    expect(newState.tasks[0].title).toBe('Updated Task');
    expect(newState.tasks[0].priority).toBe('medium');
  });

  test('should handle deleteTask', () => {
    const task = {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'queue',
      priority: 'high'
    };

    const stateWithTask = {
      ...initialState,
      tasks: [task]
    };

    const newState = tasksReducer(stateWithTask, deleteTask(task.id));

    expect(newState.tasks).toHaveLength(0);
  });

  test('should handle moveTask', () => {
    const task = {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'queue',
      priority: 'high'
    };

    const stateWithTask = {
      ...initialState,
      tasks: [task]
    };

    const moveData = {
      taskId: 'task-1',
      sourceColumnId: 'queue',
      destinationColumnId: 'in-progress',
      sourceIndex: 0,
      destinationIndex: 0
    };

    const newState = tasksReducer(stateWithTask, moveTask(moveData));

    expect(newState.tasks).toHaveLength(1);
    expect(newState.tasks[0].status).toBe('in-progress');
  });
});