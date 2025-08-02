import { useRef, useEffect, useCallback } from "react";
import { 
  BouncingBallsTheme,
  HappyFacesTheme,
  StarsTheme,
  HeartsTheme,
  GeometricTheme,
  ScienceTheme,
  MathTheme,
  ReadingTheme,
  SpringTheme,
  SummerTheme,
  AutumnTheme,
  WinterTheme,
  type Theme 
} from "@/lib/audio-themes";

interface CanvasVisualizerProps {
  theme: string;
  volumeLevel: number;
  threshold: number;
  showThreshold: boolean;
  onThresholdCrossed?: () => void;
  isPaused?: boolean;
}

export default function CanvasVisualizer({ theme, volumeLevel, threshold, showThreshold, onThresholdCrossed, isPaused = false }: CanvasVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const themeInstanceRef = useRef<Theme | null>(null);

  // Initialize theme
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dispose previous theme
    if (themeInstanceRef.current) {
      themeInstanceRef.current.dispose();
    }

    // Create new theme instance based on theme type
    switch (theme) {
      case 'faces':
        themeInstanceRef.current = new HappyFacesTheme(ctx, onThresholdCrossed);
        break;
      case 'stars':
        themeInstanceRef.current = new StarsTheme(ctx, onThresholdCrossed);
        break;
      case 'hearts':
        themeInstanceRef.current = new HeartsTheme(ctx, onThresholdCrossed);
        break;
      case 'geometric':
        themeInstanceRef.current = new GeometricTheme(ctx, onThresholdCrossed);
        break;
      case 'science':
        themeInstanceRef.current = new ScienceTheme(ctx, onThresholdCrossed);
        break;
      case 'math':
        themeInstanceRef.current = new MathTheme(ctx, onThresholdCrossed);
        break;
      case 'reading':
        themeInstanceRef.current = new ReadingTheme(ctx, onThresholdCrossed);
        break;
      case 'spring':
        themeInstanceRef.current = new SpringTheme(ctx, onThresholdCrossed);
        break;
      case 'summer':
        themeInstanceRef.current = new SummerTheme(ctx, onThresholdCrossed);
        break;
      case 'autumn':
        themeInstanceRef.current = new AutumnTheme(ctx, onThresholdCrossed);
        break;
      case 'winter':
        themeInstanceRef.current = new WinterTheme(ctx, onThresholdCrossed);
        break;
      default:
        themeInstanceRef.current = new BouncingBallsTheme(ctx, onThresholdCrossed);
        break;
    }

    if (themeInstanceRef.current) {
      themeInstanceRef.current.init(window.innerWidth, window.innerHeight);
    }
  }, [theme]);

  // Update callback when it changes
  useEffect(() => {
    if (themeInstanceRef.current && 'updateCallback' in themeInstanceRef.current) {
      (themeInstanceRef.current as any).updateCallback(onThresholdCrossed);
    }
  }, [onThresholdCrossed]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      if (themeInstanceRef.current) {
        themeInstanceRef.current.resize(window.innerWidth, window.innerHeight);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (themeInstanceRef.current) {
        // Only update physics when not paused
        if (!isPaused) {
          themeInstanceRef.current.update(volumeLevel, threshold);
        }
        themeInstanceRef.current.draw();
      }

      // Draw threshold line
      if (showThreshold) {
        const thresholdY = (window.innerHeight * (100 - threshold)) / 100;
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

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [volumeLevel, threshold, showThreshold, isPaused]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (themeInstanceRef.current) {
        themeInstanceRef.current.dispose();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Handle click/touch interactions
  const handleClick = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !themeInstanceRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Explode particles away from click point
    if ('explode' in themeInstanceRef.current) {
      (themeInstanceRef.current as any).explode(x, y);
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-pointer"
      onClick={handleClick}
      onTouchStart={handleClick}
      style={{ display: "block" }}
    />
  );
}
