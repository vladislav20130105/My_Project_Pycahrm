(function() {
  const container = document.getElementById('snowflake-container');
  const snowflakesCount = 120;
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

document.addEventListener('DOMContentLoaded', function() {
  // Ждём загрузки шрифта Orbitron
  if ('fonts' in document) {
    document.fonts.ready.then(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) {
        setTimeout(function() {
          splash.style.opacity = '0';
          setTimeout(() => {
            if (splash.parentNode) splash.parentNode.removeChild(splash);
          }, 500);
        }, 2000);
      }
    });
  } else {
    // Резервный вариант: если FontFaceSet не поддерживается
    const splash = document.getElementById('splash-screen');
    if (splash) {
      setTimeout(function() {
        splash.style.opacity = '0';
        setTimeout(() => {
          if (splash.parentNode) splash.parentNode.removeChild(splash);
        }, 500);
      }, 2000);
    }
  }

  // ✅ Логика слайдера теперь внутри DOMContentLoaded
  const slider = document.querySelector('.portfolio-slider');
  const prevBtn = document.querySelector('.slider-nav.prev');
  const nextBtn = document.querySelector('.slider-nav.next');

  function updateSlideWidth() {
    const slide = document.querySelector('.portfolio-slide');
    if (slide) {
      window.slideWidth = slide.offsetWidth + 30;
    }
  }

  if (slider && prevBtn && nextBtn) {
    updateSlideWidth();
    window.addEventListener('resize', updateSlideWidth);

    prevBtn.addEventListener('click', () => {
      slider.scrollBy({ left: -window.slideWidth, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      slider.scrollBy({ left: window.slideWidth, behavior: 'smooth' });
    });
  }
});