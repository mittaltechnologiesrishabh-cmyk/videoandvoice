import { ArrowLeft, Info, Phone, Video } from "lucide-react";

const ChatHeader = ({
  chat,
  onBack,
  isMobileView,
  onVoiceCall,
  onVideoCall,
}) => {
  return (
    <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between bg-white">
      <div className="flex items-center gap-2 sm:gap-3">
        {isMobileView && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}
        <div className="relative">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#2755ff] to-[#4a73ff] flex items-center justify-center">
            <img
              src={chat.avatarUrl}
              alt={chat.user}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          {chat.online && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-sm sm:text-base">{chat.user}</h3>
          <p className="text-xs text-gray-500">
            {chat.online ? "Active now" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex gap-2 sm:gap-4">
        <button
          onClick={onVoiceCall}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#2755ff]" />
        </button>
        <button
          onClick={onVideoCall}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#2755ff]" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full transition">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#2755ff]" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
