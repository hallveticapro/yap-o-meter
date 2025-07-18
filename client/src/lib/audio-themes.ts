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

export class BouncingBallsTheme implements Theme {
  private ctx: CanvasRenderingContext2D;
  private balls: Ball[] = [];
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
