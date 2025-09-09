
import React from 'react';
import { AppStatus } from '../types.ts';

interface StatusIndicatorProps {
  status: AppStatus;
}

const getStatusColor = (status: AppStatus): string => {
  switch (status) {
    case AppStatus.LISTENING:
      return 'bg-green-500';
    case AppStatus.PROCESSING:
      return 'bg-yellow-500 animate-pulse';
    case AppStatus.SPEAKING:
      return 'bg-cyan-500 animate-pulse';
    case AppStatus.IDLE:
    default:
      return 'bg-gray-500';
  }
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  return (
    <div className="flex items-center gap-3 bg-gray-700/50 px-4 py-2 rounded-full">
      <div className={`w-3 h-3 rounded-full transition-colors ${getStatusColor(status)}`}></div>
      <span className="font-medium text-gray-300">{status}</span>
    </div>
  );
};