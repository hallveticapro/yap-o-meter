# Voice Meter Application 🎤

A dynamic classroom voice monitoring application that provides real-time visual feedback for audio levels. This interactive tool helps educators and students manage classroom noise levels through engaging visual themes and responsive animations.

## Purpose

The Voice Meter Application is designed specifically for educational environments where managing classroom noise levels is essential for learning. By providing immediate visual feedback through fun, animated themes, it encourages students to be mindful of their volume levels while making the process engaging and interactive.

## Features

### 🎨 Visual Themes
- **Bouncing Balls**: Colorful geometric balls that bounce with increased volume
- **Emojis**: Fun emoji particles that dance and move with sound
- **Stars**: Twinkling star emojis that respond to audio levels
- **Hearts**: Loving heart emojis bouncing with joy
- **Geometric Shapes**: Various colorful geometric patterns in motion
- **Science Lab**: Science-themed emojis perfect for STEM classrooms
- **Math Class**: Mathematical symbols and numbers for math lessons
- **Seasonal Themes**:
  - **Spring Garden**: Flowers and spring elements with green/pink gradients
  - **Summer Beach**: Sun and beach vibes with gold/magenta gradients
  - **Autumn Leaves**: Fall colors with crimson/brown gradients
  - **Winter Wonderland**: Ice and snow with blue/purple gradients

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
docker run -p 5000:5000 ghcr.io/YOUR_USERNAME/voice-meter-app:main

# Or build locally
docker build -t voice-meter-app .
docker run -p 5000:5000 voice-meter-app

# With custom port
docker run -p 8080:8080 -e PORT=8080 ghcr.io/YOUR_USERNAME/voice-meter-app:main
```

The application will be available at `http://localhost:5000` (or your configured port).

## Educational Benefits

- **Immediate Feedback**: Students see real-time visual responses to their volume levels
- **Engaging Interface**: Fun themes keep students interested in managing noise
- **Self-Regulation**: Encourages students to monitor their own behavior
- **Classroom Management**: Helps teachers maintain appropriate learning environments
- **STEM Integration**: Science and Math themes reinforce subject matter
- **Seasonal Engagement**: Holiday themes maintain year-round interest

---

**Made for educators with love** ❤️

*This application was built completely using Replit AI*