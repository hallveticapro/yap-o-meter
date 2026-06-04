import { describe, expect, it } from "vitest";
import { calculateVolumeLevel } from "./audio-level";

describe("calculateVolumeLevel", () => {
  it("returns zero for empty data", () => {
    expect(calculateVolumeLevel(new Uint8Array(), 5)).toBe(0);
  });

  it("scales frequency data into a clamped percentage", () => {
    const data = new Uint8Array([255, 255, 255, 255]);
    expect(calculateVolumeLevel(data, 5)).toBe(100);
  });

  it("applies lower sensitivity without returning negative values", () => {
    const data = new Uint8Array([20, 20, 20, 20]);
    expect(calculateVolumeLevel(data, 1)).toBeGreaterThanOrEqual(0);
    expect(calculateVolumeLevel(data, 1)).toBeLessThan(
      calculateVolumeLevel(data, 5),
    );
  });
});
