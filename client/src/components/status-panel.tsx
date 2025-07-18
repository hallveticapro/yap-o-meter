import { Mic, MicOff } from "lucide-react";

interface StatusPanelProps {
  volumeLevel: number;
  theme: string;
  isMicrophoneActive: boolean;
}

const themeNames: { [key: string]: string } = {
  balls: "Bouncing Balls",
  waves: "Liquid Waves",
  bubbles: "Floating Bubbles",
};

export default function StatusPanel({ volumeLevel, theme, isMicrophoneActive }: StatusPanelProps) {
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
      
      {/* Current Theme Display */}
      <div className="text-xs text-slate-300">
        <span>Theme: </span>
        <span className="text-cyan-400 font-medium">{themeNames[theme] || theme}</span>
      </div>
    </div>
  );
}
