import React, { useState } from 'react';
import ChatList from './chat/ChatList';
import ChatHeader from './chat/ChatHeader';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';
import ImagePreview from './chat/ImagePreview';
import RecordingIndicator from './chat/RecordingIndicator';
import { useChat } from '../hooks/useChat';
import { useVoiceRecording } from '../hooks/useVoiceRecording';

import VideoCall from './chat/VideoCall';
import VoiceCall from './chat/VoiceCall';

const InstagramChat = () => {
    const { chats, selectedChat, setSelectedChat, isMobileView, addMessage } = useChat();
    const [messageInput, setMessageInput] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);

    // ---- CALL STATE ----
    const [activeCall, setActiveCall] = useState(null);
    const currentUser = "user123";

    const handleVideoCall = () => {
        setActiveCall({
            type: 'video',
            roomName: `room-${Date.now()}`,
            userName: currentUser
        });
    };

    const handleVoiceCall = () => {
        if (!selectedChat) return;
        setActiveCall({
            type: 'voice',
            userName: currentUser,
            callTo: selectedChat.id
        });
    };

    const handleEndCall = () => {
        setActiveCall(null);
    };


    const handleRecordingComplete = (audioUrl, duration) => {
        const voiceMessage = {
            id: Date.now(),
            audioUrl: audioUrl,
            duration: duration,
            sender: 'me',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            type: 'voice'
        };
        addMessage(voiceMessage);
    };

    const { isRecording, recordingTime, startRecording, stopRecording } = useVoiceRecording(handleRecordingComplete);

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setSelectedImages(prev => [...prev, ...imageUrls]);
    };

    const removeImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendMessage = () => {
        if (!selectedChat) return;

        const hasContent = messageInput.trim() || selectedImages.length > 0;
        if (!hasContent) return;

        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        if (selectedImages.length > 0) {
            const imageMessage = {
                id: Date.now(),
                images: selectedImages,
                text: messageInput.trim(),
                sender: 'me',
                time: time,
                type: 'image'
            };
            addMessage(imageMessage);
            setSelectedImages([]);
        } else if (messageInput.trim()) {
            const textMessage = {
                id: Date.now(),
                text: messageInput,
                sender: 'me',
                time: time,
                type: 'text'
            };
            addMessage(textMessage);
        }

        setMessageInput('');
    };

    const handleBackToChats = () => {
        setSelectedChat(null);
    };

      if (activeCall) {
    return activeCall.type === 'video' ? (
      <VideoCall
        roomName={activeCall.roomName}
        userName={activeCall.userName}
        onEndCall={handleEndCall}
      />
    ) : (
      <VoiceCall
        userName={activeCall.userName}
        callTo={activeCall.callTo}
        onEndCall={handleEndCall}
      />
    );
  }

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            <ChatList
                chats={chats}
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
                isMobileView={isMobileView}
            />

            {selectedChat ? (
                <div className={`${isMobileView ? 'w-full' : 'flex-1'} flex flex-col`}>
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
                        <RecordingIndicator recordingTime={recordingTime} onStop={stopRecording} />
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
                <div className={`${isMobileView ? 'hidden' : 'flex-1 flex'} items-center justify-center bg-gray-50`}>
                    <div className="text-center">
                        <div className="text-6xl mb-4">💬</div>
                        <h3 className="text-2xl font-semibold mb-2">Your Messages</h3>
                        <p className="text-gray-500">Select a chat to start messaging</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstagramChat;