import twilio from "twilio";

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;

  if (!accountSid || !apiKey || !apiSecret) {
    return res.status(500).json({
      error: "Missing Twilio credentials",
    });
  }

  const { identity, roomName, callType } = req.body;

  if (!identity || !callType) {
    return res.status(400).json({
      error: "identity and callType are required",
    });
  }

  try {
    const token = new AccessToken(accountSid, apiKey, apiSecret, {
      identity,
      ttl: 14400, // 4 hours
    });

    // 🎥 VIDEO TOKEN
    if (callType === "video") {
      if (!roomName) {
        return res.status(400).json({
          error: "roomName required for video call",
        });
      }

      const videoGrant = new VideoGrant({
        room: roomName,
      });

      token.addGrant(videoGrant);
      console.log("✅ Video token generated");
    }

    // 🔊 VOICE TOKEN (Audio-only using Twilio Video)
    else if (callType === "voice") {
      if (!roomName) {
        return res.status(400).json({
          error: "roomName required for voice call",
        });
      }

      // Use VideoGrant for voice calls too (audio-only rooms)
      const videoGrant = new VideoGrant({
        room: roomName,
      });

      token.addGrant(videoGrant);
      console.log("✅ Voice token generated (audio-only room)");
    } else {
      return res.status(400).json({
        error: 'Invalid callType. Must be "video" or "voice"',
      });
    }

    res.status(200).json({
      token: token.toJwt(),
      identity,
      roomName: roomName || null,
    });
  } catch (error) {
    console.error("Token Error:", error);
    res.status(500).json({
      error: "Failed to generate token",
      details: error.message,
    });
  }
}
