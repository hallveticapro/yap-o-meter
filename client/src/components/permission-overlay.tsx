import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PermissionOverlayProps {
  onRequestPermission: () => void;
}

export default function PermissionOverlay({ onRequestPermission }: PermissionOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-morphism rounded-3xl p-8 max-w-md mx-4 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mic className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Microphone Access Required</h3>
        <p className="text-slate-300 text-sm mb-6">
          This app needs microphone access to monitor classroom volume levels and provide visual feedback.
        </p>
        <Button
          onClick={onRequestPermission}
          className="glass-button w-full rounded-xl py-3 px-6 text-white font-medium hover:bg-white/30 transition-all"
        >
          <Mic className="w-5 h-5 mr-2" />
          Allow Microphone Access
        </Button>
      </div>
    </div>
  );
}
