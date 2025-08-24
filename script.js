/*
  מִשְׂחַק סַיְמוֹן בְּעִבְרִית, מוּתָאַם לִילָדִים בְּגִילָּאֵי 4–5.
  תכונות:
  - לוּחַ עָגוֹל עִם אַרְבָּעָה רְבָעִים: יָרֹק, אָדֹם, כָּּחֹל, צָהֹב
  - רָמָה אַחַת בִּלְבַד (בְּלִי קָשִׁיּוּת)
  - צְלִילֵי צְבָעִים בְּעִבְרִית
  - תְּמִיכָה בְּמַגָּע וְהוֹדָעוֹת מַצָּב
*/

(function () {
  const boardEl = document.getElementById('board');
  const startBtn = document.getElementById('startBtn');
  const levelEl = document.getElementById('level');
  const messageEl = document.getElementById('message');
  const scoreEl = document.getElementById('scoreValue');
  const progressFill = document.getElementById('progressBarFill');
  const progressEl = document.getElementById('progressBar');
  const progressNote = document.querySelector('.progress-note');
  // כפתוֹרי קָשִׁיּוּת הוּסְרוּ, וְכַן גַּם כַּפְתּוֹר הַשְׁמָעָה חוֹזֶרֶת

  /** מיפוי צבע -> קובץ שמע (באנקודינג UTF-8, שמות הקבצים בעברית) */
  const audioFiles = {
    green: 'assets/יָרֹק.mp3',
    red: 'assets/אָדֹם.mp3',
    blue: 'assets/כָּחֹל.mp3',
    yellow: 'assets/צָהֹב.mp3',
  };

  /** מְהִירוּת הַשְׁמָעָה לְרָמָה אַחַת */
  const speed = { on: 620, off: 260, between: 220 };
  let sequence = [];
  let userIndex = 0;
  let isShowing = false;
  let canInput = false;
  let audioCache = new Map();
  let tapCtx = null; // Web Audio para clic del usuario
  // Reutilizaremos el mismo AudioContext para otros FX (derrota)
  let score = 0;

  function setMessage(text, colorName) {
    messageEl.textContent = text || '';
    messageEl.style.color = colorName || 'var(--yellow)';
  }

  function preloadAudio() {
    for (const [color, path] of Object.entries(audioFiles)) {
      const a = new Audio();
      a.src = path;
      a.preload = 'auto';
      audioCache.set(color, a);
    }
  }

  function playColor(color, withSound = true) {
    const btn = boardEl.querySelector(`.quad.${color}`);
    if (!btn) return;
    btn.classList.add('lit', color);
    if (withSound) {
      const audio = audioCache.get(color);
      if (audio) {
        try {
          // Clone for overlapping plays so rapid sequences don't cut off
          const clone = audio.cloneNode();
          clone.currentTime = 0;
          clone.play().catch(() => {});
        } catch {}
      }
    }
  }

  function stopColor(color) {
    const btn = boardEl.querySelector(`.quad.${color}`);
    if (!btn) return;
    btn.classList.remove('lit');
  }

  // סוֹנָר קָצָר לְנְגִיעַת מִשְׁתַּמֵּשׁ (Web Audio)
  function beepTap(color) {
    try {
      if (!tapCtx) tapCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = tapCtx;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
      // Frecuencia por color (agradable y diferenciable)
      const freq = { green: 659, red: 523, blue: 784, yellow: 440 }[color] || 600;
  o.type = 'square';
      o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.015);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.20);
      o.connect(g).connect(ctx.destination);
      o.start();
  o.stop(ctx.currentTime + 0.22);
    } catch {}
  }

  // אפקט "הפסד" קצר: גל מסור יורד בתדירות עם כיבוי מהיר (sin archivos externos)
  function playFailSfx() {
    try {
      if (!tapCtx) tapCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = tapCtx;
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.9, now);
  master.connect(ctx.destination);

  // tono 1
  const o1 = ctx.createOscillator();
  const g1 = ctx.createGain();
  o1.type = 'square';
  o1.frequency.setValueAtTime(520, now);
  o1.frequency.exponentialRampToValueAtTime(240, now + 0.26);
  g1.gain.setValueAtTime(0.0001, now);
  g1.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
  o1.connect(g1).connect(master);
  o1.start(now);
  o1.stop(now + 0.28);

  // pequeño descanso
  const d = 0.04;

  // tono 2
  const o2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  o2.type = 'square';
  o2.frequency.setValueAtTime(420, now + 0.28 + d);
  o2.frequency.exponentialRampToValueAtTime(180, now + 0.28 + d + 0.28);
  g2.gain.setValueAtTime(0.0001, now + 0.28 + d);
  g2.gain.exponentialRampToValueAtTime(0.28, now + 0.28 + d + 0.02);
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.28 + d + 0.29);
  o2.connect(g2).connect(master);
  o2.start(now + 0.28 + d);
  o2.stop(now + 0.58 + d);
    } catch {}
  }

  function randomColor() {
    return ['green', 'red', 'blue', 'yellow'][Math.floor(Math.random() * 4)];
  }

  async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function showSequence() {
    isShowing = true;
    canInput = false;
    setMessage('שִׂימוּ לֵב לָרֶצֶף…', '#ffd54f');

    for (let i = 0; i < sequence.length; i++) {
      const color = sequence[i];
      playColor(color);
      await sleep(speed.on);
      stopColor(color);
      await sleep(i === sequence.length - 1 ? speed.off : speed.between);
    }

    isShowing = false;
    canInput = true;
    userIndex = 0;
  setMessage('הַתּוֹר שֶׁלָּכֶם! חִזְרוּ עַל הָרֶצֶף', '#9cc2ff');
  }

  function updateLevel(n) { levelEl.textContent = String(n); }
  function updateScore(n) {
    if (scoreEl) scoreEl.textContent = String(n);
    if (progressFill) {
      const max = 70;
      const clamped = Math.max(0, Math.min(max, n));
      const percent = (clamped / max) * 100;
      progressFill.style.width = `${percent}%`;
      progressEl?.setAttribute('aria-valuenow', String(clamped));
      if (progressNote) progressNote.textContent = `${clamped} / ${max}`;
    }
  }

  async function startGame() {
    if (isShowing) return; // ignore while demoing
    sequence = [randomColor()];
    updateLevel(1);
  score = 0;
  updateScore(score);
    setMessage('בְּהַצְלָחָה!', '#5dffb1');
    await sleep(400);
    showSequence();
  }

  async function nextRound() {
    sequence.push(randomColor());
    updateLevel(sequence.length);
    // sumar puntaje por ronda
    score += 10;
    updateScore(score);
  if (score >= 70) {
      // pequeña pausa y redirección a pantalla de victoria
      await sleep(600);
      window.location.href = 'win.html';
      return;
    }
    await sleep(500);
    showSequence();
  }

  async function fail() {
    canInput = false;
    setMessage('אוֹפְּס! נַסּוּ שׁוּב מֵהַתְּחִלָּה', '#ff9a9a');
    // flash all
    const all = ['green', 'red', 'blue', 'yellow'];
  for (const c of all) playColor(c, false); // sin audio de colores
  playFailSfx();
    await sleep(500);
    for (const c of all) stopColor(c);
  }

  function handleUser(color) {
    if (!canInput || isShowing) return;
  // Feedback visual + beep corto propio, sin usar los MP3 de colores
  playColor(color, false);
  beepTap(color);
    setTimeout(() => stopColor(color), 220);

    if (color === sequence[userIndex]) {
      userIndex++;
      if (userIndex >= sequence.length) {
        canInput = false;
  setMessage('כָּל הַכָּבוֹד! מִתְקַדְּמִים…', '#5dffb1');
        nextRound();
      }
    } else {
      fail();
    }
  }

  // אירועי ממשק
  startBtn.addEventListener('click', startGame);


  // קלט מגע/עכבר על הלוח
  boardEl.addEventListener('pointerdown', (e) => {
    const target = e.target.closest('.quad');
    if (!target) return;
    const color = target.dataset.color;
    handleUser(color);
  });

  // מניעת גלילה/בחירה מיותרת בעת משחק במובייל
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('touchmove', e => {
    if (isShowing || canInput) {
      e.preventDefault();
    }
  }, { passive: false });

  // הכנת אודיו לאחר אינטראקציה ראשונה (מדיניות הפעלה אוטומטית)
  function unlockAudioOnce() {
    preloadAudio();
    window.removeEventListener('pointerdown', unlockAudioOnce);
    window.removeEventListener('keydown', unlockAudioOnce);
  }
  window.addEventListener('pointerdown', unlockAudioOnce, { once: true });
  window.addEventListener('keydown', unlockAudioOnce, { once: true });

  // טִיפּ קָטָן לַשַּׂחְקָן
  setMessage('לַחֲצוּ "הַתְחֵל" כְּדֵי לְהַתְחִיל', '#ffe899');
})();
