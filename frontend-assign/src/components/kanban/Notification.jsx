'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { removeNotification } from '../../redux/slices/uiSlice';

const Notification = ({ notification }) => {
  const dispatch = useDispatch();
  
  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeNotification(notification.id));
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [dispatch, notification.id]);
  
  // Get notification styles based on type
  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-500 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-500 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-500 text-blue-800';
    }
  };
  
  const notificationStyles = getNotificationStyles(notification.type);
  
  return (
    <div 
      className={`notification p-4 rounded border-l-4 ${notificationStyles} mb-2`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex justify-between items-center">
        <p>{notification.message}</p>
        <button 
          onClick={() => dispatch(removeNotification(notification.id))}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Dismiss notification"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

const NotificationContainer = ({ notifications }) => {
  if (!notifications || notifications.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      {notifications.map(notification => (
        <Notification key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

export default NotificationContainer;