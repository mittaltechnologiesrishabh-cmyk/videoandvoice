import React from 'react';

const ChatList = ({ chats, selectedChat, onSelectChat, isMobileView }) => {
  return (
    <div className={`${isMobileView && selectedChat ? 'hidden' : 'flex'} ${isMobileView ? 'w-full' : 'w-96'} border-r border-gray-200 flex-col`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.map(chat => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition active:bg-gray-100 ${selectedChat?.id === chat.id ? 'bg-gray-100' : ''
              }`}
          >
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#2755ff] to-[#4a73ff] flex items-center justify-center">
                <img
                  src={chat.avatarUrl}
                  alt={chat.user}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              {chat.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>

            <div className="ml-3 sm:ml-4 flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-sm truncate">{chat.user}</h3>
                <span className="text-xs text-gray-500 ml-2">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <span className="ml-2 bg-[#2755ff] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;