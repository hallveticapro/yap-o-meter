import { useEffect, useRef, useState } from "react";
import { MicOff, Settings } from "lucide-react";
import CanvasVisualizer from "@/components/canvas-visualizer";
import PermissionOverlay from "@/components/permission-overlay";
import SettingsSidebar from "@/components/settings-sidebar";
import StatusPanel from "@/components/status-panel";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useMicrophone } from "@/hooks/use-microphone";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { playAlert } from "@/lib/audio-alerts";
import {
  DEFAULT_SETTINGS,
  applyPreset,
  createRoomProfile,
  isRoomProfile,
  sanitizeSettings,
  type CalibrationSuggestion,
  type ClassroomPreset,
  type RoomProfile,
  type VoiceMeterSettings,
} from "@/lib/voice-meter-settings";

export type { VoiceMeterSettings } from "@/lib/voice-meter-settings";

const MAX_HISTORY_POINTS = 60;
const MAX_ROOM_PROFILES = 12;

export default function VoiceMeter() {
  const [storedSettings, setStoredSettings] =
    useLocalStorage<VoiceMeterSettings>("voice-meter-settings", DEFAULT_SETTINGS);
  const settings = sanitizeSettings(storedSettings);
  const [roomProfiles, setRoomProfiles] = useLocalStorage<RoomProfile[]>(
    "voice-meter-room-profiles",
    [],
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showStatusPanel, setShowStatusPanel] = useState(true);
  const [calibrationSuggestion, setCalibrationSuggestion] =
    useState<CalibrationSuggestion | null>(null);
  const [volumeHistory, setVolumeHistory] = useState<number[]>([]);
  const [isDisplayMode, setIsDisplayMode] = useState(false);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAlertTimeRef = useRef<number>(0);
  const statusPanelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const prefersReducedMotion = usePrefersReducedMotion();

  const {
    volumeLevel,
    isPermissionGranted,
    isMicrophoneActive,
    requestPermission,
    stopMicrophone,
    calibrate,
    isCalibrating,
    isPaused,
    togglePause,
    status,
    permissionError,
  } = useMicrophone(settings.sensitivity, settings.threshold);

  const effectiveReducedMotion =
    settings.reducedMotion || settings.lowStimulation || prefersReducedMotion;

  const updateSettings = (newSettings: Partial<VoiceMeterSettings>) => {
    setStoredSettings((prev) => sanitizeSettings({ ...prev, ...newSettings }));
  };

  const handleThresholdCrossed = () => {
    if (settings.enableAlerts) {
      const now = Date.now();
      if (now - lastAlertTimeRef.current > 2000) {
        lastAlertTimeRef.current = now;

        setShowAlert(true);
        if (alertTimeoutRef.current) {
          clearTimeout(alertTimeoutRef.current);
        }
        alertTimeoutRef.current = setTimeout(() => {
          setShowAlert(false);
        }, 1500);

        playAlert(settings.alertSound, settings.alertVolume);
      }
    }
  };

  useEffect(() => {
    if (isPermissionGranted && isMicrophoneActive && !isDisplayMode) {
      if (statusPanelTimeoutRef.current) {
        clearTimeout(statusPanelTimeoutRef.current);
      }
      statusPanelTimeoutRef.current = setTimeout(() => {
        setShowStatusPanel(false);
      }, 5000);
    }
  }, [isPermissionGranted, isMicrophoneActive, isDisplayMode]);

  useEffect(() => {
    if (!isMicrophoneActive) {
      setVolumeHistory([]);
      return;
    }

    const interval = setInterval(() => {
      setVolumeHistory((prev) => {
        const next = [...prev, Math.round(volumeLevel)];
        return next.slice(-MAX_HISTORY_POINTS);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isMicrophoneActive, volumeLevel]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isDisplayMode) {
        void exitDisplayMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDisplayMode]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsDisplayMode(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
      if (statusPanelTimeoutRef.current) {
        clearTimeout(statusPanelTimeoutRef.current);
      }
    };
  }, []);

  const handleStatusHover = () => {
    if (isDisplayMode) return;
    setShowStatusPanel(true);
    if (statusPanelTimeoutRef.current) {
      clearTimeout(statusPanelTimeoutRef.current);
    }
  };

  const handleStatusLeave = () => {
    if (isDisplayMode) return;
    statusPanelTimeoutRef.current = setTimeout(() => {
      setShowStatusPanel(false);
    }, 5000);
  };

  const handleCalibrate = async () => {
    const suggestion = await calibrate();
    if (suggestion) {
      setCalibrationSuggestion(suggestion);
    }
  };

  const applyCalibrationSuggestion = () => {
    if (!calibrationSuggestion) return;

    updateSettings({
      threshold: calibrationSuggestion.recommendedThreshold,
      sensitivity: calibrationSuggestion.recommendedSensitivity,
      preset: "custom",
    });
    setCalibrationSuggestion(null);
  };

  const handleApplyPreset = (preset: ClassroomPreset) => {
    setStoredSettings((prev) => applyPreset(sanitizeSettings(prev), preset));
  };

  const enterDisplayMode = async () => {
    setIsSidebarOpen(false);
    setShowStatusPanel(true);

    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fullscreen may be blocked by browser policy; display mode still hides controls.
      }
    }

    setIsDisplayMode(true);
  };

  const exitDisplayMode = async () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch {
        // Browser may already be exiting fullscreen.
      }
    }

    setIsDisplayMode(false);
  };

  const toggleDisplayMode = () => {
    if (isDisplayMode) {
      void exitDisplayMode();
    } else {
      void enterDisplayMode();
    }
  };

  const saveRoomProfile = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const profile = createRoomProfile(trimmed, settings);
    setRoomProfiles((prev) => [
      profile,
      ...prev.filter(
        (existing) => existing.name.toLowerCase() !== trimmed.toLowerCase(),
      ),
    ].slice(0, MAX_ROOM_PROFILES));
  };

  const applyRoomProfile = (profileId: string) => {
    const profile = roomProfiles.find((item) => item.id === profileId);
    if (profile) {
      setStoredSettings(sanitizeSettings(profile.settings));
    }
  };

  const deleteRoomProfile = (profileId: string) => {
    setRoomProfiles((prev) => prev.filter((profile) => profile.id !== profileId));
  };

  const exportSettings = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      roomProfiles,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "yap-o-meter-settings.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed.settings) {
          setStoredSettings(sanitizeSettings(parsed.settings));
        }
        if (Array.isArray(parsed.roomProfiles)) {
          setRoomProfiles(
            parsed.roomProfiles
              .filter(isRoomProfile)
              .map((profile: RoomProfile) => ({
                ...profile,
                settings: sanitizeSettings(profile.settings),
              }))
              .slice(0, MAX_ROOM_PROFILES),
          );
        }
      } catch {
        // Invalid imports are ignored; no classroom or audio data is involved.
      }
    };

    reader.readAsText(file);
  };

  if (!isMicrophoneActive) {
    return (
      <PermissionOverlay
        onRequestPermission={requestPermission}
        status={status}
        error={permissionError}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        className={`canvas-shift relative h-screen w-full transition-transform duration-400 ease-out ${
          isSidebarOpen && !isDisplayMode ? "shifted" : ""
        }`}
      >
        <CanvasVisualizer
          theme={settings.theme}
          volumeLevel={volumeLevel}
          threshold={settings.threshold}
          showThreshold={settings.showThreshold}
          onThresholdCrossed={handleThresholdCrossed}
          isPaused={isPaused}
          reducedMotion={effectiveReducedMotion}
          lowStimulation={settings.lowStimulation}
          disableInteractions={isDisplayMode}
        />

        <div className="absolute left-6 right-6 top-6 z-10 flex items-start justify-between">
          <div
            className={`transition-opacity duration-1000 ${
              showStatusPanel || isDisplayMode ? "opacity-100" : "opacity-0"
            }`}
            onMouseEnter={handleStatusHover}
            onMouseLeave={handleStatusLeave}
          >
            <StatusPanel
              volumeLevel={volumeLevel}
              isMicrophoneActive={isMicrophoneActive}
              isPaused={isPaused}
              onTogglePause={togglePause}
              onStopMicrophone={() => void stopMicrophone()}
              onCalibrate={handleCalibrate}
              isCalibrating={isCalibrating}
              calibrationSuggestion={calibrationSuggestion}
              onApplyCalibration={applyCalibrationSuggestion}
              onDismissCalibration={() => setCalibrationSuggestion(null)}
              volumeHistory={volumeHistory}
              showHistory={settings.showHistory}
              isDisplayMode={isDisplayMode}
              onExitDisplayMode={() => void exitDisplayMode()}
            />
          </div>

          {!isDisplayMode && (
            <button
              aria-label="Open teacher settings"
              onClick={() => setIsSidebarOpen((open) => !open)}
              className="glass-button rounded-xl p-3 text-white transition-colors hover:text-cyan-400"
            >
              <Settings className="h-6 w-6" />
            </button>
          )}
        </div>

        <div
          className={`absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 transform transition-opacity duration-300 ${
            showAlert ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={!showAlert}
        >
          <div className="glass-morphism animate-bounce-soft rounded-full p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
              <MicOff className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {!isDisplayMode && (
        <>
          <SettingsSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            settings={settings}
            onSettingsChange={updateSettings}
            onApplyPreset={handleApplyPreset}
            onCalibrate={handleCalibrate}
            isCalibrating={isCalibrating}
            isDisplayMode={isDisplayMode}
            onToggleDisplayMode={toggleDisplayMode}
            roomProfiles={roomProfiles}
            onSaveProfile={saveRoomProfile}
            onApplyProfile={applyRoomProfile}
            onDeleteProfile={deleteRoomProfile}
            onExportSettings={exportSettings}
            onImportSettings={importSettings}
          />

          <div
            className={`fixed inset-0 z-20 bg-black bg-opacity-30 transition-opacity duration-300 ${
              isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={() => setIsSidebarOpen(false)}
          />
        </>
      )}
    </div>
  );
}
