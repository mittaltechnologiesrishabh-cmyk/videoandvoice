// import { useState, useRef, useEffect } from 'react';
// import Video from 'twilio-video';

// export const useVideoCall = () => {
//   const [room, setRoom] = useState(null);
//   const [participants, setParticipants] = useState([]);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [isAudioEnabled, setIsAudioEnabled] = useState(true);
//   const [isVideoEnabled, setIsVideoEnabled] = useState(true);
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);

//   const connectToRoom = async (roomName, userName) => {
//     setIsConnecting(true);
//     try {
//       const response = await fetch('/api/twilio-token', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           identity: userName,
//           roomName: roomName,
//           callType: 'video',
//         }),
//       });

//       const data = await response.json();
//       const token = data.token;

//       const room = await Video.connect(token, {
//         name: roomName,
//         audio: true,
//         video: { width: 640, height: 480 },
//       });

//       setRoom(room);

//       // Clear and attach local video
//       if (localVideoRef.current) {
//         localVideoRef.current.innerHTML = ''; // Clear existing content
//         room.localParticipant.videoTracks.forEach((publication) => {
//           const track = publication.track;
//           const videoElement = track.attach();
//           videoElement.style.width = '100%';
//           videoElement.style.height = '100%';
//           videoElement.style.objectFit = 'cover';
//           localVideoRef.current.appendChild(videoElement);
//         });
//       }

//       // Handle participant connections
//       room.on('participantConnected', (participant) => {
//         console.log(`Participant connected: ${participant.identity}`);
//         setParticipants((prev) => [...prev, participant]);
//         attachParticipantTracks(participant);
//       });

//       room.on('participantDisconnected', (participant) => {
//         console.log(`Participant disconnected: ${participant.identity}`);
//         setParticipants((prev) => prev.filter((p) => p !== participant));
//         detachParticipantTracks(participant);
//       });

//       // Attach existing participants
//       room.participants.forEach((participant) => {
//         setParticipants((prev) => [...prev, participant]);
//         attachParticipantTracks(participant);
//       });

//       setIsConnecting(false);
//     } catch (error) {
//       console.error('Error connecting to room:', error);
//       alert('Failed to connect: ' + error.message);
//       setIsConnecting(false);
//     }
//   };

//   const attachParticipantTracks = (participant) => {
//     // Clear remote video container
//     if (remoteVideoRef.current) {
//       remoteVideoRef.current.innerHTML = '';
//     }

//     // Attach existing tracks
//     participant.tracks.forEach((publication) => {
//       if (publication.isSubscribed && publication.track) {
//         attachTrack(publication.track);
//       }
//     });

//     // Handle new tracks
//     participant.on('trackSubscribed', (track) => {
//       console.log('Track subscribed:', track.kind);
//       attachTrack(track);
//     });

//     participant.on('trackUnsubscribed', (track) => {
//       console.log('Track unsubscribed:', track.kind);
//       detachTrack(track);
//     });
//   };

//   const attachTrack = (track) => {
//     if (track.kind === 'video' && remoteVideoRef.current) {
//       const videoElement = track.attach();
//       videoElement.style.width = '100%';
//       videoElement.style.height = '100%';
//       videoElement.style.objectFit = 'cover';
//       remoteVideoRef.current.appendChild(videoElement);
//     } else if (track.kind === 'audio') {
//       const audioElement = track.attach();
//       document.body.appendChild(audioElement);
//     }
//   };

//   const detachTrack = (track) => {
//     track.detach().forEach((element) => element.remove());
//   };

//   const detachParticipantTracks = (participant) => {
//     participant.tracks.forEach((publication) => {
//       if (publication.track) {
//         detachTrack(publication.track);
//       }
//     });
//   };

//   const disconnectFromRoom = () => {
//     if (room) {
//       room.disconnect();
      
//       // Clean up video elements
//       if (localVideoRef.current) {
//         localVideoRef.current.innerHTML = '';
//       }
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.innerHTML = '';
//       }
      
//       setRoom(null);
//       setParticipants([]);
//     }
//   };

//   const toggleAudio = () => {
//     if (room) {
//       room.localParticipant.audioTracks.forEach((publication) => {
//         if (publication.track.isEnabled) {
//           publication.track.disable();
//           setIsAudioEnabled(false);
//         } else {
//           publication.track.enable();
//           setIsAudioEnabled(true);
//         }
//       });
//     }
//   };

//   const toggleVideo = () => {
//     if (room) {
//       room.localParticipant.videoTracks.forEach((publication) => {
//         if (publication.track.isEnabled) {
//           publication.track.disable();
//           setIsVideoEnabled(false);
//         } else {
//           publication.track.enable();
//           setIsVideoEnabled(true);
//         }
//       });
//     }
//   };

//   useEffect(() => {
//     return () => {
//       if (room) {
//         room.disconnect();
//       }
//     };
//   }, [room]);

//   return {
//     room,
//     participants,
//     isConnecting,
//     isAudioEnabled,
//     isVideoEnabled,
//     localVideoRef,
//     remoteVideoRef,
//     connectToRoom,
//     disconnectFromRoom,
//     toggleAudio,
//     toggleVideo,
//   };
// };

import { useState, useRef, useEffect } from 'react';
import Video from 'twilio-video';

export const useVideoCall = () => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const connectToRoom = async (roomName, userName) => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/twilio-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: userName,
          roomName: roomName,
          callType: 'video',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get token');
      }

      const data = await response.json();
      const token = data.token;

      // Connect to Twilio room
      const connectedRoom = await Video.connect(token, {
        name: roomName,
        audio: true,
        video: { width: 640, height: 480, frameRate: 24 },
        dominantSpeaker: true,
      });

      console.log('Connected to room:', connectedRoom.name);
      setRoom(connectedRoom);

      // Attach local participant tracks
      const localParticipant = connectedRoom.localParticipant;
      console.log('Local participant:', localParticipant.identity);

      // Attach local video and audio tracks
      localParticipant.tracks.forEach((publication) => {
        if (publication.track) {
          attachLocalTrack(publication.track);
        }
      });

      // Handle remote participants already in room
      connectedRoom.participants.forEach((participant) => {
        console.log('Existing participant:', participant.identity);
        handleParticipantConnected(participant);
      });

      // Handle new participant connections
      connectedRoom.on('participantConnected', (participant) => {
        console.log('Participant connected:', participant.identity);
        handleParticipantConnected(participant);
      });

      // Handle participant disconnections
      connectedRoom.on('participantDisconnected', (participant) => {
        console.log('Participant disconnected:', participant.identity);
        handleParticipantDisconnected(participant);
      });

      // Handle room disconnection
      connectedRoom.on('disconnected', (room) => {
        console.log('Disconnected from room');
        room.localParticipant.tracks.forEach((publication) => {
          if (publication.track) {
            publication.track.stop();
          }
        });
      });

      setIsConnecting(false);
    } catch (error) {
      console.error('Error connecting to room:', error);
      alert('Failed to connect: ' + error.message);
      setIsConnecting(false);
    }
  };

  const attachLocalTrack = (track) => {
    if (track.kind === 'video' && localVideoRef.current) {
      // Remove existing video elements
      const existingVideo = localVideoRef.current.querySelector('video');
      if (existingVideo) {
        existingVideo.remove();
      }

      // Create and attach new video element
      const videoElement = track.attach();
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';
      videoElement.style.transform = 'scaleX(-1)'; // Mirror local video
      localVideoRef.current.appendChild(videoElement);
      
      setLocalStream(track);
    }
  };

  const handleParticipantConnected = (participant) => {
    setParticipants((prev) => [...prev, participant]);

    // Attach tracks that are already published
    participant.tracks.forEach((publication) => {
      if (publication.isSubscribed && publication.track) {
        attachRemoteTrack(publication.track);
      }
    });

    // Listen for new tracks
    participant.on('trackSubscribed', (track) => {
      console.log('Track subscribed:', track.kind, 'from', participant.identity);
      attachRemoteTrack(track);
    });

    // Listen for track unsubscribed
    participant.on('trackUnsubscribed', (track) => {
      console.log('Track unsubscribed:', track.kind);
      detachRemoteTrack(track);
    });
  };

  const handleParticipantDisconnected = (participant) => {
    setParticipants((prev) => prev.filter((p) => p !== participant));
    
    // Detach all tracks from this participant
    participant.tracks.forEach((publication) => {
      if (publication.track) {
        detachRemoteTrack(publication.track);
      }
    });
  };

  const attachRemoteTrack = (track) => {
    if (track.kind === 'video' && remoteVideoRef.current) {
      // Remove existing video if any
      const existingVideo = remoteVideoRef.current.querySelector('video');
      if (existingVideo) {
        existingVideo.remove();
      }

      // Create and attach video element
      const videoElement = track.attach();
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';
      remoteVideoRef.current.appendChild(videoElement);
    } else if (track.kind === 'audio') {
      // Attach audio track
      const audioElement = track.attach();
      document.body.appendChild(audioElement);
    }
  };

  const detachRemoteTrack = (track) => {
    track.detach().forEach((element) => {
      element.remove();
    });
  };

  const disconnectFromRoom = () => {
    if (room) {
      console.log('Disconnecting from room...');
      room.disconnect();
      
      // Clear video containers
      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = '';
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.innerHTML = '';
      }
      
      setRoom(null);
      setParticipants([]);
      setLocalStream(null);
    }
  };

  const toggleAudio = () => {
    if (room) {
      const enabled = !isAudioEnabled;
      room.localParticipant.audioTracks.forEach((publication) => {
        if (enabled) {
          publication.track.enable();
        } else {
          publication.track.disable();
        }
      });
      setIsAudioEnabled(enabled);
    }
  };

  const toggleVideo = () => {
    if (room) {
      const enabled = !isVideoEnabled;
      room.localParticipant.videoTracks.forEach((publication) => {
        if (enabled) {
          publication.track.enable();
        } else {
          publication.track.disable();
        }
      });
      setIsVideoEnabled(enabled);
    }
  };

  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  return {
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
  };
};