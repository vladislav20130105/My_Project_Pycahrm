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
                document.getElementById('mainCalc').classList.add('visible');
            }, 500);
        }, 2000);

        function toNumber(text) {
            if (typeof text !== 'string') return NaN;
            return parseFloat(text.replace(',', '.'));
        }

        function calculate(aText, op, bText) {
            const a = toNumber(aText);
            const b = toNumber(bText);

            if (isNaN(a) || isNaN(b)) {
                return 'Ошибка: введите числа (например: 2 или 4,5)';
            }

            if (op === '+') return a + b;
            if (op === '-') return a - b;
            if (op === '*') return a * b;
            if (op === '/') {
                if (b === 0) return 'Ошибка: деление на ноль!';
                return a / b;
            }
            return 'Неизвестная операция';
        }

        const aInput = document.getElementById('a');
        const bInput = document.getElementById('b');
        const opSelect = document.getElementById('op');
        const resultEl = document.getElementById('result');
        const goBtn = document.getElementById('go');
        const clearBtn = document.getElementById('clear');

        goBtn.addEventListener('click', function () {
            const res = calculate(aInput.value, opSelect.value, bInput.value);
            resultEl.textContent = String(res);
        });

        clearBtn.addEventListener('click', function () {
            aInput.value = '';
            bInput.value = '';
            opSelect.value = '+';
            resultEl.textContent = 'Тут появится ответ';
            aInput.focus();
        });

        [aInput, bInput, opSelect].forEach(el => {
            el.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') goBtn.click();
            });
        });