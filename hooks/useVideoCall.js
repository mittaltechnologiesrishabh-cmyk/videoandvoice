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
      console.log(
        "👤 Local participant:",
        connectedRoom.localParticipant.identity
      );

      setRoom(connectedRoom);

      // Store local tracks
      localTracksRef.current = Array.from(
        connectedRoom.localParticipant.tracks.values()
      )
        .map((publication) => publication.track)
        .filter((track) => track !== null);

      // Attach local video with a small delay to ensure DOM is ready
      setTimeout(() => {
        connectedRoom.localParticipant.videoTracks.forEach((publication) => {
          console.log("📹 Local video track found:", publication.track);
          if (publication.track && localVideoRef.current) {
            attachLocalTrack(publication.track);
          }
        });
      }, 100);

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
    }
  };

  const attachLocalTrack = (track) => {
    console.log("🎬 Attaching local track:", track.kind, track.name);

    if (track.kind === "video" && localVideoRef.current) {
      console.log("📺 Local video ref exists:", !!localVideoRef.current);

      // Clear existing videos
      const existingVideos = localVideoRef.current.querySelectorAll("video");
      existingVideos.forEach((v) => v.remove());

      try {
        const videoElement = track.attach();
        console.log("✅ Video element created:", videoElement);

        // Set styles
        videoElement.style.width = "100%";
        videoElement.style.height = "100%";
        videoElement.style.objectFit = "cover";
        videoElement.style.transform = "scaleX(-1)"; // Mirror effect
        videoElement.style.display = "block";
        videoElement.autoplay = true;
        videoElement.playsInline = true;

        localVideoRef.current.appendChild(videoElement);
        console.log("✅ Local video attached to DOM");
        console.log(
          "📊 Video dimensions:",
          videoElement.videoWidth,
          "x",
          videoElement.videoHeight
        );
      } catch (err) {
        console.error("❌ Error attaching local video:", err);
      }
    }
  };

  const participantConnected = (participant) => {
    console.log("🔗 Setting up participant:", participant.identity);

    setParticipants((prevParticipants) => {
      // Avoid duplicates
      if (prevParticipants.find((p) => p.sid === participant.sid)) {
        return prevParticipants;
      }
      return [...prevParticipants, participant];
    });

    // Attach existing published tracks
    participant.tracks.forEach((publication) => {
      console.log(
        "📦 Existing track publication:",
        publication.kind,
        publication.trackName
      );
      if (publication.track) {
        attachRemoteTrack(publication.track);
      }
    });

    // Handle track subscriptions
    participant.on("trackSubscribed", (track) => {
      console.log("🎬 Track subscribed:", track.kind, track.name);
      attachRemoteTrack(track);
    });

    participant.on("trackUnsubscribed", (track) => {
      console.log("⏹️ Track unsubscribed:", track.kind);
      detachRemoteTrack(track);
    });
  };

  const participantDisconnected = (participant) => {
    console.log("👋 Cleaning up participant:", participant.identity);

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
    console.log("🎬 Attaching remote track:", track.kind, track.name);

    if (track.kind === "video" && remoteVideoRef.current) {
      console.log("📺 Remote video ref exists:", !!remoteVideoRef.current);

      // Clear existing remote videos
      const existingVideos = remoteVideoRef.current.querySelectorAll("video");
      existingVideos.forEach((v) => v.remove());

      try {
        const videoElement = track.attach();
        console.log("✅ Remote video element created:", videoElement);

        // Set styles
        videoElement.style.width = "100%";
        videoElement.style.height = "100%";
        videoElement.style.objectFit = "cover";
        videoElement.style.display = "block";
        videoElement.autoplay = true;
        videoElement.playsInline = true;

        remoteVideoRef.current.appendChild(videoElement);
        console.log("✅ Remote video attached to DOM");
        console.log(
          "📊 Video dimensions:",
          videoElement.videoWidth,
          "x",
          videoElement.videoHeight
        );
      } catch (err) {
        console.error("❌ Error attaching remote video:", err);
      }
    } else if (track.kind === "audio") {
      try {
        const audioElement = track.attach();
        audioElement.autoplay = true;
        document.body.appendChild(audioElement);
        console.log("✅ Remote audio attached");
      } catch (err) {
        console.error("❌ Error attaching remote audio:", err);
      }
    }
  };

  const detachRemoteTrack = (track) => {
    console.log("🗑️ Detaching remote track:", track.kind);
    track.detach().forEach((element) => {
      element.remove();
    });
  };

  const cleanupRoom = () => {
    console.log("🧹 Cleaning up room...");

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
        console.log("🧹 Component unmounting, cleaning up...");
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
