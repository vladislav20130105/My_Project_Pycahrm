 (function() {
      const container = document.getElementById('snowflake-container');
      const snowflakesCount = 100;

      for (let i = 0; i < snowflakesCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');

        const size = Math.random() * 3 + 2;
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.left = `${Math.random() * window.innerWidth}px`;
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
      document.addEventListener('DOMContentLoaded', () => {
      const splash = document.getElementById('splash-screen');
      const gameContainer = document.getElementById('gameContainer');

      setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => {
          splash.style.display = 'none';
          gameContainer.style.display = 'block';
        }, 500);
      }, 2000);
    });

    // === ИГРА ===
    const ALL_COLORS = {
      red: '#ff4d4d', crimson: '#dc143c', coral: '#ff6b6b', tomato: '#ff6347',
      orange: '#ff8c42', darkorange: '#ff8c00', gold: '#ffd700', yellow: '#ffea00',
      lemon: '#e3ff00', lime: '#bfff00', greenyellow: '#adff2f', green: '#00f5d4',
      springgreen: '#00ff7f', mint: '#4dffec', cyan: '#4da0ff', deepskyblue: '#00bfff',
      blue: '#2a70ff', royalblue: '#4169e1', indigo: '#7d2c77', darkviolet: '#9400d3',
      purple: '#f15bb5', orchid: '#da70d6', magenta: '#ff00ff', hotpink: '#ff69b4'
    };

    const COLOR_NAMES = {
      red: 'Красный', crimson: 'Малиновый', coral: 'Коралл', tomato: 'Томат',
      orange: 'Оранжевый', darkorange: 'Тёмный оранж', gold: 'Золотой', yellow: 'Жёлтый',
      lemon: 'Лимон', lime: 'Лайм', greenyellow: 'Зелёно-жёлтый', green: 'Зелёный',
      springgreen: 'Весенний', mint: 'Мятный', cyan: 'Голубой', deepskyblue: 'Небесный',
      blue: 'Синий', royalblue: 'Королевский', indigo: 'Индиго', darkviolet: 'Тёмная фиолетовая',
      purple: 'Фиолетовый', orchid: 'Орхидея', magenta: 'Пурпурный', hotpink: 'Хот-пинк'
    };

    const COLOR_SETS = {
      6: ['red', 'orange', 'green', 'cyan', 'blue', 'purple'],
      12: ['red', 'crimson', 'orange', 'gold', 'green', 'springgreen', 'cyan', 'blue', 'royalblue', 'indigo', 'purple', 'hotpink'],
      24: Object.keys(ALL_COLORS)
    };

    let currentColorSet = [];
    let targetColor = '';
    let attempts = 0;

    const modeScreen = document.getElementById('modeScreen');
    const gameScreen = document.getElementById('gameScreen');
    const colorDisplay = document.getElementById('colorDisplay');
    const hintEl = document.getElementById('hint');
    const guessButtons = document.getElementById('guessButtons');
    const restartBtn = document.getElementById('restartBtn');
    const backButton = document.getElementById('backButton');

    function updateBackButtonVisibility() {
      if (modeScreen.style.display !== 'none') {
        backButton.classList.remove('hidden');
      } else {
        backButton.classList.add('hidden');
      }
    }

    function darkenColor(hex, percent) {
      let R = parseInt(hex.substring(1, 3), 16);
      let G = parseInt(hex.substring(3, 5), 16);
      let B = parseInt(hex.substring(5, 7), 16);
      R = Math.max(0, Math.floor(R * (100 - percent) / 100));
      G = Math.max(0, Math.floor(G * (100 - percent) / 100));
      B = Math.max(0, Math.floor(B * (100 - percent) / 100));
      return `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;
    }

    function renderColorButtons() {
      guessButtons.innerHTML = '';
      currentColorSet.forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'guess-btn';
        btn.dataset.color = key;
        btn.textContent = COLOR_NAMES[key];
        btn.style.background = `linear-gradient(135deg, ${ALL_COLORS[key]}, ${darkenColor(ALL_COLORS[key], 25)})`;
        guessButtons.appendChild(btn);
      });
    }

    function getRandomColorFromSet() {
      return currentColorSet[Math.floor(Math.random() * currentColorSet.length)];
    }

    function hexToRgb(hex) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    }

    function getColorDistance(guess, target) {
      const g = hexToRgb(ALL_COLORS[guess]);
      const t = hexToRgb(ALL_COLORS[target]);
      return Math.sqrt(Math.pow(g.r - t.r, 2) + Math.pow(g.g - t.g, 2) + Math.pow(g.b - t.b, 2));
    }

    function handleGuess(guess) {
      const buttons = document.querySelectorAll('.guess-btn');
      buttons.forEach(btn => btn.disabled = true);
      attempts++;

      if (guess === targetColor) {
        colorDisplay.style.background = ALL_COLORS[targetColor];
        colorDisplay.style.border = '2px solid white';
        hintEl.textContent = `✅ Победа! Ты угадал с ${attempts} попытки!`;
        hintEl.style.color = '#00f5d4';
      } else {
        const dist = getColorDistance(guess, targetColor);
        const maxDist = 441.6;
        const warmth = 100 - (dist / maxDist) * 100;

        let message, color;
        if (warmth > 80) {
          message = '🔥 ОГОНЬ! Почти угадал!';
          color = '#ff4d4d';
        } else if (warmth > 65) {
          message = '🌡️ Очень тепло!';
          color = '#ff8c42';
        } else if (warmth > 45) {
          message = '💨 Тёплый...';
          color = '#ffd700';
        } else if (warmth > 25) {
          message = '🌬️ Прохладно';
          color = '#4dffec';
        } else {
          message = '❄️ Очень холодно';
          color = '#4da0ff';
        }

        hintEl.textContent = message;
        hintEl.style.color = color;

        setTimeout(() => {
          buttons.forEach(btn => btn.disabled = false);
        }, 500);
      }
    }

    function resetGame() {
      targetColor = getRandomColorFromSet();
      attempts = 0;
      colorDisplay.style.background = '#1a1a25';
      colorDisplay.style.border = '2px dashed var(--text-muted)';
      hintEl.textContent = 'Загадан один из цветов ниже. Попробуй угадать!';
      hintEl.style.color = 'var(--accent-1)';

      const buttons = document.querySelectorAll('.guess-btn');
      buttons.forEach(btn => btn.disabled = false);
    }

    function startGame(colorCount) {
      currentColorSet = [...COLOR_SETS[colorCount]];
      modeScreen.style.display = 'none';
      gameScreen.style.display = 'block';
      renderColorButtons();
      resetGame();
      updateBackButtonVisibility(); // скрыть кнопку
    }

    document.getElementById('modeButtons').addEventListener('click', (e) => {
      if (e.target.classList.contains('mode-btn')) {
        const count = e.target.dataset.count;
        startGame(parseInt(count));
      }
    });

    guessButtons.addEventListener('click', (e) => {
      if (e.target.classList.contains('guess-btn') && !e.target.disabled) {
        handleGuess(e.target.dataset.color);
      }
    });

    restartBtn.addEventListener('click', () => {
      gameScreen.style.display = 'none';
      modeScreen.style.display = 'block';
      updateBackButtonVisibility(); // показать кнопку
    });

    // Изначально кнопка видна
    updateBackButtonVisibility();