import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMicrophone } from "./use-microphone";

class MockAudioContext {
  state: AudioContextState = "running";
  destination = {};
  close = vi.fn(async () => {
    this.state = "closed";
  });
  resume = vi.fn(async () => {
    this.state = "running";
  });
  createAnalyser = vi.fn(() => ({
    fftSize: 0,
    smoothingTimeConstant: 0,
    frequencyBinCount: 4,
    getByteFrequencyData: vi.fn(),
    disconnect: vi.fn(),
  }));
  createMediaStreamSource = vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));
}

function Harness() {
  const microphone = useMicrophone(5, 70);

  return (
    <div>
      <div data-testid="status">{microphone.status}</div>
      <button onClick={() => void microphone.requestPermission()}>start</button>
      <button onClick={() => void microphone.stopMicrophone()}>stop</button>
    </div>
  );
}

describe("useMicrophone", () => {
  const stopTrack = vi.fn();
  const getUserMedia = vi.fn();
  let audioContext: MockAudioContext;

  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    getUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: stopTrack }],
    });

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });

    audioContext = new MockAudioContext();
    vi.stubGlobal("AudioContext", vi.fn(() => audioContext));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    stopTrack.mockReset();
    getUserMedia.mockReset();
  });

  it("does not start microphone access on mount", () => {
    render(<Harness />);

    expect(screen.getByTestId("status")).toHaveTextContent("idle");
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it("stops media tracks and closes AudioContext when stopped", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "start" }));
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });

    await user.click(screen.getByRole("button", { name: "stop" }));

    expect(stopTrack).toHaveBeenCalled();
    expect(audioContext.close).toHaveBeenCalled();
    expect(screen.getByTestId("status")).toHaveTextContent("stopped");
  });

  it("cleans up microphone resources on unmount", async () => {
    const user = userEvent.setup();
    const rendered = render(<Harness />);

    await user.click(screen.getByRole("button", { name: "start" }));
    await act(async () => {
      rendered.unmount();
    });

    expect(stopTrack).toHaveBeenCalled();
    expect(audioContext.close).toHaveBeenCalled();
  });
});
