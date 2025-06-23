# Flappy Bat

<div align="center">
  <img src="./docs/images/game.png" alt="Flappy Bat Logo" width="300">
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

1. **Start Game**: Press SPACEBAR to begin
2. **Control Bat**: Press SPACEBAR to flap wings and fly up
3. **Avoid Obstacles**: Navigate through gaps between rock pillars
4. **Score Points**: Each obstacle passed increases your score
5. **Game Over**: Collision with rocks, ceiling, or floor ends the game
6. **Restart**: Press R after game over to play again

## Game Features

- **Fullscreen Display**: Responsive design that fills the entire browser window
- **Realistic Physics**: Gravity and momentum-based flight
- **Scrolling Cave**: Moving rocky ceiling and floor
- **Random Obstacles**: Procedurally generated rock pillars
- **Score System**: Track obstacles successfully passed
- **Visual Graphics**: Custom bat and rock sprites
- **Smooth Animation**: 60 FPS game loop
- **Countdown Timer**: 3-second countdown before game starts
- **Forgiving Collision**: Optimized hitbox for better gameplay experience

## Game Assets

- **Bat Sprite**: [bat.png](./docs/images/bat.png)
- **Rock Texture**: [rock.png](./docs/images/rock.png)

## Source Code

- **Game Logic**: [game.js](./docs/game.js)
- **HTML Page**: [index.html](./docs/index.html)

## How to Run

1. Open `docs/index.html` in a web browser
2. Press SPACEBAR to start playing
3. Enjoy the game!

## Game Mechanics

- **Screen Size**: 800x600 pixels (fullscreen display)
- **Bat Size**: 40x30 pixels
- **Jump Force**: -8 velocity units
- **Gravity**: 0.5 acceleration per frame
- **Obstacle Speed**: 3 pixels per frame
- **Rock Width**: 80 pixels
- **Gap Size**: 180 pixels between rock pillars
- **Spawn Rate**: New obstacle every 90 frames (~1.5 seconds)
- **Collision Detection**: Bat 100%, Rocks 95% (forgiving hitbox)

## Development

This game was developed using **Amazon Q Developer**, an AI-powered coding assistant that helped with:
- Game logic implementation
- Physics and collision detection
- Image rendering and animation
- Score tracking system
- Code optimization and debugging
