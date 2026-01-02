import React, { useRef, useState, useEffect } from 'react';
import { Send, Mic, Image, Smile } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

const MessageInput = ({
  messageInput,
  setMessageInput,
  onSendMessage,
  onImageSelect,
  onStartRecording,
  isRecording,
  hasImages
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="p-3 sm:p-4 border-t border-gray-200 bg-white relative safe-area-bottom">
      {showEmojiPicker && (
        <EmojiPicker onEmojiSelect={handleEmojiSelect} emojiPickerRef={emojiPickerRef} />
      )}

      <div className="flex items-center gap-1 sm:gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={onImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <Image className="w-5 h-5 sm:w-6 sm:h-6 text-[#2755ff]" />
        </button>
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <Smile className="w-5 h-5 sm:w-6 sm:h-6 text-[#2755ff]" />
        </button>

        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Message..."
          className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:border-[#2755ff]"
        />

        {messageInput.trim() || hasImages ? (
          <button
            onClick={onSendMessage}
            className="p-2 hover:bg-[#2755ff]/10 rounded-full transition"
          >
            <Send className="w-5 h-5 sm:w-6 sm:h-6 text-[#2755ff] fill-[#2755ff]" />
          </button>
        ) : (
          <button
            onClick={onStartRecording}
            disabled={isRecording}
            className={`p-2 rounded-full transition ${isRecording ? 'bg-red-500 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
          >
            <Mic className={`w-5 h-5 sm:w-6 sm:h-6 ${isRecording ? 'text-white' : 'text-[#2755ff]'}`} />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;