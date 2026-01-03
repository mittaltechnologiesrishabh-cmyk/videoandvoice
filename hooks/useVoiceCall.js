import { useState, useEffect, useRef } from 'react';
import { Device } from '@twilio/voice-sdk';

export const useVoiceCall = () => {
  const [device, setDevice] = useState(null);
  const [call, setCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callStatus, setCallStatus] = useState('');
  const deviceRef = useRef(null);

  const initializeDevice = async (userName) => {
    try {
      const response = await fetch('/api/twilio-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: userName,
          callType: 'voice',
        }),
      });

      const data = await response.json();
      const token = data.token;

      const newDevice = new Device(token, {
        codecPreferences: ['opus', 'pcmu'],
        fakeLocalDTMF: true,
        enableRingingState: true,
      });

      newDevice.on('registered', () => {
        console.log('Device registered');
      });

      newDevice.on('error', (error) => {
        console.error('Device error:', error);
      });

      newDevice.on('incoming', (incomingCall) => {
        setCallStatus('Incoming call...');
        setCall(incomingCall);
      });

      await newDevice.register();
      setDevice(newDevice);
      deviceRef.current = newDevice;
    } catch (error) {
      console.error('Error initializing device:', error);
    }
  };

  const makeCall = async (to) => {
    if (device) {
      try {
        setCallStatus('Calling...');
        const outgoingCall = await device.connect({
          params: { To: to },
        });

        outgoingCall.on('accept', () => {
          setCallStatus('Connected');
        });

        outgoingCall.on('disconnect', () => {
          setCallStatus('');
          setCall(null);
        });

        outgoingCall.on('cancel', () => {
          setCallStatus('');
          setCall(null);
        });

        setCall(outgoingCall);
      } catch (error) {
        console.error('Error making call:', error);
        setCallStatus('');
      }
    }
  };

  const endCall = () => {
    if (call) {
      call.disconnect();
      setCall(null);
      setCallStatus('');
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (call) {
      call.mute(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const answerCall = () => {
    if (call) {
      call.accept();
      setCallStatus('Connected');
    }
  };

  const rejectCall = () => {
    if (call) {
      call.reject();
      setCall(null);
      setCallStatus('');
    }
  };

  useEffect(() => {
    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy();
      }
    };
  }, []);

  return {
    device,
    call,
    isMuted,
    callStatus,
    initializeDevice,
    makeCall,
    endCall,
    toggleMute,
    answerCall,
    rejectCall,
  };
};