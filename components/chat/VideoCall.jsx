import {
  AlertCircle,
  Mic,
  MicOff,
  Phone,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useVideoCall } from "../../hooks/useVideoCall";

const VideoCall = ({ roomName, userName, onEndCall }) => {
  const {
    room,
    participants,
    isConnecting,
    isAudioEnabled,
    isVideoEnabled,
    error,
    localVideoRef,
    remoteVideoRef,
    connectToRoom,
    disconnectFromRoom,
    toggleAudio,
    toggleVideo,
  } = useVideoCall();

  const [hasRemoteParticipant, setHasRemoteParticipant] = useState(false);

  useEffect(() => {
    if (roomName && userName) {
      console.log("Initializing video call:", { roomName, userName });
      connectToRoom(roomName, userName);
    }

    return () => {
      console.log("Component unmounting, disconnecting...");
      disconnectFromRoom();
    };
  }, [roomName, userName]);

  useEffect(() => {
    setHasRemoteParticipant(participants.length > 0);
  }, [participants]);

  const handleEndCall = () => {
    disconnectFromRoom();
    if (onEndCall) {
      onEndCall();
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">
            Connection Error
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleEndCall}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl font-medium">
            Connecting to call...
          </p>
          <p className="text-gray-400 text-sm mt-2">Room: {roomName}</p>
          <p className="text-gray-500 text-xs mt-1">As: {userName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 relative overflow-hidden">
      {/* Remote Video (Full Screen) */}
      <div className="flex-1 relative bg-black">
        <div ref={remoteVideoRef} className="w-full h-full">
          {/* Remote video will appear here */}
        </div>

        {/* Waiting message when no remote participant */}
        {!hasRemoteParticipant && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="text-center px-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Users className="w-16 h-16 text-white" />
              </div>
              <p className="text-white text-2xl font-bold mb-2">
                Waiting for others to join...
              </p>
              <p className="text-gray-400 text-sm mb-4">
                Share this room code with others
              </p>
              <div className="inline-block bg-gray-800 px-6 py-3 rounded-lg">
                <p className="text-blue-400 font-mono text-lg tracking-wider">
                  {roomName}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute top-4 right-4 w-40 h-48 sm:w-48 sm:h-60 bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 z-10">
        <div ref={localVideoRef} className="w-full h-full relative">
          {/* Local video will appear here */}
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center">
              <VideoOff className="w-12 h-12 text-white mb-2" />
              <span className="text-white text-xs">Camera Off</span>
            </div>
          )}
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
          You
        </div>
      </div>

      {/* Room Info Bar */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">
              {participants.length} participant
              {participants.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        {room && (
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full">
            <span className="text-white text-sm font-medium">
              Room: {roomName}
            </span>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex gap-3 sm:gap-4 bg-black/70 backdrop-blur-md p-4 rounded-full shadow-2xl">
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all transform hover:scale-110 active:scale-95 ${
              isVideoEnabled
                ? "bg-white/20 hover:bg-white/30"
                : "bg-red-500 hover:bg-red-600"
            }`}
            title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all transform hover:scale-110 active:scale-95 ${
              isAudioEnabled
                ? "bg-white/20 hover:bg-white/30"
                : "bg-red-500 hover:bg-red-600"
            }`}
            title={isAudioEnabled ? "Mute" : "Unmute"}
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={handleEndCall}
            className="p-5 bg-red-500 hover:bg-red-600 rounded-full transition-all transform hover:scale-110 active:scale-95 shadow-lg"
            title="End call"
          >
            <Phone className="w-7 h-7 text-white rotate-135" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
