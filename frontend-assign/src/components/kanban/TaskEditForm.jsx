'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { updateTask, optimisticUpdateTask, rollbackUpdateTask } from '../../redux/slices/tasksSlice';
import { addNotification } from '../../redux/slices/uiSlice';
import { emitTaskUpdated } from '../../services/socketService';

const TaskEditForm = ({ task, onClose }) => {
  const dispatch = useDispatch();
  const { users } = useSelector(state => state.users);
  
  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [assignee, setAssignee] = useState(task.assignee || '');
  const [tags, setTags] = useState(task.tags ? task.tags.join(', ') : '');
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [estimatedHours, setEstimatedHours] = useState(task.estimatedHours || '');
  const [subtasks, setSubtasks] = useState(task.subtasks ? task.subtasks.join('\n') : '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Update form when task changes
    setTitle(task.title || '');
    setDescription(task.description || '');
    setPriority(task.priority || 'medium');
    setAssignee(task.assignee || '');
    setTags(task.tags ? task.tags.join(', ') : '');
    setDueDate(task.dueDate || '');
    setEstimatedHours(task.estimatedHours || '');
    setSubtasks(task.subtasks ? task.subtasks.join('\n') : '');
    setErrors({});
  }, [task]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(dueDate);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }
    
    if (estimatedHours && (isNaN(estimatedHours) || Number(estimatedHours) <= 0)) {
      newErrors.estimatedHours = 'Estimated hours must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Store original task for potential rollback
      const originalTask = { ...task };
      
      // Create updated task object
      const updatedTask = {
        ...task,
        title,
        description,
        priority,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        assignee: assignee || null,
        dueDate: dueDate || null,
        estimatedHours: estimatedHours ? Number(estimatedHours) : null,
        subtasks: subtasks ? subtasks.split('\n').map(item => item.trim()).filter(item => item) : [],
        updatedAt: new Date().toISOString(),
      };
      
      // Show pending notification
      const notificationId = uuidv4();
      dispatch(addNotification({
        id: notificationId,
        type: 'info',
        message: 'Updating task...',
      }));
      
      // Optimistic update
      dispatch(optimisticUpdateTask(updatedTask));
      
      // Simulate API call with a small delay to show the optimistic update
      setTimeout(() => {
        try {
          // Emit the task updated event to the server via WebSocket
          emitTaskUpdated({
            task: updatedTask,
            boardId: 'main-board', // In a real app, this would be dynamic
          });
          
          // If the API call is successful, dispatch the actual update action
          dispatch(updateTask(updatedTask));
          
          // Update notification to success
          dispatch(addNotification({
            id: notificationId,
            type: 'success',
            message: 'Task updated successfully!',
          }));
        } catch (error) {
          // If there's an error, roll back the optimistic update
          dispatch(rollbackUpdateTask({ id: task.id, originalTask }));
          
          // Show error notification
          dispatch(addNotification({
            id: notificationId,
            type: 'error',
            message: `Failed to update task: ${error.message}`,
          }));
        }
      }, 1000); // Simulate network delay
      
      // Close form
      onClose();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-2xl mx-auto overflow-y-auto max-h-[90vh]" role="dialog" aria-labelledby="edit-task-title" aria-modal="true">
      <div className="flex justify-between items-center mb-4">
        <h3 id="edit-task-title" className="text-lg font-medium text-gray-800 dark:text-white">Edit Task</h3>
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
      
      <form onSubmit={handleSubmit} className="space-y-4 w-full" aria-describedby="form-description">
        <p id="form-description" className="sr-only">Edit task details and save changes</p>
        
        <div className="mb-4">
          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
            required
            aria-required="true"
            aria-invalid={errors.title ? 'true' : 'false'}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
          {errors.title && (
            <p id="title-error" className="mt-1 text-sm text-red-500">
              {errors.title}
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
            rows="3"
            aria-invalid={errors.description ? 'true' : 'false'}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <p id="description-error" className="mt-1 text-sm text-red-500">
              {errors.description}
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="edit-dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <input
            type="date"
            id="edit-dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={`w-full px-3 py-2 border ${errors.dueDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
            aria-invalid={errors.dueDate ? 'true' : 'false'}
            aria-describedby={errors.dueDate ? 'dueDate-error' : undefined}
          />
          {errors.dueDate && (
            <p id="dueDate-error" className="mt-1 text-sm text-red-500">
              {errors.dueDate}
            </p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="edit-estimatedHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estimated Time (hours)
          </label>
          <input
            type="number"
            id="edit-estimatedHours"
            value={estimatedHours || ''}
            onChange={(e) => setEstimatedHours(e.target.value)}
            className={`w-full px-3 py-2 border ${errors.estimatedHours ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
            placeholder="Enter estimated hours"
            step="0.5"
            min="0"
            aria-invalid={errors.estimatedHours ? 'true' : 'false'}
            aria-describedby={errors.estimatedHours ? 'estimatedHours-error' : undefined}
          />
          {errors.estimatedHours && (
            <p id="estimatedHours-error" className="mt-1 text-sm text-red-500">
              {errors.estimatedHours}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            id="edit-priority"
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
          <label htmlFor="edit-assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Assignee
          </label>
          <select
            id="edit-assignee"
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
          <label htmlFor="edit-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="edit-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="bug, feature, documentation"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="edit-subtasks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subtasks (one per line)
          </label>
          <textarea
            id="edit-subtasks"
            value={subtasks}
            onChange={(e) => setSubtasks(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows="3"
            placeholder="Design mockup\nImplement UI\nWrite tests"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter each subtask on a new line</p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="edit-subtasks" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subtasks (one per line)
          </label>
          <textarea
            id="edit-subtasks"
            value={subtasks}
            onChange={(e) => setSubtasks(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows="3"
            placeholder="Design mockup\nImplement UI\nWrite tests"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter each subtask on a new line</p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={Object.keys(errors).length > 0}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 w-full sm:w-auto ${Object.keys(errors).length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Save task changes"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskEditForm;