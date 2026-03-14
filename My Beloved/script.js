// script.js - emotional interactive website

document.addEventListener('DOMContentLoaded', () => {
  // ========== STEP MANAGEMENT ==========
  const steps = document.querySelectorAll('.step');
  const music = document.getElementById('bgMusic');
  // attempt autoplay (will likely be blocked, but we'll play after first click)
  music.volume = 0.3;

  function showStep(stepId) {
    steps.forEach(s => s.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ========== FLOATING HEARTS (continuous) ==========
  const heartContainer = document.querySelector('.floating-hearts-container');
  function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * 100 + '%';
    heart.style.animationDuration = (Math.random() * 5 + 5) + 's';
    heart.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';
    heartContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 10000);
  }
  setInterval(createHeart, 500);

  // ========== SECTION 1: TYPING + LOADING ==========
  const line1 = document.getElementById('typingLine1');
  const line2 = document.getElementById('typingLine2');
  const line3 = document.getElementById('typingLine3');
  const line4 = document.getElementById('typingLine4');
  const loadingBar = document.getElementById('loadingBar').querySelector('span');
  const enterBtn = document.getElementById('enterBtn');

  const msg1 = "Initializing something special...";
  const msg2 = "";
  const msg3 = "This page was made for only one person.";
  const msg4 = "If you're not Abel, you probably shouldn't be here.";

  let i = 0;
  function typeLine(element, text, speed, callback) {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(() => typeLine(element, text, speed, callback), speed);
    } else if (callback) {
      i = 0;
      setTimeout(callback, 300);
    }
  }

  // sequence
  setTimeout(() => {
    typeLine(line1, msg1, 80, () => {
      // loading bar fills after first line
      loadingBar.style.width = '100%';
      setTimeout(() => {
        typeLine(line3, msg3, 70, () => {
          setTimeout(() => {
            typeLine(line4, msg4, 70, () => {
              enterBtn.style.display = 'inline-block';
            });
          }, 400);
        });
      }, 600);
    });
  }, 500);

  // enter website
  enterBtn.addEventListener('click', () => {
    // try to play music (user interaction)
    music.play().catch(() => {}); // ignore autoplay block
    showStep('step2');
    // start typing personal message
    personalTyping();
  });

  // ========== SECTION 2 personal message typing ==========
  const personalEl = document.getElementById('personalMsg');
  const personalLines = [
    "Hey...",
    "I know this might look a little crazy.",
    "But as a web programmer...",
    "This felt like the most honest way I could express how I feel.",
    "You deserve something more than just a message.",
    "So I built this for you."
  ];
  function personalTyping() {
    personalEl.innerHTML = '';
    let lineIdx = 0;
    function writeNextLine() {
      if (lineIdx < personalLines.length) {
        const p = document.createElement('p');
        personalEl.appendChild(p);
        let charIdx = 0;
        const interval = setInterval(() => {
          if (charIdx < personalLines[lineIdx].length) {
            p.innerHTML += personalLines[lineIdx][charIdx];
            charIdx++;
          } else {
            clearInterval(interval);
            lineIdx++;
            setTimeout(writeNextLine, 400);
          }
        }, 40);
      }
    }
    writeNextLine();
  }

  document.getElementById('toStep3').addEventListener('click', () => showStep('step3'));

  // ========== SECTION 3 GALLERY LIGHTBOX ==========
  const galleryItems = document.querySelectorAll('.gallery-item img');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('img');
  galleryItems.forEach(img => {
    img.addEventListener('click', (e) => {
      lightboxImg.src = e.target.src;
      lightbox.style.display = 'flex';
    });
  });
  lightbox.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-lightbox') || e.target === lightbox)
      lightbox.style.display = 'none';
  });

  document.getElementById('toStep4').addEventListener('click', () => {
    showStep('step4');
    initGame();
  });

  // ========== SECTION 4 MINI GAME ==========
  let gameActive = false, caught = 0;
  const heartsCaughtSpan = document.getElementById('heartsCaught');
  const gameArea = document.getElementById('gameArea');
  const catcher = document.getElementById('catcher');
  const continueBtn4 = document.getElementById('toStep5');
  let gameInterval, fallInterval;

  function initGame() {
    if (gameActive) return;
    caught = 0;
    heartsCaughtSpan.innerText = '0';
    continueBtn4.disabled = true;
    continueBtn4.style.opacity = '0.5';
    gameActive = true;
    // remove old hearts
    document.querySelectorAll('.heart-fall').forEach(el => el.remove());

    // move catcher with mouse/touch
    function moveCatcher(e) {
      if (!gameActive) return;
      const rect = gameArea.getBoundingClientRect();
      let x = (e.clientX || e.touches[0].clientX) - rect.left;
      x = Math.max(20, Math.min(x, rect.width - 70));
      catcher.style.left = x + 'px';
    }
    gameArea.addEventListener('mousemove', moveCatcher);
    gameArea.addEventListener('touchmove', moveCatcher, {passive: false});

    // spawn hearts
    fallInterval = setInterval(() => {
      if (!gameActive) return;
      const heart = document.createElement('div');
      heart.classList.add('heart-fall');
      heart.innerHTML = '❤️';
      heart.style.left = Math.random() * (gameArea.clientWidth - 40) + 'px';
      heart.style.top = '0px';
      heart.dataset.speed = (Math.random() * 2 + 2).toFixed(2); // fall speed
      gameArea.appendChild(heart);
    }, 700);

    // animation loop
    function fallLoop() {
      if (!gameActive) return;
      const hearts = document.querySelectorAll('.heart-fall');
      hearts.forEach(h => {
        let top = parseFloat(h.style.top || 0);
        top += parseFloat(h.dataset.speed) * 1.5;
        h.style.top = top + 'px';
        // collision with catcher
        const catcherRect = catcher.getBoundingClientRect();
        const heartRect = h.getBoundingClientRect();
        if (catcherRect.left < heartRect.right && catcherRect.right > heartRect.left &&
            catcherRect.top < heartRect.bottom && catcherRect.bottom > heartRect.top) {
          h.remove();
          caught++;
          heartsCaughtSpan.innerText = caught;
          if (caught >= 10) {
            gameActive = false;
            clearInterval(fallInterval);
            document.querySelectorAll('.heart-fall').forEach(el => el.remove());
            continueBtn4.disabled = false;
            continueBtn4.style.opacity = '1';
            // show message
            alert("You caught my heart. 💖 I guess it's time I say the truth.");
          }
        }
        // remove if out of bounds
        if (top > gameArea.clientHeight) h.remove();
      });
      requestAnimationFrame(fallLoop);
    }
    requestAnimationFrame(fallLoop);

    // cleanup on continue
    continueBtn4.onclick = () => {
      gameActive = false;
      clearInterval(fallInterval);
      gameArea.removeEventListener('mousemove', moveCatcher);
      showStep('step5');
      typeRealMessage();
    };
  }

  // ========== SECTION 5 REAL MESSAGE TYPING ==========
  function typeRealMessage() {
    const lines = [
      "I didn't plan to like you this much.",
      "But somehow...",
      "You became part of my daily happiness.",
      "You make ordinary days feel better.",
      "And every time I talk to you...",
      "I feel something I can't ignore anymore."
    ];
    const containers = [
      document.getElementById('realMessageLine1'),
      document.getElementById('realMessageLine2'),
      document.getElementById('realMessageLine3'),
      document.getElementById('realMessageLine4'),
      document.getElementById('realMessageLine5'),
      document.getElementById('realMessageLine6')
    ];
    containers.forEach(c => c.innerHTML = '');
    let idx = 0;
    function typeLine(i, text) {
      if (i >= containers.length) return;
      let pos = 0;
      const interval = setInterval(() => {
        if (pos < text.length) {
          containers[i].innerHTML += text[pos];
          pos++;
        } else {
          clearInterval(interval);
          if (i + 1 < lines.length) setTimeout(() => typeLine(i+1, lines[i+1]), 400);
        }
      }, 45);
    }
    typeLine(0, lines[0]);
  }

  document.getElementById('toStep6').addEventListener('click', () => showStep('step6'));
  document.getElementById('toStep7').addEventListener('click', () => showStep('step7'));

  // ========== SECTION 7 YES / STILL THINKING ==========
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const finalFooter = document.getElementById('finalFooter');
  const yesMessageDiv = document.getElementById('yesMessage');

  yesBtn.addEventListener('click', () => {
    // heart explosion (confetti-like)
    for (let i=0; i<30; i++) {
      setTimeout(() => createHeart(), i*50);
    }
    // show hidden message
    yesMessageDiv.style.display = 'block';
    yesMessageDiv.innerHTML = '<h2 style="color:#b32d4a;">You just made the happiest programmer alive.</h2><p>Thank you for giving my heart a place.</p>';
    finalFooter.style.display = 'block';
    noBtn.style.display = 'none';
    yesBtn.disabled = true;
  });

  // "Still thinking" — button runs away
  noBtn.addEventListener('mouseover', (e) => {
    const x = Math.random() * (window.innerWidth - 150);
    const y = Math.random() * (window.innerHeight - 100);
    noBtn.style.position = 'fixed';
    noBtn.style.left = x + 'px';
    noBtn.style.top = y + 'px';
  });
  noBtn.addEventListener('click', () => {
    alert("take your time 🤍 but my heart is here.");
  });
});