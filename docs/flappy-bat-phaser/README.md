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

## Game Assets

### Images
- **Bat Animation Sprites**:
  - [bat1.png](./images/bat1.png) - Wings spread (300x223) - Gliding/falling
  - [bat2.png](./images/bat2.png) - Wings folded (300x223) - Jumping/flapping
  - [bat_dead.png](./images/bat_dead.png) - Dead state (300x317) - Game over
  - [bat_fever.png](./images/bat_fever.png) - Fever mode (400x353) - Power-up state
- **Power-up Items**:
  - [torch.png](./images/torch.png) - Fever mode trigger (170x300)
- **Environment**:
  - [rock.png](./images/rock.png) - Destructible rock texture
  - [game.png](./images/game.png) - Game logo

### Sound Effects
- **Wing Flap**: [Bat_takeoff.ogg](./sounds/Bat_takeoff.ogg) - Jump/flap sound
- **Power-up Sounds**: Bat_idle1-4.ogg (4 variations) - Torch collection & game start
- **Collision Sounds**: Bat_hurt1-3.ogg (3 variations) - Rock collision damage
- **Destruction Effects**: Explosion1-4.ogg (4 variations) - Rock breaking sounds

## Source Code

- **Game Logic**: [game.js](./game.js) - Main game engine with physics, collision detection, and rendering
- **HTML Page**: [index.html](./index.html) - Responsive web page with mobile optimization
