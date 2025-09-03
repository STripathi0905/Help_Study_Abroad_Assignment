import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const TypingIndicator = () => {
  const [typingUsers, setTypingUsers] = useState([]);
  const [visible, setVisible] = useState(false);
  
  // In a real implementation, this would be populated from Redux state
  // For now, we'll just create a placeholder component
  
  useEffect(() => {
    // This would be updated via socket events in a real implementation
    const timeout = setTimeout(() => {
      setVisible(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [typingUsers]);

  if (!visible || typingUsers.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white shadow-md rounded-lg p-2 text-sm text-gray-600 animate-pulse">
      {typingUsers.length === 1 ? (
        <span>{typingUsers[0].name} is typing...</span>
      ) : (
        <span>Multiple users are typing...</span>
      )}
    </div>
  );
};

export default TypingIndicator;