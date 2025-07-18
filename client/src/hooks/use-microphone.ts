import { useState, useEffect, useRef, useCallback } from "react";

export function useMicrophone(sensitivity: number = 5) {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const calibrationDataRef = useRef<number[]>([]);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsPermissionGranted(true);
      setIsMicrophoneActive(true);
      
      // Initialize audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      microphoneRef.current.connect(analyserRef.current);
      
      // Start monitoring
      startVolumeMonitoring();
      
    } catch (error) {
      console.error("Microphone access denied:", error);
      setIsPermissionGranted(false);
      setIsMicrophoneActive(false);
    }
  }, []);

  const startVolumeMonitoring = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateVolume = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate volume level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      
      let volume = (sum / bufferLength) / 255 * 100;
      
      // Apply sensitivity multiplier with exponential scaling for better control
      const sensitivityMultiplier = Math.pow(sensitivity / 5, 1.5) * 3;
      volume = volume * sensitivityMultiplier;
      
      // Clamp between 0 and 100
      volume = Math.max(0, Math.min(100, volume));
      
      setVolumeLevel(isPaused ? 0 : volume);
      
      // Store calibration data if calibrating
      if (isCalibrating) {
        calibrationDataRef.current.push(volume);
      }
      
      animationRef.current = requestAnimationFrame(updateVolume);
    };
    
    animationRef.current = requestAnimationFrame(updateVolume);
  }, [sensitivity, isCalibrating]);

  const calibrate = useCallback(async () => {
    if (!analyserRef.current) return;
    
    setIsCalibrating(true);
    calibrationDataRef.current = [];
    
    // Collect data for 3 seconds
    setTimeout(() => {
      setIsCalibrating(false);
      
      // Calculate average background noise level
      const avgNoise = calibrationDataRef.current.reduce((a, b) => a + b, 0) / calibrationDataRef.current.length;
      
      // Adjust sensitivity based on background noise
      // This is a simple calibration - you might want to implement more sophisticated logic
      console.log("Calibration complete. Average background noise:", avgNoise);
      
      calibrationDataRef.current = [];
    }, 3000);
  }, []);

  // Restart monitoring when sensitivity changes
  useEffect(() => {
    if (analyserRef.current && animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      startVolumeMonitoring();
    }
  }, [sensitivity, startVolumeMonitoring]);

  // Check for existing permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permission.state === 'granted') {
          await requestPermission();
        }
      } catch (error) {
        // Permissions API not supported or other error
        console.warn("Unable to check microphone permission:", error);
      }
    };
    
    checkPermission();
  }, [requestPermission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  return {
    volumeLevel,
    isPermissionGranted,
    isMicrophoneActive,
    isCalibrating,
    isPaused,
    requestPermission,
    calibrate,
    togglePause,
  };
}
