# Yap-o-Meter 🎤

A dynamic classroom voice monitoring application that provides real-time visual feedback for audio levels. This interactive tool helps educators and students manage classroom noise levels through engaging visual themes and responsive animations.

## Purpose

The Yap-o-Meter is designed specifically for educational environments where managing classroom noise levels is essential for learning. By providing immediate visual feedback through fun, animated themes, it encourages students to be mindful of their volume levels while making the process engaging and interactive.

## ✨ Recent Updates (August 2025)

- **Performance Breakthrough**: Canvas emoji caching system enables smooth dynamic sizing (30-60px) without lag
- **Enhanced Visual Themes**: Each theme now has unique, vibrant gradient backgrounds
- **Explosive Interactions**: Click anywhere to launch particles with smart threshold alert prevention  
- **Professional Branding**: Complete SEO setup with favicons, social cards, and metadata
- **Docker Deployment**: Production-ready containerization with GitHub Actions CI/CD
- **Open Source**: Full source code available with proper attribution and social links
- **Reading Theme**: New educational theme with books, pencils, and library emojis
- **Organized Theme Groups**: Nested categories for School and Seasons themes
- **FontAwesome Icons**: Clean, professional social media and GitHub icons

## Features

### 🎨 Visual Themes

Each theme features unique, vibrant gradient backgrounds that create immersive visual experiences without distracting animations.

#### General Themes
- **Bouncing Balls**: Colorful geometric balls that bounce with increased volume (subtle gradient background)
- **Emojis**: Fun emoji particles that dance and move with sound (bright rainbow gradient background)
- **Stars**: Twinkling star emojis that respond to audio levels (deep space background with nebula and planets)
- **Hearts**: Loving heart emojis bouncing with joy (Valentine's Day pink-to-red gradient background)
- **Geometric Shapes**: Various colorful geometric patterns in motion (modern tech purple-to-blue gradient background)

#### School Themes
- **Science Lab**: Science-themed emojis perfect for STEM classrooms
- **Math Class**: Mathematical symbols and numbers for math lessons
- **Reading Time**: Books, pencils, teachers, and library learning elements

#### Seasonal Themes
- **Spring Garden**: Flowers and spring elements with pink-to-green-to-forest green gradient
- **Summer Beach**: Sun and beach vibes with gold-to-orange-to-pink-to-violet sunset gradient
- **Fall Leaves**: Fall colors with crimson-to-orange-to-gold-to-brown gradient
- **Winter Wonderland**: Ice and snow with light blue-to-purple-to-white gradient

### 🔊 Audio Features
- **Real-time Audio Processing**: Uses Web Audio API for instant volume detection
- **Automatic Calibration**: Adjusts to ambient noise levels
- **Configurable Thresholds**: Set custom volume limits
- **Audio Alerts**: Optional sound notifications when thresholds are exceeded
- **Microphone Permission Handling**: Graceful fallback when mic access is denied

### ⚙️ Interactive Features
- **Explosive Click Effects**: Click anywhere to create particle explosions
- **Threshold Line**: Visual indicator for volume limits
- **Pause/Resume System**: Control the animation at any time
- **Performance Optimized**: Canvas caching for smooth 60fps animations
- **Dynamic Particle Sizing**: Variety in particle sizes for visual appeal

### 🎛️ Settings & Controls
- **Hidden Settings Sidebar**: Collapsible panel with all controls
- **Theme Selection**: Easy switching between visual themes
- **Volume Sensitivity**: Adjustable microphone sensitivity
- **Threshold Configuration**: Set custom noise level limits
- **Alert Volume Control**: Adjust notification sound levels
- **Auto-hiding Status Panel**: Displays current settings and volume levels

## How to Use

### Getting Started
1. **Grant Microphone Permission**: Click "Allow" when prompted for microphone access
2. **Choose a Theme**: Open the settings sidebar and select your preferred visual theme
3. **Calibrate**: Use the calibration feature to adjust for your room's ambient noise
4. **Set Thresholds**: Configure volume limits appropriate for your classroom

### During Class
- **Monitor Volume**: Watch the visual feedback respond to classroom noise levels
- **Interactive Fun**: Click anywhere on the screen to create particle explosions
- **Threshold Alerts**: Receive notifications when volume exceeds set limits
- **Pause if Needed**: Use the pause button during quiet activities

### Customization
- **Seasonal Themes**: Switch themes to match holidays or seasons
- **Subject-Specific Themes**: Use Science or Math themes for relevant lessons
- **Sensitivity Adjustment**: Fine-tune microphone sensitivity for your environment
- **Alert Preferences**: Enable/disable audio notifications as needed

## Technical Requirements

- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge
- **Microphone Access**: Required for audio level detection
- **JavaScript Enabled**: Essential for application functionality
- **Audio Context Support**: Modern browsers with Web Audio API support

## Installation & Setup

### Web Browser (Recommended)
This application runs entirely in the browser with no installation required:

1. Open the application in your web browser
2. Grant microphone permissions when prompted
3. Start using immediately with default settings
4. Customize themes and settings as desired

### Docker Deployment
For self-hosting or production deployment:

```bash
# Pull and run the pre-built image
docker run -p 5000:5000 ghcr.io/hallveticapro/yap-o-meter:main

# Or build locally
git clone https://github.com/hallveticapro/yap-o-meter.git
cd yap-o-meter
docker build -t yap-o-meter .
docker run -p 5000:5000 yap-o-meter

# With custom port (map external port 8080 to internal port set by PORT env var)
docker run -p 8080:8080 -e PORT=8080 ghcr.io/hallveticapro/yap-o-meter:main

# Using Docker Compose
PORT=5000 docker-compose up -d
```

The application will be available at `http://localhost:5000` (or your configured port).

#### Deployment Features
- **Multi-platform builds** (amd64, arm64) via GitHub Actions
- **Automatic tagging** with `latest` and branch names
- **Health checks** built into container
- **Non-root security** with proper signal handling
- **Production optimization** with separate build and runtime stages

## Educational Benefits

- **Immediate Feedback**: Students see real-time visual responses to their volume levels
- **Engaging Interface**: Fun themes keep students interested in managing noise
- **Self-Regulation**: Encourages students to monitor their own behavior
- **Classroom Management**: Helps teachers maintain appropriate learning environments
- **STEM Integration**: Science and Math themes reinforce subject matter
- **Seasonal Engagement**: Holiday themes maintain year-round interest

## Technical Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with shadcn/ui component library
- **Web Audio API** for real-time microphone processing
- **HTML5 Canvas** for smooth 60fps animations

### Backend  
- **Express.js** server with TypeScript
- **PostgreSQL** database with Drizzle ORM
- **Session management** with secure storage
- **RESTful API** design patterns

### Performance Optimizations
- **Canvas emoji caching** for smooth large-scale particle rendering
- **RequestAnimationFrame** for consistent 60fps animations
- **Efficient particle physics** with proper collision detection
- **Memory management** with particle cleanup and recycling

### Deployment & DevOps
- **Docker containerization** with multi-stage builds
- **GitHub Actions** for automated CI/CD
- **Multi-platform support** (amd64, arm64)
- **Production optimizations** with separate dev/prod servers
- **Security hardening** with non-root containers and health checks

### Recent Technical Challenges & Solutions

#### Docker Production Build Issues (August 2025)
**Challenge**: Vite development server caused runtime failures in Docker production builds due to missing dev dependencies.

**Solution**: Created separate production server (`production.ts`) that serves static files without importing Vite, while maintaining development server (`index.ts`) with hot reload for local development.

#### Canvas Performance Optimization
**Challenge**: Rendering 120+ emoji particles at 60fps with dynamic sizing caused significant lag and memory issues.

**Solution**: Implemented canvas-based emoji caching system that pre-renders emojis at different sizes, eliminating repeated drawing operations and enabling smooth animations.

#### Stars Theme Visibility
**Challenge**: Black star particles were nearly invisible against dark space backgrounds, reducing visual impact.

**Solution**: Enhanced space theme with colorful nebula effects, planets with rings, and improved star contrast while maintaining authentic deep space aesthetic.

---

## Connect

Follow Andrew Hall for updates and more educational tools:
- **GitHub**: [hallveticapro/yap-o-meter](https://github.com/hallveticapro/yap-o-meter)
- **Threads**: [@hallveticapro](https://www.threads.net/@hallveticapro)
- **Instagram**: [@hallveticapro](https://www.instagram.com/hallveticapro)
- **TikTok**: [@hallveticapro](https://www.tiktok.com/@hallveticapro)

**Made for educators with love** ❤️

*Created by Andrew Hall using Replit AI*