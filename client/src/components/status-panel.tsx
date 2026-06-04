import { Check, Mic, MicOff, Pause, Play, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CalibrationSuggestion } from "@/lib/voice-meter-settings";

interface StatusPanelProps {
  volumeLevel: number;
  isMicrophoneActive: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  onStopMicrophone: () => void;
  onCalibrate: () => void;
  isCalibrating: boolean;
  calibrationSuggestion: CalibrationSuggestion | null;
  onApplyCalibration: () => void;
  onDismissCalibration: () => void;
  volumeHistory: number[];
  showHistory: boolean;
  isDisplayMode: boolean;
  onExitDisplayMode: () => void;
}

function VolumeHistory({ values }: { values: number[] }) {
  const width = 220;
  const height = 44;
  const points = values
    .map((value, index) => {
      const x = values.length <= 1 ? 0 : (index / (values.length - 1)) * width;
      const y = height - (Math.min(value, 100) / 100) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className="h-12 w-full"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Recent classroom volume trend"
    >
      <rect width={width} height={height} rx="6" fill="rgba(15,23,42,0.7)" />
      <polyline
        points={points}
        fill="none"
        stroke="rgb(56,189,248)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}

export default function StatusPanel({
  volumeLevel,
  isMicrophoneActive,
  isPaused,
  onTogglePause,
  onStopMicrophone,
  onCalibrate,
  isCalibrating,
  calibrationSuggestion,
  onApplyCalibration,
  onDismissCalibration,
  volumeHistory,
  showHistory,
  isDisplayMode,
  onExitDisplayMode,
}: StatusPanelProps) {
  if (isDisplayMode) {
    return (
      <div className="glass-morphism rounded-2xl p-4 max-w-sm">
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${
              isMicrophoneActive ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm font-medium text-white">
            {isMicrophoneActive ? "Microphone Active" : "Microphone Stopped"}
          </span>
          <span className="ml-auto text-2xl font-bold text-white">
            {Math.round(volumeLevel)}%
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-300">
          Display mode hides teacher controls. Press Esc or use Exit.
        </p>
        <Button
          onClick={onExitDisplayMode}
          size="sm"
          variant="secondary"
          className="mt-3 h-8 w-full text-xs"
        >
          Exit Display Mode
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-morphism max-w-md rounded-2xl p-4">
      <div className="mb-3 flex items-center gap-3">
        <div
          className={`h-3 w-3 rounded-full ${
            isMicrophoneActive ? "bg-green-500" : "animate-pulse bg-red-500"
          }`}
        />
        <span className="text-sm font-medium text-white">
          {isMicrophoneActive ? "Microphone Active" : "Microphone Inactive"}
        </span>
        {isMicrophoneActive ? (
          <Mic className="h-4 w-4 text-green-400" />
        ) : (
          <MicOff className="h-4 w-4 text-red-400" />
        )}
      </div>

      <div className="mb-3">
        <div className="mb-1 flex justify-between text-xs text-slate-300">
          <span>Volume Level</span>
          <span>{Math.round(volumeLevel)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-700">
          <div
            className="volume-bar h-2 rounded-full transition-all duration-100"
            style={{ width: `${Math.min(volumeLevel, 100)}%` }}
          />
        </div>
      </div>

      {showHistory && volumeHistory.length > 1 && (
        <div className="mb-3">
          <div className="mb-1 text-xs text-slate-300">Recent trend</div>
          <VolumeHistory values={volumeHistory} />
        </div>
      )}

      <div className="mb-3 flex gap-2">
        <Button
          onClick={onTogglePause}
          size="sm"
          variant={isPaused ? "default" : "secondary"}
          className="h-8 flex-1 text-xs"
        >
          {isPaused ? (
            <>
              <Play className="mr-1 h-3 w-3" />
              Resume Visuals
            </>
          ) : (
            <>
              <Pause className="mr-1 h-3 w-3" />
              Pause Visuals
            </>
          )}
        </Button>

        <Button
          onClick={onStopMicrophone}
          size="sm"
          variant="destructive"
          className="h-8 text-xs"
        >
          <Square className="mr-1 h-3 w-3" />
          Stop Mic
        </Button>
      </div>

      <Button
        onClick={onCalibrate}
        disabled={isCalibrating}
        size="sm"
        variant="outline"
        className="h-8 w-full text-xs"
      >
        {isCalibrating ? "Listening for room baseline..." : "Calibrate Room"}
      </Button>

      {calibrationSuggestion && (
        <div className="mt-3 rounded-xl border border-cyan-400/40 bg-cyan-500/15 p-3">
          <p className="text-xs font-medium text-cyan-100">
            Suggested threshold: {calibrationSuggestion.recommendedThreshold}%
          </p>
          <p className="mt-1 text-xs text-slate-300">
            Room baseline averaged {calibrationSuggestion.averageNoise}%.
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              onClick={onApplyCalibration}
              size="sm"
              className="h-8 flex-1 text-xs"
            >
              <Check className="mr-1 h-3 w-3" />
              Apply
            </Button>
            <Button
              onClick={onDismissCalibration}
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-white"
            >
              <X className="mr-1 h-3 w-3" />
              Keep Current
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
