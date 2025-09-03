import React from 'react';
import { useSelector } from 'react-redux';

const ConnectionStatus = () => {
  const { connected } = useSelector((state) => state.socket);

  return (
    <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
      <span className="status-indicator"></span>
      <span className="status-text">
        {connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
};

export default ConnectionStatus;