import React, { useEffect } from 'react';
import { useVideoCall } from '../../hooks/useVideoCall';
import { Phone, Video, Mic, MicOff, VideoOff } from 'lucide-react';

const VideoCall = ({ roomName, userName, onEndCall }) => {
  const {
    room,
    isConnecting,
    localVideoRef,
    remoteVideoRef,
    connectToRoom,
    disconnectFromRoom,
    toggleAudio,
    toggleVideo,
  } = useVideoCall();

  useEffect(() => {
    if (roomName && userName) {
      connectToRoom(roomName, userName);
    }

    return () => {
      disconnectFromRoom();
    };
  }, [roomName, userName]);

  const handleEndCall = () => {
    disconnectFromRoom();
    onEndCall();
  };

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white text-xl">Connecting...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 relative">
      {/* Remote Video (Full Screen) */}
      <div className="flex-1 relative bg-black">
        <div ref={remoteVideoRef} className="w-full h-full flex items-center justify-center">
          {/* Remote video tracks will be attached here */}
        </div>
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute top-4 right-4 w-40 h-52 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        <div ref={localVideoRef} className="w-full h-full">
          {/* Local video tracks will be attached here */}
        </div>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-4 bg-black/50 backdrop-blur-sm p-4 rounded-full">
          <button
            onClick={toggleVideo}
            className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition"
          >
            <Video className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={toggleAudio}
            className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition"
          >
            <Mic className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={handleEndCall}
            className="p-5 bg-red-500 hover:bg-red-600 rounded-full transition"
          >
            <Phone className="w-7 h-7 text-white rotate-135" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;