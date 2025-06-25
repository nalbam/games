// Space Dodge Game using Three.js
class SpaceDodgeGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.obstacles = [];
        this.gameState = 'waiting'; // waiting, playing, gameOver
        this.score = 0;
        this.lives = 3;
        this.speed = 0.1;
        this.obstacleSpawnRate = 0.02;
        
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false
        };
        
        // Touch controls
        this.isTouching = false;
        
        this.init();
        this.setupControls();
        this.animate();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 10;
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 0, 5);
        this.scene.add(directionalLight);
        
        // Create player
        this.createPlayer();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createPlayer() {
        // Create player spaceship (blue triangle)
        const geometry = new THREE.ConeGeometry(0.3, 1, 3);
        const material = new THREE.MeshLambertMaterial({ color: 0x00aaff });
        this.player = new THREE.Mesh(geometry, material);
        this.player.position.set(0, -4, 0);
        // Point upward (no rotation needed, cone already points up by default)
        this.scene.add(this.player);
    }
    
    createObstacle() {
        // Create red obstacle (cube)
        const size = Math.random() * 0.5 + 0.3;
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const obstacle = new THREE.Mesh(geometry, material);
        
        // Random position at top of screen
        obstacle.position.set(
            (Math.random() - 0.5) * 15,
            8,
            0
        );
        
        // Add rotation for visual effect
        obstacle.rotation.x = Math.random() * Math.PI;
        obstacle.rotation.y = Math.random() * Math.PI;
        obstacle.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.1,
            y: (Math.random() - 0.5) * 0.1
        };
        
        this.scene.add(obstacle);
        this.obstacles.push(obstacle);
    }
    
    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.left = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.right = true;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    this.keys.up = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.keys.down = true;
                    break;
                case 'Enter':
                    if (this.gameState === 'gameOver') {
                        this.restart();
                    }
                    break;
            }
        });
        
        document.addEventListener('keyup', (event) => {
            switch(event.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.keys.right = false;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    this.keys.up = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.keys.down = false;
                    break;
            }
        });
        
        // Touch controls - direct position mapping
        this.renderer.domElement.addEventListener('touchstart', (event) => {
            event.preventDefault();
            this.isTouching = true;
            this.updateTouchPosition(event.touches[0]);
        });
        
        this.renderer.domElement.addEventListener('touchmove', (event) => {
            event.preventDefault();
            if (this.isTouching) {
                this.updateTouchPosition(event.touches[0]);
            }
        });
        
        this.renderer.domElement.addEventListener('touchend', (event) => {
            event.preventDefault();
            this.isTouching = false;
        });
    }
    
    updateTouchPosition(touch) {
        if (!this.player || this.gameState !== 'playing') return;
        
        // Convert screen coordinates to world coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Convert normalized coordinates to world space
        const worldX = x * 7; // Map to game world bounds (-7 to 7)
        const worldY = y * 4.5; // Map to game world bounds (-4.5 to 4.5)
        
        // Smoothly move player to touch position
        this.player.position.x = Math.max(-7, Math.min(7, worldX));
        this.player.position.y = Math.max(-5, Math.min(4, worldY));
    }
    
    updatePlayer() {
        if (!this.player) return;
        
        // Only handle keyboard input (touch is handled directly in updateTouchPosition)
        if (!this.isTouching) {
            const moveSpeed = 0.2;
            
            if (this.keys.left && this.player.position.x > -7) {
                this.player.position.x -= moveSpeed;
            }
            if (this.keys.right && this.player.position.x < 7) {
                this.player.position.x += moveSpeed;
            }
            if (this.keys.up && this.player.position.y < 4) {
                this.player.position.y += moveSpeed;
            }
            if (this.keys.down && this.player.position.y > -5) {
                this.player.position.y -= moveSpeed;
            }
        }
    }
    
    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            
            // Move obstacle down
            obstacle.position.y -= this.speed;
            
            // Rotate obstacle
            obstacle.rotation.x += obstacle.rotationSpeed.x;
            obstacle.rotation.y += obstacle.rotationSpeed.y;
            
            // Remove obstacle if it's off screen
            if (obstacle.position.y < -8) {
                this.scene.remove(obstacle);
                this.obstacles.splice(i, 1);
                this.score += 10;
                this.updateUI();
            }
            
            // Check collision with player
            else if (this.checkCollision(this.player, obstacle)) {
                this.scene.remove(obstacle);
                this.obstacles.splice(i, 1);
                this.lives--;
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        const distance = obj1.position.distanceTo(obj2.position);
        return distance < 0.8; // Collision threshold
    }
    
    spawnObstacles() {
        if (Math.random() < this.obstacleSpawnRate) {
            this.createObstacle();
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
    }
    
    start() {
        this.gameState = 'playing';
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }
    
    restart() {
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.speed = 0.1;
        this.gameState = 'playing';
        
        // Clear obstacles
        this.obstacles.forEach(obstacle => this.scene.remove(obstacle));
        this.obstacles = [];
        
        // Reset player position
        this.player.position.set(0, -4, 0);
        
        // Update UI
        this.updateUI();
        document.getElementById('gameOver').style.display = 'none';
    }
    
    update() {
        if (this.gameState === 'playing') {
            this.updatePlayer();
            this.updateObstacles();
            this.spawnObstacles();
            
            // Gradually increase difficulty
            this.speed += 0.0002;
            this.obstacleSpawnRate += 0.00001;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Global functions for HTML buttons
let game;

function startGame() {
    if (!game) {
        game = new SpaceDodgeGame();
    }
    game.start();
}

function restartGame() {
    if (game) {
        game.restart();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    game = new SpaceDodgeGame();
});