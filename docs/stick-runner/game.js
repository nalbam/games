// Robot Runner - 3D Endless Runner Game with Cute Robots
// Built with Three.js ES6 modules and featuring cute-robots GLTF models

import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';

class RobotRunner {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.robotModel = null;
        this.mixer = null;
        this.animations = {};
        this.currentAnimation = null;
        this.ground = [];
        this.obstacles = [];
        this.particles = [];
        
        // Game state
        this.gameState = 'start'; // start, playing, gameOver
        this.score = 0;
        this.distance = 0;
        this.speed = 1.0;
        this.baseSpeed = 0.15;
        
        // Player state
        this.playerState = 'running'; // running, jumping, sliding
        this.jumpVelocity = 0;
        this.jumpHeight = 0;
        this.slideTimer = 0;
        
        // Game settings
        this.gravity = 0.015;
        this.jumpForce = 0.4;
        this.slideDuration = 30; // frames
        this.obstacleSpawnDistance = 8;
        this.lastObstacleZ = -10;
        
        // Performance
        this.clock = new THREE.Clock();
        this.frameCount = 0;
        
        this.init();
        this.createFallbackPlayer(); // Start with fallback, then try to load robot
        this.setupEventListeners();
        this.animate();
        
        // Try to load robot model async
        this.loadRobotModel();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 20, 100);
        this.scene.background = new THREE.Color(0x87CEEB);

        // Create camera - side-angle top-down view for endless runner
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(8, 6, 0); // Side position with height for top-down angle
        this.camera.lookAt(0, 0, -5); // Look forward along the running track

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace; // Updated for Three.js 0.177.0
        
        // Insert renderer into game container
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.appendChild(this.renderer.domElement);

        // Add lighting
        this.setupLighting();
        
        // Create ground
        this.createGround();
        
        // Initial ground tiles
        for (let i = 0; i < 20; i++) {
            this.createGroundTile(-i * 10);
        }
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -15;
        directionalLight.shadow.camera.right = 15;
        directionalLight.shadow.camera.top = 15;
        directionalLight.shadow.camera.bottom = -15;
        this.scene.add(directionalLight);

        // Add some rim lighting
        const rimLight = new THREE.DirectionalLight(0x4444ff, 0.3);
        rimLight.position.set(-5, 5, -5);
        this.scene.add(rimLight);
    }

    async loadRobotModel() {
        try {
            console.log('Attempting to load robot model...');
            
            const loader = new GLTFLoader();
            
            // Update UI to show loading
            this.updateLoadingUI('로봇 모델을 로딩 중...');

            // Load the GLTF model with progress tracking
            const gltf = await new Promise((resolve, reject) => {
                loader.load(
                    '../cute-robots/scene.gltf',
                    (gltf) => {
                        console.log('GLTF loaded successfully:', gltf);
                        resolve(gltf);
                    },
                    (progress) => {
                        if (progress.total > 0) {
                            const percent = Math.round((progress.loaded / progress.total) * 100);
                            console.log(`Loading progress: ${percent}%`);
                            this.updateLoadingUI(`로봇 모델 로딩 중... ${percent}%`);
                        }
                    },
                    (error) => {
                        console.error('GLTF loading error:', error);
                        reject(error);
                    }
                );
            });
            
            // Remove current player if exists
            if (this.player && this.player !== this.robotModel) {
                this.scene.remove(this.player);
            }
            
            // Extract and process the robot model
            this.robotModel = gltf.scene.clone(); // Clone to avoid issues
            
            // Debug: Log the model structure
            console.log('Robot model children:', this.robotModel.children);
            
            // Scale and position the robot for game visibility
            this.robotModel.scale.set(1.5, 1.5, 1.5); // Good size for visibility
            this.robotModel.position.set(0, 0, 0);
            this.robotModel.rotation.y = Math.PI / 2; // Face forward (along Z-axis)
            
            // Force materials to be visible and update for latest Three.js
            this.robotModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.frustumCulled = false; // Prevent culling issues
                    
                    // Ensure materials are visible
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => {
                                mat.needsUpdate = true;
                                if (mat.transparent !== undefined) mat.transparent = false;
                                if (mat.opacity !== undefined) mat.opacity = 1.0;
                            });
                        } else {
                            child.material.needsUpdate = true;
                            if (child.material.transparent !== undefined) child.material.transparent = false;
                            if (child.material.opacity !== undefined) child.material.opacity = 1.0;
                        }
                    }
                    
                    console.log('Mesh found:', child.name, child.geometry, child.material);
                }
            });

            // Set up animations if available
            if (gltf.animations && gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(this.robotModel);
                
                gltf.animations.forEach((clip, index) => {
                    const action = this.mixer.clipAction(clip);
                    this.animations[clip.name || `animation_${index}`] = action;
                    
                    console.log(`Animation loaded: ${clip.name || `animation_${index}`}`);
                });

                // Start with the first animation
                const firstAnimation = Object.values(this.animations)[0];
                if (firstAnimation) {
                    firstAnimation.play();
                    this.currentAnimation = firstAnimation;
                }
            }

            // Replace player with robot
            this.player = this.robotModel;
            this.scene.add(this.player);
            
            console.log('Robot model added to scene successfully');
            
            // Update UI with success message
            this.updateSuccessUI();

        } catch (error) {
            console.error('Failed to load robot model:', error);
            this.showLoadingError(error.message);
        }
    }

    updateLoadingUI(message) {
        if (this.gameState === 'start') {
            document.getElementById('instructions').innerHTML = `
                <h2>🤖 Robot Runner</h2>
                <p>${message}</p>
                <div style="color: #4CAF50;">Loading cute robots...</div>
                <button onclick="window.game.startGame()">🎮 스틱맨으로 시작</button>
            `;
        }
    }

    updateSuccessUI() {
        if (this.gameState === 'start') {
            document.getElementById('instructions').innerHTML = `
                <h2>🤖 Robot Runner</h2>
                <p>귀여운 로봇을 조종하여 장애물을 피하세요!</p>
                <div id="controls">
                    <div><span class="control-key">스페이스바</span> 또는 <span class="control-key">위쪽</span> : 점프</div>
                    <div><span class="control-key">아래쪽</span> 또는 <span class="control-key">S</span> : 슬라이드</div>
                    <div><span class="control-key">모바일</span> : 화면 위쪽 터치(점프), 아래쪽 터치(슬라이드)</div>
                </div>
                <button onclick="window.game.startGame()">🎮 게임 시작</button>
                <div style="font-size: 10px; color: #aaa; margin-top: 10px;">
                    Robot model by m1ch3lang3lo (CC-BY-4.0)
                </div>
            `;
        }
    }

    showLoadingError(errorMsg) {
        if (this.gameState === 'start') {
            document.getElementById('instructions').innerHTML = `
                <h2>🏃 Robot Runner</h2>
                <p>로봇 모델 로딩 실패 - 스틱맨으로 플레이합니다</p>
                <div style="color: #ff6666; font-size: 12px;">${errorMsg}</div>
                <div id="controls">
                    <div><span class="control-key">스페이스바</span> 또는 <span class="control-key">위쪽</span> : 점프</div>
                    <div><span class="control-key">아래쪽</span> 또는 <span class="control-key">S</span> : 슬라이드</div>
                    <div><span class="control-key">모바일</span> : 화면 위쪽 터치(점프), 아래쪽 터치(슬라이드)</div>
                </div>
                <button onclick="window.game.startGame()">🎮 게임 시작</button>
            `;
        }
    }

    createFallbackPlayer() {
        const playerGroup = new THREE.Group();
        
        // Larger stick figure for better visibility from side angle
        const scale = 1.5; // Make stick figure larger
        
        // Body (cylinder)
        const bodyGeometry = new THREE.CylinderGeometry(0.15 * scale, 0.15 * scale, 2 * scale);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4444ff }); // Blue color
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1 * scale;
        body.castShadow = true;
        playerGroup.add(body);

        // Head (sphere)
        const headGeometry = new THREE.SphereGeometry(0.3 * scale);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x4444ff });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.3 * scale;
        head.castShadow = true;
        playerGroup.add(head);

        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.08 * scale, 0.08 * scale, 1.2 * scale);
        const armMaterial = new THREE.MeshLambertMaterial({ color: 0x4444ff });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.4 * scale, 1.3 * scale, 0);
        leftArm.rotation.z = Math.PI / 6;
        leftArm.castShadow = true;
        playerGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.4 * scale, 1.3 * scale, 0);
        rightArm.rotation.z = -Math.PI / 6;
        rightArm.castShadow = true;
        playerGroup.add(rightArm);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.08 * scale, 0.08 * scale, 1.2 * scale);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x4444ff });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.2 * scale, -0.6 * scale, 0);
        leftLeg.castShadow = true;
        playerGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.2 * scale, -0.6 * scale, 0);
        rightLeg.castShadow = true;
        playerGroup.add(rightLeg);

        // Position player at ground level
        playerGroup.position.set(0, 0, 0);
        this.player = playerGroup;
        this.scene.add(this.player);
    }

    createGround() {
        this.ground = [];
    }

    createGroundTile(z) {
        const groundGeometry = new THREE.PlaneGeometry(10, 10);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x228B22,
            side: THREE.DoubleSide 
        });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.position.set(0, 0, z);
        groundMesh.receiveShadow = true;
        
        this.ground.push(groundMesh);
        this.scene.add(groundMesh);
    }

    createObstacle(type, z) {
        const obstacle = new THREE.Group();
        obstacle.userData = { type: type, passed: false };

        let geometry, color, height, width, depth;
        
        if (type === 'high') {
            // High obstacle - player must slide under (hanging from above)
            height = 3;
            width = 2;
            depth = 1;
            geometry = new THREE.BoxGeometry(width, height, depth);
            color = 0xff4444; // Red
        } else {
            // Low obstacle - player must jump over (ground obstacle)
            height = 1.5;
            width = 2;
            depth = 1;
            geometry = new THREE.BoxGeometry(width, height, depth);
            color = 0x44ffff; // Teal
        }

        const material = new THREE.MeshLambertMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        
        if (type === 'high') {
            mesh.position.y = height / 2 + 1; // Raised higher for sliding under
        } else {
            mesh.position.y = height / 2; // Ground level obstacle
        }
        
        mesh.castShadow = true;
        obstacle.add(mesh);

        obstacle.position.set(0, 0, z);
        this.obstacles.push(obstacle);
        this.scene.add(obstacle);
    }

    createParticle(x, y, z) {
        const particleGeometry = new THREE.SphereGeometry(0.02);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x8B4513,
            transparent: true,
            opacity: 0.6 
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(x, y, z);
        
        // Random velocity
        particle.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                Math.random() * 0.1,
                (Math.random() - 0.5) * 0.1
            ),
            life: 60 // frames
        };
        
        this.particles.push(particle);
        this.scene.add(particle);
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            if (this.gameState === 'start') {
                this.startGame();
                return;
            }
            
            if (this.gameState === 'playing') {
                switch(event.code) {
                    case 'Space':
                    case 'ArrowUp':
                    case 'KeyW':
                        event.preventDefault();
                        this.jump();
                        break;
                    case 'ArrowDown':
                    case 'KeyS':
                        event.preventDefault();
                        this.slide();
                        break;
                }
            }
        });

        // Touch controls for mobile
        this.renderer.domElement.addEventListener('touchstart', (event) => {
            event.preventDefault();
            
            if (this.gameState === 'start') {
                this.startGame();
                return;
            }
            
            if (this.gameState === 'playing') {
                const touch = event.touches[0];
                const rect = this.renderer.domElement.getBoundingClientRect();
                const y = touch.clientY - rect.top;
                const screenMiddle = rect.height / 2;
                
                if (y < screenMiddle) {
                    this.jump();
                } else {
                    this.slide();
                }
            }
        });

        // Prevent scrolling on mobile
        document.addEventListener('touchmove', (event) => {
            event.preventDefault();
        }, { passive: false });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    startGame() {
        if (this.gameState !== 'start') return;
        
        this.gameState = 'playing';
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
        
        // Reset game state
        this.score = 0;
        this.distance = 0;
        this.speed = 1.0;
        this.playerState = 'running';
        this.jumpVelocity = 0;
        this.jumpHeight = 0;
        this.slideTimer = 0;
        this.lastObstacleZ = -10;

        // Clear obstacles
        this.obstacles.forEach(obstacle => {
            this.scene.remove(obstacle);
        });
        this.obstacles = [];

        // Reset player position
        if (this.player) {
            this.player.position.set(0, 0, 0);
            this.player.rotation.set(0, 0, 0);
            if (this.robotModel) {
                this.player.rotation.y = Math.PI / 2; // Face forward for robot
            }
        }

        // Start running animation if available
        if (this.currentAnimation) {
            this.currentAnimation.play();
        }
    }

    jump() {
        if (this.playerState === 'running' || this.playerState === 'sliding') {
            this.playerState = 'jumping';
            this.jumpVelocity = this.jumpForce;
            this.slideTimer = 0;
            
            // Create dust particles
            for (let i = 0; i < 5; i++) {
                this.createParticle(
                    this.player.position.x + (Math.random() - 0.5),
                    0.1,
                    this.player.position.z + (Math.random() - 0.5)
                );
            }

            // Switch to jump animation if available
            this.switchAnimation('jump');
        }
    }

    slide() {
        if (this.playerState === 'running' || this.playerState === 'jumping') {
            this.playerState = 'sliding';
            this.slideTimer = this.slideDuration;
            this.jumpVelocity = 0;
            this.jumpHeight = 0;

            // Switch to slide animation if available
            this.switchAnimation('slide');
        }
    }

    switchAnimation(animationType) {
        if (!this.mixer || !this.animations) return;

        // Try to find the appropriate animation
        let targetAnimation = null;
        
        // Look for animation by name patterns
        for (const [name, action] of Object.entries(this.animations)) {
            const lowerName = name.toLowerCase();
            if (animationType === 'jump' && (lowerName.includes('jump') || lowerName.includes('hop'))) {
                targetAnimation = action;
                break;
            } else if (animationType === 'slide' && (lowerName.includes('slide') || lowerName.includes('crouch'))) {
                targetAnimation = action;
                break;
            } else if (animationType === 'run' && (lowerName.includes('run') || lowerName.includes('walk') || lowerName.includes('idle'))) {
                targetAnimation = action;
                break;
            }
        }

        // If no specific animation found, use the first available one
        if (!targetAnimation && Object.keys(this.animations).length > 0) {
            targetAnimation = Object.values(this.animations)[0];
        }

        if (targetAnimation && targetAnimation !== this.currentAnimation) {
            if (this.currentAnimation) {
                this.currentAnimation.fadeOut(0.2);
            }
            targetAnimation.reset().fadeIn(0.2).play();
            this.currentAnimation = targetAnimation;
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        
        // Update final score display
        document.getElementById('finalDistance').textContent = Math.floor(this.distance);
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }

    updatePlayer() {
        if (this.gameState !== 'playing') return;

        // Update animations
        if (this.mixer) {
            const delta = this.clock.getDelta();
            this.mixer.update(delta);
        }

        // Update jump physics
        if (this.playerState === 'jumping') {
            this.jumpVelocity -= this.gravity;
            this.jumpHeight += this.jumpVelocity;
            
            if (this.jumpHeight <= 0) {
                this.jumpHeight = 0;
                this.jumpVelocity = 0;
                this.playerState = 'running';
                this.switchAnimation('run');
            }
        }

        // Update slide
        if (this.playerState === 'sliding') {
            this.slideTimer--;
            if (this.slideTimer <= 0) {
                this.playerState = 'running';
                this.switchAnimation('run');
            }
        }

        // Update player position
        if (this.player) {
            this.player.position.y = this.jumpHeight;
            
            // Handle sliding for different character types
            if (this.playerState === 'sliding') {
                if (this.robotModel) {
                    // Robot: use rotation and slight position change
                    this.player.rotation.x = Math.PI / 8; // Lean forward slightly
                    this.player.position.y = this.jumpHeight - 0.5; // Lower position
                } else {
                    // Stick figure: scale down and lower position
                    this.player.scale.y = 0.6;
                    this.player.position.y = this.jumpHeight - 1;
                }
            } else {
                if (this.robotModel) {
                    this.player.rotation.x = 0;
                    this.player.rotation.y = Math.PI / 2; // Keep facing forward
                } else {
                    this.player.scale.y = 1;
                }
            }
        }
    }

    updateWorld() {
        if (this.gameState !== 'playing') return;

        const currentSpeed = this.baseSpeed * this.speed;
        
        // Move ground tiles
        this.ground.forEach(tile => {
            tile.position.z += currentSpeed;
            
            // Remove tiles that are too far behind
            if (tile.position.z > 20) {
                this.scene.remove(tile);
            }
        });
        
        // Remove old ground tiles and add new ones
        this.ground = this.ground.filter(tile => tile.position.z <= 20);
        
        // Add new ground tiles
        while (this.ground.length < 20) {
            const lastZ = this.ground.length > 0 ? Math.min(...this.ground.map(t => t.position.z)) : 0;
            this.createGroundTile(lastZ - 10);
        }

        // Update obstacles
        this.obstacles.forEach(obstacle => {
            obstacle.position.z += currentSpeed;
        });

        // Remove obstacles that are behind the player
        this.obstacles = this.obstacles.filter(obstacle => {
            if (obstacle.position.z > 5) {
                this.scene.remove(obstacle);
                return false;
            }
            return true;
        });

        // Spawn new obstacles
        if (this.obstacles.length === 0 || this.obstacles[this.obstacles.length - 1].position.z > -this.obstacleSpawnDistance) {
            const obstacleType = Math.random() > 0.5 ? 'high' : 'low';
            const spawnZ = this.obstacles.length > 0 ? 
                this.obstacles[this.obstacles.length - 1].position.z - this.obstacleSpawnDistance :
                -this.obstacleSpawnDistance;
            this.createObstacle(obstacleType, spawnZ);
        }

        // Update particles
        this.particles.forEach(particle => {
            particle.position.add(particle.userData.velocity);
            particle.userData.velocity.y -= 0.002; // gravity
            particle.userData.life--;
            particle.material.opacity = particle.userData.life / 60;
        });

        // Remove dead particles
        this.particles = this.particles.filter(particle => {
            if (particle.userData.life <= 0) {
                this.scene.remove(particle);
                return false;
            }
            return true;
        });

        // Update distance and speed
        this.distance += currentSpeed * 10;
        this.speed = 1 + (this.distance / 1000) * 0.5; // Increase speed gradually
    }

    checkCollisions() {
        if (this.gameState !== 'playing' || !this.player) return;

        this.obstacles.forEach(obstacle => {
            const playerX = this.player.position.x;
            const playerY = this.player.position.y;
            const playerZ = this.player.position.z;
            
            const obstacleX = obstacle.position.x;
            const obstacleY = obstacle.position.y;
            const obstacleZ = obstacle.position.z;
            
            // Check if player is close to obstacle in Z direction (forward/backward)
            if (Math.abs(obstacleZ - playerZ) < 1.0) {
                // Check if player is in collision range
                const distanceX = Math.abs(playerX - obstacleX);
                const distanceY = Math.abs(playerY - obstacleY);
                
                if (distanceX < 1.2) { // Side collision range
                    if (obstacle.userData.type === 'high') {
                        // High obstacle: collision if player is not sliding low enough
                        if (this.playerState !== 'sliding' && playerY > 0.5) {
                            this.gameOver();
                        }
                    } else if (obstacle.userData.type === 'low') {
                        // Low obstacle: collision if player is not jumping high enough
                        if (this.playerState !== 'jumping' && playerY < 2) {
                            this.gameOver();
                        }
                    }
                }
            }

            // Score points for passing obstacles
            if (!obstacle.userData.passed && obstacle.position.z > this.player.position.z + 1) {
                obstacle.userData.passed = true;
                this.score += 10;
            }
        });
    }

    updateUI() {
        document.getElementById('distance').textContent = Math.floor(this.distance);
        document.getElementById('score').textContent = this.score;
        document.getElementById('speed').textContent = this.speed.toFixed(1);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.frameCount++;
        
        this.updatePlayer();
        this.updateWorld();
        this.checkCollisions();
        this.updateUI();
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Global functions for HTML buttons
window.startGame = function() {
    if (window.game) {
        window.game.startGame();
    }
}

window.restartGame = function() {
    if (window.game) {
        window.game.startGame();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    try {
        console.log('Initializing Robot Runner with ES6 modules...');
        window.game = new RobotRunner();
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        
        // Show error message
        document.getElementById('instructions').innerHTML = `
            <h2>❌ 게임 로딩 실패</h2>
            <p>게임을 초기화하는 중 오류가 발생했습니다.</p>
            <p>브라우저를 새로고침하거나 다른 브라우저를 시도해보세요.</p>
            <button onclick="location.reload()">🔄 새로고침</button>
        `;
    }
});