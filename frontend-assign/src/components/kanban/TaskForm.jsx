'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { addTask, optimisticAddTask, rollbackAddTask } from '../../redux/slices/tasksSlice';
import { addNotification } from '../../redux/slices/uiSlice';
import { emitTaskCreated } from '../../services/socketService';

const TaskForm = ({ columnId, onClose }) => {
  const dispatch = useDispatch();
  const { users } = useSelector(state => state.users);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assignee, setAssignee] = useState('');
  const [tags, setTags] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [errors, setErrors] = useState({});
  
  // Set minimum date to today for due date picker
  const today = new Date().toISOString().split('T')[0];

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        newErrors.dueDate = 'Invalid date format';
      } else if (dueDateObj < new Date(today)) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }
    
    if (estimatedTime && isNaN(parseFloat(estimatedTime))) {
      newErrors.estimatedTime = 'Estimated time must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const optimisticId = uuidv4();
    const newTask = {
      id: optimisticId,
      title,
      description,
      status: columnId,
      priority,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      assignee: assignee || null,
      createdAt: new Date().toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      estimatedTime: estimatedTime ? parseFloat(estimatedTime) : null,
      isOptimistic: true // Flag to indicate this is an optimistic update
    };
    
    // Show pending notification
    const notificationId = uuidv4();
    dispatch(addNotification({
      id: notificationId,
      type: 'info',
      message: 'Adding task...',
    }));
    
    // Optimistic update
    dispatch(optimisticAddTask(newTask));
    
    // Simulate API call with a small delay to show the optimistic update
    setTimeout(() => {
      try {
        // Emit the task created event to the server via WebSocket
        emitTaskCreated({
          task: { ...newTask, isOptimistic: false },
          boardId: 'main-board', // In a real app, this would be dynamic
        });
        
        // If the API call is successful, dispatch the actual add action
        dispatch(addTask({ ...newTask, isOptimistic: false }));
        
        // Update notification to success
        dispatch(addNotification({
          id: notificationId,
          type: 'success',
          message: 'Task added successfully!',
        }));
      } catch (error) {
        // If there's an error, roll back the optimistic update
        dispatch(rollbackAddTask(optimisticId));
        
        // Show error notification
        dispatch(addNotification({
          id: notificationId,
          type: 'error',
          message: `Failed to add task: ${error.message}`,
        }));
      }
    }, 1000); // Simulate network delay
    
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setTags('');
    setAssignee('');
    setDueDate('');
    setEstimatedTime('');
    setErrors({});
    
    // Close form
    onClose();
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-2xl mx-auto overflow-y-auto max-h-[90vh]"
      role="dialog"
      aria-labelledby="task-form-title"
      aria-modal="true"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 id="task-form-title" className="text-lg font-medium text-gray-900 dark:text-white">Add New Task</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded dark:text-gray-300 dark:hover:text-white"
          aria-label="Close form"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} aria-describedby="form-description" className="space-y-4 w-full">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
            required
            aria-required="true"
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows="3"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={`w-full px-3 py-2 border ${errors.dueDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
            min={today}
          />
          {errors.dueDate && <p className="mt-1 text-sm text-red-500">{errors.dueDate}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estimated Time (hours)
          </label>
          <input
            type="number"
            id="estimatedTime"
            value={estimatedTime || ''}
            onChange={(e) => setEstimatedTime(e.target.value)}
            className={`w-full px-3 py-2 border ${errors.estimatedTime ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
            placeholder="Enter estimated hours"
            step="0.5"
            min="0"
          />
          {errors.estimatedTime && <p className="mt-1 text-sm text-red-500">{errors.estimatedTime}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assignee
          </label>
          <select
            id="assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Unassigned</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="bug, feature, documentation"
          />
        </div>
        
        <p id="form-description" className="sr-only">This form allows you to create a new task in the {columnId} column.</p>
        
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800 w-full sm:w-auto"
            aria-label="Add task to board"
            disabled={Object.keys(errors).length > 0}
          >
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;