import React from 'react';

const StatusLabel = ({ status = 'idle' }) => {
  const statusConfig = {
    connecting: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20',
      dotColor: 'bg-blue-400'
    },
    connected: {
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400/20',
      dotColor: 'bg-green-400'
    },
    disconnecting: {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/20',
      dotColor: 'bg-yellow-400'
    },
    disconnected: {
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400/20',
      dotColor: 'bg-red-400'
    },
    reconnecting: {
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      borderColor: 'border-purple-400/20',
      dotColor: 'bg-purple-400'
    },
    idle: {
        color: 'text-cyan-300',
        bgColor: 'bg-cyan-400/5',
        borderColor: 'border-cyan-400/20',
        dotColor: 'bg-cyan-300'
      }
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.idle;

  return (
    <div 
      className={`inline-flex items-center px-2 py-1 rounded-full border ${config.borderColor} ${config.bgColor}`}
    >
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${
          status === 'connecting' || status === 'reconnecting' 
            ? 'animate-pulse' 
            : ''
        }`} />
        <span className={`text-xs font-medium ${config.color} capitalize`}>
          {status.toLowerCase()}
        </span>
      </div>
    </div>
  );
};



export default StatusLabel;