import { useCallback, useEffect, useRef } from "react";
import {
  BouncingBallsTheme,
  FallTheme,
  GeometricTheme,
  HappyFacesTheme,
  HeartsTheme,
  MathTheme,
  ReadingTheme,
  ScienceTheme,
  SpringTheme,
  StarsTheme,
  SummerTheme,
  WinterTheme,
  type Theme,
} from "@/lib/audio-themes";

interface CanvasVisualizerProps {
  theme: string;
  volumeLevel: number;
  threshold: number;
  showThreshold: boolean;
  onThresholdCrossed?: () => void;
  isPaused?: boolean;
  reducedMotion?: boolean;
  lowStimulation?: boolean;
  disableInteractions?: boolean;
}

function drawReducedMotionMeter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  volumeLevel: number,
  threshold: number,
  showThreshold: boolean,
) {
  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "rgba(15, 23, 42, 1)");
  background.addColorStop(1, "rgba(30, 41, 59, 1)");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const meterWidth = Math.min(width * 0.72, 720);
  const meterHeight = Math.max(32, Math.min(height * 0.08, 56));
  const meterX = (width - meterWidth) / 2;
  const meterY = height / 2 - meterHeight / 2;
  const fillWidth = (meterWidth * Math.min(volumeLevel, 100)) / 100;

  ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(meterX, meterY, meterWidth, meterHeight, meterHeight / 2);
  ctx.fill();
  ctx.stroke();

  const fill = ctx.createLinearGradient(meterX, 0, meterX + meterWidth, 0);
  fill.addColorStop(0, "#22c55e");
  fill.addColorStop(0.55, "#38bdf8");
  fill.addColorStop(1, "#ef4444");
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(meterX, meterY, fillWidth, meterHeight, meterHeight / 2);
  ctx.fill();

  if (showThreshold) {
    const thresholdX = meterX + (meterWidth * threshold) / 100;
    ctx.strokeStyle = "rgba(248, 113, 113, 0.95)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(thresholdX, meterY - 16);
    ctx.lineTo(thresholdX, meterY + meterHeight + 16);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.font = "700 48px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.round(volumeLevel)}%`, width / 2, meterY - 40);

  ctx.font = "500 18px system-ui, sans-serif";
  ctx.fillStyle = "rgba(226, 232, 240, 0.85)";
  ctx.fillText("Reduced-motion display", width / 2, meterY + meterHeight + 48);
}

function createTheme(
  theme: string,
  ctx: CanvasRenderingContext2D,
  onThresholdCrossed?: () => void,
) {
  switch (theme) {
    case "faces":
      return new HappyFacesTheme(ctx, onThresholdCrossed);
    case "stars":
      return new StarsTheme(ctx, onThresholdCrossed);
    case "hearts":
      return new HeartsTheme(ctx, onThresholdCrossed);
    case "geometric":
      return new GeometricTheme(ctx, onThresholdCrossed);
    case "science":
      return new ScienceTheme(ctx, onThresholdCrossed);
    case "math":
      return new MathTheme(ctx, onThresholdCrossed);
    case "reading":
      return new ReadingTheme(ctx, onThresholdCrossed);
    case "spring":
      return new SpringTheme(ctx, onThresholdCrossed);
    case "summer":
      return new SummerTheme(ctx, onThresholdCrossed);
    case "fall":
      return new FallTheme(ctx, onThresholdCrossed);
    case "winter":
      return new WinterTheme(ctx, onThresholdCrossed);
    default:
      return new BouncingBallsTheme(ctx, onThresholdCrossed);
  }
}

export default function CanvasVisualizer({
  theme,
  volumeLevel,
  threshold,
  showThreshold,
  onThresholdCrossed,
  isPaused = false,
  reducedMotion = false,
  lowStimulation = false,
  disableInteractions = false,
}: CanvasVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const themeInstanceRef = useRef<Theme | null>(null);
  const latestValuesRef = useRef({
    volumeLevel,
    threshold,
    showThreshold,
    isPaused,
    reducedMotion,
    lowStimulation,
  });

  useEffect(() => {
    latestValuesRef.current = {
      volumeLevel,
      threshold,
      showThreshold,
      isPaused,
      reducedMotion,
      lowStimulation,
    };
  }, [volumeLevel, threshold, showThreshold, isPaused, reducedMotion, lowStimulation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    themeInstanceRef.current?.dispose();
    themeInstanceRef.current = createTheme(theme, ctx, onThresholdCrossed);
    themeInstanceRef.current.init(window.innerWidth, window.innerHeight);
  }, [theme, onThresholdCrossed]);

  useEffect(() => {
    themeInstanceRef.current?.updateCallback(onThresholdCrossed);
  }, [onThresholdCrossed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      themeInstanceRef.current?.resize(window.innerWidth, window.innerHeight);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      const latest = latestValuesRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (latest.reducedMotion || latest.lowStimulation) {
        drawReducedMotionMeter(
          ctx,
          window.innerWidth,
          window.innerHeight,
          latest.volumeLevel,
          latest.threshold,
          latest.showThreshold,
        );
      } else if (themeInstanceRef.current) {
        if (!latest.isPaused) {
          themeInstanceRef.current.update(latest.volumeLevel, latest.threshold);
        }
        themeInstanceRef.current.draw();

        if (latest.showThreshold) {
          const thresholdY =
            (window.innerHeight * (100 - latest.threshold)) / 100;
          ctx.save();
          ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
          ctx.lineWidth = 2;
          ctx.shadowColor = "rgba(239, 68, 68, 0.5)";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(0, thresholdY);
          ctx.lineTo(window.innerWidth, thresholdY);
          ctx.stroke();
          ctx.restore();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      themeInstanceRef.current?.dispose();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const triggerExplosion = useCallback((x: number, y: number) => {
    if (!themeInstanceRef.current || disableInteractions) return;
    themeInstanceRef.current.explode(x, y);
  }, [disableInteractions]);

  const handleClick = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clientX =
        "touches" in event ? event.touches[0].clientX : event.clientX;
      const clientY =
        "touches" in event ? event.touches[0].clientY : event.clientY;

      triggerExplosion(clientX - rect.left, clientY - rect.top);
    },
    [triggerExplosion],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      triggerExplosion(window.innerWidth / 2, window.innerHeight / 2);
    },
    [triggerExplosion],
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onTouchStart={handleClick}
      tabIndex={disableInteractions ? -1 : 0}
      role={disableInteractions ? "img" : "button"}
      aria-label={
        disableInteractions
          ? "Classroom volume visualizer"
          : "Classroom volume visualizer. Press Enter to create a particle burst."
      }
      style={{ display: "block" }}
    />
  );
}
