import React from 'react';

const RecordingIndicator = ({ recordingTime, onStop }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-3 sm:p-4 bg-red-50 border-t border-red-200">
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-red-600 font-medium text-sm sm:text-base">
          Recording... {formatTime(recordingTime)}
        </span>
        <button
          onClick={onStop}
          className="ml-2 sm:ml-4 px-3 sm:px-4 py-1 bg-red-500 text-white rounded-full text-xs sm:text-sm hover:bg-red-600"
        >
          Stop & Send
        </button>
      </div>
    </div>
  );
};

export default RecordingIndicator;