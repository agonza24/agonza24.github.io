
import React from 'react';
import { MicrophoneIcon, StopIcon } from './icons.tsx';

interface ControlButtonsProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({ isListening, onStart, onStop }) => {
  return (
    <div className="flex items-center gap-4">
      {!isListening ? (
        <button
          onClick={onStart}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
        >
          <MicrophoneIcon />
          <span>Start Listening</span>
        </button>
      ) : (
        <button
          onClick={onStop}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
        >
          <StopIcon />
          <span>Stop Listening</span>
        </button>
      )}
    </div>
  );
};