'use client';

import { Draggable } from '@hello-pangea/dnd';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { emitTaskUpdated, emitTaskDeleted } from '../../services/socketService';
import { deleteTask, optimisticDeleteTask, rollbackDeleteTask } from '../../redux/slices/tasksSlice';
import { addNotification } from '../../redux/slices/uiSlice';
import TaskEditForm from './TaskEditForm';

const Task = ({ task, index }) => {
  const dispatch = useDispatch();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    // Store original task for potential rollback
    const originalTask = { ...task };
    
    // Show pending notification
    const notificationId = Date.now().toString();
    dispatch(addNotification({
      id: notificationId,
      type: 'info',
      message: 'Deleting task...'
    }));
    
    // Optimistic update - delete the task immediately in UI
    dispatch(optimisticDeleteTask(task.id));
    
    // Simulate API call with a small delay to show the optimistic update
    setTimeout(() => {
      try {
        // Emit the task deleted event to the server via WebSocket
        emitTaskDeleted({
          taskId: task.id,
          boardId: 'main-board', // In a real app, this would be dynamic
        });
        
        // If the API call is successful, dispatch the actual delete action
        dispatch(deleteTask(task.id));
        
        // Update notification to success
        dispatch(addNotification({
          id: notificationId,
          type: 'success',
          message: 'Task deleted successfully!'
        }));
      } catch (error) {
        // If there's an error, roll back the optimistic update
        dispatch(rollbackDeleteTask(originalTask));
        
        // Show error notification
        dispatch(addNotification({
          id: notificationId,
          type: 'error',
          message: `Failed to delete task: ${error.message}`
        }));
      }
    }, 1000); // Simulate network delay
    
    setShowDeleteConfirm(false);
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };
  
  const closeEditForm = () => {
    setShowEditForm(false);
  };
  
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };
  
  // Handle keyboard events for accessibility
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
        // Open edit modal on Enter
        e.preventDefault();
        handleEdit();
        break;
      case ' ':
        // Toggle details on Space
        e.preventDefault();
        toggleDetails();
        break;
      case 'e':
        // Edit task with 'e' key
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleEdit();
        }
        break;
      case 'Delete':
      case 'Backspace':
        // Delete task on Delete or Backspace
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleDelete();
        }
        break;
      case 'i':
        // Toggle details with 'i' key
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          toggleDetails();
        }
        break;
      case 'Escape':
        // Close any open dialogs
        if (showDeleteConfirm) {
          e.preventDefault();
          setShowDeleteConfirm(false);
        }
        break;
      default:
        break;
    }
  };

  if (!task) return null;

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-400';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'medium':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'low':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const priorityColor = getPriorityColor(task.priority);

  return (
    <>
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="max-w-lg w-full mx-4">
            <TaskEditForm task={task} onClose={closeEditForm} />
          </div>
        </div>
      )}
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
             ref={provided.innerRef}
             {...provided.draggableProps}
             className={`bg-white rounded-md shadow-sm p-3 mb-2 border-l-4 ${getPriorityColor(task.priority)} 
               ${snapshot.isDragging ? 'ring-2 ring-blue-400 shadow-lg rotate-1 scale-105 is-dragging z-50' : ''} 
               transition-all duration-300 hover:shadow-md touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500
               ${task.isOptimistic ? 'opacity-70 animate-pulse' : ''} break-words`}
             style={{
               ...provided.draggableProps.style,
               opacity: snapshot.isDragging ? 0.9 : 1,
               touchAction: 'none', // Improve touch behavior
               transform: snapshot.isDragging ? `${provided.draggableProps.style.transform} rotate(1deg)` : provided.draggableProps.style.transform
             }}
             role="article"
             aria-roledescription="Draggable task"
             aria-label={`Task: ${task.title}, Priority: ${task.priority}${task.assignee ? `, Assigned to: ${task.assignee}` : ''}${task.dueDate ? `, Due: ${format(new Date(task.dueDate), 'MMMM d')}` : ''}${task.estimatedHours ? `, Estimated: ${task.estimatedHours} hours` : ''}`}
             aria-describedby={`task-${task.id}-description`}
             tabIndex={0}
             onKeyDown={handleKeyDown}
             data-task-id={task.id}
           >
          {/* Task Header */}
          <div className="flex justify-between items-start mb-2 flex-wrap gap-1">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate max-w-full">{task.title}</h3>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button 
                onClick={toggleDetails}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label="Toggle task details"
                aria-pressed={showDetails}
                aria-controls={`task-${task.id}-description`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">{showDetails ? 'Hide' : 'Show'} details</span>
              </button>
              <button 
                onClick={handleEdit}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label="Edit task"
                aria-haspopup="dialog"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span className="sr-only">Edit</span>
              </button>
              <button 
                onClick={handleDelete}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label="Delete task"
                aria-haspopup="dialog"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">Delete</span>
              </button>
              <div 
                {...provided.dragHandleProps} 
                className="cursor-grab p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label="Drag handle"
                role="button"
                tabIndex={0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="8" r="1"/>
                  <circle cx="8" cy="16" r="1"/>
                  <circle cx="16" cy="8" r="1"/>
                  <circle cx="16" cy="16" r="1"/>
                </svg>
                <span className="sr-only">Drag task</span>
              </div>
            </div>
          </div>
          
          {/* Task Description - Conditionally shown */}
          {(task.description && (showDetails || task.description.length < 50)) && (
            <p id={`task-${task.id}-description`} className="text-sm text-gray-600 mb-3">{task.description}</p>
          )}
          
          {/* Task Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 max-w-full" aria-label="Task tags">
              {task.tags.map(tag => {
                // Generate a consistent color for each tag
                const tagHash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const hue = tagHash % 360;
                const tagColor = `hsla(${hue}, 70%, 95%, 1)`;
                const tagTextColor = `hsla(${hue}, 70%, 30%, 1)`;
                
                return (
                  <span 
                    key={tag} 
                    className="text-xs px-2 py-0.5 rounded-full flex items-center max-w-full truncate"
                    style={{ backgroundColor: tagColor, color: tagTextColor, borderColor: `hsla(${hue}, 70%, 80%, 1)` }}
                    role="listitem"
                  >
                    <span className="w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0" style={{ backgroundColor: tagTextColor }}></span>
                    <span className="truncate">{tag}</span>
                  </span>
                );
              })}
            </div>
          )}
          
          {/* Subtasks - Conditionally shown */}
          {task.subtasks && task.subtasks.length > 0 && showDetails && (
            <div className="mt-3 mb-2">
              <h4 className="text-xs font-medium text-gray-700 mb-1">Subtasks:</h4>
              <ul className="text-xs text-gray-600 pl-4 list-disc">
                {task.subtasks.map((subtask, idx) => (
                  <li key={idx} className="mb-0.5">{subtask}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Due Date and Estimated Hours */}
          <div className="flex flex-wrap gap-2 mt-2">
            {task.dueDate && (
              <div 
                className={`text-xs px-2 py-1 rounded-full flex items-center flex-shrink-0 ${isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) ? 'bg-red-100 text-red-800' : isToday(new Date(task.dueDate)) ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}
                title="Due date"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="whitespace-nowrap">{format(new Date(task.dueDate), 'MMM d')}</span>
              </div>
            )}
            
            {task.estimatedHours && (
              <div className="text-xs px-2 py-1 rounded-full flex items-center flex-shrink-0 bg-purple-100 text-purple-800" title="Estimated hours">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="whitespace-nowrap">{task.estimatedHours}h</span>
              </div>
            )}
          </div>
          
          {/* Task Footer */}
          <div className="flex flex-wrap justify-between items-center mt-3 gap-2">
            <span className={`text-xs px-2 py-1 rounded-full flex items-center ${priorityColor} flex-shrink-0`}>
              {getPriorityIcon(task.priority)}
              {task.priority}
            </span>
            
            {task.assignee && (
              <div className="flex items-center flex-shrink-0">
                <span className="text-xs text-gray-500 mr-1 hidden sm:inline">Assigned to:</span>
                <div 
                  className="w-6 h-6 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-xs font-medium text-blue-800 overflow-hidden"
                  title={task.assignee}
                  role="img"
                  aria-label={`Assigned to ${task.assignee}`}
                >
                  {typeof task.assignee === 'string' ? task.assignee.substring(0, 2).toUpperCase() : 'NA'}
                </div>
              </div>
            )}
          </div>

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div 
              className="absolute inset-0 bg-white bg-opacity-90 rounded-md z-10 flex flex-col justify-center items-center p-3 border border-red-200"
              role="alertdialog"
              aria-labelledby="delete-dialog-title"
              aria-describedby="delete-dialog-desc"
            >
              <p id="delete-dialog-title" className="text-sm font-medium text-gray-800 mb-1 text-center">Delete Confirmation</p>
              <p id="delete-dialog-desc" className="text-sm text-gray-600 mb-3 text-center">Are you sure you want to delete this task?</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  autoFocus
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
          </div>
        )}
      </Draggable>
    </>
  );
};

export default Task;