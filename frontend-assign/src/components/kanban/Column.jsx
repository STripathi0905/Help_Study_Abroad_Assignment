'use client';

import React, { useState, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import Task from './Task';
import TaskForm from './TaskForm';

const Column = ({ column, tasks, isDragging, onKeyDown }) => {
  const [isOver, setIsOver] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  const handleAddTask = () => {
    setShowTaskForm(true);
  };
  
  const closeTaskForm = () => {
    setShowTaskForm(false);
  };
  // Get column color based on column id
  const getColumnColor = (columnId) => {
    switch (columnId) {
      case 'queue':
        return 'bg-blue-50 border-blue-200';
      case 'in-progress':
        return 'bg-yellow-50 border-yellow-200';
      case 'done':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const columnColor = getColumnColor(column.id);

  return (
    <div 
      className={`rounded-md shadow-md p-4 min-w-[250px] w-full md:w-[calc(33.333%-1rem)] lg:w-[350px] flex-shrink-0 md:flex-shrink transition-all duration-300 ${
        isOver ? 'bg-blue-50 ring-2 ring-blue-300 scale-[1.02]' : 
        isDragging && column.id === 'queue' ? 'bg-red-50 border-red-200' : 
        isDragging && column.id === 'in-progress' ? 'bg-yellow-50 border-yellow-200' : 
        isDragging && column.id === 'done' ? 'bg-green-50 border-green-200' : 
        column.id === 'queue' ? 'bg-red-50/70' : 
        column.id === 'in-progress' ? 'bg-yellow-50/70' : 
        column.id === 'done' ? 'bg-green-50/70' : 
        'bg-gray-100'
      }`}
      role="region"
      aria-labelledby={`column-${column.id}-header`}
      data-column-id={column.id}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 
          id={`column-${column.id}-header`} 
          className="font-semibold text-lg flex items-center"
        >
          {column.title}
          <span 
            className={`ml-2 text-sm rounded-full px-2 py-1 ${isOver ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'}`}
            aria-label={`${tasks ? tasks.length : 0} tasks`}
          >
            {tasks ? tasks.length : 0}
          </span>
        </h3>
        <button
          onClick={handleAddTask}
          className="p-1 rounded-full hover:bg-gray-200 text-gray-600 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label={`Add task to ${column.title}`}
          aria-haspopup="dialog"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span className="sr-only">Add task</span>
        </button>
      </div>
      
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => {
          // Use useEffect to update state instead of doing it during render
          useEffect(() => {
            setIsOver(snapshot.isDraggingOver);
          }, [snapshot.isDraggingOver]);
          
          return (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[300px] md:min-h-[500px] transition-all duration-300 
                ${snapshot.isDraggingOver ? 'bg-blue-100/70 ring-2 ring-blue-300 scale-[1.01] shadow-inner' : ''} 
                ${isDragging && !snapshot.isDraggingOver ? 'bg-gray-50 border-2 border-dashed border-gray-300' : ''}
                rounded-md p-1 relative`}
              role="list"
              aria-label={`${column.title} tasks`}
              aria-describedby={isDragging ? 'drag-instructions' : undefined}
              aria-live="polite"
              aria-relevant="additions removals"
            >
              {/* Visual indicator for drop target */}
              {isDragging && (
                <div className={`absolute inset-0 pointer-events-none flex items-center justify-center ${snapshot.isDraggingOver ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
                  <div className="text-blue-500 font-medium text-sm bg-white/80 px-2 py-1 rounded shadow-sm">
                    Drop here
                  </div>
                </div>
              )}
              {tasks.map((task, index) => (
                task ? <Task key={task.id} task={task} index={index} /> : null
              ))}
              {provided.placeholder}
              
              {/* Empty state when no tasks */}
              {tasks.length === 0 && !snapshot.isDraggingOver && (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
                  <p id={`empty-state-${column.id}`}>No tasks yet</p>
                  <button 
                    onClick={handleAddTask}
                    className="mt-2 text-blue-500 hover:text-blue-700 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md px-2 py-1"
                    aria-labelledby={`empty-state-${column.id}`}
                    aria-haspopup="dialog"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add a task
                  </button>
                </div>
              )}
            </div>
          );
        }}
      </Droppable>
      
      {/* Task Form Modal */}
      {showTaskForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
          onClick={closeTaskForm}
          role="presentation"
          aria-modal="true"
        >
          <div 
            className="max-w-md w-full" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="task-form-title"
          >
            <TaskForm
              columnId={column.id}
              onClose={closeTaskForm}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Column;