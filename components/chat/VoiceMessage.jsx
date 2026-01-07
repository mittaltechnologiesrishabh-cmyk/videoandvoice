import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const VoiceMessage = ({ audioUrl, duration, sender }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);

      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current.currentTime);
      });

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-3xl min-w-[180px] ${
        sender === "me" ? "bg-[#2755ff]" : "bg-gray-200"
      }`}
    >
      <button
        onClick={togglePlayPause}
        className={`p-1 rounded-full flex-shrink-0 ${
          sender === "me" ? "bg-white/20" : "bg-gray-300"
        }`}
      >
        {isPlaying ? (
          <Pause
            className={`w-4 h-4 ${
              sender === "me" ? "text-white" : "text-gray-700"
            }`}
          />
        ) : (
          <Play
            className={`w-4 h-4 ${
              sender === "me" ? "text-white" : "text-gray-700"
            }`}
          />
        )}
      </button>

      <div className="flex-1 h-8 flex items-center">
        <div
          className={`flex-1 h-1 rounded-full ${
            sender === "me" ? "bg-white/30" : "bg-gray-300"
          }`}
        >
          <div
            className={`h-full rounded-full transition-all ${
              sender === "me" ? "bg-white" : "bg-[#2755ff]"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <span
        className={`text-xs flex-shrink-0 ${
          sender === "me" ? "text-white" : "text-gray-600"
        }`}
      >
        {formatTime(isPlaying ? Math.floor(currentTime) : duration)}
      </span>
    </div>
  );
};

export default VoiceMessage;
