export interface Theme {
  init(width: number, height: number): void;
  update(volumeLevel: number, threshold?: number): void;
  draw(): void;
  resize(width: number, height: number): void;
  updateCallback(callback?: () => void): void;
  dispose(): void;
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

    for (let i = 0; i < 80; i++) {
      const baseSize = Math.random() * 15 + 10;
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
  private stars: Star[] = [];
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
    this.stars = [];

    for (let i = 0; i < 80; i++) {
      const baseSize = Math.random() * 20 + 15;
      const x = Math.random() * (width - baseSize) + baseSize / 2;
      this.stars.push({
        x: x,
        y: Math.random() * (height * 0.6) + baseSize / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2,
        size: baseSize,
        baseSize: baseSize,
        opacity: Math.random() * 0.5 + 0.5,
        crossedThreshold: false,
      });
    }
  }

  update(volumeLevel: number, threshold: number = 70): void {
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
      star.size = star.baseSize + Math.sin(Date.now() * 0.01 + star.x * 0.01) * 3;
      star.opacity = 0.5 + Math.sin(Date.now() * 0.01 + star.x * 0.01) * 0.3;

      if (volumeLevel > 20) {
        star.vx += (Math.random() - 0.5) * (volumeLevel / 150);
      }
    }
  }

  private drawStar(x: number, y: number, size: number, opacity: number): void {
    const spikes = 5;
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.4;
    const step = Math.PI / spikes;

    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.beginPath();
    
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = i * step - Math.PI / 2;
      const pointX = x + Math.cos(angle) * radius;
      const pointY = y + Math.sin(angle) * radius;
      
      if (i === 0) {
        this.ctx.moveTo(pointX, pointY);
      } else {
        this.ctx.lineTo(pointX, pointY);
      }
    }
    
    this.ctx.closePath();
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fill();
    this.ctx.restore();
  }

  draw(): void {
    for (const star of this.stars) {
      this.drawStar(star.x, star.y, star.size, star.opacity);
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
  private hearts: Heart[] = [];
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
    this.hearts = [];

    const colors = ['#FF69B4', '#FF1493', '#DC143C', '#B22222', '#8B0000'];

    for (let i = 0; i < 80; i++) {
      const baseSize = Math.random() * 20 + 15;
      const x = Math.random() * (width - baseSize) + baseSize / 2;
      this.hearts.push({
        x: x,
        y: Math.random() * (height * 0.6) + baseSize / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2,
        size: baseSize,
        baseSize: baseSize,
        opacity: Math.random() * 0.3 + 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
        crossedThreshold: false,
      });
    }
  }

  update(volumeLevel: number, threshold: number = 70): void {
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
      heart.size = heart.baseSize + Math.sin(Date.now() * 0.01 + heart.x * 0.01) * 3;
      heart.opacity = 0.7 + Math.sin(Date.now() * 0.01 + heart.x * 0.01) * 0.2;

      if (volumeLevel > 20) {
        heart.vx += (Math.random() - 0.5) * (volumeLevel / 150);
      }
    }
  }

  private drawHeart(x: number, y: number, size: number, color: string, opacity: number): void {
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = color;
    
    const width = size;
    const height = size * 0.8;
    
    this.ctx.beginPath();
    const topCurveHeight = height * 0.3;
    this.ctx.moveTo(x, y + topCurveHeight);
    
    // Left curve
    this.ctx.bezierCurveTo(
      x, y, 
      x - width / 2, y,
      x - width / 2, y + topCurveHeight
    );
    
    // Right curve  
    this.ctx.bezierCurveTo(
      x - width / 2, y + (height + topCurveHeight) / 2,
      x, y + (height + topCurveHeight) / 2,
      x, y + height
    );
    
    this.ctx.bezierCurveTo(
      x, y + (height + topCurveHeight) / 2,
      x + width / 2, y + (height + topCurveHeight) / 2,
      x + width / 2, y + topCurveHeight
    );
    
    this.ctx.bezierCurveTo(
      x + width / 2, y,
      x, y,
      x, y + topCurveHeight
    );
    
    this.ctx.fill();
    this.ctx.restore();
  }

  draw(): void {
    for (const heart of this.hearts) {
      this.drawHeart(heart.x, heart.y, heart.size, heart.color, heart.opacity);
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
  private onThresholdCrossed?: () => void;

  constructor(ctx: CanvasRenderingContext2D, onThresholdCrossed?: () => void) {
    this.ctx = ctx;
    this.onThresholdCrossed = onThresholdCrossed;
  }

  init(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.shapes = [];

    const shapeTypes: Shape['type'][] = ['triangle', 'square', 'pentagon', 'hexagon'];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];

    for (let i = 0; i < 80; i++) {
      const baseSize = Math.random() * 20 + 20;
      const x = Math.random() * (width - baseSize) + baseSize / 2;
      this.shapes.push({
        x: x,
        y: Math.random() * (height * 0.6) + baseSize / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2,
        size: baseSize,
        baseSize: baseSize,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        crossedThreshold: false,
        opacity: Math.random() * 0.3 + 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  update(volumeLevel: number, threshold: number = 70): void {
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
      shape.size = shape.baseSize + Math.sin(Date.now() * 0.01 + shape.x * 0.01) * 3;
      shape.rotation += shape.rotationSpeed;
      shape.rotationSpeed += (Math.abs(shape.vx) + Math.abs(shape.vy)) * 0.001;

      if (volumeLevel > 20) {
        shape.vx += (Math.random() - 0.5) * (volumeLevel / 150);
        shape.rotationSpeed += (Math.random() - 0.5) * 0.01;
      }
    }
  }

  private drawShape(shape: Shape): void {
    this.ctx.save();
    this.ctx.translate(shape.x, shape.y);
    this.ctx.rotate(shape.rotation);
    this.ctx.globalAlpha = shape.opacity;
    this.ctx.fillStyle = shape.color;
    this.ctx.strokeStyle = shape.color;
    this.ctx.lineWidth = 2;

    const radius = shape.size / 2;
    
    switch (shape.type) {
      case 'triangle':
        this.ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) this.ctx.moveTo(x, y);
          else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        break;
      case 'square':
        this.ctx.fillRect(-radius, -radius, shape.size, shape.size);
        break;
      case 'pentagon':
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) this.ctx.moveTo(x, y);
          else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        break;
      case 'hexagon':
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * 2 * Math.PI) / 6;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (i === 0) this.ctx.moveTo(x, y);
          else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        break;
    }
    
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();
  }

  draw(): void {
    for (const shape of this.shapes) {
      this.drawShape(shape);
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
export class SpringTheme extends BaseEmojiTheme {
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
export class SummerTheme extends BaseEmojiTheme {
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
export class AutumnTheme extends BaseEmojiTheme {
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
export class WinterTheme extends BaseEmojiTheme {
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
export class HappyFacesTheme extends BaseEmojiTheme {
  protected getEmojis(): string[] {
    return ['😊', '😄', '😃', '😁', '😆', '🤣', '😂', '🥰', '😍', '🤩', '😋', '😎', '🤗', '🥳', '😌', '🔥', '⭐', '💖', '🎉', '🌟', '✨', '🎊', '🦄', '🌈', '🎨', '🎭', '🎪', '🎯', '⚡', '💫', '🐱', '🐶', '🐸', '🐼', '🦊', '🐻', '🐷', '🐵', '🦁', '🐯'];
  }
}