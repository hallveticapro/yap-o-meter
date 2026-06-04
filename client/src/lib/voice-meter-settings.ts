export type AlertSound = "shush" | "ding" | "chime" | "bell";

export type ClassroomPresetId =
  | "custom"
  | "silent"
  | "partner"
  | "group"
  | "transition"
  | "indoor-recess";

export interface VoiceMeterSettings {
  theme: string;
  threshold: number;
  showThreshold: boolean;
  enableAlerts: boolean;
  alertSound: AlertSound;
  alertVolume: number;
  sensitivity: number;
  reducedMotion: boolean;
  lowStimulation: boolean;
  showHistory: boolean;
  preset: ClassroomPresetId;
}

export interface ClassroomPreset {
  id: ClassroomPresetId;
  name: string;
  description: string;
  threshold: number;
  sensitivity: number;
  enableAlerts: boolean;
}

export interface CalibrationSuggestion {
  averageNoise: number;
  recommendedThreshold: number;
  recommendedSensitivity: number;
}

export interface RoomProfile {
  id: string;
  name: string;
  settings: VoiceMeterSettings;
  updatedAt: string;
}

export const DEFAULT_SETTINGS: VoiceMeterSettings = {
  theme: "balls",
  threshold: 70,
  showThreshold: true,
  enableAlerts: true,
  alertSound: "shush",
  alertVolume: 50,
  sensitivity: 5,
  reducedMotion: false,
  lowStimulation: false,
  showHistory: true,
  preset: "custom",
};

export const CLASSROOM_PRESETS: ClassroomPreset[] = [
  {
    id: "silent",
    name: "Silent Work",
    description: "Independent reading, writing, or testing",
    threshold: 42,
    sensitivity: 6,
    enableAlerts: true,
  },
  {
    id: "partner",
    name: "Partner Talk",
    description: "Quiet two-person collaboration",
    threshold: 58,
    sensitivity: 5,
    enableAlerts: true,
  },
  {
    id: "group",
    name: "Group Work",
    description: "Small group discussion",
    threshold: 70,
    sensitivity: 5,
    enableAlerts: true,
  },
  {
    id: "transition",
    name: "Transitions",
    description: "Moving between activities",
    threshold: 82,
    sensitivity: 4,
    enableAlerts: false,
  },
  {
    id: "indoor-recess",
    name: "Indoor Recess",
    description: "Higher energy classroom time",
    threshold: 92,
    sensitivity: 3,
    enableAlerts: false,
  },
];

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function sanitizeSettings(value: Partial<VoiceMeterSettings>): VoiceMeterSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...value,
    threshold: clamp(Number(value.threshold ?? DEFAULT_SETTINGS.threshold), 0, 100),
    alertVolume: clamp(Number(value.alertVolume ?? DEFAULT_SETTINGS.alertVolume), 0, 100),
    sensitivity: clamp(Number(value.sensitivity ?? DEFAULT_SETTINGS.sensitivity), 1, 10),
    preset: value.preset ?? "custom",
  };
}

export function applyPreset(
  settings: VoiceMeterSettings,
  preset: ClassroomPreset,
): VoiceMeterSettings {
  return {
    ...settings,
    threshold: preset.threshold,
    sensitivity: preset.sensitivity,
    enableAlerts: preset.enableAlerts,
    preset: preset.id,
  };
}

export function recommendCalibrationSettings(
  averageNoise: number,
  currentSettings: Pick<VoiceMeterSettings, "threshold" | "sensitivity">,
): CalibrationSuggestion {
  const safeAverage = Number.isFinite(averageNoise) ? averageNoise : 0;
  const recommendedThreshold = Math.round(clamp(safeAverage + 25, 35, 88));
  const recommendedSensitivity =
    safeAverage > 45
      ? clamp(currentSettings.sensitivity - 1, 1, 10)
      : safeAverage < 12
        ? clamp(currentSettings.sensitivity + 1, 1, 10)
        : currentSettings.sensitivity;

  return {
    averageNoise: Math.round(safeAverage),
    recommendedThreshold,
    recommendedSensitivity,
  };
}

export function createRoomProfile(
  name: string,
  settings: VoiceMeterSettings,
): RoomProfile {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    settings: sanitizeSettings(settings),
    updatedAt: new Date().toISOString(),
  };
}

export function isRoomProfile(value: unknown): value is RoomProfile {
  if (!value || typeof value !== "object") return false;
  const maybe = value as RoomProfile;
  return (
    typeof maybe.id === "string" &&
    typeof maybe.name === "string" &&
    typeof maybe.updatedAt === "string" &&
    Boolean(maybe.settings)
  );
}
