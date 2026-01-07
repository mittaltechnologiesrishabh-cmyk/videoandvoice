import { useEffect, useRef, useState } from "react";
import Video from "twilio-video";

export const useVoiceCall = () => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState(null);

  const localTracksRef = useRef([]);

  const connectToRoom = async (roomName, userName) => {
    if (!roomName || !userName) {
      setError("Room name and user name are required");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log(
        "🎤 Requesting audio-only token for:",
        userName,
        "in room:",
        roomName
      );

      const response = await fetch("/api/twilio-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identity: userName,
          roomName: roomName,
          callType: "voice",
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

      // Connect with AUDIO ONLY - NO VIDEO
      const connectedRoom = await Video.connect(data.token, {
        name: roomName,
        audio: true,
        video: false, // IMPORTANT: Disable video completely
        dominantSpeaker: true,
        networkQuality: {
          local: 1,
          remote: 1,
        },
      });

      console.log(
        "✅ Successfully connected to audio-only room:",
        connectedRoom.name
      );
      console.log(
        "👤 Local participant:",
        connectedRoom.localParticipant.identity
      );

      setRoom(connectedRoom);

      // Store local audio tracks
      localTracksRef.current = Array.from(
        connectedRoom.localParticipant.tracks.values()
      )
        .map((publication) => publication.track)
        .filter((track) => track !== null);

      console.log("🎤 Local audio tracks:", localTracksRef.current.length);

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

  const participantConnected = (participant) => {
    console.log("🔗 Setting up audio participant:", participant.identity);

    setParticipants((prevParticipants) => {
      if (prevParticipants.find((p) => p.sid === participant.sid)) {
        return prevParticipants;
      }
      return [...prevParticipants, participant];
    });

    // Attach existing audio tracks
    participant.tracks.forEach((publication) => {
      console.log("📦 Track publication:", publication.kind);
      if (publication.track && publication.track.kind === "audio") {
        attachAudioTrack(publication.track);
      }
    });

    // Handle new audio track subscriptions
    participant.on("trackSubscribed", (track) => {
      console.log("🎬 Track subscribed:", track.kind);
      if (track.kind === "audio") {
        attachAudioTrack(track);
      }
    });

    participant.on("trackUnsubscribed", (track) => {
      console.log("⏹️ Track unsubscribed:", track.kind);
      if (track.kind === "audio") {
        detachAudioTrack(track);
      }
    });
  };

  const participantDisconnected = (participant) => {
    console.log("👋 Cleaning up participant:", participant.identity);

    setParticipants((prevParticipants) =>
      prevParticipants.filter((p) => p.sid !== participant.sid)
    );

    // Detach all audio tracks
    participant.tracks.forEach((publication) => {
      if (publication.track && publication.track.kind === "audio") {
        detachAudioTrack(publication.track);
      }
    });
  };

  const attachAudioTrack = (track) => {
    console.log("🔊 Attaching audio track:", track.name);

    try {
      const audioElement = track.attach();
      audioElement.autoplay = true;
      audioElement.style.display = "none"; // Hide audio element
      document.body.appendChild(audioElement);
      console.log("✅ Remote audio attached and playing");
    } catch (err) {
      console.error("❌ Error attaching audio:", err);
    }
  };

  const detachAudioTrack = (track) => {
    console.log("🗑️ Detaching audio track");
    track.detach().forEach((element) => {
      element.remove();
    });
  };

  const cleanupRoom = () => {
    console.log("🧹 Cleaning up audio room...");

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
      console.log("🔌 Disconnecting from audio room...");
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

  useEffect(() => {
    return () => {
      if (room) {
        console.log("🧹 Component unmounting, cleaning up audio...");
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
    error,
    connectToRoom,
    disconnectFromRoom,
    toggleAudio,
  };
};
