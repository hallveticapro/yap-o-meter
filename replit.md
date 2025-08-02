# Yap-o-Meter Application

## Overview

This is a React-based classroom voice meter application that provides real-time visual feedback for audio levels. The application monitors microphone input and displays dynamic visual themes that respond to volume levels, designed to help teachers and students manage classroom noise levels.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React hooks with local storage persistence
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Storage**: PostgreSQL sessions with connect-pg-simple
- **Development**: Hot reload with Vite integration

### Key Components

#### Audio Processing
- **Microphone Access**: Web Audio API for real-time audio capture
- **Volume Analysis**: Audio context with frequency analysis
- **Calibration**: Dynamic threshold adjustment based on ambient noise
- **Alert System**: Configurable audio alerts when volume thresholds are exceeded

#### Visual Theme
- **Canvas-based Rendering**: HTML5 Canvas for smooth animations
- **Bouncing Balls Theme**: 
  - High-density animated balls (80 balls) that start at screen bottom
  - Balls stick to floor when quiet, bounce higher with increased volume
  - Volume-responsive physics: louder sound = more intense bouncing
  - Colorful balls with slight size variations based on volume
  - Proper gravity system with floor collision detection
- **Real-time Animation**: 60fps animations with requestAnimationFrame

#### Settings Management
- **Hidden Sidebar**: Collapsible settings panel that slides in from the right
- **Local Storage**: Persistent user preferences
- **Configurable Options**: Theme selection, volume thresholds, alert settings
- **Calibration Tools**: Automatic and manual threshold adjustment
- **Status Panel**: Auto-hiding status display with mouse hover reactivation

### Data Flow

1. **Audio Capture**: Web Audio API captures microphone input
2. **Processing**: Audio analysis converts raw audio to volume levels
3. **State Updates**: React hooks update volume state in real-time
4. **Visual Rendering**: Canvas components render theme animations
5. **Threshold Monitoring**: Volume levels compared against user-defined thresholds
6. **Alert Triggers**: Audio/visual alerts fired when thresholds exceeded
7. **Settings Persistence**: User preferences saved to local storage

### External Dependencies

#### Core Libraries
- **React Ecosystem**: React, React DOM, React Query for data fetching
- **UI Framework**: Radix UI primitives, Tailwind CSS, shadcn/ui
- **Audio Processing**: Web Audio API (native browser API)
- **Canvas Animation**: HTML5 Canvas API (native browser API)

#### Database & Backend
- **Drizzle ORM**: Type-safe database operations
- **Neon Database**: Serverless PostgreSQL hosting
- **Express.js**: Web server framework

#### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Development server and build tool
- **ESBuild**: Fast JavaScript bundling
- **Drizzle Kit**: Database migrations and schema management

### Deployment Strategy

#### Development Environment
- **Dev Server**: Vite development server with hot module replacement
- **Database**: Neon PostgreSQL with connection pooling
- **Environment Variables**: DATABASE_URL for database connection

#### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database Migration**: Drizzle push for schema updates
- **Static Serving**: Express serves built frontend assets

#### Database Schema
- **Users Table**: Basic user authentication structure
- **PostgreSQL**: Using serial IDs, text fields for username/password
- **Validation**: Zod schemas for type-safe data validation

#### Key Design Decisions

1. **Canvas over SVG**: Canvas chosen for smooth 60fps animations with complex particle systems
2. **Local Storage**: Settings persisted locally to avoid database overhead for preferences
3. **Web Audio API**: Native browser API selected over external audio libraries for better performance
4. **Microphone Permissions**: Graceful permission handling with fallback UI states
5. **Theme Architecture**: Plugin-based theme system for easy extensibility
6. **Real-time Updates**: Direct state updates without WebSocket overhead for local audio processing
7. **Responsive Design**: Mobile-first approach with adaptive layouts
8. **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
9. **Performance Optimization**: Canvas emoji caching system for smooth large particle rendering
10. **Interactive Features**: Explosive click effects with smart threshold alert prevention

#### Recent Updates (August 2025)

- **Performance Breakthrough**: Implemented canvas caching system for emojis, enabling smooth dynamic sizing (30-60px)
- **Visual Enhancements**: Brightened seasonal gradients (0.6 opacity) with distinct color schemes
- **Interactive Features**: Added explosive click effects that launch particles into the air
- **Theme Improvements**: Updated all themes with proper emoji icons and consistent particle counts (120)
- **Smart Alert System**: Explosion-triggered threshold crossings don't trigger false alerts
- **Application Branding**: Renamed to "Yap-o-Meter" with updated branding in settings sidebar and copyright info
- **Docker Deployment**: Created simplified Docker setup for GitHub Container Registry deployment
- **SEO & Metadata**: Added comprehensive meta tags, favicon system, and Open Graph/Twitter cards for better discoverability
- **GitHub Integration**: Added GitHub repository link in settings sidebar with proper attribution to Andrew Hall
- **Social Media Attribution**: Added Threads, Instagram, and TikTok links (@hallveticapro) in settings sidebar
- **Reading Theme**: New educational theme with books, pencils, teachers, and library elements for literacy classes
- **Theme Organization**: Implemented nested theme groups (General, School, Seasons) for better categorization