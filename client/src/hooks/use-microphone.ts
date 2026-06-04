import { useState, useEffect, useRef, useCallback } from "react";
import { calculateVolumeLevel } from "@/lib/audio-level";
import {
  type CalibrationSuggestion,
  recommendCalibrationSettings,
} from "@/lib/voice-meter-settings";

type MicrophoneStatus =
  | "idle"
  | "starting"
  | "active"
  | "visuals-paused"
  | "stopped"
  | "denied"
  | "unsupported"
  | "error";

type WindowWithWebkitAudioContext = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export interface MicrophoneError {
  title: string;
  message: string;
}

function getMicrophoneError(error: unknown): MicrophoneError {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return {
        title: "Microphone access is blocked",
        message:
          "Allow microphone access in your browser or device settings, then try starting the meter again.",
      };
    }

    if (error.name === "NotFoundError") {
      return {
        title: "No microphone was found",
        message:
          "Connect or select a microphone, then try starting the meter again.",
      };
    }
  }

  return {
    title: "Microphone could not start",
    message:
      "Check that the browser supports microphone access and that the page is loaded over HTTPS.",
  };
}

export function useMicrophone(sensitivity: number = 5, threshold: number = 70) {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [status, setStatus] = useState<MicrophoneStatus>("idle");
  const [permissionError, setPermissionError] = useState<MicrophoneError | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const calibrationDataRef = useRef<number[]>([]);
  const calibrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sensitivityRef = useRef(sensitivity);
  const thresholdRef = useRef(threshold);
  const isPausedRef = useRef(isPaused);
  const isCalibratingRef = useRef(isCalibrating);

  useEffect(() => {
    sensitivityRef.current = sensitivity;
  }, [sensitivity]);

  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  useEffect(() => {
    isPausedRef.current = isPaused;
    setStatus((current) => {
      if (!isMicrophoneActive) return current;
      return isPaused ? "visuals-paused" : "active";
    });
  }, [isPaused, isMicrophoneActive]);

  useEffect(() => {
    isCalibratingRef.current = isCalibrating;
  }, [isCalibrating]);

  const cancelVolumeMonitoring = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const cleanupAudio = useCallback(async () => {
    cancelVolumeMonitoring();

    if (calibrationTimeoutRef.current) {
      clearTimeout(calibrationTimeoutRef.current);
      calibrationTimeoutRef.current = null;
    }

    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      const context = audioContextRef.current;
      audioContextRef.current = null;
      if (context.state !== "closed") {
        await context.close();
      }
    }

    calibrationDataRef.current = [];
    setIsCalibrating(false);
    setVolumeLevel(0);
  }, [cancelVolumeMonitoring]);

  const startVolumeMonitoring = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateVolume = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);

      const volume = calculateVolumeLevel(dataArray, sensitivityRef.current);

      setVolumeLevel(isPausedRef.current ? 0 : volume);

      if (isCalibratingRef.current) {
        calibrationDataRef.current.push(volume);
      }
      
      animationRef.current = requestAnimationFrame(updateVolume);
    };
    
    animationRef.current = requestAnimationFrame(updateVolume);
  }, []);

  const requestPermission = useCallback(async () => {
    const AudioContextConstructor =
      window.AudioContext ||
      (window as WindowWithWebkitAudioContext).webkitAudioContext;

    if (!navigator.mediaDevices?.getUserMedia || !AudioContextConstructor) {
      setStatus("unsupported");
      setPermissionError({
        title: "Microphone is not supported here",
        message:
          "Use a modern browser with microphone support and load the app over HTTPS.",
      });
      return false;
    }

    try {
      setStatus("starting");
      setPermissionError(null);
      await cleanupAudio();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new AudioContextConstructor();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current =
        audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      microphoneRef.current.connect(analyserRef.current);

      setIsPermissionGranted(true);
      setIsMicrophoneActive(true);
      setIsPaused(false);
      setStatus("active");

      startVolumeMonitoring();
      return true;
    } catch (error) {
      const normalizedError = getMicrophoneError(error);
      await cleanupAudio();
      setPermissionError(normalizedError);
      setStatus(
        normalizedError.title.includes("blocked") ? "denied" : "error",
      );
      setIsPermissionGranted(false);
      setIsMicrophoneActive(false);
      return false;
    }
  }, [cleanupAudio, startVolumeMonitoring]);

  const calibrate = useCallback(async () => {
    if (!analyserRef.current) return null;

    setIsCalibrating(true);
    calibrationDataRef.current = [];

    return new Promise<CalibrationSuggestion | null>((resolve) => {
      calibrationTimeoutRef.current = setTimeout(() => {
        setIsCalibrating(false);

        const samples = calibrationDataRef.current;
        const averageNoise =
          samples.length > 0
            ? samples.reduce((total, value) => total + value, 0) /
              samples.length
            : 0;
        const suggestion = recommendCalibrationSettings(averageNoise, {
          threshold: thresholdRef.current,
          sensitivity: sensitivityRef.current,
        });

        calibrationDataRef.current = [];
        calibrationTimeoutRef.current = null;
        resolve(suggestion);
      }, 3000);
    });
  }, []);

  const stopMicrophone = useCallback(async () => {
    await cleanupAudio();
    setIsPermissionGranted(false);
    setIsMicrophoneActive(false);
    setIsPaused(false);
    setStatus("stopped");
  }, [cleanupAudio]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!audioContextRef.current || !isMicrophoneActive) return;

      if (document.hidden) {
        setVolumeLevel(0);
        return;
      }

      if (audioContextRef.current.state === "suspended") {
        void audioContextRef.current.resume();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isMicrophoneActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      void cleanupAudio();
    };
  }, [cleanupAudio]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  return {
    volumeLevel,
    isPermissionGranted,
    isMicrophoneActive,
    isCalibrating,
    isPaused,
    status,
    permissionError,
    requestPermission,
    calibrate,
    stopMicrophone,
    togglePause,
  };
}
