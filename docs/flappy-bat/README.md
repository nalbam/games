# Flappy Bat

<div align="center">
  <a href="https://nalbam.github.io/flappy-bat/">
    <img src="./docs/images/game.png" alt="Flappy Bat Logo" width="300">
  </a>
  <br>
  <a href="https://nalbam.github.io/flappy-bat/">🎮 Play Game</a>
</div>

A simple flappy bat game built with HTML5 Canvas and JavaScript.

*Created with Amazon Q Developer - AI-powered coding assistant*

## Game Overview

- **Genre**: Side-scrolling 2D Arcade with Power-ups
- **Character**: Bat with multiple forms (Normal, Fever, Dead)
- **Controls**: SPACEBAR/Click/Touch → Flap wings (fly up)
- **Physics**: Realistic gravity and momentum-based flight
- **Obstacles**: Destructible rock pillars with physics
- **Environment**: Moving rocky cave with dynamic effects
- **Special Features**: Fever Mode with torch collection system
- **Performance**: 60 FPS locked across all platforms

## How to Play

### 🎮 Controls
- **Desktop**: SPACEBAR or Click to flap wings
- **Mobile**: Touch screen to flap wings
- **Restart**: Press R key or Click/Touch after game over

### 🎯 Gameplay
1. **Start Game**: Press SPACEBAR, Click, or Touch to begin
2. **Control Bat**: 
   - Press SPACEBAR, Click, or Touch to flap wings and fly up
   - Release to let gravity pull the bat down
3. **Navigate Obstacles**: Fly through gaps between destructible rock pillars
4. **Collect Torches**: Every 10 obstacles passed spawns a torch at random location
5. **Activate Fever Mode**: Touch a torch to become a giant, invincible bat
6. **Fever Mode Powers**: 
   - 2x larger size (giant bat)
   - 4x faster speed (ultra-fast movement)
   - Invincible to rock collisions (destroy rocks instead)
   - 5-second duration with timer bar
7. **Score Points**: Each obstacle passed increases your score
8. **Game Over**: Collision with rocks, ceiling, or floor ends the game (except in Fever Mode)
9. **Restart**: Use R key or click Restart button to play again

### 📱 Mobile Optimized
- Responsive design works on all devices
- Touch controls for smartphones and tablets
- Optimized performance for iOS and Android
- Full-screen gameplay experience

## Game Features

### 🎮 Core Gameplay
- **Fullscreen Display**: Responsive design that fills the entire browser window
- **Cross-Platform Performance**: 60 FPS locked on Windows, Mac, iOS, and Android
- **Advanced Physics**: Gravity, momentum, and realistic object destruction
- **Multiple Bat Forms**: Normal (2 animations), Fever (giant), and Death states
- **Progressive Difficulty**: Obstacles become more challenging over time

### 🔥 Fever Mode System
- **Torch Collection**: Spawns every 10 obstacles at random locations
- **Giant Bat Transformation**: 2x size increase with fever sprite
- **Super Speed**: 4x movement speed (24 vs 6 pixels/frame)
- **Invincibility**: Destroy rocks instead of dying on collision
- **Visual Feedback**: "FEVER MODE!" text and countdown timer bar
- **Duration**: 5-second power-up with real-time timer

### 🎨 Visual & Audio
- **Dynamic Animations**: Wing flapping responds to movement and input
- **Destructible Environment**: Rocks break into physics-based pieces
- **Realistic Destruction**: Rock pieces fall, bounce, and settle naturally
- **Immersive Audio**: Wing flaps, collisions, explosions, and power-up sounds
- **Visual Effects**: Glowing torch effects and fever mode indicators
- **Responsive UI**: Restart button, score display, and fever mode status

### 🛠️ Technical Features
- **Asset Loading**: Safe image loading with progress indicator
- **Debug Mode**: Visual collision area display (disabled by default)
- **Precise Collision**: Accurate detection matching visual boundaries
- **Mobile Optimization**: Performance tuning for iOS and Android
- **Audio Throttling**: Performance-optimized sound system
- **Memory Management**: Efficient object pooling and cleanup

## Game Assets

### Images
- **Bat Animation Sprites**: 
  - [bat1.png](./docs/images/bat1.png) - Wings spread (300x223) - Gliding/falling
  - [bat2.png](./docs/images/bat2.png) - Wings folded (300x223) - Jumping/flapping
  - [bat_dead.png](./docs/images/bat_dead.png) - Dead state (300x317) - Game over
  - [bat_fever.png](./docs/images/bat_fever.png) - Fever mode (400x353) - Power-up state
- **Power-up Items**:
  - [torch.png](./docs/images/torch.png) - Fever mode trigger (170x300)
- **Environment**:
  - [rock.png](./docs/images/rock.png) - Destructible rock texture
  - [game.png](./docs/images/game.png) - Game logo

### Sound Effects
- **Wing Flap**: [Bat_takeoff.ogg](./docs/sounds/Bat_takeoff.ogg) - Jump/flap sound
- **Power-up Sounds**: Bat_idle1-4.ogg (4 variations) - Torch collection & game start
- **Collision Sounds**: Bat_hurt1-3.ogg (3 variations) - Rock collision damage
- **Destruction Effects**: Explosion1-4.ogg (4 variations) - Rock breaking sounds

## Source Code

- **Game Logic**: [game.js](./docs/game.js)
- **HTML Page**: [index.html](./docs/index.html)

## How to Run

### 🌐 Play Online
Visit: **https://nalbam.github.io/flappy-bat/**

### 💻 Run Locally
1. Clone this repository
2. Open `docs/index.html` in a web browser
3. Press SPACEBAR, Click, or Touch to start playing
4. Enjoy the game!

## Game Mechanics

### Basic Physics
- **Screen Size**: 1600x1200 pixels (high-resolution, fullscreen display)
- **Bat Sizes**: 
  - Normal: 121x90 pixels (bat1/bat2)
  - Dead: 85x90 pixels (bat_dead)
  - Fever: 204x180 pixels (bat_fever - 2x larger)
- **Jump Force**: -16 velocity units
- **Gravity**: 1.0 acceleration per frame (bat), 0.3 (rock pieces)
- **Movement Speeds**: 
  - Normal: 6 pixels per frame
  - Fever Mode: 24 pixels per frame (4x faster)
- **Rock Specifications**: 
  - Width: 160 pixels
  - Gap: 360 pixels between rock pillars
  - Spawn Rate: Every 90 frames (~1.5 seconds at 60 FPS)
- **Cave Boundaries**: 60px ceiling and floor collision zones

### Fever Mode Mechanics
- **Activation**: Collect torch (spawns every 10 obstacles)
- **Torch Size**: 51x90 pixels (170x300 source ratio)
- **Duration**: 300 frames (5 seconds at 60 FPS)
- **Effects**: Giant size, 4x speed, invincibility to rocks
- **Visual Timer**: Real-time countdown bar display

### Animation System
- **Normal Mode Animations**:
  - Jump: Wings spread (bat1) → Wings folded (bat2)
  - Falling: Wings spread for gliding
  - Idle: Natural wing flapping cycle (20 frames)
  - Rapid Input: Faster wing animation on consecutive jumps
  - Timing: 12 frames (normal), 8 frames (rapid)
- **Fever Mode**: Giant bat_fever sprite with enhanced visual effects
- **Death Animation**: bat_dead sprite with rotation effects

### Collision & Destruction
- **Collision Detection**: Precise collision matching visual boundaries
- **Rock Destruction**: Individual 90-pixel rock pieces with realistic physics
- **Normal Mode**: Collision with rocks causes game over + rock destruction
- **Fever Mode**: Collision destroys rocks but bat continues (invincible)
- **Rock Physics**: 
  - Top rocks: Fall and scatter on collision
  - Bottom rocks: Tip over in collision direction
  - Ground settling: Pieces settle on cave floor (60px from bottom)
  - Friction: 0.7 coefficient when pieces hit ground
  - Rotation: Individual piece rotation with momentum

### Audio System
- **Wing Flap**: Plays on every jump input (SPACEBAR/Click/Touch)
- **Game Start**: Random idle sound after countdown
- **Normal Collision**: Simultaneous hurt + explosion sounds (game over)
- **Fever Collision**: Explosion sound only (no hurt sound, continues playing)
- **Torch Collection**: Random idle sound for power-up feedback
- **Performance**: 50ms throttling to prevent audio overlap on mobile
- **Volume**: All sounds at 50% with mobile optimization

## Development

This game was developed using **Claude Code**, an AI-powered coding assistant that helped with:
- Game logic implementation
- Advanced physics and collision detection
- Dynamic rock destruction system
- Bat animation system implementation
- Image rendering and smooth animations
- Audio system integration
- Asset loading and error handling
- Cave boundary collision fixes
- Score tracking system
- Code optimization and debugging

## Technical Features

### Rock Physics Engine
- Individual rock pieces with unique physics properties
- Realistic gravity, rotation, and collision mechanics
- Dynamic destruction based on collision direction
- Ground friction and settling behavior

### Sound System
- Multiple audio file format support (.ogg)
- Random sound selection for variety
- Audio error handling and fallback
- Optimized audio loading and playback

### Visual Effects
- Real-time rock breaking animation
- Dynamic bat wing animations
- Smooth 60 FPS rendering
- Asset loading screen with progress indicator
- Debug mode for collision visualization
- Responsive canvas scaling

### Recent Updates

#### Version 2.0 - Fever Mode Update
- **🔥 Fever Mode System**: Complete power-up system with torch collection
  - Giant bat transformation (2x size, 4x speed)
  - Invincibility to rock collisions with destruction effects
  - Visual timer bar and "FEVER MODE!" display
  - 5-second duration with real-time countdown
- **🎨 New Visual Assets**: 
  - bat_fever.png (400x353) - Giant fever mode sprite
  - bat_dead.png (300x317) - Renamed from batx with proper scaling
  - torch.png (170x300) - Power-up collectible item
- **⚡ Enhanced Performance**: 
  - 60 FPS locked frame rate across all platforms (Windows, Mac, iOS, Android)
  - Advanced audio throttling system (50ms) for mobile optimization
  - Improved collision detection with dynamic bat sizing
- **🎮 UI Improvements**:
  - Restart button with click/touch detection
  - Fever mode timer bar and status display
  - Enhanced game over screen with better UX
- **🔧 Technical Enhancements**:
  - High-resolution rendering (1600x1200 internal resolution)
  - Cross-platform input handling (keyboard, mouse, touch)
  - Memory-optimized asset management
  - Responsive canvas scaling for all devices

#### Previous Updates
- **Bat Animation System**: Dynamic wing animations with accurate aspect ratios
- **Physics Engine**: Realistic rock destruction with individual piece physics
- **Audio System**: Immersive sound effects with mobile optimization
- **Cross-Platform Support**: Universal compatibility with performance optimization
