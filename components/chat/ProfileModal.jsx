import { Check, Copy, Eye, Heart, Radio, Send, Video, X } from "lucide-react";
import { useRef, useState } from "react";

// Simulated Signaling Server (In-Memory)
const signalingServer = {
  streams: {},

  createStream(streamKey, offer) {
    this.streams[streamKey] = {
      offer,
      answer: null,
      iceCandidates: [],
      viewerIceCandidates: [],
    };
  },

  getStream(streamKey) {
    return this.streams[streamKey];
  },

  setAnswer(streamKey, answer) {
    if (this.streams[streamKey]) {
      this.streams[streamKey].answer = answer;
    }
  },

  addIceCandidate(streamKey, candidate, isViewer = false) {
    if (this.streams[streamKey]) {
      if (isViewer) {
        this.streams[streamKey].viewerIceCandidates.push(candidate);
      } else {
        this.streams[streamKey].iceCandidates.push(candidate);
      }
    }
  },
};

const ProfileModal = ({ onClose }) => {
  const [currentView, setCurrentView] = useState("home");
  const [streamType, setStreamType] = useState("video");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [likes, setLikes] = useState(0);
  const [copied, setCopied] = useState(false);
  const [joinStreamKey, setJoinStreamKey] = useState("");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);

  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // Generate stream key
  const generateStreamKey = () => {
    return `live_${Math.random().toString(36).substr(2, 6)}`;
  };

  // Copy stream key to clipboard
  const copyStreamKey = () => {
    navigator.clipboard.writeText(streamKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Start Live Stream (Broadcaster)
  const startLiveStream = async () => {
    try {
      const constraints =
        streamType === "video"
          ? { video: { width: 1280, height: 720 }, audio: true }
          : { video: false, audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current && streamType === "video") {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = pc;

      // Add tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Create data channel
      const dataChannel = pc.createDataChannel("chat");
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        console.log("✅ Data channel opened");
      };

      dataChannel.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "comment") {
          setComments((prev) => [...prev, data]);
        } else if (data.type === "like") {
          setLikes((prev) => prev + 1);
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const key = streamKey || generateStreamKey();
          signalingServer.addIceCandidate(key, event.candidate, false);
        }
      };

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Generate and store stream
      const key = streamKey || generateStreamKey();
      setStreamKey(key);
      signalingServer.createStream(key, offer);

      setIsStreaming(true);
      setCurrentView("goLive");

      console.log("🎥 Stream started with key:", key);

      // Simulate increasing viewers
      const viewerInterval = setInterval(() => {
        setViewerCount((prev) =>
          Math.min(prev + Math.floor(Math.random() * 3), 150)
        );
      }, 3000);

      return () => clearInterval(viewerInterval);
    } catch (error) {
      console.error("❌ Error starting stream:", error);
      alert(
        "Camera/Microphone access denied. Please allow permissions and try again."
      );
    }
  };

  // Join Live Stream (Viewer)
  const joinLiveStream = async (key) => {
    if (!key.trim()) {
      alert("Please enter a stream key");
      return;
    }

    try {
      const streamData = signalingServer.getStream(key);

      if (!streamData) {
        alert("Stream not found. Please check the stream key.");
        return;
      }

      const pc = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = pc;

      // Handle incoming stream
      pc.ontrack = (event) => {
        console.log("📺 Received remote track");
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle data channel
      pc.ondatachannel = (event) => {
        const dataChannel = event.channel;
        dataChannelRef.current = dataChannel;

        dataChannel.onmessage = (evt) => {
          const data = JSON.parse(evt.data);
          if (data.type === "comment") {
            setComments((prev) => [...prev, data]);
          }
        };
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          signalingServer.addIceCandidate(key, event.candidate, true);
        }
      };

      // Set remote description
      await pc.setRemoteDescription(
        new RTCSessionDescription(streamData.offer)
      );

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Store answer
      signalingServer.setAnswer(key, answer);

      // Add stored ICE candidates
      streamData.iceCandidates.forEach((candidate) => {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
      });

      setStreamKey(key);
      setCurrentView("watching");
      setViewerCount(Math.floor(Math.random() * 100) + 10);

      console.log("✅ Joined stream:", key);

      // Add welcome comments
      setTimeout(() => {
        setComments([
          { user: "Sarah", text: "Hey! Welcome! 👋", time: Date.now() },
          {
            user: "Mike",
            text: "Great to see you here! 🔥",
            time: Date.now() + 1000,
          },
        ]);
      }, 1500);
    } catch (error) {
      console.error("❌ Error joining stream:", error);
      alert("Failed to join stream. Please try again.");
    }
  };

  // Send comment
  const sendComment = () => {
    if (!commentInput.trim()) return;

    const comment = {
      type: "comment",
      user: "You",
      text: commentInput,
      time: Date.now(),
    };

    if (
      dataChannelRef.current &&
      dataChannelRef.current.readyState === "open"
    ) {
      dataChannelRef.current.send(JSON.stringify(comment));
    }

    setComments((prev) => [...prev, comment]);
    setCommentInput("");
  };

  // Send like
  const sendLike = () => {
    const like = { type: "like" };
    if (
      dataChannelRef.current &&
      dataChannelRef.current.readyState === "open"
    ) {
      dataChannelRef.current.send(JSON.stringify(like));
    }
    setLikes((prev) => prev + 1);
  };

  // End stream
  const endStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setIsStreaming(false);
    setCurrentView("home");
    setComments([]);
    setLikes(0);
    setViewerCount(0);
    setStreamKey("");
  };

  // Home View
  if (currentView === "home") {
    return (
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn"
        onClick={onClose}
      >
        <div
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-11/12 mx-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-1">
                <img
                  src="https://i.pravatar.cc/300?u=profile"
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Rishabh</h2>
            <p className="text-gray-400 text-lg">@rishabh_dev</p>
          </div>

          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm">Available</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-full font-semibold shadow-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              onClick={() => setCurrentView("streamOptions")}
            >
              <Video className="w-5 h-5" />
              Start Live Stream
            </button>

            <button
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-full font-semibold shadow-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              onClick={() => setCurrentView("joinStream")}
            >
              <Eye className="w-5 h-5" />
              Watch Live Stream
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Join Stream View
  if (currentView === "joinStream") {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-11/12 mx-4 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Join Live Stream
          </h2>

          <input
            type="text"
            value={joinStreamKey}
            onChange={(e) => setJoinStreamKey(e.target.value)}
            placeholder="Enter stream key..."
            className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onKeyPress={(e) =>
              e.key === "Enter" && joinLiveStream(joinStreamKey)
            }
          />

          <button
            onClick={() => joinLiveStream(joinStreamKey)}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-4 rounded-xl mb-4 font-semibold text-lg hover:scale-105 transition-transform"
          >
            Join Stream
          </button>

          <button
            onClick={() => setCurrentView("home")}
            className="w-full bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Stream Options
  if (currentView === "streamOptions") {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-11/12 mx-4 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Choose Stream Type
          </h2>

          <button
            onClick={() => {
              setStreamType("video");
              startLiveStream();
            }}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-2xl mb-4 font-semibold text-lg flex items-center justify-center gap-3 hover:scale-105 transition-transform"
          >
            <Video className="w-6 h-6" />
            Video Live
          </button>

          <button
            onClick={() => {
              setStreamType("audio");
              startLiveStream();
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl mb-4 font-semibold text-lg flex items-center justify-center gap-3 hover:scale-105 transition-transform"
          >
            <Radio className="w-6 h-6" />
            Audio Live
          </button>

          <button
            onClick={() => setCurrentView("home")}
            className="w-full bg-gray-700 text-white py-3 rounded-2xl font-semibold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Broadcasting View
  if (currentView === "goLive" && isStreaming) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex-1 relative">
          {streamType === "video" ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex flex-col items-center justify-center">
              <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <Radio className="w-16 h-16 text-white" />
              </div>
              <p className="text-white text-2xl font-bold">Audio Live</p>
            </div>
          )}

          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white font-bold text-sm">LIVE</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {viewerCount}
                </div>
                <button
                  onClick={copyStreamKey}
                  className="bg-black bg-opacity-60 p-2 rounded-full hover:bg-opacity-80 transition-all"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-white" />
                  )}
                </button>
                <button
                  onClick={endStream}
                  className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-20 left-0 right-0 p-4 max-h-64 overflow-y-auto">
            {comments.map((comment, i) => (
              <div
                key={i}
                className="bg-black bg-opacity-60 text-white px-3 py-2 rounded-full mb-2 inline-block max-w-full animate-fadeIn"
              >
                <span className="font-semibold">{comment.user}</span>:{" "}
                {comment.text}
              </div>
            ))}
          </div>

          {likes > 0 && (
            <div className="absolute right-4 bottom-32">
              <Heart className="w-8 h-8 text-red-500 fill-current animate-bounce" />
            </div>
          )}
        </div>

        <div className="bg-black bg-opacity-90 p-4">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendComment()}
              placeholder="Say something..."
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              onClick={sendComment}
              className="bg-pink-600 p-2 rounded-full hover:bg-pink-700 transition-colors"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={sendLike}
              className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors"
            >
              <Heart className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
            <span>Stream Key:</span>
            <code className="bg-gray-800 px-2 py-1 rounded">{streamKey}</code>
          </div>
        </div>
      </div>
    );
  }

  // Watching View
  if (currentView === "watching") {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex-1 relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white font-bold text-sm">LIVE</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {viewerCount}
                </div>
                <button
                  onClick={() => {
                    endStream();
                    setCurrentView("home");
                  }}
                  className="bg-black bg-opacity-60 p-2 rounded-full hover:bg-opacity-80 transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-20 left-0 right-0 p-4 max-h-64 overflow-y-auto">
            {comments.map((comment, i) => (
              <div
                key={i}
                className="bg-black bg-opacity-60 text-white px-3 py-2 rounded-full mb-2 inline-block max-w-full animate-fadeIn"
              >
                <span className="font-semibold">{comment.user}</span>:{" "}
                {comment.text}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black bg-opacity-90 p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendComment()}
              placeholder="Say something..."
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={sendComment}
              className="bg-purple-600 p-2 rounded-full hover:bg-purple-700 transition-colors"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={sendLike}
              className="bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors"
            >
              <Heart className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default ProfileModal;
