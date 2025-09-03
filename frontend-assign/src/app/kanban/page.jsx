'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Board from '../../components/kanban/Board';
import TaskForm from '../../components/kanban/TaskForm';
import NotificationContainer from '../../components/kanban/Notification';
import SearchAndFilter from '../../components/kanban/SearchAndFilter';
import ConnectionStatus from '../../components/ConnectionStatus';
import ActiveUsers from '../../components/ActiveUsers';
import TypingIndicator from '../../components/TypingIndicator';
import { setTasks } from '../../redux/slices/tasksSlice';
import { setColumns } from '../../redux/slices/boardsSlice';
import { initializeSocket, joinBoard, disconnectSocket, requestActiveUsers } from '../../services/socketService';

// Sample initial data for demonstration
const initialTasks = {
  'task-1': { id: 'task-1', title: 'Create login page', description: 'Implement user authentication', priority: 'high', tags: ['frontend', 'auth'] },
  'task-2': { id: 'task-2', title: 'Setup database', description: 'Configure MongoDB connection', priority: 'high', tags: ['backend', 'database'] },
  'task-3': { id: 'task-3', title: 'Design UI components', description: 'Create reusable components', priority: 'medium', tags: ['frontend', 'design'] },
  'task-4': { id: 'task-4', title: 'Write tests', description: 'Unit tests for API endpoints', priority: 'low', tags: ['testing'] },
  'task-5': { id: 'task-5', title: 'Implement WebSockets', description: 'Real-time updates for tasks', priority: 'medium', tags: ['backend', 'real-time'] },
};

const initialColumns = [
  { id: 'queue', title: 'Queue', taskIds: ['task-1', 'task-4'] },
  { id: 'in-progress', title: 'In Progress', taskIds: ['task-2', 'task-3'] },
  { id: 'done', title: 'Done', taskIds: ['task-5'] },
];

export default function KanbanPage() {
  const dispatch = useDispatch();
  const { notifications } = useSelector(state => state.ui);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState(null);

  // Load initial data and initialize WebSocket
  useEffect(() => {
    // In a real app, this would be an API call to fetch data
    dispatch(setTasks(initialTasks));
    dispatch(setColumns(initialColumns));
    
    // Initialize WebSocket connection
    const socket = initializeSocket(dispatch);
    
    // Join the default board with user data
    const defaultBoardId = 'main-board'; // In a real app, this would be dynamic
    const userData = {
      id: `user-${Math.floor(Math.random() * 10000)}`,
      name: `User ${Math.floor(Math.random() * 100)}`,
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
    };
    
    joinBoard(defaultBoardId, userData);
    
    // Request active users list
    requestActiveUsers(defaultBoardId);
    
    // Set up an interval to periodically request active users
    const activeUsersInterval = setInterval(() => {
      requestActiveUsers(defaultBoardId);
    }, 30000); // Every 30 seconds
    
    // Cleanup on unmount
    return () => {
      clearInterval(activeUsersInterval);
      disconnectSocket();
    };
  }, [dispatch]);

  const handleAddTask = (columnId) => {
    setSelectedColumn(columnId);
    setShowTaskForm(true);
  };

  return (
    <div className="kanban-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kanban Board</h1>
        <button
          onClick={() => handleAddTask('queue')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          aria-label="Add new task"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Task
        </button>
      </div>
      
      <SearchAndFilter />

      <Board />

      {/* Task form modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="max-w-md w-full">
            <TaskForm
              columnId={selectedColumn}
              onClose={() => setShowTaskForm(false)}
            />
          </div>
        </div>
      )}

      {/* Notifications */}
      <NotificationContainer notifications={notifications} />
      
      {/* Connection Status */}
      <ConnectionStatus />
      
      {/* Active Users */}
      <ActiveUsers />
      
      {/* Typing Indicator */}
      <TypingIndicator boardId="main-board" />
    </div>
  );
}