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

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = true;
    let scores = {
        player: 0,
        computer: 0,
        draw: 0
    };

    function loadScores() {
        const savedScores = localStorage.getItem('ticTacToeScores');
        if (savedScores) {
            scores = JSON.parse(savedScores);
        }
        updateScoreDisplay();
    }

    function saveScores() {
        localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
    }

    function updateScoreDisplay() {
        document.getElementById('playerScore').textContent = scores.player;
        document.getElementById('computerScore').textContent = scores.computer;
        document.getElementById('drawScore').textContent = scores.draw;
    }

    function makeMove(index) {
        if (board[index] !== '' || !gameActive) return;

        board[index] = currentPlayer;
        updateBoard();

        if (checkWinner()) {
            gameActive = false;
            if (currentPlayer === 'X') {
                scores.player++;
                showWinner('🎉 Поздравляем! Вы выиграли!');
            } else {
                scores.computer++;
                showWinner('😔 Компьютер выиграл!');
            }
            saveScores();
            updateScoreDisplay();
        } else if (board.every(cell => cell !== '')) {
            gameActive = false;
            scores.draw++;
            showWinner('🤝 Ничья!');
            saveScores();
            updateScoreDisplay();
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateCurrentPlayer();

            if (currentPlayer === 'O') {
                setTimeout(computerMove, 500);
            }
        }
    }

    function computerMove() {
        if (!gameActive) return;

        let move = getBestMove();
        if (move === -1) {
            const emptyCells = board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
            move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }

        makeMove(move);
    }

    function getBestMove() {
        // Попытка выиграть
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                if (checkWinner()) {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }

        // Блокировка игрока
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                if (checkWinner()) {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }

        // Центр
        if (board[4] === '') return 4;

        // Углы
        const corners = [0, 2, 6, 8];
        for (let corner of corners) {
            if (board[corner] === '') return corner;
        }

        // Любая пустая клетка
        const emptyCells = board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
        return emptyCells[0] || -1;
    }

    function updateBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
            cell.className = `cell ${board[index].toLowerCase()}`;
            cell.disabled = board[index] !== '' || !gameActive;
        });
    }

    function updateCurrentPlayer() {
        const playerElement = document.getElementById('currentPlayer');
        if (currentPlayer === 'X') {
            playerElement.innerHTML = 'Ваш ход: <span class="x">X</span>';
        } else {
            playerElement.innerHTML = 'Ход компьютера: <span class="o">O</span>';
        }
    }

    function checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let pattern of winPatterns) {
            if (board[pattern[0]] && board[pattern[0]] === board[pattern[1]] && board[pattern[0]] === board[pattern[2]]) {
                return true;
            }
        }
        return false;
    }

    function showWinner(message) {
        const winnerMessage = document.getElementById('winnerMessage');
        winnerMessage.textContent = message;
        winnerMessage.style.display = 'block';

        if (message.includes('Поздравляем')) {
            winnerMessage.className = 'winner-message win';
        } else if (message.includes('Ничья')) {
            winnerMessage.className = 'winner-message draw';
        } else {
            winnerMessage.className = 'winner-message';
        }
    }

    function newGame() {
        board = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        gameActive = true;
        updateBoard();
        updateCurrentPlayer();
        document.getElementById('winnerMessage').style.display = 'none';
    }

    function resetScores() {
        scores = { player: 0, computer: 0, draw: 0 };
        updateScoreDisplay();
        localStorage.removeItem('ticTacToeScores');
        newGame();
    }

    // Загрузка и инициализация
    loadScores();
    newGame();