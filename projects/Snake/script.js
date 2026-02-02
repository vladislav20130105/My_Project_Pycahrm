(function() {
      const container = document.getElementById('snowflake-container');
      const snowflakesCount = 80;
      for (let i = 0; i < snowflakesCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        const size = Math.random() * 3 + 2;
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
     const welcomeScreen = document.getElementById('welcomeScreen');
    const startMenu = document.getElementById('startMenu');
    const gameContainer = document.getElementById('gameContainer');
    const statsDisplay = document.getElementById('statsDisplay');
    const inGameButtons = document.getElementById('inGameButtons');
    const portfolioLink = document.getElementById('portfolioLink');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('highScore');
    const gameOverEl = document.getElementById('gameOver');
    const finalScoreEl = document.getElementById('finalScore');
    const startGameBtn = document.getElementById('startGameBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    const restartInGameBtn = document.getElementById('restartInGameBtn');
    const retryBtn = document.getElementById('retryBtn');
    const closeGameOverBtn = document.getElementById('closeGameOverBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    const applySettings = document.getElementById('applySettings');
    const resetProgressBtn = document.getElementById('resetProgressBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const appleSlider = document.getElementById('appleSlider');
    const appleValue = document.getElementById('appleValue');
    const sizeSelect = document.getElementById('sizeSelect');
    const skinSelect = document.getElementById('skinSelect');
    const angelNotification = document.getElementById('angelNotification');
    const shieldNotification = document.getElementById('shieldNotification');
    const countdownOverlay = document.getElementById('countdownOverlay');
    const countdownText = document.getElementById('countdownText');

    const snakeSkins = {
      default:  { head: '#00f5d4', body: '#f15bb5', name: 'Стандартный' },
      neon:     { head: '#00f0ff', body: '#b967ff', name: 'Неоновый' },
      fire:     { head: '#ff4d4d', body: '#ff9933', name: 'Огненный' },
      forest:   { head: '#4cff4c', body: '#2ecc71', name: 'Лесной' },
      cyber:    { head: '#00ffea', body: '#0077ff', name: 'Кибер' },
      lavender: { head: '#e0bbff', body: '#c27ba0', name: 'Лавандовый' },
      ocean:    { head: '#4deeea', body: '#3366cc', name: 'Океан' },
      golden:   { head: '#ffd700', body: '#daa520', name: 'Золотой' },
      dark:     { head: '#555555', body: '#222222', name: 'Тёмный' },
      rainbow:  { head: 'rainbow', body: 'rainbow', name: 'Радужный' }
    };

    const skinUnlockScores = {
      default:  0,
      dark:     50,
      cyber:    100,
      neon:     175,
      forest:   250,
      fire:     500,
      lavender: 750,
      ocean:    1000,
      golden:   1500,
      rainbow:  2000
    };

    const settings = {
      speed: 5,
      appleCount: 1,
      size: 'medium',
      skin: 'default'
    };

    let unlockedSkins = ['default'];
    const sizeMap = {
      small: { width: 400, height: 300 },
      medium: { width: 500, height: 400 },
      large: { width: 600, height: 450 }
    };
    const speedMap = {
      1: 400, 2: 350, 3: 300, 4: 270, 5: 240,
      6: 210, 7: 180, 8: 150, 9: 120, 10: 100
    };

    let snake = [];
    let food = [];
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let highScore = 0;
    let gameRunning = false;
    let gameLoopId = null;
    let countdownInterval = null;
    let isCountingDown = false;
    let isFirstGame = true;
    let isWelcomeActive = true;
    let animationTime = 0;
    let rainbowShieldActive = false;

    function hslToHex(h, s, l) {
      h /= 360; s /= 100; l /= 100;
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    function getRainbowColor(offset = 0) {
      const hue = (animationTime * 0.5 + offset) % 360;
      return hslToHex(hue, 100, 50);
    }

    function showAngelNotification() {
      angelNotification.style.opacity = '1';
      angelNotification.style.transform = 'translateX(-50%) scale(1.05)';
      setTimeout(() => {
        angelNotification.style.opacity = '0';
        angelNotification.style.transform = 'translateX(-50%) scale(1)';
      }, 2000);
    }

    function showShieldNotification() {
      shieldNotification.style.opacity = '1';
      shieldNotification.style.transform = 'translateX(-50%) scale(1.05)';
      setTimeout(() => {
        shieldNotification.style.opacity = '0';
        shieldNotification.style.transform = 'translateX(-50%) scale(1)';
      }, 2000);
    }

    function checkSkinUnlocks(currentScore) {
      let changed = false;
      for (const [skinKey, requiredScore] of Object.entries(skinUnlockScores)) {
        if (!unlockedSkins.includes(skinKey) && currentScore >= requiredScore) {
          unlockedSkins.push(skinKey);
          changed = true;
        }
      }
      if (changed) {
        saveUnlockedSkins();
        updateSkinSelect();
      }
    }

    function saveUnlockedSkins() {
      localStorage.setItem('snakeUnlockedSkins', JSON.stringify(unlockedSkins));
    }

    function loadUnlockedSkins() {
      const saved = localStorage.getItem('snakeUnlockedSkins');
      if (saved) {
        unlockedSkins = JSON.parse(saved);
        if (!unlockedSkins.includes('default')) {
          unlockedSkins.unshift('default');
        }
      } else {
        unlockedSkins = ['default'];
      }
    }

    function updateSkinSelect() {
      skinSelect.innerHTML = '';

      // Явный порядок скинов — по возрастанию стоимости разблокировки
      const skinOrder = [
        'default',
        'dark',
        'cyber',
        'neon',
        'forest',
        'fire',
        'lavender',
        'ocean',
        'golden',
        'rainbow'
      ];

      for (const key of skinOrder) {
        const skin = snakeSkins[key];
        if (!skin) continue;

        const option = document.createElement('option');
        option.value = key;
        option.textContent = skin.name;

        if (!unlockedSkins.includes(key)) {
          option.disabled = true;
          option.classList.add('locked-option');
          option.textContent += ` (🔒 ${skinUnlockScores[key]})`;
        }

        skinSelect.appendChild(option);
      }
    }

    function closeAllModals() {
      settingsModal.style.display = 'none';
      gameOverEl.style.display = 'none';
    }

    function startCountdown() {
      if (isCountingDown || isWelcomeActive) return;
      isCountingDown = true;
      let count = 3;
      countdownText.textContent = count;
      countdownOverlay.style.display = 'flex';
      countdownInterval = setInterval(() => {
        count--;
        if (count <= 0) {
          clearInterval(countdownInterval);
          countdownOverlay.style.display = 'none';
          isCountingDown = false;
          initGame();
        } else {
          countdownText.textContent = count;
        }
      }, 1000);
    }

    function cancelCountdown() {
      if (countdownInterval) clearInterval(countdownInterval);
      isCountingDown = false;
      countdownOverlay.style.display = 'none';
    }

    function initWelcome() {
      welcomeScreen.classList.add('active');
      isWelcomeActive = true;

      setTimeout(() => {
        welcomeScreen.classList.remove('active');
        isWelcomeActive = false;

        setTimeout(() => {
          startMenu.classList.add('active');
          if (portfolioLink) portfolioLink.style.display = 'block';
          statsDisplay.style.display = 'none';
        }, 800);
      }, 3000);
    }

    function loadSettings() {
      const saved = localStorage.getItem('snakeSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        settings.speed = Math.max(1, Math.min(10, parsed.speed || 5));
        settings.appleCount = parsed.appleCount || 1;
        settings.size = parsed.size || 'medium';
        if (unlockedSkins.includes(parsed.skin)) {
          settings.skin = parsed.skin;
        } else {
          settings.skin = 'default';
        }
      }
      const savedHighScore = localStorage.getItem('snakeHighScore');
      if (savedHighScore) highScore = parseInt(savedHighScore) || 0;
      updateSettingsUI();
      updateScoreDisplay();
      const size = sizeMap[settings.size];
      canvas.width = size.width;
      canvas.height = size.height;
      drawEmptyCanvas();
    }

    function saveSettings() {
      localStorage.setItem('snakeSettings', JSON.stringify(settings));
      localStorage.setItem('snakeHighScore', highScore.toString());
    }

    function updateSettingsUI() {
      speedSlider.value = settings.speed;
      speedValue.textContent = settings.speed;
      appleSlider.value = Math.min(settings.appleCount, 10);
      appleValue.textContent = settings.appleCount;
      sizeSelect.value = settings.size;
      skinSelect.value = settings.skin;
    }

    function updateScoreDisplay() {
      scoreEl.textContent = score;
      highScoreEl.textContent = highScore;
    }

    function drawEmptyCanvas() {
      const size = sizeMap[settings.size];
      ctx.fillStyle = 'rgba(15, 15, 30, 0.7)';
      ctx.fillRect(0, 0, size.width, size.height);
      ctx.strokeStyle = 'rgba(42, 42, 69, 0.1)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < size.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size.height);
        ctx.stroke();
      }
      for (let y = 0; y < size.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size.width, y);
        ctx.stroke();
      }
    }

    function getGameSpeed() {
      return speedMap[settings.speed];
    }

    function spawnSingleFood() {
      const size = sizeMap[settings.size];
      const cols = Math.floor(size.width / 20);
      const rows = Math.floor(size.height / 20);
      let newFood, valid = false, attempts = 0;
      while (!valid && attempts < 100) {
        newFood = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
        valid = true;
        for (let segment of snake) {
          if (segment.x === newFood.x && segment.y === newFood.y) { valid = false; break; }
        }
        if (valid) {
          for (let f of food) {
            if (f.x === newFood.x && f.y === newFood.y) { valid = false; break; }
          }
        }
        attempts++;
      }
      if (!valid) return null;

      const rand = Math.random();
      if (rand < 1/500) newFood.type = 'heavenly';
      else if (rand < 1/250) newFood.type = 'rainbow';
      else if (rand < 1/50) newFood.type = 'golden';
      else newFood.type = 'normal';

      if (newFood.type === 'heavenly' && gameRunning) showAngelNotification();
      return newFood;
    }

    function spawnFood() {
      food = [];
      for (let i = 0; i < settings.appleCount; i++) {
        const apple = spawnSingleFood();
        if (apple) food.push(apple);
      }
    }

    function stopGame() {
      gameRunning = false;
      if (gameLoopId) {
        clearInterval(gameLoopId);
        gameLoopId = null;
      }
      snake = [];
      food = [];
      drawEmptyCanvas();
    }

    function initGame() {
      if (isCountingDown || isWelcomeActive) return;
      stopGame();

      startMenu.classList.remove('active');
      inGameButtons.style.display = 'flex';
      gameContainer.style.opacity = '1';
      gameContainer.style.pointerEvents = 'all';
      if (portfolioLink) portfolioLink.style.display = 'none';
      statsDisplay.style.display = 'flex';

      const size = sizeMap[settings.size];
      const cols = Math.floor(size.width / 20);
      const rows = Math.floor(size.height / 20);
      const startX = Math.floor(cols / 2);
      const startY = Math.floor(rows / 2);

      snake = [
        {x: startX, y: startY},
        {x: startX - 1, y: startY},
        {x: startX - 2, y: startY}
      ];

      direction = 'right';
      nextDirection = 'right';
      spawnFood();
      score = 0;
      updateScoreDisplay();
      gameRunning = true;
      gameOverEl.style.display = 'none';
      rainbowShieldActive = (settings.skin === 'rainbow');

      gameLoopId = setInterval(update, getGameSpeed());
      draw();
      canvas.focus();
    }

    function handleRainbowCollision() {
      if (settings.skin === 'rainbow' && rainbowShieldActive) {
        const lostPoints = Math.floor(score / 2);
        score = score - lostPoints;
        if (score > highScore) highScore = score;
        updateScoreDisplay();
        saveSettings();
        showShieldNotification();
        rainbowShieldActive = false;
        return true;
      }
      return false;
    }

    function update() {
      if (!gameRunning) return;
      direction = nextDirection;
      const head = {...snake[0]};
      switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
      }

      const size = sizeMap[settings.size];
      const cols = Math.floor(size.width / 20);
      const rows = Math.floor(size.height / 20);

      // Удар о стену → смерть без щита и уведомления
      if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
        return gameOver();
      }

      // Проверка самопересечения (начиная с индекса 1 — без головы)
      for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          if (!handleRainbowCollision()) return gameOver();
          break;
        }
      }

      snake.unshift(head);
      let applesEaten = [];
      for (let i = 0; i < food.length; i++) {
        if (head.x === food[i].x && head.y === food[i].y) {
          applesEaten.push(i);
          if (food[i].type === 'heavenly') score += 100;          //🟨🟨🟨🟨🟨🟨даёт ангельское яблоко🟨🟨🟨🟨🟨🟨
          else if (food[i].type === 'rainbow') score += 50;       //🟨🟨🟨🟨🟨🟨даёт радужное яблоко  🟨🟨🟨🟨🟨🟨
          else if (food[i].type === 'golden') score += 25;        //🟨🟨🟨🟨🟨🟨даёт золотое яблоко   🟨🟨🟨🟨🟨🟨
          else score += 10;                                       //🟨🟨🟨🟨🟨🟨даёт обычное яблоко   🟨🟨🟨🟨🟨🟨
        }
      }

      for (let i = applesEaten.length - 1; i >= 0; i--) food.splice(applesEaten[i], 1);

      if (applesEaten.length > 0) {
        if (score > highScore) highScore = score;
        updateScoreDisplay();
        saveSettings();
        checkSkinUnlocks(score);
        while (food.length < settings.appleCount) {
          const newApple = spawnSingleFood();
          if (newApple) food.push(newApple);
        }
      } else {
        snake.pop();
      }
      draw();
    }

    function draw() {
      const size = sizeMap[settings.size];
      ctx.clearRect(0, 0, size.width, size.height);
      ctx.fillStyle = 'rgba(15, 15, 30, 0.7)';
      ctx.fillRect(0, 0, size.width, size.height);
      ctx.strokeStyle = 'rgba(42, 42, 69, 0.1)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < size.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size.height);
        ctx.stroke();
      }
      for (let y = 0; y < size.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size.width, y);
        ctx.stroke();
      }

      animationTime = Date.now() / 1000;
      const skin = snakeSkins[settings.skin] || snakeSkins.default;

      snake.forEach((segment, index) => {
        let fillColor = '#f15bb5';
        if (skin.head === 'rainbow' && skin.body === 'rainbow') {
          fillColor = getRainbowColor(index * 10);
        } else {
          fillColor = index === 0 ? skin.head : skin.body;
        }
        ctx.fillStyle = fillColor;
        ctx.fillRect(segment.x * 20, segment.y * 20, 19, 19);

        if (index === 0) {
          ctx.fillStyle = '#000';
          const eyeSize = 2;
          let ex1, ey1, ex2, ey2;
          if (direction === 'right') {
            ex1 = segment.x * 20 + 14; ey1 = segment.y * 20 + 5;
            ex2 = segment.x * 20 + 14; ey2 = segment.y * 20 + 12;
          } else if (direction === 'left') {
            ex1 = segment.x * 20 + 3; ey1 = segment.y * 20 + 5;
            ex2 = segment.x * 20 + 3; ey2 = segment.y * 20 + 12;
          } else if (direction === 'up') {
            ex1 = segment.x * 20 + 5; ey1 = segment.y * 20 + 3;
            ex2 = segment.x * 20 + 12; ey2 = segment.y * 20 + 3;
          } else {
            ex1 = segment.x * 20 + 5; ey1 = segment.y * 20 + 14;
            ex2 = segment.x * 20 + 12; ey2 = segment.y * 20 + 14;
          }
          ctx.fillRect(ex1, ey1, eyeSize, eyeSize);
          ctx.fillRect(ex2, ey2, eyeSize, eyeSize);
        }
      });

      food.forEach(f => {
        const pulse = 0.95 + Math.sin(Date.now() / 300) * 0.05;
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${18 * pulse}px Arial`;

        if (f.type === 'golden') {
          ctx.shadowColor = '#FFD700';
          ctx.shadowBlur = 15;
          ctx.fillText('🍎', f.x * 20 + 10, f.y * 20 + 10);
        } else if (f.type === 'rainbow') {
          const time = Date.now() / 200;
          const r = Math.floor(127 * Math.sin(time) + 128);
          const g = Math.floor(127 * Math.sin(time + 2) + 128);
          const b = Math.floor(127 * Math.sin(time + 4) + 128);
          ctx.shadowColor = `rgb(${r},${g},${b})`;
          ctx.shadowBlur = 20;
          ctx.fillText('🍎', f.x * 20 + 10, f.y * 20 + 10);
        } else if (f.type === 'heavenly') {
          const time = Date.now() / 100;
          const c1 = Math.floor(100 * Math.sin(time) + 155);
          const c2 = Math.floor(180 * Math.sin(time + 3) + 75);
          ctx.shadowColor = `rgb(${c1},${c2},255)`;
          ctx.shadowBlur = 25;
          ctx.fillText('😇', f.x * 20 + 10, f.y * 20 + 10);
        } else {
          ctx.fillText('🍎', f.x * 20 + 10, f.y * 20 + 10);
        }
        ctx.restore();
      });
    }

    function gameOver() {
      gameRunning = false;
      if (gameLoopId) {
        clearInterval(gameLoopId);
        gameLoopId = null;
      }
      snake = [];
      food = [];
      draw();
      finalScoreEl.textContent = score;
      checkSkinUnlocks(score);
      gameOverEl.style.display = 'block';
      statsDisplay.style.display = 'none';
    }

    function changeDirection(key) {
      if (!gameRunning || isWelcomeActive) return;
      if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        if (direction !== 'down') nextDirection = 'up';
      } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        if (direction !== 'up') nextDirection = 'down';
      } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        if (direction !== 'right') nextDirection = 'left';
      } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        if (direction !== 'left') nextDirection = 'right';
      }
    }

    function closeGameOver() {
      if (isWelcomeActive) return;
      gameOverEl.style.display = 'none';
      inGameButtons.style.display = 'flex';
      statsDisplay.style.display = 'flex';
    }

    function returnToMenu() {
      if (isWelcomeActive) return;
      stopGame();
      inGameButtons.style.display = 'none';
      gameContainer.style.opacity = '0';
      gameContainer.style.pointerEvents = 'none';
      if (portfolioLink) portfolioLink.style.display = 'block';
      statsDisplay.style.display = 'none';
      setTimeout(() => {
        startMenu.classList.add('active');
      }, 500);
    }

    function fullReset() {
      if (isCountingDown || isWelcomeActive) return;
      stopGame();
      gameOverEl.style.display = 'none';
      startCountdown();
    }

    function resetAllProgress() {
      if (!confirm('Вы уверены? Это удалит рекорд, разблокированные скины и настройки!')) {
        return;
      }

      settings.speed = 5;
      settings.appleCount = 1;
      settings.size = 'medium';
      settings.skin = 'default';
      highScore = 0;
      unlockedSkins = ['default'];

      localStorage.removeItem('snakeSettings');
      localStorage.removeItem('snakeHighScore');
      localStorage.removeItem('snakeUnlockedSkins');

      updateSettingsUI();
      updateScoreDisplay();
      updateSkinSelect();

      const size = sizeMap[settings.size];
      canvas.width = size.width;
      canvas.height = size.height;
      drawEmptyCanvas();

      alert('Прогресс сброшен!');
    }

    function resetSettingsToDefault() {
      settings.speed = 5;
      settings.appleCount = 1;
      settings.size = 'medium';
      settings.skin = 'default';

      updateSettingsUI();
      saveSettings();

      const size = sizeMap[settings.size];
      canvas.width = size.width;
      canvas.height = size.height;
      drawEmptyCanvas();
    }

    // Обработчики
    startGameBtn.addEventListener('click', () => {
      if (isWelcomeActive) return;
      if (isFirstGame) {
        isFirstGame = false;
        initGame();
      } else {
        fullReset();
      }
    });

    settingsBtn.addEventListener('click', () => {
      if (isCountingDown || isWelcomeActive) return;
      settingsModal.style.display = 'block';
    });

    backToMenuBtn.addEventListener('click', returnToMenu);
    restartInGameBtn.addEventListener('click', fullReset);
    retryBtn.addEventListener('click', fullReset);
    closeGameOverBtn.addEventListener('click', closeGameOver);
    closeSettings.addEventListener('click', () => {
      if (!isWelcomeActive) settingsModal.style.display = 'none';
    });

    applySettings.addEventListener('click', () => {
      if (isWelcomeActive) return;
      settings.speed = parseInt(speedSlider.value);
      settings.appleCount = Math.min(10, parseInt(appleSlider.value));
      settings.size = sizeSelect.value;
      if (unlockedSkins.includes(skinSelect.value)) {
        settings.skin = skinSelect.value;
      }
      saveSettings();
      const size = sizeMap[settings.size];
      canvas.width = size.width;
      canvas.height = size.height;
      drawEmptyCanvas();
      settingsModal.style.display = 'none';
    });

    resetSettingsBtn.addEventListener('click', () => {
      if (confirm('Сбросить настройки до значений по умолчанию?')) {
        resetSettingsToDefault();
      }
    });

    resetProgressBtn.addEventListener('click', resetAllProgress);

    speedSlider.addEventListener('input', () => {
      if (!isWelcomeActive) {
        speedValue.textContent = speedSlider.value;
      }
    });
    appleSlider.addEventListener('input', () => {
      if (!isWelcomeActive) {
        appleValue.textContent = appleSlider.value;
      }
    });

    document.addEventListener('keydown', (e) => {
      if (isWelcomeActive) return;
      const inGame = gameContainer.style.opacity === '1' && gameContainer.style.pointerEvents !== 'none';
      if (e.key === 'Escape') {
        closeAllModals();
        if (gameOverEl.style.display === 'block') closeGameOver();
        if (isCountingDown) cancelCountdown();
      } else if (e.key === ' ' && startMenu.classList.contains('active') && !isCountingDown) {
        if (isFirstGame) {
          isFirstGame = false;
          initGame();
        } else {
          fullReset();
        }
      } else if (e.key === 'Enter') {
        if (inGame) {
          fullReset();
        }
      } else {
        changeDirection(e.key);
      }
    });

    // ЗАПУСК
    loadUnlockedSkins();
    updateSkinSelect();
    loadSettings();
    initWelcome();