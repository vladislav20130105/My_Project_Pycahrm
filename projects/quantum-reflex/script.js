 const state = {
      currentScore: 0,
      highScore: 0,
      level: 1,
      sequence: [],
      playerSequence: [],
      playing: false,
      playingDemo: false,
      responseTime: 300,
      adminMode: false,
    };

    const cells = document.querySelectorAll('.cell');
    const scoreEl = document.getElementById('score');
    const levelEl = document.getElementById('level');
    const highScoreEl = document.getElementById('high-score');
    const startBtn = document.getElementById('start-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsEl = document.getElementById('settings');
    const resetBtn = document.getElementById('reset-btn');
    const snowflakesEl = document.getElementById('snowflakes');
    const mainContent = document.getElementById('main-content');
    const adminPassword = "1239874432783";
    const adminPanel = document.getElementById('admin-panel');
    const adminModal = document.getElementById('admin-modal');

    function initSnow() {
      snowflakesEl.innerHTML = '';
      for (let i = 0; i < 60; i++) {
        const flake = document.createElement('div');
        const size = Math.random() * 5 + 2;
        flake.style.width = `${size}px`;
        flake.style.height = `${size}px`;
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.opacity = Math.random() * 0.5 + 0.3;
        flake.style.animationDuration = `${Math.random() * 5 + 5}s`;
        flake.style.animationDelay = `${Math.random() * 5}s`;
        snowflakesEl.appendChild(flake);
      }
    }

    function loadHighScore() {
      const saved = localStorage.getItem('quantumReflexHighScore');
      state.highScore = saved ? parseInt(saved) : 0;
      highScoreEl.textContent = state.highScore;
    }

    function updateStats() {
      scoreEl.textContent = state.currentScore;
      levelEl.textContent = state.level;
      highScoreEl.textContent = state.highScore;
      if (state.adminMode) {
        const seqEl = document.getElementById('admin-sequence');
        const displaySequence = state.sequence.map(n => n + 1);
        seqEl.textContent = `[${displaySequence.join(', ')}]`;
      }
    }

    function setCellsInteractive(interactive) {
      cells.forEach(cell => {
        cell.style.pointerEvents = interactive ? 'auto' : 'none';
        cell.style.opacity = interactive ? '1' : '0.7';
      });
    }

    function flashCell(index, isError = false) {
      const cell = cells[index];
      cell.classList.add(isError ? 'error' : 'active');
      setTimeout(() => cell.classList.remove(isError ? 'error' : 'active'), 200);
    }

    function playSequence() {
      state.playingDemo = true;
      state.playing = false;
      state.playerSequence = [];
      setCellsInteractive(false);

      let i = 0;
      const playNext = () => {
        if (i < state.sequence.length) {
          flashCell(state.sequence[i]);
          setTimeout(playNext, state.responseTime + 200);
          i++;
        } else {
          state.playingDemo = false;
          state.playing = true;
          setCellsInteractive(true);
        }
      };
      playNext();
      updateStats();
    }

    function addToSequence() {
      state.sequence.push(Math.floor(Math.random() * 6));
    }

    function checkSequence() {
      const lastIdx = state.playerSequence.length - 1;
      if (state.playerSequence[lastIdx] !== state.sequence[lastIdx]) {
        flashCell(state.playerSequence[lastIdx], true);
        endGame();
        return;
      }

      if (state.playerSequence.length === state.sequence.length) {
        state.currentScore += 10 * state.level;
        updateStats();

        setCellsInteractive(false);
        setTimeout(() => {
          state.level++;
          addToSequence();
          playSequence();
        }, 500);
      }
    }

    function endGame() {
      state.playing = false;

      if (state.currentScore > state.highScore) {
        state.highScore = state.currentScore;
        localStorage.setItem('quantumReflexHighScore', state.highScore.toString());
        highScoreEl.textContent = state.highScore;
      }

      setTimeout(() => {
        alert(`Игра окончена!\nСчёт: ${state.currentScore}\nРекорд: ${state.highScore}`);
        startBtn.textContent = "Начать игру";
      }, 800);
    }

    function resetGameForNewRound() {
      state.currentScore = 0;
      state.level = 1;
      state.sequence = [];
      state.playerSequence = [];
      state.playing = false;
      state.playingDemo = false;
      updateStats();
      cells.forEach(c => c.classList.remove('active', 'error'));
      setCellsInteractive(true);
      startBtn.textContent = "Начать игру";
    }

    function fullReset() {
      if (confirm('Сбросить весь прогресс? Это удалит рекорд!')) {
        state.highScore = 0;
        localStorage.removeItem('quantumReflexHighScore');
        resetGameForNewRound();
        highScoreEl.textContent = '0';
        alert('Прогресс полностью сброшен.');
      }
    }

    function startGame() {
      if (state.playing || state.playingDemo) return;
      resetGameForNewRound();
      addToSequence();
      playSequence();
      startBtn.textContent = "Игра идёт...";
    }

    cells.forEach(cell => {
      cell.addEventListener('click', () => {
        if (!state.playing || state.playingDemo) return;
        const idx = parseInt(cell.dataset.id);
        state.playerSequence.push(idx);
        flashCell(idx);
        checkSequence();
      });
    });

    startBtn.addEventListener('click', startGame);

    settingsBtn.addEventListener('click', () => {
      const isShown = settingsEl.classList.contains('show');
      settingsEl.classList.toggle('show', !isShown);
      settingsBtn.textContent = isShown ? 'Настройки' : 'Скрыть настройки';
    });

    resetBtn.addEventListener('click', fullReset);

    // Админка
    document.getElementById('admin-login').addEventListener('click', () => {
      const pass = document.getElementById('admin-pass').value;
      const errorEl = document.getElementById('admin-error');
      if (pass === adminPassword) {
        adminModal.style.display = 'none';
        adminPanel.style.display = 'block';
        state.adminMode = true;
        updateStats();
      } else {
        errorEl.textContent = "Неверный пароль!";
        setTimeout(() => errorEl.textContent = "", 2000);
      }
    });

    document.getElementById('admin-cancel').addEventListener('click', () => {
      adminModal.style.display = 'none';
      document.getElementById('admin-pass').value = '';
    });

    document.getElementById('admin-logout').addEventListener('click', () => {
      adminPanel.style.display = 'none';
      state.adminMode = false;
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Backquote' || e.key === '`' || e.key === '~' || e.key === 'ё' || e.key === 'Ё') {
        e.preventDefault();
        if (state.adminMode) {
          adminPanel.style.display = 'block';
        } else {
          adminModal.style.display = 'flex';
          document.getElementById('admin-pass').focus();
        }
      }
    });

    // Инициализация
    setTimeout(() => {
      mainContent.style.display = 'flex';
      loadHighScore();
    }, 2100);

    initSnow();