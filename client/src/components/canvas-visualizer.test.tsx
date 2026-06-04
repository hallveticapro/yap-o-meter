import React from "react";
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CanvasVisualizer from "./canvas-visualizer";

const themeMock = vi.hoisted(() => {
  class MockTheme {
    static instances: MockTheme[] = [];

    callback?: () => void;
    dispose = vi.fn();
    draw = vi.fn();
    explode = vi.fn();
    init = vi.fn();
    resize = vi.fn();
    update = vi.fn();
    updateCallback = vi.fn();

    constructor(_ctx: CanvasRenderingContext2D, callback?: () => void) {
      this.callback = callback;
      MockTheme.instances.push(this);
    }
  }

  return { MockTheme };
});

vi.mock("@/lib/audio-themes", () => ({
  BouncingBallsTheme: themeMock.MockTheme,
  FallTheme: themeMock.MockTheme,
  GeometricTheme: themeMock.MockTheme,
  HappyFacesTheme: themeMock.MockTheme,
  HeartsTheme: themeMock.MockTheme,
  MathTheme: themeMock.MockTheme,
  ReadingTheme: themeMock.MockTheme,
  ScienceTheme: themeMock.MockTheme,
  SpringTheme: themeMock.MockTheme,
  StarsTheme: themeMock.MockTheme,
  SummerTheme: themeMock.MockTheme,
  WinterTheme: themeMock.MockTheme,
}));

const canvasContext = {
  clearRect: vi.fn(),
  setTransform: vi.fn(),
} as unknown as CanvasRenderingContext2D;

describe("CanvasVisualizer", () => {
  beforeEach(() => {
    themeMock.MockTheme.instances = [];
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      canvasContext,
    );
    vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not recreate particles when only the threshold callback changes", () => {
    const firstCallback = vi.fn();
    const secondCallback = vi.fn();

    const { rerender } = render(
      <CanvasVisualizer
        theme="balls"
        volumeLevel={0}
        threshold={70}
        showThreshold
        onThresholdCrossed={firstCallback}
      />,
    );

    expect(themeMock.MockTheme.instances).toHaveLength(1);
    const firstTheme = themeMock.MockTheme.instances[0];

    rerender(
      <CanvasVisualizer
        theme="balls"
        volumeLevel={8}
        threshold={70}
        showThreshold
        onThresholdCrossed={secondCallback}
      />,
    );

    expect(themeMock.MockTheme.instances).toHaveLength(1);
    expect(firstTheme.dispose).not.toHaveBeenCalled();

    firstTheme.callback?.();
    expect(firstCallback).not.toHaveBeenCalled();
    expect(secondCallback).toHaveBeenCalledTimes(1);
  });

  it("recreates particles when the selected theme changes", () => {
    const { rerender } = render(
      <CanvasVisualizer
        theme="balls"
        volumeLevel={0}
        threshold={70}
        showThreshold
      />,
    );

    const firstTheme = themeMock.MockTheme.instances[0];

    rerender(
      <CanvasVisualizer
        theme="faces"
        volumeLevel={0}
        threshold={70}
        showThreshold
      />,
    );

    expect(themeMock.MockTheme.instances).toHaveLength(2);
    expect(firstTheme.dispose).toHaveBeenCalledTimes(1);
  });
});
