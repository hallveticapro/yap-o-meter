import { useState, useEffect, useRef } from "react";
import { Settings, Mic, MicOff } from "lucide-react";
import CanvasVisualizer from "@/components/canvas-visualizer";
import SettingsSidebar from "@/components/settings-sidebar";
import PermissionOverlay from "@/components/permission-overlay";
import StatusPanel from "@/components/status-panel";
import { useMicrophone } from "@/hooks/use-microphone";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { playAlert } from "@/lib/audio-alerts";

export interface VoiceMeterSettings {
  theme: string;
  threshold: number;
  showThreshold: boolean;
  enableAlerts: boolean;
  alertSound: string;
  alertVolume: number;
  sensitivity: number;
}

const defaultSettings: VoiceMeterSettings = {
  theme: "balls",
  threshold: 70,
  showThreshold: true,
  enableAlerts: true,
  alertSound: "shush",
  alertVolume: 50,
  sensitivity: 5,
};

export default function VoiceMeter() {
  const [settings, setSettings] = useLocalStorage<VoiceMeterSettings>("voice-meter-settings", defaultSettings);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showStatusPanel, setShowStatusPanel] = useState(true);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAlertTimeRef = useRef<number>(0);
  const statusPanelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    volumeLevel,
    isPermissionGranted,
    isMicrophoneActive,
    requestPermission,
    calibrate,
    isCalibrating,
  } = useMicrophone(settings.sensitivity);

  // Check threshold and trigger alerts
  useEffect(() => {
    if (volumeLevel > settings.threshold && settings.enableAlerts) {
      const now = Date.now();
      // Throttle alerts to once every 2 seconds
      if (now - lastAlertTimeRef.current > 2000) {
        lastAlertTimeRef.current = now;
        
        // Show visual alert
        setShowAlert(true);
        if (alertTimeoutRef.current) {
          clearTimeout(alertTimeoutRef.current);
        }
        alertTimeoutRef.current = setTimeout(() => {
          setShowAlert(false);
        }, 1500);

        // Play audio alert
        playAlert(settings.alertSound, settings.alertVolume);
      }
    }
  }, [volumeLevel, settings.threshold, settings.enableAlerts, settings.alertSound, settings.alertVolume]);

  // Auto-hide status panel after 5 seconds
  useEffect(() => {
    if (isPermissionGranted && isMicrophoneActive) {
      if (statusPanelTimeoutRef.current) {
        clearTimeout(statusPanelTimeoutRef.current);
      }
      statusPanelTimeoutRef.current = setTimeout(() => {
        setShowStatusPanel(false);
      }, 5000);
    }
  }, [isPermissionGranted, isMicrophoneActive]);

  // Cleanup timeouts
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

  const handleSettingsChange = (newSettings: Partial<VoiceMeterSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCalibrate = async () => {
    await calibrate();
  };

  if (!isPermissionGranted) {
    return <PermissionOverlay onRequestPermission={requestPermission} />;
  }

  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* Main Canvas Container */}
      <div className={`canvas-shift w-full h-screen relative transition-transform duration-400 ease-out ${isSidebarOpen ? 'shifted' : ''}`}>
        <CanvasVisualizer
          theme={settings.theme}
          volumeLevel={volumeLevel}
          threshold={settings.threshold}
          showThreshold={settings.showThreshold}
        />

        {/* Top Control Panel */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
          <div className={`transition-opacity duration-1000 ${showStatusPanel ? 'opacity-100' : 'opacity-0'}`}>
            <StatusPanel
              volumeLevel={volumeLevel}
              theme={settings.theme}
              isMicrophoneActive={isMicrophoneActive}
            />
          </div>

          {/* Settings Toggle */}
          <button
            onClick={toggleSidebar}
            className="glass-button rounded-xl p-3 text-white hover:text-cyan-400 transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Volume Alert Indicator */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 transition-opacity duration-300 ${showAlert ? 'opacity-100' : 'opacity-0'}`}>
          <div className="glass-morphism rounded-full p-6 animate-bounce-soft">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
              <MicOff className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sidebar */}
      <SettingsSidebar
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onCalibrate={handleCalibrate}
        isCalibrating={isCalibrating}
      />

      {/* Background Overlay for Sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-20 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />
    </div>
  );
}
