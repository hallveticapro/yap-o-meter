import { useRef, useEffect } from "react";
import { 
  BouncingBallsTheme,
  HappyFacesTheme,
  type Theme 
} from "@/lib/audio-themes";

interface CanvasVisualizerProps {
  theme: string;
  volumeLevel: number;
  threshold: number;
  showThreshold: boolean;
  onThresholdCrossed?: () => void;
}

export default function CanvasVisualizer({ theme, volumeLevel, threshold, showThreshold, onThresholdCrossed }: CanvasVisualizerProps) {
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
    if (theme === 'faces') {
      themeInstanceRef.current = new HappyFacesTheme(ctx, onThresholdCrossed);
    } else {
      themeInstanceRef.current = new BouncingBallsTheme(ctx, onThresholdCrossed);
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
        themeInstanceRef.current.update(volumeLevel, threshold);
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
  }, [volumeLevel, threshold, showThreshold]);

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

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
