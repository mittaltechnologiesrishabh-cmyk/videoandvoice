import { useEffect, useRef, useState } from "react";
import Video from "twilio-video";

export const useVideoCall = () => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [error, setError] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localTracksRef = useRef([]);

  const connectToRoom = async (roomName, userName) => {
    if (!roomName || !userName) {
      setError("Room name and user name are required");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log("🔄 Requesting token for:", userName, "in room:", roomName);

      const response = await fetch("/api/twilio-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identity: userName,
          roomName: roomName,
          callType: "video",
        }),
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API Error:", errorData);
        throw new Error(errorData.error || "Failed to get token");
      }

      const data = await response.json();
      console.log("✅ Token received successfully");

      // Connect to Twilio room
      const connectedRoom = await Video.connect(data.token, {
        name: roomName,
        audio: true,
        video: {
          width: 640,
          height: 480,
          frameRate: 24,
        },
        dominantSpeaker: true,
        networkQuality: {
          local: 1,
          remote: 1,
        },
      });

      console.log("✅ Successfully connected to room:", connectedRoom.name);
      setRoom(connectedRoom);

      // Store local tracks
      localTracksRef.current = Array.from(
        connectedRoom.localParticipant.tracks.values()
      )
        .map((publication) => publication.track)
        .filter((track) => track !== null);

      // Attach local video
      connectedRoom.localParticipant.videoTracks.forEach((publication) => {
        if (publication.track && localVideoRef.current) {
          attachLocalTrack(publication.track);
        }
      });

      // Handle existing participants
      connectedRoom.participants.forEach((participant) => {
        console.log("👤 Existing participant:", participant.identity);
        participantConnected(participant);
      });

      // Handle new participant connections
      connectedRoom.on("participantConnected", (participant) => {
        console.log("👤 Participant joined:", participant.identity);
        participantConnected(participant);
      });

      // Handle participant disconnections
      connectedRoom.on("participantDisconnected", (participant) => {
        console.log("👋 Participant left:", participant.identity);
        participantDisconnected(participant);
      });

      // Handle disconnection
      connectedRoom.on("disconnected", (room, error) => {
        console.log("🔌 Disconnected from room");
        if (error) {
          console.error("Disconnection error:", error);
        }
        cleanupRoom();
      });

      setIsConnecting(false);
    } catch (error) {
      console.error("❌ Error connecting to room:", error);
      setError(error.message);
      setIsConnecting(false);
      alert("Failed to connect: " + error.message);
    }
  };

  const attachLocalTrack = (track) => {
    if (track.kind === "video" && localVideoRef.current) {
      // Clear existing videos
      while (localVideoRef.current.firstChild) {
        localVideoRef.current.firstChild.remove();
      }

      const videoElement = track.attach();
      videoElement.style.width = "100%";
      videoElement.style.height = "100%";
      videoElement.style.objectFit = "cover";
      videoElement.style.transform = "scaleX(-1)"; // Mirror effect
      localVideoRef.current.appendChild(videoElement);
      console.log("📹 Local video attached");
    }
  };

  const participantConnected = (participant) => {
    setParticipants((prevParticipants) => {
      // Avoid duplicates
      if (prevParticipants.find((p) => p.sid === participant.sid)) {
        return prevParticipants;
      }
      return [...prevParticipants, participant];
    });

    // Attach existing published tracks
    participant.tracks.forEach((publication) => {
      if (publication.track) {
        attachRemoteTrack(publication.track);
      }
    });

    // Handle track subscriptions
    participant.on("trackSubscribed", (track) => {
      console.log("🎬 Track subscribed:", track.kind);
      attachRemoteTrack(track);
    });

    participant.on("trackUnsubscribed", (track) => {
      console.log("⏹️ Track unsubscribed:", track.kind);
      detachRemoteTrack(track);
    });
  };

  const participantDisconnected = (participant) => {
    setParticipants((prevParticipants) =>
      prevParticipants.filter((p) => p.sid !== participant.sid)
    );

    // Detach all tracks from this participant
    participant.tracks.forEach((publication) => {
      if (publication.track) {
        detachRemoteTrack(publication.track);
      }
    });
  };

  const attachRemoteTrack = (track) => {
    if (track.kind === "video" && remoteVideoRef.current) {
      // Clear existing remote videos
      while (remoteVideoRef.current.firstChild) {
        remoteVideoRef.current.firstChild.remove();
      }

      const videoElement = track.attach();
      videoElement.style.width = "100%";
      videoElement.style.height = "100%";
      videoElement.style.objectFit = "cover";
      remoteVideoRef.current.appendChild(videoElement);
      console.log("📹 Remote video attached");
    } else if (track.kind === "audio") {
      const audioElement = track.attach();
      document.body.appendChild(audioElement);
      console.log("🔊 Remote audio attached");
    }
  };

  const detachRemoteTrack = (track) => {
    track.detach().forEach((element) => {
      element.remove();
    });
  };

  const cleanupRoom = () => {
    // Clear video containers
    if (localVideoRef.current) {
      localVideoRef.current.innerHTML = "";
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.innerHTML = "";
    }

    // Stop local tracks
    localTracksRef.current.forEach((track) => {
      track.stop();
    });
    localTracksRef.current = [];

    setRoom(null);
    setParticipants([]);
  };

  const disconnectFromRoom = () => {
    if (room) {
      console.log("🔌 Disconnecting from room...");
      room.disconnect();
      cleanupRoom();
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
      console.log("🎤 Audio:", enabled ? "ON" : "OFF");
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
      console.log("📹 Video:", enabled ? "ON" : "OFF");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
        cleanupRoom();
      }
    };
  }, [room]);

  return {
    room,
    participants,
    isConnecting,
    isAudioEnabled,
    isVideoEnabled,
    error,
    localVideoRef,
    remoteVideoRef,
    connectToRoom,
    disconnectFromRoom,
    toggleAudio,
    toggleVideo,
  };
};
