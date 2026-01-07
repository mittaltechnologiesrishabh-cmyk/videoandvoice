import { Phone, PhoneOff, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const IncomingCallModal = ({
  isOpen,
  callerName,
  callType,
  onAccept,
  onReject,
}) => {
  const [countdown, setCountdown] = useState(30);
  const audioRef = useRef(null);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Try to play ringtone with better error handling
      if (audioRef.current) {
        // Reset audio
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 1.0;

        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("✅ Ringtone playing");
              setAudioError(false);
            })
            .catch((err) => {
              console.error("❌ Audio play failed:", err);
              setAudioError(true);

              // Try to play on user interaction
              const playOnClick = () => {
                if (audioRef.current) {
                  audioRef.current.play().catch((e) => console.error(e));
                }
                document.removeEventListener("click", playOnClick);
              };
              document.addEventListener("click", playOnClick);
            });
        }
      }

      // Countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            onReject();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setCountdown(30);
        setAudioError(false);
      };
    }
  }, [isOpen, onReject]);

  const handleAccept = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onAccept();
  };

  const handleReject = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onReject();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Ringtone Audio - using a different source */}
      <audio ref={audioRef} loop preload="auto">
        <source
          src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
          type="audio/mpeg"
        />
        {/* Fallback ringtone */}
        <source
          src="https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3"
          type="audio/mpeg"
        />
      </audio>

      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-scaleIn">
          {/* Audio Error Warning */}
          {audioError && (
            <div className="mb-4 text-center text-yellow-400 text-xs">
              🔇 Click anywhere to enable sound
            </div>
          )}

          {/* Caller Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                {callType === "video" ? (
                  <Video className="w-12 h-12 text-white" />
                ) : (
                  <Phone className="w-12 h-12 text-white" />
                )}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{callerName}</h3>
            <p className="text-gray-400 text-lg">Incoming {callType} call...</p>
          </div>

          {/* Countdown */}
          <div className="flex justify-center mb-4">
            <div className="text-gray-500 text-sm">
              Auto-reject in {countdown}s
            </div>
          </div>

          {/* Ringing animation */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 justify-center">
            {/* Reject button */}
            <button
              onClick={handleReject}
              className="p-6 bg-red-500 hover:bg-red-600 rounded-full transition-all transform hover:scale-110 active:scale-95 shadow-xl"
              title="Reject"
            >
              <PhoneOff className="w-8 h-8 text-white" />
            </button>

            {/* Accept button */}
            <button
              onClick={handleAccept}
              className="p-6 bg-green-500 hover:bg-green-600 rounded-full transition-all transform hover:scale-110 active:scale-95 shadow-xl animate-pulse"
              title="Accept"
            >
              <Phone className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default IncomingCallModal;
