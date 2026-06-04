import { Mic, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MicrophoneError } from "@/hooks/use-microphone";

interface PermissionOverlayProps {
  onRequestPermission: () => Promise<boolean>;
  status: string;
  error: MicrophoneError | null;
}

export default function PermissionOverlay({
  onRequestPermission,
  status,
  error,
}: PermissionOverlayProps) {
  const isStarting = status === "starting";
  const isUnsupported = status === "unsupported";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="glass-morphism mx-4 max-w-md rounded-3xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600">
          <Mic className="h-8 w-8 text-white" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-white">
          Start Classroom Voice Meter
        </h3>
        <p className="mb-5 text-sm text-slate-300">
          Start the microphone when you are ready for local classroom volume
          feedback.
        </p>

        <div className="mb-5 rounded-2xl border border-emerald-400/30 bg-emerald-500/15 p-4 text-left">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-100">
            <ShieldCheck className="h-4 w-4" />
            Privacy
          </div>
          <p className="text-xs leading-5 text-slate-200">
            Raw audio is analyzed in this browser only. Yap-o-Meter does not
            record, store, upload, or transmit classroom audio.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/40 bg-red-500/15 p-4 text-left">
            <p className="text-sm font-medium text-red-100">{error.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-200">
              {error.message}
            </p>
          </div>
        )}

        <Button
          onClick={() => void onRequestPermission()}
          disabled={isStarting || isUnsupported}
          className="glass-button w-full rounded-xl px-6 py-3 font-medium text-white transition-all hover:bg-white/30"
        >
          <Mic className="mr-2 h-5 w-5" />
          {isStarting ? "Starting..." : "Start Microphone"}
        </Button>

        <p className="mt-4 text-xs text-slate-400">
          Works best in Chrome, Edge, Safari, and modern Chromebook browsers
          over HTTPS.
        </p>
      </div>
    </div>
  );
}
