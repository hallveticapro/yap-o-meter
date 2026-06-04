import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class MockAudioContext {
  static instances: MockAudioContext[] = [];

  state: AudioContextState = "suspended";
  currentTime = 0;
  sampleRate = 44_100;
  destination = {};
  close = vi.fn(async () => {
    this.state = "closed";
  });
  resume = vi.fn(async () => {
    this.state = "running";
  });
  createOscillator = vi.fn(() => ({
    connect: vi.fn(),
    frequency: { value: 0 },
    start: vi.fn(),
    stop: vi.fn(),
    type: "sine",
  }));
  createGain = vi.fn(() => ({
    connect: vi.fn(),
    gain: {
      exponentialRampToValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      setValueAtTime: vi.fn(),
    },
  }));
  createBuffer = vi.fn((_channels: number, length: number) => ({
    getChannelData: vi.fn(() => new Float32Array(length)),
  }));
  createBufferSource = vi.fn(() => ({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));
  createBiquadFilter = vi.fn(() => ({
    connect: vi.fn(),
    frequency: { value: 0 },
    type: "highpass",
  }));

  constructor() {
    MockAudioContext.instances.push(this);
  }
}

describe("audio alerts", () => {
  beforeEach(() => {
    vi.resetModules();
    MockAudioContext.instances = [];
    vi.stubGlobal("AudioContext", MockAudioContext);
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("primes a shared alert audio context from a user action", async () => {
    const { closeAlertAudio, primeAlertAudio } = await import("./audio-alerts");

    expect(primeAlertAudio()).toBe(true);

    const audioContext = MockAudioContext.instances[0];
    expect(audioContext.resume).toHaveBeenCalledTimes(1);

    await closeAlertAudio();
    expect(audioContext.close).toHaveBeenCalledTimes(1);
  });

  it("reuses the primed context when playing threshold alerts", async () => {
    const { closeAlertAudio, playAlert, primeAlertAudio } = await import(
      "./audio-alerts"
    );

    primeAlertAudio();
    const audioContext = MockAudioContext.instances[0];

    playAlert("ding", 50);

    expect(MockAudioContext.instances).toHaveLength(1);
    expect(audioContext.createOscillator).toHaveBeenCalledTimes(3);

    await closeAlertAudio();
  });

  it("waits for a suspended context before scheduling alert tones", async () => {
    const { closeAlertAudio, playAlert } = await import("./audio-alerts");

    playAlert("ding", 50);

    const audioContext = MockAudioContext.instances[0];
    expect(audioContext.resume).toHaveBeenCalledTimes(1);
    expect(audioContext.createOscillator).not.toHaveBeenCalled();

    await Promise.resolve();

    expect(audioContext.createOscillator).toHaveBeenCalledTimes(3);

    await closeAlertAudio();
  });
});
