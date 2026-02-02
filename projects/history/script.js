function createSnow() {
      const container = document.getElementById('snowflake-container');
      const flakes = 80;
      for (let i = 0; i < flakes; i++) {
        const flake = document.createElement('div');
        flake.classList.add('snowflake');
        flake.style.left = Math.random() * 100 + 'vw';
        flake.style.width = Math.random() * 5 + 2 + 'px';
        flake.style.height = flake.style.width;
        flake.style.opacity = Math.random() * 0.6 + 0.2;
        flake.style.animation = `fall ${Math.random() * 5 + 5}s linear ${Math.random() * 3}s infinite`;
        container.appendChild(flake);
      }
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fall {
          to {
            transform: translateY(105vh) rotate(${Math.random() * 360}deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.addEventListener('DOMContentLoaded', () => {
      createSnow();

      const splash = document.getElementById('splash-screen');
      const main = document.getElementById('main');

      setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => {
          splash.style.display = 'none';
          main.classList.add('active');
        }, 800);
      }, 2000);

      const generateBtn = document.getElementById('generate-btn');
      const resetBtn = document.getElementById('reset-btn');
      const storyContainer = document.getElementById('story-container');
      const story = document.getElementById('story');

      const fields = ['name', 'adjective1', 'animal', 'adjective2', 'verb', 'food', 'number', 'color', 'noun']
        .reduce((acc, id) => ({ ...acc, [id]: document.getElementById(id) }), {});

      function generate() {
        const v = {
          name: fields.name.value.trim() || 'кибер-герой',
          adj1: fields.adjective1.value.trim() || 'невероятный',
          animal: fields.animal.value.trim() || 'голографический щенок',
          adj2: fields.adjective2.value.trim() || 'пульсирующий',
          verb: fields.verb.value.trim() || 'взламывать мечты',
          food: fields.food.value.trim() || 'цифровые пончики',
          num: fields.number.value || '7',
          color: fields.color.value || 'радужный',
          noun: fields.noun.value.trim() || 'сервер любви'
        };

        if (!fields.name.value.trim() && !fields.adjective1.value.trim() && !fields.animal.value.trim()) {
          alert('Заполни хотя бы имя, прилагательное или животное!');
          return;
        }

        story.innerHTML = `
          В <strong>${v.color}</strong> мегаполисе жил <strong>${v.name}</strong> — <strong>${v.adj1}</strong> хакер.<br>
          Однажды он нашёл <strong>${v.animal}</strong>, который был очень <strong>${v.adj2}</strong>.<br><br>
          Вместе они решили <strong>${v.verb}</strong> в <strong>${v.noun}</strong>.<br>
          По пути съели <strong>${v.num}</strong> порций <strong>${v.food}</strong>!<br><br>
          С тех пор они — легенда кибер-ночи. 💫
        `;
        storyContainer.style.display = 'block';
        storyContainer.scrollIntoView({ behavior: 'smooth' });
      }

      function reset() {
        Object.values(fields).forEach(el => el.value = '');
        storyContainer.style.display = 'none';
        fields.name.focus();
      }

      generateBtn?.addEventListener('click', generate);
      resetBtn?.addEventListener('click', reset);
      fields.noun?.addEventListener('keypress', e => e.key === 'Enter' && generate());
    });