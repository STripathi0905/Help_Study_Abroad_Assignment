import React from 'react';
import { useSelector } from 'react-redux';

const ActiveUsers = () => {
  const activeUsers = useSelector((state) => state.ui.activeUsers);
  
  if (!activeUsers || activeUsers.length === 0) {
    return null;
  }

  // Only show up to 5 users
  const displayUsers = activeUsers.slice(0, 5);
  const remainingCount = Math.max(0, activeUsers.length - 5);

  return (
    <div className="fixed top-4 right-4 z-10">
      <div className="flex flex-col items-end">
        <div className="text-sm mb-1 text-gray-600">
          Active Users ({activeUsers.length})
        </div>
        <div className="flex -space-x-2 overflow-hidden">
          {displayUsers.map((user) => (
            <div key={user.id} title={user.name || 'Anonymous'} className="relative inline-block">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name || 'User'}
                  className="h-8 w-8 rounded-full ring-2 ring-white"
                />
              ) : (
                <div 
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium ring-2 ring-white`}
                  style={{ backgroundColor: user.color || '#3182CE' }} // Default to blue if no color
                >
                  {(user.name || 'User').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
          {remainingCount > 0 && (
            <div 
              className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-800 ring-2 ring-white"
              title={`${remainingCount} more user${remainingCount > 1 ? 's' : ''}`}
            >
              +{remainingCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveUsers;