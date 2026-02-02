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

    let playerWins = 0;
    let botWins = 0;

    function playGame(playerChoice) {
        const options = ['камень', 'ножницы', 'бумага'];
        const computerChoice = options[Math.floor(Math.random() * 3)];

        let message = '';
        let msgClass = '';

        if (playerChoice === computerChoice) {
            message = `🤝 Ничья! Оба выбрали ${playerChoice}!`;
            msgClass = 'draw';
        } else if (
            (playerChoice === 'камень' && computerChoice === 'ножницы') ||
            (playerChoice === 'ножницы' && computerChoice === 'бумага') ||
            (playerChoice === 'бумага' && computerChoice === 'камень')
        ) {
            message = `🎉 Победа! Ты: ${playerChoice} — Бот: ${computerChoice}`;
            msgClass = 'win';
            playerWins++;
        } else {
            message = `💔 Поражение! Ты: ${playerChoice} — Бот: ${computerChoice}`;
            msgClass = 'lose';
            botWins++;
        }

        document.getElementById('player-wins').textContent = playerWins;
        document.getElementById('bot-wins').textContent = botWins;

        document.getElementById('result').innerHTML = `<p class="message ${msgClass}">${message}</p>`;
    }

    function resetGame() {
        playerWins = 0;
        botWins = 0;
        document.getElementById('player-wins').textContent = '0';
        document.getElementById('bot-wins').textContent = '0';
        document.getElementById('result').innerHTML = '<p>Готов? Сделай ход!</p>';
    }