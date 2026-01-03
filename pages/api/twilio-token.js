import twilio from 'twilio';

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const VoiceGrant = AccessToken.VoiceGrant;

export default function handler(req, res) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const apiKey = process.env.TWILIO_API_KEY;
  const apiSecret = process.env.TWILIO_API_SECRET;

  const { identity, roomName, callType } = req.body;

  const token = new AccessToken(accountSid, apiKey, apiSecret, {
    identity: identity,
  });

  if (callType === 'video') {
    const videoGrant = new VideoGrant({
      room: roomName,
    });
    token.addGrant(videoGrant);
  } else if (callType === 'voice') {
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
      incomingAllow: true,
    });
    token.addGrant(voiceGrant);
  }

  res.json({
    token: token.toJwt(),
  });
}