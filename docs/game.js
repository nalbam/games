const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 이미지 로드
const batImg = new Image();
const rockImg = new Image();
const logoImg = new Image();
batImg.src = 'images/bat.png';
rockImg.src = 'images/rock.png';
logoImg.src = 'images/game.png';

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
let debugMode = true; // 디버그 모드 (충돌 영역 표시)

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

// 게임 루프
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (gameOver) return;

    // 카운트다운 처리
    if (gameStarted && countdown > 0) {
        countdownTimer++;
        if (countdownTimer >= 60) { // 1초마다
            countdown--;
            countdownTimer = 0;
        }
        return;
    }

    if (!gameStarted) return;

    // 박쥐 물리
    bat.velocity += bat.gravity;
    bat.y += bat.velocity;

    // 바위 생성
    rockTimer++;
    if (rockTimer > 90) {
        const gapY = Math.random() * (canvas.height - rockGap - 100) + 50;
        rocks.push({
            x: canvas.width,
            topHeight: gapY,
            bottomY: gapY + rockGap,
            passed: false
        });
        rockTimer = 0;
    }

    // 바위 이동
    for (let i = rocks.length - 1; i >= 0; i--) {
        rocks[i].x -= 3;

        // 점수 계산
        if (!rocks[i].passed && rocks[i].x + rockWidth < bat.x) {
            rocks[i].passed = true;
            score++;
        }

        if (rocks[i].x + rockWidth < 0) {
            rocks.splice(i, 1);
        }
    }

    // 동굴 스크롤
    caveOffset -= 3;
    if (caveOffset <= -45) caveOffset = 0;

    // 충돌 검사
    if (bat.y <= 0 || bat.y + bat.height >= canvas.height) {
        gameOver = true;
    }

    for (const rock of rocks) {
        const rockMargin = rockWidth * 0.05;
        if (bat.x < rock.x + rockWidth - rockMargin && bat.x + bat.width > rock.x + rockMargin) {
            if (bat.y < rock.topHeight - rockMargin || bat.y + bat.height > rock.bottomY + rockMargin) {
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
        // Top rocks
        for (let y = 0; y < rock.topHeight; y += 45) {
            ctx.drawImage(rockImg, rock.x, y, rockWidth, 50);
        }
        // Bottom rocks
        for (let y = rock.bottomY; y < canvas.height; y += 45) {
            ctx.drawImage(rockImg, rock.x, y, rockWidth, 50);
        }

        // 바위 충돌 영역 표시 (디버그 모드)
        if (debugMode) {
            const rockMargin = rockWidth * 0.05;
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 2;
            // Top rock collision area - 실제 바위가 그려지는 끝점까지 계산
            // 마지막으로 그려지는 바위의 시작 Y좌표 찾기
            let lastDrawnRockY = 0;
            for (let y = 0; y < rock.topHeight; y += 45) {
                lastDrawnRockY = y;
            }
            // 실제 바위 끝점 = 마지막 바위 시작점 + 바위 높이(50)
            const actualTopEnd = lastDrawnRockY + 50;
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
