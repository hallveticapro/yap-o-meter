import { Mic, MicOff, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatusPanelProps {
  volumeLevel: number;
  theme: string;
  isMicrophoneActive: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  onCalibrate: () => void;
  isCalibrating: boolean;
}

const themeNames: { [key: string]: string } = {
  balls: "Bouncing Balls",
  waves: "Liquid Waves",
  bubbles: "Floating Bubbles",
};

export default function StatusPanel({ volumeLevel, theme, isMicrophoneActive, isPaused, onTogglePause, onCalibrate, isCalibrating }: StatusPanelProps) {
  return (
    <div className="glass-morphism rounded-2xl p-4 max-w-md">
      <div className="flex items-center space-x-3 mb-3">
        <div className={`w-3 h-3 rounded-full ${isMicrophoneActive ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
        <span className="text-white text-sm font-medium">
          {isMicrophoneActive ? 'Microphone Active' : 'Microphone Inactive'}
        </span>
        {isMicrophoneActive ? <Mic className="w-4 h-4 text-green-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
      </div>
      
      {/* Real-time Volume Display */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-300 mb-1">
          <span>Volume Level</span>
          <span>{Math.round(volumeLevel)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="volume-bar h-2 rounded-full transition-all duration-100"
            style={{ width: `${Math.min(volumeLevel, 100)}%` }}
          />
        </div>
      </div>
      
      {/* Microphone Controls */}
      <div className="flex gap-2 mb-3">
        <Button
          onClick={onTogglePause}
          size="sm"
          variant={isPaused ? "default" : "secondary"}
          className="flex-1 h-8 text-xs"
        >
          {isPaused ? (
            <>
              <Play className="w-3 h-3 mr-1" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-3 h-3 mr-1" />
              Pause
            </>
          )}
        </Button>
        
        <Button
          onClick={onCalibrate}
          disabled={isCalibrating}
          size="sm"
          variant="outline"
          className="h-8 text-xs"
        >
          {isCalibrating ? 'Calibrating...' : 'Calibrate'}
        </Button>
      </div>
      

    </div>
  );
}
