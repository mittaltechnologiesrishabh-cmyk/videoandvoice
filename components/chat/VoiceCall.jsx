import React, { useEffect } from 'react';
import { useVoiceCall } from '../../hooks/useVoiceCall';
import { Phone, Mic, MicOff } from 'lucide-react';

const VoiceCall = ({ userName, callTo, onEndCall }) => {
  const {
    call,
    isMuted,
    callStatus,
    initializeDevice,
    makeCall,
    endCall,
    toggleMute,
  } = useVoiceCall();

  useEffect(() => {
    if (userName) {
      initializeDevice(userName);
    }
  }, [userName]);

  useEffect(() => {
    if (callTo) {
      makeCall(callTo);
    }
  }, [callTo]);

  const handleEndCall = () => {
    endCall();
    onEndCall();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white items-center justify-center">
      <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-6xl mb-8">
        👤
      </div>

      <h2 className="text-3xl font-semibold mb-2">{callTo || 'Unknown'}</h2>
      <p className="text-gray-400 text-lg mb-8">{callStatus}</p>

      <div className="flex gap-6">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition ${
            isMuted ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={handleEndCall}
          className="p-5 bg-red-500 hover:bg-red-600 rounded-full transition"
        >
          <Phone className="w-7 h-7 rotate-135" />
        </button>
      </div>
    </div>
  );
};

export default VoiceCall;