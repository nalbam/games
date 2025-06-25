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
        this.load.image('game_logo', './images/game.png');

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
        this.distance = 0;
        this.gameStartTime = 0;
        this.lastObstacleDistance = 0;
        this.lastTorchDistance = 0;
        this.obstacleInterval = 15;
        this.torchInterval = 150;
        this.feverMode = false;
        this.feverTimer = 0;
        this.feverDuration = 10000;


        this.cameras.main.setBackgroundColor('#1a1a2e');

        this.particles = this.add.group();

        this.createSounds();
        this.createControls();


        this.createStartScreen();
    }

    createBackground() {
        this.cameras.main.setBackgroundColor('#1a1a2e');

        this.ceiling = this.physics.add.group();
        this.floor = this.physics.add.group();

        const rockScale = 0.25;
        const rockWidth = 300 * rockScale;

        for (let x = -rockWidth * 5; x < this.gameWidth + rockWidth * 10; x += rockWidth) {
            let ceilingRock = this.ceiling.create(x, 0, 'rock');
            ceilingRock.setOrigin(0, 0);
            ceilingRock.setScale(rockScale);
            ceilingRock.setVelocityX(-400);
            ceilingRock.body.setGravityY(-1600);
            ceilingRock.body.setImmovable(true);

            let floorRock = this.floor.create(x, this.gameHeight - (286 * rockScale), 'rock');
            floorRock.setOrigin(0, 0);
            floorRock.setScale(rockScale);
            floorRock.setVelocityX(-400);
            floorRock.body.setGravityY(-1600);
            floorRock.body.setImmovable(true);
        }
    }

    createPlayer() {
        this.player = this.physics.add.sprite(150, this.gameHeight / 2, 'bat1');
        const batScale = 0.4;
        this.player.setScale(batScale);
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(false);

        this.player.body.setSize(300 * batScale * 0.8, 223 * batScale * 0.8, true);

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
        this.scoreText = this.add.text(40, 40, 'Score: 0', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });

        this.distanceText = this.add.text(40, 100, 'Distance: 0m', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });

        this.feverBar = this.add.graphics();
        this.feverBar.visible = false;

        this.feverText = this.add.text(this.gameWidth / 2, 100, 'FEVER MODE!', {
            fontSize: '64px',
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

        this.lastSpacePress = 0;
        
        if (!this.lastSoundTime) {
            this.lastSoundTime = {
                flap: 0,
                hit: 0,
                powerup: 0,
                explosion: 0,
                pop: 0,
                success: 0
            };
        }

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

    playSoundSafe(soundName, minInterval = 100) {
        const currentTime = this.time.now;
        if (currentTime - this.lastSoundTime[soundName] >= minInterval) {
            this.sounds[soundName].play();
            this.lastSoundTime[soundName] = currentTime;
        }
    }

    setupCollisions() {
        this.physics.add.collider(this.player, this.ceiling, () => {
            this.gameOver();
        });

        this.physics.add.collider(this.player, this.floor, () => {
            this.gameOver();
        });

        this.physics.add.collider(this.obstacles, this.floor);
    }

    createStartScreen() {
        console.log('Creating start screen - gameWidth:', this.gameWidth, 'gameHeight:', this.gameHeight);

        this.logo = this.add.image(this.gameWidth / 2, this.gameHeight / 2 - 150, 'game_logo');
        this.logo.setScale(0.5);
        console.log('Logo created at:', this.logo.x, this.logo.y);

        this.startButton = this.add.text(this.gameWidth / 2, this.gameHeight / 2 + 100,
            'START GAME', {
            fontSize: '64px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            backgroundColor: '#333333',
            padding: { x: 40, y: 20 }
        });
        this.startButton.setOrigin(0.5);
        this.startButton.setInteractive();
        console.log('Start button created at:', this.startButton.x, this.startButton.y);

        this.startButton.on('pointerover', () => {
            this.startButton.setStyle({ fill: '#ffff00', backgroundColor: '#555555' });
        });

        this.startButton.on('pointerout', () => {
            this.startButton.setStyle({ fill: '#ffffff', backgroundColor: '#333333' });
        });

        this.startButton.on('pointerdown', () => {
            this.startGame();
        });

        this.instructionText = this.add.text(this.gameWidth / 2, this.gameHeight / 2 + 200,
            'Space/Click/Touch to Flap Wings', {
            fontSize: '32px',
            fill: '#cccccc',
            fontFamily: 'Arial',
            align: 'center'
        });
        this.instructionText.setOrigin(0.5);
        console.log('Instruction text created at:', this.instructionText.x, this.instructionText.y);
    }

    update() {
        if (this.gameState === 'start') {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.startGame();
            }
        } else if (this.gameState === 'playing') {
            this.updatePlayer();
            this.updateObstacles();
            this.updateFever();
            this.updateDistance();
            this.checkSpawning();
            this.checkCollisions();

            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
                this.flapWings();
            }
        } else if (this.gameState === 'gameOver') {
            if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
                this.restartGame();
            }
        }

        this.updateParticles();
    }

    startGame() {
        this.gameState = 'playing';
        this.gameStartTime = this.time.now;
        this.distance = 0;
        this.lastObstacleDistance = -this.obstacleInterval;
        this.lastTorchDistance = 0;
        this.logo.destroy();
        this.startButton.destroy();
        this.instructionText.destroy();

        this.createBackground();
        this.createPlayer();
        this.createObstacles();
        this.createUI();
        this.setupCollisions();


        this.player.setVelocityY(-600);
        this.playSoundSafe('flap', 100);
    }

    flapWings() {
        if (this.player.isDead) return;

        this.player.setVelocityY(-800);
        this.player.isFlapping = true;
        this.playSoundSafe('flap', 100);

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

    updateDistance() {
        if (this.gameState === 'playing' && this.gameStartTime > 0) {
            const deltaTime = this.game.loop.delta / 1000;
            const currentSpeed = this.feverMode ? 16 : 8;
            
            // 거리를 점진적으로 증가 (급변 방지)
            this.distance += currentSpeed * deltaTime;
            this.distanceText.setText('Distance: ' + Math.floor(this.distance) + 'm');
        }
    }

    checkSpawning() {
        if (this.distance - this.lastObstacleDistance >= this.obstacleInterval) {
            this.spawnObstacle();
            this.lastObstacleDistance = this.distance;
        }

        if (this.distance - this.lastTorchDistance >= this.torchInterval) {
            this.spawnTorch();
            this.lastTorchDistance = this.distance;
        }
    }

    updateObstacles() {
        this.obstacles.children.entries.forEach(obstacle => {
            if (obstacle.x < -100) {
                obstacle.destroy();
            }
        });

        this.torches.children.entries.forEach(torch => {
            if (torch.x < -100) {
                if (torch.glow) {
                    torch.glow.destroy();
                }
                if (torch.tween) {
                    torch.tween.destroy();
                }
                torch.destroy();
            }
        });

        const rockWidth = 300 * 0.25;

        this.ceiling.children.entries.forEach(rock => {
            if (rock.x < -rockWidth * 2) {
                const maxX = Math.max(...this.ceiling.children.entries.map(r => r.x));
                rock.setX(maxX + rockWidth);
            }
        });

        this.floor.children.entries.forEach(rock => {
            if (rock.x < -rockWidth * 2) {
                const maxX = Math.max(...this.floor.children.entries.map(r => r.x));
                rock.setX(maxX + rockWidth);
            }
        });
    }

    updateFever() {
        if (this.feverMode) {
            this.feverTimer -= this.game.loop.delta;

            this.feverBar.clear();
            this.feverBar.fillStyle(0xffff00);
            this.feverBar.fillRect(this.gameWidth / 2 - 200, 160,
                (this.feverTimer / this.feverDuration) * 400, 20);

            if (this.feverTimer <= 0) {
                this.endFeverMode();
            }
        }
    }

    spawnObstacle() {
        if (this.gameState !== 'playing') return;

        const obstacleScale = 0.35;
        const ceilingHeight = 286 * 0.25;
        const floorHeight = 286 * 0.25;
        const gapSize = 360;
        const minHeight = ceilingHeight + 50;
        const maxHeight = this.gameHeight - floorHeight - gapSize - 50;
        const height = Phaser.Math.Between(minHeight, maxHeight);

        const columnId = 'column_' + Date.now();

        const moveSpeed = this.feverMode ? -800 : -400;
        const spawnX = this.gameWidth + 400;

        const rocksPerColumn = Math.floor(height / (286 * obstacleScale));
        for (let i = 0; i < rocksPerColumn; i++) {
            const topRock = this.obstacles.create(spawnX, i * (286 * obstacleScale), 'rock');
            topRock.setOrigin(0, 0);
            topRock.setScale(obstacleScale);
            topRock.body.setSize(300, 286);
            topRock.setVelocityX(moveSpeed);
            topRock.body.setGravityY(-1600);
            topRock.setDepth(-1);
            topRock.scored = false;
            topRock.columnId = columnId;
        }

        const bottomStart = height + gapSize;
        const availableHeight = this.gameHeight - floorHeight - bottomStart;
        const bottomRocksCount = Math.ceil(availableHeight / (286 * obstacleScale));

        for (let i = 0; i < bottomRocksCount; i++) {
            const bottomRock = this.obstacles.create(spawnX, bottomStart + i * (286 * obstacleScale), 'rock');
            bottomRock.setOrigin(0, 0);
            bottomRock.setScale(obstacleScale);
            bottomRock.body.setSize(300, 286);
            bottomRock.setVelocityX(moveSpeed);
            bottomRock.body.setGravityY(-1600);
            bottomRock.setDepth(-1);
            bottomRock.scored = false;
            bottomRock.columnId = columnId;
        }


        this.obstaclesPassed++;
    }

    spawnTorch() {
        const ceilingHeight = 286 * 0.25;
        const floorHeight = 286 * 0.25;
        const torchScale = 0.3;
        const torchHeight = 300 * torchScale;

        const minY = ceilingHeight + torchHeight / 2;
        const maxY = this.gameHeight - floorHeight - torchHeight / 2;
        const y = Phaser.Math.Between(minY, maxY);

        const torch = this.torches.create(this.gameWidth + 300, y, 'torch');
        torch.setScale(torchScale);
        const torchMoveSpeed = this.feverMode ? -800 : -400;
        torch.setVelocityX(torchMoveSpeed);
        torch.body.setSize(170, 300);
        torch.body.setGravityY(-1600);

        const glow = this.add.graphics();
        glow.fillStyle(0xffaa00, 0.3);
        glow.fillCircle(0, 0, 30);
        torch.glow = glow;

        torch.tween = this.tweens.add({
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

        let scoredColumns = new Set();

        this.obstacles.children.entries.forEach(obstacle => {
            if (!obstacle.scored && obstacle.x + obstacle.width < this.player.x && obstacle.columnId) {
                if (!scoredColumns.has(obstacle.columnId)) {
                    scoredColumns.add(obstacle.columnId);
                    this.score += 1;
                    this.scoreText.setText('Score: ' + this.score);
                    this.playSoundSafe('success', 200);
                }
                
                this.obstacles.children.entries.forEach(rock => {
                    if (rock.columnId === obstacle.columnId) {
                        rock.scored = true;
                    }
                });
            }
        });
    }

    hitObstacle(player, obstacle) {
        if (this.feverMode) {
            this.destroyObstacle(obstacle);
            this.playSoundSafe('explosion', 100);
        } else {
            this.collapseColumn(obstacle.columnId);
            this.playSoundSafe('hit', 300);
            this.gameOver();
        }
    }

    collapseColumn(columnId) {
        this.obstacles.children.entries.forEach(rock => {
            if (rock.columnId === columnId) {
                rock.body.setGravityY(1600);
                rock.setVelocityX(Phaser.Math.Between(-160, 160));
                rock.setVelocityY(Phaser.Math.Between(-60, 60));
                rock.body.setBounce(0.1, 0.1);
                rock.body.setDrag(400);
            }
        });
    }

    destroyObstacle(obstacle) {
        this.createExplosion(obstacle.x, obstacle.y);
        obstacle.destroy();
    }

    collectTorch(player, torch) {
        this.startFeverMode();
        this.playSoundSafe('powerup', 200);
        
        if (torch.glow) {
            torch.glow.destroy();
        }
        if (torch.tween) {
            torch.tween.destroy();
        }
        torch.destroy();
    }

    startFeverMode() {
        if (this.feverMode) return;
        
        this.feverMode = true;
        this.feverTimer = this.feverDuration;
        this.player.setTexture('bat_fever');
        const feverBatScale = 0.6;
        this.player.setScale(feverBatScale);
        this.player.body.setSize(400 * feverBatScale * 0.8, 353 * feverBatScale * 0.8, true);

        this.obstacles.children.entries.forEach(rock => {
            if (rock.body.gravity.y <= 0) {
                rock.setVelocityX(-800);
            }
        });

        this.torches.children.entries.forEach(torch => {
            torch.setVelocityX(-800);
        });

        this.ceiling.children.entries.forEach(rock => {
            rock.setVelocityX(-800);
        });

        this.floor.children.entries.forEach(rock => {
            rock.setVelocityX(-800);
        });

        // 피버모드에서도 동일한 간격 유지

        this.feverBar.visible = true;
        this.feverText.visible = true;

        this.cameras.main.flash(200, 255, 255, 0);
    }

    endFeverMode() {
        this.feverMode = false;
        this.player.setTexture('bat1');
        const normalBatScale = 0.4;
        this.player.setScale(normalBatScale);
        this.player.body.setSize(300 * normalBatScale * 0.8, 223 * normalBatScale * 0.8, true);

        this.obstacles.children.entries.forEach(rock => {
            if (rock.body.gravity.y <= 0) {
                rock.setVelocityX(-400);
            }
        });

        this.torches.children.entries.forEach(torch => {
            torch.setVelocityX(-400);
        });

        this.ceiling.children.entries.forEach(rock => {
            rock.setVelocityX(-400);
        });

        this.floor.children.entries.forEach(rock => {
            rock.setVelocityX(-400);
        });

        // 피버모드 종료 시에도 동일한 간격 유지

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
        if (!this.particles || !this.particles.children) return;

        const deltaTime = this.game.loop.delta / 1000;
        
        this.particles.children.entries.forEach(particle => {
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            particle.life -= this.game.loop.delta;

            if (particle.life <= 0) {
                particle.destroy();
            }
        });
    }

    gameOver() {
        if (this.player.isDead) return;

        this.gameState = 'gameOver';
        this.player.isDead = true;

        if (this.feverMode) {
            this.endFeverMode();
        }

        this.player.setTexture('bat_dead');
        this.player.setVelocityX(0);

        this.obstacles.children.entries.forEach(rock => {
            if (rock.body.gravity.y <= 0) {
                rock.setVelocityX(0);
            }
        });

        this.torches.children.entries.forEach(torch => {
            torch.setVelocityX(0);
        });

        this.ceiling.children.entries.forEach(rock => {
            rock.setVelocityX(0);
        });

        this.floor.children.entries.forEach(rock => {
            rock.setVelocityX(0);
        });

        this.sounds.hit.play();
        this.cameras.main.shake(200, 0.02);

        this.add.text(this.gameWidth / 2, this.gameHeight / 2,
            'Game Over\n\nPress R or Click to Restart', {
            fontSize: '64px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);
    }

    restartGame() {
        
        this.gameState = 'playing';
        this.score = 0;
        this.obstaclesPassed = 0;
        this.distance = 0;
        this.gameStartTime = this.time.now;
        this.lastObstacleDistance = -this.obstacleInterval;
        this.lastTorchDistance = 0;
        this.obstacleInterval = 15;
        this.torchInterval = 150;
        this.feverMode = false;
        this.feverTimer = 0;


        // 모든 트윈 애니메이션 정리
        this.tweens.killAll();

        // 기존 게임 객체들 완전 정리
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }

        if (this.obstacles) {
            this.obstacles.children.entries.forEach(obstacle => {
                if (obstacle.destroy) obstacle.destroy();
            });
            this.obstacles.clear(true, true);
        }

        if (this.torches) {
            this.torches.children.entries.forEach(torch => {
                if (torch.glow && torch.glow.destroy) torch.glow.destroy();
                if (torch.tween && torch.tween.destroy) torch.tween.destroy();
                if (torch.destroy) torch.destroy();
            });
            this.torches.clear(true, true);
        }

        if (this.ceiling) {
            this.ceiling.clear(true, true);
        }

        if (this.floor) {
            this.floor.clear(true, true);
        }

        if (this.particles) {
            this.particles.children.entries.forEach(particle => {
                if (particle.destroy) particle.destroy();
            });
            this.particles.clear(true, true);
        }

        // UI 요소들 완전 정리
        if (this.scoreText) {
            this.scoreText.destroy();
            this.scoreText = null;
        }
        if (this.distanceText) {
            this.distanceText.destroy();
            this.distanceText = null;
        }
        if (this.feverBar) {
            this.feverBar.destroy();
            this.feverBar = null;
        }
        if (this.feverText) {
            this.feverText.destroy();
            this.feverText = null;
        }

        // 모든 텍스트 객체 정리 (게임 오버 텍스트 포함)
        this.children.list.slice().forEach(child => {
            if (child.type === 'Text' || child.type === 'Graphics') {
                child.destroy();
            }
        });

        // 게임 재시작
        this.createBackground();
        this.createPlayer();
        this.createUI();
        this.setupCollisions();
        
        // 사운드 타이머 초기화
        Object.keys(this.lastSoundTime).forEach(key => {
            this.lastSoundTime[key] = 0;
        });


        this.player.setVelocityY(-600);
        this.playSoundSafe('flap', 100);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 1200,
    parent: 'gameContainer',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1600 },
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
