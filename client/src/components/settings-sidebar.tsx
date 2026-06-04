import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  ChevronDown,
  Circle,
  Download,
  Monitor,
  Save,
  Settings as SettingsIcon,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faInstagram,
  faThreads,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import { faCoffee } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CLASSROOM_PRESETS,
  type ClassroomPreset,
  type RoomProfile,
  type VoiceMeterSettings,
} from "@/lib/voice-meter-settings";

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceMeterSettings;
  onSettingsChange: (settings: Partial<VoiceMeterSettings>) => void;
  onApplyPreset: (preset: ClassroomPreset) => void;
  onCalibrate: () => void;
  isCalibrating: boolean;
  isDisplayMode: boolean;
  onToggleDisplayMode: () => void;
  roomProfiles: RoomProfile[];
  onSaveProfile: (name: string) => void;
  onApplyProfile: (profileId: string) => void;
  onDeleteProfile: (profileId: string) => void;
  onExportSettings: () => void;
  onImportSettings: (file: File) => void;
}

const themeGroups = [
  {
    name: "General",
    themes: [
      {
        id: "balls",
        name: "Bouncing Balls",
        icon: Circle,
        emoji: "⚪",
        color: "text-cyan-400",
        description: "Colorful balls that bounce with volume",
      },
      {
        id: "faces",
        name: "Emojis",
        icon: Sparkles,
        emoji: "😊",
        color: "text-yellow-400",
        description: "Fun emoji particles bouncing around",
      },
      {
        id: "stars",
        name: "Stars",
        icon: Sparkles,
        emoji: "⭐",
        color: "text-purple-400",
        description: "Twinkling stars that dance to sound",
      },
      {
        id: "hearts",
        name: "Hearts",
        icon: Sparkles,
        emoji: "❤️",
        color: "text-pink-400",
        description: "Heart particles bouncing with joy",
      },
      {
        id: "geometric",
        name: "Geometric Shapes",
        icon: Circle,
        emoji: "🔵",
        color: "text-green-400",
        description: "Geometric shapes in motion",
      },
    ],
  },
  {
    name: "School",
    themes: [
      {
        id: "science",
        name: "Science Lab",
        icon: Sparkles,
        emoji: "🧪",
        color: "text-blue-400",
        description: "Science emojis for STEM learning",
      },
      {
        id: "math",
        name: "Math Class",
        icon: Sparkles,
        emoji: "🔢",
        color: "text-orange-400",
        description: "Math symbols and numbers",
      },
      {
        id: "reading",
        name: "Reading Time",
        icon: Sparkles,
        emoji: "📚",
        color: "text-indigo-400",
        description: "Books, pencils, and reading elements",
      },
    ],
  },
  {
    name: "Seasons",
    themes: [
      {
        id: "spring",
        name: "Spring Garden",
        icon: Sparkles,
        emoji: "🌸",
        color: "text-green-500",
        description: "Flowers and spring elements",
      },
      {
        id: "summer",
        name: "Summer Beach",
        icon: Sparkles,
        emoji: "☀️",
        color: "text-orange-500",
        description: "Sun, waves, and summer fun",
      },
      {
        id: "fall",
        name: "Fall Leaves",
        icon: Sparkles,
        emoji: "🍂",
        color: "text-amber-600",
        description: "Fall leaves and harvest themes",
      },
      {
        id: "winter",
        name: "Winter Wonderland",
        icon: Sparkles,
        emoji: "❄️",
        color: "text-blue-300",
        description: "Snowflakes and winter visuals",
      },
    ],
  },
];

function Section({
  id,
  title,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: (section: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="mb-6">
      <Collapsible open={isOpen} onOpenChange={() => onToggle(id)}>
        <CollapsibleTrigger className="glass-button flex w-full items-center justify-between rounded-xl p-3 text-white transition-all hover:bg-white/25">
          <span className="font-medium">{title}</span>
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="space-y-4 p-2">{children}</div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default function SettingsSidebar({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onApplyPreset,
  onCalibrate,
  isCalibrating,
  isDisplayMode,
  onToggleDisplayMode,
  roomProfiles,
  onSaveProfile,
  onApplyProfile,
  onDeleteProfile,
  onExportSettings,
  onImportSettings,
}: SettingsSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    mode: true,
    theme: false,
    threshold: false,
    alerts: false,
    display: false,
    calibration: false,
    profiles: false,
  });
  const [profileName, setProfileName] = useState("");
  const importInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSaveProfile = () => {
    if (!profileName.trim()) return;
    onSaveProfile(profileName);
    setProfileName("");
  };

  const handleImportFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportSettings(file);
      event.target.value = "";
    }
  };

  return (
    <div
      className={`sidebar-slide fixed right-0 top-0 z-30 h-full w-80 ${
        isOpen ? "open" : ""
      }`}
    >
      <div className="glass-morphism h-full overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Yap-o-Meter</h2>
            <p className="text-xs text-slate-400">Teacher Settings</p>
          </div>
          <Button
            aria-label="Close settings"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="glass-button rounded-lg p-2 text-white hover:text-red-400"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Section
          id="mode"
          title="Classroom Mode"
          isOpen={openSections.mode}
          onToggle={toggleSection}
        >
          <div className="space-y-2">
            {CLASSROOM_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onApplyPreset(preset)}
                className={`w-full rounded-xl p-3 text-left transition-all ${
                  settings.preset === preset.id
                    ? "border border-cyan-400 bg-cyan-500/30"
                    : "glass-button hover:bg-white/25"
                }`}
              >
                <div className="text-sm font-medium text-white">
                  {preset.name}
                </div>
                <div className="mt-1 text-xs text-slate-300">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </Section>

        <Section
          id="theme"
          title="Visual Theme"
          isOpen={openSections.theme}
          onToggle={toggleSection}
        >
          {themeGroups.map((group, groupIndex) => (
            <div
              key={group.name}
              className={groupIndex > 0 ? "border-t border-slate-600/30 pt-4" : ""}
            >
              <h4 className="mb-2 px-2 text-sm font-semibold text-slate-300">
                {group.name}
              </h4>
              <div className="space-y-2">
                {group.themes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    className={`w-full rounded-xl p-3 text-left transition-all ${
                      settings.theme === theme.id
                        ? "border border-cyan-400 bg-cyan-500/30"
                        : "glass-button hover:bg-white/25"
                    }`}
                    onClick={() =>
                      onSettingsChange({ theme: theme.id, preset: "custom" })
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-center text-lg">
                        {theme.emoji}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {theme.name}
                        </div>
                        <div className="text-xs text-slate-300">
                          {theme.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Section>

        <Section
          id="threshold"
          title="Volume Threshold"
          isOpen={openSections.threshold}
          onToggle={toggleSection}
        >
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Threshold Level
            </label>
            <Slider
              value={[settings.threshold]}
              onValueChange={(value) =>
                onSettingsChange({ threshold: value[0], preset: "custom" })
              }
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>Quiet</span>
              <span>{settings.threshold}%</span>
              <span>Loud</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Show Threshold Line</span>
            <Switch
              aria-label="Show threshold line"
              checked={settings.showThreshold}
              onCheckedChange={(checked) =>
                onSettingsChange({ showThreshold: checked })
              }
            />
          </div>
        </Section>

        <Section
          id="alerts"
          title="Audio Alerts"
          isOpen={openSections.alerts}
          onToggle={toggleSection}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Enable Alerts</span>
            <Switch
              aria-label="Enable audio alerts"
              checked={settings.enableAlerts}
              onCheckedChange={(checked) =>
                onSettingsChange({ enableAlerts: checked })
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Alert Sound
            </label>
            <Select
              value={settings.alertSound}
              onValueChange={(value) =>
                onSettingsChange({
                  alertSound: value as VoiceMeterSettings["alertSound"],
                })
              }
            >
              <SelectTrigger className="w-full border-slate-600 bg-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shush">Whisper "Shhh"</SelectItem>
                <SelectItem value="ding">Ding Ding Ding</SelectItem>
                <SelectItem value="chime">Soft Chime</SelectItem>
                <SelectItem value="bell">Bell Ring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Alert Volume
            </label>
            <Slider
              value={[settings.alertVolume]}
              onValueChange={(value) =>
                onSettingsChange({ alertVolume: value[0] })
              }
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
        </Section>

        <Section
          id="display"
          title="Display and Accessibility"
          isOpen={openSections.display}
          onToggle={toggleSection}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">
              Reduced Motion / Low-Stimulation
            </span>
            <Switch
              aria-label="Use reduced motion low-stimulation view"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) =>
                onSettingsChange({ reducedMotion: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Show Recent Trend</span>
            <Switch
              aria-label="Show recent volume trend"
              checked={settings.showHistory}
              onCheckedChange={(checked) =>
                onSettingsChange({ showHistory: checked })
              }
            />
          </div>

          <Button
            onClick={onToggleDisplayMode}
            className="glass-button w-full rounded-lg py-2 text-white hover:bg-white/25"
          >
            <Monitor className="mr-2 h-4 w-4" />
            {isDisplayMode ? "Exit Display Mode" : "Enter Display Mode"}
          </Button>
        </Section>

        <Section
          id="calibration"
          title="Microphone Settings"
          isOpen={openSections.calibration}
          onToggle={toggleSection}
        >
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Sensitivity
            </label>
            <Slider
              value={[settings.sensitivity]}
              onValueChange={(value) =>
                onSettingsChange({ sensitivity: value[0], preset: "custom" })
              }
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <Button
            onClick={onCalibrate}
            disabled={isCalibrating}
            className="glass-button w-full rounded-lg px-4 py-2 text-white transition-all hover:bg-white/25"
          >
            <SettingsIcon className="mr-2 h-4 w-4" />
            {isCalibrating ? "Listening..." : "Calibrate Room"}
          </Button>
          <p className="mt-2 text-center text-xs text-slate-400">
            Calibration suggests a safer threshold from a short local-only room
            baseline.
          </p>
        </Section>

        <Section
          id="profiles"
          title="Room Profiles"
          isOpen={openSections.profiles}
          onToggle={toggleSection}
        >
          <div className="flex gap-2">
            <Input
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              placeholder="Room profile name"
              className="border-slate-600 bg-slate-700 text-white"
            />
            <Button
              onClick={handleSaveProfile}
              size="icon"
              aria-label="Save current room profile"
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>

          {roomProfiles.length > 0 ? (
            <div className="space-y-2">
              {roomProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="rounded-xl border border-slate-600/40 bg-slate-900/40 p-3"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onApplyProfile(profile.id)}
                      className="min-w-0 flex-1 text-left text-sm font-medium text-white hover:text-cyan-200"
                    >
                      {profile.name}
                    </button>
                    <Button
                      onClick={() => onDeleteProfile(profile.id)}
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${profile.name}`}
                      className="h-7 w-7 text-slate-300 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Threshold {profile.settings.threshold}% - Sensitivity{" "}
                    {profile.settings.sensitivity}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Save local room profiles for different devices or classroom
              layouts.
            </p>
          )}

          <div className="flex gap-2">
            <Button
              onClick={onExportSettings}
              variant="secondary"
              className="h-9 flex-1 text-xs"
            >
              <Download className="mr-1 h-3 w-3" />
              Export
            </Button>
            <Button
              onClick={() => importInputRef.current?.click()}
              variant="secondary"
              className="h-9 flex-1 text-xs"
            >
              <Upload className="mr-1 h-3 w-3" />
              Import
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportFileChange}
            />
          </div>
        </Section>

        <div className="mt-auto border-t border-slate-600/30 pt-4">
          <div className="space-y-4 text-center text-xs text-slate-400">
            <div className="rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-3">
              <p className="mb-2 text-xs text-amber-200">
                Enjoying Yap-o-Meter?
              </p>
              <a
                href="https://buymeacoffee.com/hallveticapro"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white transition-colors duration-200 hover:bg-amber-500"
              >
                <FontAwesomeIcon icon={faCoffee} className="h-4 w-4" />
                Buy Me a Coffee
              </a>
            </div>

            <div className="rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-3">
              <p className="mb-3 text-xs text-blue-200">
                Follow Me on Social Media
              </p>
              <div className="flex justify-center gap-3">
                {[
                  {
                    href: "https://github.com/hallveticapro/yap-o-meter",
                    title: "View source code on GitHub",
                    icon: faGithub,
                  },
                  {
                    href: "https://www.threads.net/@hallveticapro",
                    title: "Follow @hallveticapro on Threads",
                    icon: faThreads,
                  },
                  {
                    href: "https://www.instagram.com/hallveticapro",
                    title: "Follow @hallveticapro on Instagram",
                    icon: faInstagram,
                  },
                  {
                    href: "https://www.tiktok.com/@hallveticapro",
                    title: "Follow @hallveticapro on TikTok",
                    icon: faTiktok,
                  },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-blue-600/20 p-2 text-blue-300 transition-colors duration-200 hover:bg-blue-500/30 hover:text-white"
                    title={link.title}
                  >
                    <FontAwesomeIcon icon={link.icon} className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-600/30 pt-4">
          <div className="space-y-2 text-center text-xs text-slate-400">
            <p>Made for educators by Andrew Hall</p>
            <p>© {new Date().getFullYear()} Yap-o-Meter</p>
          </div>
        </div>
      </div>
    </div>
  );
}
