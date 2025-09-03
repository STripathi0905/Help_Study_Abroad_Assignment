import { io } from 'socket.io-client';
import {
  initializeSocket,
  joinBoard,
  disconnectSocket,
  emitTaskCreated,
  emitTaskUpdated,
  emitTaskDeleted,
  emitTaskMoved
} from '../socketService';

// Mock socket.io-client
jest.mock('socket.io-client');

describe('Socket Service', () => {
  let mockSocket;
  
  beforeEach(() => {
    // Create a mock socket object
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn()
    };
    
    // Make io return the mock socket
    io.mockReturnValue(mockSocket);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('initializeSocket connects to the server and sets up event listeners', () => {
    const mockDispatch = jest.fn();
    
    initializeSocket(mockDispatch);
    
    // Check if socket.io-client was called with the correct URL
    expect(io).toHaveBeenCalledWith('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket']
    });
    
    // Check if event listeners were set up
    expect(mockSocket.on).toHaveBeenCalledWith('task created', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('task updated', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('task deleted', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('task moved', expect.any(Function));
    
    // Check if the socket was returned
    expect(initializeSocket(mockDispatch)).toBe(mockSocket);
  });

  test('joinBoard emits a join board event', () => {
    const boardId = 'board-123';
    
    joinBoard(mockSocket, boardId);
    
    // Check if the socket emitted the join board event
    expect(mockSocket.emit).toHaveBeenCalledWith('join board', { boardId });
  });

  test('disconnectSocket disconnects the socket', () => {
    disconnectSocket(mockSocket);
    
    // Check if the socket was disconnected
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  test('emitTaskCreated emits a task created event', () => {
    const task = { id: 'task-123', title: 'Test Task' };
    const boardId = 'board-123';
    
    emitTaskCreated({ task, boardId }, mockSocket);
    
    // Check if the socket emitted the task created event
    expect(mockSocket.emit).toHaveBeenCalledWith('task created', { task, boardId });
  });

  test('emitTaskUpdated emits a task updated event', () => {
    const task = { id: 'task-123', title: 'Updated Task' };
    const boardId = 'board-123';
    
    emitTaskUpdated({ task, boardId }, mockSocket);
    
    // Check if the socket emitted the task updated event
    expect(mockSocket.emit).toHaveBeenCalledWith('task updated', { task, boardId });
  });

  test('emitTaskDeleted emits a task deleted event', () => {
    const taskId = 'task-123';
    const boardId = 'board-123';
    
    emitTaskDeleted({ taskId, boardId }, mockSocket);
    
    // Check if the socket emitted the task deleted event
    expect(mockSocket.emit).toHaveBeenCalledWith('task deleted', { taskId, boardId });
  });

  test('emitTaskMoved emits a task moved event', () => {
    const moveData = {
      taskId: 'task-123',
      sourceColumnId: 'column-1',
      destinationColumnId: 'column-2',
      sourceIndex: 0,
      destinationIndex: 1
    };
    const boardId = 'board-123';
    
    emitTaskMoved({ moveData, boardId }, mockSocket);
    
    // Check if the socket emitted the task moved event
    expect(mockSocket.emit).toHaveBeenCalledWith('task moved', { moveData, boardId });
  });
});