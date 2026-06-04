import { describe, expect, it, vi } from "vitest";
import {
  CLASSROOM_PRESETS,
  DEFAULT_SETTINGS,
  applyPreset,
  createRoomProfile,
  recommendCalibrationSettings,
  sanitizeSettings,
} from "./voice-meter-settings";

describe("voice meter settings", () => {
  it("sanitizes persisted settings with defaults and clamps numeric values", () => {
    const settings = sanitizeSettings({
      threshold: 200,
      alertVolume: -1,
      sensitivity: 99,
    });

    expect(settings.theme).toBe(DEFAULT_SETTINGS.theme);
    expect(settings.threshold).toBe(100);
    expect(settings.alertVolume).toBe(0);
    expect(settings.sensitivity).toBe(10);
  });

  it("migrates older low-stimulation settings into reduced motion", () => {
    const settings = sanitizeSettings({
      reducedMotion: false,
      lowStimulation: true,
    });

    expect(settings.reducedMotion).toBe(true);
    expect(settings).not.toHaveProperty("lowStimulation");
  });

  it("applies classroom presets without changing unrelated display settings", () => {
    const preset = CLASSROOM_PRESETS.find((item) => item.id === "silent");
    expect(preset).toBeDefined();

    const settings = applyPreset(
      { ...DEFAULT_SETTINGS, reducedMotion: true },
      preset!,
    );

    expect(settings.threshold).toBe(preset!.threshold);
    expect(settings.sensitivity).toBe(preset!.sensitivity);
    expect(settings.reducedMotion).toBe(true);
  });

  it("recommends a safer threshold from room baseline samples", () => {
    expect(
      recommendCalibrationSettings(20, DEFAULT_SETTINGS).recommendedThreshold,
    ).toBe(45);
    expect(
      recommendCalibrationSettings(100, DEFAULT_SETTINGS).recommendedThreshold,
    ).toBe(88);
  });

  it("creates local room profiles without exposing audio data", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("profile-id");

    const profile = createRoomProfile("Room 12", DEFAULT_SETTINGS);

    expect(profile.id).toBe("profile-id");
    expect(profile.name).toBe("Room 12");
    expect(profile.settings).toEqual(DEFAULT_SETTINGS);
    expect(profile).not.toHaveProperty("volumeHistory");
  });
});
