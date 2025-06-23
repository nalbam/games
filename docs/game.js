const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 이미지 로드
const batImg = new Image();
const rockImg = new Image();
const logoImg = new Image();
batImg.src = 'images/bat.png';
rockImg.src = 'images/rock.png';
logoImg.src = 'images/game.png';

// 오디오 로드
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
    explosion4: new Audio('sounds/Explosion4.ogg')
};

// 오디오 볼륨 설정
Object.values(sounds).forEach(sound => {
    sound.volume = 0.5;
});

// 랜덤 충돌 소리 재생 함수
function playRandomHurtSound() {
    const hurtSounds = [sounds.hurt1, sounds.hurt2, sounds.hurt3];
    const randomSound = hurtSounds[Math.floor(Math.random() * hurtSounds.length)];
    randomSound.currentTime = 0; // 소리 리셋
    randomSound.play().catch(e => console.log('Audio play failed:', e));
}

// 랜덤 idle 소리 재생 함수
function playRandomIdleSound() {
    const idleSounds = [sounds.idle1, sounds.idle2, sounds.idle3, sounds.idle4];
    const randomSound = idleSounds[Math.floor(Math.random() * idleSounds.length)];
    randomSound.currentTime = 0; // 소리 리셋
    randomSound.play().catch(e => console.log('Audio play failed:', e));
}

// 랜덤 폭발 소리 재생 함수
function playRandomExplosionSound() {
    const explosionSounds = [sounds.explosion1, sounds.explosion2, sounds.explosion3, sounds.explosion4];
    const randomSound = explosionSounds[Math.floor(Math.random() * explosionSounds.length)];
    randomSound.currentTime = 0; // 소리 리셋
    randomSound.play().catch(e => console.log('Audio play failed:', e));
}

// Wait for images to load
let imagesLoaded = 0;
function imageLoaded() {
    imagesLoaded++;
}
batImg.onload = imageLoaded;
rockImg.onload = imageLoaded;
logoImg.onload = imageLoaded;

// 게임 상태
let gameStarted = false;
let gameOver = false;
let score = 0;
let countdown = 0;
let countdownTimer = 0;
let debugMode = false; // 디버그 모드 (충돌 영역 표시)

// 박쥐
const bat = {
    x: 150,
    y: 300,
    width: 40,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jump: -8
};

// 바위 (장애물)
const rocks = [];
const rockWidth = 80;
const rockGap = 180;
let rockTimer = 0;
let caveOffset = 0;

// 바위 물리 상태
const rockPhysics = {
    gravity: 0.3,
    rotationSpeed: 0.05,
    fallSpeed: 2
};

// 게임 루프
function gameLoop() {
    update();
    draw();
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

    // 박쥐 물리 (게임 오버가 아닐 때만)
    if (!gameOver) {
        bat.velocity += bat.gravity;
        bat.y += bat.velocity;
    }

    // 바위 생성 (게임 오버가 아닐 때만)
    if (!gameOver) {
        rockTimer++;
        if (rockTimer > 90) {
            const gapY = Math.random() * (canvas.height - rockGap - 100) + 50;

            // 위쪽 바위 조각들 생성
            const topPieces = [];
            for (let y = 0; y < gapY; y += 45) {
                topPieces.push({
                    x: 0,
                    y: y,
                    width: rockWidth,
                    height: Math.min(50, gapY - y),
                    velocityX: 0,
                    velocityY: 0,
                    rotation: 0,
                    rotationSpeed: (Math.random() - 0.5) * 0.1,
                    onGround: false
                });
            }

            // 아래쪽 바위 조각들 생성
            const bottomPieces = [];
            for (let y = gapY + rockGap; y < canvas.height - 30; y += 45) {
                bottomPieces.push({
                    x: 0,
                    y: y,
                    width: rockWidth,
                    height: Math.min(50, canvas.height - 30 - y),
                    velocityX: 0,
                    velocityY: 0,
                    rotation: 0,
                    rotationSpeed: (Math.random() - 0.5) * 0.1,
                    onGround: false
                });
            }

            rocks.push({
                x: canvas.width,
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
            rock.x -= 3;
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
                    if (piece.y + piece.height >= canvas.height - 30) {
                        piece.y = canvas.height - 30 - piece.height;
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
                    if (piece.y + piece.height >= canvas.height - 30) {
                        piece.y = canvas.height - 30 - piece.height;
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
        }

        // 바위 제거 (게임 오버가 아닐 때만)
        if (!gameOver && rock.x + rockWidth < 0) {
            rocks.splice(i, 1);
        }
    }

    // 동굴 스크롤 (게임 오버가 아닐 때만)
    if (!gameOver) {
        caveOffset -= 3;
        if (caveOffset <= -45) caveOffset = 0;
    }

    // 충돌 검사
    if (bat.y <= 0 || bat.y + bat.height >= canvas.height) {
        if (!gameOver) {
            playRandomHurtSound(); // 벽 충돌 소리 재생
            playRandomExplosionSound(); // 폭발 소리 재생
        }
        gameOver = true;
    }

    for (const rock of rocks) {
        const rockMargin = rockWidth * 0.05;
        if (bat.x < rock.x + rockWidth - rockMargin && bat.x + bat.width > rock.x + rockMargin) {
            // 실제 바위가 그려지는 끝점까지 충돌 검사 (렌더링과 동일한 로직)
            let actualTopEnd = 0;
            for (let y = 0; y < rock.topHeight; y += 45) {
                actualTopEnd = y + Math.min(50, rock.topHeight - y);
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
                playRandomHurtSound(); // 충돌 소리 재생
                playRandomExplosionSound(); // 폭발 소리 재생
                gameOver = true;
            }

            // 아래쪽 바위와 충돌 (바위 조각들 넘어뜨리기)
            if (bat.y + bat.height > rock.bottomY + rockMargin && !rock.bottomCollapsed) {
                rock.bottomCollapsed = true;
                // 충돌 방향에 따른 초기 속도 설정
                const direction = bat.x < rock.x + rockWidth / 2 ? 1 : -1;
                rock.bottomPieces.forEach(piece => {
                    piece.velocityX = direction * (Math.random() * 3 + 2);
                    piece.velocityY = Math.random() * 2;
                    piece.rotationSpeed = direction * (Math.random() * 0.15 + 0.05);
                });
                playRandomHurtSound(); // 충돌 소리 재생
                playRandomExplosionSound(); // 폭발 소리 재생
                gameOver = true;
            }
        }
    }
}

function draw() {
    // 배경
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        ctx.drawImage(logoImg, canvas.width/2 - 150, canvas.height/2 - 120, 300, 240);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to start', canvas.width/2, canvas.height/2 + 150);
        return;
    }

    // 카운트다운 표시
    if (countdown > 0) {
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(countdown, canvas.width/2, canvas.height/2);
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
            for (let y = 0; y < rock.topHeight; y += 45) {
                ctx.drawImage(rockImg, rock.x, y, rockWidth, Math.min(50, rock.topHeight - y));
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
            for (let y = rock.bottomY; y < canvas.height - 30; y += 45) {
                ctx.drawImage(rockImg, rock.x, y, rockWidth, Math.min(50, canvas.height - 30 - y));
            }
        }

        // 바위 충돌 영역 표시 (디버그 모드)
        if (debugMode) {
            const rockMargin = rockWidth * 0.05;
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            // Top rock collision area - 실제 바위가 그려지는 끝점까지 계산 (렌더링과 동일한 로직)
            let actualTopEnd = 0;
            for (let y = 0; y < rock.topHeight; y += 45) {
                actualTopEnd = y + Math.min(50, rock.topHeight - y);
            }
            ctx.strokeRect(rock.x + rockMargin, 0, rockWidth - rockMargin * 2, actualTopEnd - rockMargin);
            // Bottom rock collision area
            ctx.strokeRect(rock.x + rockMargin, rock.bottomY + rockMargin, rockWidth - rockMargin * 2, canvas.height - (rock.bottomY + rockMargin));
        }
    }

    // 박쥐
    ctx.drawImage(batImg, bat.x, bat.y, bat.width, bat.height);

    // 박쥐 충돌 영역 표시 (디버그 모드)
    if (debugMode) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(bat.x, bat.y, bat.width, bat.height);
    }

    // Cave ceiling and floor (가장 앞에 렌더링)
    for (let x = caveOffset; x < canvas.width + 50; x += 45) {
        ctx.drawImage(rockImg, x, 0, 50, 30); // Top ceiling
        ctx.drawImage(rockImg, x, canvas.height - 30, 50, 30); // Bottom floor
    }

    // 동굴 벽 충돌 영역 표시 (디버그 모드)
    if (debugMode) {
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, 30); // Top ceiling collision
        ctx.strokeRect(0, canvas.height - 30, canvas.width, 30); // Bottom floor collision
    }

    // 점수 표시
    if (gameStarted) {
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + score, 20, 40);
    }

    if (gameOver) {
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
        ctx.fillText('Score: ' + score, canvas.width/2, canvas.height/2 + 30);
        ctx.fillText('Press R to restart', canvas.width/2, canvas.height/2 + 60);
    }
}

// 키보드 입력
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameStarted) {
            gameStarted = true;
            countdown = 3;
            countdownTimer = 0;
        } else if (!gameOver && countdown === 0) {
            bat.velocity = bat.jump;
            // 날개짓 소리 재생
            sounds.takeoff.currentTime = 0; // 소리 리셋
            sounds.takeoff.play().catch(e => console.log('Audio play failed:', e));
        }
    } else if (e.code === 'KeyR') {
        e.preventDefault();
        if (gameOver) {
            // 재시작
            gameOver = false;
            gameStarted = true;
            countdown = 3;
            countdownTimer = 0;
            bat.y = 300;
            bat.velocity = 0;
            rocks.length = 0;
            rockTimer = 0;
            score = 0;
            caveOffset = 0;
        }
    }
});

gameLoop();
