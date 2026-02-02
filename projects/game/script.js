 // ❄️ СНЕГ
    (function() {
      const container = document.getElementById('snowflake-container');
      const snowflakesCount = 80;
      for (let i = 0; i < snowflakesCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        const size = Math.random() * 3 + 1.5;
        snowflake.style.width = `${size}px`;
        snowflake.style.height = `${size}px`;
        snowflake.style.left = `${Math.random() * 100}vw`;
        snowflake.style.opacity = Math.random() * 0.5 + 0.2;
        const fallDuration = Math.random() * 8 + 6;
        const drift = (Math.random() - 0.5) * 30;
        const delay = Math.random() * 5;
        snowflake.style.animation = `fall-${i} ${fallDuration}s linear infinite ${delay}s`;
        const style = document.createElement('style');
        style.textContent = `
          @keyframes fall-${i} {
            0% { transform: translateY(-10vh) translateX(0); opacity: ${snowflake.style.opacity}; }
            100% { transform: translateY(105vh) translateX(${drift}px); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
        container.appendChild(snowflake);
      }
    })();

    // === ПОЯВЛЕНИЕ ОСНОВНОГО КОНТЕНТА ПОСЛЕ ЗАСТАВКИ ===
    setTimeout(() => {
      const splash = document.getElementById('splash');
      splash.style.opacity = '0';
      setTimeout(() => {
        splash.style.display = 'none';
        document.getElementById('main-content').classList.add('visible');
      }, 500);
    }, 2000);

    // Счёт
    let wins = 0, losses = 0;
    const winsEl = document.getElementById('wins');
    const lossesEl = document.getElementById('losses');

    // Уровни сложности
    let currentLevel = 'easy';
    document.querySelectorAll('.btn-level').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-level').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLevel = btn.dataset.level;
      });
    });

    // Элементы игры
    const cupElements = [
      document.getElementById('cup0'),
      document.getElementById('cup1'),
      document.getElementById('cup2')
    ];
    const ballElements = [
      document.getElementById('ball0'),
      document.getElementById('ball1'),
      document.getElementById('ball2')
    ];
    const messageEl = document.getElementById('message');
    const startBtn = document.getElementById('start');
    const resetBtn = document.getElementById('reset');

    let ballPosition = null;
    let cupPositions = [0, 1, 2]; // логические слоты: 0=левый, 1=центр, 2=правый
    let gameActive = false;

    // ✅ Базовые X-координаты (относительно левого края #game)
    const BASE_X = [102, 294, 516]; // центрированные позиции

    function updateCupPositions() {
      for (let i = 0; i < 3; i++) {
        const targetSlot = cupPositions[i]; // куда должен быть перемещён стакан i
        const targetX = BASE_X[targetSlot];
        const currentX = BASE_X[i]; // откуда он изначально
        const deltaX = targetX - currentX;
        cupElements[i].style.transform = `translateX(${deltaX}px)`;
      }
    }

    function resetCups() {
      cupPositions = [0, 1, 2];
      ballPosition = null;
      cupElements.forEach(cup => {
        cup.style.zIndex = '10';
        cup.style.transform = 'translateX(0)';
        cup.style.boxShadow =
          'inset 0 -6px 12px rgba(0,0,0,0.4), ' +
          '0 8px 18px rgba(0,0,0,0.5), ' +
          '0 0 12px rgba(0, 245, 212, 0.2)';
        cup.classList.remove('highlight');
        cup.onclick = null;
      });
      ballElements.forEach(b => b.style.display = 'none');
    }

    function getDifficulty() {
      switch(currentLevel) {
        case 'easy': return { swaps: 2, showDelay: 2000, shuffleSpeed: 900 };
        case 'medium': return { swaps: 4, showDelay: 1500, shuffleSpeed: 700 };
        case 'hard': return { swaps: 6, showDelay: 800, shuffleSpeed: 500 };
        default: return { swaps: 3, showDelay: 1500, shuffleSpeed: 700 };
      }
    }

    function swapLogicalPositions(i, j) {
      [cupPositions[i], cupPositions[j]] = [cupPositions[j], cupPositions[i]];
      if (ballPosition === i) ballPosition = j;
      else if (ballPosition === j) ballPosition = i;
    }

    function swapCups(i, j, speed) {
      return new Promise(resolve => {
        cupElements[i].style.zIndex = '100';
        cupElements[j].style.zIndex = '100';
        cupElements[i].classList.add('highlight');
        cupElements[j].classList.add('highlight');

        // Небольшая задержка для визуального эффекта подъёма
        setTimeout(() => {
          swapLogicalPositions(i, j);
          updateCupPositions();

          setTimeout(() => {
            cupElements[i].classList.remove('highlight');
            cupElements[j].classList.remove('highlight');
            cupElements[i].style.zIndex = '10';
            cupElements[j].style.zIndex = '10';
            resolve();
          }, speed);
        }, 300);
      });
    }

    async function shuffleCups() {
      const { swaps, shuffleSpeed } = getDifficulty();
      messageEl.textContent = `Перемешиваем... (${swaps} раз)`;
      messageEl.style.color = 'var(--accent-2)';

      for (let s = 0; s < swaps; s++) {
        let i = Math.floor(Math.random() * 3);
        let j;
        do { j = Math.floor(Math.random() * 3); } while (j === i);
        await swapCups(i, j, shuffleSpeed);
      }
    }

    async function startGame() {
      if (gameActive) return;
      gameActive = true;
      startBtn.disabled = true;
      resetBtn.style.display = 'none';
      messageEl.textContent = "Смотри, куда кладут мяч!";
      messageEl.style.color = 'var(--accent-1)';

      resetCups();

      ballPosition = Math.floor(Math.random() * 3);
      ballElements[ballPosition].style.display = 'block';

      const { showDelay } = getDifficulty();
      setTimeout(() => {
        ballElements[ballPosition].style.display = 'none';
        shuffleCups().then(() => {
          messageEl.textContent = "Выбери стакан!";
          messageEl.style.color = 'var(--accent-1)';
          for (let i = 0; i < 3; i++) {
            cupElements[i].onclick = (() => {
              const guess = i;
              return () => playerGuess(guess);
            })();
          }
        });
      }, showDelay);
    }

    function playerGuess(guessIndex) {
      if (!gameActive) return;
      gameActive = false;
      cupElements.forEach(c => c.onclick = null);

      if (guessIndex === ballPosition) {
        wins++;
        winsEl.textContent = wins;
        messageEl.textContent = "🎉 Правильно! Мяч здесь!";
        messageEl.style.color = 'var(--accent-1)';
        cupElements[guessIndex].style.transform = `translateX(${BASE_X[guessIndex] - BASE_X[guessIndex]}px) scale(1.1)`;
        cupElements[guessIndex].style.boxShadow = '0 0 25px var(--accent-1), 0 8px 18px rgba(0,0,0,0.5)';
        ballElements[ballPosition].style.display = 'block';
      } else {
        losses++;
        lossesEl.textContent = losses;
        messageEl.textContent = "❌ Не угадал! Мяч был здесь:";
        messageEl.style.color = 'var(--accent-2)';
        ballElements[ballPosition].style.display = 'block';
        const correctIndex = cupPositions.indexOf(ballPosition); // кто сейчас на позиции мяча
        cupElements[correctIndex].style.boxShadow = '0 0 25px var(--accent-2), 0 8px 18px rgba(0,0,0,0.5)';
      }

      startBtn.disabled = false;
      resetBtn.style.display = 'inline-block';
    }

    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', () => {
      messageEl.textContent = "Выбери уровень сложности";
      messageEl.style.color = 'var(--accent-1)';
      startBtn.disabled = false;
      resetBtn.style.display = 'none';
    });

    resetCups();