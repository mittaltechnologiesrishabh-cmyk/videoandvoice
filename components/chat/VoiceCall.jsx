import { AlertCircle, Mic, MicOff, Phone, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useVoiceCall } from "../../hooks/useVoiceCall";

const VoiceCall = ({ roomName, userName, callTo, onEndCall }) => {
  const {
    room,
    participants,
    isConnecting,
    isAudioEnabled,
    error,
    connectToRoom,
    disconnectFromRoom,
    toggleAudio,
  } = useVoiceCall();

  const [callDuration, setCallDuration] = useState(0);
  const [hasRemoteParticipant, setHasRemoteParticipant] = useState(false);

  useEffect(() => {
    if (roomName && userName) {
      console.log("🎤 Starting voice call:", { roomName, userName });
      connectToRoom(roomName, userName);
    }

    return () => {
      console.log("🎤 Ending voice call");
      disconnectFromRoom();
    };
  }, [roomName, userName]);

  useEffect(() => {
    const hasParticipant = participants.length > 0;
    setHasRemoteParticipant(hasParticipant);
    console.log("👥 Audio participants:", participants.length);
  }, [participants]);

  useEffect(() => {
    let interval;
    if (room && hasRemoteParticipant) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [room, hasRemoteParticipant]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-white text-xl font-medium">Connecting call...</p>
          <p className="text-gray-400 text-sm mt-2">{callTo}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Avatar */}
        <div className="relative mb-8">
          <div
            className={`absolute inset-0 bg-gradient-to-br from-green-500 to-blue-500 rounded-full blur-xl opacity-50 ${
              hasRemoteParticipant ? "animate-pulse" : ""
            }`}
          ></div>
          <div
            className={`relative w-40 h-40 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center shadow-2xl ${
              !hasRemoteParticipant ? "animate-pulse" : ""
            }`}
          >
            {hasRemoteParticipant ? (
              <Phone className="w-20 h-20 text-white" />
            ) : (
              <Users className="w-20 h-20 text-white" />
            )}
          </div>
        </div>

        {/* Caller name */}
        <h2 className="text-3xl font-bold mb-2">{callTo || "Voice Call"}</h2>

        {/* Call status */}
        {hasRemoteParticipant ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-green-400 text-lg font-medium">Connected</p>
            </div>
            <p className="text-gray-400 text-3xl font-mono">
              {formatDuration(callDuration)}
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <p className="text-yellow-400 text-lg font-medium">Waiting...</p>
            </div>
            <p className="text-gray-400">Waiting for others to join</p>
          </>
        )}

        {/* Room code */}
        <div className="mt-6 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full">
          <p className="text-gray-400 text-xs">Room: {roomName}</p>
        </div>

        {/* Participant count */}
        {room && (
          <div className="mt-4 px-4 py-2 bg-black/20 backdrop-blur-sm rounded-full">
            <p className="text-gray-300 text-sm">
              {participants.length}{" "}
              {participants.length === 1 ? "participant" : "participants"}
            </p>
          </div>
        )}
      </div>

      {/* Call controls */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex gap-6 items-center">
          {/* Mute button */}
          <button
            onClick={toggleAudio}
            disabled={!room}
            className={`p-5 rounded-full transition-all transform hover:scale-110 active:scale-95 shadow-2xl ${
              isAudioEnabled
                ? "bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20"
                : "bg-red-500 hover:bg-red-600"
            } disabled:opacity-50`}
            title={isAudioEnabled ? "Mute" : "Unmute"}
          >
            {isAudioEnabled ? (
              <Mic className="w-7 h-7 text-white" />
            ) : (
              <MicOff className="w-7 h-7 text-white" />
            )}
          </button>

          {/* End call button */}
          <button
            onClick={handleEndCall}
            className="p-6 bg-red-500 hover:bg-red-600 rounded-full transition-all transform hover:scale-110 active:scale-95 shadow-2xl"
            title="End call"
          >
            <Phone className="w-8 h-8 text-white rotate-135" />
          </button>
        </div>
      </div>

      {/* Mute indicator */}
      {!isAudioEnabled && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-red-500/90 backdrop-blur-sm px-4 py-2 rounded-full z-20">
          <p className="text-white text-sm font-medium">🔇 Muted</p>
        </div>
      )}
    </div>
  );
};

export default VoiceCall;
