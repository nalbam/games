// Game variables
let scene, camera, renderer, bat, pipes = [], score = 0, gameState = 'waiting';
let batVelocityY = 0;
let gravity = -0.002;
let jumpForce = 0.04;
let gameSpeed = 0.02;
let pipeSpacing = 4;
let lastPipeX = 5;
let clock = new THREE.Clock();
let mixer;

// Audio variables
let sounds = {};
let audioContext;
let audioLoaded = false;

// Texture loader and textures
let textureLoader = new THREE.TextureLoader();
let batTextures = {};
let rockTexture;
let currentBatTexture = 'bat1';

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x1a1a2e);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('gameContainer').appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Load textures first
    loadTextures().then(() => {
        // Create bat
        createBat();

        // Create initial pipes
        createPipe(5);
        createPipe(9);
        createPipe(13);
    });

    // Add event listeners
    document.addEventListener('click', handleInput);
    document.addEventListener('touchstart', handleInput);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', onWindowResize);

    // Load sounds
    loadSounds();

    // Start game loop
    animate();
}

function loadTextures() {
    return new Promise((resolve) => {
        let loadedCount = 0;
        const totalTextures = 5;
        
        function onTextureLoad() {
            loadedCount++;
            if (loadedCount === totalTextures) {
                resolve();
            }
        }
        
        // Load bat textures
        batTextures.bat1 = textureLoader.load('./images/bat1.png', onTextureLoad);
        batTextures.bat2 = textureLoader.load('./images/bat2.png', onTextureLoad);
        batTextures.bat_dead = textureLoader.load('./images/bat_dead.png', onTextureLoad);
        batTextures.bat_fever = textureLoader.load('./images/bat_fever.png', onTextureLoad);
        
        // Load rock texture
        rockTexture = textureLoader.load('./images/rock.png', onTextureLoad);
    });
}

function createBat() {
    // Create bat as a plane with texture
    const batGeometry = new THREE.PlaneGeometry(0.6, 0.45);
    const batMaterial = new THREE.MeshLambertMaterial({ 
        map: batTextures.bat1,
        transparent: true,
        alphaTest: 0.1
    });
    bat = new THREE.Mesh(batGeometry, batMaterial);
    bat.position.set(-2, 0, 0);
    bat.castShadow = true;
    scene.add(bat);
    
    // Wing flapping animation
    let wingTimer = 0;
    const animateBat = () => {
        if (gameState === 'playing') {
            wingTimer += 0.1;
            // Alternate between bat1 and bat2 textures for wing flapping
            if (Math.sin(wingTimer) > 0) {
                if (currentBatTexture !== 'bat1') {
                    bat.material.map = batTextures.bat1;
                    currentBatTexture = 'bat1';
                    bat.material.needsUpdate = true;
                }
            } else {
                if (currentBatTexture !== 'bat2') {
                    bat.material.map = batTextures.bat2;
                    currentBatTexture = 'bat2';
                    bat.material.needsUpdate = true;
                }
            }
        }
        requestAnimationFrame(animateBat);
    };
    animateBat();
}

function createPipe(x) {
    const pipeGroup = new THREE.Group();
    
    // Random gap position
    const gapY = (Math.random() - 0.5) * 3;
    const gapSize = 2;
    
    // Create pipe material with rock texture
    const pipeMaterial = new THREE.MeshLambertMaterial({ 
        map: rockTexture,
        color: 0x888888
    });
    
    // Top pipe
    const topPipeGeometry = new THREE.CylinderGeometry(0.3, 0.3, 5, 8);
    const topPipe = new THREE.Mesh(topPipeGeometry, pipeMaterial);
    topPipe.position.set(0, gapY + gapSize/2 + 2.5, 0);
    topPipe.castShadow = true;
    topPipe.receiveShadow = true;
    pipeGroup.add(topPipe);
    
    // Bottom pipe
    const bottomPipe = new THREE.Mesh(topPipeGeometry, pipeMaterial);
    bottomPipe.position.set(0, gapY - gapSize/2 - 2.5, 0);
    bottomPipe.castShadow = true;
    bottomPipe.receiveShadow = true;
    pipeGroup.add(bottomPipe);
    
    // Pipe caps with darker rock texture
    const capMaterial = new THREE.MeshLambertMaterial({ 
        map: rockTexture,
        color: 0x666666
    });
    const capGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 8);
    
    const topCap = new THREE.Mesh(capGeometry, capMaterial);
    topCap.position.set(0, gapY + gapSize/2, 0);
    topCap.castShadow = true;
    pipeGroup.add(topCap);
    
    const bottomCap = new THREE.Mesh(capGeometry, capMaterial);
    bottomCap.position.set(0, gapY - gapSize/2, 0);
    bottomCap.castShadow = true;
    pipeGroup.add(bottomCap);
    
    pipeGroup.position.x = x;
    pipeGroup.userData = { passed: false, gapY: gapY, gapSize: gapSize };
    scene.add(pipeGroup);
    pipes.push(pipeGroup);
    
    lastPipeX = x;
}

function handleInput(event) {
    event.preventDefault();
    
    if (gameState === 'waiting') {
        startGame();
    } else if (gameState === 'playing') {
        flap();
    } else if (gameState === 'gameOver') {
        resetGame();
    }
}

function handleKeyDown(event) {
    if (event.code === 'Space') {
        event.preventDefault();
        handleInput(event);
    }
}

function startGame() {
    gameState = 'playing';
    document.getElementById('instructions').style.display = 'none';
    playSound('Bat_takeoff');
}

function flap() {
    batVelocityY = jumpForce;
    bat.rotation.x = -0.3;
    playSound('Bat_idle' + (Math.floor(Math.random() * 4) + 1));
}

function resetGame() {
    // Reset game state
    gameState = 'waiting';
    score = 0;
    batVelocityY = 0;
    bat.position.set(-2, 0, 0);
    bat.rotation.x = 0;
    
    // Remove all pipes
    pipes.forEach(pipe => scene.remove(pipe));
    pipes = [];
    
    // Reset bat texture
    bat.material.map = batTextures.bat1;
    currentBatTexture = 'bat1';
    bat.material.needsUpdate = true;
    
    // Create new pipes
    lastPipeX = 5;
    createPipe(5);
    createPipe(9);
    createPipe(13);
    
    // Update UI
    updateScore();
    document.getElementById('instructions').style.display = 'block';
    document.getElementById('instructions').innerHTML = `
        <h2>Game Over!</h2>
        <p>Final Score: ${score}</p>
        <p>Click or tap to play again</p>
    `;
}

function updateGame() {
    if (gameState !== 'playing') return;
    
    // Update bat physics
    batVelocityY += gravity;
    bat.position.y += batVelocityY;
    
    // Gradually return bat to neutral rotation
    bat.rotation.x += (0 - bat.rotation.x) * 0.1;
    
    // Move pipes from right to left
    pipes.forEach((pipe, index) => {
        pipe.position.x -= gameSpeed;
        
        // Check if pipe passed the bat
        if (!pipe.userData.passed && pipe.position.x < bat.position.x) {
            pipe.userData.passed = true;
            score++;
            updateScore();
            playSound('Successful_hit');
        }
        
        // Remove pipes that are too far left
        if (pipe.position.x < -8) {
            scene.remove(pipe);
            pipes.splice(index, 1);
        }
    });
    
    // Add new pipes on the right
    if (pipes.length === 0 || lastPipeX - pipes[pipes.length - 1].position.x < pipeSpacing) {
        lastPipeX += pipeSpacing;
        createPipe(lastPipeX);
    }
    
    // Check collisions
    checkCollisions();
    
    // Check if bat is out of bounds
    if (bat.position.y < -4 || bat.position.y > 4) {
        gameOver();
    }
}

function checkCollisions() {
    const batBox = new THREE.Box3().setFromObject(bat);
    
    pipes.forEach(pipe => {
        const pipeBox = new THREE.Box3().setFromObject(pipe);
        
        if (batBox.intersectsBox(pipeBox)) {
            gameOver();
        }
    });
}

function gameOver() {
    gameState = 'gameOver';
    
    // Change bat texture to dead
    bat.material.map = batTextures.bat_dead;
    currentBatTexture = 'bat_dead';
    bat.material.needsUpdate = true;
    
    playSound('Bat_hurt' + (Math.floor(Math.random() * 3) + 1));
    setTimeout(() => {
        resetGame();
    }, 1000);
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function loadSounds() {
    const soundFiles = [
        'Bat_hurt1', 'Bat_hurt2', 'Bat_hurt3',
        'Bat_idle1', 'Bat_idle2', 'Bat_idle3', 'Bat_idle4',
        'Bat_takeoff', 'Successful_hit'
    ];
    
    soundFiles.forEach(soundName => {
        const audio = new Audio(`sounds/${soundName}.ogg`);
        audio.volume = 0.5;
        sounds[soundName] = audio;
    });
    
    audioLoaded = true;
}

function playSound(soundName) {
    if (audioLoaded && sounds[soundName]) {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(e => {
            // Ignore audio play errors (common on mobile)
        });
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    updateGame();
    
    // Keep camera fixed for side-scrolling effect
    // camera.position.x stays at 0
    
    renderer.render(scene, camera);
}

// Initialize the game when the page loads
window.addEventListener('load', init);