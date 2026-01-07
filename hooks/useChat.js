import { useEffect, useState } from "react";
import chatsData from "../data/chats";

export const useChat = () => {
  const [chats, setChats] = useState(chatsData);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);

    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  const addMessage = (message) => {
    if (!selectedChat) return;

    setChats(
      chats.map((chat) =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              messages: [...chat.messages, message],
              lastMessage:
                message.text || message.type === "image"
                  ? "📷 Photo"
                  : "🎤 Voice message",
              time: "now",
            }
          : chat
      )
    );

    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, message],
    });
  };

  return {
    chats,
    selectedChat,
    setSelectedChat,
    isMobileView,
    addMessage,
  };
};
