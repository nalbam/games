class FlappyBatGame {
    constructor() {
        this.config = {
            type: Phaser.AUTO,
            width: 1600,
            height: 1200,
            parent: 'gameContainer',
            backgroundColor: '#1a1a2e',
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 1600,
                height: 1200
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 1000 },
                    debug: false
                }
            },
            scene: [PreloadScene, MenuScene, GameScene, GameOverScene]
        };
        
        this.game = new Phaser.Game(this.config);
    }
}

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        this.add.text(800, 600, 'Loading...', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.load.image('bat1', 'images/bat1.png');
        this.load.image('bat2', 'images/bat2.png');
        this.load.image('bat_dead', 'images/bat_dead.png');
        this.load.image('rock', 'images/rock.png');
        this.load.image('game_logo', 'images/game.png');

        this.load.audio('bat_takeoff', 'sounds/Bat_takeoff.ogg');
        this.load.audio('bat_hurt1', 'sounds/Bat_hurt1.ogg');
        this.load.audio('explosion1', 'sounds/Explosion1.ogg');
    }

    create() {
        this.scene.start('MenuScene');
    }
}

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#0f0f23');
        
        this.logo = this.add.image(800, 400, 'game_logo');
        this.logo.setScale(0.8);
        
        this.titleText = this.add.text(800, 700, 'Flappy Bat - Cave Adventure', {
            fontSize: '64px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.startText = this.add.text(800, 850, 'Press SPACE or Click to Start', {
            fontSize: '36px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', () => {
            this.scene.start('GameScene');
        });

        this.input.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        this.gameWidth = 1600;
        this.gameHeight = 1200;
        this.gameSpeed = 4;
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        
        this.setupBackground();
        this.setupPlayer();
        this.setupObstacles();
        this.setupUI();
        this.setupControls();
        this.setupSounds();
        
        this.showStartMessage();
    }

    setupBackground() {
        this.cameras.main.setBackgroundColor('#0f0f23');
        
        this.caveTop = this.add.rectangle(800, 30, 1600, 60, 0x654321);
        this.caveBottom = this.add.rectangle(800, 1170, 1600, 60, 0x654321);
    }

    setupPlayer() {
        this.bat = this.physics.add.sprite(300, 600, 'bat1');
        this.bat.setScale(0.4);
        this.bat.body.setSize(200, 150);
        this.bat.setCollideWorldBounds(false);
        
        this.batAnimation = 0;
        this.animationTimer = 0;
    }

    setupObstacles() {
        this.rocks = this.physics.add.group();
        this.rockPieces = this.physics.add.group();
        this.obstacleTimer = 0;
        this.obstacleInterval = 120;
        this.passedRocks = [];
    }

    setupUI() {
        this.scoreText = this.add.text(80, 80, 'Score: 0', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
    }

    setupControls() {
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.spaceKey.on('down', () => this.jump());
        this.input.on('pointerdown', () => this.jump());
    }

    setupSounds() {
        this.flapSound = this.sound.add('bat_takeoff', { volume: 0.5 });
        this.hurtSound = this.sound.add('bat_hurt1', { volume: 0.5 });
        this.explosionSound = this.sound.add('explosion1', { volume: 0.5 });
    }

    showStartMessage() {
        this.startMessage = this.add.text(800, 500, 'Press SPACE or Click to Fly!', {
            fontSize: '48px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    jump() {
        if (this.gameOver) return;
        
        if (!this.gameStarted) {
            this.startGame();
        }
        
        this.bat.setVelocityY(-600);
        this.flapSound.play();
        this.animationTimer = 0;
    }

    startGame() {
        this.gameStarted = true;
        this.startMessage.destroy();
    }

    update() {
        if (!this.gameStarted || this.gameOver) return;

        this.updateBat();
        this.updateObstacles();
        this.updateAnimation();
        this.checkCollisions();
        this.checkBoundaries();
        this.checkScore();
    }

    updateBat() {
        if (this.bat.body.velocity.y > 0) {
            this.bat.setRotation(Math.min(0.3, this.bat.body.velocity.y * 0.001));
        } else {
            this.bat.setRotation(Math.max(-0.3, this.bat.body.velocity.y * 0.001));
        }
    }

    updateObstacles() {
        this.rocks.children.entries.forEach(rock => {
            rock.x -= this.gameSpeed;
            if (rock.x < -200) {
                rock.destroy();
            }
        });

        this.rockPieces.children.entries.forEach(piece => {
            piece.x -= this.gameSpeed;
            if (piece.x < -200) {
                piece.destroy();
            }
        });

        this.obstacleTimer++;
        if (this.obstacleTimer >= this.obstacleInterval) {
            this.spawnRockPillar();
            this.obstacleTimer = 0;
        }
    }

    spawnRockPillar() {
        const gap = 300;
        const pillarWidth = 120;
        const gapY = Phaser.Math.Between(200, this.gameHeight - 300);
        
        const topRock = this.physics.add.sprite(this.gameWidth + pillarWidth/2, gapY/2, 'rock');
        topRock.setScale(pillarWidth/topRock.width, gapY/topRock.height);
        topRock.body.setImmovable(true);
        topRock.rockType = 'top';
        topRock.scored = false;
        this.rocks.add(topRock);

        const bottomRock = this.physics.add.sprite(
            this.gameWidth + pillarWidth/2, 
            gapY + gap + (this.gameHeight - gapY - gap)/2, 
            'rock'
        );
        bottomRock.setScale(pillarWidth/bottomRock.width, (this.gameHeight - gapY - gap - 60)/bottomRock.height);
        bottomRock.body.setImmovable(true);
        bottomRock.rockType = 'bottom';
        bottomRock.scored = false;
        this.rocks.add(bottomRock);
    }

    updateAnimation() {
        this.animationTimer++;
        if (this.animationTimer >= 15) {
            if (this.bat.texture.key === 'bat1') {
                this.bat.setTexture('bat2');
            } else {
                this.bat.setTexture('bat1');
            }
            this.animationTimer = 0;
        }
    }

    checkCollisions() {
        this.physics.overlap(this.bat, this.rocks, (bat, rock) => {
            this.handleCollision(rock);
        });
    }

    checkBoundaries() {
        if (this.bat.y < 60 || this.bat.y > this.gameHeight - 60) {
            this.endGame();
        }
    }

    checkScore() {
        this.rocks.children.entries.forEach(rock => {
            if (!rock.scored && rock.x < this.bat.x && rock.rockType === 'top') {
                rock.scored = true;
                this.score++;
                this.scoreText.setText('Score: ' + this.score);
            }
        });
    }

    handleCollision(rock) {
        this.destroyRock(rock);
        this.endGame();
    }

    destroyRock(rock) {
        this.explosionSound.play();
        
        const pieceCount = 8;
        for (let i = 0; i < pieceCount; i++) {
            const piece = this.physics.add.sprite(
                rock.x + Phaser.Math.Between(-30, 30),
                rock.y + Phaser.Math.Between(-30, 30),
                'rock'
            );
            
            piece.setScale(0.2);
            piece.setVelocity(
                Phaser.Math.Between(-300, 300),
                Phaser.Math.Between(-400, -100)
            );
            piece.setAngularVelocity(Phaser.Math.Between(-500, 500));
            piece.body.setGravityY(800);
            piece.body.setBounce(0.5);
            piece.body.setCollideWorldBounds(true);
            
            this.rockPieces.add(piece);
        }
        
        rock.destroy();
        
        this.rocks.children.entries.forEach(otherRock => {
            if (Math.abs(otherRock.x - rock.x) < 100) {
                this.destroyConnectedRock(otherRock);
            }
        });
    }

    destroyConnectedRock(rock) {
        const pieceCount = 6;
        for (let i = 0; i < pieceCount; i++) {
            const piece = this.physics.add.sprite(
                rock.x + Phaser.Math.Between(-30, 30),
                rock.y + Phaser.Math.Between(-30, 30),
                'rock'
            );
            
            piece.setScale(0.2);
            piece.setVelocity(
                Phaser.Math.Between(-200, 200),
                Phaser.Math.Between(-300, -50)
            );
            piece.setAngularVelocity(Phaser.Math.Between(-400, 400));
            piece.body.setGravityY(800);
            piece.body.setBounce(0.4);
            piece.body.setCollideWorldBounds(true);
            
            this.rockPieces.add(piece);
        }
        
        rock.destroy();
    }

    endGame() {
        if (this.gameOver) return;
        
        this.gameOver = true;
        this.hurtSound.play();
        
        this.bat.setTexture('bat_dead');
        this.bat.setScale(0.35);
        this.bat.setVelocity(0, 400);
        this.bat.body.setGravityY(1500);
        
        this.time.delayedCall(1000, () => {
            this.physics.pause();
            this.scene.start('GameOverScene', { score: this.score });
        });
    }
}

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score || 0;
    }

    create() {
        this.cameras.main.setBackgroundColor('#0f0f23');

        this.add.text(800, 400, 'Game Over', {
            fontSize: '96px',
            fill: '#ff0000',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(800, 550, `Final Score: ${this.finalScore}`, {
            fontSize: '64px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.restartText = this.add.text(800, 700, 'Press SPACE or Click to Restart', {
            fontSize: '48px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.menuText = this.add.text(800, 800, 'Press M for Menu', {
            fontSize: '36px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', () => {
            this.scene.start('GameScene');
        });

        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M).on('down', () => {
            this.scene.start('MenuScene');
        });

        this.input.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}

window.addEventListener('load', () => {
    new FlappyBatGame();
});