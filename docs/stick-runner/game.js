class StickRunner {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.character = null;
        this.obstacles = [];
        this.ground = null;
        
        this.isGameRunning = false;
        this.isJumping = false;
        this.isSliding = false;
        this.jumpVelocity = 0;
        this.slideTimer = 0;
        
        this.score = 0;
        this.distance = 0;
        this.gameSpeed = 0.2;
        this.baseSpeed = 0.2;
        this.speedIncrement = 0.0001;
        
        this.characterHeight = 2;
        this.characterY = 1;
        this.jumpSpeed = 0.3;
        this.gravity = -0.02;
        this.slideHeight = 0.5;
        this.slideDuration = 500;
        
        this.lastObstacleZ = -20;
        this.obstacleSpacing = 15;
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x667eea, 50, 150);
        
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 2, 0);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        this.createGround();
        this.createCharacter();
        this.updateUI();
    }
    
    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(20, 200);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = 0;
        this.ground.position.z = -50;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
        
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        
        for (let i = -100; i < 100; i += 5) {
            const points = [];
            points.push(new THREE.Vector3(-10, 0.01, i));
            points.push(new THREE.Vector3(10, 0.01, i));
            lineGeometry.setFromPoints(points);
            const line = new THREE.Line(lineGeometry.clone(), lineMaterial);
            this.scene.add(line);
        }
    }
    
    createCharacter() {
        const characterGroup = new THREE.Group();
        
        const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const bodyGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1);
        const limbGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8);
        
        const material = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const head = new THREE.Mesh(headGeometry, material);
        head.position.y = 1.7;
        head.castShadow = true;
        characterGroup.add(head);
        
        const body = new THREE.Mesh(bodyGeometry, material);
        body.position.y = 1;
        body.castShadow = true;
        characterGroup.add(body);
        
        const leftArm = new THREE.Mesh(limbGeometry, material);
        leftArm.position.set(-0.3, 1.2, 0);
        leftArm.rotation.z = Math.PI / 4;
        leftArm.castShadow = true;
        characterGroup.add(leftArm);
        
        const rightArm = new THREE.Mesh(limbGeometry, material);
        rightArm.position.set(0.3, 1.2, 0);
        rightArm.rotation.z = -Math.PI / 4;
        rightArm.castShadow = true;
        characterGroup.add(rightArm);
        
        const leftLeg = new THREE.Mesh(limbGeometry, material);
        leftLeg.position.set(-0.15, 0.4, 0);
        leftLeg.castShadow = true;
        characterGroup.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(limbGeometry, material);
        rightLeg.position.set(0.15, 0.4, 0);
        rightLeg.castShadow = true;
        characterGroup.add(rightLeg);
        
        characterGroup.position.y = this.characterY;
        characterGroup.position.z = 0;
        
        this.character = characterGroup;
        this.scene.add(this.character);
    }
    
    createObstacle(type) {
        let obstacle;
        let material;
        
        if (type === 'low') {
            const geometry = new THREE.BoxGeometry(2, 1, 1);
            material = new THREE.MeshLambertMaterial({ color: 0x00ffff });
            obstacle = new THREE.Mesh(geometry, material);
            obstacle.position.y = 0.5;
            obstacle.userData.type = 'low';
        } else {
            const geometry = new THREE.BoxGeometry(2, 2, 1);
            material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
            obstacle = new THREE.Mesh(geometry, material);
            obstacle.position.y = 2;
            obstacle.userData.type = 'high';
        }
        
        obstacle.position.z = this.lastObstacleZ - this.obstacleSpacing;
        obstacle.castShadow = true;
        obstacle.receiveShadow = true;
        
        this.lastObstacleZ = obstacle.position.z;
        this.obstacles.push(obstacle);
        this.scene.add(obstacle);
    }
    
    updateCharacter() {
        if (!this.isGameRunning) return;
        
        if (this.isJumping) {
            this.character.position.y += this.jumpVelocity;
            this.jumpVelocity += this.gravity;
            
            if (this.character.position.y <= this.characterY) {
                this.character.position.y = this.characterY;
                this.isJumping = false;
                this.jumpVelocity = 0;
            }
        }
        
        if (this.isSliding) {
            this.character.scale.y = 0.5;
            this.character.position.y = this.characterY * 0.5;
            this.slideTimer -= 16;
            
            if (this.slideTimer <= 0) {
                this.isSliding = false;
                this.character.scale.y = 1;
                this.character.position.y = this.characterY;
            }
        } else if (!this.isJumping) {
            this.character.scale.y = 1;
            this.character.position.y = this.characterY;
        }
        
        const runAnimation = Math.sin(Date.now() * 0.01) * 0.1;
        this.character.children[3].rotation.x = runAnimation;
        this.character.children[4].rotation.x = -runAnimation;
        this.character.children[1].rotation.z = runAnimation * 0.1;
        this.character.children[2].rotation.z = -runAnimation * 0.1;
    }
    
    updateObstacles() {
        if (!this.isGameRunning) return;
        
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.position.z += this.gameSpeed;
            
            if (obstacle.position.z > 5) {
                this.scene.remove(obstacle);
                this.obstacles.splice(i, 1);
            }
            
            if (this.checkCollision(obstacle)) {
                this.gameOver();
            }
        }
        
        if (this.obstacles.length === 0 || 
            this.obstacles[this.obstacles.length - 1].position.z > -30) {
            const type = Math.random() > 0.5 ? 'low' : 'high';
            this.createObstacle(type);
        }
    }
    
    checkCollision(obstacle) {
        const characterBox = new THREE.Box3().setFromObject(this.character);
        const obstacleBox = new THREE.Box3().setFromObject(obstacle);
        
        const charMin = characterBox.min;
        const charMax = characterBox.max;
        const obsMin = obstacleBox.min;
        const obsMax = obstacleBox.max;
        
        const margin = 0.2;
        charMin.x += margin;
        charMax.x -= margin;
        charMin.z += margin;
        charMax.z -= margin;
        
        if (this.isSliding && obstacle.userData.type === 'high') {
            charMax.y = this.characterY * 0.5 + 0.5;
        }
        
        return charMin.x <= obsMax.x && charMax.x >= obsMin.x &&
               charMin.y <= obsMax.y && charMax.y >= obsMin.y &&
               charMin.z <= obsMax.z && charMax.z >= obsMin.z;
    }
    
    jump() {
        if (!this.isJumping && !this.isSliding && this.isGameRunning) {
            this.isJumping = true;
            this.jumpVelocity = this.jumpSpeed;
        }
    }
    
    slide() {
        if (!this.isJumping && !this.isSliding && this.isGameRunning) {
            this.isSliding = true;
            this.slideTimer = this.slideDuration;
        }
    }
    
    startGame() {
        this.isGameRunning = true;
        this.score = 0;
        this.distance = 0;
        this.gameSpeed = this.baseSpeed;
        
        this.obstacles.forEach(obstacle => {
            this.scene.remove(obstacle);
        });
        this.obstacles = [];
        this.lastObstacleZ = -20;
        
        this.character.position.y = this.characterY;
        this.character.scale.y = 1;
        this.isJumping = false;
        this.isSliding = false;
        this.jumpVelocity = 0;
        this.slideTimer = 0;
        
        document.getElementById('gameMessage').style.display = 'none';
        document.getElementById('instructions').style.display = 'none';
        
        this.createObstacle(Math.random() > 0.5 ? 'low' : 'high');
    }
    
    gameOver() {
        this.isGameRunning = false;
        document.getElementById('gameMessage').innerHTML = 
            `Game Over!<br>Score: ${Math.floor(this.score)}<br><br>Click to Restart`;
        document.getElementById('gameMessage').style.display = 'block';
    }
    
    updateGame() {
        if (!this.isGameRunning) return;
        
        this.distance += this.gameSpeed;
        this.score = this.distance * 10;
        this.gameSpeed = this.baseSpeed + (this.distance * this.speedIncrement);
        
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('score').textContent = `Score: ${Math.floor(this.score)}`;
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.isGameRunning && e.key === ' ') {
                this.startGame();
                return;
            }
            
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                this.jump();
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                e.preventDefault();
                this.slide();
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!this.isGameRunning) {
                this.startGame();
                return;
            }
            
            const clickY = e.clientY;
            const screenHeight = window.innerHeight;
            
            if (clickY < screenHeight / 2) {
                this.jump();
            } else {
                this.slide();
            }
        });
        
        document.addEventListener('touchstart', (e) => {
            if (!this.isGameRunning) {
                this.startGame();
                return;
            }
            
            const touchY = e.touches[0].clientY;
            const screenHeight = window.innerHeight;
            
            if (touchY < screenHeight / 2) {
                this.jump();
            } else {
                this.slide();
            }
            
            e.preventDefault();
        });
        
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updateCharacter();
        this.updateObstacles();
        this.updateGame();
        
        this.renderer.render(this.scene, this.camera);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StickRunner();
});