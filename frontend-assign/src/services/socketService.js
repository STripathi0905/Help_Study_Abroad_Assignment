import { io } from 'socket.io-client';
import { addTask, updateTask, deleteTask } from '../redux/slices/tasksSlice';
import { moveTask } from '../redux/slices/boardsSlice';
import { addNotification, setActiveUsers } from '../redux/slices/uiSlice';
import { setConnectionStatus } from '../redux/slices/socketSlice';

let socket;

export const requestActiveUsers = () => {
  if (socket && socket.connected) {
    socket.emit('get-active-users');
  }
};

export const emitTaskMoved = (data) => {
  if (socket && socket.connected) {
    socket.emit('task-moved', data);
  }
};

export const initializeSocket = (dispatch) => {
  // Connect to the WebSocket server with reconnection options
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  // Update connection status to connecting
  dispatch(setConnectionStatus('connecting'));

  // Connection event handlers
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
    dispatch(setConnectionStatus('connected'));
    dispatch(addNotification({
      id: Date.now().toString(),
      type: 'success',
      message: 'Connected to server',
      duration: 3000, // Auto-dismiss after 3 seconds
    }));
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from WebSocket server:', reason);
    dispatch(setConnectionStatus('disconnected'));
    dispatch(addNotification({
      id: Date.now().toString(),
      type: 'warning',
      message: `Disconnected from server: ${reason}`,
    }));
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Attempting to reconnect: attempt ${attemptNumber}`);
    dispatch(setConnectionStatus('connecting'));
    if (attemptNumber > 1) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'info',
        message: `Attempting to reconnect (${attemptNumber}/5)...`,
        duration: 2000,
      }));
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`Reconnected after ${attemptNumber} attempts`);
    dispatch(setConnectionStatus('connected'));
    dispatch(addNotification({
      id: Date.now().toString(),
      type: 'success',
      message: 'Reconnected to server',
      duration: 3000,
    }));
  });

  // Flag to track if we've already shown a reconnection error notification
  let hasShownReconnectError = false;

  socket.on('reconnect_error', (error) => {
    console.error('Reconnection error:', error);
    
    // Only show the notification once
    if (!hasShownReconnectError) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to reconnect to server',
        duration: 5000, // Auto-dismiss after 5 seconds
      }));
      hasShownReconnectError = true;
    }
  });

  // Flag to track if we've already shown a reconnect failed notification
  let hasShownReconnectFailedError = false;

  socket.on('reconnect_failed', () => {
    console.error('Failed to reconnect after maximum attempts');
    dispatch(setConnectionStatus('error'));
    
    // Only show the notification once
    if (!hasShownReconnectFailedError) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to reconnect after multiple attempts. Please refresh the page.',
        duration: 10000, // Auto-dismiss after 10 seconds
      }));
      hasShownReconnectFailedError = true;
    }
  });

  // Flag to track if we've already shown a connection error notification
  let hasShownConnectionError = false;

  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
    dispatch(setConnectionStatus('error'));
    
    // Only show the notification once
    if (!hasShownConnectionError) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Failed to connect to server. Please check your connection.',
        duration: 5000, // Auto-dismiss after 5 seconds
      }));
      hasShownConnectionError = true;
    }
  });

  // Task event handlers
  socket.on('new-task', (task) => {
    dispatch(addTask(task));
    dispatch(addNotification({
      id: Date.now().toString(),
      type: 'info',
      message: `New task added: ${task.title}`,
      duration: 5000,
    }));
  });

  socket.on('update-task', (task) => {
    dispatch(updateTask(task));
    dispatch(addNotification({
      id: Date.now().toString(),
      type: 'info',
      message: `Task updated: ${task.title}`,
      duration: 3000,
    }));
  });

  socket.on('delete-task', (taskId) => {
    dispatch(deleteTask(taskId));
    dispatch(addNotification({
      id: Date.now().toString(),
      type: 'info',
      message: 'Task deleted',
      duration: 3000,
    }));
  });

  socket.on('task-updated', (data) => {
    const { source, destination, taskId } = data;
    dispatch(moveTask({ source, destination, taskId }));
    dispatch(addNotification({
      id: Date.now().toString(),
      type: 'info',
      message: 'Task moved by another user',
      duration: 3000,
    }));
  });
  
  // User presence handlers
  socket.on('user-joined', (userData) => {
    dispatch(addNotification({
      id: Date.now().toString(),
      type: 'info',
      message: `${userData.name || 'A user'} joined the board`,
      duration: 3000,
    }));
  });
  
  socket.on('user-left', (userData) => {
    dispatch(addNotification({
      id: Date.now().toString(),
      type: 'info',
      message: `${userData.name || 'A user'} left the board`,
      duration: 3000,
    }));
  });
  
  socket.on('active-users', (users) => {
    dispatch(setActiveUsers(users));
  });
  
  // Typing indicator
  socket.on('user-typing', (userData) => {
    // This could be used to show a typing indicator in the UI
    console.log(`${userData.name || 'Someone'} is typing...`);
  });

  return socket;
};

export const joinBoard = (boardId, userData = {}) => {
  if (socket) {
    socket.emit('join-board', { boardId, userData });
  }
};

// emitTaskMoved is already defined at the top of the file

export const emitTaskCreated = (data) => {
  if (socket) {
    socket.emit('task-created', data);
  }
};

export const emitTaskUpdated = (data) => {
  if (socket) {
    socket.emit('task-updated', data);
  }
};

export const emitTaskDeleted = (data) => {
  if (socket) {
    socket.emit('task-deleted', data);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};