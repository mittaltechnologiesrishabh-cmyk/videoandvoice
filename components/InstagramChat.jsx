// import React, { useState } from 'react';
// import ChatList from './chat/ChatList';
// import ChatHeader from './chat/ChatHeader';
// import MessageList from './chat/MessageList';
// import MessageInput from './chat/MessageInput';
// import ImagePreview from './chat/ImagePreview';
// import RecordingIndicator from './chat/RecordingIndicator';
// import { useChat } from '../hooks/useChat';
// import { useVoiceRecording } from '../hooks/useVoiceRecording';

// import VideoCall from './chat/VideoCall';
// import VoiceCall from './chat/VoiceCall';

// const InstagramChat = () => {
//     const { chats, selectedChat, setSelectedChat, isMobileView, addMessage } = useChat();
//     const [messageInput, setMessageInput] = useState('');
//     const [selectedImages, setSelectedImages] = useState([]);

//     // ---- CALL STATE ----
//     const [activeCall, setActiveCall] = useState(null);
//     const currentUser = "user123";

//     const handleVideoCall = () => {
//         setActiveCall({
//             type: 'video',
//             roomName: `room-${Date.now()}`,
//             userName: currentUser
//         });
//     };

//     const handleVoiceCall = () => {
//         if (!selectedChat) return;
//         setActiveCall({
//             type: 'voice',
//             userName: currentUser,
//             callTo: selectedChat.id
//         });
//     };

//     const handleEndCall = () => {
//         setActiveCall(null);
//     };

//     const handleRecordingComplete = (audioUrl, duration) => {
//         const voiceMessage = {
//             id: Date.now(),
//             audioUrl: audioUrl,
//             duration: duration,
//             sender: 'me',
//             time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
//             type: 'voice'
//         };
//         addMessage(voiceMessage);
//     };

//     const { isRecording, recordingTime, startRecording, stopRecording } = useVoiceRecording(handleRecordingComplete);

//     const handleImageSelect = (e) => {
//         const files = Array.from(e.target.files);
//         const imageUrls = files.map(file => URL.createObjectURL(file));
//         setSelectedImages(prev => [...prev, ...imageUrls]);
//     };

//     const removeImage = (index) => {
//         setSelectedImages(prev => prev.filter((_, i) => i !== index));
//     };

//     const handleSendMessage = () => {
//         if (!selectedChat) return;

//         const hasContent = messageInput.trim() || selectedImages.length > 0;
//         if (!hasContent) return;

//         const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

//         if (selectedImages.length > 0) {
//             const imageMessage = {
//                 id: Date.now(),
//                 images: selectedImages,
//                 text: messageInput.trim(),
//                 sender: 'me',
//                 time: time,
//                 type: 'image'
//             };
//             addMessage(imageMessage);
//             setSelectedImages([]);
//         } else if (messageInput.trim()) {
//             const textMessage = {
//                 id: Date.now(),
//                 text: messageInput,
//                 sender: 'me',
//                 time: time,
//                 type: 'text'
//             };
//             addMessage(textMessage);
//         }

//         setMessageInput('');
//     };

//     const handleBackToChats = () => {
//         setSelectedChat(null);
//     };

//     if (activeCall) {
//         return activeCall.type === 'video' ? (
//             <VideoCall
//                 roomName={activeCall.roomName}
//                 userName={activeCall.userName}
//                 onEndCall={handleEndCall}
//             />
//         ) : (
//             <VoiceCall
//                 userName={activeCall.userName}
//                 callTo={activeCall.callTo}
//                 onEndCall={handleEndCall}
//             />
//         );
//     }

//     return (
//         <div className="flex h-screen bg-white overflow-hidden">
//             <ChatList
//                 chats={chats}
//                 selectedChat={selectedChat}
//                 onSelectChat={setSelectedChat}
//                 isMobileView={isMobileView}
//             />

//             {selectedChat ? (
//                 <div className={`${isMobileView ? 'w-full' : 'flex-1'} flex flex-col`}>
//                     <ChatHeader
//                         chat={selectedChat}
//                         onBack={handleBackToChats}
//                         isMobileView={isMobileView}
//                         onVoiceCall={handleVoiceCall}
//                         onVideoCall={handleVideoCall}
//                     />

//                     <MessageList messages={selectedChat.messages} />

//                     <ImagePreview images={selectedImages} onRemove={removeImage} />

//                     {isRecording && (
//                         <RecordingIndicator recordingTime={recordingTime} onStop={stopRecording} />
//                     )}

//                     <MessageInput
//                         messageInput={messageInput}
//                         setMessageInput={setMessageInput}
//                         onSendMessage={handleSendMessage}
//                         onImageSelect={handleImageSelect}

//                         hasImages={selectedImages}

//                         isRecording={isRecording}
//                         onStartRecording={startRecording}

//                         stopRecording={stopRecording}
//                     />
//                 </div>
//             ) : (
//                 <div className={`${isMobileView ? 'hidden' : 'flex-1 flex'} items-center justify-center bg-gray-50`}>
//                     <div className="text-center">
//                         <div className="text-6xl mb-4">💬</div>
//                         <h3 className="text-2xl font-semibold mb-2">Your Messages</h3>
//                         <p className="text-gray-500">Select a chat to start messaging</p>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default InstagramChat;

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCallNotification } from "../hooks/useCallNotification";
import { useChat } from "../hooks/useChat";
import { useVoiceRecording } from "../hooks/useVoiceRecording";
import ChatHeader from "./chat/ChatHeader";
import ChatList from "./chat/ChatList";
import ImagePreview from "./chat/ImagePreview";
import IncomingCallModal from "./chat/IncomingCallModal";
import MessageInput from "./chat/MessageInput";
import MessageList from "./chat/MessageList";
import RecordingIndicator from "./chat/RecordingIndicator";
import VideoCall from "./chat/VideoCall";
import VoiceCall from "./chat/VoiceCall";

const InstagramChat = () => {
  const router = useRouter();
  const { chats, selectedChat, setSelectedChat, isMobileView, addMessage } =
    useChat();
  const [messageInput, setMessageInput] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);

  // Call notification hook
  const { requestNotificationPermission, showCallNotification } =
    useCallNotification();

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Generate unique user ID
  const generateUserId = () => {
    return `user_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  };

  // Get user from URL parameter or generate new one
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get("user");

    if (userParam) {
      setCurrentUser(userParam);
    } else {
      const newUserId = generateUserId();
      setCurrentUser(newUserId);
      console.log("🆔 Generated user ID:", newUserId);
    }
  }, []);

  // ---- CALL STATE ----
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCallData, setIncomingCallData] = useState(null);

  // Listen for shared room from URL (incoming call)
  useEffect(() => {
    if (!currentUser) return;

    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get("room");
    const typeParam = urlParams.get("type");
    const callerParam = urlParams.get("caller");

    if (roomParam && typeParam && callerParam) {
      console.log("📞 Incoming call detected from URL");

      // Show incoming call modal
      setIncomingCallData({
        roomName: roomParam,
        callType: typeParam,
        callerName: callerParam,
      });

      // Show browser notification
      showCallNotification(
        callerParam,
        typeParam,
        () => {
          // Accept call
          handleAcceptCallFromURL(roomParam, typeParam, callerParam);
        },
        () => {
          // Reject call
          handleRejectCall();
        }
      );
    }
  }, [currentUser]);

  const handleAcceptCallFromURL = (roomName, callType, callerName) => {
    let joiningUser = generateUserId();

    setActiveCall({
      type: callType,
      roomName: roomName,
      userName: joiningUser,
      callTo: callerName,
    });

    setIncomingCallData(null);
  };

  const handleRejectCall = () => {
    setIncomingCallData(null);
    // Clear URL parameters
    window.history.pushState({}, "", window.location.pathname);
    alert("Call rejected");
  };

  const handleVideoCall = () => {
    if (!selectedChat) return;

    const roomName = `room-${Date.now()}`;
    const hostUser = `host_${Date.now()}`;

    setActiveCall({
      type: "video",
      roomName: roomName,
      userName: hostUser,
    });

    // Generate shareable link with caller name
    const shareLink = `${window.location.origin}?room=${roomName}&type=video&caller=${currentUser}`;

    console.log("📋 Share this link for others to join:");
    console.log(shareLink);

    // Copy to clipboard
    navigator.clipboard.writeText(shareLink).then(() => {
      console.log("✅ Link copied to clipboard!");
      alert(
        "Video call link copied! Share it with the person you want to call."
      );
    });
  };

  const handleVoiceCall = () => {
    if (!selectedChat) return;

    const roomName = `voice-room-${Date.now()}`;
    const hostUser = `host_${Date.now()}`;

    setActiveCall({
      type: "voice",
      userName: hostUser,
      callTo: selectedChat.user,
      roomName: roomName,
    });

    // Generate shareable link with caller name
    const shareLink = `${window.location.origin}?room=${roomName}&type=voice&caller=${selectedChat.user}`;

    console.log("📋 Share this link for others to join:");
    console.log(shareLink);

    // Copy to clipboard
    navigator.clipboard.writeText(shareLink).then(() => {
      console.log("✅ Link copied to clipboard!");
      alert(
        "Voice call link copied! Share it with the person you want to call."
      );
    });
  };

  const handleAcceptCall = () => {
    if (!incomingCallData) return;
    handleAcceptCallFromURL(
      incomingCallData.roomName,
      incomingCallData.callType,
      incomingCallData.callerName
    );
  };

  const handleEndCall = () => {
    setActiveCall(null);
    window.history.pushState({}, "", window.location.pathname);
  };

  const handleRecordingComplete = (audioUrl, duration) => {
    const voiceMessage = {
      id: Date.now(),
      audioUrl: audioUrl,
      duration: duration,
      sender: "me",
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "voice",
    };
    addMessage(voiceMessage);
  };

  const { isRecording, recordingTime, startRecording, stopRecording } =
    useVoiceRecording(handleRecordingComplete);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setSelectedImages((prev) => [...prev, ...imageUrls]);
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = () => {
    if (!selectedChat) return;

    const hasContent = messageInput.trim() || selectedImages.length > 0;
    if (!hasContent) return;

    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (selectedImages.length > 0) {
      const imageMessage = {
        id: Date.now(),
        images: selectedImages,
        text: messageInput.trim(),
        sender: "me",
        time: time,
        type: "image",
      };
      addMessage(imageMessage);
      setSelectedImages([]);
    } else if (messageInput.trim()) {
      const textMessage = {
        id: Date.now(),
        text: messageInput,
        sender: "me",
        time: time,
        type: "text",
      };
      addMessage(textMessage);
    }

    setMessageInput("");
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
  };

  if (activeCall) {
    return (
      <>
        {activeCall.type === "video" ? (
          <VideoCall
            roomName={activeCall.roomName}
            userName={activeCall.userName}
            onEndCall={handleEndCall}
          />
        ) : (
          <VoiceCall
            roomName={activeCall.roomName}
            userName={activeCall.userName}
            callTo={activeCall.callTo}
            onEndCall={handleEndCall}
          />
        )}
      </>
    );
  }

  return (
    <>
      {/* Incoming Call Modal */}
      <IncomingCallModal
        isOpen={!!incomingCallData}
        callerName={incomingCallData?.callerName || "Unknown"}
        callType={incomingCallData?.callType || "voice"}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />

      <div className="flex h-screen bg-white overflow-hidden">
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          isMobileView={isMobileView}
        />

        {selectedChat ? (
          <div
            className={`${isMobileView ? "w-full" : "flex-1"} flex flex-col`}
          >
            <ChatHeader
              chat={selectedChat}
              onBack={handleBackToChats}
              isMobileView={isMobileView}
              onVoiceCall={handleVoiceCall}
              onVideoCall={handleVideoCall}
            />

            <MessageList messages={selectedChat.messages} />

            <ImagePreview images={selectedImages} onRemove={removeImage} />

            {isRecording && (
              <RecordingIndicator
                recordingTime={recordingTime}
                onStop={stopRecording}
              />
            )}

            <MessageInput
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              onSendMessage={handleSendMessage}
              onImageSelect={handleImageSelect}
              hasImages={selectedImages}
              isRecording={isRecording}
              onStartRecording={startRecording}
              stopRecording={stopRecording}
            />
          </div>
        ) : (
          <div
            className={`${
              isMobileView ? "hidden" : "flex-1 flex"
            } items-center justify-center bg-gray-50`}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-2xl font-semibold mb-2">Your Messages</h3>
              <p className="text-gray-500">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default InstagramChat;
