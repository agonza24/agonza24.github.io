
import React from 'react';
import { TranslationLog } from '../types.ts';
import { DownloadIcon } from './icons.tsx';

interface LogDisplayProps {
  log: TranslationLog[];
}

const LogEntry: React.FC<{ entry: TranslationLog }> = ({ entry }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 animate-fade-in">
        <p className="text-sm text-gray-400 mb-2">
            <span className="font-semibold text-cyan-400">Spanish:</span>
        </p>
        <p className="text-gray-100 pl-2 border-l-2 border-cyan-400">{entry.spanish}</p>
        <hr className="border-gray-700 my-3" />
        <p className="text-sm text-gray-400 mb-2">
            <span className="font-semibold text-teal-400">German:</span>
        </p>
        <p className="text-gray-100 pl-2 border-l-2 border-teal-400">{entry.german}</p>
    </div>
);


export const LogDisplay: React.FC<LogDisplayProps> = ({ log }) => {
  const handleDownload = () => {
    const fileContent = log
      .slice()
      .reverse()
      .map(entry => `Timestamp: ${entry.timestamp}\nSpanish: ${entry.spanish}\nGerman: ${entry.german}\n\n---\n`)
      .join('');
    
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `translation_log_${new Date().toISOString()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-300">Translation Log</h2>
        {log.length > 0 && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <DownloadIcon />
            <span>Download Log</span>
          </button>
        )}
      </div>
      
      <div className="h-96 max-h-[50vh] bg-gray-900/70 rounded-lg p-4 overflow-y-auto space-y-4 border border-gray-700">
        {log.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Your translations will appear here...</p>
          </div>
        ) : (
          log.map((entry) => <LogEntry key={entry.timestamp} entry={entry} />)
        )}
      </div>
    </div>
  );
};