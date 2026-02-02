(function() {
        const container = document.getElementById('snowflake-container');
        const snowflakesCount = 100;

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
     // Скрытие заставки через 2 секунды
    setTimeout(() => {
        const splash = document.getElementById('splash');
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            document.getElementById('mainGame').classList.add('visible');
        }, 500);
    }, 2000);

    let secretNumber = Math.floor(Math.random() * 100) + 1;
    let attemptsLeft = 10;
    let gameOver = false;

    const guessInput = document.getElementById('guess-input');
    const submitBtn = document.getElementById('submit-btn');
    const resetBtn = document.getElementById('reset-btn');
    const attemptsEl = document.getElementById('attempts');
    const feedbackEl = document.getElementById('feedback');

    function updateAttempts() {
        attemptsEl.textContent = attemptsLeft;
    }

    function showMessage(text, className = '') {
        feedbackEl.textContent = text;
        feedbackEl.className = 'feedback';
        if (className) feedbackEl.classList.add(className);
    }

    function checkGuess() {
        if (gameOver) return;

        const value = guessInput.value.trim();
        const num = Number(value);

        if (!value || isNaN(num) || num < 1 || num > 100) {
            showMessage('Пожалуйста, введи целое число от 1 до 100.');
            guessInput.value = '';
            guessInput.focus();
            return;
        }

        attemptsLeft--;

        if (num === secretNumber) {
            showMessage('🎉 ПОЗДРАВЛЯЮ! Ты угадал число!', 'win');
            gameOver = true;
        } else if (attemptsLeft === 0) {
            showMessage(`💔 Попытки закончились! Загаданное число было: ${secretNumber}`, 'lose');
            gameOver = true;
        } else if (num < secretNumber) {
            showMessage(`Загаданное число **больше**, чем ${num}. Попробуй ещё!`, 'hint');
        } else {
            showMessage(`Загаданное число **меньше**, чем ${num}. Попробуй ещё!`, 'hint');
        }

        updateAttempts();
        guessInput.value = '';
        guessInput.focus();
    }

    submitBtn.addEventListener('click', checkGuess);

    guessInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            checkGuess();
        }
    });

    resetBtn.addEventListener('click', () => {
        secretNumber = Math.floor(Math.random() * 100) + 1;
        attemptsLeft = 10;
        gameOver = false;
        updateAttempts();
        showMessage('Сделай первую попытку!');
        guessInput.value = '';
        guessInput.focus();
    });

    // Инициализация — отложим фокус, чтобы не мешал заставке
    setTimeout(() => {
        if (!gameOver) guessInput.focus();
    }, 2100);