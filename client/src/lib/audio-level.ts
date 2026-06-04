import { clamp } from "./voice-meter-settings";

export function calculateVolumeLevel(
  frequencyData: Uint8Array,
  sensitivity: number,
): number {
  if (frequencyData.length === 0) return 0;

  let sum = 0;
  for (let i = 0; i < frequencyData.length; i++) {
    sum += frequencyData[i];
  }

  const average = sum / frequencyData.length;
  const baseVolume = (average / 255) * 100;
  const sensitivityMultiplier = Math.pow(sensitivity / 5, 1.5) * 3;

  return clamp(baseVolume * sensitivityMultiplier, 0, 100);
}
