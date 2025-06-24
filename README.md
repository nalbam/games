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

- **Genre**: Side-scrolling 2D Arcade
- **Character**: Bat
- **Controls**: SPACEBAR → Flap wings (fly up)
- **Physics**: Automatic gravity (fall down)
- **Obstacles**: Rock pillars with gaps
- **Environment**: Moving rocky cave

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
3. **Navigate Obstacles**: Fly through gaps between rock pillars
4. **Score Points**: Each obstacle passed increases your score
5. **Game Over**: Collision with rocks, ceiling, or floor ends the game
6. **Restart**: Use R key, Click, or Touch to play again

### 📱 Mobile Optimized
- Responsive design works on all devices
- Touch controls for smartphones and tablets
- Optimized performance for iOS and Android
- Full-screen gameplay experience

## Game Features

- **Fullscreen Display**: Responsive design that fills the entire browser window
- **Realistic Physics**: Gravity and momentum-based flight with destructible rocks
- **Scrolling Cave**: Moving rocky ceiling and floor
- **Random Obstacles**: Procedurally generated rock pillars
- **Score System**: Track obstacles successfully passed
- **Visual Graphics**: Custom bat and rock sprites with smooth animations
- **Bat Animation System**: Dynamic wing animation based on movement
- **Smooth Animation**: 60 FPS game loop
- **Countdown Timer**: 3-second countdown before game starts
- **Asset Loading**: Safe image loading with loading screen
- **Dynamic Rock Physics**: Rocks break into individual pieces when hit
- **Realistic Destruction**: Rock pieces fall with gravity and bounce realistically
- **Sound Effects**: Immersive audio including wing flaps, collisions, and explosions
- **Debug Mode**: Visual collision area display (disabled by default)
- **Precise Collision**: Accurate collision detection matching visual rock boundaries

## Game Assets

### Images
- **Bat Animation Sprites**: 
  - [bat1.png](./docs/images/bat1.png) - Wings spread (gliding/falling)
  - [bat2.png](./docs/images/bat2.png) - Wings folded (jumping/flapping)
- **Rock Texture**: [rock.png](./docs/images/rock.png)
- **Game Logo**: [game.png](./docs/images/game.png)

### Sound Effects
- **Wing Flap**: [Bat_takeoff.ogg](./docs/sounds/Bat_takeoff.ogg)
- **Idle Sounds**: Bat_idle1-4.ogg (4 variations)
- **Pain Sounds**: Bat_hurt1-3.ogg (3 variations)
- **Explosion Effects**: Explosion1-4.ogg (4 variations)

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
- **Screen Size**: 800x600 pixels (fullscreen display)
- **Bat Size**: 40x30 pixels
- **Jump Force**: -8 velocity units
- **Gravity**: 0.5 acceleration per frame (bat), 0.3 (rock pieces)
- **Obstacle Speed**: 3 pixels per frame
- **Rock Width**: 80 pixels
- **Gap Size**: 180 pixels between rock pillars
- **Spawn Rate**: New obstacle every 90 frames (~1.5 seconds)
- **Cave Boundaries**: 30px ceiling and floor collision zones

### Animation System
- **Jump Animation**: Wings spread (bat1) → Wings folded (bat2)
- **Falling Animation**: Wings spread for gliding
- **Idle Animation**: Natural wing flapping cycle (20 frames)
- **Rapid Input**: Faster wing animation on consecutive jumps
- **Animation Timing**: 12 frames (normal), 8 frames (rapid)

### Collision & Destruction
- **Collision Detection**: Precise collision matching visual boundaries
- **Rock Destruction**: Individual 45-pixel rock pieces with physics
- **Top Rock Behavior**: Falls and scatters on collision
- **Bottom Rock Behavior**: Tips over in collision direction
- **Ground Contact**: Rock pieces settle on cave floor (30px from bottom)
- **Friction**: 0.7 coefficient when pieces hit ground

### Audio System
- **Wing Flap**: Plays on every SPACEBAR press
- **Game Start**: Random idle sound after countdown
- **Collision**: Simultaneous hurt + explosion sounds
- **Volume**: All sounds at 50% volume

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
- **Cross-Platform Performance**: 60 FPS frame rate consistency across all devices
- **Mobile Optimization**: Enhanced performance for iOS and Android devices
- **Audio System**: Optimized sound effects with performance throttling
- **Bat Image Scaling**: Accurate proportions for all bat sprites (bat1, bat2, batx)
- **Touch Controls**: Full touch support for mobile devices
- **Bat Animation System**: Dynamic wing animations with proper aspect ratios
- **Movement-Based Animation**: Wings respond to jump, fall, and idle states
- **Rapid Input Handling**: Faster wing flapping for consecutive inputs
- **Cave Collision Fix**: Accurate collision detection for cave boundaries
- **Safe Asset Loading**: Loading screen prevents game start until all images are ready
