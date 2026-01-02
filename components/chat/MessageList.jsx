import React, { useRef, useEffect } from 'react';
import VoiceMessage from './VoiceMessage';

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
      {messages.map(message => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
        >
          {message.type === 'image' ? (
            <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md ${message.sender === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`grid ${message.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1`}>
                {message.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="Shared"
                    className="rounded-2xl max-h-48 sm:max-h-64 object-cover"
                  />
                ))}
              </div>
              {message.text && (
                <div className={`px-3 sm:px-4 py-2 rounded-3xl ${message.sender === 'me'
                  ? 'bg-[#2755ff] text-white'
                  : 'bg-gray-200 text-gray-900'
                  }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
              )}
              <p className="text-xs px-2 text-gray-500">
                {message.time}
              </p>
            </div>
          ) : message.type === 'voice' ? (
            <div className="flex flex-col gap-1">
              <VoiceMessage audioUrl={message.audioUrl} duration={message.duration} sender={message.sender} />
              <p className={`text-xs px-2 ${message.sender === 'me' ? 'text-gray-500 text-right' : 'text-gray-500'
                }`}>
                {message.time}
              </p>
            </div>
          ) : (
            <div
              className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-3xl ${message.sender === 'me'
                ? 'bg-[#2755ff] text-white'
                : 'bg-gray-200 text-gray-900'
                }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                {message.time}
              </p>
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;