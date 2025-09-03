import uiReducer, {
  addNotification,
  removeNotification
} from '../uiSlice';

describe('UI Slice', () => {
  const initialState = {
    notifications: []
  };

  test('should return the initial state', () => {
    expect(uiReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  test('should handle addNotification', () => {
    const notification = {
      id: 'notification-1',
      type: 'success',
      message: 'Task created successfully',
      duration: 3000
    };

    const newState = uiReducer(initialState, addNotification(notification));

    expect(newState.notifications).toHaveLength(1);
    expect(newState.notifications[0]).toEqual(notification);
  });

  test('should handle removeNotification', () => {
    const notification = {
      id: 'notification-1',
      type: 'success',
      message: 'Task created successfully',
      duration: 3000
    };

    const stateWithNotification = {
      ...initialState,
      notifications: [notification]
    };

    const newState = uiReducer(stateWithNotification, removeNotification(notification.id));

    expect(newState.notifications).toHaveLength(0);
  });

  test('should handle multiple notifications', () => {
    const notification1 = {
      id: 'notification-1',
      type: 'success',
      message: 'Task created successfully',
      duration: 3000
    };

    const notification2 = {
      id: 'notification-2',
      type: 'error',
      message: 'Failed to update task',
      duration: 5000
    };

    let state = uiReducer(initialState, addNotification(notification1));
    state = uiReducer(state, addNotification(notification2));

    expect(state.notifications).toHaveLength(2);
    expect(state.notifications[0]).toEqual(notification1);
    expect(state.notifications[1]).toEqual(notification2);

    // Remove the first notification
    state = uiReducer(state, removeNotification(notification1.id));

    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0]).toEqual(notification2);
  });
});