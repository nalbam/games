const DEBUG_MODE = true;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('bat1', './images/bat1.png');
        this.load.image('bat2', './images/bat2.png');
        this.load.image('bat_dead', './images/bat_dead.png');
        this.load.image('bat_fever', './images/bat_fever.png');
        this.load.image('rock', './images/rock.png');
        this.load.image('torch', './images/torch.png');
        
        this.load.audio('flap', './sounds/Bat_takeoff.ogg');
        this.load.audio('hit', ['./sounds/Bat_hurt1.ogg', './sounds/Bat_hurt2.ogg', './sounds/Bat_hurt3.ogg']);
        this.load.audio('powerup', ['./sounds/Bat_idle1.ogg', './sounds/Bat_idle2.ogg', './sounds/Bat_idle3.ogg', './sounds/Bat_idle4.ogg']);
        this.load.audio('explosion', ['./sounds/Explosion1.ogg', './sounds/Explosion2.ogg', './sounds/Explosion3.ogg', './sounds/Explosion4.ogg']);
        this.load.audio('pop', './sounds/Pop.ogg');
        this.load.audio('success', './sounds/Successful_hit.ogg');
    }

    create() {
        this.gameWidth = this.sys.game.config.width;
        this.gameHeight = this.sys.game.config.height;
        
        this.gameState = 'start';
        this.score = 0;
        this.obstaclesPassed = 0;
        this.feverMode = false;
        this.feverTimer = 0;
        this.feverDuration = 10000;
        
        this.physics.world.gravity.y = 800;
        
        this.createBackground();
        this.createPlayer();
        this.createObstacles();
        this.createUI();
        this.createSounds();
        this.createControls();
        this.setupCollisions();
        
        this.obstacleTimer = this.time.addEvent({
            delay: 2000,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true,
            paused: true
        });
        
        this.feverObstacleTimer = this.time.addEvent({
            delay: 1000,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true,
            paused: true
        });
        
        this.createStartScreen();
    }

    createBackground() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        
        this.ceiling = this.physics.add.staticGroup();
        this.floor = this.physics.add.staticGroup();
        
        const rockScale = 0.125;
        const rockWidth = 300 * rockScale;
        
        for (let x = 0; x < this.gameWidth + rockWidth; x += rockWidth) {
            let ceilingRock = this.ceiling.create(x, 0, 'rock');
            ceilingRock.setOrigin(0, 0);
            ceilingRock.setScale(rockScale);
            ceilingRock.refreshBody();
            
            let floorRock = this.floor.create(x, this.gameHeight - (286 * rockScale), 'rock');
            floorRock.setOrigin(0, 0);
            floorRock.setScale(rockScale);
            floorRock.refreshBody();
        }
    }

    createPlayer() {
        this.player = this.physics.add.sprite(150, this.gameHeight / 2, 'bat1');
        const batScale = 0.2;
        this.player.setScale(batScale);
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(false);
        
        this.player.body.setSize(300 * batScale * 2, 223 * batScale * 2, true);
        
        this.player.animFrame = 0;
        this.player.animTimer = 0;
        this.player.isFlapping = false;
        this.player.isDead = false;
    }

    createObstacles() {
        this.obstacles = this.physics.add.group();
        this.torches = this.physics.add.group();
        this.particles = this.add.group();
    }

    createUI() {
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        this.feverBar = this.add.graphics();
        this.feverBar.visible = false;
        
        this.feverText = this.add.text(this.gameWidth / 2, 50, 'FEVER MODE!', {
            fontSize: '32px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        });
        this.feverText.setOrigin(0.5);
        this.feverText.visible = false;
    }

    createSounds() {
        this.sounds = {
            flap: this.sound.add('flap', { volume: 0.3 }),
            hit: this.sound.add('hit', { volume: 0.4 }),
            powerup: this.sound.add('powerup', { volume: 0.5 }),
            explosion: this.sound.add('explosion', { volume: 0.4 }),
            pop: this.sound.add('pop', { volume: 0.3 }),
            success: this.sound.add('success', { volume: 0.4 })
        };
    }

    createControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        
        this.input.on('pointerdown', () => {
            if (this.gameState === 'start') {
                this.startGame();
            } else if (this.gameState === 'playing') {
                this.flapWings();
            } else if (this.gameState === 'gameOver') {
                this.restartGame();
            }
        });
    }

    setupCollisions() {
        this.physics.add.collider(this.player, this.ceiling, () => {
            if (!this.feverMode) {
                this.gameOver();
            }
        });
        
        this.physics.add.collider(this.player, this.floor, () => {
            if (!this.feverMode) {
                this.gameOver();
            }
        });
        
        this.physics.add.collider(this.obstacles, this.floor);
    }

    createStartScreen() {
        this.startText = this.add.text(this.gameWidth / 2, this.gameHeight / 2, 
            'Flappy Bat\n\nSpace/Click/Touch to Start', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        });
        this.startText.setOrigin(0.5);
    }

    update() {
        if (this.gameState === 'start') {
            if (this.spaceKey.isDown) {
                this.startGame();
            }
        } else if (this.gameState === 'playing') {
            this.updatePlayer();
            this.updateObstacles();
            this.updateFever();
            this.checkCollisions();
            
            if (this.spaceKey.isDown && !this.player.isFlapping) {
                this.flapWings();
            }
        } else if (this.gameState === 'gameOver') {
            if (this.rKey.isDown) {
                this.restartGame();
            }
        }
        
        this.updateParticles();
    }

    startGame() {
        this.gameState = 'playing';
        this.startText.destroy();
        this.obstacleTimer.paused = false;
        this.feverObstacleTimer.paused = true;
        this.player.setVelocityY(-300);
        this.sounds.flap.play();
    }

    flapWings() {
        if (this.player.isDead) return;
        
        this.player.setVelocityY(-400);
        this.player.isFlapping = true;
        this.sounds.flap.play();
        
        if (this.feverMode) {
            this.player.setTexture('bat_fever');
        } else {
            this.player.setTexture('bat2');
            this.time.delayedCall(100, () => {
                if (!this.player.isDead && !this.feverMode) {
                    this.player.setTexture('bat1');
                }
                this.player.isFlapping = false;
            });
        }
    }

    updatePlayer() {
        if (this.player.isDead) return;
        
        this.player.angle = Math.min(Math.max(this.player.body.velocity.y * 0.1, -30), 30);
    }

    updateObstacles() {
        this.obstacles.children.entries.forEach(obstacle => {
            if (obstacle.x < -100) {
                obstacle.destroy();
            }
        });
        
        this.torches.children.entries.forEach(torch => {
            if (torch.x < -100) {
                torch.destroy();
            }
        });
    }

    updateFever() {
        if (this.feverMode) {
            this.feverTimer -= this.game.loop.delta;
            
            this.feverBar.clear();
            this.feverBar.fillStyle(0xffff00);
            this.feverBar.fillRect(this.gameWidth / 2 - 100, 80, 
                (this.feverTimer / this.feverDuration) * 200, 10);
            
            if (this.feverTimer <= 0) {
                this.endFeverMode();
            }
        }
    }

    spawnObstacle() {
        if (this.gameState !== 'playing') return;
        
        const obstacleScale = 0.175;
        const ceilingHeight = 286 * 0.125;
        const floorHeight = 286 * 0.125;
        const gapSize = 180;
        const minHeight = ceilingHeight + 50;
        const maxHeight = this.gameHeight - floorHeight - gapSize - 50;
        const height = Phaser.Math.Between(minHeight, maxHeight);
        
        const columnId = 'column_' + Date.now();
        
        const moveSpeed = this.feverMode ? -400 : -200;
        
        const rocksPerColumn = Math.floor(height / (286 * obstacleScale));
        for (let i = 0; i < rocksPerColumn; i++) {
            const topRock = this.obstacles.create(this.gameWidth + 50, i * (286 * obstacleScale), 'rock');
            topRock.setOrigin(0, 0);
            topRock.setScale(obstacleScale);
            topRock.body.setSize(300, 286);
            topRock.setVelocityX(moveSpeed);
            topRock.body.setGravityY(-800);
            topRock.setDepth(-1);
            topRock.scored = false;
            topRock.columnId = columnId;
        }
        
        const bottomStart = height + gapSize;
        const availableHeight = this.gameHeight - floorHeight - bottomStart;
        const bottomRocksCount = Math.ceil(availableHeight / (286 * obstacleScale));
        
        for (let i = 0; i < bottomRocksCount; i++) {
            const bottomRock = this.obstacles.create(this.gameWidth + 50, bottomStart + i * (286 * obstacleScale), 'rock');
            bottomRock.setOrigin(0, 0);
            bottomRock.setScale(obstacleScale);
            bottomRock.body.setSize(300, 286);
            bottomRock.setVelocityX(moveSpeed);
            bottomRock.body.setGravityY(-800);
            bottomRock.setDepth(-1);
            bottomRock.scored = false;
            bottomRock.columnId = columnId;
        }
        
        const extraRock = this.obstacles.create(this.gameWidth + 50, this.gameHeight - floorHeight - (286 * obstacleScale), 'rock');
        extraRock.setOrigin(0, 0);
        extraRock.setScale(obstacleScale);
        extraRock.body.setSize(300, 286);
        extraRock.setVelocityX(moveSpeed);
        extraRock.body.setGravityY(-800);
        extraRock.setDepth(-1);
        extraRock.scored = false;
        extraRock.columnId = columnId;
        
        this.obstaclesPassed++;
        if (this.obstaclesPassed % 10 === 0) {
            this.spawnTorch();
        }
    }

    spawnTorch() {
        const ceilingHeight = 286 * 0.125;
        const floorHeight = 286 * 0.125;
        const torchScale = 0.15;
        const torchHeight = 300 * torchScale;
        
        const minY = ceilingHeight + torchHeight / 2;
        const maxY = this.gameHeight - floorHeight - torchHeight / 2;
        const y = Phaser.Math.Between(minY, maxY);
        
        const torch = this.torches.create(this.gameWidth - 50, y, 'torch');
        torch.setScale(torchScale);
        const torchMoveSpeed = this.feverMode ? -400 : -200;
        torch.setVelocityX(torchMoveSpeed);
        torch.body.setSize(170, 300);
        torch.body.setGravityY(-800);
        
        const glow = this.add.graphics();
        glow.fillStyle(0xffaa00, 0.3);
        glow.fillCircle(0, 0, 30);
        torch.glow = glow;
        
        this.tweens.add({
            targets: torch,
            scaleX: torchScale + 0.03,
            scaleY: torchScale + 0.03,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    checkCollisions() {
        this.physics.overlap(this.player, this.obstacles, this.hitObstacle, null, this);
        this.physics.overlap(this.player, this.torches, this.collectTorch, null, this);
        
        let columnsToScore = [];
        this.obstacles.children.entries.forEach(obstacle => {
            if (!obstacle.scored && obstacle.x < this.player.x) {
                obstacle.scored = true;
                const columnX = Math.round(obstacle.x / 10) * 10;
                if (!columnsToScore.includes(columnX)) {
                    columnsToScore.push(columnX);
                }
            }
        });
        
        if (columnsToScore.length > 0) {
            this.score += columnsToScore.length;
            this.scoreText.setText('Score: ' + this.score);
            this.sounds.success.play();
        }
    }

    hitObstacle(player, obstacle) {
        if (this.feverMode) {
            this.destroyObstacle(obstacle);
            this.sounds.explosion.play();
        } else {
            this.collapseColumn(obstacle.columnId);
            this.sounds.hit.play();
            this.gameOver();
        }
    }

    collapseColumn(columnId) {
        this.obstacles.children.entries.forEach(rock => {
            if (rock.columnId === columnId) {
                rock.body.setGravityY(800);
                rock.setVelocityX(Phaser.Math.Between(-80, 80));
                rock.setVelocityY(Phaser.Math.Between(-30, 30));
                rock.body.setBounce(0.1, 0.1);
                rock.body.setDrag(200);
            }
        });
    }

    destroyObstacle(obstacle) {
        this.createExplosion(obstacle.x, obstacle.y);
        obstacle.destroy();
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }

    collectTorch(player, torch) {
        this.startFeverMode();
        this.sounds.powerup.play();
        torch.destroy();
        if (torch.glow) {
            torch.glow.destroy();
        }
    }

    startFeverMode() {
        this.feverMode = true;
        this.feverTimer = this.feverDuration;
        this.player.setTexture('bat_fever');
        const feverBatScale = 0.3;
        this.player.setScale(feverBatScale);
        this.player.body.setSize(400 * feverBatScale * 2, 353 * feverBatScale * 2, true);
        
        this.obstacles.children.entries.forEach(rock => {
            if (rock.body.gravity.y <= 0) {
                rock.setVelocityX(-400);
            }
        });
        
        this.torches.children.entries.forEach(torch => {
            torch.setVelocityX(-400);
        });
        
        this.obstacleTimer.paused = true;
        this.feverObstacleTimer.paused = false;
        
        this.feverBar.visible = true;
        this.feverText.visible = true;
        
        this.cameras.main.flash(200, 255, 255, 0);
    }

    endFeverMode() {
        this.feverMode = false;
        this.player.setTexture('bat1');
        const normalBatScale = 0.2;
        this.player.setScale(normalBatScale);
        this.player.body.setSize(300 * normalBatScale * 2, 223 * normalBatScale * 2, true);
        
        this.obstacles.children.entries.forEach(rock => {
            if (rock.body.gravity.y <= 0) {
                rock.setVelocityX(-200);
            }
        });
        
        this.torches.children.entries.forEach(torch => {
            torch.setVelocityX(-200);
        });
        
        this.obstacleTimer.paused = false;
        this.feverObstacleTimer.paused = true;
        
        this.feverBar.visible = false;
        this.feverText.visible = false;
    }

    createExplosion(x, y) {
        for (let i = 0; i < 8; i++) {
            const particle = this.add.graphics();
            particle.fillStyle(0xff6600);
            particle.fillCircle(0, 0, 5);
            particle.x = x;
            particle.y = y;
            
            const angle = (i / 8) * Math.PI * 2;
            const speed = Phaser.Math.Between(100, 200);
            
            particle.velocityX = Math.cos(angle) * speed;
            particle.velocityY = Math.sin(angle) * speed;
            particle.life = 1000;
            
            this.particles.add(particle);
        }
    }

    updateParticles() {
        this.particles.children.entries.forEach(particle => {
            particle.x += particle.velocityX * 0.016;
            particle.y += particle.velocityY * 0.016;
            particle.life -= 16;
            
            if (particle.life <= 0) {
                particle.destroy();
            }
        });
    }

    gameOver() {
        if (this.player.isDead) return;
        
        this.gameState = 'gameOver';
        this.player.isDead = true;
        this.player.setTexture('bat_dead');
        this.player.setVelocityX(0);
        this.obstacleTimer.paused = true;
        this.feverObstacleTimer.paused = true;
        
        this.obstacles.children.entries.forEach(rock => {
            if (rock.body.gravity.y <= 0) {
                rock.setVelocityX(0);
            }
        });
        
        this.torches.children.entries.forEach(torch => {
            torch.setVelocityX(0);
        });
        
        this.sounds.hit.play();
        this.cameras.main.shake(200, 0.02);
        
        this.add.text(this.gameWidth / 2, this.gameHeight / 2, 
            'Game Over\n\nPress R or Click to Restart', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);
    }

    restartGame() {
        this.scene.restart();
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'gameContainer',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: DEBUG_MODE
        }
    },
    scene: GameScene,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);