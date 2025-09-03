'use client';

import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';
import { moveTask, optimisticMoveTask, rollbackMoveTask } from '../../redux/slices/boardsSlice';
import { emitTaskMoved } from '../../services/socketService';
import { addNotification } from '../../redux/slices/uiSlice';
import { v4 as uuidv4 } from 'uuid';

const Board = () => {
  const dispatch = useDispatch();
  const { columns, columnOrder, loading, error } = useSelector((state) => state.boards);
  const { tasks } = useSelector((state) => state.tasks);
  const { searchTerm, filters } = useSelector((state) => state.ui);
  const [isDragging, setIsDragging] = useState(false);
  
  // Filter tasks based on search term and filters
  const filteredTasks = useMemo(() => {
    const tasksArray = Object.values(tasks);
    
    return tasksArray.filter(task => {
      // Search term filter
      if (searchTerm && !(
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )) {
        return false;
      }
      
      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }
      
      // Assignee filter
      if (filters.assignee.length > 0) {
        // Handle both null/undefined assignee (unassigned) and specific assignees
        if (filters.assignee.includes(null) && !task.assignee) {
          // Pass the filter if looking for unassigned tasks and this task is unassigned
        } else if (!task.assignee || !filters.assignee.includes(task.assignee)) {
          return false;
        }
      }
      
      // Tags filter
      if (filters.tags.length > 0) {
        // Check if any of the task's tags match any of the filter tags
        if (!task.tags || !task.tags.some(tag => filters.tags.includes(tag))) {
          return false;
        }
      }
      
      return true;
    });
  }, [tasks, searchTerm, filters]);
  
  // Create a filtered tasks object that matches the original structure
  const filteredTasksObj = useMemo(() => {
    return filteredTasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {});
  }, [filteredTasks]);

  // Handle drag events
  const onDragStart = (start) => {
    setIsDragging(true);
    
    // Add a class to the dragged item for visual feedback
    const draggedElement = document.querySelector(`[data-task-id="${start.draggableId}"]`);
    if (draggedElement) {
      draggedElement.classList.add('is-dragging');
      // Add a subtle rotation and shadow for better visual feedback
      draggedElement.style.transform = 'rotate(2deg)';
      draggedElement.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.15)';
      draggedElement.style.zIndex = '50';
    }
    
    // Add a class to the source column for visual feedback
    const sourceColumn = document.querySelector(`[data-column-id="${start.source.droppableId}"]`);
    if (sourceColumn) {
      sourceColumn.classList.add('is-source-column');
      // Add a subtle background color change
      sourceColumn.style.backgroundColor = 'rgba(236, 253, 245, 0.6)';
    }
    
    // Add a class to all potential destination columns for visual feedback
    columns.forEach(column => {
      if (column.id !== start.source.droppableId) {
        const columnElement = document.querySelector(`[data-column-id="${column.id}"]`);
        if (columnElement) {
          columnElement.classList.add('is-potential-destination');
          // Add a pulsing border effect
          columnElement.style.animation = 'pulse-border 1.5s infinite';
          columnElement.style.borderStyle = 'dashed';
          columnElement.style.borderWidth = '2px';
          columnElement.style.borderColor = 'rgba(59, 130, 246, 0.5)';
        }
      }
    });
    
    // Add a style tag for the pulse animation if it doesn't exist
    if (!document.getElementById('drag-drop-styles')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'drag-drop-styles';
      styleTag.textContent = `
        @keyframes pulse-border {
          0% { border-color: rgba(59, 130, 246, 0.3); }
          50% { border-color: rgba(59, 130, 246, 0.8); }
          100% { border-color: rgba(59, 130, 246, 0.3); }
        }
      `;
      document.head.appendChild(styleTag);
    }
    
    // Announce to screen readers
    const task = tasks[start.draggableId];
    if (task) {
      const announcer = document.getElementById('drag-announcer');
      if (announcer) {
        announcer.textContent = `Dragging task: ${task.title}. Use arrow keys to navigate between columns. Press space to drop.`;
      }
    }
  };

  const onDragEnd = (result) => {
    setIsDragging(false);
    const { destination, source, draggableId } = result;
    
    // Remove visual feedback classes and styles from dragged element
    const draggedElement = document.querySelector(`[data-task-id="${draggableId}"]`);
    if (draggedElement) {
      draggedElement.classList.remove('is-dragging');
      // Reset the added styles
      draggedElement.style.transform = '';
      draggedElement.style.boxShadow = '';
      draggedElement.style.zIndex = '';
    }
    
    // Remove source column class and styles
    const sourceColumn = document.querySelector(`[data-column-id="${source.droppableId}"]`);
    if (sourceColumn) {
      sourceColumn.classList.remove('is-source-column');
      sourceColumn.style.backgroundColor = '';
    }
    
    // Remove destination column class if exists
    if (destination) {
      const destColumn = document.querySelector(`[data-column-id="${destination.droppableId}"]`);
      if (destColumn) {
        destColumn.classList.remove('is-destination-column');
      }
    }
    
    // Remove potential destination class and styles from all columns
    document.querySelectorAll('.is-potential-destination').forEach(element => {
      element.classList.remove('is-potential-destination');
      element.style.animation = '';
      element.style.borderStyle = '';
      element.style.borderWidth = '';
      element.style.borderColor = '';
    });
    
    // Remove the style tag if it exists
    const styleTag = document.getElementById('drag-drop-styles');
    if (styleTag) {
      styleTag.remove();
    }
    
    // Clear screen reader announcement
    const announcer = document.getElementById('drag-announcer');
    if (announcer) {
      announcer.textContent = '';
    }
    
    // Add a success animation if the task was dropped in a valid location
    if (destination) {
      const successAnnouncer = document.createElement('div');
      successAnnouncer.className = 'fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded shadow-md z-50 animate-fade-out';
      successAnnouncer.textContent = 'Task moved successfully!';
      document.body.appendChild(successAnnouncer);
      
      // Add the animation style if it doesn't exist
      if (!document.getElementById('success-animation-style')) {
        const animStyle = document.createElement('style');
        animStyle.id = 'success-animation-style';
        animStyle.textContent = `
          @keyframes fadeOut {
            0% { opacity: 1; }
            70% { opacity: 1; }
            100% { opacity: 0; }
          }
          .animate-fade-out {
            animation: fadeOut 2s forwards;
          }
        `;
        document.head.appendChild(animStyle);
      }
      
      // Remove the success announcer after animation
      setTimeout(() => {
        successAnnouncer.remove();
        const animStyle = document.getElementById('success-animation-style');
        if (animStyle) animStyle.remove();
      }, 2000);
    }

    // If there's no destination or if the item was dropped back to its original position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Create data object for the move
    const moveData = {
      source,
      destination,
      taskId: draggableId,
      boardId: 'main-board', // In a real app, this would be dynamic
    };
    
    // Create notification for optimistic update
    const notificationId = uuidv4();
    dispatch(addNotification({
      id: notificationId,
      type: 'info',
      message: 'Moving task...',
    }));
    
    // Dispatch optimistic move task action
    dispatch(optimisticMoveTask(moveData));
    
    // Simulate API call with a small delay to show the optimistic update
    setTimeout(() => {
      try {
        // Emit the task moved event to the server via WebSocket
        emitTaskMoved(moveData);
        
        // If the API call is successful, dispatch the actual move action
        dispatch(moveTask(moveData));
        
        // Update notification to success
        dispatch(addNotification({
          id: notificationId,
          type: 'success',
          message: 'Task moved successfully!',
        }));
      } catch (error) {
        // If there's an error, roll back the optimistic update
        dispatch(rollbackMoveTask());
        
        // Show error notification
        dispatch(addNotification({
          id: notificationId,
          type: 'error',
          message: `Failed to move task: ${error.message}`,
        }));
      }
    }, 500); // Shorter delay for better UX
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  // Keyboard navigation for accessibility
  const handleKeyDown = (e, columnId, taskId) => {
    // Only handle keyboard navigation when not dragging
    if (isDragging) return;
    
    const currentColumn = columns.find(col => col.id === columnId);
    const columnIndex = columnOrder.indexOf(columnId);
    
    switch (e.key) {
      case 'ArrowRight':
        if (columnIndex < columnOrder.length - 1) {
          const nextColumnId = columnOrder[columnIndex + 1];
          const moveData = {
            source: { droppableId: columnId, index: currentColumn.taskIds.indexOf(taskId) },
            destination: { droppableId: nextColumnId, index: 0 },
            taskId,
            boardId: 'main-board',
          };
          dispatch(moveTask(moveData));
          emitTaskMoved(moveData);
          // Focus the first task in the next column
          setTimeout(() => {
            const nextTaskElement = document.querySelector(`[data-column-id="${nextColumnId}"] [data-task-id]`);
            if (nextTaskElement) nextTaskElement.focus();
          }, 100);
        }
        break;
      case 'ArrowLeft':
        if (columnIndex > 0) {
          const prevColumnId = columnOrder[columnIndex - 1];
          const moveData = {
            source: { droppableId: columnId, index: currentColumn.taskIds.indexOf(taskId) },
            destination: { droppableId: prevColumnId, index: 0 },
            taskId,
            boardId: 'main-board',
          };
          dispatch(moveTask(moveData));
          emitTaskMoved(moveData);
          // Focus the first task in the previous column
          setTimeout(() => {
            const prevTaskElement = document.querySelector(`[data-column-id="${prevColumnId}"] [data-task-id]`);
            if (prevTaskElement) prevTaskElement.focus();
          }, 100);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div 
      className="kanban-board w-full max-w-full overflow-x-auto pb-4 px-2 md:px-4"
      role="application"
      aria-label="Kanban Board"
    >
      <h1 className="text-2xl font-bold mb-6" id="kanban-heading">Kanban Board</h1>
      
      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" id="drag-instructions">
        Use space bar to start dragging. Use arrow keys to move between columns. Press space bar again to drop.
        On mobile devices, touch and hold to start dragging.
      </div>
      
      <div className="sr-only" aria-live="assertive" id="drag-announcer"></div>
      
      {/* High contrast mode toggle for accessibility */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => document.body.classList.toggle('high-contrast-mode')}
          className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-pressed="false"
        >
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
              <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm0 10a4 4 0 110-8 4 4 0 010 8z" />
            </svg>
            High Contrast
          </span>
        </button>
      </div>
      
      <DragDropContext 
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div 
          className={`flex flex-col md:flex-row gap-4 p-2 rounded-lg transition-all duration-300 ${isDragging ? 'bg-gray-100 shadow-inner scale-[0.99]' : ''} overflow-x-auto md:overflow-visible`}
          aria-labelledby="kanban-heading"
          style={{ touchAction: 'manipulation' }} /* Improve touch behavior */
        >
          {columnOrder.map((columnId) => {
            const column = columns.find(col => col.id === columnId);
            // Filter column tasks to only include those that pass the filters
            const columnTasks = column.taskIds
              .filter(taskId => filteredTasksObj[taskId]) // Only include tasks that exist in filteredTasksObj
              .map(taskId => tasks[taskId]);
            
            return (
              <Column 
                key={column.id} 
                column={column} 
                tasks={columnTasks}
                isDragging={isDragging}
                onKeyDown={handleKeyDown}
              />
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;