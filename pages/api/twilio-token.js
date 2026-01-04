import twilio from "twilio";

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const VoiceGrant = AccessToken.VoiceGrant;

export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;

  // Validate environment variables
  if (!accountSid || !apiKey || !apiSecret) {
    console.error("Missing Twilio credentials");
    return res.status(500).json({
      error: "Server configuration error",
      details: "Missing Twilio credentials",
    });
  }

  const { identity, roomName, callType } = req.body;

  // Validate request body
  if (!identity || !roomName || !callType) {
    console.error("Invalid request body");
    return res.status(400).json({
      error:
        "Missing required fields: identity, roomName, and callType are required",
    });
  }

  try {
    console.log("📝 Creating token for:", identity, "in room:", roomName);

    // Create Access Token with identity
    const token = new AccessToken(accountSid, apiKey, apiSecret, {
      identity: identity,
      ttl: 14400, // Token valid for 4 hours
    });

    if (callType === "video") {
      // Create Video Grant
      const videoGrant = new VideoGrant({
        room: roomName,
      });
      token.addGrant(videoGrant);

      console.log("✅ Video token generated successfully");
    } else if (callType === "voice") {
      // Validate voice-specific environment variable
      if (!process.env.TWILIO_TWIML_APP_SID) {
        return res.status(500).json({
          error: "Voice call configuration missing",
        });
      }

      const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
        incomingAllow: true,
      });
      token.addGrant(voiceGrant);

      console.log("✅ Voice token generated successfully");
    } else {
      return res.status(400).json({
        error: 'Invalid callType. Must be "video" or "voice"',
      });
    }

    // Return the JWT token
    const jwtToken = token.toJwt();
    console.log("🎉 Token sent to client");

    res.status(200).json({
      token: jwtToken,
      identity: identity,
      roomName: roomName,
    });
  } catch (error) {
    console.error("Error generating Twilio token:", error);
    res.status(500).json({
      error: "Failed to generate token",
      details: error.message,
    });
  }
}
