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
      } else if (face.y >= thresholdY && face.vy >= 0) {
        // Only reset threshold flag when moving down naturally (not from explosion)
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
        face.vy += Math.sin(angle) * force - 8; // Add upward force to launch into air
        face.crossedThreshold = true; // Prevent alerts during explosion
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
      } else if (ball.y >= thresholdY && ball.vy >= 0) {
        // Only reset threshold flag when moving down naturally (not from explosion)
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
        ball.vy += Math.sin(angle) * force - 8; // Add upward force to launch into air
        ball.crossedThreshold = true; // Prevent alerts during explosion
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
  private backgroundStars: Array<{x: number, y: number, size: number, opacity: number}> = [];
  private nebula: Array<{x: number, y: number, radius: number, opacity: number, color: string}> = [];
  private planets: Array<{x: number, y: number, radius: number, color: string, ringColor?: string}> = [];

  protected getEmojis(): string[] {
    // Removed black/dark stars, keeping bright and colorful ones
    return ['⭐', '✨', '🌟', '💫', '⚡', '🌠'];
  }

  init(width: number, height: number): void {
    super.init(width, height);
    
    // Initialize background stars
    this.backgroundStars = [];
    for (let i = 0; i < 200; i++) {
      this.backgroundStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2
      });
    }

    // Initialize nebula clouds
    this.nebula = [];
    for (let i = 0; i < 8; i++) {
      this.nebula.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 150 + 100,
        opacity: Math.random() * 0.15 + 0.05,
        color: ['#4A90E2', '#9013FE', '#E91E63', '#FF5722', '#00BCD4'][Math.floor(Math.random() * 5)]
      });
    }

    // Initialize planets
    this.planets = [];
    const planetCount = Math.floor(Math.random() * 3) + 2; // 2-4 planets
    for (let i = 0; i < planetCount; i++) {
      const hasRings = Math.random() > 0.7;
      this.planets.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 40 + 20,
        color: ['#FF6B35', '#F7931E', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][Math.floor(Math.random() * 6)],
        ringColor: hasRings ? '#DDDDDD' : undefined
      });
    }
  }

  protected drawBackground(): void {
    // Deep space gradient background
    const gradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, Math.max(this.width, this.height)
    );
    gradient.addColorStop(0, '#0a0a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw nebula clouds
    this.nebula.forEach(nebula => {
      const nebulaGradient = this.ctx.createRadialGradient(
        nebula.x, nebula.y, 0,
        nebula.x, nebula.y, nebula.radius
      );
      nebulaGradient.addColorStop(0, nebula.color + '40');
      nebulaGradient.addColorStop(0.5, nebula.color + '20');
      nebulaGradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = nebulaGradient;
      this.ctx.beginPath();
      this.ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw background stars
    this.backgroundStars.forEach(star => {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw planets
    this.planets.forEach(planet => {
      // Planet shadow/glow effect
      const planetGradient = this.ctx.createRadialGradient(
        planet.x - planet.radius * 0.3, planet.y - planet.radius * 0.3, 0,
        planet.x, planet.y, planet.radius
      );
      planetGradient.addColorStop(0, planet.color);
      planetGradient.addColorStop(0.7, planet.color + 'CC');
      planetGradient.addColorStop(1, planet.color + '66');
      
      this.ctx.fillStyle = planetGradient;
      this.ctx.beginPath();
      this.ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw rings if planet has them
      if (planet.ringColor) {
        this.ctx.strokeStyle = planet.ringColor + '80';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.ellipse(planet.x, planet.y, planet.radius * 1.5, planet.radius * 0.3, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.ellipse(planet.x, planet.y, planet.radius * 1.8, planet.radius * 0.4, 0, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    });
  }

  resize(width: number, height: number): void {
    super.resize(width, height);
    this.init(width, height); // Reinitialize background elements
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

  protected drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(34, 139, 34, 0.6)'); // Forest green
    gradient.addColorStop(1, 'rgba(0, 128, 0, 0.4)'); // Green
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

// Math Emojis Theme
export class MathTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['🔢', '➕', '➖', '✖️', '➗', '🟰', '📐', '📏', '📊', '📈', '📉', '🧮', '💯', '🔣'];
  }

  protected drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(30, 144, 255, 0.6)'); // Dodger blue
    gradient.addColorStop(1, 'rgba(0, 191, 255, 0.4)'); // Deep sky blue
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

// Reading/Library Theme
export class ReadingTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['📚', '📖', '📝', '✏️', '✒️', '🖊️', '📄', '📃', '📜', '🏛️', '🤓', '👩‍🏫', '👨‍🏫', '🎓', '📓', '📔', '📕', '📗', '📘', '📙', '📰', '🗞️', '💡', '🧠', '🔍'];
  }

  protected drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(220, 20, 60, 0.6)'); // Crimson red
    gradient.addColorStop(1, 'rgba(178, 34, 34, 0.4)'); // Fire brick red
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

// Spring Theme
export class SpringTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['🌸', '🌷', '🌼', '🌻', '🌺', '🦋', '🐛', '🐝', '🌱', '🌿', '☘️', '🍀', '🌳', '🌲', '🐣'];
  }

  protected drawBackground(): void {
    // Sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(135, 206, 250, 0.8)'); // Light blue sky
    gradient.addColorStop(1, 'rgba(144, 238, 144, 0.8)'); // Light green ground
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw flower field
    const flowerCount = 25;
    for (let i = 0; i < flowerCount; i++) {
      const x = (this.width / flowerCount) * i + Math.random() * 40;
      const y = this.height * 0.7 + Math.random() * (this.height * 0.25);
      
      // Flower stem
      this.ctx.strokeStyle = 'rgba(34, 139, 34, 0.6)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x, y + 30);
      this.ctx.stroke();
      
      // Flower petals
      const petalColors = ['#FF69B4', '#FFB6C1', '#FF1493', '#FFC0CB', '#DA70D6'];
      this.ctx.fillStyle = petalColors[Math.floor(Math.random() * petalColors.length)] + '80';
      for (let petal = 0; petal < 6; petal++) {
        const angle = (petal * Math.PI * 2) / 6;
        const petalX = x + Math.cos(angle) * 8;
        const petalY = y + Math.sin(angle) * 8;
        this.ctx.beginPath();
        this.ctx.arc(petalX, petalY, 4, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // Flower center
      this.ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Add some grass blades
    this.ctx.strokeStyle = 'rgba(34, 139, 34, 0.4)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * this.width;
      const y = this.height * 0.8 + Math.random() * (this.height * 0.2);
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x + Math.random() * 4 - 2, y - Math.random() * 15);
      this.ctx.stroke();
    }
  }
}

// Summer Theme
export class SummerTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['☀️', '🌞', '🏖️', '🌊', '🏄', '🍉', '🍦', '🩱', '👙', '🕶️', '🌴', '🐚', '⛱️', '🦀', '🌺'];
  }

  protected drawBackground(): void {
    // Beach sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height * 0.6);
    gradient.addColorStop(0, 'rgba(135, 206, 250, 0.9)'); // Bright blue sky
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0.8)'); // Golden horizon
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height * 0.6);

    // Ocean waves
    const waveGradient = this.ctx.createLinearGradient(0, this.height * 0.4, 0, this.height * 0.7);
    waveGradient.addColorStop(0, 'rgba(0, 191, 255, 0.8)');
    waveGradient.addColorStop(1, 'rgba(30, 144, 255, 0.9)');
    this.ctx.fillStyle = waveGradient;
    this.ctx.fillRect(0, this.height * 0.4, this.width, this.height * 0.3);

    // Beach sand
    const sandGradient = this.ctx.createLinearGradient(0, this.height * 0.7, 0, this.height);
    sandGradient.addColorStop(0, 'rgba(238, 203, 173, 0.9)');
    sandGradient.addColorStop(1, 'rgba(205, 133, 63, 0.8)');
    this.ctx.fillStyle = sandGradient;
    this.ctx.fillRect(0, this.height * 0.7, this.width, this.height * 0.3);

    // Wave foam lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const waveY = this.height * 0.5 + i * 15 + Math.sin(Date.now() * 0.001 + i) * 5;
      this.ctx.beginPath();
      this.ctx.moveTo(0, waveY);
      for (let x = 0; x <= this.width; x += 20) {
        const y = waveY + Math.sin((x + Date.now() * 0.002) * 0.02) * 8;
        this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
    }

    // Palm tree silhouettes
    const palmCount = 3;
    for (let i = 0; i < palmCount; i++) {
      const x = (this.width / (palmCount + 1)) * (i + 1);
      const y = this.height * 0.7;
      
      // Palm trunk
      this.ctx.fillStyle = 'rgba(101, 67, 33, 0.8)';
      this.ctx.fillRect(x - 8, y - 80, 16, 80);
      
      // Palm fronds
      this.ctx.strokeStyle = 'rgba(34, 139, 34, 0.8)';
      this.ctx.lineWidth = 4;
      for (let frond = 0; frond < 6; frond++) {
        const angle = (frond * Math.PI * 2) / 6;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 80);
        this.ctx.lineTo(x + Math.cos(angle) * 40, y - 80 + Math.sin(angle) * 25);
        this.ctx.stroke();
      }
    }
  }
}

// Fall Theme
export class FallTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['🍂', '🍁', '🎃', '🌰', '🍄', '🦔', '🐿️', '🌾', '🥧', '🎯', '🧥', '☕', '🕯️', '🔥', '🌙'];
  }

  protected drawBackground(): void {
    // Fall sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(255, 140, 0, 0.7)'); // Orange sunset sky
    gradient.addColorStop(1, 'rgba(139, 69, 19, 0.8)'); // Brown earth
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Pumpkin patch ground
    this.ctx.fillStyle = 'rgba(101, 67, 33, 0.6)';
    this.ctx.fillRect(0, this.height * 0.8, this.width, this.height * 0.2);

    // Pumpkins scattered around
    const pumpkinCount = 12;
    for (let i = 0; i < pumpkinCount; i++) {
      const pumpkinX = Math.random() * this.width;
      const pumpkinY = this.height * 0.75 + Math.random() * (this.height * 0.2);
      const size = 15 + Math.random() * 25;
      
      // Pumpkin body
      this.ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
      this.ctx.beginPath();
      this.ctx.arc(pumpkinX, pumpkinY, size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Pumpkin ridges
      this.ctx.strokeStyle = 'rgba(255, 140, 0, 0.9)';
      this.ctx.lineWidth = 2;
      let ridgeX = pumpkinX - size * 0.6;
      for (let ridge = 0; ridge < 4; ridge++) {
        this.ctx.beginPath();
        this.ctx.moveTo(ridgeX, pumpkinY - size);
        this.ctx.lineTo(ridgeX, pumpkinY + size);
        this.ctx.stroke();
        ridgeX += size * 0.3;
      }
      
      // Pumpkin stem
      this.ctx.fillStyle = 'rgba(34, 139, 34, 0.8)';
      this.ctx.fillRect(pumpkinX - 3, pumpkinY - size - 8, 6, 8);
    }

    // Fall trees in background
    const treeCount = 8;
    for (let i = 0; i < treeCount; i++) {
      const x = (this.width / treeCount) * i + Math.random() * 50;
      const y = this.height * 0.6 + Math.random() * (this.height * 0.15);
      
      // Tree trunk
      this.ctx.fillStyle = 'rgba(101, 67, 33, 0.7)';
      this.ctx.fillRect(x - 8, y, 16, this.height * 0.2);
      
      // Tree foliage (fall colors)
      const foliageColors = ['rgba(220, 20, 60, 0.8)', 'rgba(255, 165, 0, 0.8)', 'rgba(255, 215, 0, 0.8)', 'rgba(160, 82, 45, 0.8)'];
      this.ctx.fillStyle = foliageColors[Math.floor(Math.random() * foliageColors.length)];
      this.ctx.beginPath();
      this.ctx.arc(x, y - 20, 35, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Falling leaves
    this.ctx.fillStyle = 'rgba(255, 165, 0, 0.6)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height * 0.7;
      const rotation = Math.random() * Math.PI * 2;
      
      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(rotation);
      this.ctx.beginPath();
      this.ctx.moveTo(-5, -8);
      this.ctx.lineTo(5, -8);
      this.ctx.lineTo(8, 0);
      this.ctx.lineTo(5, 8);
      this.ctx.lineTo(-5, 8);
      this.ctx.lineTo(-8, 0);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    }
  }
}

// Winter Theme
export class WinterTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['❄️', '☃️', '⛄', '🎿', '⛷️', '🏂', '🧊', '🥶', '🧥', '🧤', '🧣', '⛸️', '🎄', '🎅', '🤶'];
  }

  protected drawBackground(): void {
    // Winter sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(176, 196, 222, 0.9)'); // Light steel blue
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)'); // Snow white
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Snow-covered ground
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.fillRect(0, this.height * 0.7, this.width, this.height * 0.3);

    // Snowy forest trees
    const treeCount = 15;
    for (let i = 0; i < treeCount; i++) {
      const x = (this.width / treeCount) * i + Math.random() * 30;
      const y = this.height * 0.4 + Math.random() * (this.height * 0.3);
      const treeHeight = 40 + Math.random() * 60;
      
      // Pine tree shape
      this.ctx.fillStyle = 'rgba(34, 139, 34, 0.8)';
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x - 15, y + treeHeight);
      this.ctx.lineTo(x + 15, y + treeHeight);
      this.ctx.closePath();
      this.ctx.fill();
      
      // Tree trunk
      this.ctx.fillStyle = 'rgba(101, 67, 33, 0.8)';
      this.ctx.fillRect(x - 4, y + treeHeight, 8, 20);
      
      // Snow on tree
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x - 12, y + treeHeight * 0.7);
      this.ctx.lineTo(x + 12, y + treeHeight * 0.7);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // Falling snowflakes
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const size = 1 + Math.random() * 3;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Snowflake arms
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.lineWidth = 1;
      for (let arm = 0; arm < 6; arm++) {
        const angle = (arm * Math.PI * 2) / 6;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + Math.cos(angle) * size * 2, y + Math.sin(angle) * size * 2);
        this.ctx.stroke();
      }
    }

    // Snow drifts
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * this.width;
      const y = this.height * 0.8 + Math.random() * (this.height * 0.15);
      this.ctx.beginPath();
      this.ctx.arc(x, y, 20 + Math.random() * 30, 0, Math.PI, false);
      this.ctx.fill();
    }
  }
}

// Regular Emojis Theme
export class HappyFacesTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['😊', '😄', '😃', '😁', '😆', '🤣', '😂', '🥰', '😍', '🤩', '😋', '😎', '🤗', '🥳', '😌', '🔥', '⭐', '💖', '🎉', '🌟', '✨', '🎊', '🦄', '🌈', '🎨', '🎭', '🎪', '🎯', '⚡', '💫', '🐱', '🐶', '🐸', '🐼', '🦊', '🐻', '🐷', '🐵', '🦁', '🐯'];
  }
}