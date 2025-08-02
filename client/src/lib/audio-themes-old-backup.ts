export interface Theme {
  init(width: number, height: number): void;
  update(volumeLevel: number, threshold?: number): void;
  draw(): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  baseRadius: number;
  crossedThreshold: boolean;
}

interface Snowflake {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

interface TreeBranch {
  x: number;
  y: number;
  angle: number;
  length: number;
  width: number;
  growth: number;
  maxGrowth: number;
}

interface WaveParticle {
  x: number;
  y: number;
  baseY: number;
  amplitude: number;
  frequency: number;
  phase: number;
  color: string;
}

interface Bubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
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
  rotation: number;
  rotationSpeed: number;
}

// Base class for all emoji themes with shared physics
abstract class BaseEmojiTheme implements Theme {
  protected ctx: CanvasRenderingContext2D;
  protected faces: Emojiface[] = [];
  protected width = 0;
  protected height = 0;
  protected volumeLevel = 0;
  protected onThresholdCrossed?: () => void;

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

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.faces = [];

    const emojis = this.getEmojis();
    for (let i = 0; i < 80; i++) {
      const baseSize = Math.random() * 20 + 25;
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
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
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

      // Update rotation based on movement
      face.rotation += face.rotationSpeed;
      face.rotationSpeed += (Math.abs(face.vx) + Math.abs(face.vy)) * 0.01;
      face.rotationSpeed *= 0.98; // Damping

      if (volumeLevel > 20) {
        face.vx += (Math.random() - 0.5) * (volumeLevel / 150);
        face.rotationSpeed += (Math.random() - 0.5) * 0.05;
      }
    }
  }

  draw(): void {
    // Draw background first (if theme provides one)
    this.drawBackground();
    
    // Draw all emojis with rotation
    for (const face of this.faces) {
      this.ctx.save();
      this.ctx.font = `${face.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      // Apply rotation
      this.ctx.translate(face.x, face.y);
      this.ctx.rotate(face.rotation);
      this.ctx.fillText(face.emoji, 0, 0);
      this.ctx.restore();
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

  updateCallback(callback?: () => void): void {
    this.onThresholdCrossed = callback;
  }

  dispose(): void {
    this.faces = [];
  }
}

interface Shape {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  crossedThreshold: boolean;
  shape: string;
  color: string;
}

export class BouncingBallsTheme implements Theme {
  private ctx: CanvasRenderingContext2D;
  private balls: Ball[] = [];
  private width = 0;
  private height = 0;
  private volumeLevel = 0;
  private onThresholdCrossed?: () => void;
  private colorTheme: string;

  constructor(ctx: CanvasRenderingContext2D, onThresholdCrossed?: () => void, colorTheme: string = 'rainbow') {
    this.ctx = ctx;
    this.onThresholdCrossed = onThresholdCrossed;
    this.colorTheme = colorTheme;
  }

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.balls = [];

    // Create high-density balls spread out across full width and falling
    for (let i = 0; i < 80; i++) {
      const baseRadius = Math.random() * 12 + 8;
      // Spread balls randomly across the full width
      const x = Math.random() * (width - baseRadius * 2) + baseRadius;
      this.balls.push({
        x: x,
        y: Math.random() * (height * 0.6) + baseRadius, // Start spread out in upper 60% of screen
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2, // Start falling
        radius: baseRadius,
        baseRadius: baseRadius,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        crossedThreshold: false,
      });
    }
  }

  update(volumeLevel: number, threshold: number = 70): void {
    this.volumeLevel = volumeLevel;
    const thresholdY = (this.height * (100 - threshold)) / 100;

    for (const ball of this.balls) {
      // Store previous position for threshold crossing detection
      const prevY = ball.y;
      
      // Update horizontal position
      ball.x += ball.vx;

      // Update vertical position
      ball.y += ball.vy;

      // Check for threshold crossing
      if (prevY >= thresholdY && ball.y < thresholdY && !ball.crossedThreshold) {
        ball.crossedThreshold = true;
        if (this.onThresholdCrossed) {
          this.onThresholdCrossed();
        }
      } else if (ball.y >= thresholdY) {
        ball.crossedThreshold = false;
      }

      // Bounce off side walls
      if (ball.x - ball.radius < 0 || ball.x + ball.radius > this.width) {
        ball.vx *= -0.8;
        ball.x = Math.max(ball.radius, Math.min(this.width - ball.radius, ball.x));
      }

      // Handle floor collision - stick to bottom when no volume
      const floorY = this.height - ball.radius;
      if (ball.y >= floorY) {
        ball.y = floorY;
        
        if (volumeLevel > 5) {
          // Only bounce random balls (about 10 at a time)
          if (Math.random() < 0.15) {
            // Scale bounce intensity to reach top of screen when maxed
            const maxBounceVelocity = Math.sqrt(2 * 0.6 * this.height); // Physics: reach top with gravity
            ball.vy = -(volumeLevel / 100) * maxBounceVelocity;
          } else {
            ball.vy = 0;
          }
        } else {
          // Stick to floor when quiet
          ball.vy = 0;
        }
        
        // Add some horizontal movement when bouncing
        if (Math.abs(ball.vx) < 1) {
          ball.vx += (Math.random() - 0.5) * 2;
        }
      } else {
        // Apply gravity when in air
        ball.vy += 0.6;
      }

      // Handle ceiling collision
      if (ball.y - ball.radius < 0) {
        ball.vy = Math.abs(ball.vy) * 0.8;
        ball.y = ball.radius;
      }

      // Apply air resistance
      ball.vx *= 0.99;
      ball.vy *= 0.995;

      // Scale radius based on volume
      ball.radius = ball.baseRadius * (1 + volumeLevel / 200);

      // Add random movement when volume is high
      if (volumeLevel > 20) {
        ball.vx += (Math.random() - 0.5) * (volumeLevel / 150);
      }
    }
  }

  draw(): void {
    for (const ball of this.balls) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.8;
      this.ctx.fillStyle = ball.color;
      this.ctx.beginPath();
      this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add glow effect
      this.ctx.shadowColor = ball.color;
      this.ctx.shadowBlur = this.volumeLevel / 5;
      this.ctx.beginPath();
      this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  resize(width: number, height: number): void {
    const oldWidth = this.width;
    const oldHeight = this.height;
    this.width = width;
    this.height = height;
    
    // Only redistribute balls if this is the first resize or significant size change
    if (oldWidth === 0 || Math.abs(width - oldWidth) > 100) {
      this.redistributeBalls();
    }
  }

  private redistributeBalls(): void {
    // Redistribute existing balls across new width
    for (let i = 0; i < this.balls.length; i++) {
      const ball = this.balls[i];
      // Spread balls randomly across the full width
      ball.x = Math.random() * (this.width - ball.baseRadius * 2) + ball.baseRadius;
      // Keep current Y position but ensure it's within bounds
      ball.y = Math.min(ball.y, this.height - ball.baseRadius);
    }
  }

  updateCallback(callback?: () => void): void {
    this.onThresholdCrossed = callback;
  }

  dispose(): void {
    this.balls = [];
  }
}

// Stars Theme
export class StarsTheme implements Theme {
  private ctx: CanvasRenderingContext2D;
  private stars: Shape[] = [];
  private width = 0;
  private height = 0;
  private volumeLevel = 0;
  private onThresholdCrossed?: () => void;

  constructor(ctx: CanvasRenderingContext2D, onThresholdCrossed?: () => void) {
    this.ctx = ctx;
    this.onThresholdCrossed = onThresholdCrossed;
  }

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.stars = [];

    for (let i = 0; i < 80; i++) {
      const baseSize = Math.random() * 15 + 20;
      const x = Math.random() * (width - baseSize) + baseSize / 2;
      this.stars.push({
        x: x,
        y: Math.random() * (height * 0.6) + baseSize / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2,
        size: baseSize,
        baseSize: baseSize,
        shape: 'star',
        color: `hsl(${Math.random() * 60 + 30}, 80%, 70%)`,
        crossedThreshold: false,
      });
    }
  }

  update(volumeLevel: number, threshold: number = 70): void {
    this.volumeLevel = volumeLevel;
    const thresholdY = (this.height * (100 - threshold)) / 100;

    for (const star of this.stars) {
      const prevY = star.y;
      star.x += star.vx;
      star.y += star.vy;

      if (prevY >= thresholdY && star.y < thresholdY && !star.crossedThreshold) {
        star.crossedThreshold = true;
        if (this.onThresholdCrossed) this.onThresholdCrossed();
      } else if (star.y >= thresholdY) {
        star.crossedThreshold = false;
      }

      if (star.x - star.size/2 < 0 || star.x + star.size/2 > this.width) {
        star.vx *= -0.8;
        star.x = Math.max(star.size/2, Math.min(this.width - star.size/2, star.x));
      }

      const floorY = this.height - star.size/2;
      if (star.y >= floorY) {
        star.y = floorY;
        if (volumeLevel > 5 && Math.random() < 0.15) {
          const maxBounceVelocity = Math.sqrt(2 * 0.6 * this.height);
          star.vy = -(volumeLevel / 100) * maxBounceVelocity;
        } else {
          star.vy = 0;
        }
        if (Math.abs(star.vx) < 1) {
          star.vx += (Math.random() - 0.5) * 2;
        }
      } else {
        star.vy += 0.6;
      }

      if (star.y - star.size/2 < 0) {
        star.vy = Math.abs(star.vy) * 0.8;
        star.y = star.size/2;
      }

      star.vx *= 0.99;
      star.vy *= 0.995;
      star.size = star.baseSize * (1 + volumeLevel / 200);

      if (volumeLevel > 20) {
        star.vx += (Math.random() - 0.5) * (volumeLevel / 150);
      }
    }
  }

  draw(): void {
    for (const star of this.stars) {
      this.ctx.save();
      this.ctx.fillStyle = star.color;
      
      const size = star.size;
      const x = star.x;
      const y = star.y;
      
      this.ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 144 - 90) * Math.PI / 180;
        const x1 = x + Math.cos(angle) * size / 2;
        const y1 = y + Math.sin(angle) * size / 2;
        if (i === 0) this.ctx.moveTo(x1, y1);
        else this.ctx.lineTo(x1, y1);
        
        const innerAngle = ((i + 0.5) * 144 - 90) * Math.PI / 180;
        const x2 = x + Math.cos(innerAngle) * size / 4;
        const y2 = y + Math.sin(innerAngle) * size / 4;
        this.ctx.lineTo(x2, y2);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  resize(width: number, height: number): void {
    const oldWidth = this.width;
    this.width = width;
    this.height = height;
    if (oldWidth === 0 || Math.abs(width - oldWidth) > 100) {
      for (let i = 0; i < this.stars.length; i++) {
        const star = this.stars[i];
        star.x = Math.random() * (this.width - star.baseSize) + star.baseSize / 2;
        star.y = Math.min(star.y, this.height - star.baseSize / 2);
      }
    }
  }

  updateCallback(callback?: () => void): void {
    this.onThresholdCrossed = callback;
  }

  dispose(): void {
    this.stars = [];
  }
}

// Hearts Theme  
export class HeartsTheme implements Theme {
  private ctx: CanvasRenderingContext2D;
  private hearts: Shape[] = [];
  private width = 0;
  private height = 0;
  private volumeLevel = 0;
  private onThresholdCrossed?: () => void;

  constructor(ctx: CanvasRenderingContext2D, onThresholdCrossed?: () => void) {
    this.ctx = ctx;
    this.onThresholdCrossed = onThresholdCrossed;
  }

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.hearts = [];

    for (let i = 0; i < 80; i++) {
      const baseSize = Math.random() * 15 + 25;
      const x = Math.random() * (width - baseSize) + baseSize / 2;
      this.hearts.push({
        x: x,
        y: Math.random() * (height * 0.6) + baseSize / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2,
        size: baseSize,
        baseSize: baseSize,
        shape: 'heart',
        color: `hsl(${Math.random() * 40 + 340}, 80%, 70%)`,
        crossedThreshold: false,
      });
    }
  }

  update(volumeLevel: number, threshold: number = 70): void {
    this.volumeLevel = volumeLevel;
    const thresholdY = (this.height * (100 - threshold)) / 100;

    for (const heart of this.hearts) {
      const prevY = heart.y;
      heart.x += heart.vx;
      heart.y += heart.vy;

      if (prevY >= thresholdY && heart.y < thresholdY && !heart.crossedThreshold) {
        heart.crossedThreshold = true;
        if (this.onThresholdCrossed) this.onThresholdCrossed();
      } else if (heart.y >= thresholdY) {
        heart.crossedThreshold = false;
      }

      if (heart.x - heart.size/2 < 0 || heart.x + heart.size/2 > this.width) {
        heart.vx *= -0.8;
        heart.x = Math.max(heart.size/2, Math.min(this.width - heart.size/2, heart.x));
      }

      const floorY = this.height - heart.size/2;
      if (heart.y >= floorY) {
        heart.y = floorY;
        if (volumeLevel > 5 && Math.random() < 0.15) {
          const maxBounceVelocity = Math.sqrt(2 * 0.6 * this.height);
          heart.vy = -(volumeLevel / 100) * maxBounceVelocity;
        } else {
          heart.vy = 0;
        }
        if (Math.abs(heart.vx) < 1) {
          heart.vx += (Math.random() - 0.5) * 2;
        }
      } else {
        heart.vy += 0.6;
      }

      if (heart.y - heart.size/2 < 0) {
        heart.vy = Math.abs(heart.vy) * 0.8;
        heart.y = heart.size/2;
      }

      heart.vx *= 0.99;
      heart.vy *= 0.995;
      heart.size = heart.baseSize * (1 + volumeLevel / 200);

      if (volumeLevel > 20) {
        heart.vx += (Math.random() - 0.5) * (volumeLevel / 150);
      }
    }
  }

  draw(): void {
    for (const heart of this.hearts) {
      this.ctx.save();
      this.ctx.fillStyle = heart.color;
      
      const size = heart.size;
      const x = heart.x;
      const y = heart.y;
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + size/4);
      this.ctx.bezierCurveTo(x - size/2, y - size/4, x - size/2, y + size/6, x, y + size/2);
      this.ctx.bezierCurveTo(x + size/2, y + size/6, x + size/2, y - size/4, x, y + size/4);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  resize(width: number, height: number): void {
    const oldWidth = this.width;
    this.width = width;
    this.height = height;
    if (oldWidth === 0 || Math.abs(width - oldWidth) > 100) {
      for (let i = 0; i < this.hearts.length; i++) {
        const heart = this.hearts[i];
        heart.x = Math.random() * (this.width - heart.baseSize) + heart.baseSize / 2;
        heart.y = Math.min(heart.y, this.height - heart.baseSize / 2);
      }
    }
  }

  updateCallback(callback?: () => void): void {
    this.onThresholdCrossed = callback;
  }

  dispose(): void {
    this.hearts = [];
  }
}

// Geometric Shapes Theme
export class GeometricTheme implements Theme {
  private ctx: CanvasRenderingContext2D;
  private shapes: Shape[] = [];
  private width = 0;
  private height = 0;
  private volumeLevel = 0;
  private onThresholdCrossed?: () => void;

  constructor(ctx: CanvasRenderingContext2D, onThresholdCrossed?: () => void) {
    this.ctx = ctx;
    this.onThresholdCrossed = onThresholdCrossed;
  }

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.shapes = [];

    const shapeTypes = ['triangle', 'square', 'pentagon', 'hexagon'];
    for (let i = 0; i < 80; i++) {
      const baseSize = Math.random() * 15 + 20;
      const x = Math.random() * (width - baseSize) + baseSize / 2;
      this.shapes.push({
        x: x,
        y: Math.random() * (height * 0.6) + baseSize / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2,
        size: baseSize,
        baseSize: baseSize,
        shape: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        crossedThreshold: false,
      });
    }
  }

  update(volumeLevel: number, threshold: number = 70): void {
    this.volumeLevel = volumeLevel;
    const thresholdY = (this.height * (100 - threshold)) / 100;

    for (const shape of this.shapes) {
      const prevY = shape.y;
      shape.x += shape.vx;
      shape.y += shape.vy;

      if (prevY >= thresholdY && shape.y < thresholdY && !shape.crossedThreshold) {
        shape.crossedThreshold = true;
        if (this.onThresholdCrossed) this.onThresholdCrossed();
      } else if (shape.y >= thresholdY) {
        shape.crossedThreshold = false;
      }

      if (shape.x - shape.size/2 < 0 || shape.x + shape.size/2 > this.width) {
        shape.vx *= -0.8;
        shape.x = Math.max(shape.size/2, Math.min(this.width - shape.size/2, shape.x));
      }

      const floorY = this.height - shape.size/2;
      if (shape.y >= floorY) {
        shape.y = floorY;
        if (volumeLevel > 5 && Math.random() < 0.15) {
          const maxBounceVelocity = Math.sqrt(2 * 0.6 * this.height);
          shape.vy = -(volumeLevel / 100) * maxBounceVelocity;
        } else {
          shape.vy = 0;
        }
        if (Math.abs(shape.vx) < 1) {
          shape.vx += (Math.random() - 0.5) * 2;
        }
      } else {
        shape.vy += 0.6;
      }

      if (shape.y - shape.size/2 < 0) {
        shape.vy = Math.abs(shape.vy) * 0.8;
        shape.y = shape.size/2;
      }

      shape.vx *= 0.99;
      shape.vy *= 0.995;
      shape.size = shape.baseSize * (1 + volumeLevel / 200);

      if (volumeLevel > 20) {
        shape.vx += (Math.random() - 0.5) * (volumeLevel / 150);
      }
    }
  }

  draw(): void {
    for (const shape of this.shapes) {
      this.ctx.save();
      this.ctx.fillStyle = shape.color;
      
      const size = shape.size;
      const x = shape.x;
      const y = shape.y;
      
      this.ctx.beginPath();
      
      switch (shape.shape) {
        case 'triangle':
          this.ctx.moveTo(x, y - size/2);
          this.ctx.lineTo(x - size/2, y + size/2);
          this.ctx.lineTo(x + size/2, y + size/2);
          break;
        case 'square':
          this.ctx.rect(x - size/2, y - size/2, size, size);
          break;
        case 'pentagon':
        case 'hexagon':
          const sides = shape.shape === 'pentagon' ? 5 : 6;
          for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            const px = x + Math.cos(angle) * size / 2;
            const py = y + Math.sin(angle) * size / 2;
            if (i === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
          }
          break;
      }
      
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  resize(width: number, height: number): void {
    const oldWidth = this.width;
    this.width = width;
    this.height = height;
    if (oldWidth === 0 || Math.abs(width - oldWidth) > 100) {
      for (let i = 0; i < this.shapes.length; i++) {
        const shape = this.shapes[i];
        shape.x = Math.random() * (this.width - shape.baseSize) + shape.baseSize / 2;
        shape.y = Math.min(shape.y, this.height - shape.baseSize / 2);
      }
    }
  }

  updateCallback(callback?: () => void): void {
    this.onThresholdCrossed = callback;
  }

  dispose(): void {
    this.shapes = [];
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
export class SpringThemeOptimized extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['🌸', '🌷', '🌼', '🌻', '🌺', '🦋', '🐛', '🐝', '🌱', '🌿', '☘️', '🍀', '🌳', '🌲', '🐣'];
  }

  protected drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(144, 238, 144, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 182, 193, 0.1)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

// Summer Theme
export class SummerThemeOptimized extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['☀️', '🌞', '🏖️', '🌊', '🏄', '🍉', '🍦', '🩱', '👙', '🕶️', '🌴', '🐚', '⛱️', '🦀', '🌺'];
  }

  protected drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(255, 220, 0, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 69, 0, 0.1)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

// Autumn Theme
export class AutumnThemeOptimized extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['🍂', '🍁', '🎃', '🌰', '🍄', '🦔', '🐿️', '🌾', '🥧', '🎯', '🧥', '☕', '🕯️', '🔥', '🌙'];
  }

  protected drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(255, 165, 0, 0.1)');
    gradient.addColorStop(1, 'rgba(139, 69, 19, 0.1)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

// Winter Theme
export class WinterThemeOptimized extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['❄️', '☃️', '⛄', '🎿', '⛷️', '🏂', '🧊', '🥶', '🧥', '🧤', '🧣', '⛸️', '🎄', '🎅', '🤶'];
  }

  protected drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(176, 224, 230, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

// Regular Emojis Theme
export class HappyFacesThemeOptimized extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['😊', '😄', '😃', '😁', '😆', '🤣', '😂', '🥰', '😍', '🤩', '😋', '😎', '🤗', '🥳', '😌', '🔥', '⭐', '💖', '🎉', '🌟', '✨', '🎊', '🦄', '🌈', '🎨', '🎭', '🎪', '🎯', '⚡', '💫', '🐱', '🐶', '🐸', '🐼', '🦊', '🐻', '🐷', '🐵', '🦁', '🐯'];
  }
}

// Spring Theme
export class SpringTheme implements Theme {
  private ctx: CanvasRenderingContext2D;
  private faces: Emojiface[] = [];
  private width = 0;
  private height = 0;
  private volumeLevel = 0;
  private onThresholdCrossed?: () => void;
  private springEmojis = ['🌸', '🌺', '🌻', '🌷', '🌼', '🦋', '🐝', '🌱', '🌿', '☀️', '🌤️', '🐛', '🦗', '🌳', '🍀'];

  constructor(ctx: CanvasRenderingContext2D, onThresholdCrossed?: () => void) {
    this.ctx = ctx;
    this.onThresholdCrossed = onThresholdCrossed;
  }

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.faces = [];

    for (let i = 0; i < 80; i++) {
      const baseSize = Math.random() * 20 + 25;
      const x = Math.random() * (width - baseSize) + baseSize / 2;
      this.faces.push({
        x: x,
        y: Math.random() * (height * 0.6) + baseSize / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2,
        size: baseSize,
        baseSize: baseSize,
        emoji: this.springEmojis[Math.floor(Math.random() * this.springEmojis.length)],
        crossedThreshold: false,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
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

      // Update rotation based on movement
      face.rotation += face.rotationSpeed;
      face.rotationSpeed += (Math.abs(face.vx) + Math.abs(face.vy)) * 0.01;
      face.rotationSpeed *= 0.98; // Damping

      if (volumeLevel > 20) {
        face.vx += (Math.random() - 0.5) * (volumeLevel / 150);
        face.rotationSpeed += (Math.random() - 0.5) * 0.05;
      }
    }
  }

  draw(): void {
    // Spring gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(144, 238, 144, 0.1)'); // Light green
    gradient.addColorStop(1, 'rgba(255, 182, 193, 0.1)'); // Light pink
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    for (const face of this.faces) {
      this.ctx.save();
      this.ctx.font = `${face.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      // Apply rotation
      this.ctx.translate(face.x, face.y);
      this.ctx.rotate(face.rotation);
      this.ctx.fillText(face.emoji, 0, 0);
      this.ctx.restore();
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

  updateCallback(callback?: () => void): void {
    this.onThresholdCrossed = callback;
  }

  dispose(): void {
    this.faces = [];
  }
}

// Summer Theme
export class SummerTheme implements Theme {
  private ctx: CanvasRenderingContext2D;
  private faces: Emojiface[] = [];
  private width = 0;
  private height = 0;
  private volumeLevel = 0;
  private onThresholdCrossed?: () => void;
  private summerEmojis = ['☀️', '🌞', '🏖️', '🌊', '🏄', '🍉', '🍦', '🩱', '👙', '🕶️', '🌴', '🐚', '⛱️', '🦀', '🌺'];

  constructor(ctx: CanvasRenderingContext2D, onThresholdCrossed?: () => void) {
    this.ctx = ctx;
    this.onThresholdCrossed = onThresholdCrossed;
  }

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.faces = [];

    for (let i = 0; i < 80; i++) {
      const baseSize = Math.random() * 20 + 25;
      const x = Math.random() * (width - baseSize) + baseSize / 2;
      this.faces.push({
        x: x,
        y: Math.random() * (height * 0.6) + baseSize / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2,
        size: baseSize,
        baseSize: baseSize,
        emoji: this.summerEmojis[Math.floor(Math.random() * this.summerEmojis.length)],
        crossedThreshold: false,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
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

      // Update rotation based on movement
      face.rotation += face.rotationSpeed;
      face.rotationSpeed += (Math.abs(face.vx) + Math.abs(face.vy)) * 0.01;
      face.rotationSpeed *= 0.98; // Damping

      if (volumeLevel > 20) {
        face.vx += (Math.random() - 0.5) * (volumeLevel / 150);
        face.rotationSpeed += (Math.random() - 0.5) * 0.05;
      }
    }
  }

  draw(): void {
    // Summer gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(255, 220, 0, 0.1)'); // Sunny yellow
    gradient.addColorStop(1, 'rgba(255, 69, 0, 0.1)'); // Orange red
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    for (const face of this.faces) {
      this.ctx.save();
      this.ctx.font = `${face.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      // Apply rotation
      this.ctx.translate(face.x, face.y);
      this.ctx.rotate(face.rotation);
      this.ctx.fillText(face.emoji, 0, 0);
      this.ctx.restore();
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

  updateCallback(callback?: () => void): void {
    this.onThresholdCrossed = callback;
  }

  dispose(): void {
    this.faces = [];
  }
}

// Autumn Theme
export class AutumnTheme implements Theme {
  private ctx: CanvasRenderingContext2D;
  private faces: Emojiface[] = [];
  private width = 0;
  private height = 0;
  private volumeLevel = 0;
  private onThresholdCrossed?: () => void;
  private autumnEmojis = ['🍂', '🍁', '🌰', '🎃', '🦃', '🌽', '🥧', '🍎', '🍊', '🌾', '🕯️', '🧡', '🤎', '🍄', '☂️'];

  constructor(ctx: CanvasRenderingContext2D, onThresholdCrossed?: () => void) {
    this.ctx = ctx;
    this.onThresholdCrossed = onThresholdCrossed;
  }

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.faces = [];

    for (let i = 0; i < 80; i++) {
      const baseSize = Math.random() * 20 + 25;
      const x = Math.random() * (width - baseSize) + baseSize / 2;
      this.faces.push({
        x: x,
        y: Math.random() * (height * 0.6) + baseSize / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2,
        size: baseSize,
        baseSize: baseSize,
        emoji: this.autumnEmojis[Math.floor(Math.random() * this.autumnEmojis.length)],
        crossedThreshold: false,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
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

      // Update rotation based on movement
      face.rotation += face.rotationSpeed;
      face.rotationSpeed += (Math.abs(face.vx) + Math.abs(face.vy)) * 0.01;
      face.rotationSpeed *= 0.98; // Damping

      if (volumeLevel > 20) {
        face.vx += (Math.random() - 0.5) * (volumeLevel / 150);
        face.rotationSpeed += (Math.random() - 0.5) * 0.05;
      }
    }
  }

  draw(): void {
    // Autumn gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(255, 165, 0, 0.1)'); // Orange
    gradient.addColorStop(1, 'rgba(139, 69, 19, 0.1)'); // Brown
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    for (const face of this.faces) {
      this.ctx.save();
      this.ctx.font = `${face.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      // Apply rotation
      this.ctx.translate(face.x, face.y);
      this.ctx.rotate(face.rotation);
      this.ctx.fillText(face.emoji, 0, 0);
      this.ctx.restore();
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

  updateCallback(callback?: () => void): void {
    this.onThresholdCrossed = callback;
  }

  dispose(): void {
    this.faces = [];
  }
}

// Winter Theme
export class WinterTheme implements Theme {
  private ctx: CanvasRenderingContext2D;
  private faces: Emojiface[] = [];
  private width = 0;
  private height = 0;
  private volumeLevel = 0;
  private onThresholdCrossed?: () => void;
  private winterEmojis = ['❄️', '☃️', '⛄', '🎿', '⛷️', '🏂', '🧊', '🥶', '🧥', '🧤', '🧣', '❄️', '⛸️', '🎄', '🎅'];

  constructor(ctx: CanvasRenderingContext2D, onThresholdCrossed?: () => void) {
    this.ctx = ctx;
    this.onThresholdCrossed = onThresholdCrossed;
  }

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.faces = [];

    for (let i = 0; i < 80; i++) {
      const baseSize = Math.random() * 20 + 25;
      const x = Math.random() * (width - baseSize) + baseSize / 2;
      this.faces.push({
        x: x,
        y: Math.random() * (height * 0.6) + baseSize / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2,
        size: baseSize,
        baseSize: baseSize,
        emoji: this.winterEmojis[Math.floor(Math.random() * this.winterEmojis.length)],
        crossedThreshold: false,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
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

      // Update rotation based on movement
      face.rotation += face.rotationSpeed;
      face.rotationSpeed += (Math.abs(face.vx) + Math.abs(face.vy)) * 0.01;
      face.rotationSpeed *= 0.98; // Damping

      if (volumeLevel > 20) {
        face.vx += (Math.random() - 0.5) * (volumeLevel / 150);
        face.rotationSpeed += (Math.random() - 0.5) * 0.05;
      }
    }
  }

  draw(): void {
    // Winter gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(176, 224, 230, 0.1)'); // Light blue
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)'); // White
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    for (const face of this.faces) {
      this.ctx.save();
      this.ctx.font = `${face.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      // Apply rotation
      this.ctx.translate(face.x, face.y);
      this.ctx.rotate(face.rotation);
      this.ctx.fillText(face.emoji, 0, 0);
      this.ctx.restore();
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

  updateCallback(callback?: () => void): void {
    this.onThresholdCrossed = callback;
  }

  dispose(): void {
    this.faces = [];
  }
}

export class HappyFacesTheme implements Theme {
  private ctx: CanvasRenderingContext2D;
  private faces: Emojiface[] = [];
  private width = 0;
  private height = 0;
  private volumeLevel = 0;
  private onThresholdCrossed?: () => void;
  private emojis = ['😊', '😄', '😃', '😁', '😆', '🤣', '😂', '🥰', '😍', '🤩', '😋', '😎', '🤗', '🥳', '😌', '🔥', '⭐', '💖', '🎉', '🌟', '✨', '🎊', '🦄', '🌈', '🎨', '🎭', '🎪', '🎯', '⚡', '💫', '🐱', '🐶', '🐸', '🐼', '🦊', '🐻', '🐷', '🐵', '🦁', '🐯'];

  constructor(ctx: CanvasRenderingContext2D, onThresholdCrossed?: () => void) {
    this.ctx = ctx;
    this.onThresholdCrossed = onThresholdCrossed;
  }

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.faces = [];

    // Create high-density emoji faces spread out across full width and falling
    for (let i = 0; i < 80; i++) {
      const baseSize = Math.random() * 20 + 25;
      // Spread faces randomly across the full width
      const x = Math.random() * (width - baseSize) + baseSize / 2;
      this.faces.push({
        x: x,
        y: Math.random() * (height * 0.6) + baseSize / 2, // Start spread out in upper 60% of screen
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2, // Start falling
        size: baseSize,
        baseSize: baseSize,
        emoji: this.emojis[Math.floor(Math.random() * this.emojis.length)],
        crossedThreshold: false,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
      });
    }
  }

  update(volumeLevel: number, threshold: number = 70): void {
    this.volumeLevel = volumeLevel;
    const thresholdY = (this.height * (100 - threshold)) / 100;

    for (const face of this.faces) {
      // Store previous position for threshold crossing detection
      const prevY = face.y;
      
      // Update horizontal position
      face.x += face.vx;

      // Update vertical position
      face.y += face.vy;

      // Check for threshold crossing
      if (prevY >= thresholdY && face.y < thresholdY && !face.crossedThreshold) {
        face.crossedThreshold = true;
        if (this.onThresholdCrossed) {
          this.onThresholdCrossed();
        }
      } else if (face.y >= thresholdY) {
        face.crossedThreshold = false;
      }

      // Bounce off side walls
      if (face.x - face.size/2 < 0 || face.x + face.size/2 > this.width) {
        face.vx *= -0.8;
        face.x = Math.max(face.size/2, Math.min(this.width - face.size/2, face.x));
      }

      // Handle floor collision - stick to bottom when no volume
      const floorY = this.height - face.size/2;
      if (face.y >= floorY) {
        face.y = floorY;
        
        if (volumeLevel > 5) {
          // Only bounce random faces (about 10 at a time)
          if (Math.random() < 0.15) {
            // Scale bounce intensity to reach top of screen when maxed
            const maxBounceVelocity = Math.sqrt(2 * 0.6 * this.height); // Physics: reach top with gravity
            face.vy = -(volumeLevel / 100) * maxBounceVelocity;
          } else {
            face.vy = 0;
          }
        } else {
          // Stick to floor when quiet
          face.vy = 0;
        }
        
        // Add some horizontal movement when bouncing
        if (Math.abs(face.vx) < 1) {
          face.vx += (Math.random() - 0.5) * 2;
        }
      } else {
        // Apply gravity when in air
        face.vy += 0.6;
      }

      // Handle ceiling collision
      if (face.y - face.size/2 < 0) {
        face.vy = Math.abs(face.vy) * 0.8;
        face.y = face.size/2;
      }

      // Apply air resistance
      face.vx *= 0.99;
      face.vy *= 0.995;

      // Keep consistent size for better performance
      face.size = face.baseSize;

      // Update rotation based on movement
      face.rotation += face.rotationSpeed;
      face.rotationSpeed += (Math.abs(face.vx) + Math.abs(face.vy)) * 0.01;
      face.rotationSpeed *= 0.98; // Damping

      // Add random movement when volume is high
      if (volumeLevel > 20) {
        face.vx += (Math.random() - 0.5) * (volumeLevel / 150);
        face.rotationSpeed += (Math.random() - 0.5) * 0.05;
      }
    }
  }

  draw(): void {
    for (const face of this.faces) {
      this.ctx.save();
      this.ctx.font = `${face.size}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      // Apply rotation
      this.ctx.translate(face.x, face.y);
      this.ctx.rotate(face.rotation);
      this.ctx.fillText(face.emoji, 0, 0);
      this.ctx.restore();
    }
  }

  resize(width: number, height: number): void {
    const oldWidth = this.width;
    const oldHeight = this.height;
    this.width = width;
    this.height = height;
    
    // Only redistribute faces if this is the first resize or significant size change
    if (oldWidth === 0 || Math.abs(width - oldWidth) > 100) {
      this.redistributeFaces();
    }
  }

  private redistributeFaces(): void {
    // Redistribute existing faces across new width
    for (let i = 0; i < this.faces.length; i++) {
      const face = this.faces[i];
      // Spread faces randomly across the full width
      face.x = Math.random() * (this.width - face.baseSize) + face.baseSize / 2;
      // Keep current Y position but ensure it's within bounds
      face.y = Math.min(face.y, this.height - face.baseSize / 2);
    }
  }

  updateCallback(callback?: () => void): void {
    this.onThresholdCrossed = callback;
  }

  dispose(): void {
    this.faces = [];
  }
}

export class SnowfallTheme implements Theme {
  private ctx: CanvasRenderingContext2D;
  private snowflakes: Snowflake[] = [];
  private width = 0;
  private height = 0;
  private volumeLevel = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.snowflakes = [];

    // Create high-density snowflakes
    for (let i = 0; i < 200; i++) {
      this.snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        radius: Math.random() * 4 + 2,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }
  }

  update(volumeLevel: number): void {
    this.volumeLevel = volumeLevel;

    for (const snowflake of this.snowflakes) {
      // Update position
      snowflake.x += snowflake.vx;
      snowflake.y += snowflake.vy * (1 + volumeLevel / 100);

      // Wrap around screen
      if (snowflake.x < 0) snowflake.x = this.width;
      if (snowflake.x > this.width) snowflake.x = 0;
      if (snowflake.y > this.height) {
        snowflake.y = 0;
        snowflake.x = Math.random() * this.width;
      }

      // Add wind effect based on volume
      snowflake.vx += (Math.random() - 0.5) * (volumeLevel / 100);
      snowflake.vx *= 0.99; // Damping
    }
  }

  draw(): void {
    // Draw clouds
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    for (let i = 0; i < 5; i++) {
      const x = (i * this.width) / 5 + (this.width / 10);
      const y = 50 + Math.sin(Date.now() * 0.001 + i) * 20;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 60, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();

    // Draw snowflakes
    for (const snowflake of this.snowflakes) {
      this.ctx.save();
      this.ctx.globalAlpha = snowflake.opacity;
      this.ctx.fillStyle = 'white';
      this.ctx.beginPath();
      this.ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  dispose(): void {
    this.snowflakes = [];
  }
}

export class GrowingTreeTheme implements Theme {
  private ctx: CanvasRenderingContext2D;
  private branches: TreeBranch[] = [];
  private width = 0;
  private height = 0;
  private volumeLevel = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.branches = [];

    // Create main trunk
    this.branches.push({
      x: width / 2,
      y: height,
      angle: -Math.PI / 2,
      length: 0,
      width: 20,
      growth: 0,
      maxGrowth: 150,
    });

    // Create initial branches
    this.generateBranches(width / 2, height - 50, 0, 6);
  }

  private generateBranches(x: number, y: number, level: number, maxLevel: number): void {
    if (level >= maxLevel) return;

    const branches = level === 0 ? 2 : Math.random() < 0.7 ? 2 : 3;
    
    for (let i = 0; i < branches; i++) {
      const angle = (i / branches) * Math.PI - Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      const maxLength = 80 - level * 10;
      
      this.branches.push({
        x,
        y,
        angle,
        length: 0,
        width: Math.max(2, 15 - level * 2),
        growth: 0,
        maxGrowth: maxLength,
      });

      // Recursively generate more branches immediately
      if (level < maxLevel - 1) {
        this.generateBranches(
          x + Math.cos(angle) * maxLength,
          y + Math.sin(angle) * maxLength,
          level + 1,
          maxLevel
        );
      }
    }
  }

  update(volumeLevel: number): void {
    this.volumeLevel = volumeLevel;

    for (const branch of this.branches) {
      // Grow branches based on volume
      const growthRate = (volumeLevel / 100) * 2 + 0.5;
      branch.growth = Math.min(branch.maxGrowth, branch.growth + growthRate);
      branch.length = branch.growth;
    }
  }

  draw(): void {
    // Draw trunk and branches
    for (const branch of this.branches) {
      if (branch.length > 0) {
        this.ctx.save();
        this.ctx.strokeStyle = `hsl(${30 + Math.random() * 20}, 60%, ${30 + this.volumeLevel / 5}%)`;
        this.ctx.lineWidth = branch.width;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(branch.x, branch.y);
        this.ctx.lineTo(
          branch.x + Math.cos(branch.angle) * branch.length,
          branch.y + Math.sin(branch.angle) * branch.length
        );
        this.ctx.stroke();
        this.ctx.restore();

        // Draw leaves at the end of branches
        if (branch.length >= branch.maxGrowth * 0.8) {
          const leafX = branch.x + Math.cos(branch.angle) * branch.length;
          const leafY = branch.y + Math.sin(branch.angle) * branch.length;
          
          this.ctx.save();
          this.ctx.fillStyle = `hsl(${120 + Math.random() * 60}, 70%, ${50 + this.volumeLevel / 5}%)`;
          this.ctx.globalAlpha = 0.7;
          this.ctx.beginPath();
          this.ctx.arc(leafX, leafY, 5 + this.volumeLevel / 20, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        }
      }
    }
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  dispose(): void {
    this.branches = [];
  }
}

export class LiquidWavesTheme implements Theme {
  private ctx: CanvasRenderingContext2D;
  private particles: WaveParticle[] = [];
  private width = 0;
  private height = 0;
  private volumeLevel = 0;
  private time = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.particles = [];

    // Create wave particles
    for (let i = 0; i < 300; i++) {
      this.particles.push({
        x: (i / 300) * width,
        y: height / 2,
        baseY: height / 2,
        amplitude: Math.random() * 50 + 20,
        frequency: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2,
        color: `hsl(${200 + Math.random() * 160}, 70%, 60%)`,
      });
    }
  }

  update(volumeLevel: number): void {
    this.volumeLevel = volumeLevel;
    this.time += 0.05 + (volumeLevel / 100) * 0.05; // Speed varies with volume

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      // Update wave motion with more dramatic volume response
      const volumeMultiplier = 1 + (volumeLevel / 30);
      particle.y = particle.baseY + Math.sin(this.time * particle.frequency + particle.phase + i * 0.1) * particle.amplitude * volumeMultiplier;
      
      // Shift colors based on volume
      const hue = (200 + volumeLevel * 2 + i * 0.5) % 360;
      particle.color = `hsl(${hue}, 80%, ${40 + volumeLevel / 3}%)`;
    }
  }

  draw(): void {
    // Draw multiple wave layers
    for (let layer = 0; layer < 5; layer++) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.3 - layer * 0.05;
      this.ctx.strokeStyle = `hsl(${200 + layer * 30}, 70%, 60%)`;
      this.ctx.lineWidth = 3 + this.volumeLevel / 20;
      this.ctx.beginPath();

      for (let i = 0; i < this.particles.length; i++) {
        const particle = this.particles[i];
        const y = particle.y + layer * 20;
        
        if (i === 0) {
          this.ctx.moveTo(particle.x, y);
        } else {
          this.ctx.lineTo(particle.x, y);
        }
      }
      
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Draw particles
    for (const particle of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.6;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, 2 + this.volumeLevel / 50, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  dispose(): void {
    this.particles = [];
  }
}

export class FloatingBubblesTheme implements Theme {
  private ctx: CanvasRenderingContext2D;
  private bubbles: Bubble[] = [];
  private width = 0;
  private height = 0;
  private volumeLevel = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.bubbles = [];

    // Create high-density bubbles
    for (let i = 0; i < 150; i++) {
      this.bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 20 + 5,
        baseRadius: Math.random() * 20 + 5,
        opacity: Math.random() * 0.6 + 0.2,
        color: `hsl(${Math.random() * 360}, 60%, 70%)`,
      });
    }
  }

  update(volumeLevel: number): void {
    this.volumeLevel = volumeLevel;

    for (const bubble of this.bubbles) {
      // Update position
      bubble.x += bubble.vx;
      bubble.y += bubble.vy;

      // Wrap around screen
      if (bubble.x < -bubble.radius) bubble.x = this.width + bubble.radius;
      if (bubble.x > this.width + bubble.radius) bubble.x = -bubble.radius;
      if (bubble.y < -bubble.radius) bubble.y = this.height + bubble.radius;
      if (bubble.y > this.height + bubble.radius) bubble.y = -bubble.radius;

      // Scale radius based on volume more dramatically
      bubble.radius = bubble.baseRadius * (1 + volumeLevel / 100);

      // Add floating motion
      bubble.vy += Math.sin(Date.now() * 0.001 + bubble.x * 0.01) * 0.1;
      bubble.vx += Math.cos(Date.now() * 0.001 + bubble.y * 0.01) * 0.1;

      // Apply damping
      bubble.vx *= 0.995;
      bubble.vy *= 0.995;
    }
  }

  draw(): void {
    for (const bubble of this.bubbles) {
      this.ctx.save();
      this.ctx.globalAlpha = bubble.opacity;
      
      // Create gradient for bubble effect
      const gradient = this.ctx.createRadialGradient(
        bubble.x - bubble.radius * 0.3,
        bubble.y - bubble.radius * 0.3,
        0,
        bubble.x,
        bubble.y,
        bubble.radius
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, 0.8)`);
      gradient.addColorStop(0.7, bubble.color);
      gradient.addColorStop(1, `rgba(0, 0, 0, 0.2)`);
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add highlight
      this.ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
      this.ctx.beginPath();
      this.ctx.arc(bubble.x - bubble.radius * 0.3, bubble.y - bubble.radius * 0.3, bubble.radius * 0.2, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    }
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  dispose(): void {
    this.bubbles = [];
  }
}
