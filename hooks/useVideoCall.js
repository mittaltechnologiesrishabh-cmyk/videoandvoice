import { useState, useRef, useEffect } from 'react';
import Video from 'twilio-video';
// If you lose your phone, or don’t have access to your verification device,
// this code is your failsafe to access your account.
// YZ8CNBQH9ELWU6G6YQVTMQ28
export const useVideoCall = () => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
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

      const data = await response.json();
      const token = data.token;

      const room = await Video.connect(token, {
        name: roomName,
        audio: true,
        video: { width: 640 },
      });

      setRoom(room);

      // Attach local video
      room.localParticipant.videoTracks.forEach((publication) => {
        if (localVideoRef.current) {
          const track = publication.track;
          localVideoRef.current.appendChild(track.attach());
        }
      });

      // Handle participant connections
      room.on('participantConnected', (participant) => {
        setParticipants((prev) => [...prev, participant]);
        attachParticipantTracks(participant);
      });

      room.on('participantDisconnected', (participant) => {
        setParticipants((prev) => prev.filter((p) => p !== participant));
        detachParticipantTracks(participant);
      });

      // Attach existing participants
      room.participants.forEach((participant) => {
        setParticipants((prev) => [...prev, participant]);
        attachParticipantTracks(participant);
      });

      setIsConnecting(false);
    } catch (error) {
      console.error('Error connecting to room:', error);
      setIsConnecting(false);
    }
  };

  const attachParticipantTracks = (participant) => {
    participant.tracks.forEach((publication) => {
      if (publication.track && remoteVideoRef.current) {
        remoteVideoRef.current.appendChild(publication.track.attach());
      }
    });

    participant.on('trackSubscribed', (track) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.appendChild(track.attach());
      }
    });
  };

  const detachParticipantTracks = (participant) => {
    participant.tracks.forEach((publication) => {
      if (publication.track) {
        publication.track.detach().forEach((element) => element.remove());
      }
    });
  };

  const disconnectFromRoom = () => {
    if (room) {
      room.disconnect();
      setRoom(null);
      setParticipants([]);
    }
  };

  const toggleAudio = () => {
    if (room) {
      room.localParticipant.audioTracks.forEach((publication) => {
        if (publication.track.isEnabled) {
          publication.track.disable();
        } else {
          publication.track.enable();
        }
      });
    }
  };

  const toggleVideo = () => {
    if (room) {
      room.localParticipant.videoTracks.forEach((publication) => {
        if (publication.track.isEnabled) {
          publication.track.disable();
        } else {
          publication.track.enable();
        }
      });
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
    localVideoRef,
    remoteVideoRef,
    connectToRoom,
    disconnectFromRoom,
    toggleAudio,
    toggleVideo,
  };
};