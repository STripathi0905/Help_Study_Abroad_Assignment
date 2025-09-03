'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchTerm, setFilters, clearFilters } from '../../redux/slices/uiSlice';

const SearchAndFilter = () => {
  const dispatch = useDispatch();
  const { searchTerm, filters } = useSelector(state => state.ui);
  const { users } = useSelector(state => state.users);
  const { tasks } = useSelector(state => state.tasks);
  
  // Local state for form controls
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');
  const [localFilters, setLocalFilters] = useState(filters || {
    priority: [],
    assignee: [],
    tags: []
  });
  const [lastSaved, setLastSaved] = useState(null);
  
  // Get unique tags from all tasks
  // Ensure tasks is treated as an object and handle the case when it's null or undefined
  const allTags = tasks && typeof tasks === 'object' ? 
    [...new Set(Object.values(tasks).flatMap(task => task?.tags || []))] : 
    [];
  
  // Load filters from localStorage on component mount
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem('kanban_filters');
      const savedSearchTerm = localStorage.getItem('kanban_search_term');
      const savedTimestamp = localStorage.getItem('kanban_filters_timestamp');
      
      // Check if saved filters exist and are not too old (7 days)
      const isRecent = savedTimestamp && 
        (Date.now() - parseInt(savedTimestamp, 10)) < 7 * 24 * 60 * 60 * 1000;
      
      if (savedTimestamp) {
        setLastSaved(new Date(parseInt(savedTimestamp, 10)));
      }
      
      if (savedFilters && isRecent) {
        try {
          const parsedFilters = JSON.parse(savedFilters);
          // Validate the structure of parsedFilters
          if (parsedFilters && 
              typeof parsedFilters === 'object' && 
              Array.isArray(parsedFilters.priority) && 
              Array.isArray(parsedFilters.assignee) && 
              Array.isArray(parsedFilters.tags)) {
            setLocalFilters(parsedFilters);
            dispatch(setFilters(parsedFilters));
          } else {
            throw new Error('Invalid filter structure');
          }
        } catch (error) {
          console.error('Error parsing saved filters:', error);
          // Reset to default if there's an error
          localStorage.removeItem('kanban_filters');
        }
      }
      
      if (savedSearchTerm && isRecent) {
        setLocalSearchTerm(savedSearchTerm);
        dispatch(setSearchTerm(savedSearchTerm));
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  }, [dispatch]);
  
  // Save filters to localStorage when they change
  useEffect(() => {
    try {
      const now = Date.now();
      localStorage.setItem('kanban_filters', JSON.stringify(localFilters));
      localStorage.setItem('kanban_search_term', localSearchTerm);
      localStorage.setItem('kanban_filters_timestamp', now.toString());
      setLastSaved(new Date(now));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }, [localFilters, localSearchTerm]);
  
  // Handle search input changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchTerm(localSearchTerm));
    }, 300);
    
    return () => clearTimeout(timer);
  }, [localSearchTerm, dispatch]);
  
  // Toggle a filter value
  const toggleFilter = (type, value) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev };
      
      if (newFilters[type].includes(value)) {
        newFilters[type] = newFilters[type].filter(item => item !== value);
      } else {
        newFilters[type] = [...newFilters[type], value];
      }
      
      dispatch(setFilters(newFilters));
      return newFilters;
    });
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    const emptyFilters = {
      priority: [],
      assignee: [],
      tags: []
    };
    
    setLocalFilters(emptyFilters);
    setLocalSearchTerm('');
    dispatch(clearFilters());
    dispatch(setSearchTerm(''));
    setLastSaved(null);
    
    // Clear localStorage
    try {
      localStorage.removeItem('kanban_filters');
      localStorage.removeItem('kanban_search_term');
      localStorage.removeItem('kanban_filters_timestamp');
    } catch (error) {
      console.error('Error clearing filters from localStorage:', error);
    }
  };
  
  // Check if a filter is active
  const isFilterActive = (type, value) => {
    return localFilters[type].includes(value);
  };
  
  // Check if any filter is applied
  const hasActiveFilters = () => {
    return (
      localFilters.priority.length > 0 ||
      localFilters.assignee.length > 0 ||
      localFilters.tags.length > 0 ||
      localSearchTerm.trim() !== ''
    );
  };
  
  // Format the last saved date in a user-friendly way
  const formatLastSaved = () => {
    if (!lastSaved) return '';
    
    const now = new Date();
    const diffMs = now - lastSaved;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return lastSaved.toLocaleDateString();
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="mb-3 sm:mb-4">
        <div className="relative">
          <input
            type="text"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            aria-label="Search tasks"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          {localSearchTerm && (
            <button
              onClick={() => setLocalSearchTerm('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">Priority:</div>
        <button
          onClick={() => toggleFilter('priority', 'high')}
          className={`px-2 py-1 text-xs rounded-full ${isFilterActive('priority', 'high') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
          aria-pressed={isFilterActive('priority', 'high')}
        >
          High
        </button>
        <button
          onClick={() => toggleFilter('priority', 'medium')}
          className={`px-2 py-1 text-xs rounded-full ${isFilterActive('priority', 'medium') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
          aria-pressed={isFilterActive('priority', 'medium')}
        >
          Medium
        </button>
        <button
          onClick={() => toggleFilter('priority', 'low')}
          className={`px-2 py-1 text-xs rounded-full ${isFilterActive('priority', 'low') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
          aria-pressed={isFilterActive('priority', 'low')}
        >
          Low
        </button>
      </div>
      
      {users.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">Assignee:</div>
          <button
            onClick={() => toggleFilter('assignee', null)}
            className={`px-2 py-1 text-xs rounded-full ${isFilterActive('assignee', null) ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
            aria-pressed={isFilterActive('assignee', null)}
          >
            Unassigned
          </button>
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => toggleFilter('assignee', user.id)}
              className={`px-2 py-1 text-xs rounded-full ${isFilterActive('assignee', user.id) ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
              aria-pressed={isFilterActive('assignee', user.id)}
            >
              {user.name}
            </button>
          ))}
        </div>
      )}
      
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">Tags:</div>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleFilter('tags', tag)}
              className={`px-2 py-1 text-xs rounded-full ${isFilterActive('tags', tag) ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
              aria-pressed={isFilterActive('tags', tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      
      {hasActiveFilters() && (
        <div className="flex justify-between items-center mt-2">
          <div>
            {lastSaved && (
              <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                Filters saved {formatLastSaved()}
              </span>
            )}
          </div>
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Clear all filters"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;