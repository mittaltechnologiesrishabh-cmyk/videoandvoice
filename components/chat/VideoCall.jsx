// import React, { useEffect } from 'react';
// import { useVideoCall } from '../../hooks/useVideoCall';
// import { Phone, Video, Mic, MicOff, VideoOff } from 'lucide-react';

// const VideoCall = ({ roomName, userName, onEndCall }) => {
//   const {
//     room,
//     isConnecting,
//     isAudioEnabled,
//     isVideoEnabled,
//     localVideoRef,
//     remoteVideoRef,
//     connectToRoom,
//     disconnectFromRoom,
//     toggleAudio,
//     toggleVideo,
//   } = useVideoCall();

//   useEffect(() => {
//     if (roomName && userName) {
//       connectToRoom(roomName, userName);
//     }

//     return () => {
//       disconnectFromRoom();
//     };
//   }, [roomName, userName]);

//   const handleEndCall = () => {
//     disconnectFromRoom();
//     onEndCall();
//   };

//   if (isConnecting) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-900">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
//           <p className="text-white text-xl">Connecting...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-screen bg-gray-900 relative">
//       {/* Remote Video (Full Screen) */}
//       <div className="flex-1 relative bg-black">
//         <div 
//           ref={remoteVideoRef} 
//           className="w-full h-full flex items-center justify-center"
//         >
//           {/* Remote video will be attached here */}
//           {!room?.participants.size && (
//             <div className="text-center">
//               <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-6xl mx-auto mb-4">
//                 👤
//               </div>
//               <p className="text-white text-lg">Waiting for others to join...</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Local Video (Picture-in-Picture) */}
//       <div className="absolute top-4 right-4 w-32 h-40 sm:w-40 sm:h-52 bg-gray-800 rounded-lg overflow-hidden shadow-lg border-2 border-white/20">
//         <div 
//           ref={localVideoRef} 
//           className="w-full h-full"
//         >
//           {/* Local video will be attached here */}
//         </div>
//         {!isVideoEnabled && (
//           <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
//             <VideoOff className="w-8 h-8 text-white" />
//           </div>
//         )}
//       </div>

//       {/* Room Info */}
//       <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
//         <div className="flex items-center gap-2">
//           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//           <span className="text-white text-sm font-medium">
//             {room?.participants.size || 0} participant(s)
//           </span>
//         </div>
//       </div>

//       {/* Call Controls */}
//       <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
//         <div className="flex gap-3 sm:gap-4 bg-black/50 backdrop-blur-sm p-3 sm:p-4 rounded-full">
//           <button
//             onClick={toggleVideo}
//             className={`p-3 sm:p-4 rounded-full transition ${
//               isVideoEnabled 
//                 ? 'bg-white/20 hover:bg-white/30' 
//                 : 'bg-red-500 hover:bg-red-600'
//             }`}
//           >
//             {isVideoEnabled ? (
//               <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//             ) : (
//               <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//             )}
//           </button>

//           <button
//             onClick={toggleAudio}
//             className={`p-3 sm:p-4 rounded-full transition ${
//               isAudioEnabled 
//                 ? 'bg-white/20 hover:bg-white/30' 
//                 : 'bg-red-500 hover:bg-red-600'
//             }`}
//           >
//             {isAudioEnabled ? (
//               <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//             ) : (
//               <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
//             )}
//           </button>

//           <button
//             onClick={handleEndCall}
//             className="p-4 sm:p-5 bg-red-500 hover:bg-red-600 rounded-full transition"
//           >
//             <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-white rotate-135" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VideoCall;

import React, { useEffect, useState } from 'react';
import { useVideoCall } from '../../hooks/useVideoCall';
import { Phone, Video, Mic, MicOff, VideoOff, Users } from 'lucide-react';

const VideoCall = ({ roomName, userName, onEndCall }) => {
  const {
    room,
    participants,
    isConnecting,
    isAudioEnabled,
    isVideoEnabled,
    localVideoRef,
    remoteVideoRef,
    connectToRoom,
    disconnectFromRoom,
    toggleAudio,
    toggleVideo,
  } = useVideoCall();

  const [hasRemoteParticipant, setHasRemoteParticipant] = useState(false);

  useEffect(() => {
    if (roomName && userName) {
      console.log('Connecting to room:', roomName, 'as', userName);
      connectToRoom(roomName, userName);
    }

    return () => {
      disconnectFromRoom();
    };
  }, [roomName, userName]);

  useEffect(() => {
    setHasRemoteParticipant(participants.length > 0);
  }, [participants]);

  const handleEndCall = () => {
    disconnectFromRoom();
    onEndCall();
  };

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Connecting to call...</p>
          <p className="text-gray-400 text-sm mt-2">Room: {roomName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 relative overflow-hidden">
      {/* Remote Video (Full Screen) */}
      <div className="flex-1 relative bg-black">
        <div 
          ref={remoteVideoRef} 
          className="w-full h-full"
        >
          {/* Remote video will appear here */}
        </div>
        
        {/* Waiting message when no remote participant */}
        {!hasRemoteParticipant && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-6xl mx-auto mb-4 animate-pulse">
                <Users className="w-16 h-16 text-white" />
              </div>
              <p className="text-white text-xl font-medium">Waiting for others to join...</p>
              <p className="text-gray-400 mt-2">Share room code: {roomName}</p>
            </div>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute top-4 right-4 w-32 h-40 sm:w-48 sm:h-60 bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
        <div 
          ref={localVideoRef} 
          className="w-full h-full relative"
        >
          {/* Local video will appear here */}
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="w-10 h-10 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Room Info */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-white text-sm font-medium">
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-3 sm:gap-4 bg-black/60 backdrop-blur-md p-4 rounded-full shadow-2xl">
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all transform hover:scale-110 ${
              isVideoEnabled 
                ? 'bg-white/20 hover:bg-white/30' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all transform hover:scale-110 ${
              isAudioEnabled 
                ? 'bg-white/20 hover:bg-white/30' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={handleEndCall}
            className="p-5 bg-red-500 hover:bg-red-600 rounded-full transition-all transform hover:scale-110 shadow-lg"
            title="End call"
          >
            <Phone className="w-7 h-7 text-white rotate-135" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;