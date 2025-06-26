# Stick Runner

<div align="center">
  <h2>🏃 3D Endless Runner Game 🏃</h2>
  <p><strong>Three.js로 구현한 3D 자동 달리기 게임</strong></p>
  <br>
  <a href="#">🎮 Play Game</a> | <a href="#how-to-run">💻 Run Locally</a>
</div>

A 3D endless runner game built with Three.js featuring automatic running, jump/slide mechanics, and progressive difficulty.

*Featuring cute-robots 3D models with CC-BY-4.0 license*

**Character Attribution:**
This work is based on "Cute Robots - Low Poly - Rigged - Animated" 
([Sketchfab](https://sketchfab.com/3d-models/cute-robots-low-poly-rigged-animated-c9938d49af2d4bf7abe40e366d37a5d0)) 
by m1ch3lang3lo ([berkankirmitt](https://sketchfab.com/berkankirmitt)) 
licensed under [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/)

## Game Overview

- **Genre**: 3D Endless Runner with Progressive Difficulty
- **Character**: Animated cute robot with professional rigging and animations
- **Environment**: Infinite 3D running track with dynamic obstacles
- **Mechanics**: Automatic running with manual obstacle avoidance
- **Performance**: Optimized for 60 FPS across all platforms

## How to Play

### 🎮 Controls
- **Desktop**: 
  - **Jump**: SPACEBAR, ↑ Arrow Key, W Key
  - **Slide**: ↓ Arrow Key, S Key
- **Mobile**: 
  - **Jump**: Touch upper half of screen
  - **Slide**: Touch lower half of screen
- **Restart**: Click restart button or reload page after game over

### 🎯 Gameplay
1. **Auto-Running**: Character runs automatically forward
2. **Obstacle Avoidance**: 
   - **Red obstacles (high)**: Use slide to duck under
   - **Teal obstacles (low)**: Use jump to leap over
3. **Progressive Speed**: Game speed increases with distance traveled
4. **Scoring System**: Earn points for obstacles passed and distance covered
5. **Game Over**: Collision with obstacles ends the game

## Game Features

### 🎮 Core Gameplay
- **Automatic Running**: Cute robot character runs continuously forward
- **Dual Movement System**: Jump and slide mechanics for obstacle avoidance
- **Progressive Difficulty**: Speed increases incrementally with distance
- **Responsive Controls**: Smooth input handling for precise movement
- **Endless Gameplay**: Infinite running track with procedural obstacles

### 🎨 Visual Features
- **3D Graphics**: Full Three.js 3D rendering with WebGL
- **Dynamic Lighting**: Realistic shadows and lighting effects
- **Particle Systems**: Dust particles and environmental effects
- **Parallax Scrolling**: Multi-layer background movement for depth
- **Smooth Animations**: Fluid character and obstacle animations

### 📱 Platform Support
- **Cross-Platform**: Works on desktop, tablet, and mobile devices
- **Touch Controls**: Optimized touch interface for mobile gameplay
- **Responsive Design**: Adapts to various screen sizes and orientations
- **Performance Optimized**: Maintains 60 FPS on modern devices

## Technical Stack

### Core Technologies
- **Three.js (r128)**: 3D graphics rendering and scene management
- **WebGL**: Hardware-accelerated 3D graphics
- **JavaScript ES6+**: Modern JavaScript with classes and modules
- **HTML5 Canvas**: Rendering context for 3D graphics
- **CSS3**: Responsive UI styling and animations

### Development Tools
- **CDN Integration**: Three.js loaded via CloudFlare CDN
- **No Build Process**: Direct browser execution
- **Cross-Browser Compatibility**: Supports all modern browsers
- **Mobile Optimization**: Touch event handling and performance tuning

## Game Mechanics

### Obstacle System
- **High Obstacles (Red)**: 
  - Height: Above player's normal running position
  - Avoidance: Use slide action to duck underneath
  - Visual: Red colored geometric shapes
- **Low Obstacles (Teal)**:
  - Height: At ground level blocking normal running
  - Avoidance: Use jump action to leap over
  - Visual: Teal/cyan colored geometric shapes
- **Spawn Pattern**: Obstacles appear at regular intervals with increasing frequency
- **Collision Detection**: Precise 3D collision detection with player model

### Scoring System
- **Obstacle Points**: 10 points per successfully avoided obstacle
- **Distance Scoring**: Points awarded based on total distance traveled
- **Speed Multiplier**: Higher speeds yield increased point values
- **Bonus System**: Consecutive successful obstacle avoidance provides bonus points

### Physics & Movement
- **Running Speed**: Starts at base speed, increases with distance
- **Jump Mechanics**: Fixed jump height and duration with gravity
- **Slide Mechanics**: Temporary height reduction for ducking
- **Collision Response**: Immediate game over on obstacle contact
- **Animation Timing**: Smooth transitions between run, jump, and slide states

## Asset Requirements

### 3D Models & Textures
- **Character Model**: Cute robot GLTF model (8.7MB) with professional rigging and animations
- **Obstacle Models**: Geometric shapes for high and low obstacles
- **Environment Assets**: Ground texture, background elements
- **Particle Textures**: Dust and effect sprites

### Audio Assets (Planned)
- **Running Sounds**: Footstep audio loops
- **Jump/Slide SFX**: Action sound effects
- **Collision Sounds**: Game over audio feedback
- **Background Music**: Optional ambient soundtrack

### UI Elements
- **Score Display**: Real-time score and distance tracking
- **Speed Indicator**: Current speed multiplier display
- **Game Over Screen**: Final score and restart options
- **Control Instructions**: Input method guidance

## Implementation Status

### ✅ Completed Components
- **HTML Structure**: Complete responsive game interface
- **UI Styling**: Gradient backgrounds, buttons, and overlays
- **Control Instructions**: Desktop and mobile control guidance
- **Game State Management**: Start screen, game over screen logic
- **Three.js Integration**: CDN loading and GLTF loader setup
- **3D Scene Setup**: Camera, lighting, and renderer configuration
- **Robot Character**: GLTF model loading with animation system
- **Character Controller**: Player movement and animation system
- **Obstacle System**: Procedural obstacle generation and collision
- **Physics Engine**: Jump/slide mechanics and collision detection
- **Scoring System**: Point calculation and display updates
- **Performance Optimization**: 60 FPS optimization and mobile support

### 🚧 Future Enhancements
- **Audio Integration**: Sound effect implementation
- **Multiple Robot Characters**: Character selection system
- **Power-ups**: Special abilities and collectibles
- **Leaderboards**: High score tracking system

### 📋 Implementation Summary
✅ **Completed Implementation**:
1. **Core Game Loop**: Scene rendering and update cycle ✅
2. **Robot Character**: GLTF model loading and animation system ✅
3. **Environment**: Ground plane and infinite scrolling ✅
4. **Obstacle Generation**: Dynamic obstacle spawning system ✅
5. **Collision Detection**: 3D bounding box collision checking ✅
6. **UI Integration**: Score updates and game state management ✅
7. **Performance Optimization**: 60 FPS optimization and mobile tuning ✅
8. **Cross-platform Support**: Desktop and mobile controls ✅

🎮 **Game is now fully playable!**

## How to Run

### 🌐 Play Online
*Ready for deployment - game fully implemented with robot character*

### 💻 Run Locally
1. Clone this repository
2. Navigate to `docs/stick-runner/`
3. Open `index.html` in a web browser or use a local web server for optimal performance:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

### 🛠️ Development Setup
1. **No Build Process Required**: Direct browser execution
2. **Three.js CDN**: Automatically loaded from CloudFlare CDN with GLTF loader
3. **Development Server**: Use local server for GLTF model loading
4. **Browser DevTools**: Use for debugging and performance monitoring
5. **Mobile Testing**: Test on actual devices for touch controls
6. **Robot Assets**: Cute-robots GLTF models automatically loaded from `../cute-robots/`

## Performance Targets

### Desktop Performance
- **Frame Rate**: Maintain 60 FPS on modern desktops
- **Resolution**: Support up to 1920x1080 rendering
- **Memory Usage**: Keep under 100MB total memory consumption
- **CPU Usage**: Optimize for smooth gameplay on mid-range hardware

### Mobile Performance
- **Frame Rate**: Target 60 FPS on modern mobile devices, 30 FPS minimum
- **Touch Response**: <50ms input latency for touch controls
- **Battery Optimization**: Efficient rendering to minimize battery drain
- **Memory Management**: Aggressive garbage collection and object pooling

## Browser Compatibility

### Supported Browsers
- **Chrome**: Version 60+ (recommended)
- **Firefox**: Version 55+
- **Safari**: Version 12+ (iOS 12+)
- **Edge**: Version 79+

### WebGL Requirements
- **WebGL 1.0**: Minimum requirement for Three.js rendering
- **Hardware Acceleration**: Required for optimal performance
- **Mobile GPU**: Support for mobile WebGL implementations

## Development Notes

This game serves as a demonstration of:
- **3D Web Gaming**: Browser-based 3D game development
- **Three.js Proficiency**: Advanced 3D graphics programming
- **Mobile Optimization**: Touch controls and performance tuning
- **Progressive Difficulty**: Dynamic gameplay balancing
- **Responsive Design**: Cross-platform user interface development

*Game fully implemented with cute robot character! Ready to play and deploy.*
