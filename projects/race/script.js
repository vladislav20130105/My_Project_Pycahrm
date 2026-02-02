// ========== СНЕЖНЫЙ ЭФФЕКТ ==========
    (function () {
        const container = document.getElementById('snowflake-container');
        const snowflakesCount = 100;
        for (let i = 0; i < snowflakesCount; i++) {
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            const size = Math.random() * 4 + 2;
            snowflake.style.width = `${size}px`;
            snowflake.style.height = `${size}px`;
            snowflake.style.left = `${Math.random() * 100}vw`;
            snowflake.style.opacity = Math.random() * 0.5 + 0.3;
            const fallDuration = Math.random() * 10 + 5;
            const driftDistance = (Math.random() * 20 - 10);
            const delay = Math.random() * 5;
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fall-${i} {
                    0% { transform: translateY(-10vh) translateX(0); }
                    100% { transform: translateY(100vh) translateX(${driftDistance}px); }
                }
                .snowflake-${i} {
                    animation: fall-${i} ${fallDuration}s linear infinite;
                    animation-delay: ${delay}s;
                }
            `;
            document.head.appendChild(style);
            snowflake.classList.add(`snowflake-${i}`);
            container.appendChild(snowflake);
        }
    })();

    // ========== ЗАСТАВКА ==========
    document.addEventListener('DOMContentLoaded', function () {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            setTimeout(() => {
                splash.style.opacity = '0';
                setTimeout(() => {
                    if (splash.parentNode) splash.remove();
                }, 500);
            }, 2000);
        }
    });

    // ========== ИГРОВАЯ ЛОГИКА ==========
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let gameRunning = false;
    let gamePaused = false;
    let score = 0;
    let highScore = localStorage.getItem('raceHighScore') || 0;
    let speed = 1;
    let gameSpeed = 2;
    let roadOffset = 0;
    let lastSpeedIncreaseTime = 0;
    const SPEED_INCREASE_INTERVAL = 20000; // 20 секунд

    const player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 100,
        width: 50,
        height: 80,
        speed: 5
    };

    let obstacles = [];
    let obstacleSpawnTimer = 0;
    let obstacleSpawnInterval = 120;

    const keys = {};

    const roadLines = [];
    for (let i = 0; i < 12; i++) {
        roadLines.push({ y: i * 80, width: 10, height: 40 });
    }

    document.getElementById('highScore').textContent = highScore;

    function drawRoad() {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(150, 0, 500, canvas.height);

        ctx.fillStyle = '#00f5d4';
        for (let line of roadLines) {
            ctx.fillRect(canvas.width / 2 - 5, line.y + roadOffset, 10, 40);
            line.y += gameSpeed;
            if (line.y > canvas.height) line.y = -40;
        }
        roadOffset = (roadOffset + gameSpeed) % 80;

        ctx.fillStyle = '#00f5d4';
        ctx.fillRect(148, 0, 4, canvas.height);
        ctx.fillRect(648, 0, 4, canvas.height);
    }

    function drawPlayer() {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(player.x, player.y + 20, player.width, player.height - 20);

        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.moveTo(player.x + 10, player.y + 20);
        ctx.lineTo(player.x + 20, player.y);
        ctx.lineTo(player.x + 30, player.y);
        ctx.lineTo(player.x + 40, player.y + 20);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#3498db';
        ctx.fillRect(player.x + 15, player.y + 5, 20, 15);

        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(player.x + 15, player.y + player.height - 10, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(player.x + 35, player.y + player.height - 10, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x + 15, player.y + player.height - 10, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(player.x + 35, player.y + player.height - 10, 8, 0, Math.PI * 2);
        ctx.stroke();
    }

    function drawObstacle(obstacle) {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y + 20, obstacle.width, obstacle.height - 20);

        const darkerColor = obstacle.color === '#3498db' ? '#2980b9' : '#8e44ad';
        ctx.fillStyle = darkerColor;
        ctx.beginPath();
        ctx.moveTo(obstacle.x + 10, obstacle.y + 20);
        ctx.lineTo(obstacle.x + 20, obstacle.y);
        ctx.lineTo(obstacle.x + 30, obstacle.y);
        ctx.lineTo(obstacle.x + 40, obstacle.y + 20);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(obstacle.x + 15, obstacle.y + 5, 20, 15);

        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(obstacle.x + 15, obstacle.y + obstacle.height - 10, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(obstacle.x + 35, obstacle.y + obstacle.height - 10, 12, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawPauseScreen() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 60px Orbitron';
        ctx.fillStyle = '#f15bb5';
        ctx.textAlign = 'center';
        ctx.fillText('ПАУЗА', canvas.width / 2, canvas.height / 2);
    }

    function spawnObstacle() {
        const lanes = [200, 350, 500];
        const lane = lanes[Math.floor(Math.random() * lanes.length)];
        obstacles.push({
            x: lane,
            y: -80,
            width: 50,
            height: 80,
            color: Math.random() > 0.5 ? '#3498db' : '#9b59b6'
        });
    }

    function updateObstacles() {
        obstacleSpawnTimer++;
        if (obstacleSpawnTimer >= obstacleSpawnInterval) {
            spawnObstacle();
            obstacleSpawnTimer = 0;
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].y += gameSpeed;
            if (obstacles[i].y > canvas.height) {
                obstacles.splice(i, 1);
                score += 10;
                updateStats();
            }
        }
    }

    function checkCollisions() {
        for (let obstacle of obstacles) {
            if (
                player.x < obstacle.x + obstacle.width &&
                player.x + player.width > obstacle.x &&
                player.y < obstacle.y + obstacle.height &&
                player.y + player.height > obstacle.y
            ) {
                return true;
            }
        }
        return false;
    }

    function updatePlayer() {
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            player.x = Math.max(150, player.x - player.speed);
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            player.x = Math.min(canvas.width - player.width - 150, player.x + player.speed);
        }
    }

    function updateStats() {
        document.getElementById('score').textContent = score;
        document.getElementById('speed').textContent = speed;
    }

    function gameLoop() {
        if (!gameRunning) {
            if (gamePaused) drawPauseScreen();
            return;
        }

        if (gamePaused) {
            drawPauseScreen();
            return;
        }

        const currentTime = Date.now();
        if (currentTime - lastSpeedIncreaseTime >= SPEED_INCREASE_INTERVAL) {
            gameSpeed = Math.min(8, gameSpeed + 0.5);
            obstacleSpawnInterval = Math.max(60, obstacleSpawnInterval - 5);
            speed = Math.floor((gameSpeed - 1) * 2) + 1;
            updateStats();
            lastSpeedIncreaseTime = currentTime;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRoad();
        updatePlayer();
        updateObstacles();
        drawPlayer();
        obstacles.forEach(drawObstacle);

        if (checkCollisions()) {
            endGame();
            return;
        }

        requestAnimationFrame(gameLoop);
    }

    function startGame() {
        gameRunning = true;
        gamePaused = false;
        score = 0;
        speed = 1;
        gameSpeed = 2;
        obstacles = [];
        obstacleSpawnTimer = 0;
        obstacleSpawnInterval = 120;
        player.x = canvas.width / 2 - 25;
        lastSpeedIncreaseTime = Date.now();

        document.getElementById('gameOver').classList.remove('show');
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'inline-block';
        document.getElementById('pauseBtn').textContent = '⏸️ Пауза';
        updateStats();
        gameLoop();
    }

    function endGame() {
        gameRunning = false;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('raceHighScore', highScore);
            document.getElementById('highScore').textContent = highScore;
        }
        document.getElementById('finalScore').textContent = score;
        document.getElementById('finalHighScore').textContent = highScore;
        document.getElementById('gameOver').classList.add('show');
        document.getElementById('startBtn').style.display = 'inline-block';
        document.getElementById('pauseBtn').style.display = 'none';
    }

    function togglePause() {
        if (!gameRunning) return;
        gamePaused = !gamePaused;
        document.getElementById('pauseBtn').textContent = gamePaused ? '▶️ Продолжить' : '⏸️ Пауза';
        if (!gamePaused) gameLoop();
    }

    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === ' ') {
            e.preventDefault();
            if (gameRunning) togglePause();
            else startGame();
        }
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    window.addEventListener('keydown', (e) => {
        if (['ArrowLeft', 'ArrowRight', ' ', 'A', 'D', 'a', 'd'].includes(e.key)) {
            e.preventDefault();
        }
    });

    drawRoad();
    drawPlayer();