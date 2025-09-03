import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TaskForm from '../TaskForm';
import { optimisticAddTask, addTask } from '../../../redux/slices/tasksSlice';
import { addNotification } from '../../../redux/slices/uiSlice';

// Mock the socket service
jest.mock('../../../services/socketService', () => ({
  emitTaskCreated: jest.fn(),
}));

// Mock redux actions
jest.mock('../../../redux/slices/tasksSlice', () => ({
  optimisticAddTask: jest.fn(),
  addTask: jest.fn(),
  rollbackAddTask: jest.fn(),
}));

jest.mock('../../../redux/slices/uiSlice', () => ({
  addNotification: jest.fn(),
}));

const mockStore = configureStore([]);

describe('TaskForm Component', () => {
  let store;
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    store = mockStore({
      tasks: {
        tasks: [],
      },
      ui: {
        notifications: [],
      },
    });
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders form with all fields', () => {
    render(
      <Provider store={store}>
        <TaskForm columnId="queue" onClose={mockOnClose} />
      </Provider>
    );

    // Check if all form fields are rendered
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assignee/i)).toBeInTheDocument();
    
    // Check if buttons are rendered
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const { emitTaskCreated } = require('../../../services/socketService');
    
    render(
      <Provider store={store}>
        <TaskForm columnId="queue" onClose={mockOnClose} />
      </Provider>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Task description' } });
    fireEvent.change(screen.getByLabelText(/priority/i), { target: { value: 'high' } });
    fireEvent.change(screen.getByLabelText(/tags/i), { target: { value: 'frontend,bug' } });
    fireEvent.change(screen.getByLabelText(/assignee/i), { target: { value: 'John Doe' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    
    // Check if optimistic update was dispatched
    expect(optimisticAddTask).toHaveBeenCalled();
    
    // Check if notification was added
    expect(addNotification).toHaveBeenCalled();
    
    // Wait for the setTimeout to complete
    await waitFor(() => {
      // Check if the task was emitted via WebSocket
      expect(emitTaskCreated).toHaveBeenCalled();
      
      // Check if the actual add action was dispatched
      expect(addTask).toHaveBeenCalled();
      
      // Check if the form was closed
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('does not submit form with empty title', () => {
    render(
      <Provider store={store}>
        <TaskForm columnId="queue" onClose={mockOnClose} />
      </Provider>
    );

    // Submit the form without filling the title
    fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    
    // Check that no actions were dispatched
    expect(optimisticAddTask).not.toHaveBeenCalled();
    expect(addNotification).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('closes form when cancel button is clicked', () => {
    render(
      <Provider store={store}>
        <TaskForm columnId="queue" onClose={mockOnClose} />
      </Provider>
    );

    // Click the cancel button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    
    // Check if the form was closed
    expect(mockOnClose).toHaveBeenCalled();
  });
});