const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 고해상도 지원을 위한 설정
const dpr = window.devicePixelRatio || 1;
const canvasWidth = 1600;
const canvasHeight = 1200;

// 캔버스 반응형 크기 조정 함수 (모바일 최적화)
function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    const rect = container.getBoundingClientRect();
    
    // 모바일 성능을 위한 해상도 조정
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const adjustedDpr = isMobile ? Math.min(dpr, 2) : dpr; // 모바일에서 최대 2배로 제한
    
    // 캔버스 실제 렌더링 크기
    canvas.width = canvasWidth * adjustedDpr;
    canvas.height = canvasHeight * adjustedDpr;
    
    // CSS 표시 크기는 컨테이너에 맞춤
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    // 컨텍스트 스케일링
    ctx.scale(adjustedDpr, adjustedDpr);
    
    // 모바일 성능 최적화
    if (isMobile) {
        ctx.imageSmoothingEnabled = false; // 모바일에서는 스무딩 비활성화
    } else {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    }
}

// 초기 캔버스 크기 설정
resizeCanvas();

// 창 크기 변경 시 캔버스 크기 조정
window.addEventListener('resize', () => {
    resizeCanvas();
});

// 화면 회전 감지 (모바일)
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
});

// 이미지 로드
const batImg1 = new Image(); // 날개 펴기
const batImg2 = new Image(); // 날개 접기
const batImgDead = new Image(); // 충돌/사망 상태
const batImgFever = new Image(); // 피버 모드
const rockImg = new Image();
const logoImg = new Image();
const torchImg = new Image(); // 토치
batImg1.src = 'images/bat1.png';
batImg2.src = 'images/bat2.png';
batImgDead.src = 'images/bat_dead.png';
batImgFever.src = 'images/bat_fever.png';
rockImg.src = 'images/rock.png';
logoImg.src = 'images/game.png';
torchImg.src = 'images/torch.png';

// 오디오 로드 및 모바일 최적화
const sounds = {
    takeoff: new Audio('sounds/Bat_takeoff.ogg'),
    hurt1: new Audio('sounds/Bat_hurt1.ogg'),
    hurt2: new Audio('sounds/Bat_hurt2.ogg'),
    hurt3: new Audio('sounds/Bat_hurt3.ogg'),
    idle1: new Audio('sounds/Bat_idle1.ogg'),
    idle2: new Audio('sounds/Bat_idle2.ogg'),
    idle3: new Audio('sounds/Bat_idle3.ogg'),
    idle4: new Audio('sounds/Bat_idle4.ogg'),
    explosion1: new Audio('sounds/Explosion1.ogg'),
    explosion2: new Audio('sounds/Explosion2.ogg'),
    explosion3: new Audio('sounds/Explosion3.ogg'),
    explosion4: new Audio('sounds/Explosion4.ogg'),
    successful_hit: new Audio('sounds/Pop.ogg')
};

// 오디오 볼륨 설정 및 모바일 최적화
Object.values(sounds).forEach(sound => {
    sound.volume = 0.5;
    sound.preload = 'auto';
    // iOS Safari용 최적화
    sound.load();
});

// 오디오 재생 성능 최적화
let audioContext = null;
let lastAudioTime = 0;
const AUDIO_THROTTLE = 50; // 50ms 간격으로 오디오 재생 제한

function playAudioSafe(audio) {
    const now = Date.now();
    if (now - lastAudioTime < AUDIO_THROTTLE) {
        return; // 너무 빈번한 오디오 재생 방지
    }
    lastAudioTime = now;
    
    try {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                // 오디오 재생 실패 시 무시 (성능 향상)
            });
        }
    } catch (e) {
        // 오디오 재생 실패 시 무시
    }
}

// 랜덤 충돌 소리 재생 함수 (최적화)
function playRandomHurtSound() {
    const hurtSounds = [sounds.hurt1, sounds.hurt2, sounds.hurt3];
    const randomSound = hurtSounds[Math.floor(Math.random() * hurtSounds.length)];
    playAudioSafe(randomSound);
}

// 랜덤 idle 소리 재생 함수 (최적화)
function playRandomIdleSound() {
    const idleSounds = [sounds.idle1, sounds.idle2, sounds.idle3, sounds.idle4];
    const randomSound = idleSounds[Math.floor(Math.random() * idleSounds.length)];
    playAudioSafe(randomSound);
}

// 랜덤 폭발 소리 재생 함수 (최적화)
function playRandomExplosionSound() {
    const explosionSounds = [sounds.explosion1, sounds.explosion2, sounds.explosion3, sounds.explosion4];
    const randomSound = explosionSounds[Math.floor(Math.random() * explosionSounds.length)];
    playAudioSafe(randomSound);
}

// Wait for images to load
let imagesLoaded = 0;
const totalImages = 7;
function imageLoaded() {
    imagesLoaded++;
}
batImg1.onload = imageLoaded;
batImg2.onload = imageLoaded;
batImgDead.onload = imageLoaded;
batImgFever.onload = imageLoaded;
rockImg.onload = imageLoaded;
logoImg.onload = imageLoaded;
torchImg.onload = imageLoaded;

// 게임 상태
let gameStarted = false;
let gameOver = false;
let score = 0;
let countdown = 0;
let countdownTimer = 0;
let debugMode = false; // 디버그 모드 (충돌 영역 표시)

// 재시작 버튼 관련
const restartButton = {
    x: 0,
    y: 0,
    width: 200,
    height: 60,
    visible: false
};

// 박쥐 (각 이미지별 비율에 맞게 크기 조정)
const bat = {
    x: 300,
    y: 600,
    baseWidth: 120, // 기본 너비
    baseHeight: 90, // 기본 높이
    velocity: 0,
    gravity: 1.0, // 고해상도에 맞게 조정
    jump: -16, // 고해상도에 맞게 조정
    // 애니메이션 관련
    animationFrame: 0,
    animationTimer: 0,
    isFlapping: false,
    flapDuration: 0,
    flapPhase: 0, // 0: 펼치기, 1: 접기
    // 충돌 상태
    isDead: false,
    deathRotation: 0,
    deathRotationSpeed: 0,
    // 피버 모드
    isFever: false,
    feverTimer: 0,
    feverDuration: 300, // 5초 (60fps * 5)
    feverSpeed: 24 // 피버 모드 속도 (기본 6의 4배)
};

// 각 박쥐 이미지별 크기 정의 (실제 이미지 비율 기반)
const batSizes = {
    bat1: { width: 121, height: 90 },     // 300x223 비율 (1.34:1)
    bat2: { width: 121, height: 90 },     // 300x223 비율 (1.34:1)
    bat_dead: { width: 85, height: 90 },  // 300x317 비율 (0.95:1)
    bat_fever: { width: 204, height: 180 } // 400x353 비율 (1.13:1) - 2배 크기
};

// 바위 (장애물) - 고해상도에 맞게 크기 조정
const rocks = [];
const rockWidth = 160; // 2배 크기
const rockGap = 360; // 2배 크기
let rockTimer = 0;
let caveOffset = 0;

// 토치 시스템
const torches = [];
const torchSize = { width: 51, height: 90 }; // 170x300 비율 (0.57:1)
let torchSpawnCounter = 0; // 기둥 통과 카운터

// 바위 물리 상태
const rockPhysics = {
    gravity: 0.3,
    rotationSpeed: 0.05,
    fallSpeed: 2
};

// 게임 루프 - 60 FPS 고정
let lastTime = 0;
const targetFPS = 60;
const frameTime = 1000 / targetFPS;

function gameLoop(currentTime) {
    if (currentTime - lastTime >= frameTime) {
        update();
        draw();
        lastTime = currentTime;
    }
    requestAnimationFrame(gameLoop);
}

function update() {
    // 카운트다운 처리
    if (gameStarted && countdown > 0) {
        countdownTimer++;
        if (countdownTimer >= 60) { // 1초마다
            countdown--;
            countdownTimer = 0;
            // 카운트다운이 끝났을 때 idle 소리 재생
            if (countdown === 0) {
                playRandomIdleSound();
            }
        }
        return;
    }

    if (!gameStarted) return;

    // 박쥐 물리
    if (!gameOver) {
        bat.velocity += bat.gravity;
        bat.y += bat.velocity;
        
        // 피버 모드 타이머 업데이트
        if (bat.isFever) {
            bat.feverTimer--;
            if (bat.feverTimer <= 0) {
                bat.isFever = false;
            }
        }
        
        // 박쥐 애니메이션 업데이트
        updateBatAnimation();
    } else if (bat.isDead) {
        // 게임 오버 후에도 박쥐는 계속 떨어짐
        bat.velocity += bat.gravity;
        bat.y += bat.velocity;
        
        // 회전 애니메이션
        bat.deathRotation += bat.deathRotationSpeed;
        
        // 바닥에 닿으면 정지 - 현재 박쥐 크기로 계산
        const batSize = getCurrentBatImageAndSize();
        if (bat.y + batSize.height >= canvasHeight - 60) {
            bat.y = canvasHeight - 60 - batSize.height;
            bat.velocity = 0;
            bat.deathRotationSpeed *= 0.8; // 회전 감속
        }
    }

    // 바위 생성 (게임 오버가 아닐 때만)
    if (!gameOver) {
        rockTimer++;
        // 피버 모드에서도 같은 비율로 기둥 생성 (속도에 비례하여 조정)
        const spawnThreshold = bat.isFever ? Math.round(90 * 6 / bat.feverSpeed) : 90;
        if (rockTimer > spawnThreshold) {
            const gapY = Math.random() * (canvasHeight - rockGap - 200) + 100;

            // 위쪽 바위 조각들 생성
            const topPieces = [];
            for (let y = 0; y < gapY; y += 90) { // 2배 크기
                topPieces.push({
                    x: 0,
                    y: y,
                    width: rockWidth,
                    height: Math.min(100, gapY - y), // 2배 크기
                    velocityX: 0,
                    velocityY: 0,
                    rotation: 0,
                    rotationSpeed: (Math.random() - 0.5) * 0.1,
                    onGround: false
                });
            }

            // 아래쪽 바위 조각들 생성
            const bottomPieces = [];
            for (let y = gapY + rockGap; y < canvasHeight - 60; y += 90) { // 2배 크기
                bottomPieces.push({
                    x: 0,
                    y: y,
                    width: rockWidth,
                    height: Math.min(100, canvasHeight - 60 - y), // 2배 크기
                    velocityX: 0,
                    velocityY: 0,
                    rotation: 0,
                    rotationSpeed: (Math.random() - 0.5) * 0.1,
                    onGround: false
                });
            }

            rocks.push({
                x: canvasWidth,
                topHeight: gapY,
                bottomY: gapY + rockGap,
                passed: false,
                // 물리 상태
                topCollapsed: false,
                bottomCollapsed: false,
                topPieces: topPieces,
                bottomPieces: bottomPieces
            });
            rockTimer = 0;
        }
    }

    // 바위 이동 및 물리 업데이트 (게임 오버 후에도 계속)
    for (let i = rocks.length - 1; i >= 0; i--) {
        const rock = rocks[i];

        // 바위 이동 (게임 오버가 아닐 때만)
        if (!gameOver) {
            const moveSpeed = bat.isFever ? bat.feverSpeed : 6;
            rock.x -= moveSpeed;
        }

        // 바위 조각들 물리 효과 업데이트 (항상 실행)
        if (rock.topCollapsed) {
            rock.topPieces.forEach(piece => {
                if (!piece.onGround) {
                    piece.x += piece.velocityX;
                    piece.y += piece.velocityY;
                    piece.velocityY += rockPhysics.gravity;
                    piece.rotation += piece.rotationSpeed;

                    // 바닥 충돌 검사 (동굴 바닥)
                    if (piece.y + piece.height >= canvasHeight - 60) {
                        piece.y = canvasHeight - 60 - piece.height;
                        piece.velocityY = 0;
                        piece.velocityX *= 0.7; // 마찰
                        piece.rotationSpeed *= 0.8;
                        piece.onGround = true;
                    }
                }
            });
        }

        if (rock.bottomCollapsed) {
            rock.bottomPieces.forEach(piece => {
                if (!piece.onGround) {
                    piece.x += piece.velocityX;
                    piece.y += piece.velocityY;
                    piece.velocityY += rockPhysics.gravity;
                    piece.rotation += piece.rotationSpeed;

                    // 바닥 충돌 검사 (동굴 바닥)
                    if (piece.y + piece.height >= canvasHeight - 60) {
                        piece.y = canvasHeight - 60 - piece.height;
                        piece.velocityY = 0;
                        piece.velocityX *= 0.7; // 마찰
                        piece.rotationSpeed *= 0.8;
                        piece.onGround = true;
                    }
                }
            });
        }

        // 점수 계산 (게임 오버가 아닐 때만)
        if (!gameOver && !rock.passed && rock.x + rockWidth < bat.x) {
            rock.passed = true;
            score++;
            torchSpawnCounter++;
            
            // 바위 기둥을 지날 때 Pop 소리 재생
            playAudioSafe(sounds.successful_hit);
            
            // 10개 기둥마다 토치 생성
            if (torchSpawnCounter >= 10) {
                spawnTorch();
                torchSpawnCounter = 0;
            }
        }

        // 바위 제거 (게임 오버가 아닐 때만)
        if (!gameOver && rock.x + rockWidth < 0) {
            rocks.splice(i, 1);
        }
    }

    // 동굴 스크롤 (게임 오버가 아닐 때만)
    if (!gameOver) {
        const moveSpeed = bat.isFever ? bat.feverSpeed : 6;
        caveOffset -= moveSpeed;
        if (caveOffset <= -90) caveOffset = 0; // 2배 크기
    }
    
    // 토치 이동 및 충돌 검사
    for (let i = torches.length - 1; i >= 0; i--) {
        const torch = torches[i];
        
        // 토치 이동
        if (!gameOver) {
            const moveSpeed = bat.isFever ? bat.feverSpeed : 6;
            torch.x -= moveSpeed;
        }
        
        // 토치 제거 (화면 밖으로 나간 경우)
        if (torch.x + torchSize.width < 0) {
            torches.splice(i, 1);
            continue;
        }
        
        // 토치와 박쥐 충돌 검사
        const currentBatSize = getCurrentBatImageAndSize();
        if (!torch.collected && 
            bat.x < torch.x + torchSize.width && 
            bat.x + currentBatSize.width > torch.x &&
            bat.y < torch.y + torchSize.height && 
            bat.y + currentBatSize.height > torch.y) {
            
            // 토치 획득
            torch.collected = true;
            bat.isFever = true;
            bat.feverTimer = bat.feverDuration;
            
            // 토치 획득 사운드 (기존 사운드 활용)
            playRandomIdleSound();
        }
    }

    // 충돌 검사 (동굴 천장과 바닥) - 현재 박쥐 크기로 검사
    const currentBatSize = getCurrentBatImageAndSize();
    if (bat.y <= 60 || bat.y + currentBatSize.height >= canvasHeight - 60) {
        if (!gameOver) {
            playRandomHurtSound(); // 벽 충돌 소리 재생
            playRandomExplosionSound(); // 폭발 소리 재생
            // 충돌 시 박쥐 상태 변경
            bat.isDead = true;
            bat.deathRotationSpeed = (Math.random() - 0.5) * 0.3; // 랜덤 회전 속도
        }
        gameOver = true;
    }

    for (const rock of rocks) {
        const rockMargin = rockWidth * 0.05;
        if (bat.x < rock.x + rockWidth - rockMargin && bat.x + currentBatSize.width > rock.x + rockMargin) {
            // 실제 바위가 그려지는 끝점까지 충돌 검사 (렌더링과 동일한 로직)
            let actualTopEnd = 0;
            for (let y = 0; y < rock.topHeight; y += 90) { // 2배 크기
                actualTopEnd = y + Math.min(100, rock.topHeight - y); // 2배 크기
            }

            // 위쪽 바위와 충돌 (바위 조각들 떨어뜨리기)
            if (bat.y < actualTopEnd - rockMargin && !rock.topCollapsed) {
                rock.topCollapsed = true;
                // 각 조각에 랜덤한 초기 속도 부여
                rock.topPieces.forEach(piece => {
                    piece.velocityX = (Math.random() - 0.5) * 4;
                    piece.velocityY = Math.random() * 2 + 1;
                    piece.rotationSpeed = (Math.random() - 0.5) * 0.2;
                });
                
                if (bat.isFever) {
                    // 피버 모드에서는 바위만 부수고 계속 진행
                    playRandomExplosionSound(); // 폭발 소리만 재생
                } else {
                    // 일반 모드에서는 게임 오버
                    playRandomHurtSound(); // 충돌 소리 재생
                    playRandomExplosionSound(); // 폭발 소리 재생
                    bat.isDead = true;
                    bat.deathRotationSpeed = (Math.random() - 0.5) * 0.3;
                    gameOver = true;
                }
            }

            // 아래쪽 바위와 충돌 (바위 조각들 넘어뜨리기)
            if (bat.y + currentBatSize.height > rock.bottomY + rockMargin && !rock.bottomCollapsed) {
                rock.bottomCollapsed = true;
                // 충돌 방향에 따른 초기 속도 설정
                const direction = bat.x < rock.x + rockWidth / 2 ? 1 : -1;
                rock.bottomPieces.forEach(piece => {
                    piece.velocityX = direction * (Math.random() * 3 + 2);
                    piece.velocityY = Math.random() * 2;
                    piece.rotationSpeed = direction * (Math.random() * 0.15 + 0.05);
                });
                
                if (bat.isFever) {
                    // 피버 모드에서는 바위만 부수고 계속 진행
                    playRandomExplosionSound(); // 폭발 소리만 재생
                } else {
                    // 일반 모드에서는 게임 오버
                    playRandomHurtSound(); // 충돌 소리 재생
                    playRandomExplosionSound(); // 폭발 소리 재생
                    bat.isDead = true;
                    bat.deathRotationSpeed = (Math.random() - 0.5) * 0.3;
                    gameOver = true;
                }
            }
        }
    }
}

// 박쥐 애니메이션 업데이트 함수
function updateBatAnimation() {
    // 날개짓 애니메이션 타이머 업데이트
    if (bat.isFlapping) {
        bat.flapDuration--;
        
        // 날개짓 단계 변경 (펼치기 -> 접기)
        if (bat.flapDuration <= 4 && bat.flapPhase === 0) { // 마지막 4프레임에서 접기
            bat.flapPhase = 1;
        }
        
        if (bat.flapDuration <= 0) {
            bat.isFlapping = false;
            bat.flapPhase = 0;
        }
    }
    
    // 일반 애니메이션 타이머 (자연스러운 날개짓)
    if (!bat.isFlapping) {
        bat.animationTimer++;
        if (bat.animationTimer >= 20) { // 약 1/3초마다 변경
            bat.animationFrame = (bat.animationFrame + 1) % 2;
            bat.animationTimer = 0;
        }
    }
}

// 현재 박쥐 이미지와 크기 반환 함수
function getCurrentBatImageAndSize() {
    let image, sizeKey;
    
    // 충돌/사망 상태일 때
    if (bat.isDead) {
        image = batImgDead;
        sizeKey = 'bat_dead';
    }
    // 피버 모드일 때
    else if (bat.isFever) {
        image = batImgFever;
        sizeKey = 'bat_fever';
    }
    // 점프 애니메이션 중일 때
    else if (bat.isFlapping) {
        if (bat.flapPhase === 0) {
            image = batImg1;
            sizeKey = 'bat1';
        } else {
            image = batImg2;
            sizeKey = 'bat2';
        }
    }
    // 떨어질 때(하강 중)는 날개 펴기 (bat1)
    else if (bat.velocity > 2) {
        image = batImg1;
        sizeKey = 'bat1';
    }
    // 일반 상태에서는 애니메이션 프레임에 따라 (자연스러운 날개짓)
    else {
        if (bat.animationFrame === 0) {
            image = batImg2;
            sizeKey = 'bat2';
        } else {
            image = batImg1;
            sizeKey = 'bat1';
        }
    }
    
    return {
        image: image,
        width: batSizes[sizeKey].width,
        height: batSizes[sizeKey].height
    };
}

// 토치 생성 함수
function spawnTorch() {
    const torch = {
        x: canvasWidth + 100, // 화면 오른쪽 밖에서 시작
        y: Math.random() * (canvasHeight - 200) + 100, // 랜덤한 Y 위치
        collected: false
    };
    torches.push(torch);
}

function draw() {
    // 배경
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 이미지 로딩 확인
    if (imagesLoaded < totalImages) {
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading...', canvasWidth/2, canvasHeight/2);
        ctx.fillText(`${imagesLoaded}/${totalImages} images loaded`, canvasWidth/2, canvasHeight/2 + 80);
        return;
    }

    if (!gameStarted) {
        ctx.drawImage(logoImg, canvasWidth/2 - 300, canvasHeight/2 - 240, 600, 480);
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        
        // 입력 방법에 따른 안내 메시지
        if ('ontouchstart' in window) {
            ctx.fillText('Touch to start', canvasWidth/2, canvasHeight/2 + 300);
        } else {
            ctx.fillText('Press SPACE or Click to start', canvasWidth/2, canvasHeight/2 + 300);
        }
        return;
    }

    // 카운트다운 표시
    if (countdown > 0) {
        ctx.fillStyle = '#fff';
        ctx.font = '96px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(countdown, canvasWidth/2, canvasHeight/2);
        return;
    }

    // Rocks
    for (const rock of rocks) {
        // Top rocks - 개별 조각 렌더링
        if (rock.topCollapsed) {
            rock.topPieces.forEach(piece => {
                ctx.save();
                ctx.translate(rock.x + piece.x + piece.width/2, piece.y + piece.height/2);
                ctx.rotate(piece.rotation);
                ctx.drawImage(rockImg, -piece.width/2, -piece.height/2, piece.width, piece.height);
                ctx.restore();
            });
        } else {
            // 정상 상태 렌더링
            for (let y = 0; y < rock.topHeight; y += 90) { // 2배 크기
                ctx.drawImage(rockImg, rock.x, y, rockWidth, Math.min(100, rock.topHeight - y)); // 2배 크기
            }
        }

        // Bottom rocks - 개별 조각 렌더링
        if (rock.bottomCollapsed) {
            rock.bottomPieces.forEach(piece => {
                ctx.save();
                ctx.translate(rock.x + piece.x + piece.width/2, piece.y + piece.height/2);
                ctx.rotate(piece.rotation);
                ctx.drawImage(rockImg, -piece.width/2, -piece.height/2, piece.width, piece.height);
                ctx.restore();
            });
        } else {
            // 정상 상태 렌더링
            for (let y = rock.bottomY; y < canvasHeight - 60; y += 90) { // 2배 크기
                ctx.drawImage(rockImg, rock.x, y, rockWidth, Math.min(100, canvasHeight - 60 - y)); // 2배 크기
            }
        }

        // 바위 충돌 영역 표시 (디버그 모드)
        if (debugMode) {
            const rockMargin = rockWidth * 0.05;
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            // Top rock collision area - 실제 바위가 그려지는 끝점까지 계산 (렌더링과 동일한 로직)
            let actualTopEnd = 0;
            for (let y = 0; y < rock.topHeight; y += 90) { // 2배 크기
                actualTopEnd = y + Math.min(100, rock.topHeight - y); // 2배 크기
            }
            ctx.strokeRect(rock.x + rockMargin, 0, rockWidth - rockMargin * 2, actualTopEnd - rockMargin);
            // Bottom rock collision area
            ctx.strokeRect(rock.x + rockMargin, rock.bottomY + rockMargin, rockWidth - rockMargin * 2, canvasHeight - (rock.bottomY + rockMargin));
        }
    }

    // 토치 렌더링
    for (const torch of torches) {
        if (!torch.collected) {
            ctx.drawImage(torchImg, torch.x, torch.y, torchSize.width, torchSize.height);
            
            // 토치 주변에 빛나는 효과
            if (bat.isFever) {
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(torch.x + torchSize.width/2, torch.y + torchSize.height/2, 30, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
    }

    // 박쥐
    const batRender = getCurrentBatImageAndSize();
    
    if (bat.isDead && bat.deathRotation !== 0) {
        // 회전하면서 그리기
        ctx.save();
        ctx.translate(bat.x + batRender.width/2, bat.y + batRender.height/2);
        ctx.rotate(bat.deathRotation);
        ctx.drawImage(batRender.image, -batRender.width/2, -batRender.height/2, batRender.width, batRender.height);
        ctx.restore();
    } else {
        // 일반 그리기
        ctx.drawImage(batRender.image, bat.x, bat.y, batRender.width, batRender.height);
    }

    // 박쥐 충돌 영역 표시 (디버그 모드)
    if (debugMode) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(bat.x, bat.y, batRender.width, batRender.height);
    }

    // Cave ceiling and floor (가장 앞에 렌더링)
    for (let x = caveOffset; x < canvasWidth + 100; x += 90) { // 2배 크기
        ctx.drawImage(rockImg, x, 0, 100, 60); // Top ceiling (2배 크기)
        ctx.drawImage(rockImg, x, canvasHeight - 60, 100, 60); // Bottom floor (2배 크기)
    }

    // 동굴 벽 충돌 영역 표시 (디버그 모드)
    if (debugMode) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvasWidth, 60); // Top ceiling collision
        ctx.strokeRect(0, canvasHeight - 60, canvasWidth, 60); // Bottom floor collision
    }

    // 점수 표시
    if (gameStarted) {
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + score, 40, 80);
        
        // 피버 모드 표시
        if (bat.isFever) {
            ctx.fillStyle = '#FFD700';
            ctx.font = '32px Arial';
            ctx.fillText('FEVER MODE!', 40, 130);
            
            // 피버 모드 타이머 바
            const feverProgress = bat.feverTimer / bat.feverDuration;
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(40, 140, 200 * feverProgress, 10);
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(40, 140, 200, 10);
        }
    }

    if (gameOver) {
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvasWidth/2, canvasHeight/2);
        ctx.fillText('Score: ' + score, canvasWidth/2, canvasHeight/2 + 60);
        
        // 재시작 버튼 위치 계산
        restartButton.x = canvasWidth/2 - restartButton.width/2;
        restartButton.y = canvasHeight/2 + 140;
        restartButton.visible = true;
        
        // 재시작 버튼 그리기
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);
        
        // 버튼 테두리
        ctx.strokeStyle = '#45a049';
        ctx.lineWidth = 3;
        ctx.strokeRect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);
        
        // 버튼 텍스트
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔄 Restart', restartButton.x + restartButton.width/2, restartButton.y + 38);
        
        // 추가 안내 텍스트
        ctx.font = '20px Arial';
        ctx.fillText('Press R key or click button to restart', canvasWidth/2, canvasHeight/2 + 240);
    }
}

// 게임 입력 처리 함수
function handleGameInput(e) {
    if (e) e.preventDefault();
    
    if (!gameStarted && imagesLoaded >= totalImages) {
        gameStarted = true;
        countdown = 3;
        countdownTimer = 0;
    } else if (!gameOver && countdown === 0) {
        bat.velocity = bat.jump;
        // 날개짓 애니메이션 시작 (연속 입력시 더 빠르게)
        if (!bat.isFlapping) {
            bat.isFlapping = true;
            bat.flapDuration = 12; // 조금 더 빠르게
            bat.flapPhase = 0;
        } else {
            // 이미 날개짓 중이면 더 빠른 날개짓
            bat.flapDuration = Math.max(bat.flapDuration, 8);
            bat.flapPhase = 0; // 다시 펼치기부터 시작
        }
        // 날개짓 소리 재생 (최적화)
        playAudioSafe(sounds.takeoff);
    }
}

function handleRestart(e) {
    if (e) e.preventDefault();
    
    if (gameOver) {
        // 재시작
        gameOver = false;
        gameStarted = true;
        countdown = 3;
        countdownTimer = 0;
        bat.y = 600;
        bat.velocity = 0;
        bat.animationFrame = 0;
        bat.animationTimer = 0;
        bat.isFlapping = false;
        bat.flapDuration = 0;
        bat.flapPhase = 0;
        bat.isDead = false;
        bat.deathRotation = 0;
        bat.deathRotationSpeed = 0;
        bat.isFever = false;
        bat.feverTimer = 0;
        rocks.length = 0;
        rockTimer = 0;
        score = 0;
        caveOffset = 0;
        torches.length = 0;
        torchSpawnCounter = 0;
        restartButton.visible = false;
    }
}

// 버튼 클릭 감지 함수
function isPointInButton(x, y, button) {
    return x >= button.x && x <= button.x + button.width &&
           y >= button.y && y <= button.y + button.height;
}

// 마우스/터치 좌표를 캔버스 좌표로 변환
function getCanvasCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    
    let clientX, clientY;
    if (e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

// 키보드 입력
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        handleGameInput(e);
    } else if (e.code === 'KeyR') {
        handleRestart(e);
    }
});

// 터치 입력 지원
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    
    if (gameOver) {
        // 게임 오버 상태에서는 재시작 버튼 클릭 확인
        const coords = getCanvasCoordinates(e);
        if (restartButton.visible && isPointInButton(coords.x, coords.y, restartButton)) {
            handleRestart(e);
        }
    } else {
        handleGameInput(e);
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
});

// 마우스 클릭 지원
canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    
    if (gameOver) {
        // 게임 오버 상태에서는 재시작 버튼 클릭 확인
        const coords = getCanvasCoordinates(e);
        if (restartButton.visible && isPointInButton(coords.x, coords.y, restartButton)) {
            handleRestart(e);
        }
    } else {
        handleGameInput(e);
    }
});

// 터치 스크롤 방지 및 모바일 최적화
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// 모바일 성능 향상을 위한 추가 설정
if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    // 모바일에서 불필요한 이벤트 제거
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());
    
    // iOS Safari 주소창 숨김 처리
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.scrollTo(0, 1);
        }, 100);
    });
}

gameLoop();
