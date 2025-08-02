export interface Theme {
  init(width: number, height: number): void;
  update(volumeLevel: number, threshold?: number): void;
  draw(): void;
  resize(width: number, height: number): void;
  updateCallback(callback?: () => void): void;
  dispose(): void;
  explode(mouseX: number, mouseY: number): void;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  color: string;
  crossedThreshold: boolean;
}

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  opacity: number;
  crossedThreshold: boolean;
}

interface Heart {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  opacity: number;
  color: string;
  crossedThreshold: boolean;
}

interface Shape {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  rotation: number;
  rotationSpeed: number;
  type: 'triangle' | 'square' | 'pentagon' | 'hexagon';
  crossedThreshold: boolean;
  opacity: number;
  color: string;
}

interface Emojiface {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  crossedThreshold: boolean;
  emoji: string;
}

// Base class for all emoji themes with shared physics
abstract class BaseEmojiTheme implements Theme {
  protected ctx: CanvasRenderingContext2D;
  protected faces: Emojiface[] = [];
  protected width = 0;
  protected height = 0;
  protected volumeLevel = 0;
  protected onThresholdCrossed?: () => void;
  private emojiCache: Map<string, HTMLCanvasElement> = new Map();

  constructor(ctx: CanvasRenderingContext2D, onThresholdCrossed?: () => void) {
    this.ctx = ctx;
    this.onThresholdCrossed = onThresholdCrossed;
  }

  // Abstract method for each theme to provide their emoji list
  protected abstract getEmojis(): string[];

  // Optional method for themes to draw custom backgrounds
  protected drawBackground(): void {
    // Default: no background
  }

  // Pre-render emoji to offscreen canvas for caching
  private getCachedEmoji(emoji: string, size: number): HTMLCanvasElement {
    const key = `${emoji}_${Math.round(size)}`;
    
    if (!this.emojiCache.has(key)) {
      const canvas = document.createElement('canvas');
      const padding = 4;
      canvas.width = size + padding * 2;
      canvas.height = size + padding * 2;
      const ctx = canvas.getContext('2d')!;
      
      ctx.font = `${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, canvas.width / 2, canvas.height / 2);
      
      this.emojiCache.set(key, canvas);
    }
    
    return this.emojiCache.get(key)!;
  }

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.faces = [];

    const emojis = this.getEmojis();
    for (let i = 0; i < 120; i++) {
      const baseSize = Math.random() * 30 + 30; // Dynamic size from 30-60px
      const x = Math.random() * (width - baseSize) + baseSize / 2;
      this.faces.push({
        x: x,
        y: Math.random() * (height * 0.6) + baseSize / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2,
        size: baseSize,
        baseSize: baseSize,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        crossedThreshold: false,

      });
    }
  }

  update(volumeLevel: number, threshold: number = 70): void {
    this.volumeLevel = volumeLevel;
    const thresholdY = (this.height * (100 - threshold)) / 100;

    for (const face of this.faces) {
      const prevY = face.y;
      face.x += face.vx;
      face.y += face.vy;

      if (prevY >= thresholdY && face.y < thresholdY && !face.crossedThreshold) {
        face.crossedThreshold = true;
        if (this.onThresholdCrossed) this.onThresholdCrossed();
      } else if (face.y >= thresholdY) {
        face.crossedThreshold = false;
      }

      if (face.x - face.size/2 < 0 || face.x + face.size/2 > this.width) {
        face.vx *= -0.8;
        face.x = Math.max(face.size/2, Math.min(this.width - face.size/2, face.x));
      }

      const floorY = this.height - face.size/2;
      if (face.y >= floorY) {
        face.y = floorY;
        if (volumeLevel > 5 && Math.random() < 0.15) {
          const maxBounceVelocity = Math.sqrt(2 * 0.6 * this.height);
          face.vy = -(volumeLevel / 100) * maxBounceVelocity;
        } else {
          face.vy = 0;
        }
        if (Math.abs(face.vx) < 1) {
          face.vx += (Math.random() - 0.5) * 2;
        }
      } else {
        face.vy += 0.6;
      }

      if (face.y - face.size/2 < 0) {
        face.vy = Math.abs(face.vy) * 0.8;
        face.y = face.size/2;
      }

      face.vx *= 0.99;
      face.vy *= 0.995;
      face.size = face.baseSize;

      if (volumeLevel > 20) {
        face.vx += (Math.random() - 0.5) * (volumeLevel / 150);
      }
    }
  }

  draw(): void {
    // Draw background first (if theme provides one)
    this.drawBackground();
    
    // Use cached emoji images for performance with dynamic sizing
    for (const face of this.faces) {
      const cachedEmoji = this.getCachedEmoji(face.emoji, face.size);
      // Draw centered at particle position
      this.ctx.drawImage(
        cachedEmoji, 
        face.x - face.size / 2 - 2, 
        face.y - face.size / 2 - 2
      );
    }
  }

  resize(width: number, height: number): void {
    const oldWidth = this.width;
    this.width = width;
    this.height = height;
    if (oldWidth === 0 || Math.abs(width - oldWidth) > 100) {
      for (let i = 0; i < this.faces.length; i++) {
        const face = this.faces[i];
        face.x = Math.random() * (this.width - face.baseSize) + face.baseSize / 2;
        face.y = Math.min(face.y, this.height - face.baseSize / 2);
      }
    }
  }

  explode(mouseX: number, mouseY: number): void {
    for (const face of this.faces) {
      const dx = face.x - mouseX;
      const dy = face.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 200) { // Explosion radius
        const force = Math.max(0, (200 - distance) / 200) * 20; // Force decreases with distance
        const angle = Math.atan2(dy, dx);
        face.vx += Math.cos(angle) * force;
        face.vy += Math.sin(angle) * force;
      }
    }
  }

  updateCallback(callback?: () => void): void {
    this.onThresholdCrossed = callback;
  }

  dispose(): void {
    this.faces = [];
    this.emojiCache.clear();
  }
}

// Bouncing Balls Theme
export class BouncingBallsTheme implements Theme {
  private ctx: CanvasRenderingContext2D;
  private balls: Ball[] = [];
  private width = 0;
  private height = 0;
  private onThresholdCrossed?: () => void;

  constructor(ctx: CanvasRenderingContext2D, onThresholdCrossed?: () => void) {
    this.ctx = ctx;
    this.onThresholdCrossed = onThresholdCrossed;
  }

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.balls = [];

    for (let i = 0; i < 120; i++) {
      const baseSize = Math.random() * 35 + 25; // Larger sizes to match emojis (25-60px)
      const x = Math.random() * (width - baseSize) + baseSize / 2;
      const hue = Math.random() * 360;
      this.balls.push({
        x: x,
        y: Math.random() * (height * 0.6) + baseSize / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2,
        size: baseSize,
        baseSize: baseSize,
        color: `hsl(${hue}, 70%, 60%)`,
        crossedThreshold: false,
      });
    }
  }

  update(volumeLevel: number, threshold: number = 70): void {
    const thresholdY = (this.height * (100 - threshold)) / 100;

    for (const ball of this.balls) {
      const prevY = ball.y;
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (prevY >= thresholdY && ball.y < thresholdY && !ball.crossedThreshold) {
        ball.crossedThreshold = true;
        if (this.onThresholdCrossed) this.onThresholdCrossed();
      } else if (ball.y >= thresholdY) {
        ball.crossedThreshold = false;
      }

      if (ball.x - ball.size/2 < 0 || ball.x + ball.size/2 > this.width) {
        ball.vx *= -0.8;
        ball.x = Math.max(ball.size/2, Math.min(this.width - ball.size/2, ball.x));
      }

      const floorY = this.height - ball.size/2;
      if (ball.y >= floorY) {
        ball.y = floorY;
        if (volumeLevel > 5 && Math.random() < 0.15) {
          const maxBounceVelocity = Math.sqrt(2 * 0.6 * this.height);
          ball.vy = -(volumeLevel / 100) * maxBounceVelocity;
        } else {
          ball.vy = 0;
        }
        if (Math.abs(ball.vx) < 1) {
          ball.vx += (Math.random() - 0.5) * 2;
        }
      } else {
        ball.vy += 0.6;
      }

      if (ball.y - ball.size/2 < 0) {
        ball.vy = Math.abs(ball.vy) * 0.8;
        ball.y = ball.size/2;
      }

      ball.vx *= 0.99;
      ball.vy *= 0.995;
      ball.size = ball.baseSize + Math.sin(Date.now() * 0.01 + ball.x * 0.01) * 3;

      if (volumeLevel > 20) {
        ball.vx += (Math.random() - 0.5) * (volumeLevel / 150);
      }
    }
  }

  draw(): void {
    for (const ball of this.balls) {
      this.ctx.beginPath();
      this.ctx.arc(ball.x, ball.y, ball.size/2, 0, Math.PI * 2);
      this.ctx.fillStyle = ball.color;
      this.ctx.fill();
    }
  }

  resize(width: number, height: number): void {
    const oldWidth = this.width;
    this.width = width;
    this.height = height;
    if (oldWidth === 0 || Math.abs(width - oldWidth) > 100) {
      for (let i = 0; i < this.balls.length; i++) {
        const ball = this.balls[i];
        ball.x = Math.random() * (this.width - ball.baseSize) + ball.baseSize / 2;
        ball.y = Math.min(ball.y, this.height - ball.baseSize / 2);
      }
    }
  }

  explode(mouseX: number, mouseY: number): void {
    for (const ball of this.balls) {
      const dx = ball.x - mouseX;
      const dy = ball.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 200) { // Explosion radius
        const force = Math.max(0, (200 - distance) / 200) * 20; // Force decreases with distance
        const angle = Math.atan2(dy, dx);
        ball.vx += Math.cos(angle) * force;
        ball.vy += Math.sin(angle) * force;
      }
    }
  }

  updateCallback(callback?: () => void): void {
    this.onThresholdCrossed = callback;
  }

  dispose(): void {
    this.balls = [];
  }
}

// Stars Theme - using simple text characters for performance
export class StarsTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['⭐', '✨', '🌟', '💫', '⚡', '✦', '✧', '🌠'];
  }
}

// Hearts Theme - converted to emoji-based
export class HeartsTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['❤️', '💕', '💖', '💗', '💘', '💝', '💞', '💟', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '🤎', '💔', '❣️', '💌'];
  }
}

// Geometric Shapes Theme - converted to emoji-based
export class GeometricTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['🔵', '🟢', '🟡', '🔴', '🟠', '🟣', '⚫', '⚪', '🟤', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔳', '🔲', '◼️', '◻️', '▪️', '▫️'];
  }
}

// Science Emojis Theme
export class ScienceTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['🧪', '🔬', '🧬', '⚗️', '🔭', '🌡️', '🧲', '⚛️', '🚀', '🌌', '⚡', '🔋', '💡', '🌍', '🌙'];
  }
}

// Math Emojis Theme
export class MathTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['🔢', '➕', '➖', '✖️', '➗', '🟰', '📐', '📏', '📊', '📈', '📉', '🧮', '💯', '🔣', '🆔'];
  }
}

// Spring Theme
export class SpringTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['🌸', '🌷', '🌼', '🌻', '🌺', '🦋', '🐛', '🐝', '🌱', '🌿', '☘️', '🍀', '🌳', '🌲', '🐣'];
  }

  protected drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(144, 238, 144, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 182, 193, 0.3)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

// Summer Theme
export class SummerTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['☀️', '🌞', '🏖️', '🌊', '🏄', '🍉', '🍦', '🩱', '👙', '🕶️', '🌴', '🐚', '⛱️', '🦀', '🌺'];
  }

  protected drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(255, 220, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 69, 0, 0.3)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

// Autumn Theme
export class AutumnTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['🍂', '🍁', '🎃', '🌰', '🍄', '🦔', '🐿️', '🌾', '🥧', '🎯', '🧥', '☕', '🕯️', '🔥', '🌙'];
  }

  protected drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(255, 165, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(139, 69, 19, 0.3)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

// Winter Theme
export class WinterTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['❄️', '☃️', '⛄', '🎿', '⛷️', '🏂', '🧊', '🥶', '🧥', '🧤', '🧣', '⛸️', '🎄', '🎅', '🤶'];
  }

  protected drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(176, 224, 230, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

// Regular Emojis Theme
export class HappyFacesTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['😊', '😄', '😃', '😁', '😆', '🤣', '😂', '🥰', '😍', '🤩', '😋', '😎', '🤗', '🥳', '😌', '🔥', '⭐', '💖', '🎉', '🌟', '✨', '🎊', '🦄', '🌈', '🎨', '🎭', '🎪', '🎯', '⚡', '💫', '🐱', '🐶', '🐸', '🐼', '🦊', '🐻', '🐷', '🐵', '🦁', '🐯'];
  }
}