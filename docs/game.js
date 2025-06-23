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

// 박쥐
const bat = {
    x: 100,
    y: 320,
    width: 30,
    height: 20,
    velocity: 0,
    gravity: 0.5,
    jump: -8
};

// 바위 (장애물)
const rocks = [];
const rockWidth = 60;
const rockGap = 150;
let rockTimer = 0;
let caveOffset = 0;

// 게임 루프
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (!gameStarted || gameOver) return;

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
        if (bat.x < rock.x + rockWidth && bat.x + bat.width > rock.x) {
            if (bat.y < rock.topHeight || bat.y + bat.height > rock.bottomY) {
                gameOver = true;
            }
        }
    }
}

function draw() {
    // 배경
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Cave ceiling and floor
    for (let x = caveOffset; x < canvas.width + 50; x += 45) {
        ctx.drawImage(rockImg, x, 0, 50, 30); // Top ceiling
        ctx.drawImage(rockImg, x, canvas.height - 30, 50, 30); // Bottom floor
    }

    if (!gameStarted) {
        ctx.drawImage(logoImg, canvas.width/2 - 120, canvas.height/2 - 150, 240, 240);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to start', canvas.width/2, canvas.height/2 + 150);
        return;
    }

    // 박쥐
    ctx.drawImage(batImg, bat.x, bat.y, bat.width, bat.height);

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
        ctx.fillText('Press SPACE to restart', canvas.width/2, canvas.height/2 + 60);
    }
}

// 키보드 입력
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameStarted) {
            gameStarted = true;
        } else if (gameOver) {
            // 재시작
            gameOver = false;
            bat.y = 320;
            bat.velocity = 0;
            rocks.length = 0;
            rockTimer = 0;
            score = 0;
            caveOffset = 0;
        } else {
            bat.velocity = bat.jump;
        }
    }
});

gameLoop();
