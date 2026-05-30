// --- Dynamic Weather System ---
let weatherParticles = [];
let weatherType = 'clear';
let weatherIntensity = 0;
let weatherTransitionTimer = 0;
let prevWeatherType = 'clear';
let weatherOverridden = false;

function initWeather() {
  if (weatherOverridden) return;
  weatherParticles = [];
  const safeWave = Math.max(1, Number.isFinite(wave) ? wave : 1);
  const biome = (safeWave - 1) % 8;
  const weatherMap = { 0:'clear', 1:'rain', 2:'fog', 3:'dust', 4:'sparks', 5:'snow', 6:'ash', 7:'ion' };
  weatherType = weatherMap[biome] || 'clear';
  if (weatherType !== prevWeatherType && prevWeatherType !== 'clear') { weatherTransitionTimer = 90; }
  prevWeatherType = weatherType;
  weatherIntensity = 0.18 + safeWave * 0.012;
  const count = weatherType === 'clear' ? 0 : (weatherType === 'fog' ? 60 : weatherType === 'dust' ? 80 : weatherType === 'ash' ? 70 : weatherType === 'snow' ? 50 : weatherType === 'ion' ? 40 : 40);
  for (let i = 0; i < count; i++) {
    weatherParticles.push({
      x: rng() * W, y: rng() * H,
      vx: weatherType === 'dust' ? (rng() - 0.5) * 2.5 : weatherType === 'ash' ? (rng() - 0.5) * 1.8 : weatherType === 'snow' ? (rng() - 0.5) * 0.8 : weatherType === 'ion' ? (rng() - 0.5) * 0.15 : (rng() - 0.5) * 0.4,
      vy: weatherType === 'rain' ? 4 + rng() * 3 : weatherType === 'snow' ? 1.5 + rng() * 1.5 : weatherType === 'ash' ? 2 + rng() * 2 : weatherType === 'ion' ? (rng() - 0.5) * 0.6 : (weatherType === 'dust' ? (rng() - 0.5) * 2 : (rng() - 0.5) * 0.3),
      life: rng() * 180, maxLife: 180 + rng() * 120,
      size: weatherType === 'rain' ? 0.8 + rng() : weatherType === 'fog' ? 30 + rng() * 50 : weatherType === 'snow' ? 2 + rng() * 3 : weatherType === 'ash' ? 2 + rng() * 4 : weatherType === 'ion' ? 40 + rng() * 70 : (weatherType === 'dust' ? 1.5 + rng() * 2 : 1 + rng()),
      alpha: weatherType === 'fog' ? 0.015 + rng() * 0.03 : weatherType === 'snow' ? 0.25 + rng() * 0.35 : weatherType === 'ash' ? 0.15 + rng() * 0.25 : weatherType === 'ion' ? 0.03 + rng() * 0.05 : (weatherType === 'dust' ? 0.12 + rng() * 0.18 : 0.2 + rng() * 0.3),
    });
  }
}

function updateWeather() {
  if (weatherType === 'clear') return;
  for (const p of weatherParticles) {
    p.x += p.vx; p.y += p.vy; p.life--;
    if (p.life <= 0) { p.x = rng() * W; p.y = weatherType === 'rain' ? -20 : rng() * H; p.life = p.maxLife; }
    if (p.y > H + 40) { p.y = -20; p.x = rng() * W; }
    if (p.x < -40) p.x = W + 40;
    if (p.x > W + 40) p.x = -40;
  }
}

function drawWeather(ctx) {
  if (weatherType === 'clear') return;
  ctx.save();
  for (const p of weatherParticles) {
    const fadeIn = Math.min(1, (p.maxLife - p.life) / 30);
    const fadeOut = Math.min(1, p.life / 30);
    const alpha = p.alpha * fadeIn * fadeOut * weatherIntensity;
    if (weatherType === 'rain') {
      ctx.strokeStyle = 'rgba(140,200,255,' + alpha.toFixed(2) + ')'; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 3, p.y - 12); ctx.stroke();
    } else if (weatherType === 'fog') {
      const fogGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      fogGrad.addColorStop(0, 'rgba(180,200,220,' + alpha.toFixed(3) + ')');
      fogGrad.addColorStop(0.5, 'rgba(160,180,200,' + (alpha * 0.5).toFixed(3) + ')');
      fogGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fogGrad; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    } else if (weatherType === 'dust') {
      ctx.fillStyle = 'rgba(180,150,100,' + alpha.toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    } else if (weatherType === 'sparks') {
      ctx.fillStyle = 'rgba(200,180,100,' + alpha.toFixed(2) + ')';
      ctx.shadowColor = '#fa0'; ctx.shadowBlur = 4;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    } else if (weatherType === 'snow') {
      ctx.fillStyle = 'rgba(220,235,255,' + alpha.toFixed(2) + ')';
      ctx.shadowColor = '#cce'; ctx.shadowBlur = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    } else if (weatherType === 'ash') {
      ctx.fillStyle = 'rgba(140,120,100,' + alpha.toFixed(2) + ')';
      ctx.shadowColor = '#421'; ctx.shadowBlur = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      if (p.size > 4) {
        ctx.fillStyle = 'rgba(255,140,30,' + (alpha * 0.3).toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(p.x + 1, p.y + 1, p.size * 0.5, 0, Math.PI * 2); ctx.fill();
      }
    } else if (weatherType === 'ion') {
      const ionGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      ionGrad.addColorStop(0, 'rgba(100,200,255,' + alpha.toFixed(3) + ')');
      ionGrad.addColorStop(0.4, 'rgba(150,100,255,' + (alpha * 0.6).toFixed(3) + ')');
      ionGrad.addColorStop(0.75, 'rgba(50,200,200,' + (alpha * 0.3).toFixed(3) + ')');
      ionGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ionGrad;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size, p.size * 0.3, p.x * 0.003 + Date.now() * 0.0002, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

function drawWeatherOverlay(ctx) {
  const hasTransition = weatherTransitionTimer > 0;
  if (weatherType === 'clear' && !hasTransition) { weatherTransitionTimer = Math.max(0, weatherTransitionTimer - 1); return; }
  const t = Date.now() / 1000;
  ctx.save();
  if (weatherType === 'rain') {
    ctx.fillStyle = 'rgba(30,60,100,' + (0.06 * weatherIntensity).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
  } else if (weatherType === 'fog') {
    const fogAlpha = 0.08 * weatherIntensity;
    const fogGrad = ctx.createLinearGradient(0, 0, 0, H);
    fogGrad.addColorStop(0, 'rgba(140,160,180,' + (fogAlpha*0.3).toFixed(3) + ')');
    fogGrad.addColorStop(0.4, 'rgba(120,140,160,' + fogAlpha.toFixed(3) + ')');
    fogGrad.addColorStop(1, 'rgba(80,100,120,' + (fogAlpha*1.5).toFixed(3) + ')');
    ctx.fillStyle = fogGrad; ctx.fillRect(0, 0, W, H);
  } else if (weatherType === 'dust') {
    ctx.fillStyle = 'rgba(180,140,90,' + (0.07 * weatherIntensity).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
  } else if (weatherType === 'sparks') {
    ctx.fillStyle = 'rgba(200,170,80,' + (0.04 * weatherIntensity).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
  } else if (weatherType === 'snow') {
    ctx.fillStyle = 'rgba(200,220,240,' + (0.04 * weatherIntensity).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
  } else if (weatherType === 'ash') {
    const ashAlpha = 0.07 * weatherIntensity;
    const ashGrad = ctx.createLinearGradient(0, 0, 0, H);
    ashGrad.addColorStop(0, 'rgba(100,40,10,' + ashAlpha.toFixed(3) + ')');
    ashGrad.addColorStop(0.6, 'rgba(80,30,5,' + (ashAlpha*0.6).toFixed(3) + ')');
    ashGrad.addColorStop(1, 'rgba(40,15,0,' + ashAlpha.toFixed(3) + ')');
    ctx.fillStyle = ashGrad; ctx.fillRect(0, 0, W, H);
  } else if (weatherType === 'ion') {
    const ionAlpha = 0.05 * weatherIntensity;
    const ionGrad = ctx.createLinearGradient(0, 0, W, H);
    ionGrad.addColorStop(0, 'rgba(40,80,160,' + ionAlpha.toFixed(3) + ')');
    ionGrad.addColorStop(0.5, 'rgba(20,40,120,' + (ionAlpha*0.5).toFixed(3) + ')');
    ionGrad.addColorStop(1, 'rgba(10,20,60,' + ionAlpha.toFixed(3) + ')');
    ctx.fillStyle = ionGrad; ctx.fillRect(0, 0, W, H);
  }
  if (weatherTransitionTimer > 0) {
    const transAlpha = (weatherTransitionTimer / 90) * 0.35;
    ctx.fillStyle = 'rgba(244,152,0,' + transAlpha.toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
    weatherTransitionTimer--;
  }
  ctx.restore();
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const W = 1680;
const H = 1080;
canvas.width = W;
canvas.height = H;

// --- Game State ---
let score = 0;
let lives = 3;
let level = 1;
let gameRunning = true;
let gameOverFlag = false;
let isPaused = false;
let currentDifficulty = 'normal';
let currentRunMode = 'clear';
let selectedRunMode = 'clear';
let wave = 1;
let waveEnemiesRemaining = 0;
let waveEnemiesToSpawn = 0;
let waveEnemiesTotal = 0;
let wavePause = 0;
let waveNotificationTimer = 0;
let comboCount = 0;
let comboTimer = 0;
const COMBO_TIMEOUT = 120; // 2 seconds at 60fps
let runXp = 0;
let xpToNext = 100;
let modifierChoiceMode = 'level';
let runBossesSeen = new Set();
let lastBossName = null;
let difficultyCleared = false;
let activeRunId = 0;
let pendingEndGameTimer = null;

// --- Screen Shake ---
let shakeIntensity = 0;
let shakeDuration = 0;
function triggerShake(intensity, duration) {
  if (intensity > shakeIntensity) shakeIntensity = intensity;
  shakeDuration = Math.max(shakeDuration, duration);
}

// --- Audio System ---
let audioCtx = null;
let musicSys = null;
let audioNodes = {}; // category gain nodes
let audioSfxLast = {};
let audioUnlockPromise = null;
let audioPrimed = false;

function initAudio() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  if (audioCtx) {
    if (audioCtx.state === 'suspended' && !audioUnlockPromise) {
      audioUnlockPromise = audioCtx.resume().finally(() => { audioUnlockPromise = null; }).catch(() => {});
    }
    return audioCtx;
  }
  audioCtx = new AudioCtor();
  if (audioCtx.state === 'suspended' && !audioUnlockPromise) {
    audioUnlockPromise = audioCtx.resume().finally(() => { audioUnlockPromise = null; }).catch(() => {});
  }
  // Master gain
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.3;
  masterGain.connect(audioCtx.destination);
  // Category gains (mix hierarchy from game-audio skill)
  const sfxGain = audioCtx.createGain(); sfxGain.gain.value = 0.7; sfxGain.connect(masterGain);
  const uiGain = audioCtx.createGain(); uiGain.gain.value = 1.0; uiGain.connect(masterGain);
  const musicGain = audioCtx.createGain(); musicGain.gain.value = 0.15; musicGain.connect(masterGain);
  audioNodes = { masterGain, sfxGain, uiGain, musicGain };
  return audioCtx;
}

function primeAudioGraph() {
  if (!audioCtx || audioPrimed || !audioNodes.masterGain) return;
  try {
    const buffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate || 44100);
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.connect(audioNodes.masterGain);
    src.start(0);
    audioPrimed = true;
  } catch (err) {}
}

function runAudioWhenReady(callback) {
  const ctx = initAudio();
  if (!ctx) return;
  primeAudioGraph();
  if (ctx.state === 'running') {
    callback();
    return;
  }
  const resumePromise = ctx.resume ? ctx.resume() : null;
  if (resumePromise && resumePromise.then) {
    resumePromise.then(() => {
      if (ctx.state === 'running') callback();
    }).catch(() => {});
  }
}

function canPlaySfx(key, cooldown = 0.05) {
  if (!audioCtx || audioCtx.state !== 'running') return false;
  const now = audioCtx.currentTime;
  if (audioSfxLast[key] && now - audioSfxLast[key] < cooldown) return false;
  audioSfxLast[key] = now;
  return true;
}

function playTone(freq, duration, type, gainNode, vol=0.3, rampDown=true, delay=0, endFreq=null) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime + Math.max(0, delay || 0);
  const dur = Math.max(0.01, duration || 0.01);
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(1, freq), now);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + dur);
  g.gain.setValueAtTime(Math.max(0.001, vol), now);
  if (rampDown) g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  else g.gain.setValueAtTime(Math.max(0.001, vol), now + dur);
  osc.connect(g);
  g.connect(gainNode || audioNodes.sfxGain);
  osc.start(now);
  osc.stop(now + dur + 0.05);
}

function playNoise(duration, vol, gainNode) {
  playFilteredNoise(duration, vol, gainNode, 'lowpass', 800, 0.7);
}

function playFilteredNoise(duration, vol, gainNode, filterType='lowpass', frequency=800, q=0.7, delay=0) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime + Math.max(0, delay || 0);
  const bufferSize = Math.floor(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + duration);
  const filter = audioCtx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.setValueAtTime(Math.max(10, frequency), now);
  filter.Q.value = q;
  src.connect(filter);
  filter.connect(g);
  g.connect(gainNode || audioNodes.sfxGain);
  src.start(now);
}

function playChord(freqs, duration, type, gainNode, vol=0.05, stagger=0) {
  if (!audioCtx) return;
  freqs.forEach((freq, i) => playTone(freq, duration, type, gainNode, vol, true, i * stagger));
}

function playSweep(startFreq, endFreq, duration, type, gainNode, vol=0.08, delay=0) {
  playTone(startFreq, duration, type, gainNode, vol, true, delay, endFreq);
}

// Sound effects
function sfxShoot(tankType) {
  if (!audioCtx) return;
  switch (tankType) {
    case 'spread':
      playTone(660, 0.06, 'square', audioNodes.sfxGain, 0.09);
      playTone(980, 0.05, 'triangle', audioNodes.sfxGain, 0.06);
      break;
    case 'focus':
      playTone(1180, 0.045, 'sawtooth', audioNodes.sfxGain, 0.075);
      playTone(1720, 0.035, 'square', audioNodes.sfxGain, 0.045);
      break;
    case 'wide':
      playTone(420, 0.075, 'triangle', audioNodes.sfxGain, 0.08);
      playTone(760, 0.065, 'sine', audioNodes.sfxGain, 0.055);
      break;
    case 'burst':
      playNoise(0.055, 0.07, audioNodes.sfxGain);
      playTone(180, 0.08, 'square', audioNodes.sfxGain, 0.085);
      break;
    case 'sniper':
      playTone(1560, 0.045, 'square', audioNodes.sfxGain, 0.09);
      playTone(520, 0.07, 'triangle', audioNodes.sfxGain, 0.04);
      break;
    case 'homing':
      playTone(740, 0.06, 'sine', audioNodes.sfxGain, 0.07);
      playTone(1080, 0.055, 'triangle', audioNodes.sfxGain, 0.055);
      break;
    case 'border':
      playTone(540, 0.07, 'sine', audioNodes.sfxGain, 0.065);
      playTone(1320, 0.06, 'triangle', audioNodes.sfxGain, 0.055);
      playTone(1880, 0.035, 'sine', audioNodes.sfxGain, 0.032);
      break;
    case 'blade':
      playTone(920, 0.045, 'triangle', audioNodes.sfxGain, 0.07);
      playTone(1480, 0.038, 'sine', audioNodes.sfxGain, 0.052);
      break;
    case 'scarlet':
      playTone(260, 0.065, 'sawtooth', audioNodes.sfxGain, 0.085);
      playTone(780, 0.05, 'square', audioNodes.sfxGain, 0.055);
      break;
    case 'astral':
      playTone(480, 0.06, 'sine', audioNodes.sfxGain, 0.058);
      playTone(960, 0.06, 'triangle', audioNodes.sfxGain, 0.05);
      playTone(1440, 0.04, 'sine', audioNodes.sfxGain, 0.034);
      break;
    default:
      playTone(800, 0.08, 'square', audioNodes.sfxGain, 0.12);
      playTone(1200, 0.05, 'square', audioNodes.sfxGain, 0.08);
  }
}

function sfxExplosion(small=false) {
  if (!audioCtx) return;
  const v = small ? 0.15 : 0.3;
  playNoise(small ? 0.2 : 0.45, v, audioNodes.sfxGain);
  playTone(60, small ? 0.15 : 0.35, 'sine', audioNodes.sfxGain, v * 0.8);
  playTone(40, small ? 0.1 : 0.25, 'triangle', audioNodes.sfxGain, v * 0.5);
}

function sfxPowerUp() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  [400, 600, 900].forEach((f, i) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, now + i * 0.06);
    g.gain.setValueAtTime(0.15, now + i * 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.12);
    osc.connect(g); g.connect(audioNodes.sfxGain);
    osc.start(now + i * 0.06);
    osc.stop(now + i * 0.06 + 0.15);
  });
}

function sfxPowerUpRare() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  [300, 500, 800, 1200].forEach((f, i) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, now + i * 0.05);
    g.gain.setValueAtTime(0.18, now + i * 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.15);
    osc.connect(g); g.connect(audioNodes.sfxGain);
    osc.start(now + i * 0.05);
    osc.stop(now + i * 0.05 + 0.18);
  });
}

function sfxEnemyHit() {
  if (!audioCtx) return;
  playTone(200, 0.06, 'triangle', audioNodes.sfxGain, 0.1);
  playTone(150, 0.08, 'sine', audioNodes.sfxGain, 0.08);
}

function sfxPlayerHurt() {
  if (!audioCtx) return;
  playNoise(0.25, 0.25, audioNodes.sfxGain);
  playTone(100, 0.3, 'sawtooth', audioNodes.sfxGain, 0.2);
  playTone(60, 0.4, 'sine', audioNodes.sfxGain, 0.3);
}

function sfxReload(tankType) {
  if (!audioCtx) return;
  const profile = {
    spread: [260, 410],
    focus: [520, 860],
    wide: [220, 360],
    burst: [160, 260],
    sniper: [340, 960],
    homing: [440, 620],
    border: [300, 720, 1180],
    blade: [360, 880],
    scarlet: [180, 540],
    astral: [260, 520, 1040],
  }[tankType] || [300, 500];
  profile.forEach((freq, i) => {
    playTone(freq, 0.045 + i * 0.012, i === 0 ? 'triangle' : 'sine', audioNodes.sfxGain, 0.035);
  });
}

function sfxLevelUp() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, now + i * 0.1);
    g.gain.setValueAtTime(0.2, now + i * 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
    osc.connect(g); g.connect(audioNodes.uiGain);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.3);
  });
}

function sfxWaveClear() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  [392, 523, 659, 784].forEach((f, i) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, now + i * 0.12);
    g.gain.setValueAtTime(0.18, now + i * 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
    osc.connect(g); g.connect(audioNodes.uiGain);
    osc.start(now + i * 0.12);
    osc.stop(now + i * 0.12 + 0.35);
  });
}

function sfxCombo(level) {
  if (!audioCtx) return;
  const baseFreq = 400 + level * 30;
  playTone(baseFreq, 0.12, 'square', audioNodes.sfxGain, Math.min(0.25, 0.08 + level * 0.02));
  playTone(baseFreq * 1.5, 0.08, 'square', audioNodes.sfxGain, Math.min(0.2, 0.06 + level * 0.015));
}

function getUiSoundKind(el) {
  if (!el) return 'default';
  const cls = String(el.className || '').toLowerCase();
  const action = String(el.getAttribute?.('onclick') || '').toLowerCase();
  const text = String(el.textContent || '').toLowerCase();
  if (cls.includes('locked') || text.includes('lock')) return 'locked';
  if (action.includes('hide') || action.includes('returnhome') || action.includes('restartgame') || cls.includes('back') || cls.includes('pause-home')) return 'back';
  if (action.includes('startgame') || action.includes('quickrestart') || action.includes('startdaily') || action.includes('confirm') || action.includes('claim') || action.includes('pickmodifier') || action.includes('purchase') || action.includes('tryevolve') || action.includes('tryunlock')) return 'confirm';
  if (action.includes('switch') || action.includes('show') || cls.includes('tab') || cls.includes('achieve-link')) return 'nav';
  return 'default';
}

function sfxUIClick(kind='default') {
  if (!canPlaySfx('uiClick:' + kind, 0.055)) return;
  if (kind === 'confirm') {
    playFilteredNoise(0.036, 0.032, audioNodes.uiGain, 'highpass', 1800, 0.7);
    playTone(620, 0.045, 'triangle', audioNodes.uiGain, 0.12);
    playTone(980, 0.06, 'sine', audioNodes.uiGain, 0.09, true, 0.035);
    playTone(1480, 0.05, 'sine', audioNodes.uiGain, 0.055, true, 0.075);
  } else if (kind === 'back') {
    playSweep(620, 360, 0.08, 'triangle', audioNodes.uiGain, 0.09);
    playTone(240, 0.065, 'sine', audioNodes.uiGain, 0.052, true, 0.035);
  } else if (kind === 'locked') {
    playFilteredNoise(0.05, 0.048, audioNodes.uiGain, 'bandpass', 520, 2.0);
    playTone(180, 0.075, 'square', audioNodes.uiGain, 0.07, true, 0.01, 120);
  } else if (kind === 'nav') {
    playTone(440, 0.04, 'sine', audioNodes.uiGain, 0.085);
    playTone(660, 0.048, 'triangle', audioNodes.uiGain, 0.065, true, 0.028);
  } else {
    playTone(560, 0.04, 'sine', audioNodes.uiGain, 0.09);
    playTone(840, 0.035, 'triangle', audioNodes.uiGain, 0.062, true, 0.02);
  }
}

function sfxUIButtonTarget(el) {
  sfxUIClick(getUiSoundKind(el));
}

function sfxAchievement() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  [523, 659, 784, 1047, 1319].forEach((f, i) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, now + i * 0.07);
    g.gain.setValueAtTime(0.2, now + i * 0.07);
    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.2);
    osc.connect(g); g.connect(audioNodes.uiGain);
    osc.start(now + i * 0.07);
    osc.stop(now + i * 0.07 + 0.22);
  });
}

function sfxEnemyShoot(kind='scout') {
  if (!canPlaySfx('enemyShoot:' + kind, kind === 'runner' ? 0.07 : 0.12)) return;
  const profiles = {
    scout:     { tone:[320, 0.05, 'square', 0.035, 220], noise:[0.035, 0.028, 'bandpass', 900] },
    runner:    { tone:[620, 0.035, 'triangle', 0.03, 440], noise:[0.025, 0.018, 'highpass', 1400] },
    brute:     { tone:[150, 0.08, 'sawtooth', 0.05, 82], noise:[0.055, 0.038, 'lowpass', 520] },
    artillery: { tone:[105, 0.12, 'square', 0.055, 55], noise:[0.08, 0.045, 'lowpass', 420] },
  };
  const p = profiles[kind] || profiles.scout;
  playSweep(p.tone[0], p.tone[4], p.tone[1], p.tone[2], audioNodes.sfxGain, p.tone[3]);
  playFilteredNoise(p.noise[0], p.noise[1], audioNodes.sfxGain, p.noise[2], p.noise[3], 1.2);
}

function sfxEliteShoot(special='elite') {
  if (!canPlaySfx('eliteShoot:' + special, 0.13)) return;
  const map = {
    flame:   () => { playFilteredNoise(0.09, 0.038, audioNodes.sfxGain, 'bandpass', 760, 1.4); playSweep(340, 210, 0.08, 'sawtooth', audioNodes.sfxGain, 0.045); },
    sniper:  () => { playTone(1720, 0.035, 'square', audioNodes.sfxGain, 0.055); playSweep(980, 180, 0.08, 'triangle', audioNodes.sfxGain, 0.028); },
    laser:   () => { playSweep(2400, 620, 0.09, 'sawtooth', audioNodes.sfxGain, 0.048); playTone(1200, 0.045, 'sine', audioNodes.sfxGain, 0.03); },
    fast:    () => { playTone(760, 0.032, 'triangle', audioNodes.sfxGain, 0.038); playTone(1040, 0.028, 'sine', audioNodes.sfxGain, 0.025, true, 0.025); },
    missile: () => { playSweep(420, 960, 0.12, 'sawtooth', audioNodes.sfxGain, 0.04); playFilteredNoise(0.05, 0.025, audioNodes.sfxGain, 'highpass', 1100, 0.9); },
    warden:  () => { playChord([330, 495, 742], 0.09, 'triangle', audioNodes.sfxGain, 0.032, 0.012); },
    phase:   () => { playSweep(1180, 320, 0.11, 'sine', audioNodes.sfxGain, 0.04); playTone(1660, 0.045, 'triangle', audioNodes.sfxGain, 0.025, true, 0.02); },
  };
  (map[special] || (() => { playTone(460, 0.06, 'square', audioNodes.sfxGain, 0.04); playTone(690, 0.04, 'triangle', audioNodes.sfxGain, 0.025); }))();
}

function sfxEliteAbility(kind='ability') {
  if (!canPlaySfx('eliteAbility:' + kind, 0.45)) return;
  if (kind === 'summoner') {
    playChord([220, 330, 440], 0.16, 'triangle', audioNodes.sfxGain, 0.032, 0.04);
    playFilteredNoise(0.12, 0.028, audioNodes.sfxGain, 'bandpass', 700, 1.8);
  } else if (kind === 'mine') {
    playTone(180, 0.09, 'square', audioNodes.sfxGain, 0.032);
    playTone(360, 0.04, 'sine', audioNodes.sfxGain, 0.022, true, 0.055);
  } else if (kind === 'barrier') {
    playSweep(900, 420, 0.12, 'triangle', audioNodes.sfxGain, 0.045);
    playTone(1320, 0.05, 'sine', audioNodes.sfxGain, 0.028);
  } else if (kind === 'phase') {
    playSweep(1700, 260, 0.14, 'sine', audioNodes.sfxGain, 0.052);
    playFilteredNoise(0.07, 0.025, audioNodes.sfxGain, 'highpass', 1800, 0.6);
  } else if (kind === 'splitter') {
    playTone(260, 0.06, 'square', audioNodes.sfxGain, 0.04);
    playTone(520, 0.08, 'square', audioNodes.sfxGain, 0.027, true, 0.035);
  } else if (kind === 'stealth') {
    playSweep(820, 1200, 0.08, 'sine', audioNodes.sfxGain, 0.024);
  } else if (kind === 'regen') {
    playChord([260, 390, 520], 0.12, 'sine', audioNodes.sfxGain, 0.026, 0.035);
  } else if (kind === 'warden') {
    playChord([247, 370, 555], 0.1, 'triangle', audioNodes.sfxGain, 0.032, 0.025);
  }
}

function sfxShieldBlock(source='player') {
  if (!canPlaySfx('shieldBlock:' + source, 0.12)) return;
  playSweep(1320, 520, 0.12, 'triangle', audioNodes.sfxGain, source === 'player' ? 0.055 : 0.04);
  playTone(1760, 0.045, 'sine', audioNodes.sfxGain, 0.03);
}

function sfxArmorBlock() {
  if (!canPlaySfx('armorBlock', 0.10)) return;
  playFilteredNoise(0.045, 0.035, audioNodes.sfxGain, 'bandpass', 480, 2.2);
  playTone(150, 0.05, 'square', audioNodes.sfxGain, 0.026);
}

function sfxEnemyDestroyed(isElite=false, isBoss=false) {
  if (!canPlaySfx(isBoss ? 'bossDestroyed' : 'enemyDestroyed', isBoss ? 0.8 : 0.08)) return;
  if (isBoss) {
    playFilteredNoise(0.5, 0.12, audioNodes.sfxGain, 'lowpass', 360, 0.9);
    playChord([98, 147, 196, 294], 0.5, 'sawtooth', audioNodes.sfxGain, 0.055, 0.08);
    playSweep(1200, 160, 0.65, 'triangle', audioNodes.sfxGain, 0.08);
  } else if (isElite) {
    playTone(220, 0.09, 'square', audioNodes.sfxGain, 0.055);
    playTone(330, 0.075, 'triangle', audioNodes.sfxGain, 0.034, true, 0.035);
  } else {
    playTone(180, 0.045, 'triangle', audioNodes.sfxGain, 0.027);
  }
}

function sfxStatus(type='status') {
  if (!canPlaySfx('status:' + type, 0.18)) return;
  if (type === 'freeze') {
    playSweep(1260, 540, 0.16, 'sine', audioNodes.sfxGain, 0.04);
    playTone(1880, 0.06, 'triangle', audioNodes.sfxGain, 0.024);
  } else if (type === 'drain') {
    playSweep(240, 620, 0.12, 'sawtooth', audioNodes.sfxGain, 0.035);
    playTone(740, 0.06, 'sine', audioNodes.sfxGain, 0.023, true, 0.06);
  } else if (type === 'repair') {
    playChord([440, 660, 880], 0.12, 'sine', audioNodes.sfxGain, 0.032, 0.035);
  } else if (type === 'mine') {
    playFilteredNoise(0.18, 0.09, audioNodes.sfxGain, 'lowpass', 520, 1.1);
    playSweep(100, 45, 0.18, 'sawtooth', audioNodes.sfxGain, 0.07);
  }
}

function sfxPowerUpType(type='power', tier='basic') {
  if (!canPlaySfx('powerType:' + type, 0.08)) return;
  const rareBoost = tier === 'relic' ? 1.35 : (tier === 'advanced' ? 1.12 : 1);
  const map = {
    speed: () => playChord([360, 540, 720], 0.06, 'triangle', audioNodes.sfxGain, 0.026 * rareBoost, 0.018),
    railgun: () => playSweep(900, 2200, 0.12, 'sawtooth', audioNodes.sfxGain, 0.036 * rareBoost),
    ricochet: () => playChord([520, 780, 520], 0.08, 'square', audioNodes.sfxGain, 0.022 * rareBoost, 0.03),
    freeze: () => sfxStatus('freeze'),
    shield: () => sfxShieldBlock('pickup'),
    rapid: () => playChord([620, 780, 980], 0.07, 'square', audioNodes.sfxGain, 0.024 * rareBoost, 0.025),
    repair: () => sfxStatus('repair'),
    multishot: () => playChord([420, 520, 620, 720], 0.055, 'triangle', audioNodes.sfxGain, 0.022 * rareBoost, 0.018),
    magnet: () => playSweep(280, 860, 0.18, 'sine', audioNodes.sfxGain, 0.03 * rareBoost),
    pierce: () => playSweep(660, 1580, 0.09, 'square', audioNodes.sfxGain, 0.03 * rareBoost),
    vampire: () => sfxStatus('drain'),
    double_score: () => playChord([392, 588, 784], 0.12, 'triangle', audioNodes.sfxGain, 0.032 * rareBoost, 0.035),
    big_bullet: () => { playTone(130, 0.1, 'square', audioNodes.sfxGain, 0.038 * rareBoost); playFilteredNoise(0.05, 0.026 * rareBoost, audioNodes.sfxGain, 'lowpass', 430, 1.1); },
    goldrush: () => playChord([523, 784, 1175, 1568], 0.16, 'triangle', audioNodes.sfxGain, 0.036 * rareBoost, 0.035),
    timewarp: () => playSweep(1200, 180, 0.22, 'sine', audioNodes.sfxGain, 0.038 * rareBoost),
    invisible: () => playSweep(880, 1320, 0.16, 'sine', audioNodes.sfxGain, 0.025 * rareBoost),
    thorns: () => playChord([220, 330, 660], 0.08, 'sawtooth', audioNodes.sfxGain, 0.022 * rareBoost, 0.028),
    overdrive: () => { playFilteredNoise(0.075, 0.04 * rareBoost, audioNodes.sfxGain, 'bandpass', 840, 1.8); playSweep(320, 960, 0.12, 'sawtooth', audioNodes.sfxGain, 0.035 * rareBoost); },
    explosive: () => playFilteredNoise(0.09, 0.05 * rareBoost, audioNodes.sfxGain, 'lowpass', 620, 1.1),
  };
  (map[type] || (() => playTone(520 * rareBoost, 0.08, 'triangle', audioNodes.sfxGain, 0.026 * rareBoost)))();
}

function sfxFusion() {
  if (!canPlaySfx('fusion', 0.7)) return;
  playChord([220, 330, 495, 742], 0.32, 'triangle', audioNodes.sfxGain, 0.052, 0.045);
  playSweep(520, 1560, 0.32, 'sine', audioNodes.sfxGain, 0.04);
  playFilteredNoise(0.16, 0.04, audioNodes.sfxGain, 'bandpass', 1200, 2.4);
}

function sfxChestOpen(isBoss=false) {
  if (!canPlaySfx('chestOpen', 0.4)) return;
  playFilteredNoise(isBoss ? 0.18 : 0.11, isBoss ? 0.065 : 0.04, audioNodes.sfxGain, 'highpass', 1300, 0.8);
  playChord(isBoss ? [196, 294, 440, 659, 988] : [330, 494, 659], isBoss ? 0.28 : 0.16, 'triangle', audioNodes.sfxGain, isBoss ? 0.048 : 0.035, isBoss ? 0.045 : 0.035);
}

function sfxBulletClash(powerDelta=0) {
  if (!canPlaySfx('bulletClash', 0.045)) return;
  const heavy = Math.abs(powerDelta) > 0;
  playTone(heavy ? 980 : 760, heavy ? 0.055 : 0.04, 'square', audioNodes.sfxGain, heavy ? 0.035 : 0.025);
  playFilteredNoise(heavy ? 0.055 : 0.035, heavy ? 0.032 : 0.022, audioNodes.sfxGain, 'highpass', heavy ? 1800 : 1400, 0.7);
}

function sfxBossIntro() {
  if (!canPlaySfx('bossIntro', 1.2)) return;
  playFilteredNoise(0.45, 0.08, audioNodes.sfxGain, 'lowpass', 420, 1.0);
  playChord([82, 123, 164], 0.42, 'sawtooth', audioNodes.sfxGain, 0.055, 0.09);
  playSweep(520, 95, 0.55, 'triangle', audioNodes.sfxGain, 0.07);
}

function sfxBossPhase() {
  if (!canPlaySfx('bossPhase', 1.0)) return;
  playChord([110, 165, 247, 370], 0.38, 'sawtooth', audioNodes.sfxGain, 0.06, 0.055);
  playSweep(1800, 220, 0.52, 'square', audioNodes.sfxGain, 0.055);
  playFilteredNoise(0.25, 0.065, audioNodes.sfxGain, 'bandpass', 900, 2.0);
}

function sfxBossAttack(attack='boss', phase=0) {
  if (!canPlaySfx('bossAttack:' + attack, 0.18)) return;
  const vol = phase > 0 ? 0.055 : 0.04;
  if (attack === 'teleport' || attack === 'clone_barrage') {
    playSweep(1400, 280, 0.12, 'sine', audioNodes.sfxGain, vol);
  } else if (attack === 'mine_storm' || attack === 'turret_salvo') {
    playFilteredNoise(0.1, vol, audioNodes.sfxGain, 'lowpass', 500, 1.2);
    playTone(130, 0.1, 'square', audioNodes.sfxGain, vol);
  } else if (attack === 'black_hole' || attack === 'gravity_wave') {
    playSweep(720, 90, 0.18, 'sawtooth', audioNodes.sfxGain, vol);
  } else if (attack === 'lightning_chain' || attack === 'thunder_storm') {
    playSweep(1900, 760, 0.08, 'square', audioNodes.sfxGain, vol);
    playFilteredNoise(0.055, vol * 0.75, audioNodes.sfxGain, 'highpass', 2200, 0.8);  } else if (attack === 'scan_mark') {
    playSweep(1600, 420, 0.14, 'sine', audioNodes.sfxGain, 0.045);
    playFilteredNoise(0.08, 0.03, audioNodes.sfxGain, 'highpass', 1800, 1.2);
  } else if (attack === 'orbital_strike') {
    playSweep(2400, 110, 0.22, 'sawtooth', audioNodes.sfxGain, 0.06);
    playFilteredNoise(0.18, 0.06, audioNodes.sfxGain, 'lowpass', 400, 1.0);
    playChord([180, 270, 360], 0.18, 'sine', audioNodes.sfxGain, 0.035, 0.06);
  } else if (attack === 'salvage_swarm') {
    playFilteredNoise(0.12, 0.04, audioNodes.sfxGain, 'bandpass', 600, 1.8);
    playTone(140, 0.1, 'sawtooth', audioNodes.sfxGain, 0.045);
  } else if (attack === 'scrap_overload') {
    playFilteredNoise(0.18, 0.065, audioNodes.sfxGain, 'lowpass', 380, 1.4);
    playSweep(320, 80, 0.22, 'square', audioNodes.sfxGain, 0.055);
    playChord([160, 240, 320], 0.14, 'sawtooth', audioNodes.sfxGain, 0.035, 0.05);
  } else if (attack === 'arc_judgment') {
    playSweep(2200, 520, 0.09, 'square', audioNodes.sfxGain, 0.05);
    playFilteredNoise(0.06, 0.032, audioNodes.sfxGain, 'highpass', 2400, 0.9);
  } else if (attack === 'storm_domain') {
    playSweep(1800, 180, 0.28, 'sawtooth', audioNodes.sfxGain, 0.06);
    playFilteredNoise(0.2, 0.07, audioNodes.sfxGain, 'bandpass', 800, 1.6);
    playChord([200, 300, 500, 750], 0.22, 'sine', audioNodes.sfxGain, 0.04, 0.06);
  } else {
    playTone(180, 0.11, 'sawtooth', audioNodes.sfxGain, vol);
    playTone(360, 0.07, 'triangle', audioNodes.sfxGain, vol * 0.65);
  }
}

function sfxPauseState(paused) {
  if (!canPlaySfx(paused ? 'pauseOn' : 'pauseOff', 0.2)) return;
  if (paused) playChord([660, 440, 330], 0.08, 'triangle', audioNodes.uiGain, 0.035, 0.035);
  else playChord([330, 440, 660], 0.08, 'triangle', audioNodes.uiGain, 0.035, 0.035);
}

function sfxRunEnd(victory=false) {
  if (!canPlaySfx(victory ? 'victory' : 'defeat', 1.4)) return;
  if (victory) {
    playFilteredNoise(0.24, 0.038, audioNodes.uiGain, 'highpass', 1700, 0.6);
    playSweep(196, 392, 0.45, 'sine', audioNodes.sfxGain, 0.045);
    [392, 523, 659, 784, 1047, 1319].forEach((freq, i) => {
      playTone(freq, 0.2 + i * 0.018, i < 2 ? 'triangle' : 'sine', audioNodes.uiGain, 0.052 - i * 0.004, true, i * 0.075);
    });
    [523, 659, 784, 1047].forEach((freq, i) => {
      playTone(freq, 0.42, 'triangle', audioNodes.uiGain, 0.024, true, 0.36 + i * 0.025);
    });
    playFilteredNoise(0.16, 0.024, audioNodes.uiGain, 'bandpass', 2400, 1.4, 0.42);
  } else {
    playFilteredNoise(0.55, 0.105, audioNodes.sfxGain, 'lowpass', 280, 1.1);
    playSweep(220, 55, 0.78, 'sawtooth', audioNodes.uiGain, 0.068);
    playTone(98, 0.66, 'triangle', audioNodes.sfxGain, 0.07, true, 0.08, 49);
    [196, 147, 110, 82].forEach((freq, i) => {
      playTone(freq, 0.22, i % 2 ? 'triangle' : 'sawtooth', audioNodes.uiGain, 0.044 - i * 0.004, true, 0.12 + i * 0.12);
    });
    playFilteredNoise(0.13, 0.045, audioNodes.uiGain, 'bandpass', 620, 2.2, 0.22);
    playTone(440, 0.07, 'square', audioNodes.uiGain, 0.032, true, 0.18, 330);
    playTone(330, 0.09, 'square', audioNodes.uiGain, 0.026, true, 0.38, 220);
  }
}

let uiSfxBound = false;
function bindGlobalUiSfx() {
  if (uiSfxBound) return;
  uiSfxBound = true;
  let lastUiSfxAt = 0;
  let lastUiSfxTarget = null;
  const selector = 'button, [onclick], [role="button"], .tank-card, .mod-card, .achieve-link, .lab-tank-card, .leader-tab, .best-tab, .best-section-tab';
  const playForTarget = (target) => {
    if (!target || !target.closest) return;
    const clickable = target.closest(selector);
    if (!clickable || !document.body.contains(clickable)) return;
    const button = clickable.closest('button');
    if (button && button.disabled) return;
    runAudioWhenReady(() => {
      const now = performance.now ? performance.now() : Date.now();
      if (clickable === lastUiSfxTarget && now - lastUiSfxAt < 160) return;
      lastUiSfxAt = now;
      lastUiSfxTarget = clickable;
      sfxUIButtonTarget(clickable);
    });
  };
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    playForTarget(e.target);
  }, true);
  document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    playForTarget(e.target);
  }, true);
  document.addEventListener('touchstart', (e) => {
    playForTarget(e.target);
  }, { capture: true, passive: true });
  document.addEventListener('click', (e) => {
    playForTarget(e.target);
  }, true);
  document.addEventListener('keydown', (e) => {
    if (e.repeat || (e.key !== 'Enter' && e.key !== ' ')) return;
    const active = document.activeElement;
    if (!active || active === document.body) return;
    playForTarget(active);
  }, true);
}
bindGlobalUiSfx();

// Background music - procedural bass pulse
let musicTimeout = null;
let musicLowPass = null;
function musicTick() {
  if (!gameRunning || !audioCtx) { musicTimeout = null; return; }

  const enemiesNearby = enemies.filter(e => {
    const dx = e.x - player.x, dy = e.y - player.y;
    return Math.sqrt(dx*dx+dy*dy) < 300;
  }).length;
  // Dynamic tempo based on enemies nearby
  let tempo;
  if (enemiesNearby > 4) tempo = 180;
  else if (enemiesNearby > 2) tempo = 250;
  else if (enemiesNearby > 0) tempo = 380;
  else tempo = 650;

  // Frequency tiers
  let freq;
  if (enemiesNearby > 4) freq = 45;
  else if (enemiesNearby > 2) freq = 60;
  else if (enemiesNearby > 0) freq = 78;
  else freq = 104;

  // HP-based filter: low HP = muffled sound
  if (player.alive && player.hp / player.maxHp < 0.4) {
    if (!musicLowPass) {
      musicLowPass = audioCtx.createBiquadFilter();
      musicLowPass.type = 'lowpass';
      musicLowPass.frequency.value = 300;
      musicLowPass.connect(audioNodes.musicGain);
    }
    const hpRatio = player.hp / player.maxHp;
    musicLowPass.frequency.setValueAtTime(200 + hpRatio * 400, audioCtx.currentTime);
  } else if (musicLowPass) {
    musicLowPass.disconnect();
    musicLowPass = null;
  }

  const gainNode = musicLowPass || audioNodes.musicGain;

  // Wave intensity: more layers at higher waves
  const waveLayers = Math.min(3, Math.floor(wave / 3));
  const baseVol = 0.4;
  for (let l = 0; l <= waveLayers; l++) {
    const vol = baseVol * (1 - l * 0.25);
    const f = freq * (1 + l * 0.5);
    playTone(f, 0.12, l === 0 ? 'sine' : (l === 1 ? 'triangle' : 'sawtooth'), gainNode, vol, true);
  }

  musicTimeout = setTimeout(musicTick, tempo);
}

let audioUnlocked = false;
document.addEventListener('click', () => {
  if (audioUnlocked) return;
  audioUnlocked = true;
  ensureMusicSystem();
  if (musicSys) { musicSys.switchMode('menu'); }
}, { once: false });

function ensureMusicSystem() {
  if (musicSys) return;
  if (typeof CyberSynth === 'undefined') return;
  const actx = initAudio();
  if (!actx) return;
  musicSys = new CyberSynth(actx);
  musicSys.start();
}

function startMusic() {
  ensureMusicSystem();
  if (musicSys) { musicSys.switchMode('combat', wave); musicSys.fadeIn(0.08); }
  if (!audioCtx || musicTimeout) return;
  musicTick();
}
function startBossMusic() {
  ensureMusicSystem();
  if (musicSys) { musicSys.switchMode('boss', wave); musicSys.fadeIn(0.09); }
}

function stopMusic() {
  if (musicSys) musicSys.fadeOut();
  if (musicTimeout) { clearTimeout(musicTimeout); musicTimeout = null; }
  if (musicLowPass) { musicLowPass.disconnect(); musicLowPass = null; }
}

// --- Daily Challenge ---
function rng() { return seededRandom ? seededRandom() : Math.random(); }
function rotateTurretToward(current, target, maxSpeed) {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) < maxSpeed) return target;
  return current + Math.sign(diff) * maxSpeed;
}
// Turret rotation speeds (radians per frame)
const TURRET_SPEED_FACTION = {
  observatory: 0.16, storm_cloister: 0.10, void_cult: 0.07,
  moon_arsenal: 0.05, ash_church: 0.03, graveyard: 0.015,
};
const TURRET_SPEED_PLAYER = {
  sniper: 0.25, scarlet: 0.25, homing: 0.17, astral: 0.17,
  focus: 0.12, blade: 0.12, spread: 0.07, burst: 0.07,
  wide: 0.03, border: 0.03,
};
function getDailySeed() {
  const d = new Date();
  const dateStr = d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0');
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) { hash = ((hash << 5) - hash) + dateStr.charCodeAt(i); hash |= 0; }
  return Math.abs(hash);
}
function getDailyBestKey() { return 'tankbattle_daily_best_' + getDailySeed(); }
function getDailyCompletedKey() { return 'tankbattle_daily_done_' + getDailySeed(); }

let dailyTarget = null;
let dailyTargetAchieved = false;
let dailyCompletedToday = false;
let dailyBestScore = 0;

function loadDailyChallengeStatus() {
  try {
    dailyCompletedToday = localStorage.getItem(getDailyCompletedKey()) === '1';
    dailyBestScore = parseInt(localStorage.getItem(getDailyBestKey()) || '0', 10) || 0;
  } catch(e) {
    dailyCompletedToday = false;
    dailyBestScore = 0;
  }
}

function markDailyChallengeCompleted() {
  dailyCompletedToday = true;
  try { localStorage.setItem(getDailyCompletedKey(), '1'); } catch(e) {}
}

function saveDailyBest(scoreValue) {
  const nextBest = Math.max(dailyBestScore || 0, Math.max(0, Math.floor(scoreValue || 0)));
  if (nextBest === dailyBestScore) return;
  dailyBestScore = nextBest;
  try { localStorage.setItem(getDailyBestKey(), dailyBestScore.toString()); } catch(e) {}
}

function renderDailyTarget() {
  const targetEl = document.getElementById('daily-target');
  if (!targetEl) return;
  if (!isDailyChallenge || !dailyTarget) {
    targetEl.style.display = 'none';
    return;
  }
  const rewardText = dailyCompletedToday ? '已领取' : (dailyTarget.reward + ' MS');
  const statusText = dailyTargetAchieved ? ' · 已达成' : '';
  const bestText = dailyBestScore > 0 ? (' · 最高分 ' + dailyBestScore) : '';
  targetEl.textContent = 'DAILY 今日目标: ' + dailyTarget.desc + ' (奖励 ' + rewardText + ')' + statusText + bestText;
  targetEl.style.display = 'block';
}

function getDailyTarget(seed) {
  const targets = [
    { desc:'单局得分达到3000', check:()=>score>=3000, reward:60 },
    { desc:'单局得分达到5000', check:()=>score>=5000, reward:80 },
    { desc:'到达第5波', check:()=>wave>=5, reward:50 },
    { desc:'到达第8波', check:()=>wave>=8, reward:80 },
    { desc:'击杀任意Boss', check:()=>bossRef&&!bossRef.alive, reward:100 },
    { desc:'击杀5个精英敌人', check:()=>sessionEliteKills>=5, reward:70 },
    { desc:'收集15个道具', check:()=>sessionPowerUpsCollected>=15, reward:60 },
    { desc:'达成20连击', check:()=>maxComboReached>=20, reward:70 },
  ];
  return targets[seed % targets.length];
}
function checkDailyTarget() {
  if (!isDailyChallenge || !dailyTarget || dailyTargetAchieved) return;
  if (dailyTarget.check()) {
    dailyTargetAchieved = true;
    const toast = document.getElementById('achieve-toast');
    toast.querySelector('.achieve-icon').textContent = 'DAY';
    toast.querySelector('.achieve-name').textContent = '每日目标达成!';
    updateTankUnlockProgress({ dailyClears: 1 }, false);
    if (!dailyCompletedToday) {
      coreFragments += dailyTarget.reward;
      markDailyChallengeCompleted();
      toast.querySelector('.achieve-label').textContent = '奖励 +' + dailyTarget.reward + ' 月光石';
    } else {
      toast.querySelector('.achieve-label').textContent = '今日奖励已领取';
    }
    saveProgression();
    toast.querySelector('.achieve-name').style.color = '#fd0';
    toast.style.display = 'block'; toast.style.animation = 'none'; toast.offsetHeight;
    toast.style.animation = 'toastIn 0.4s ease-out';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.style.display = 'none'; }, 3000);
    renderDailyTarget();
    checkAchievements();
  }
}

function startDailyChallenge() {
  const seed = getDailySeed();
  loadDailyChallengeStatus();
  const dailyTargetDef = getDailyTarget(seed);
  const tanks = Object.keys(tankTypes).filter(k => unlockedTanks.has(k));
  if (tanks.length === 0) tanks.push('spread');
  const dailyTank = tanks[seed % tanks.length];
  const diffs = DIFFICULTY_ORDER.filter(d => unlockedDifficulties.has(d));
  const dailyDifficulty = diffs[Math.floor((seed % 100) / 100 * diffs.length)] || 'easy';
  startGame(dailyDifficulty, dailyTank, {
    dailyChallenge: true,
    mode: 'clear',
    seededRandom: mulberry32(seed),
    dailyTarget: dailyTargetDef,
  });
}

// --- Wave Modifier System ---
const MODIFIER_RARITIES = {
  standard: { label:'STANDARD', code:'I', className:'standard', rank:1, weight:70, color:'#8ce8ff', rgb:'140,232,255' },
  rare:     { label:'RARE',     code:'II', className:'rare',     rank:2, weight:24, color:'#9ca8ff', rgb:'156,168,255' },
  elite:    { label:'ELITE',    code:'III',className:'elite',    rank:3, weight:7.5,color:'#f49800', rgb:'244,152,0' },
  mythic:   { label:'MYTHIC',   code:'IV', className:'mythic',   rank:4, weight:1.6,color:'#f6e5aa', rgb:'246,229,170' },
};
const MODIFIER_RARITY_ORDER = ['standard','rare','elite','mythic'];
const MODIFIER_REROLLS_PER_SLOT = 2;
const MODIFIER_AXIS_LABELS = {
  damage:'弹头', cadence:'射击', survival:'生存', mobility:'机动',
  support:'补给', scoring:'清算', blast:'爆轰', economy:'月光石', miracle:'奇迹',
  intercept:'反制', boss:'猎手',
};
const MODIFIER_ARCHETYPES = {
  barrage: { label:'弹幕压制流', code:'BARRAGE', desc:'用弹匣、冷却与装填维持火线' },
  pierce: { label:'精准穿甲流', code:'PIERCE', desc:'让每一发子弹都更像宣判' },
  survival: { label:'生存圣盾流', code:'SANCTUM', desc:'以装甲和修复换取容错窗口' },
  mobility: { label:'机动游击流', code:'DRIFT', desc:'靠速度、拉扯与节奏重置战线' },
  supply: { label:'补给远征流', code:'LOGIS', desc:'把战场残骸转化为长期优势' },
  blast: { label:'爆轰清场流', code:'BLAST', desc:'用范围伤害切开拥挤战线' },
  intercept: { label:'反制拦截流', code:'AEGIS', desc:'强化弹幕对撞与防线博弈' },
  boss: { label:'Boss猎手流', code:'HUNTER', desc:'专门针对首领装甲与二阶段压力' },
  economy: { label:'月光石远征流', code:'VAULT', desc:'牺牲当下火力换取局外资源' },
  miracle: { label:'奇迹保全流', code:'MIRACLE', desc:'极低概率出现的生还协议' },
};
const MODIFIER_STACK_LIMITS = {
  damage: 8, speed: 7, firerate: 6, reload: 6, hp: 5, repair: 5,
  bullet_spd: 7, mag: 5, more_pups: 5, combo_bonus: 5, loot_double: 4,
  big_explosion: 5, intercept_matrix: 5, boss_hunter: 5, extra_life: 2, full_repair: 2,
};
const MODIFIER_BLUEPRINTS = [
  {
    family:'damage', axis:'damage', archetype:'pierce', name:'月核弹头', icon:'WAR', baseWeight:27, color:'#ff9b4a', rgb:'255,155,74',
    values:{ standard:0.10, rare:0.16, elite:0.24, mythic:0.34 },
    desc:v => '子弹攻击力 +' + Math.round(v * 100) + '%',
    tradeoff:'稳定火力增幅，不改变射击节奏',
    apply:v => { playerBulletDmgMul += v; },
  },
  {
    family:'firerate', axis:'cadence', archetype:'barrage', name:'冷却短路', icon:'CLK', baseWeight:20, color:'#f6e5aa', rgb:'246,229,170',
    values:{ standard:0.07, rare:0.11, elite:0.16, mythic:0.22 },
    desc:v => '射击冷却 -' + Math.round(v * 100) + '%',
    tradeoff:'火力更密，装填结构会承受轻微压力',
    apply:v => { playerShootDelayMul *= (1 - v); playerReloadMul *= (1 + v * 0.25); },
  },
  {
    family:'reload', axis:'cadence', archetype:'barrage', name:'弹仓圣锁', icon:'RLD', baseWeight:18, color:'#c6f6ff', rgb:'198,246,255',
    values:{ standard:0.08, rare:0.12, elite:0.18, mythic:0.25 },
    desc:v => '装填时间 -' + Math.round(v * 100) + '%',
    tradeoff:'提升持续作战手感，瞬间爆发较弱',
    apply:v => { playerReloadMul *= (1 - v); },
  },
  {
    family:'mag', axis:'cadence', archetype:'barrage', name:'扩容弹匣', icon:'MAG', baseWeight:17, color:'#d4b36a', rgb:'212,179,106',
    values:{ standard:1, rare:1, elite:2, mythic:3 },
    desc:v => '弹夹容量 +' + v,
    tradeoff:'更长压制窗口，但仍需完整换弹',
    apply:v => applyRunMagazineBonus(v),
  },
  {
    family:'hp', axis:'survival', archetype:'survival', name:'圣龛装甲', icon:'PLT', baseWeight:23, color:'#79f48d', rgb:'121,244,141',
    values:{ standard:{max:1, heal:1}, rare:{max:1, heal:2}, elite:{max:2, heal:2}, mythic:{max:2, heal:4} },
    desc:v => '最大HP +' + v.max + '，回复 ' + v.heal,
    tradeoff:'容错提升可靠，但不会直接提高杀伤',
    apply:v => {
      playerMaxHpBonus += v.max;
      if (player && player.alive) {
        player.maxHp += v.max;
        player.hp = Math.min(player.maxHp, player.hp + v.heal);
      }
    },
  },
  {
    family:'repair', axis:'survival', archetype:'survival', name:'自修圣油', icon:'REP', baseWeight:14, color:'#9ff0bf', rgb:'159,240,191',
    values:{ standard:0.035, rare:0.06, elite:0.09, mythic:0.13 },
    desc:v => '击杀后 ' + Math.round(v * 100) + '% 概率修复1HP',
    tradeoff:'偏向持久战，低血量时价值更高',
    apply:v => { playerRepairChance = Math.min(0.35, playerRepairChance + v); },
  },
  {
    family:'speed', axis:'mobility', archetype:'mobility', name:'灰域推进', icon:'DRV', baseWeight:24, color:'#8ce8ff', rgb:'140,232,255',
    values:{ standard:0.08, rare:0.12, elite:0.18, mythic:0.25 },
    desc:v => '移动速度 +' + Math.round(v * 100) + '%',
    tradeoff:'更适合走位、拉扯与主动换弹',
    apply:v => { playerSpeedMul += v; },
  },
  {
    family:'bullet_spd', axis:'damage', archetype:'pierce', name:'弹道加速环', icon:'VEL', baseWeight:20, color:'#9ca8ff', rgb:'156,168,255',
    values:{ standard:0.07, rare:0.11, elite:0.16, mythic:0.23 },
    desc:v => '子弹飞行速度 +' + Math.round(v * 100) + '%',
    tradeoff:'提高命中率，对高机动敌人更明显',
    apply:v => { bulletSpeedMul += v; },
  },
  {
    family:'more_pups', axis:'support', archetype:'supply', name:'补给坐标', icon:'SUP', baseWeight:16, color:'#f49800', rgb:'244,152,0',
    values:{ standard:0.12, rare:0.18, elite:0.27, mythic:0.38 },
    desc:v => '道具掉落 +' + Math.round(v * 100) + '%',
    tradeoff:'提高战场补给密度，成长较慢热',
    apply:v => { powerUpDropMul += v; },
  },
  {
    family:'combo_bonus', axis:'scoring', archetype:'mobility', name:'清算链路', icon:'SCO', baseWeight:13, color:'#f3a8ff', rgb:'243,168,255',
    values:{ standard:1.18, rare:1.35, elite:1.62, mythic:2.0 },
    desc:v => '连击奖励分 ×' + v.toFixed(2),
    tradeoff:'奖励高风险连续击杀，不直接提高生存',
    apply:v => { comboBonusMul *= v; },
  },
  {
    family:'loot_double', axis:'support', archetype:'supply', name:'残骸解码', icon:'REC', baseWeight:12, color:'#d59a54', rgb:'213,154,84',
    values:{ standard:0.08, rare:0.12, elite:0.18, mythic:0.26 },
    desc:v => '精英额外掉落概率 +' + Math.round(v * 100) + '%',
    tradeoff:'精英战收益更高，但需要先活下来',
    apply:v => { eliteDropMul += v; },
  },
  {
    family:'big_explosion', axis:'blast', archetype:'blast', name:'爆轰礼装', icon:'BLZ', baseWeight:11, color:'#ff6767', rgb:'255,103,103',
    values:{ standard:0.12, rare:0.18, elite:0.27, mythic:0.40 },
    desc:v => '爆炸范围 +' + Math.round(v * 100) + '%',
    tradeoff:'清群能力增强，但不覆盖全屏',
    apply:v => { explosionRadiusMul += v; },
  },
  {
    family:'intercept_matrix', axis:'intercept', archetype:'intercept', name:'拦截矩阵', icon:'AIG', baseWeight:14, color:'#7df5ff', rgb:'125,245,255',
    values:{ standard:0.35, rare:0.55, elite:0.82, mythic:1.15 },
    desc:v => '子弹对撞判定强度 +' + v.toFixed(2),
    tradeoff:'偏向防线博弈，能让强弹更容易穿过敌方火幕',
    apply:v => { runClashPowerBonus += v; },
  },
  {
    family:'boss_hunter', axis:'boss', archetype:'boss', name:'弑月猎契', icon:'BOS', baseWeight:10, color:'#ffcf6e', rgb:'255,207,110',
    values:{ standard:0.06, rare:0.10, elite:0.15, mythic:0.21 },
    desc:v => '对Boss伤害 +' + Math.round(v * 100) + '%',
    tradeoff:'专精首领战，普通波次收益较低',
    apply:v => { playerBossDamageMul += v; },
  },
];

let activeModifiers = [];
let currentModifierDraft = null;
let playerBulletDmgMul = 1, playerSpeedMul = 1, playerShootDelayMul = 1;
let playerReloadMul = 1, powerUpDropMul = 1, bulletSpeedMul = 1, comboBonusMul = 1;
let eliteDropMul = 0, explosionRadiusMul = 1, playerMagBonus = 0, playerMaxHpBonus = 0, playerRepairChance = 0;
let runClashPowerBonus = 0, playerBossDamageMul = 1;

function getModifierRarityConfig(rarity) {
  return MODIFIER_RARITIES[rarity] || MODIFIER_RARITIES.standard;
}

function getModifierArchetype(key) {
  return MODIFIER_ARCHETYPES[key] || MODIFIER_ARCHETYPES.pierce;
}

function buildScaledModifier(bp, rarityKey) {
  const rarity = getModifierRarityConfig(rarityKey);
  const value = bp.values[rarityKey];
  return {
    id: bp.family + '_' + rarityKey,
    family: bp.family,
    axis: bp.axis,
    archetype: bp.archetype || bp.axis,
    name: bp.name + ' ' + rarity.code,
    baseName: bp.name,
    desc: bp.desc(value),
    icon: bp.icon,
    rarity: rarityKey,
    rarityRank: rarity.rank,
    weight: bp.baseWeight * rarity.weight,
    color: bp.color || rarity.color,
    rgb: bp.rgb || rarity.rgb,
    tradeoff: bp.tradeoff,
    stackLimit: MODIFIER_STACK_LIMITS[bp.family] || 6,
    jackpotEligible: true,
    apply(){ bp.apply(value); },
  };
}

const SPECIAL_MODIFIER_DEFS = [
  { id:'extra_life', family:'extra_life', axis:'miracle', archetype:'miracle', name:'备用驾驶舱', desc:'+1 条命', icon:'LIF', rarity:'mythic', rarityRank:4, weight:30, minLevel:3, stackLimit:2, color:'#f6e5aa', rgb:'246,229,170', tradeoff:'极少出现的保险协议', jackpotEligible:false, apply(){ lives++; } },
  { id:'full_repair', family:'full_repair', axis:'miracle', archetype:'miracle', name:'圣堂整备令', desc:'HP完全回复，并获得短暂无敌', icon:'SAN', rarity:'mythic', rarityRank:4, weight:24, minLevel:3, stackLimit:2, color:'#fff0b8', rgb:'255,240,184', tradeoff:'救急协议，只在高压战线偶尔出现', jackpotEligible:false, apply(){ if(player){ player.hp = player.maxHp; player.invincible = Math.max(player.invincible || 0, 120); } } },
  { id:'moon_300', family:'moonstone_cache', axis:'economy', archetype:'economy', name:'月光石匣 300', desc:'立即获得300 MOONSTONE', icon:'MS3', rarity:'mythic', rarityRank:4, weight:42, minLevel:2, stackLimit:9, color:'#f49800', rgb:'244,152,0', tradeoff:'放弃战力，换取研究室资源', jackpotEligible:false, grantsMoonstone:300, apply(){ grantDraftMoonstone(300); } },
  { id:'moon_600', family:'moonstone_cache', axis:'economy', archetype:'economy', name:'月光石匣 600', desc:'立即获得600 MOONSTONE', icon:'MS6', rarity:'mythic', rarityRank:4, weight:20, minLevel:4, stackLimit:9, color:'#ffd47a', rgb:'255,212,122', tradeoff:'罕见财务异常，足够重写一段机体预算', jackpotEligible:false, grantsMoonstone:600, apply(){ grantDraftMoonstone(600); } },
  { id:'moon_900', family:'moonstone_cache', axis:'economy', archetype:'economy', name:'月光石匣 900', desc:'立即获得900 MOONSTONE', icon:'MS9', rarity:'mythic', rarityRank:4, weight:9, minLevel:6, stackLimit:9, color:'#f6e5aa', rgb:'246,229,170', tradeoff:'最高级别的资源奇迹，概率极低', jackpotEligible:false, grantsMoonstone:900, apply(){ grantDraftMoonstone(900); } },
];
const MODIFIER_DEFS = [
  ...MODIFIER_BLUEPRINTS.flatMap(bp => MODIFIER_RARITY_ORDER.map(r => buildScaledModifier(bp, r))),
  ...SPECIAL_MODIFIER_DEFS,
];

function getModifierStackCount(mod) {
  const family = typeof mod === 'string'
    ? ((MODIFIER_DEFS.find(m => m.id === mod) || {}).family || mod)
    : ((mod && (mod.family || mod.id)) || '');
  return activeModifiers.filter(m => (m.family || m.id) === family).length;
}

function getModifierRerollCost() {
  const rerolls = currentModifierDraft ? currentModifierDraft.rerollCount : 0;
  const safeLevel = Math.max(1, Number.isFinite(level) ? level : 1);
  const base = 30 + safeLevel * 5;
  const raw = base + rerolls * (22 + safeLevel * 2);
  return Math.max(20, Math.floor(raw * (1 - getGlobalRerollDiscount())));
}

function rollRunClashPowerBonus() {
  const value = Math.max(0, runClashPowerBonus || 0);
  const whole = Math.floor(value);
  return whole + (rng() < value - whole ? 1 : 0);
}

function getModifierPickWeight(m) {
  let weight = m.weight || 10;
  if (m.archetype) {
    const samePath = activeModifiers.filter(a => a && a.archetype === m.archetype).length;
    if (samePath > 0) weight *= 1 + Math.min(0.42, samePath * 0.1);
  }
  return weight;
}

function pickWeightedModifier(pool) {
  const total = pool.reduce((sum, m) => sum + getModifierPickWeight(m), 0);
  let roll = rng() * Math.max(1, total);
  for (let i = 0; i < pool.length; i++) {
    roll -= getModifierPickWeight(pool[i]);
    if (roll <= 0) return i;
  }
  return Math.max(0, pool.length - 1);
}

function isModifierAvailable(m) {
  if (!m) return false;
  if (level < (m.minLevel || 1)) return false;
  if (getModifierStackCount(m) >= (m.stackLimit || MODIFIER_STACK_LIMITS[m.family] || 6)) return false;
  if (m.rarity === 'mythic' && level < 3 && !m.grantsMoonstone) return false;
  return true;
}

function getModifierChoices(count = 4, excludeIds = [], guaranteeFoundation = true) {
  const exclude = new Set(excludeIds);
  const choices = [];
  let available = MODIFIER_DEFS.filter(m => isModifierAvailable(m) && !exclude.has(m.id));
  const foundational = available.filter(m => !m.grantsMoonstone && (m.rarity === 'standard' || m.rarity === 'rare'));
  if (guaranteeFoundation && foundational.length > 0) {
    const first = foundational[pickWeightedModifier(foundational)];
    choices.push(first);
    exclude.add(first.id);
    available = available.filter(m => m.id !== first.id);
  }
  while (choices.length < count && available.length > 0) {
    const idx = pickWeightedModifier(available);
    const picked = available.splice(idx, 1)[0];
    choices.push(picked);
    exclude.add(picked.id);
  }
  return choices;
}

function createModifierDraft(mode) {
  const choices = getModifierChoices(4);
  return {
    id: Date.now() + ':' + Math.floor(rng() * 100000),
    mode,
    choices,
    rerolled: choices.map(() => 0),
    rerollCount: 0,
    jackpotResolved: false,
  };
}

function getModifierJackpotFamily(choices) {
  if (!choices || choices.length !== 4) return null;
  const family = choices[0] && choices[0].family;
  if (!family) return null;
  const sameFamily = choices.every(m => m && m.jackpotEligible !== false && m.family === family);
  if (!sameFamily) return null;
  const limit = choices[0].stackLimit || MODIFIER_STACK_LIMITS[family] || 6;
  return getModifierStackCount(family) + choices.length <= limit ? family : null;
}

function buildModifierCard(m, index) {
  const rarity = getModifierRarityConfig(m.rarity);
  const rerollUsed = currentModifierDraft ? (currentModifierDraft.rerolled[index] || 0) : 0;
  const rerollExhausted = rerollUsed >= MODIFIER_REROLLS_PER_SLOT;
  const cost = getModifierRerollCost();
  const canAfford = coreFragments >= cost;
  const disabled = rerollExhausted || !canAfford || (currentModifierDraft && currentModifierDraft.jackpotResolved);
  const axisLabel = MODIFIER_AXIS_LABELS[m.axis] || '战术';
  const archetype = getModifierArchetype(m.archetype || m.axis);
  const rerollLabel = rerollExhausted
    ? '已用 ' + rerollUsed + '/' + MODIFIER_REROLLS_PER_SLOT
    : '刷新 ' + cost + ' MS ' + rerollUsed + '/' + MODIFIER_REROLLS_PER_SLOT;
  return `<div class="mod-card rarity-${escapeHtml(rarity.className)} ${rerollUsed > 0 ? 'reroll-used' : ''}" data-rarity="${escapeHtml(rarity.label)}" style="--mod-accent:${escapeHtml(m.color || rarity.color)};--mod-rgb:${escapeHtml(m.rgb || rarity.rgb)}" onclick="pickModifierFromDraft(${index})">
    <div class="mod-rarity-line"><span>${escapeHtml(rarity.label)}</span><span>${escapeHtml(axisLabel)}</span></div>
    <div class="mod-archetype-line"><span>${escapeHtml(archetype.label)}</span><span>${escapeHtml(archetype.code)}</span></div>
    <span class="mod-icon">${getModifierIconSvg(m.icon, m.rgb || rarity.rgb)}</span>
    <div class="mod-name">${escapeHtml(m.name)}</div>
    <div class="mod-desc">${escapeHtml(m.desc)}</div>
    <div class="mod-tradeoff">${escapeHtml(m.tradeoff || '战术协议')}</div>
    <div class="mod-actions">
      <button class="mod-reroll" onclick="rerollModifierChoice(event, ${index})" ${disabled ? 'disabled' : ''}>${escapeHtml(rerollLabel)}</button>
    </div>
  </div>`;
}

function renderModifierDraft() {
  const container = document.getElementById('modifier-screen');
  const grid = document.getElementById('modifier-choices');
  const meta = document.getElementById('modifier-meta');
  const title = container.querySelector('h2');
  if (!currentModifierDraft) return;
  const jackpotFamily = getModifierJackpotFamily(currentModifierDraft.choices);
  container.classList.toggle('jackpot-ready', !!jackpotFamily);
  if (title) title.textContent = currentModifierDraft.mode === 'level' ? '局 内 升 级 / 四 选 一 改 造' : '选 择 改 造 器';
  if (meta) {
    const cost = getModifierRerollCost();
    const used = currentModifierDraft.rerolled.reduce((sum, n) => sum + (n || 0), 0);
    const total = currentModifierDraft.rerolled.length * MODIFIER_REROLLS_PER_SLOT;
    meta.innerHTML = renderMoonstoneChip(coreFragments, 'REROLL ' + cost + ' MS / ' + used + '/' + total + ' USED')
      + `<span class="mod-rule">${jackpotFamily ? '四联同调已锁定：即将获得全部选项' : '每张卡可刷新 ' + MODIFIER_REROLLS_PER_SLOT + ' 次，费用在本次升级内温和递增'}</span>`;
  }
  grid.innerHTML = currentModifierDraft.choices.map((m, i) => buildModifierCard(m, i)).join('');
}

function showModifierChoice(mode = 'level') {
  modifierChoiceMode = mode;
  currentModifierDraft = createModifierDraft(mode);
  if (!currentModifierDraft.choices.length) return;
  const container = document.getElementById('modifier-screen');
  renderModifierDraft();
  container.style.display = 'flex';
  gameRunning = false; // pause during choice
  tryResolveModifierJackpot('draft');
}

function grantDraftMoonstone(amount) {
  coreFragments += amount;
  sessionModifierTokenClaims++;
  saveProgression();
  unlockAchievement('modifier_treasury');
}

function applyRunMagazineBonus(amount) {
  playerMagBonus += amount;
  if (!player) return;
  const baseMag = (player._tankDef && player._tankDef.magSize) || player.magSize || 6;
  const prevMag = Math.max(1, player.magSize || baseMag);
  const prevAmmoRatio = (player.ammo || 0) / prevMag;
  player.magSize = Math.max(1, baseMag + playerMagBonus);
  player.ammo = Math.max(1, Math.min(player.magSize, Math.ceil(prevAmmoRatio * player.magSize) + amount));
}

function applyModifierDef(def) {
  if (!def || typeof def.apply !== 'function') return;
  def.apply();
  recordModifierPick(def, false);
  activeModifiers.push(def);
  sessionModifierChoices++;
  if ((def.rarityRank || 0) >= 4) {
    sessionModifierMythics++;
    unlockAchievement('modifier_mythic');
  }
  if (def.grantsMoonstone) unlockAchievement('modifier_treasury');
}

function finishModifierSelection(defs, jackpot = false) {
  const picked = Array.isArray(defs) ? defs.filter(Boolean) : [defs].filter(Boolean);
  if (!picked.length) return;
  picked.forEach(applyModifierDef);
  if (jackpot && runReport) {
    const start = Math.max(0, runReport.modifierPicks.length - picked.length);
    for (let i = start; i < runReport.modifierPicks.length; i++) {
      runReport.modifierPicks[i].jackpot = true;
    }
  }
  currentModifierDraft = null;
  const screen = document.getElementById('modifier-screen');
  screen.style.display = 'none';
  screen.classList.remove('jackpot-ready');
  gameRunning = true;
  isPaused = false;
  if (modifierChoiceMode === 'wave') startNextWave();
  const main = picked[0];
  const toast = document.getElementById('achieve-toast');
  toast.querySelector('.achieve-icon').textContent = jackpot ? 'JACK' : main.icon;
  toast.querySelector('.achieve-name').textContent = jackpot ? '四联同调: 全部接收' : '改造器: ' + main.name;
  toast.querySelector('.achieve-label').textContent = jackpot ? picked.map(m => m.name).join(' / ') : main.desc;
  toast.querySelector('.achieve-name').style.color = jackpot ? '#f6e5aa' : (main.color || '#0ff');
  toast.style.display = 'block'; toast.style.animation = 'none'; toast.offsetHeight;
  toast.style.animation = 'toastIn 0.4s ease-out';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => { toast.style.display = 'none'; }, jackpot ? 3200 : 2200);
  document.getElementById('lives').textContent = lives;
  updateRunXpHud();
  checkAchievements();
}

function pickModifierFromDraft(index) {
  if (!currentModifierDraft || currentModifierDraft.jackpotResolved) return;
  const def = currentModifierDraft.choices[index];
  finishModifierSelection(def, false);
}

function pickModifier(id) {
  const def = MODIFIER_DEFS.find(m => m.id === id);
  finishModifierSelection(def, false);
}

function rerollModifierChoice(event, index) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (!currentModifierDraft || currentModifierDraft.jackpotResolved) return;
  const slotRerolls = currentModifierDraft.rerolled[index] || 0;
  if (slotRerolls >= MODIFIER_REROLLS_PER_SLOT) return;
  const cost = getModifierRerollCost();
  if (coreFragments < cost) {
    showAchievementToast('MS', '月光石不足', '刷新需要 ' + cost + ' MOONSTONE', '#ff6767');
    return;
  }
  coreFragments -= cost;
  recordRerollCost(cost);
  currentModifierDraft.rerollCount++;
  currentModifierDraft.rerolled[index] = slotRerolls + 1;
  sessionModifierRerolls++;
  if (sessionModifierRerolls >= 1) unlockAchievement('modifier_reroll');
  if (currentModifierDraft.rerolled.every(count => count > 0)) unlockAchievement('modifier_full_reroll');
  const exclude = currentModifierDraft.choices.map(m => m && m.id).filter(Boolean);
  const replacement = getModifierChoices(1, exclude, false)[0];
  if (replacement) currentModifierDraft.choices[index] = replacement;
  saveProgression();
  renderModifierDraft();
  sfxPowerUp();
  tryResolveModifierJackpot('reroll');
}

function tryResolveModifierJackpot(source) {
  if (!currentModifierDraft || currentModifierDraft.jackpotResolved) return false;
  const family = getModifierJackpotFamily(currentModifierDraft.choices);
  if (!family) return false;
  currentModifierDraft.jackpotResolved = true;
  sessionModifierJackpots++;
  unlockAchievement('modifier_jackpot');
  renderModifierDraft();
  const draftId = currentModifierDraft.id;
  setTimeout(() => {
    if (currentModifierDraft && currentModifierDraft.id === draftId) {
      finishModifierSelection(currentModifierDraft.choices, true);
    }
  }, source === 'reroll' ? 520 : 680);
  return true;
}

function resetModifiers() {
  activeModifiers = [];
  currentModifierDraft = null;
  playerBulletDmgMul = 1; playerSpeedMul = 1; playerShootDelayMul = 1;
  playerReloadMul = 1;
  powerUpDropMul = getGlobalSupplyDropMultiplier(); bulletSpeedMul = 1; comboBonusMul = 1;
  eliteDropMul = 0; explosionRadiusMul = 1; playerMagBonus = 0; playerMaxHpBonus = 0;
  playerRepairChance = getGlobalRepairChance();
  runClashPowerBonus = 0; playerBossDamageMul = 1;
}

// --- Seeded RNG (mulberry32) ---
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
let seededRandom = null;
let isDailyChallenge = false;

// --- Difficulty Settings ---
const difficultySettings = {
  easy:     { lives: 5, spawnRate: 470, enemyHpBonus: 1,  playerHp: 12, enemySpeedMul: 0.66, enemyBulletSpeedMul: 0.72, waveBudgetMul: 0.62, eliteChanceMul: 0.45, bossHpMul: 1.55, unlockScore: 0,     clearWave: 20, bossRequired: 5,  label: '简单' },
  normal:   { lives: 3, spawnRate: 410, enemyHpBonus: 2,  playerHp: 10, enemySpeedMul: 0.94, enemyBulletSpeedMul: 0.96, waveBudgetMul: 0.76, eliteChanceMul: 0.82, bossHpMul: 2.05, unlockScore: 2800,  clearWave: 28, bossRequired: 7,  label: '普通' },
  hard:     { lives: 2, spawnRate: 335, enemyHpBonus: 4,  playerHp: 8,  enemySpeedMul: 1.18, enemyBulletSpeedMul: 1.12, waveBudgetMul: 0.86, eliteChanceMul: 1.10, bossHpMul: 2.55, unlockScore: 7200,  clearWave: 36, bossRequired: 9,  label: '困难' },
  extreme:  { lives: 2, spawnRate: 280, enemyHpBonus: 6,  playerHp: 7,  enemySpeedMul: 1.42, enemyBulletSpeedMul: 1.24, waveBudgetMul: 0.94, eliteChanceMul: 1.34, bossHpMul: 3.05, unlockScore: 12800, clearWave: 44, bossRequired: 12, label: '极限' },
  nightmare:{ lives: 1, spawnRate: 235, enemyHpBonus: 8,  playerHp: 6,  enemySpeedMul: 1.62, enemyBulletSpeedMul: 1.36, waveBudgetMul: 1.02, eliteChanceMul: 1.65, bossHpMul: 3.65, unlockScore: 20500, clearWave: 56, bossRequired: 15, label: '梦魇' },
};
const DIFFICULTY_ORDER = ['easy','normal','hard','extreme','nightmare'];

// --- Tank Types ---
const tankTypes = {
  spread: { name:'扩散型', color:'#e44', turret:'#c33', speed:1.1, hpBonus:0,  shootDelay:28, magSize:7, reloadTime:105, bulletCount:3, spreadAngle:0.13, bulletSpeed:1.7, bulletDamage:1, desc:'3方向扩散弹幕', specialInterval:5, specialType:'pierce' },
  focus:  { name:'集中型', color:'#ed4', turret:'#cb3', speed:1.4, hpBonus:-2, shootDelay:20, magSize:10, reloadTime:82, bulletCount:1, spreadAngle:0,    bulletSpeed:3.3, bulletDamage:2, desc:'高速集中火力', specialInterval:4, specialType:'railgun' },
  wide:   { name:'广域型', color:'#4af', turret:'#38c', speed:0.85,hpBonus:2,  shootDelay:44, magSize:5, reloadTime:130, bulletCount:5, spreadAngle:0.18, bulletSpeed:1.4, bulletDamage:1, desc:'5方向广域压制', specialInterval:6, specialType:'freeze' },
  burst:  { name:'爆裂型', color:'#f84', turret:'#d62', speed:1.0, hpBonus:0,  shootDelay:55, magSize:4, reloadTime:150, bulletCount:7, spreadAngle:0.16, bulletSpeed:1.9, bulletDamage:1, desc:'7方向爆裂弹幕', specialInterval:5, specialType:'explosive' },
  sniper: { name:'狙击型', color:'#a4f', turret:'#82d', speed:0.7, hpBonus:-1, shootDelay:52, magSize:3, reloadTime:170, bulletCount:1, spreadAngle:0,    bulletSpeed:4.8, bulletDamage:3, desc:'超远程高伤狙击', specialInterval:3, specialType:'super_pierce' },
  homing: { name:'追踪型', color:'#f8f', turret:'#d6d', speed:0.95,hpBonus:0,  shootDelay:38, magSize:6, reloadTime:118, bulletCount:2, spreadAngle:0.08, bulletSpeed:2.2, bulletDamage:1, desc:'追踪弹幕', specialInterval:4, specialType:'homing_burst' },
};
// Seventh chassis: boundary-themed, inspired by gap/threshold danmaku logic rather than raw DPS.
tankTypes.border = { name:'境界型', color:'#6044a8', turret:'#d9b6ff', speed:0.9, hpBonus:0, shootDelay:43, magSize:5, reloadTime:136, bulletCount:3, spreadAngle:0.075, bulletSpeed:2.45, bulletDamage:1, desc:'间隙折射弹幕', specialInterval:4, specialType:'rift' };
tankTypes.blade = { name:'斩魂型', color:'#3fd5da', turret:'#bdfcff', speed:1.28, hpBonus:-1, shootDelay:24, magSize:8, reloadTime:112, bulletCount:2, spreadAngle:0.06, bulletSpeed:2.75, bulletDamage:1, desc:'高速双刃穿刺', specialInterval:5, specialType:'phantom_slash' };
tankTypes.scarlet = { name:'红枪型', color:'#8f1024', turret:'#ff5d73', speed:1.02, hpBonus:1, shootDelay:46, magSize:4, reloadTime:150, bulletCount:1, spreadAngle:0, bulletSpeed:3.65, bulletDamage:2, desc:'低弹匣高压血枪', specialInterval:4, specialType:'blood_lance' };
tankTypes.astral = { name:'星仪型', color:'#285a8f', turret:'#9fe2ff', speed:0.82, hpBonus:1, shootDelay:50, magSize:5, reloadTime:138, bulletCount:3, spreadAngle:0.12, bulletSpeed:1.85, bulletDamage:1, desc:'星仪轨道控场', specialInterval:5, specialType:'astral_orbit' };

const TANK_FORM_FACTORS = {
  spread: { visual:[1.00,1.04,1.08], hit:[1.00,1.03,1.06] },
  focus:  { visual:[0.96,0.92,0.90], hit:[0.94,0.90,0.88] },
  wide:   { visual:[1.05,1.10,1.15], hit:[1.05,1.08,1.12] },
  burst:  { visual:[1.06,1.12,1.16], hit:[1.06,1.10,1.14] },
  sniper: { visual:[0.92,0.90,0.88], hit:[0.90,0.88,0.86] },
  homing: { visual:[0.98,1.00,0.96], hit:[0.96,0.96,0.94] },
  border: { visual:[1.00,0.96,0.92], hit:[0.98,0.94,0.90] },
  blade:  { visual:[0.94,0.90,0.88], hit:[0.92,0.89,0.86] },
  scarlet:{ visual:[1.03,1.08,1.10], hit:[1.02,1.06,1.08] },
  astral: { visual:[1.02,1.05,1.04], hit:[1.00,1.02,1.00] },
};

function getTankFormFactor(tankType, evoLevel, kind) {
  const factors = TANK_FORM_FACTORS[tankType] || TANK_FORM_FACTORS.spread;
  const arr = factors[kind] || factors.visual || [1, 1, 1];
  const idx = Math.max(0, Math.min(arr.length - 1, evoLevel || 0));
  return arr[idx] || 1;
}
let currentTankType = 'spread';

const FACTIONS = {
  moon_arsenal: {
    name: '月核军械库',
    code: 'MOON-ARS',
    color: '#ff9b4a',
    lore: '最早把月光石铸成武器的技术官僚。它们相信一切灾厄都能被归档、编号，然后装进炮膛。'
  },
  ash_church: {
    name: '灰烬圣城',
    code: 'ASH-CHURCH',
    color: '#f6e5aa',
    lore: '圣城在末日后仍维持钟声与审判。护教军不宣称胜利，只宣称“秩序仍在”。'
  },
  observatory: {
    name: '第七观测站',
    code: 'OBS-7',
    color: '#8ce8ff',
    lore: '观测站曾监测碎月潮汐，后来开始监测人心。它们的兵器总像在记录某种证词。'
  },
  graveyard: {
    name: '灰域残骸群',
    code: 'GRAVE-NET',
    color: '#9ca8ff',
    lore: '无人认领的战车、矿机与城防炮在废土中彼此接驳，形成没有司令部的军队。'
  },
  void_cult: {
    name: '虚月教团',
    code: 'VOID-RITE',
    color: '#d9b6ff',
    lore: '他们崇拜月背的空洞，认为边界不是墙，而是可以被献祭、折叠与重新命名的门。'
  },
  storm_cloister: {
    name: '雷霆修会',
    code: 'STORM-CLO',
    color: '#76fcff',
    lore: '气象塔倒塌后，修会接管了天候算法。雷声成为它们的祷词，闪电成为它们的签名。'
  }
};

function getFactionInfo(id) {
  return FACTIONS[id] || FACTIONS.graveyard;
}

function appendFactionLore(baseLore, factionId) {
  const faction = getFactionInfo(factionId);
  if (!faction) return baseLore || '';
  return (baseLore || '') + ' / 阵营记录：' + faction.lore;
}

function renderDifficultyButtons() {
  const container = document.getElementById('difficulty-buttons');
  const modeSwitch = document.getElementById('run-mode-switch');
  if (modeSwitch) {
    modeSwitch.querySelectorAll('.run-mode-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = modeSwitch.querySelector(selectedRunMode === 'endless' ? '.run-mode-btn:nth-child(2)' : '.run-mode-btn:nth-child(1)');
    if (activeBtn) activeBtn.classList.add('active');
  }
  // Ensure dual mode button exists on start screen
  let dualBtn = document.getElementById('dual-mode-btn');
  if (!dualBtn) {
    dualBtn = document.createElement('button');
    dualBtn.id = 'dual-mode-btn';
    dualBtn.style.cssText = 'margin-top:8px;padding:8px 24px;font:14px "Courier New";' +
      'background:#1a1a2a;color:#8cf;border:1px solid #8cf;border-radius:4px;cursor:pointer;';
    dualBtn.onclick = toggleDualMode;
    document.getElementById('start-screen').appendChild(dualBtn);
    // Gamepad status indicator (clickable to force re-scan)
    const gpStatus = document.createElement('span');
    gpStatus.id = 'gamepad-status';
    gpStatus.style.cssText = 'display:block;margin-top:2px;font:10px "Courier New";color:#888;cursor:pointer;';
    gpStatus.title = '点击此处强制重新检测手柄';
    gpStatus.onclick = function(e) {
      e.stopPropagation();
      dualBtn._lastGpPoll = 0; // Force re-poll
      renderDifficultyButtons();
    };
    dualBtn.parentNode.insertBefore(gpStatus, dualBtn.nextSibling);
  }
  // Poll gamepad for status display (throttled to every 3s to avoid BT lag)
  const now = Date.now();
  if (!dualBtn._lastGpPoll || now - dualBtn._lastGpPoll > 3000) {
    dualBtn._lastGpPoll = now;
    dualBtn._cachedGpName = '';
    try {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (const gp of gamepads) {
        if (gp && gp.connected) { dualBtn._cachedGpName = gp.id; break; }
      }
    } catch(e) { /* ignore gamepad API errors */ }
  }
  const gpName = dualBtn._cachedGpName || '';
  const gpStatus = document.getElementById('gamepad-status');
  if (gpStatus) {
    gpStatus.textContent = gpName ? '\u{1F3AE} 已连接: ' + gpName.substring(0, 40) : '未检测到手柄';
    gpStatus.style.color = gpName ? '#0f0' : '#888';
  }
  dualBtn.textContent = dualModePending ? '[ON]  双人模式 (手柄P2)' : '[OFF]  单人模式';

  const classes = ['easy','normal','hard','extreme','nightmare'];
  container.innerHTML = DIFFICULTY_ORDER.map((key, idx) => {
    const diff = difficultySettings[key];
    const unlocked = unlockedDifficulties.has(key);
    const cls = classes[idx] || '';
    if (unlocked) {
      return `<button class="diff-btn ${cls}" onclick="showTankSelect('${key}')">${diff.label}</button>`;
    } else {
      return `<button class="diff-btn ${cls} locked" disabled>LOCK ${diff.label}<br><span class="lock-hint">${diff.label}模式获得${diff.unlockScore}分解锁</span></button>`;
    }
  }).join('');
  // Update info text
  const info = document.getElementById('diff-info');
  info.innerHTML = DIFFICULTY_ORDER.map((key) => {
    const d = difficultySettings[key];
    const unlocked = unlockedDifficulties.has(key);
    return unlocked
      ? `${d.label}: ${d.lives}条命 · 通关第${d.clearWave}波 · 敌HP+${d.enemyHpBonus} · 速度×${d.enemySpeedMul}`
      : `<span class="locked-info">${d.label}: LOCK · 需分数${d.unlockScore}解锁</span>`;
  }).join('<br>') + '<br><span class="run-mode-hint">'
    + (selectedRunMode === 'endless'
      ? 'ENDLESS FRONT / 無盡戰線：不會通關，排行榜按最高波次與分數記錄'
      : 'CLEAR ARCHIVE / 通關戰線：達成固定波次並歸檔全部Boss後結算')
    + '</span>';
  // Update currency + active tank
  const curEl = document.getElementById('currency-display');
  if (curEl) curEl.innerHTML = renderMoonstoneChip(coreFragments, 'CHASSIS ' + (tankTypes[currentTankType]?.name || '??'));
}

function selectRunMode(mode) {
  selectedRunMode = mode === 'endless' ? 'endless' : 'clear';
  renderDifficultyButtons();
}

function getTankSelectIcon(type) {
  const specialIcons = {
    blade: `<svg class="tank-select-svg blade-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <circle class="icon-halo" cx="32" cy="32" r="25" fill="none" stroke-width="1.2"/>
      <path class="icon-frame" d="M16 48 L48 16 M16 16 L48 48" fill="none" stroke-width="1.1" stroke-linecap="round"/>
      <path class="icon-line" d="M18 45 L44 19 L52 12 L45 20 L20 50 Z" fill="rgba(255,255,255,0.08)" stroke-width="1.8" stroke-linejoin="round"/>
      <path class="icon-line" d="M18 19 L44 45 L52 52 L45 44 L20 14 Z" fill="rgba(255,255,255,0.06)" stroke-width="1.8" stroke-linejoin="round"/>
      <rect class="icon-core" x="29" y="29" width="6" height="6" transform="rotate(45 32 32)"/>
      <path class="icon-line" d="M8 32 H18 M46 32 H56" fill="none" stroke-width="1" stroke-linecap="round" opacity="0.55"/>
    </svg>`,
    scarlet: `<svg class="tank-select-svg scarlet-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path class="icon-halo" d="M32 8 L52 20 L52 44 L32 56 L12 44 L12 20 Z" fill="none" stroke-width="1.1"/>
      <path class="icon-frame" d="M32 11 V53 M18 39 L32 53 L46 39" fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="icon-line" d="M32 7 L42 29 L32 57 L22 29 Z" fill="rgba(255,255,255,0.07)" stroke-width="1.8" stroke-linejoin="round"/>
      <path class="icon-line" d="M23 29 H41 M27 21 H37 M25 42 H39" fill="none" stroke-width="1.2" stroke-linecap="round" opacity="0.72"/>
      <circle class="icon-core" cx="32" cy="32" r="5"/>
      <path class="icon-line" d="M12 32 H20 M44 32 H52" fill="none" stroke-width="1.3" stroke-linecap="round"/>
    </svg>`,
    astral: `<svg class="tank-select-svg astral-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <circle class="icon-halo" cx="32" cy="32" r="24" fill="none" stroke-width="1.1"/>
      <ellipse class="icon-frame" cx="32" cy="32" rx="27" ry="9" fill="none" stroke-width="1.25" transform="rotate(-24 32 32)"/>
      <ellipse class="icon-frame" cx="32" cy="32" rx="27" ry="9" fill="none" stroke-width="1.25" transform="rotate(24 32 32)"/>
      <path class="icon-line" d="M32 14 L37 27 L50 32 L37 37 L32 50 L27 37 L14 32 L27 27 Z" fill="rgba(255,255,255,0.08)" stroke-width="1.7" stroke-linejoin="round"/>
      <circle class="icon-core" cx="32" cy="32" r="4.6"/>
      <circle class="icon-core" cx="49" cy="25" r="2"/>
      <circle class="icon-core" cx="15" cy="39" r="1.8" opacity="0.8"/>
    </svg>`
  };
  const mainIcons = {
    spread: `<svg class="tank-select-svg spread-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle class="icon-halo" cx="32" cy="32" r="25" fill="none" stroke-width="1.15"/><path class="icon-frame" d="M32 8 L18 26 L46 26 Z M18 38 L46 38 L32 56 Z" fill="none" stroke-width="1" stroke-linejoin="round"/><path class="icon-line" d="M32 9 L32 55 M9 32 L24 32 M40 32 L55 32 M15 17 L26 26 M49 17 L38 26 M15 47 L26 38 M49 47 L38 38" fill="none" stroke-width="1.4" stroke-linecap="round" opacity="0.7"/><circle class="icon-core" cx="32" cy="32" r="4.5"/><circle class="icon-core" cx="21" cy="28" r="1.8" opacity="0.75"/><circle class="icon-core" cx="43" cy="28" r="1.8" opacity="0.75"/><path class="icon-line" d="M32 29 L32 35 M29 32 L35 32" fill="none" stroke-width="1" stroke-linecap="round" opacity="0.6"/></svg>`,
    focus: `<svg class="tank-select-svg focus-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle class="icon-halo" cx="32" cy="32" r="22" fill="none" stroke-width="1.2"/><path class="icon-frame" d="M32 7 L44 32 L32 57 L20 32 Z" fill="none" stroke-width="1.15" stroke-linejoin="round"/><path class="icon-line" d="M32 14 L32 50 M16 32 L48 32" fill="none" stroke-width="1.1" stroke-linecap="round" opacity="0.55"/><path class="icon-line" d="M23 23 L41 41 M41 23 L23 41" fill="none" stroke-width="1.2" stroke-linecap="round" opacity="0.65"/><ellipse class="icon-core" cx="32" cy="32" rx="3.5" ry="7" stroke-width="1.3"/><path class="icon-line" d="M9 32 H15 M49 32 H55" fill="none" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    wide: `<svg class="tank-select-svg wide-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle class="icon-halo" cx="32" cy="32" r="23" fill="none" stroke-width="1.1"/><path class="icon-frame" d="M12 26 Q32 8 52 26 L52 38 Q32 56 12 38 Z" fill="none" stroke-width="1.1" stroke-linejoin="round"/><path class="icon-line" d="M32 12 L32 52" fill="none" stroke-width="1" stroke-linecap="round" opacity="0.55"/><path class="icon-line" d="M12 26 L52 26 M12 38 L52 38" fill="none" stroke-width="1.3" stroke-linecap="round" opacity="0.7"/><path class="icon-line" d="M18 22 L27 30 M46 22 L37 30 M18 42 L27 34 M46 42 L37 34" fill="none" stroke-width="1.2" stroke-linecap="round" opacity="0.55"/><circle class="icon-core" cx="32" cy="32" r="4.2"/><circle class="icon-core" cx="19" cy="32" r="2.8" opacity="0.6"/><circle class="icon-core" cx="45" cy="32" r="2.8" opacity="0.6"/></svg>`,
    burst: `<svg class="tank-select-svg burst-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle class="icon-halo" cx="32" cy="32" r="22" fill="none" stroke-width="1.1"/><path class="icon-frame" d="M32 4 L40 26 L62 32 L40 38 L32 60 L24 38 L2 32 L24 26 Z" fill="none" stroke-width="1" stroke-linejoin="round"/><path class="icon-line" d="M32 10 L34 28 L50 32 L34 36 L32 54 L30 36 L14 32 L30 28 Z" fill="rgba(255,255,255,0.07)" stroke-width="1.3" stroke-linejoin="round"/><path class="icon-line" d="M28 24 L32 28 L36 24 M28 40 L32 36 L36 40 M24 28 L28 32 L24 36 M40 28 L36 32 L40 36" fill="none" stroke-width="1.1" stroke-linecap="round" opacity="0.6"/><circle class="icon-core" cx="32" cy="32" r="3.8"/><circle class="icon-core" cx="32" cy="20" r="1.5" opacity="0.7"/><circle class="icon-core" cx="44" cy="32" r="1.5" opacity="0.7"/><circle class="icon-core" cx="32" cy="44" r="1.5" opacity="0.7"/><circle class="icon-core" cx="20" cy="32" r="1.5" opacity="0.7"/></svg>`,
    sniper: `<svg class="tank-select-svg sniper-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle class="icon-halo" cx="32" cy="32" r="24" fill="none" stroke-width="1.1"/><circle class="icon-frame" cx="32" cy="32" r="13" fill="none" stroke-width="1.05"/><path class="icon-frame" d="M32 4 L32 19 M32 45 L32 60 M4 32 L19 32 M45 32 L60 32" fill="none" stroke-width="1.1" stroke-linecap="round"/><path class="icon-line" d="M19 32 L25 25 M19 32 L25 39 M45 32 L39 25 M45 32 L39 39 M32 19 L25 25 M32 19 L39 25 M32 45 L25 39 M32 45 L39 39" fill="none" stroke-width="0.9" stroke-linecap="round" opacity="0.55"/><circle class="icon-core" cx="32" cy="32" r="1.8"/><circle class="icon-core" cx="32" cy="32" r="6" fill="none" stroke-width="0.6" opacity="0.45"/><path class="icon-line" d="M32 21 L32 25 M32 39 L32 43 M21 32 L25 32 M39 32 L43 32" fill="none" stroke-width="1" stroke-linecap="round"/></svg>`,
    homing: `<svg class="tank-select-svg homing-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle class="icon-halo" cx="32" cy="32" r="24" fill="none" stroke-width="1.1"/><path class="icon-frame" d="M32 6 L48 32 L32 58 L16 32 Z" fill="none" stroke-width="1.05" stroke-linejoin="round"/><path class="icon-frame" d="M6 32 L32 16 L58 32 L32 48 Z" fill="none" stroke-width="0.85" stroke-linejoin="round" opacity="0.55"/><path class="icon-line" d="M32 14 L32 50 M16 26 L48 38 M16 38 L48 26" fill="none" stroke-width="1" stroke-linecap="round" opacity="0.5"/><circle class="icon-core" cx="32" cy="32" r="4"/><circle class="icon-core" cx="32" cy="32" r="9" fill="none" stroke-width="0.7" opacity="0.6"/><path class="icon-line" d="M26 19 L22 15 M38 19 L42 15 M26 45 L22 49 M38 45 L42 49" fill="none" stroke-width="1" stroke-linecap="round" opacity="0.65"/></svg>`,
    border: `<svg class="tank-select-svg border-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle class="icon-halo" cx="32" cy="32" r="24" fill="none" stroke-width="1.1" stroke-dasharray="3 5"/><path class="icon-frame" d="M32 5 L32 22 M32 42 L32 59 M5 32 L22 32 M42 32 L59 32" fill="none" stroke-width="1" stroke-linecap="round"/><path class="icon-line" d="M24 16 L40 48 M16 24 L48 40 M40 16 L24 48 M48 24 L16 40" fill="none" stroke-width="0.95" stroke-linecap="round" opacity="0.55"/><path class="icon-line" d="M32 24 Q28 32 32 40 Q36 32 32 24" fill="rgba(255,255,255,0.06)" stroke-width="1.2" stroke-linejoin="round"/><circle class="icon-core" cx="32" cy="32" r="3.5"/><circle class="icon-core" cx="20" cy="20" r="2" opacity="0.65"/><circle class="icon-core" cx="44" cy="44" r="2" opacity="0.65"/><path class="icon-line" d="M41 41 L44 44 M20 20 L23 23" fill="none" stroke-width="0.8" stroke-linecap="round" opacity="0.4"/></svg>`
  };
  return specialIcons[type] || mainIcons[type] || '&#9670;';
}

function getSpecialCodeIconType(code, tankType) {
  const normalized = String(code || '').toUpperCase();
  if (tankType !== undefined) {
    if (tankType === 'blade' && ['KAT', 'HNR', 'ROU', 'SLASH'].includes(normalized)) return 'blade';
    if (tankType === 'scarlet' && ['RED', 'VLA', 'CRI', 'BLOOD'].includes(normalized)) return 'scarlet';
    if (tankType === 'astral' && ['AST', 'ORB', 'GYO', 'SPH'].includes(normalized)) return 'astral';
    return '';
  }
  if (normalized === 'KAT') return 'blade';
  if (normalized === 'RED') return 'scarlet';
  if (normalized === 'AST') return 'astral';
  return '';
}

function renderCodeIcon(code, title, tankType) {
  const type = tankType !== undefined ? getSpecialCodeIconType(code, tankType) : getSpecialCodeIconType(code);
  if (!type && tankType && getTankSelectIcon(tankType) !== '&#9670;') {
    return `<span class="ui-code-icon" title="${escapeHtml(title || code)}">${getTankSelectIcon(tankType)}</span>`;
  }
  if (!type) return `<span class="ui-code-icon" title="${escapeHtml(title || code)}"><span class="code-text-fallback">${escapeHtml(code)}</span></span>`;
  return `<span class="ui-code-icon" title="${escapeHtml(title || code)}">${getTankSelectIcon(type)}</span>`;
}

let dualModePending = false;
let dualP1Tank = null;
let dualP2Tank = null;
let dualSelectingFor = 'p1'; // 'p1' or 'p2' — which player is currently choosing
let dualTankSelectGpPoll = null;
function handleTankSelectKeyboard(e) {
  const screen = document.getElementById('tank-select-screen');
  if (!screen || screen.style.display === 'none') return false;
  const cards = screen.querySelectorAll('.tank-card:not(.locked-card)');
  if (!cards.length) return false;
  let focused = screen.querySelector('.tank-card.gp-focus');
  let idx = focused ? Array.from(cards).indexOf(focused) : -1;

  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    if (focused) focused.classList.remove('gp-focus');
    if (idx < 0) idx = 0;
    if (e.key === 'ArrowRight') idx = Math.min(cards.length - 1, idx + 1);
    else if (e.key === 'ArrowLeft') idx = Math.max(0, idx - 1);
    else if (e.key === 'ArrowUp') idx = Math.max(0, idx - 5);
    else if (e.key === 'ArrowDown') idx = Math.min(cards.length - 1, idx + 5);
    if (cards[idx]) {
      cards[idx].classList.add('gp-focus');
      cards[idx].scrollIntoView({behavior:'smooth', block:'nearest'});
    }
    return true;
  }
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (dualModePending) {
      const bothReady = dualP1Tank && dualP2Tank && dualP1Tank !== dualP2Tank;
      if (bothReady) {
        startGame(currentDifficulty, dualP1Tank, {mode:selectedRunMode, dual:true, p2tank:dualP2Tank});
        return true;
      }
    }
    if (focused && idx >= 0) {
      const cls = Array.from(focused.classList).filter(c => c !== 'tank-card' && c !== 'gp-focus' && c !== 'p1-locked');
      if (dualModePending && cls[0]) { selectTankForDual(cls[0]); return true; }
      else if (cls[0]) { startGame(currentDifficulty, cls[0], {mode:selectedRunMode}); return true; }
    }
  }
  if (dualModePending && e.key === 'Tab') {
    e.preventDefault();
    switchSelectingPlayer(dualSelectingFor === 'p1' ? 'p2' : 'p1');
    return true;
  }
  return false;
}
function startTankSelectGamepadPolling() {
  if (dualTankSelectGpPoll) clearInterval(dualTankSelectGpPoll);
  if (!dualModePending) return;
  // Inject focus style
  if (!document.getElementById('gp-focus-style')) {
    const style = document.createElement('style');
    style.id = 'gp-focus-style';
    style.textContent = '.tank-card.gp-focus { outline:3px solid #f80 !important; outline-offset:2px; transform:scale(1.04); z-index:5; }';
    document.head.appendChild(style);
  }
  let prevA = false, prevLeft = false, prevRight = false, prevUp = false, prevDown = false;
  let prevLB = false, prevRB = false, prevConfirm = false;
  const CARDS_PER_ROW = 5;
  dualTankSelectGpPoll = setInterval(() => {
    const screen = document.getElementById('tank-select-screen');
    if (!screen || screen.style.display === 'none') { clearInterval(dualTankSelectGpPoll); return; }
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let gp = null;
    for (const g of gamepads) { if (g && g.connected) { gp = g; break; } }
    if (!gp) return;

    // Detect buttons: support Xbox, PS, and UCOM mappings
    const btnPressed = (idx) => gp.buttons[idx] && gp.buttons[idx].pressed;
    const a = btnPressed(0) || btnPressed(1); // A (Xbox) or B / Cross (PS)
    const left = gp.axes[0] < -0.5 || btnPressed(14);
    const right = gp.axes[0] > 0.5 || btnPressed(15);
    const up = gp.axes[1] < -0.5 || btnPressed(12);
    const down = gp.axes[1] > 0.5 || btnPressed(13);
    const lb = btnPressed(4); const rb = btnPressed(5);
    // Confirm: Start(9), A(0), X(2), Y(3), B(1)
    const confirm = btnPressed(9) || btnPressed(0) || btnPressed(2) || btnPressed(3);

    // LB/RB: switch active player
    if (lb && !prevLB) switchSelectingPlayer('p1');
    if (rb && !prevRB) switchSelectingPlayer('p2');

    // Navigate cards (grid: 5 per row)
    const nav = (right && !prevRight) || (left && !prevLeft) || (up && !prevUp) || (down && !prevDown);
    if (nav) {
      const cards = screen.querySelectorAll('.tank-card:not(.locked-card)');
      const total = cards.length;
      let focused = screen.querySelector('.tank-card.gp-focus');
      let idx = focused ? Array.from(cards).indexOf(focused) : 0;
      if (focused) focused.classList.remove('gp-focus');
      if (right) idx = Math.min(total - 1, idx + 1);
      else if (left) idx = Math.max(0, idx - 1);
      else if (up) idx = Math.max(0, idx - CARDS_PER_ROW);
      else if (down) idx = Math.min(total - 1, idx + CARDS_PER_ROW);
      if (idx < 0 || idx >= total) idx = focused ? Array.from(cards).indexOf(focused) : 0;
      if (cards[idx]) {
        cards[idx].classList.add('gp-focus');
        cards[idx].scrollIntoView({behavior:'smooth', block:'nearest'});
      }
    }

    // A/Confirm button: select or start
    if (confirm && !prevConfirm) {
      const bothReady = dualP1Tank && dualP2Tank && dualP1Tank !== dualP2Tank;
      if (bothReady) {
        startGame(currentDifficulty, dualP1Tank, {mode:selectedRunMode, dual:true, p2tank:dualP2Tank});
      } else {
        const focused = screen.querySelector('.tank-card.gp-focus');
        if (focused) {
          const cls = Array.from(focused.classList).filter(c => c !== 'tank-card' && c !== 'gp-focus' && c !== 'p1-locked');
          const key = cls[0];
          if (key) selectTankForDual(key);
        }
      }
    }

    prevA = a; prevLeft = left; prevRight = right; prevUp = up; prevDown = down;
    prevLB = lb; prevRB = rb; prevConfirm = confirm;
  }, 120);
}
function toggleDualMode() {
  if (!dualModePending) {
    // Force refresh gamepad cache
    const btn = document.getElementById('dual-mode-btn');
    if (btn) btn._lastGpPoll = 0;
    // Check for gamepad before entering dual mode
    try {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      let hasGamepad = false;
      for (const gp of gamepads) { if (gp && gp.connected) { hasGamepad = true; break; } }
      if (!hasGamepad) {
        const info = document.getElementById('diff-info');
        if (info) { info.textContent = '⚠ 未检测到手柄！蓝牙手柄请摇一下唤醒，再点一次按钮。'; info.style.color = '#f84'; }
        return;
      }
    } catch(e) {
      const info = document.getElementById('diff-info');
      if (info) { info.textContent = '⚠ 手柄检测异常，请重试。'; info.style.color = '#f84'; }
      return;
    }
  }
  dualModePending = !dualModePending;
  dualP1Tank = null; dualP2Tank = null; dualSelectingFor = 'p1';
  const btn = document.getElementById('dual-mode-btn');
  if (btn) btn.classList.toggle('dual-active', dualModePending);
}
function selectTankForDual(key) {
  if (dualSelectingFor === 'p1') {
    dualP1Tank = (dualP1Tank === key) ? null : key;
    dualSelectingFor = 'p2';
  } else {
    dualP2Tank = (dualP2Tank === key) ? null : key;
    dualSelectingFor = 'p1';
  }
  renderDualTankSelect();
}
function switchSelectingPlayer(player) {
  dualSelectingFor = player;
  renderDualTankSelect();
}
function renderDualTankSelect() {
  const tankKeys = ['spread','focus','wide','burst','sniper','homing','border','blade','scarlet','astral'];
  const p1name = dualP1Tank ? (tankTypes[dualP1Tank]?.name || dualP1Tank) : '未选';
  const p2name = dualP2Tank ? (tankTypes[dualP2Tank]?.name || dualP2Tank) : '未选';
  const bothReady = dualP1Tank && dualP2Tank && dualP1Tank !== dualP2Tank;

  // Render selection panel
  document.getElementById('tank-select-screen').querySelector('h2').innerHTML =
    '<span id="sel-p1" style="cursor:pointer;' + (dualSelectingFor === 'p1' ? 'color:#fff;border-bottom:2px solid #fff;' : 'color:#888;') + '" onclick="switchSelectingPlayer(\'p1\')">\u{1F5B1} P1: ' + p1name + '</span>' +
    ' &nbsp;&nbsp; ' +
    '<span id="sel-p2" style="cursor:pointer;' + (dualSelectingFor === 'p2' ? 'color:#f80;border-bottom:2px solid #f80;' : 'color:#888;') + '" onclick="switchSelectingPlayer(\'p2\')">\u{1F3AE} P2: ' + p2name + '</span>' +
    (bothReady ? ' &nbsp; <span style="color:#0f0;font-size:14px;">✔ 就绪</span>' : '');

  // Render tank cards
  const container = document.querySelector('#tank-select-screen .tank-cards');
  const tankNamesExtra = ['博丽灵梦式','雾雨魔理沙式','十六夜咲夜式','芙兰朵露式','八意永琳式','东风谷早苗式','境界结社式','魂魄妖梦式','斯卡雷特式','帕秋莉式'];
  const tankDescs = ['渐进式扩散压制','单点高能输出','控场型广域封锁','爆燃溅射火力','远程点杀贯穿','持续导引追猎','间隙折射与位相弹道','高速双刃穿刺','低弹匣血枪贯穿','星仪轨道控场'];
  const tankDetails = ['均衡机体 · 依赖弹幕密度成长','机动优秀 · 依赖主炮精度成长','生存更稳 · 依赖控场扩展成长','节奏偏慢 · 依赖爆炸收益成长','脆但致命 · 依赖狙击校准成长','泛用灵活 · 依赖导引网络成长','中距离博弈 · 依赖边界折射成长','高速轻甲 · 依赖斩击角度成长','重压短弹匣 · 依赖命中汲取成长','慢速术式 · 依赖轨道控制成长'];
  const tankIcons = tankKeys.map(getTankSelectIcon);
  container.innerHTML = tankKeys.map((key, i) => {
    const t = tankTypes[key];
    const unlocked = unlockedTanks.has(key);
    if (unlocked) {
      const cadence = '弹匣 ' + t.magSize + ' / 装填 ' + (t.reloadTime / 60).toFixed(1) + 's / 冷却 ' + t.shootDelay;
      const isP1 = dualP1Tank === key, isP2 = dualP2Tank === key;
      const disabled = ((dualSelectingFor === 'p1' && isP2) || (dualSelectingFor === 'p2' && isP1));
      const borderStyle = isP1 ? 'border:2px solid #fff;' : isP2 ? 'border:2px solid #f80;' : '';
      const label = isP1 ? '<span style="color:#fff;">[P1]</span>' : isP2 ? '<span style="color:#f80;">[P2]</span>' : '';
      const clickH = disabled ? '' : `selectTankForDual('${key}')`;
      const style = disabled ? 'opacity:0.4;' : '';
      return `<div class="tank-card ${key}" onclick="${clickH}" style="${style}${borderStyle}">
        <span class="tank-icon">${tankIcons[i]}</span>
        <div class="tank-name">${label} ${t.name}</div>
        <div class="tank-subtitle">${tankNamesExtra[i]}</div>
        <div class="tank-desc">${tankDescs[i]}</div>
        <div class="tank-detail">${tankDetails[i]}<br>${cadence}</div>
      </div>`;
    } else {
      const cond = TANK_UNLOCK_CONDITIONS[key];
      const unlockStatus = getTankUnlockConditionStatus(key);
      const unlockHint = unlockStatus.met ? '条件已达成 · 点击解锁' : (cond.cost > 0 ? cond.cost + ' MS 解锁' : cond.desc);
      return `<div class="tank-card ${key} locked-card" onclick="if(tryUnlockTank('${key}')){showTankSelect(currentDifficulty);}">
        <span class="tank-icon">LOCK</span>
        <div class="tank-name">???</div>
        <div class="tank-subtitle">未解锁</div>
        <div class="tank-desc">${unlockHint}</div>
        <div class="tank-detail">${cond.desc}${unlockStatus.met ? ' · ' + unlockStatus.label : ''}</div>
      </div>`;
    }
  }).join('');

  // Update confirm button
  let confirmBtn = document.getElementById('dual-confirm-btn');
  if (!confirmBtn) {
    confirmBtn = document.createElement('button');
    confirmBtn.id = 'dual-confirm-btn';
    confirmBtn.style.cssText = 'margin-top:10px;padding:10px 40px;font:bold 16px "Courier New";' +
      'background:#1a3a1a;color:#0f0;border:2px solid #0f0;border-radius:4px;cursor:pointer;';
    confirmBtn.textContent = '开 始 战 斗';
    document.getElementById('tank-select-screen').appendChild(confirmBtn);
  }
  confirmBtn.style.display = 'block';
  confirmBtn.style.opacity = bothReady ? '1' : '0.4';
  confirmBtn.style.cursor = bothReady ? 'pointer' : 'default';
  confirmBtn.onclick = bothReady ? () => startGame(currentDifficulty, dualP1Tank, {mode:selectedRunMode, dual:true, p2tank:dualP2Tank}) : null;
}
function showTankSelect(difficulty) {
  currentDifficulty = difficulty;
  dualP1Tank = null; dualP2Tank = null; dualSelectingFor = 'p1';
  if (dualModePending) {
    renderDualTankSelect();
  } else {
    document.getElementById('tank-select-screen').querySelector('h2').textContent = '选择机体';
    const container = document.querySelector('#tank-select-screen .tank-cards');
    const tankKeys = ['spread','focus','wide','burst','sniper','homing','border','blade','scarlet','astral'];
    const tankNamesExtra = ['博丽灵梦式','雾雨魔理沙式','十六夜咲夜式','芙兰朵露式','八意永琳式','东风谷早苗式','境界结社式','魂魄妖梦式','斯卡雷特式','帕秋莉式'];
    const tankDescs = ['渐进式扩散压制','单点高能输出','控场型广域封锁','爆燃溅射火力','远程点杀贯穿','持续导引追猎','间隙折射与位相弹道','高速双刃穿刺','低弹匣血枪贯穿','星仪轨道控场'];
    const tankDetails = ['均衡机体 · 依赖弹幕密度成长','机动优秀 · 依赖主炮精度成长','生存更稳 · 依赖控场扩展成长','节奏偏慢 · 依赖爆炸收益成长','脆但致命 · 依赖狙击校准成长','泛用灵活 · 依赖导引网络成长','中距离博弈 · 依赖边界折射成长','高速轻甲 · 依赖斩击角度成长','重压短弹匣 · 依赖命中汲取成长','慢速术式 · 依赖轨道控制成长'];
    const tankIcons = tankKeys.map(getTankSelectIcon);
    container.innerHTML = tankKeys.map((key, i) => {
      const t = tankTypes[key];
      const unlocked = unlockedTanks.has(key);
      if (unlocked) {
        const cadence = '弹匣 ' + t.magSize + ' / 装填 ' + (t.reloadTime / 60).toFixed(1) + 's / 冷却 ' + t.shootDelay;
        return '<div class="tank-card ' + key + '" onclick="startGame(currentDifficulty, \'' + key + '\', {mode:selectedRunMode})">' +
          '<span class="tank-icon">' + tankIcons[i] + '</span>' +
          '<div class="tank-name">' + t.name + '</div>' +
          '<div class="tank-subtitle">' + tankNamesExtra[i] + '</div>' +
          '<div class="tank-desc">' + tankDescs[i] + '</div>' +
          '<div class="tank-detail">' + tankDetails[i] + '<br>' + cadence + '</div></div>';
      } else {
        const cond = TANK_UNLOCK_CONDITIONS[key];
        const unlockStatus = getTankUnlockConditionStatus(key);
        const unlockHint = unlockStatus.met ? '条件已达成 · 点击解锁' : (cond.cost > 0 ? cond.cost + ' MS 解锁' : cond.desc);
        return '<div class="tank-card ' + key + ' locked-card" onclick="if(tryUnlockTank(\'' + key + '\')){showTankSelect(currentDifficulty);}">' +
          '<span class="tank-icon">LOCK</span><div class="tank-name">???</div>' +
          '<div class="tank-subtitle">未解锁</div><div class="tank-desc">' + unlockHint + '</div>' +
          '<div class="tank-detail">' + cond.desc + (unlockStatus.met ? ' · ' + unlockStatus.label : '') + '</div></div>';
      }
    }).join('');
    const confirmBtn = document.getElementById('dual-confirm-btn');
    if (confirmBtn) confirmBtn.style.display = 'none';
  }
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('tank-select-screen').style.display = 'flex';
  if (dualModePending) startTankSelectGamepadPolling();
}

function hideTankSelect() {
  document.getElementById('tank-select-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'flex';
  if (dualTankSelectGpPoll) { clearInterval(dualTankSelectGpPoll); dualTankSelectGpPoll = null; }
  renderDifficultyButtons();
}

// --- Achievements ---
const achievementsDef = [
  { id: 'first_blood', name: '首次击杀', desc: '消灭第一个敌人', icon: 'K01', reward: 24 },
  { id: 'sharpshooter', name: '百发百中', desc: '累计消灭10个敌人', icon: 'A10', reward: 28 },
  { id: 'tank_hunter', name: '坦克杀手', desc: '累计消灭50个敌人', icon: 'K50', reward: 44 },
  { id: 'battle_veteran', name: '战斗老兵', desc: '累计消灭100个敌人', icon: 'K100', reward: 54 },
  { id: 'survivor', name: '生存专家', desc: '到达第5关', icon: 'W05', reward: 33 },
  { id: 'tenacious', name: '顽强战士', desc: '到达第10关', icon: 'W10', reward: 45 },
  { id: 'score_500', name: '初露锋芒', desc: '单局得分达到500', icon: 'S05', reward: 24 },
  { id: 'score_2000', name: '高分玩家', desc: '单局得分达到2000', icon: 'S20', reward: 44 },
  { id: 'score_5000', name: '积分之王', desc: '单局得分达到5000', icon: 'S50', reward: 63 },
  { id: 'hardcore', name: '硬核玩家', desc: '困难难度到达第5关', icon: 'HD5', reward: 54 },
  { id: 'flawless', name: '无伤过关', desc: '一关内未受任何伤害', icon: 'NOD', reward: 44 },
  { id: 'tank_spread_win', name: '扩散大师', desc: '使用扩散型通关第5波', icon: 'SPR', reward: 39 },
  { id: 'tank_focus_win', name: '集中火力', desc: '使用集中型通关第5波', icon: 'FOC', reward: 39 },
  { id: 'tank_wide_win', name: '广域压制', desc: '使用广域型通关第5波', icon: 'WID', reward: 39 },
  { id: 'tank_burst_win', name: '爆裂艺术家', desc: '使用爆裂型通关第5波', icon: 'BST', reward: 39 },
  { id: 'tank_sniper_win', name: '致命狙击', desc: '使用狙击型通关第5波', icon: 'SNP', reward: 39 },
  { id: 'tank_homing_win', name: '追踪猎手', desc: '使用追踪型通关第5波', icon: 'HOM', reward: 39 },
  { id: 'tank_border_win', name: '境界观测者', desc: '使用境界型通关第5波', icon: 'BDR', reward: 50 },
  { id: 'tank_blade_win', name: '半灵斩线', desc: '使用斩魂型通关第5波', icon: 'KAT', reward: 50 },
  { id: 'tank_scarlet_win', name: '红枪宣誓', desc: '使用红枪型通关第5波', icon: 'RED', reward: 45 },
  { id: 'tank_astral_win', name: '星仪校准', desc: '使用星仪型通关第5波', icon: 'AST', reward: 45 },
  { id: 'combo_20', name: '连击大师', desc: '达成20连击', icon: 'C20', reward: 50 },
  { id: 'elite_hunter', name: '精英猎手', desc: '累计消灭10个精英敌人', icon: 'E10', reward: 45 },
  { id: 'speed_demon', name: '闪电通关', desc: '在180秒内通关第5波', icon: 'SPD', reward: 45 },
  { id: 'powerup_collector', name: '道具收藏家', desc: '单局收集20个道具', icon: 'M20', reward: 44 },
  { id: 'mine_dodger', name: '排雷专家', desc: '一局内未触发任何地雷', icon: 'MIN', reward: 44 },
  { id: 'wave_15', name: '无尽征途', desc: '到达第15波', icon: 'W15', reward: 72 },
  { id: 'perfect_run', name: '完美通关', desc: '一整局未受伤到达第5波', icon: 'PFT', reward: 63 },
  { id: 'score_10000', name: '战场显圣', desc: '单局得分达到10000', icon: 'S100', reward: 81 },
  { id: 'score_20000', name: '月面王冠', desc: '单局得分达到20000', icon: 'S200', reward: 91 },
  { id: 'wave_20', name: '灰域远征', desc: '到达第20波', icon: 'W20', reward: 84 },
  { id: 'wave_25', name: '碎月行军', desc: '到达第25波', icon: 'W25', reward: 119 },
  { id: 'combo_35', name: '火线礼赞', desc: '达成35连击', icon: 'C35', reward: 81 },
  { id: 'combo_50', name: '弹幕圣歌', desc: '达成50连击', icon: 'C50', reward: 98 },
  { id: 'elite_hunter_25', name: '精英清算者', desc: '单局消灭25个精英敌人', icon: 'E25', reward: 77 },
  { id: 'powerup_collector_40', name: '模块掠夺者', desc: '单局收集40个道具', icon: 'M40', reward: 81 },
  { id: 'fragment_500', name: '月光石库管', desc: '持有500个月光石', icon: 'MS5', reward: 72 },
  { id: 'fragment_1000', name: '碎月银行', desc: '持有1000个月光石', icon: 'MS1K', reward: 88 },
  { id: 'all_tanks_unlocked', name: '机装全谱系', desc: '解锁全部十种我方坦克', icon: 'ALL', reward: 126 },
  { id: 'upgrade_apprentice', name: '整备学徒', desc: '累计完成10次坦克强化', icon: 'UP10', reward: 63 },
  { id: 'upgrade_master', name: '机装技师', desc: '累计完成30次坦克强化', icon: 'UP30', reward: 105 },
  { id: 'evolution_first', name: '初次进化', desc: '完成任意坦克1次进化', icon: 'EVO1', reward: 70 },
  { id: 'evolution_six', name: '六相开花', desc: '累计完成6次坦克进化', icon: 'EVO6', reward: 133 },
  { id: 'daily_clear', name: '日课清算', desc: '完成一次每日挑战目标', icon: 'DAY', reward: 70 },
  { id: 'nightmare_survivor', name: '梦魇存活者', desc: '梦魇难度到达第5关', icon: 'NM5', reward: 98 },
  { id: 'boss_witness', name: '首领目击者', desc: '抵达第4波并直面Boss', icon: 'B04', reward: 63 },
  { id: 'boss_breaker', name: '破城记录', desc: '抵达第12波，多次突破Boss战线', icon: 'B12', reward: 91 },
  { id: 'untouched_combo', name: '无伤连祷', desc: '未受伤时达成15连击', icon: 'NC15', tier: 'elite' },
  { id: 'wave_30', name: '长夜尽头', desc: '到达第30波', icon: 'W30', tier: 'mythic' },
  { id: 'score_30000', name: '碎月铭刻', desc: '单局得分达到30000', icon: 'S300', tier: 'mythic' },
  { id: 'combo_75', name: '弹道圣裁', desc: '达成75连击', icon: 'C75', tier: 'mythic' },
  { id: 'elite_hunter_40', name: '肃清令执行者', desc: '单局消灭40个精英敌人', icon: 'E40', tier: 'mythic' },
  { id: 'fusion_first', name: '首次融合协议', desc: '首次触发任意融合道具', icon: 'FUS', tier: 'elite' },
  { id: 'modifier_reroll', name: '重掷授权', desc: '在局内升级中刷新一次改造选项', icon: 'RR1', reward: 45 },
  { id: 'modifier_full_reroll', name: '四槽洗牌', desc: '同一次升级中刷新全部四个选项', icon: 'RR4', tier: 'elite' },
  { id: 'modifier_mythic', name: '神话协议', desc: '选择一次MYTHIC级局内改造', icon: 'MYT', tier: 'elite' },
  { id: 'modifier_treasury', name: '月石回流', desc: '从局内升级选项获得MOONSTONE奖励', icon: 'MSR', tier: 'elite' },
  { id: 'modifier_jackpot', name: '四联同调', desc: '在四个升级选项中刷出同方面改造并获得全部', icon: 'JCK', tier: 'mythic' },
  { id: 'global_research_first', name: '协议点火', desc: '完成1次研究室全局研究协议', icon: 'G01', reward: 54 },
  { id: 'global_research_10', name: '圣城总纲', desc: '累计完成10次全局研究协议', icon: 'G10', tier: 'elite' },
  { id: 'global_research_max', name: '全域整备', desc: '任意全局研究协议达到上限', icon: 'GMAX', tier: 'mythic' },
  { id: 'kills_500', name: '灰域屠戮者', desc: '累计消灭500个敌人', icon: 'K500', tier: 'elite' },
  { id: 'kills_1000', name: '月面清洗令', desc: '累计消灭1000个敌人', icon: 'K1K', tier: 'mythic' },
  { id: 'wave_35', name: '永夜哨兵', desc: '到达第35波', icon: 'W35', tier: 'mythic' },
  { id: 'score_50000', name: '幻月铭碑', desc: '单局得分达到50000', icon: 'S500', tier: 'mythic' },
  { id: 'tank_hard_spread', name: '扩散·执念', desc: '困难或以上使用扩散型通关第5波', icon: 'HS1', tier: 'elite' },
  { id: 'tank_hard_sniper', name: '狙击·绝对零度', desc: '困难或以上使用狙击型通关第5波', icon: 'HS2', tier: 'elite' },
  { id: 'tank_hard_astral', name: '星仪·轨道圣礼', desc: '困难或以上使用星仪型通关第5波', icon: 'HS3', tier: 'elite' },
  { id: 'boss_no_hit', name: '完美回避', desc: '无伤击败任意Boss', icon: 'BNH', tier: 'elite' },
  { id: 'boss_all_no_hit', name: '月面战神', desc: '一局内每一个Boss都无伤击败', icon: 'BNHA', tier: 'mythic' },
  { id: 'fusion_5', name: '协议收藏家', desc: '完成5种不同的融合协议', icon: 'F5', tier: 'elite' },
  { id: 'powerup_60', name: '战场清道夫', desc: '单局收集60个道具', icon: 'M60', tier: 'elite' },
  { id: 'clear_easy', name: '初级战线突破', desc: '通关任意难度战线', icon: 'CLE', reward: 100 },
  { id: 'clear_hard', name: '攻坚勋章', desc: '困难或以上难度通关', icon: 'CHD', tier: 'elite' },
  { id: 'clear_nightmare', name: '灰域征服者', desc: '梦魇难度通关', icon: 'CNM', tier: 'mythic' },
  { id: 'wave_40', name: '永不复还', desc: '到达第40波', icon: 'W40', tier: 'mythic' },
  { id: 'wave_50', name: '灰域边界', desc: '到达第50波', icon: 'W50', tier: 'mythic' },
  { id: 'score_100k', name: '月面神话', desc: '单局得分达到100000', icon: 'S1M', tier: 'mythic' },
  { id: 'combo_100', name: '弑神连祷', desc: '达成100连击', icon: 'C10', tier: 'mythic' },
  { id: 'kills_2000', name: '灰域净化者', desc: '累计消灭2000个敌人', icon: 'K2K', tier: 'mythic' },
  { id: 'kills_5000', name: '碎月终末', desc: '累计消灭5000个敌人', icon: 'K5K', tier: 'mythic' },
  { id: 'all_tank_hard', name: '全谱系·硬核', desc: '困难或以上使用全部10种坦克通关第5波', icon: 'ATH', tier: 'mythic' },
  { id: 'all_tank_evo', name: '全谱系·开花', desc: '全部10种坦克进化过至少1次', icon: 'ATE', tier: 'mythic' },
  { id: 'boss_5_run', name: '五狩巡礼', desc: '单局击败5个不同Boss', icon: 'B5', tier: 'elite' },
  { id: 'boss_8_run', name: '全首领图鉴', desc: '单局击败全部8种Boss', icon: 'B8', tier: 'mythic' },
  { id: 'speed_120', name: '疾风迅雷', desc: '在120秒内通关第5波', icon: 'S120', tier: 'elite' },
  { id: 'speed_90', name: '时间裂隙', desc: '在90秒内通关第5波', icon: 'S90', tier: 'mythic' },
  { id: 'hardcore_wave10', name: '深渊哨兵', desc: '梦魇难度到达第10波', icon: 'NM10', tier: 'mythic' },
  { id: 'clear_all_diff', name: '全难度制霸', desc: '通关全部难度', icon: 'CAD', tier: 'mythic' },
  { id: 'no_hit_wave10', name: '无尘圣巡', desc: '无伤到达第10波', icon: 'NH10', tier: 'mythic' },
  { id: 'daily_10', name: '日课常驻', desc: '累计完成10次每日挑战目标', icon: 'D10', tier: 'elite' },
  { id: 'fusion_all', name: '融合全典', desc: '完成全部融合协议', icon: 'FAL', tier: 'mythic' },
  { id: 'elite_50', name: '精英灭绝令', desc: '单局消灭50个精英敌人', icon: 'E50', tier: 'mythic' },
  { id: 'lab_max_tank', name: '究极造机', desc: '任意坦克达到最高级强化', icon: 'LMT', tier: 'mythic' },
  // === More achievements ===
  { id: 'score_200k', name: '碎月神话', desc: '单局得分达到200000', icon: 'S2M', tier: 'mythic' },
  { id: 'wave_60', name: '灰域尽头', desc: '到达第60波', icon: 'W60', tier: 'mythic' },
  { id: 'wave_75', name: '永夜绝笔', desc: '到达第75波', icon: 'W75', tier: 'mythic' },
  { id: 'combo_150', name: '弹幕启示录', desc: '达成150连击', icon: 'C15', tier: 'mythic' },
  { id: 'kills_10000', name: '月面终焉', desc: '累计消灭10000个敌人', icon: 'K10', tier: 'mythic' },
  { id: 'endless_30', name: '无尽行刑者', desc: '无尽模式到达第30波', icon: 'E30', tier: 'elite' },
  { id: 'endless_50', name: '无尽征服者', desc: '无尽模式到达第50波', icon: 'E50W', tier: 'mythic' },
  { id: 'one_run_3boss', name: '三连屠戮', desc: '单局无伤击败3个不同Boss', icon: 'B3N', tier: 'mythic' },
  { id: 'modifier_10_stack', name: '十重圣礼', desc: '单局持有10个以上的局内改造', icon: 'M10', tier: 'elite' },
  { id: 'modifier_20_stack', name: '二十重加护', desc: '单局持有20个以上的局内改造', icon: 'M20S', tier: 'mythic' },
  { id: 'evolve_twice', name: '二度进化', desc: '任意坦克进化2次', icon: 'EV2', tier: 'elite' },
  { id: 'one_life_clear', name: '一条命', desc: '全程不损失生命通关任意难度', icon: '1LC', tier: 'mythic' },
  { id: 'bullet_hell_survivor', name: '弹幕幸存者', desc: '单局承受500发敌方子弹未被命中', icon: 'BHS', tier: 'mythic' },
  { id: 'poverty_run', name: '清贫行者', desc: '不拾取任何道具到达第5波', icon: 'POV', tier: 'elite' },
  { id: 'rich_run', name: '贪婪远征', desc: '单局拾取80个道具', icon: 'RCH', tier: 'mythic' },
  { id: 'boss_speed_kill', name: '速杀令', desc: 'Boss出场后30秒内击杀', icon: 'BSK', tier: 'elite' },
  { id: 'boss_phase_skip', name: '阶段跨越', desc: '在Boss进入二阶段前将其击杀', icon: 'BPS', tier: 'mythic' },
  { id: 'moonstone_2000', name: '月面巨贾', desc: '持有2000个月光石', icon: 'M2K', tier: 'elite' },
  { id: 'moonstone_5000', name: '灰域富豪', desc: '持有5000个月光石', icon: 'M5K', tier: 'mythic' },
  { id: 'chest_10', name: '宝箱猎人', desc: '单局开启10个宝箱', icon: 'CH10', tier: 'elite' },
  { id: 'chest_20', name: '宝箱之王', desc: '单局开启20个宝箱', icon: 'CH20', tier: 'mythic' },
  { id: 'first_try_clear', name: '初见杀', desc: '首次使用新解锁坦克即通关第5波', icon: 'FTC', tier: 'elite' },
  { id: 'perfect_daily', name: '完美日课', desc: '每日挑战中达成所有隐藏条件', icon: 'PDY', tier: 'mythic' },
  { id: 'research_max_all', name: '全域解锁', desc: '全部全局研究协议达到上限', icon: 'RMA', tier: 'mythic' },
];

const ACHIEVEMENT_LORE = {
  first_blood: '档案里称它为“第一次回声”。每个驾驶员都从这里开始确认，炮火真的会改变世界。',
  sharpshooter: '观测员在弹孔之间画出细线，像一张临时星图。没有一颗星属于和平年代。',
  tank_hunter: '灰域广播会把这类战绩读三遍。不是为了庆祝，而是提醒幸存者还有人活着。',
  battle_veteran: '老兵的编号不会写在墓碑上，只写在维修清单里。因为他们总是先修车，再谈伤口。',
  survivor: '第五关之后，驾驶舱里的空气会变得很薄。能继续呼吸，本身就是一种技术。',
  tenacious: '第十关的记录被称为“拒绝撤退”。圣城从不承认这是勇气，只承认这是资源消耗。',
  score_500: '第一次高分会被终端存入金色缓存。研究室说那不是奖励，是继续观察的理由。',
  score_2000: '分数越高，战术终端越安静。它已经不需要鼓励你，只需要统计你。',
  score_5000: '王冠不是戴在头上的，而是压在履带下的。它越闪亮，战场越黑。',
  hardcore: '困难模式会关闭许多保护协议。剩下的那些，也只是礼貌地延迟失败。',
  flawless: '弹片擦过装甲却没有留下痕迹。机装研究室把这种偶然称为“神圣偏差”。',
  tank_spread_win: '扩散弹幕像一把打开的扇。灰域孩子说，那是坦克在替月亮撒花。',
  tank_focus_win: '集中型不相信祈祷，只相信一条直线。直线尽头，通常有人来不及后悔。',
  tank_wide_win: '广域火力会把战场切成扇形沉默区。敌人不是被击毁，是被命令不得靠近。',
  tank_burst_win: '爆裂型驾驶员总说爆炸也有构图。记录员没有反驳，只把废墟拍了下来。',
  tank_sniper_win: '狙击型的每次命中都像一次签名。被签上的目标，不再需要名字。',
  tank_homing_win: '追踪弹会在废城间绕行，像有自己的记忆。它们迟到，但从不失约。',
  tank_border_win: '境界型不会撞开墙，它会让墙短暂忘记自己是墙。观测站称这种失忆为战术窗口。',
  tank_blade_win: '斩魂型驶过战线时，雷达只记录到两道寒光。驾驶员说那不是速度，是犹豫被切断了。',
  tank_scarlet_win: '红枪型每次开火都像在签署血色契约。契约内容很短：命中，偿还，继续前进。',
  tank_astral_win: '星仪型把炮火排成缓慢的天体。敌人以为自己在追逐坦克，其实早已进入轨道。',
  combo_20: '连击数字升高时，终端会短暂发热。有人说那是月光石在兴奋。',
  elite_hunter: '每个精英单位都有独立葬送协议。猎手的工作，是让协议来不及启动。',
  speed_demon: '三分钟内穿过五波战线，像把战场撕开一道口子。风会先一步逃出去。',
  powerup_collector: '收集模块的人常被误认为贪婪。其实他们只是知道，下一秒可能什么都缺。',
  mine_dodger: '未触发的地雷也会被记录。灰域相信，真正的好运应该写进军功章里。',
  wave_15: '第十五波之后，地图边缘开始重复。不是你在前进，是战场不肯结束。',
  perfect_run: '没有受伤的记录最不可信。因为每个完美故事，都像被谁偷偷修过。',
  score_10000: '一万分时，终端会显示一行旧时代乱码。研究室翻译成：继续。',
  score_20000: '两万分记录会被上传到碎月链路。没有人知道链路另一端是否还有接收者。',
  wave_20: '第二十波的幸存者会看见更远的雾。雾里不是终点，只是另一段战线。',
  wave_25: '第二十五波被称为“长夜中段”。能走到这里的人，已经不再问黎明在哪。',
  combo_35: '三十五连击像一段急促祷词。每个音节都由炮口发出。',
  combo_50: '五十连击会让弹道形成短暂合唱。那不是音乐，是幸存者的心跳被放大了。',
  elite_hunter_25: '二十五个精英编号被划掉后，清算者会获得新的空白名单。名单很长。',
  powerup_collector_40: '四十次拾取会让机体像拼接圣像。每一块零件都来自不同的灾难。',
  fragment_500: '五百枚月光石足够点亮一座小礼拜堂。也足够把它再次炸平。',
  fragment_1000: '一千枚月光石会吸引研究室的注意。注意，有时比敌人更危险。',
  all_tanks_unlocked: '十种机体列入同一名册时，终端会生成一份不存在的部队番号。编号末尾没有句号。',
  upgrade_apprentice: '十次强化后，驾驶员开始听懂维修员的沉默。那是另一种战场语言。',
  upgrade_master: '三十次强化不是熟练，而是妥协。每一次拧紧螺栓，都在放弃一点旧人类。',
  evolution_first: '第一次进化会让机体短暂失声。仿佛有什么新东西在内部学会呼吸。',
  evolution_six: '六次进化记录合并时，屏幕上会出现花的形状。研究室立刻把它归类为武器。',
  daily_clear: '每日目标来自一台早已离线的调度机。它仍准时发布命令，像世界还完整。',
  nightmare_survivor: '梦魇难度的第五关没有祝贺语。只有一段静默，长得像追悼。',
  boss_witness: '第一次看见首领时，雷达会慢半拍。机器也需要一点时间理解恐惧。',
  boss_breaker: '第十二波之后，Boss不再像敌人，更像灾害。破城者学会向灾害开火。',
  untouched_combo: '十五连击且未受伤，像在弹雨中完成一段仪式。圣城拒绝承认这不是神迹。',
  wave_30: '第三十波之后，夜色不再变深。因为记录员已经找不到比“长夜”更黑的词。',
  score_30000: '三万分会被刻入碎月链路的冷备份。即使终端烧毁，这串数字也会继续发光。',
  combo_75: '七十五连击像一次审判，弹道在空中排成圣裁纹章。敌人只来得及听见结论。',
  elite_hunter_40: '四十个精英信标熄灭后，灰域会短暂安静。那不是和平，只是敌方在重新点名。',
  fusion_first: '第一次融合协议启动时，机体会发出不属于任何工厂的钟声。研究室称其为可控异常。',
  modifier_reroll: '第一次重掷授权会在终端留下细小烧痕。研究室说那是概率被强行拧动时，齿轮向月光石讨价还价的声音。',
  modifier_full_reroll: '四个槽位同时洗牌时，驾驶舱会短暂失去方向感。有人称那一秒看见了四条战线，也有人只记得自己还活着。',
  modifier_mythic: 'MYTHIC协议不会询问驾驶员是否准备好。它只在屏幕上点亮金色编号，然后把不该属于凡人的余量塞进机体。',
  modifier_treasury: '月石回流并非奖励，而是战场承认你仍有投资价值。圣城财务官从不欢呼，他们只把你的编号移到更危险的一栏。',
  modifier_jackpot: '四联同调被列为罕见神迹，机装研究室却坚持称其为统计异常。无论名字如何，四张卡同时落锁时，战场会安静半拍。',
  global_research_first: '第一条全局协议被点亮时，研究室没有鼓掌。所有人都知道，从这一刻开始，机体不再只是某一台机体。',
  global_research_10: '十条协议叠成圣城总纲，像一部写给钢铁的律法。驾驶员只读到第一页，就听见整座研究室开始低声运转。',
  global_research_max: '任意协议抵达上限后，终端会短暂显示“全域整备”。那不是完成通知，而是一句更大的命令正在加载。',
};

const ACHIEVEMENT_TIERS = {
  standard: { label: 'STANDARD', className: 'standard', color: '#7f92aa', reward: 40 },
  elite: { label: 'ELITE', className: 'elite', color: '#f49800', reward: 90 },
  mythic: { label: 'MYTHIC', className: 'myth', color: '#f6e5aa', reward: 160 },
};

const STORAGE_KEY = 'tankbattle_achievements';
const UNLOCK_KEY = 'tankbattle_unlocks';
const ACHIEVEMENT_REWARD_KEY = 'tankbattle_achievement_rewards_claimed';
let unlockedAchievements = new Set();
let unlockedDifficulties = new Set(['easy']);
let claimedAchievementRewards = new Set();

function loadAchievements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) unlockedAchievements = new Set(JSON.parse(raw));
  } catch(e) { unlockedAchievements = new Set(); }
}

function saveAchievements() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlockedAchievements]));
  } catch(e) {}
}

function loadAchievementRewards() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENT_REWARD_KEY);
    claimedAchievementRewards = raw ? new Set(JSON.parse(raw)) : new Set();
  } catch(e) { claimedAchievementRewards = new Set(); }
}

function saveAchievementRewards() {
  try {
    localStorage.setItem(ACHIEVEMENT_REWARD_KEY, JSON.stringify([...claimedAchievementRewards]));
  } catch(e) {}
}

function inferAchievementTier(def) {
  if (def && def.tier && ACHIEVEMENT_TIERS[def.tier]) return def.tier;
  const reward = (def && def.reward) || 0;
  if (reward >= 26) return 'mythic';
  if (reward >= 14) return 'elite';
  return 'standard';
}

function getAchievementTier(def) {
  return ACHIEVEMENT_TIERS[inferAchievementTier(def)] || ACHIEVEMENT_TIERS.standard;
}

function getAchievementReward(def) {
  return getAchievementTier(def).reward;
}

function getAchievementIndex(id) {
  return Math.max(0, achievementsDef.findIndex(a => a.id === id));
}

function getAchievementCode(def) {
  const idx = getAchievementIndex(def.id) + 1;
  return 'ACH-' + String(idx).padStart(2, '0');
}

function getAchievementRarity(def) {
  return getAchievementTier(def);
}

function getAchievementSeal(def) {
  const clean = String(def.id || 'ach').replace(/[^a-z0-9]/gi, '').toUpperCase();
  const first = clean[0] || 'A';
  const last = clean[Math.max(0, clean.length - 1)] || 'H';
  return first + last;
}

function getAchievementToastIcon(def) {
  if (!def) return 'ACH';
  return getAchievementCode(def).replace('ACH-', 'A');
}

function showAchievementToast(icon, name, label, accent) {
  const toast = document.getElementById('achieve-toast');
  toast.querySelector('.achieve-icon').textContent = icon;
  const nameEl = toast.querySelector('.achieve-name');
  nameEl.textContent = name;
  nameEl.style.color = accent || '';
  toast.querySelector('.achieve-label').textContent = label || '';
  toast.style.display = 'block';
  toast.style.animation = 'none';
  toast.offsetHeight;
  toast.style.animation = 'toastIn 0.4s ease-out';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.display = 'none';
    nameEl.style.color = '';
  }, 3000);
}

function claimAchievementReward(id) {
  const def = achievementsDef.find(a => a.id === id);
  if (!def || !unlockedAchievements.has(id) || claimedAchievementRewards.has(id)) return;
  const reward = getAchievementReward(def);
  coreFragments += reward;
  claimedAchievementRewards.add(id);
  saveAchievementRewards();
  saveProgression();
  checkAchievements();
  sfxAchievement();
  showAchievementToast(getAchievementToastIcon(def), '成就奖励已领取', def.name + ' +' + reward + ' 月光石', '#f6e5aa');
  renderAchievements();
}

function loadUnlocks() {
  try {
    const raw = localStorage.getItem(UNLOCK_KEY);
    if (raw) unlockedDifficulties = new Set(JSON.parse(raw));
    else unlockedDifficulties = new Set(['easy']);
  } catch(e) { unlockedDifficulties = new Set(['easy']); }
}

function saveUnlocks() {
  try {
    localStorage.setItem(UNLOCK_KEY, JSON.stringify([...unlockedDifficulties]));
  } catch(e) {}
}

function checkDifficultyUnlock() {
  const currentIdx = DIFFICULTY_ORDER.indexOf(currentDifficulty);
  if (currentIdx >= 0 && currentIdx < DIFFICULTY_ORDER.length - 1) {
    const nextDiff = DIFFICULTY_ORDER[currentIdx + 1];
    if (!unlockedDifficulties.has(nextDiff) && score >= difficultySettings[nextDiff].unlockScore) {
      unlockedDifficulties.add(nextDiff);
      saveUnlocks();
      const toast = document.getElementById('achieve-toast');
      toast.querySelector('.achieve-icon').textContent = 'KEY';
      toast.querySelector('.achieve-name').textContent = '新难度解锁!';
      toast.querySelector('.achieve-label').textContent = difficultySettings[nextDiff].label + ' 模式已解锁';
      toast.style.display = 'block';
      toast.style.animation = 'none';
      toast.offsetHeight;
      toast.style.animation = 'toastIn 0.4s ease-out';
      clearTimeout(toast._timeout);
      toast._timeout = setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }
  }
  // Cascade unlock: also unlock all lower difficulties
  for (let i = 1; i < DIFFICULTY_ORDER.length; i++) {
    const prev = DIFFICULTY_ORDER[i - 1];
    const curr = DIFFICULTY_ORDER[i];
    if (unlockedDifficulties.has(prev) && !unlockedDifficulties.has(curr)) {
      // Don't auto-unlock; requires reaching the score threshold
    }
  }
}

function unlockAchievement(id) {
  if (unlockedAchievements.has(id)) return;
  unlockedAchievements.add(id);
  saveAchievements();
  const def = achievementsDef.find(a => a.id === id);
  if (!def) return;
  sfxAchievement();
  showAchievementToast(getAchievementToastIcon(def), def.name, '已完成 · 可领取 +' + getAchievementReward(def) + ' 月光石');
}

// --- Achievement tracking ---
let sessionKills = 0;
let gotHitThisLevel = false;
let sessionEliteKills = 0;
let sessionPowerUpsCollected = 0;
let sessionMinesTriggered = false;
let sessionStartTime = 0;
let maxComboReached = 0;
let sessionGotHit = false;
let sessionModifierChoices = 0;
let sessionModifierRerolls = 0;
let sessionModifierMythics = 0;
let sessionModifierTokenClaims = 0;
let sessionModifierJackpots = 0;
let runReport = null;
let runFrameCount = 0;
const BOSS_BALANCE_DEBUG_KEY = 'tankbattle_boss_balance_debug';
const BOSS_BALANCE_DEBUG_LIMIT = 16;

function createRunReport() {
  return {
    startTime: Date.now(),
    endTime: 0,
    difficulty: currentDifficulty,
    tank: currentTankType,
    mode: currentRunMode,
    victory: false,
    deathCause: '',
    shotsFired: 0,
    bulletsCreated: 0,
    playerHits: 0,
    enemyHitsTaken: 0,
    damageDealt: 0,
    damageTaken: 0,
    bulletClashes: 0,
    bulletClashWins: 0,
    bulletClashLosses: 0,
    bulletClashDraws: 0,
    bossEncounters: [],
    bossKills: 0,
    bossTimeFrames: 0,
    bossDamageDealt: 0,
    powerUps: {},
    fusions: [],
    chestsOpened: 0,
    moonstoneFromChests: 0,
    modifierPicks: [],
    rerollSpent: 0,
    peakEnemies: 0,
    peakBullets: 0,
    debugPersisted: false,
  };
}

function ensureRunReport() {
  if (!runReport) runReport = createRunReport();
  return runReport;
}

function formatFramesAsTime(frames) {
  const seconds = Math.max(0, Math.floor((frames || 0) / 60));
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins + ':' + String(secs).padStart(2, '0');
}

function formatMsAsTime(ms) {
  const seconds = Math.max(0, Math.floor((ms || 0) / 1000));
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins + ':' + String(secs).padStart(2, '0');
}

function recordShot(count) {
  const report = ensureRunReport();
  report.shotsFired++;
  report.bulletsCreated += Math.max(1, count || 1);
}

function recordPlayerHit(bullet) {
  const report = ensureRunReport();
  const dmg = Math.max(1, Math.ceil((bullet && bullet.damage) || 1));
  report.enemyHitsTaken++;
  report.damageTaken += dmg;
  report.deathCause = '敌方弹幕命中';
}

function recordEnemyHit(tank, bullet, damageDone) {
  if (!bullet || !bullet.fromPlayer) return;
  const dmg = Math.max(0, Math.ceil(damageDone != null ? damageDone : (bullet.damage || 1)));
  if (dmg <= 0) return;
  const report = ensureRunReport();
  report.playerHits++;
  report.damageDealt += dmg;
  if (tank && tank.bossDef) {
    report.bossDamageDealt += dmg;
    const entry = getActiveBossReportEntry(tank);
    if (entry) {
      entry.damageTaken += dmg;
      entry.lastHp = Math.max(0, Math.ceil(tank.hp || 0));
      entry.lowestHpPct = Math.min(entry.lowestHpPct, entry.maxHp > 0 ? Math.max(0, tank.hp || 0) / entry.maxHp : 1);
    }
  }
}

function recordPlayerDamageCause(cause) {
  const report = ensureRunReport();
  report.enemyHitsTaken++;
  report.damageTaken++;
  report.deathCause = cause || report.deathCause || '战场伤害';
}

function recordBossEncounter(bossDef, bossUnit) {
  const report = ensureRunReport();
  if (!bossDef) return;
  const entry = {
    id: 'boss-' + wave + '-' + report.bossEncounters.length + '-' + Math.floor((runFrameCount || 0) % 999999),
    name: bossDef.name,
    wave,
    difficulty: currentDifficulty,
    tank: currentTankType,
    playerLevelStart: level,
    playerLevelEnd: level,
    startFrame: runFrameCount || 0,
    durationFrames: 0,
    killed: false,
    maxHp: bossUnit ? Math.ceil(bossUnit.maxHp || bossUnit.hp || 0) : 0,
    lastHp: bossUnit ? Math.max(0, Math.ceil(bossUnit.hp || 0)) : 0,
    damageTaken: 0,
    lowestHpPct: 1,
    phasesReached: [bossDef.phases && bossDef.phases[0] ? bossDef.phases[0].name : 'Phase 1'],
    endReason: 'active',
  };
  if (bossUnit) bossUnit.reportId = entry.id;
  report.bossEncounters.push(entry);
  return entry;
}

function getActiveBossReportEntry(bossUnit) {
  const report = ensureRunReport();
  if (!report.bossEncounters.length) return null;
  if (bossUnit && bossUnit.reportId) {
    const matched = report.bossEncounters.find(b => b.id === bossUnit.reportId);
    if (matched) return matched;
  }
  const bossName = bossUnit && bossUnit.bossDef ? bossUnit.bossDef.name : null;
  return [...report.bossEncounters].reverse().find(b => !b.killed && (!bossName || b.name === bossName)) || null;
}

function finalizeBossReportEntry(entry, bossUnit, reason) {
  if (!entry || entry.endReason === 'killed') return;
  entry.durationFrames = Math.max(entry.durationFrames || 0, (runFrameCount || 0) - (entry.startFrame || 0));
  entry.playerLevelEnd = level;
  entry.endReason = reason || entry.endReason || 'ended';
  if (bossUnit) {
    entry.maxHp = Math.max(entry.maxHp || 0, Math.ceil(bossUnit.maxHp || 0));
    entry.lastHp = Math.max(0, Math.ceil(bossUnit.hp || 0));
    entry.lowestHpPct = Math.min(entry.lowestHpPct, entry.maxHp > 0 ? Math.max(0, bossUnit.hp || 0) / entry.maxHp : entry.lowestHpPct);
  }
}

function recordBossPhaseChange(bossUnit, phase) {
  const entry = getActiveBossReportEntry(bossUnit);
  if (!entry) return;
  const phaseName = phase && phase.name ? phase.name : 'Phase ' + ((bossUnit && bossUnit.currentPhase || 0) + 1);
  if (!entry.phasesReached.includes(phaseName)) entry.phasesReached.push(phaseName);
  entry.playerLevelEnd = level;
  entry.lastHp = Math.max(0, Math.ceil((bossUnit && bossUnit.hp) || 0));
  entry.lowestHpPct = Math.min(entry.lowestHpPct, entry.maxHp > 0 ? Math.max(0, bossUnit.hp || 0) / entry.maxHp : 1);
}

function recordBossKill(bossUnitOrName) {
  const report = ensureRunReport();
  const name = typeof bossUnitOrName === 'string' ? bossUnitOrName : bossUnitOrName?.bossDef?.name;
  report.bossKills++;
  const active = typeof bossUnitOrName === 'string'
    ? [...report.bossEncounters].reverse().find(b => b.name === name && !b.killed)
    : getActiveBossReportEntry(bossUnitOrName);
  if (active) {
    active.killed = true;
    finalizeBossReportEntry(active, typeof bossUnitOrName === 'string' ? null : bossUnitOrName, 'killed');
    active.endReason = 'killed';
    report.bossTimeFrames += active.durationFrames;
  }
}

function recordPowerUpPickup(p, fusion) {
  const report = ensureRunReport();
  if (p && p.type) report.powerUps[p.type] = (report.powerUps[p.type] || 0) + 1;
  if (fusion && fusion.name) report.fusions.push(fusion.name);
}

function recordChestOpened(isBoss, fragAmt) {
  const report = ensureRunReport();
  report.chestsOpened++;
  report.moonstoneFromChests += Math.max(0, Math.floor(fragAmt || 0));
}

function recordModifierPick(def, jackpot) {
  if (!def) return;
  const report = ensureRunReport();
  report.modifierPicks.push({
    name: def.name,
    rarity: def.rarity || 'standard',
    axis: def.axis || 'unknown',
    jackpot: !!jackpot,
  });
}

function recordRerollCost(cost) {
  const report = ensureRunReport();
  report.rerollSpent += Math.max(0, Math.floor(cost || 0));
}

function recordBulletClash(result) {
  const report = ensureRunReport();
  report.bulletClashes++;
  if (result > 0) report.bulletClashWins++;
  else if (result < 0) report.bulletClashLosses++;
  else report.bulletClashDraws++;
}

function updateRunReportPeaks() {
  if (!runReport) return;
  runReport.peakEnemies = Math.max(runReport.peakEnemies, enemies.length);
  runReport.peakBullets = Math.max(runReport.peakBullets, playerBullets.length + enemyBullets.length);
}

function finalizeActiveBossReports(reason) {
  if (!runReport || !runReport.bossEncounters.length) return;
  const activeBossUnits = enemies.filter(e => e && e.bossDef);
  runReport.bossEncounters.forEach(entry => {
    if (entry.killed || entry.endReason === 'killed') return;
    const bossUnit = activeBossUnits.find(e => e.reportId === entry.id) || activeBossUnits.find(e => e.bossDef && e.bossDef.name === entry.name);
    if (entry.endReason === 'active' || !entry.endReason) finalizeBossReportEntry(entry, bossUnit, reason || 'run_end');
  });
}

function buildBossBalanceDebugSnapshot(report) {
  return {
    version: 1,
    timestamp: new Date().toISOString(),
    mode: report.mode || currentRunMode,
    difficulty: report.difficulty,
    tank: report.tank,
    victory: !!report.victory,
    score,
    wave,
    level,
    damageDealt: report.damageDealt,
    bossDamageDealt: report.bossDamageDealt,
    bossKills: report.bossKills,
    bossEncounters: report.bossEncounters.map(b => ({
      name: b.name,
      wave: b.wave,
      difficulty: b.difficulty,
      tank: b.tank,
      killed: !!b.killed,
      durationSeconds: Number(((b.durationFrames || 0) / 60).toFixed(1)),
      maxHp: b.maxHp || 0,
      remainingHp: b.lastHp || 0,
      remainingHpPct: b.maxHp > 0 ? Number(((b.lastHp || 0) / b.maxHp).toFixed(3)) : 0,
      damageTaken: b.damageTaken || 0,
      playerLevelStart: b.playerLevelStart || 1,
      playerLevelEnd: b.playerLevelEnd || b.playerLevelStart || 1,
      phasesReached: b.phasesReached || [],
      endReason: b.endReason || 'unknown',
    })),
    modifierPicks: report.modifierPicks.map(m => ({ name: m.name, rarity: m.rarity, axis: m.axis, jackpot: !!m.jackpot })),
  };
}

function getBossBalanceDebugHistory() {
  try {
    return JSON.parse(localStorage.getItem(BOSS_BALANCE_DEBUG_KEY) || '[]') || [];
  } catch(e) {
    return [];
  }
}

function persistBossBalanceDebug(report) {
  if (!report || report.debugPersisted || !report.bossEncounters.length) return;
  try {
    const history = getBossBalanceDebugHistory();
    history.unshift(buildBossBalanceDebugSnapshot(report));
    localStorage.setItem(BOSS_BALANCE_DEBUG_KEY, JSON.stringify(history.slice(0, BOSS_BALANCE_DEBUG_LIMIT)));
    report.debugPersisted = true;
  } catch(e) {}
}

if (typeof window !== 'undefined') {
  window.getBossBalanceDebug = getBossBalanceDebugHistory;
  window.clearBossBalanceDebug = function() {
    try { localStorage.removeItem(BOSS_BALANCE_DEBUG_KEY); } catch(e) {}
    return [];
  };
}

function getRunReportAdvice(report) {
  if (!report) return 'NO DATA';
  if (report.victory) return '战线完成，建议复盘 Boss 耗时与升级路径。';
  if (report.deathCause && report.deathCause.includes('弹幕')) return '死因为弹幕命中，后续可优先选择移速、弹速拦截或护盾类协议。';
  if (report.deathCause && report.deathCause.includes('撞击')) return '死因为近距离压迫，建议提高安全距离并优先处理高速单位。';
  if (report.deathCause && report.deathCause.includes('地雷')) return '死因为地雷，建议留意地面红色核心并降低追击贪刀。';
  if (report.enemyHitsTaken >= 6) return '承伤偏高，下一局可优先补生存或装填节奏。';
  if (report.shotsFired > 0 && report.playerHits / report.shotsFired < 0.38) return '命中效率偏低，建议选择弹速、追踪或更稳的射击窗口。';
  return '战斗数据稳定，下一步可尝试更高难度或不同机体构筑。';
}

function renderRunReport(victory) {
  const el = document.getElementById('run-report');
  if (!el) return;
  const report = ensureRunReport();
  finalizeActiveBossReports(victory ? 'victory' : 'run_end');
  report.endTime = report.endTime || Date.now();
  report.victory = !!victory;
  persistBossBalanceDebug(report);
  const duration = formatMsAsTime(report.endTime - report.startTime);
  const accuracy = report.shotsFired > 0 ? Math.round((report.playerHits / report.shotsFired) * 100) : 0;
  const bossNames = report.bossEncounters.map(b => {
    const hpPct = b.maxHp > 0 ? Math.max(0, Math.round((b.lastHp || 0) / b.maxHp * 100)) : 0;
    const state = b.killed ? 'KILL' : 'LEFT ' + hpPct + '%';
    return b.name + ' ' + state + ' / ' + formatFramesAsTime(b.durationFrames);
  }).slice(-4);
  const topPowerUps = Object.entries(report.powerUps)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => name + ' x' + count);
  const topMods = report.modifierPicks.slice(-5).map(m => (m.jackpot ? '四联:' : '') + m.name);
  const advice = getRunReportAdvice(report);
  el.innerHTML = `<div class="report-head">
    <div>
      <div class="report-kicker">TACTICAL BLACK BOX</div>
      <div class="report-title">战术黑匣子 / 本局战报</div>
    </div>
    <div class="report-verdict">${report.mode === 'endless' ? 'ENDLESS' : (victory ? 'CLEAR' : 'FAILED')} / ${escapeHtml(difficultySettings[report.difficulty]?.label || report.difficulty)}</div>
  </div>
  <div class="report-grid">
    <div class="report-cell"><div class="report-label">作战时长</div><div class="report-value accent">${duration}</div></div>
    <div class="report-cell"><div class="report-label">推进波次</div><div class="report-value">WAVE ${wave}</div></div>
    <div class="report-cell"><div class="report-label">击杀记录</div><div class="report-value">${sessionKills} / E${sessionEliteKills}</div></div>
    <div class="report-cell"><div class="report-label">最大连击</div><div class="report-value accent">${maxComboReached}</div></div>
    <div class="report-cell"><div class="report-label">射击命中</div><div class="report-value">${accuracy}%</div></div>
    <div class="report-cell"><div class="report-label">造成伤害</div><div class="report-value">${report.damageDealt}</div></div>
    <div class="report-cell"><div class="report-label">承受伤害</div><div class="report-value">${report.damageTaken}</div></div>
    <div class="report-cell"><div class="report-label">弹幕对撞</div><div class="report-value">${report.bulletClashes}</div></div>
  </div>
  <div class="report-columns">
    <div class="report-panel"><strong>终局原因</strong><span>${escapeHtml(victory ? '难度通关' : (report.deathCause || '机体失去响应'))}</span><span>${escapeHtml(advice)}</span></div>
    <div class="report-panel"><strong>Boss 档案</strong><span>${escapeHtml(bossNames.join(' / ') || '本局未遭遇 Boss')}</span><span>Boss耗时 ${formatFramesAsTime(report.bossTimeFrames)} / 击破 ${report.bossKills}</span></div>
    <div class="report-panel"><strong>补给与资源</strong><span>${escapeHtml(topPowerUps.join(' / ') || '未记录补给')}</span><span>宝箱 ${report.chestsOpened} / 宝箱MS +${report.moonstoneFromChests} / 融合 ${report.fusions.length}</span></div>
    <div class="report-panel"><strong>局内构筑</strong><span>${escapeHtml(topMods.join(' / ') || '未选择局内改造')}</span><span>刷新 ${sessionModifierRerolls} 次 / 消耗 ${report.rerollSpent} MS</span></div>
  </div>`;
}

function getTotalTankUpgradeCount() {
  return Object.values(tankUpgrades || {}).reduce((total, group) => {
    return total + Object.values(group || {}).reduce((sum, value) => sum + (parseInt(value) || 0), 0);
  }, 0);
}

function getTotalEvolutionCount() {
  return [...(evolvedTanks || new Set())].reduce((total, entry) => {
    const parts = String(entry).split(':');
    const levelText = parts.length > 1 ? parts[1] : '1';
    return total + (parseInt(levelText) || 1);
  }, 0);
}

function checkAchievements() {
  if (sessionKills >= 1) unlockAchievement('first_blood');
  if (sessionKills >= 10) unlockAchievement('sharpshooter');
  if (sessionKills >= 50) unlockAchievement('tank_hunter');
  if (sessionKills >= 100) unlockAchievement('battle_veteran');
  if (wave >= 5) unlockAchievement('survivor');
  if (wave >= 10) unlockAchievement('tenacious');
  if (wave >= 15) unlockAchievement('wave_15');
  if (score >= 500) unlockAchievement('score_500');
  if (score >= 2000) unlockAchievement('score_2000');
  if (score >= 5000) unlockAchievement('score_5000');
  if (score >= 10000) unlockAchievement('score_10000');
  if (score >= 20000) unlockAchievement('score_20000');
  if (score >= 30000) unlockAchievement('score_30000');
  if (currentDifficulty === 'hard' && wave >= 5) unlockAchievement('hardcore');
  if (currentDifficulty === 'nightmare' && wave >= 5) unlockAchievement('nightmare_survivor');
  if (maxComboReached >= 20) unlockAchievement('combo_20');
  if (maxComboReached >= 35) unlockAchievement('combo_35');
  if (maxComboReached >= 50) unlockAchievement('combo_50');
  if (maxComboReached >= 75) unlockAchievement('combo_75');
  if (sessionEliteKills >= 10) unlockAchievement('elite_hunter');
  if (sessionEliteKills >= 25) unlockAchievement('elite_hunter_25');
  if (sessionEliteKills >= 40) unlockAchievement('elite_hunter_40');
  if (sessionPowerUpsCollected >= 20) unlockAchievement('powerup_collector');
  if (sessionPowerUpsCollected >= 40) unlockAchievement('powerup_collector_40');
  if (coreFragments >= 500) unlockAchievement('fragment_500');
  if (coreFragments >= 1000) unlockAchievement('fragment_1000');
  if (sessionModifierRerolls >= 1) unlockAchievement('modifier_reroll');
  if (sessionModifierMythics >= 1) unlockAchievement('modifier_mythic');
  if (sessionModifierTokenClaims >= 1) unlockAchievement('modifier_treasury');
  if (sessionModifierJackpots >= 1) unlockAchievement('modifier_jackpot');
  if (wave >= 4) unlockAchievement('boss_witness');
  if (wave >= 12) unlockAchievement('boss_breaker');
  if (wave >= 20) unlockAchievement('wave_20');
  if (wave >= 25) unlockAchievement('wave_25');
  if (wave >= 30) unlockAchievement('wave_30');
  if (!sessionGotHit && maxComboReached >= 15) unlockAchievement('untouched_combo');
  if (dailyTargetAchieved) unlockAchievement('daily_clear');
  if (Object.keys(tankTypes).every(k => unlockedTanks.has(k))) unlockAchievement('all_tanks_unlocked');
  const totalUpgrades = getTotalTankUpgradeCount();
  if (totalUpgrades >= 10) unlockAchievement('upgrade_apprentice');
  if (totalUpgrades >= 30) unlockAchievement('upgrade_master');
  const totalEvolutions = getTotalEvolutionCount();
  if (totalEvolutions >= 1) unlockAchievement('evolution_first');
  if (totalEvolutions >= 6) unlockAchievement('evolution_six');
  const globalResearchTotal = getGlobalResearchTotalLevel();
  if (globalResearchTotal >= 1) unlockAchievement('global_research_first');
  if (globalResearchTotal >= 10) unlockAchievement('global_research_10');
  if (GLOBAL_RESEARCH_DEFS.some(def => getGlobalResearchLevel(def.id) >= def.max)) unlockAchievement('global_research_max');
  if (wave >= 5) {
    const tankAch = {spread:'tank_spread_win',focus:'tank_focus_win',wide:'tank_wide_win',burst:'tank_burst_win',sniper:'tank_sniper_win',homing:'tank_homing_win',border:'tank_border_win',blade:'tank_blade_win',scarlet:'tank_scarlet_win',astral:'tank_astral_win'};
    if (tankAch[currentTankType]) unlockAchievement(tankAch[currentTankType]);
    if (!sessionGotHit) unlockAchievement('perfect_run');
    if (!sessionMinesTriggered) unlockAchievement('mine_dodger');
    if (sessionStartTime > 0 && (Date.now() - sessionStartTime) / 1000 < 180) unlockAchievement('speed_demon');
  }
  checkDifficultyUnlock();
}

function onLevelUp() {
  if (!gotHitThisLevel) unlockAchievement('flawless');
  gotHitThisLevel = false;
  sfxLevelUp();
  showModifierChoice('level');
}

function getRunXpReward(enemy) {
  if (enemy && enemy.bossDef) return 120;
  if (enemy && enemy.isElite) return 42;
  return 18;
}

function addRunXp(amount) {
  if (!amount || difficultyCleared) return;
  runXp += amount * getGlobalRunXpMultiplier();
  updateRunXpHud();
  if (runXp >= xpToNext && document.getElementById('modifier-screen').style.display !== 'flex') {
    runXp -= xpToNext;
    level++;
    xpToNext = Math.floor(95 + level * 38 + level * level * 4.5);
    updateRunXpHud();
    onLevelUp();
    checkAchievements();
  }
}

function updateRunXpHud() {
  const xpEl = document.getElementById('xp');
  if (xpEl) xpEl.textContent = Math.floor(runXp) + '/' + xpToNext;
}

function resetAchievementTracking() {
  sessionKills = 0;
  gotHitThisLevel = false;
  sessionEliteKills = 0;
  sessionPowerUpsCollected = 0;
  sessionMinesTriggered = false;
  sessionStartTime = Date.now();
  maxComboReached = 0;
  sessionGotHit = false;
  sessionModifierChoices = 0;
  sessionModifierRerolls = 0;
  sessionModifierMythics = 0;
  sessionModifierTokenClaims = 0;
  sessionModifierJackpots = 0;
  runFrameCount = 0;
  runReport = createRunReport();
}

function onEnemyKilled(enemyOrElite) {
  const killedEnemy = typeof enemyOrElite === 'object' ? enemyOrElite : null;
  // Gemini rage: when one twin dies, the other enrages
  if (killedEnemy && killedEnemy.bossDef && killedEnemy.bossDef.name === '双子坦克') {
    const twin = killedEnemy.geminiTwin;
    if (twin && twin.alive) {
      twin.currentPhase = 1; // Force P2 rage mode
      twin.speed *= 2;
      twin.shootDelay = Math.max(20, Math.floor(twin.shootDelay * 0.5));
      twin.phaseFlash = 120;
      spawnExplosion(twin.x, twin.y, 30, '#a4f', '#f0f');
      triggerShake(6, 8);
      showWaveNotification('REVENGE', '双子·狂暴 — 弹幕密度三倍');
    }
  }
  const isElite = killedEnemy ? !!killedEnemy.isElite : !!enemyOrElite;
  const isBossKill = !!(killedEnemy && killedEnemy.bossDef);
  const nextBossKills = (tankUnlockProgress.bossKills || 0) + (isBossKill ? 1 : 0);
  if (isBossKill) recordBossKill(killedEnemy);
  sfxEnemyDestroyed(isElite, isBossKill);
  sessionKills++;
  if (isElite) sessionEliteKills++;
  // Faction salvage: graveyard enemies drop extra moonstone
  if (killedEnemy && killedEnemy.salvageDropChance && rng() < killedEnemy.salvageDropChance) {
    const salvageAmt = 3 + Math.floor(rng() * 6);
    coreFragments += salvageAmt;
    showAchievementToast('SALV', '灰域残骸回收', '+' + salvageAmt + ' MOONSTONE', '#9ca8ff');
  }
  updateTankUnlockProgress({
    maxEliteKills: sessionEliteKills,
    bossKills: nextBossKills,
    borderEcho: nextBossKills >= 2,
  }, false);
  waveEnemiesRemaining = Math.max(0, waveEnemiesRemaining - 1);
  addRunXp(getRunXpReward(killedEnemy));

  // Combo system
  comboCount++;
  if (comboCount > maxComboReached) maxComboReached = comboCount;
  comboTimer = COMBO_TIMEOUT;
  if (comboCount >= 5 && comboCount % 5 === 0) {
    const bonusPoints = Math.floor(comboCount * 10 * comboBonusMul);
    score += bonusPoints;
    sfxCombo(comboCount);
    const comboEl = document.getElementById('combo-display');
    document.getElementById('combo-text').textContent = comboCount + ' COMBO!';
    document.getElementById('combo-mult').textContent = '+' + bonusPoints + ' 奖励分';
    comboEl.classList.add('active');
    comboEl.style.animation = 'none';
    comboEl.offsetHeight;
    comboEl.style.animation = 'comboPulse 0.3s ease-out';
    clearTimeout(comboEl._timeout);
    comboEl._timeout = setTimeout(() => { comboEl.classList.remove('active'); }, 1800);
  } else if (comboCount >= 3) {
    const comboEl = document.getElementById('combo-display');
    document.getElementById('combo-text').textContent = comboCount + ' COMBO!';
    document.getElementById('combo-mult').textContent = '';
    comboEl.classList.add('active');
    clearTimeout(comboEl._timeout);
    comboEl._timeout = setTimeout(() => { comboEl.classList.remove('active'); }, 1200);
  }

  // Score + fragment drops
  const basePoints = isElite ? 300 : 100;
  let pts = buffs.double_score > 0 ? basePoints * 2 : basePoints;
  if (buffs.goldrush > 0) pts *= 2;
  score += pts;
  const baseFragGain = (isElite ? 3 : 1) * (buffs.goldrush > 0 ? 2 : 1);
  coreFragments += scaleBattleMoonstoneGain(baseFragGain, getSalvageResearchMultiplier());
  saveProgression();
  checkAchievements();
  if (buffs.vampire > 0 && player.alive) {
    player.hp = Math.min(player.hp + 1, player.maxHp);
    sfxStatus('drain');
  }
  if (playerRepairChance > 0 && player.alive && player.hp < player.maxHp && rng() < playerRepairChance) {
    player.hp = Math.min(player.maxHp, player.hp + 1);
    sfxStatus('repair');
  }
}

function showWaveNotification(text, sub) {
  document.getElementById('wave-text').textContent = text;
  document.getElementById('wave-sub').textContent = sub || '';
  const el = document.getElementById('wave-notify');
  el.classList.add('show');
  waveNotificationTimer = 120;
  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => { el.classList.remove('show'); }, 2000);
  if (text.includes('清除')) sfxWaveClear();
}

function getDualModeEnemyMul() {
  return isDualMode ? 1.5 : 1.0;
}
function getWaveEnemyBudget(waveNo) {
  const diff = difficultySettings[currentDifficulty] || difficultySettings.normal;
  const base = Math.min(9, 2 + Math.floor(waveNo * 0.34) + Math.floor(waveNo * waveNo / 150));
  const dualMul = isDualMode ? 1.3 : 1.0;
  return Math.max(2, Math.floor(base * (diff.waveBudgetMul || 1) * dualMul));
}

const BOSS_WAVE_INTERVAL = 4;
function getBossArchiveFinalWave() {
  return BOSS_TYPES.length * BOSS_WAVE_INTERVAL;
}
function getBossWaveIndex(waveNo) {
  return waveNo >= BOSS_WAVE_INTERVAL && waveNo % BOSS_WAVE_INTERVAL === 0
    ? Math.floor(waveNo / BOSS_WAVE_INTERVAL) - 1
    : -1;
}
function isBossWaveNumber(waveNo) {
  return getBossWaveIndex(waveNo) >= 0;
}
function isBossArchiveWave(waveNo) {
  const idx = getBossWaveIndex(waveNo);
  return idx >= 0 && idx < BOSS_TYPES.length;
}
function getDifficultyClearWaveTarget(diff = difficultySettings[currentDifficulty] || difficultySettings.normal) {
  return Math.max(diff.clearWave || getBossArchiveFinalWave(), getBossArchiveFinalWave());
}
function getBossDuelHpMultiplier(waveNo = wave) {
  return currentRunMode === 'clear' && isBossArchiveWave(waveNo) ? 1.1 : 1;
}

function getBossSupportCount(waveNo) {
  if (isBossArchiveWave(waveNo)) return 0;
  if (waveNo <= getBossArchiveFinalWave()) return 0;
  const cap = currentRunMode === 'clear' ? 1 : 2;
  return Math.min(cap, 1 + Math.floor((waveNo - getBossArchiveFinalWave()) / 20));
}

function getWaveSpawnBurst(waveNo) {
  return Math.min(2, 1 + Math.floor(waveNo / 12));
}

function getWaveConcurrentEnemyCap() {
  const diff = difficultySettings[currentDifficulty] || difficultySettings.normal;
  const extra = diff.waveBudgetMul > 0.95 ? 1 : 0;
  return Math.min(5 + extra, 3 + Math.floor(wave / 9) + Math.floor(level / 11) + extra);
}

function getWaveSpawnRate(diff) {
  return Math.max(92, diff.spawnRate - wave * 3 - level * 2);
}

function selectBossForWave(waveNo) {
  const bossWaveIndex = getBossWaveIndex(waveNo);

  // Build pool: all bosses for archive, expanding pool for post-archive
  let pool = [...BOSS_TYPES];

  // Tier-based filtering by boss wave depth
  if (bossWaveIndex < 3) {
    // Waves 4, 8, 12: Tier 1 only (beginner bosses)
    pool = pool.filter(b => b.tier === 1);
  } else if (bossWaveIndex < 6) {
    // Waves 16, 20, 24: Tier 1 + Tier 2 (intermediate bosses)
    pool = pool.filter(b => b.tier <= 2);
  }
  // Waves 28+: all tiers (Tier 3 bosses join the pool)

  // Filter out last boss to avoid consecutive repeats
  if (lastBossName && pool.length > 1) {
    pool = pool.filter(b => b.name !== lastBossName);
  }

  // Clear mode: filter out already-seen bosses so each appears once
  if (currentRunMode === 'clear' && runBossesSeen.size > 0 && pool.length > 1) {
    const unseen = pool.filter(b => !runBossesSeen.has(b.name));
    if (unseen.length > 0) pool = unseen;
  }

  // Faction variety: prefer different faction from last boss
  const lastBoss = BOSS_TYPES.find(b => b.name === lastBossName);
  if (lastBoss && pool.length > 1) {
    const factionShift = pool.filter(b => b.faction !== lastBoss.faction);
    if (factionShift.length > 0) pool = factionShift;
  }

  return pool[Math.floor(rng() * pool.length)] || BOSS_TYPES[0];
}

function getRequiredBossDefeats() {
  const diff = difficultySettings[currentDifficulty] || difficultySettings.normal;
  return diff.bossRequired || 5;
}
function hasSeenAllRunBosses() {
  return runBossesSeen.size >= getRequiredBossDefeats();
}

function shouldClearDifficulty() {
  const diff = difficultySettings[currentDifficulty] || difficultySettings.normal;
  return currentRunMode === 'clear' && !isDailyChallenge && wave >= getDifficultyClearWaveTarget(diff) && hasSeenAllRunBosses();
}

function getEndingStory() {
  const diff = difficultySettings[currentDifficulty] || difficultySettings.normal;
  const seen = [...runBossesSeen].join('、') || '无记录';
  return '第' + wave + '波之后，灰域的雷达第一次没有回声。' +
    diff.label + '难度的五项首领档案已归档：' + seen +
    '。机装研究室没有宣布胜利，只在终端写下：月面仍在远处发光，但这一次，它没有立刻吞下你。';
}

function clearDifficulty() {
  if (difficultyCleared) return;
  difficultyCleared = true;
  const runId = activeRunId;
  updateTankUnlockProgress({ borderEcho: true, maxWave: wave }, false);
  saveProgression();
  showWaveNotification('难 度 通 关', difficultySettings[currentDifficulty].label + '战线已完成，首领档案归档');
  const idx = DIFFICULTY_ORDER.indexOf(currentDifficulty);
  if (idx >= 0 && idx < DIFFICULTY_ORDER.length - 1) {
    unlockedDifficulties.add(DIFFICULTY_ORDER[idx + 1]);
    saveUnlocks();
  }
  if (pendingEndGameTimer) clearTimeout(pendingEndGameTimer);
  pendingEndGameTimer = setTimeout(() => {
    pendingEndGameTimer = null;
    if (runId !== activeRunId) return;
    endGame(true, runId);
  }, 650);
}

function startNextWave() {
  wave++;
  weatherOverridden = false;
  initWeather();
  if (wave > 1 && obstacles.length > 0) refreshObstacles();
  updateTankUnlockProgress({
    maxWave: wave,
    borderEcho: wave >= 12,
  }, true);
  // Earn fragments for previous wave clear
  if (wave > 1) earnFragments(wave + 1);

  // Boss wave every 4 waves (starting from wave 4)
  if (isBossWaveNumber(wave)) {
    isBossWave = true;
    startBossMusic();
    const bossDef = selectBossForWave(wave);
    lastBossName = bossDef.name;
    runBossesSeen.add(bossDef.name);
    const bossSpawn = findSafeTankSpawn({
      w: 54, h: 54, minPlayerDist: 210,
      preferred: [
        { x: W/2, y: H/3 }, { x: W/2, y: H*0.26 },
        { x: W*0.33, y: H*0.28 }, { x: W*0.67, y: H*0.28 },
      ],
    });
    const bossSupportCount = getBossSupportCount(wave);
    waveEnemiesTotal = 1 + bossSupportCount;
    waveEnemiesRemaining = 1 + bossSupportCount;
    waveEnemiesToSpawn = bossSupportCount;
    wavePause = 0; spawnTimer = 0;
    // Trigger warning phase (2 seconds)
    bossWarningTimer = 120;
    bossWarningDef = bossDef;
    bossWarningSpawn = bossSpawn;
    showWaveNotification('WARNING', bossDef.name + ' 即将进入战场');
    return;
  }

  if (isBossWave) {
    spawnChest(W/2 + (rng()-0.5)*200, H/2 + (rng()-0.5)*100, true);
    isBossWave = false;
    startMusic(); // Back to combat after boss
  }
  bossRef = null;
  const enemiesPerWave = getWaveEnemyBudget(wave);
  waveEnemiesTotal = enemiesPerWave;
  waveEnemiesRemaining = enemiesPerWave;
  waveEnemiesToSpawn = enemiesPerWave;
  wavePause = 0;
  const firstBurst = Math.min(getWaveSpawnBurst(wave), waveEnemiesToSpawn, getWaveConcurrentEnemyCap());
  for (let i = 0; i < firstBurst; i++) {
    if (spawnEnemy()) waveEnemiesToSpawn = Math.max(0, waveEnemiesToSpawn - 1);
  }
  spawnTimer = 0;
  const sub = (wave % 3 === 0) ? '补给时间! 收集道具准备下一波' : '准备迎战!';
  showWaveNotification('第 ' + wave + ' 波', sub);
}

// --- Power-ups ---
const ITEM_TIER_CONFIG = {
  basic: { weight: 68, durationMul: 0.9, descSuffix: ' [I]', glowColor: null, size: 10, label: 'T1 基础模块', code: 'T1' },
  advanced: { weight: 25, durationMul: 1.12, descSuffix: ' [II]', glowColor: '#6af', size: 12, label: 'T2 强化模块', code: 'T2' },
  relic: { weight: 7, durationMul: 1.35, descSuffix: ' [III]', glowColor: '#fd0', size: 14, label: 'T3 圣遗物协议', code: 'T3' },
};
const RARITY_CONFIG = ITEM_TIER_CONFIG;
const powerUpDefs = [
  { type: 'speed',    name: '加强履带', icon: 'DRV', color: '#4af', desc: '移速×1.12', duration: 660, tier: 'basic' },
  { type: 'railgun',  name: '电磁炮',   icon: 'RAIL', color: '#a4f', desc: '短时穿透脉冲', duration: 540, tier: 'advanced' },
  { type: 'ricochet', name: '反弹弹',   icon: 'RICO', color: '#fa4', desc: '子弹弹射', duration: 660, tier: 'basic' },
  { type: 'shield',   name: '能量护盾', icon: 'SHD', color: '#4ff', desc: '短时无敌', duration: 300, tier: 'basic' },
  { type: 'rapid',    name: '急速连射', icon: 'RPD', color: '#f44', desc: '射速提升', duration: 480, tier: 'advanced' },
  { type: 'repair',   name: '维修工具', icon: 'FIX', color: '#4f4', desc: '恢复少量HP', duration: 0, tier: 'basic' },
  { type: 'freeze',   name: '冰冻弹',   icon: 'CRY', color: '#8cf', desc: '短时减缓敌人', duration: 420, tier: 'basic' },
  { type: 'multishot',name: '散射炮',   icon: 'ARC', color: '#f8f', desc: '子弹+2发', duration: 540, tier: 'advanced' },
  { type: 'magnet',   name: '磁铁',     icon: 'MAG', color: '#c8f', desc: '吸取范围提升', duration: 540, tier: 'basic' },
  { type: 'pierce',   name: '穿甲弹',   icon: 'PEN', color: '#ff8', desc: '子弹穿透敌人', duration: 480, tier: 'advanced' },
  { type: 'vampire',  name: '生命汲取', icon: 'VAM', color: '#f66', desc: '击杀概率恢复HP', duration: 540, tier: 'relic' },
  { type: 'double_score', name: '双倍积分', icon: 'SCO', color: '#ff0', desc: '积分×1.5', duration: 540, tier: 'advanced' },
  { type: 'big_bullet', name: '巨型子弹', icon: 'HVY', color: '#f80', desc: '子弹判定扩大', duration: 480, tier: 'advanced' },
  { type: 'explosive',name: '爆炸弹',   icon: 'BLZ', color: '#f84', desc: '子弹爆炸溅射', duration: 480, tier: 'advanced' },
  { type: 'invisible',name: '光学迷彩', icon: 'CLM', color: '#aaa', desc: '敌人索敌降低', duration: 540, tier: 'relic' },
  { type: 'thorns',   name: '荆棘护甲', icon: 'RET', color: '#8f8', desc: '反弹接触伤害', duration: 420, tier: 'advanced' },
  { type: 'overdrive', name: '火力全开', icon: 'OVR', color: '#f80', desc: '短时伤害+1', duration: 420, tier: 'relic' },
  { type: 'timewarp', name: '时间减缓', icon: 'TIM', color: '#8cf', desc: '敌方弹速降低', duration: 360, tier: 'advanced' },
  { type: 'goldrush', name: '黄金时刻', icon: 'GLD', color: '#fd0', desc: '分数和碎片×2', duration: 300, tier: 'relic' },
];
function normalizeItemTier(tier) {
  if (tier === 'common') return 'basic';
  if (tier === 'rare') return 'advanced';
  if (tier === 'legendary') return 'relic';
  return ITEM_TIER_CONFIG[tier] ? tier : 'basic';
}
function pickItemTier(weights = ITEM_TIER_CONFIG) {
  const total = Object.values(weights).reduce((sum, cfg) => sum + (cfg.weight || 0), 0);
  let roll = rng() * Math.max(1, total);
  for (const tier of Object.keys(weights)) {
    roll -= weights[tier].weight || 0;
    if (roll <= 0) return normalizeItemTier(tier);
  }
  return 'basic';
}
function pickPowerUpDefByTier(tier) {
  const targetTier = normalizeItemTier(tier);
  let pool = powerUpDefs.filter(def => normalizeItemTier(def.tier) === targetTier);
  if (pool.length === 0) pool = powerUpDefs;
  return pool[Math.floor(rng() * pool.length)];
}

const powerUps = [];
const chests = [];
let lastChestMilestone = 0;
let powerUpSpawnTimer = 0;

// Active buffs (duration in frames, 0 = inactive)
let buffs = {
  speed: 0, railgun: 0, ricochet: 0, shield: 0,
  rapid: 0, freeze: 0, multishot: 0,
  magnet: 0, pierce: 0, vampire: 0, double_score: 0,
  big_bullet: 0, explosive: 0, invisible: 0, thorns: 0,
  overdrive: 0, timewarp: 0, goldrush: 0,
};

function spawnPowerUp(x, y) {
  // Don't spawn inside obstacles
  if (tankCollidesObstacle(x, y, 20, 20)) return;
  const tier = pickItemTier();
  const def = pickPowerUpDefByTier(tier);
  const rc = ITEM_TIER_CONFIG[tier];
  powerUps.push({
    x: x, y: y, type: def.type, name: def.name,
    icon: def.icon, color: def.color, duration: def.duration,
    life: 900, tier: tier, rarity: tier,
    displayDuration: def.duration > 0 ? Math.floor(def.duration * rc.durationMul) : 0,
    displayName: def.name + rc.descSuffix,
    glowColor: rc.glowColor,
    size: rc.size,
  });
}

// Power-up synergy pairs
const SYNERGIES = {
  'magnet+pierce': { name:'磁力穿刺', desc:'磁铁吸引+穿甲穿透', icon:'MAG-PEN' },
  'explosive+big_bullet': { name:'巨型炸弹', desc:'爆炸溅射+巨型判定', icon:'BLZ-HVY' },
  'vampire+thorns': { name:'吸血荆棘', desc:'击杀回血+接触反弹', icon:'VAM-RET' },
  'freeze+rapid': { name:'寒冰风暴', desc:'冰冻减速+高速连射', icon:'CRY-RPD' },
  'railgun+pierce': { name:'超电磁炮', desc:'穿透脉冲+穿甲弹', icon:'RAIL-PEN' },
  'shield+thorns': { name:'反射护盾', desc:'无敌+荆棘反弹', icon:'SHD-RET' },
  'double_score+vampire': { name:'收割时刻', desc:'双倍积分+击杀回血', icon:'SCO-VAM' },
  'magnet+double_score': { name:'财富磁铁', desc:'磁铁吸引+双倍积分', icon:'MAG-SCO' },
};

function checkSynergy(newType) {
  for (const [pair, data] of Object.entries(SYNERGIES)) {
    const [a, b] = pair.split('+');
    if ((newType === a && buffs[b] > 0) || (newType === b && buffs[a] > 0)) {
      return data;
    }
  }
  return null;
}

// --- Item Fusion Recipes ---
const FUSION_RECIPES = [
  { id:'gold_magnet', name:'黄金磁铁', icon:'AUR-MAG', desc:'自动吸取+4倍积分', requires:['magnet','double_score'],
    apply(){ buffs.magnet=660; buffs.double_score=660; if(buffs.goldrush) buffs.goldrush+=360; else buffs.goldrush=360; } },
  { id:'railgun_plus', name:'超电磁炮', icon:'RAIL-SIG', desc:'穿透+穿甲+高速弹', requires:['railgun','pierce'],
    apply(){ buffs.railgun=660; buffs.pierce=660; } },
  { id:'frost_blast', name:'冰火爆裂', icon:'CRY-BLZ', desc:'冰冻+爆炸+大范围', requires:['freeze','explosive'],
    apply(){ buffs.freeze=660; buffs.explosive=660; explosionRadiusMul+=0.2; } },
  { id:'undying_thorns', name:'不死荆棘', icon:'RED-RET', desc:'吸血+荆棘+HP上限+3', requires:['vampire','thorns'],
    apply(){ buffs.vampire=660; buffs.thorns=660; player.maxHp+=1; player.hp=Math.min(player.maxHp, player.hp+2); } },
  { id:'bullet_storm', name:'弹幕风暴', icon:'HVY-ARC', desc:'巨型子弹+5方向弹幕', requires:['big_bullet','multishot'],
    apply(){ buffs.big_bullet=660; buffs.multishot=660; } },
];

function checkFusion(newType) {
  for (const recipe of FUSION_RECIPES) {
    const otherType = recipe.requires.find(r => r !== newType);
    if (recipe.requires.includes(newType) && otherType && buffs[otherType] > 0) {
      return recipe;
    }
  }
  return null;
}

function applyPowerUp(p) {
  sessionPowerUpsCollected++;
  discoverBestiary('powerups', p.type);
  const tier = normalizeItemTier(p.tier || p.rarity);
  if (tier === 'relic') sfxPowerUpRare(); else sfxPowerUp();
  if (p.type === 'repair') {
    recordPowerUpPickup(p, null);
    const healAmt = tier === 'relic' ? 3 : (tier === 'advanced' ? 2 : 1);
    player.hp = Math.min(player.hp + healAmt, player.maxHp);
    sfxPowerUpType(p.type, tier);
    return;
  }
  // Check fusion before applying
  const fusion = checkFusion(p.type);
  const synergy = checkSynergy(p.type);
  const def = powerUpDefs.find(d => d.type === p.type);

  if (fusion) {
    recordPowerUpPickup(p, fusion);
    discoverBestiary('fusions', fusion.id);
    unlockAchievement('fusion_first');
    // Remove original buffs, apply fusion
    fusion.requires.forEach(r => buffs[r] = 0);
    fusion.apply();
    const toast = document.getElementById('achieve-toast');
    toast.querySelector('.achieve-icon').textContent = fusion.icon;
    toast.querySelector('.achieve-name').textContent = '融合协议: ' + fusion.name + '!';
    toast.querySelector('.achieve-label').textContent = fusion.desc;
    toast.querySelector('.achieve-name').style.color = '#f8d';
    sfxAchievement();
    sfxFusion();
    toast.style.display = 'block'; toast.style.animation = 'none'; toast.offsetHeight;
    toast.style.animation = 'toastIn 0.4s ease-out';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.style.display = 'none'; }, 3000);
    spawnExplosion(player.x, player.y, 20, '#f8d', '#fff');
    return;
  }

  recordPowerUpPickup(p, null);
  buffs[p.type] = p.displayDuration || p.duration;
  sfxPowerUpType(p.type, tier);

  if (def) {
    const toast = document.getElementById('achieve-toast');
    if (synergy) {
      toast.querySelector('.achieve-icon').textContent = synergy.icon;
      toast.querySelector('.achieve-name').textContent = '协同协议: ' + synergy.name;
      toast.querySelector('.achieve-label').textContent = synergy.desc;
      toast.querySelector('.achieve-name').style.color = '#fd0';
      sfxAchievement();
    } else {
      toast.querySelector('.achieve-icon').textContent = def.icon;
      toast.querySelector('.achieve-name').textContent = '获得: ' + p.displayName;
      toast.querySelector('.achieve-label').textContent = def.desc;
      toast.querySelector('.achieve-name').style.color = '';
    }
    toast.style.display = 'block';
    toast.style.animation = 'none';
    toast.offsetHeight;
    toast.style.animation = 'toastIn 0.4s ease-out';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.style.display = 'none'; }, 2000);
  }
}

// --- Treasure Chests ---
function spawnChest(x, y, isBossChest) {
  chests.push({ x, y, life: 1200, isBossChest, opened: false });
}
function checkChestMilestone() {
  const milestone = Math.floor(score / 1500) * 1500;
  if (milestone > lastChestMilestone && milestone > 0) {
    lastChestMilestone = milestone;
    const cx = 50 + rng() * (W - 100);
    const cy = 50 + rng() * (H - 100);
    spawnChest(cx, cy, false);
  }
}
function openChest(chest) {
  if (chest.opened) return;
  chest.opened = true;
  const isBoss = chest.isBossChest;
  sfxChestOpen(isBoss);
  const rawFragAmt = isBoss ? (30 + Math.floor(rng() * 20)) : (10 + Math.floor(rng() * 15));
  const fragAmt = scaleBattleMoonstoneGain(rawFragAmt, getVaultResearchMultiplier());
  coreFragments += fragAmt;
  recordChestOpened(isBoss, fragAmt);
  saveProgression();
  const chestTierWeights = isBoss
    ? { basic: { weight: 35 }, advanced: { weight: 45 }, relic: { weight: 20 } }
    : { basic: { weight: 58 }, advanced: { weight: 32 }, relic: { weight: 10 } };
  const itemCount = isBoss ? 3 : 2;
  const gained = [];
  for (let i = 0; i < itemCount; i++) {
    const tier = pickItemTier(chestTierWeights);
    const def = pickPowerUpDefByTier(tier);
    const rc = ITEM_TIER_CONFIG[tier] || ITEM_TIER_CONFIG.basic;
    discoverBestiary('powerups', def.type);
    gained.push((rc.code || 'T1') + '-' + def.icon);
    if (def.type === 'repair') {
      player.hp = Math.min(player.hp + (tier === 'relic' ? 4 : (tier === 'advanced' ? 3 : 2)), player.maxHp);
      continue;
    }
    const dur = def.duration > 0 ? Math.floor(def.duration * rc.durationMul * 1.3) : 0;
    buffs[def.type] = dur || def.duration;
  }
  // Toast
  const toast = document.getElementById('achieve-toast');
  toast.querySelector('.achieve-icon').textContent = isBoss ? 'BOS' : 'BOX';
  toast.querySelector('.achieve-name').textContent = (isBoss ? '首领宝箱' : '分数宝箱') + ' +' + fragAmt + ' MS';
  toast.querySelector('.achieve-label').textContent = '获得 ' + gained.join(' / ');
  toast.querySelector('.achieve-name').style.color = '#fd0';
  toast.style.display = 'block'; toast.style.animation = 'none'; toast.offsetHeight;
  toast.style.animation = 'toastIn 0.4s ease-out';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => { toast.style.display = 'none'; }, 3000);
  sfxAchievement();
}

function getExplosionRadius() {
  return 60 * explosionRadiusMul * (1 + ((player && player._tankDef && player._tankDef.explosionRadiusBonus) || 0));
}

function getEffectiveSpeed() {
  const fireSlow = player && player.getFireSlowMultiplier ? player.getFireSlowMultiplier() : 1;
  return player.speed * (buffs.speed > 0 ? 1.12 : 1) * playerSpeedMul * fireSlow;
}

function getPlayerInputVector() {
  let ix = 0, iy = 0;
  if (keys['d'] || keys['arrowright']) ix += 1;
  if (keys['a'] || keys['arrowleft']) ix -= 1;
  if (keys['s'] || keys['arrowdown']) iy += 1;
  if (keys['w'] || keys['arrowup']) iy -= 1;
  if (ix !== 0 && iy !== 0) {
    ix *= 0.707;
    iy *= 0.707;
  }
  return { x: ix, y: iy };
}

function getEffectiveShootDelay() {
  const base = buffs.rapid > 0 ? Math.floor(player.shootDelay * 0.65) : player.shootDelay;
  return Math.max(8, Math.floor(base * playerShootDelayMul));
}

function getEffectiveReloadTime() {
  const base = player && player._tankDef ? (player._tankDef.reloadTime || 120) : 120;
  const rapidMul = buffs.rapid > 0 ? 0.82 : 1;
  return Math.max(36, Math.floor(base * rapidMul * playerShootDelayMul * playerReloadMul));
}

function getPlayerFireSlowProfile(tankType, def) {
  const baseProfiles = {
    spread:  { duration: 16, mul: 0.74 },
    focus:   { duration: 18, mul: 0.68 },
    wide:    { duration: 20, mul: 0.66 },
    burst:   { duration: 24, mul: 0.58 },
    sniper:  { duration: 28, mul: 0.52 },
    homing:  { duration: 16, mul: 0.76 },
    border:  { duration: 18, mul: 0.70 },
    blade:   { duration: 12, mul: 0.84 },
    scarlet: { duration: 24, mul: 0.58 },
    astral:  { duration: 20, mul: 0.66 },
  };
  const type = tankType || currentTankType || 'spread';
  const profile = baseProfiles[type] || baseProfiles.spread;
  const baseCount = tankTypes[type] ? tankTypes[type].bulletCount : 1;
  const upgradedCount = def ? (def.bulletCount || baseCount) : baseCount;
  const extraWeight = Math.max(0, upgradedCount - baseCount);
  const resist = Math.max(0, Math.min(0.18, (def && def.fireSlowResist) || 0));
  return {
    duration: profile.duration + Math.min(8, Math.floor(extraWeight * 1.5)),
    mul: Math.max(0.48, Math.min(0.92, profile.mul - extraWeight * 0.015 + resist)),
  };
}

function getEnemyFireSlowProfile(unit) {
  if (!unit) return { duration: 18, mul: 0.70 };
  if (unit.bossDef) {
    return unit.currentPhase > 0
      ? { duration: 26, mul: 0.56 }
      : { duration: 22, mul: 0.62 };
  }
  if (unit.isElite) {
    const eliteProfiles = {
      heavy:   { duration: 24, mul: 0.58 },
      sniper:  { duration: 28, mul: 0.50 },
      fast:    { duration: 12, mul: 0.82 },
      flame:   { duration: 20, mul: 0.64 },
      summoner:{ duration: 17, mul: 0.72 },
      stealth: { duration: 15, mul: 0.78 },
      splitter:{ duration: 17, mul: 0.72 },
      regen:   { duration: 18, mul: 0.70 },
      laser:   { duration: 28, mul: 0.48 },
      miner:   { duration: 18, mul: 0.72 },
      barrier: { duration: 21, mul: 0.65 },
      missile: { duration: 15, mul: 0.76 },
      warden:  { duration: 23, mul: 0.58 },
      phase:   { duration: 17, mul: 0.74 },
    };
    return eliteProfiles[unit.special] || { duration: 18, mul: 0.70 };
  }
  const normalProfiles = {
    scout:     { duration: 16, mul: 0.72 },
    runner:    { duration: 12, mul: 0.82 },
    brute:     { duration: 22, mul: 0.58 },
    artillery: { duration: 24, mul: 0.56 },
  };
  return normalProfiles[unit.kind] || normalProfiles.scout;
}

function getEnemyBulletSpeedMul() {
  const diff = difficultySettings[currentDifficulty] || difficultySettings.normal;
  const timeMul = buffs.timewarp > 0 ? 0.55 : 1;
  return (diff.enemyBulletSpeedMul || 1) * timeMul;
}

function renderAchievements() {
  const grid = document.getElementById('achieve-grid');
  const groups = getAchievementGroups();
  const tabsEl = document.getElementById('achieve-tabs');
  if (tabsEl) {
    let tabsHtml = '';
    for (const [key, cfg] of Object.entries(groups)) {
      const activeCls = key === achievementsTab ? ' active' : '';
      const total = cfg.ids.length;
      const unlocked = cfg.ids.filter(id => unlockedAchievements.has(id)).length;
      tabsHtml += `<button class="achieve-tab${activeCls}" data-tab="${key}" onclick="switchAchievementsTab('${key}')">${cfg.label} <span class="achieve-tab-code">${unlocked}/${total}</span></button>`;
    }
    tabsEl.innerHTML = tabsHtml;
  }
  const activeGroup = groups[achievementsTab];
  if (!activeGroup) return;
  const allItems = activeGroup.ids.map(id => achievementsDef.find(a => a.id === id)).filter(Boolean);
  const diffRank = t => (t === 'mythic' ? 3 : t === 'elite' ? 2 : 1);
  allItems.sort((a, b) => {
    const ra = diffRank(inferAchievementTier(a)); const rb = diffRank(inferAchievementTier(b));
    if (ra !== rb) return ra - rb;
    return (getAchievementReward(a) || 0) - (getAchievementReward(b) || 0);
  });
  const unlockedCount = allItems.filter(a => unlockedAchievements.has(a.id)).length;
  const color = activeGroup.color || '#888';
  let html = `<div class="ach-group-header" style="--hdr-color:${color}">
    <span style="color:${color}">&#9656; ${activeGroup.label}</span>
    <span class="ach-count">${unlockedCount}/${allItems.length}</span>
  </div>`;
  for (const a of allItems) {
    const unlocked = unlockedAchievements.has(a.id); const claimed = claimedAchievementRewards.has(a.id);
    const reward = getAchievementReward(a); const rarity = getAchievementRarity(a);
    const code = getAchievementCode(a); const seal = getAchievementSeal(a);
    const medalIcon = unlocked ? renderCodeIcon(a.icon || seal, a.name) : escapeHtml(seal);
    const tierName = rarity.label + ' · 奖励 ' + reward + ' 月光石';
    const rewardHtml = unlocked
      ? (claimed ? `<button class="ach-reward claimed" disabled>已领</button>` : `<button class="ach-reward ready" onclick="claimAchievementReward('${escapeHtml(a.id)}')">+${reward}</button>`)
      : `<span class="ach-reward locked-reward">+${reward}</span>`;
    html += `<div class="achieve-row ${unlocked ? 'unlocked' : 'locked'}" style="--ach-accent:${escapeHtml(color)}">
      <div class="ach-medal"><span class="ach-icon">${medalIcon}</span></div>
      <div class="ach-info">
        <div class="ach-topline"><span class="ach-code">${escapeHtml(code)}</span><span class="ach-rarity">${escapeHtml(tierName)}</span></div>
        <div class="ach-name">${unlocked ? escapeHtml(a.name) : '???'}</div>
        <div class="ach-desc">${unlocked ? a.desc : '完成条件隐藏'}</div>
      </div>
      <div class="ach-claim">${rewardHtml}</div>
    </div>`;
  }
  grid.innerHTML = html;
}
let achievementsTab = 'combat';
function getAchievementGroups() {
  return {
    'combat': { label:'战斗', color:'#ff5a4a', ids:['first_blood','sharpshooter','tank_hunter','battle_veteran','kills_500','kills_1000','kills_2000','kills_5000','kills_10000','combo_20','combo_35','combo_50','combo_75','combo_100','combo_150','elite_hunter','elite_hunter_25','elite_hunter_40','elite_50'] },
    'survival': { label:'生存', color:'#5ee870', ids:['survivor','tenacious','flawless','perfect_run','no_hit_wave10','one_life_clear','bullet_hell_survivor','mine_dodger','speed_demon','speed_120','speed_90','wave_15','wave_20','wave_25','wave_30','wave_35','wave_40','wave_50','wave_60','wave_75','endless_30','endless_50','hardcore','hardcore_wave10','nightmare_survivor','boss_no_hit','boss_all_no_hit','boss_speed_kill','boss_phase_skip','one_run_3boss','untouched_combo'] },
    'score': { label:'分数', color:'#ffb060', ids:['score_500','score_2000','score_5000','score_10000','score_20000','score_30000','score_50000','score_100k','score_200k'] },
    'tank': { label:'机体', color:'#60b0ff', ids:['tank_spread_win','tank_focus_win','tank_wide_win','tank_burst_win','tank_sniper_win','tank_homing_win','tank_border_win','tank_blade_win','tank_scarlet_win','tank_astral_win','tank_hard_spread','tank_hard_sniper','tank_hard_astral','all_tank_hard','all_tank_evo','first_try_clear'] },
    'collection': { label:'收藏', color:'#a080f0', ids:['powerup_collector','powerup_collector_40','powerup_60','rich_run','poverty_run','fragment_500','fragment_1000','moonstone_2000','moonstone_5000','upgrade_apprentice','upgrade_master','evolution_first','evolution_six','evolve_twice','all_tanks_unlocked','daily_clear','daily_10','perfect_daily','fusion_first','fusion_5','fusion_all','lab_max_tank','chest_10','chest_20'] },
    'special': { label:'特殊', color:'#f6e5aa', ids:['modifier_reroll','modifier_full_reroll','modifier_mythic','modifier_treasury','modifier_jackpot','modifier_10_stack','modifier_20_stack','global_research_first','global_research_10','global_research_max','research_max_all','boss_witness','boss_breaker','boss_5_run','boss_8_run','clear_easy','clear_hard','clear_nightmare','clear_all_diff'] },
  };
}
function switchAchievementsTab(tab) {
  achievementsTab = tab;
  achievementsPage = 0;
  renderAchievements();
  // Update tab buttons
  document.querySelectorAll('#achieve-tabs .achieve-tab').forEach(el => {
    el.classList.toggle('active', el.dataset.tab === tab);
  });
}

function showAchievements() {
  renderAchievements();
  document.getElementById('achievements-screen').style.display = 'flex';
  document.getElementById('start-screen').style.display = 'none';
}

function hideAchievements() {
  document.getElementById('achievements-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'flex';
  renderDifficultyButtons();
}

// --- Bestiary ---
let bestiaryTab = 'items_basic';
const BESTIARY_DISCOVERY_KEY = 'tankbattle_bestiary_discovered';
const BESTIARY_TAB_IDS = ['items_basic', 'items_fusion', 'enemies_normal', 'enemies_elite', 'enemies_boss'];
let bestiarySection = 'items';
const BESTIARY_SECTIONS = {
  items: {
    label: '道具档案',
    tabs: ['items_basic', 'items_fusion'],
    summary: '道具档案记录月光石补给、战术模块与禁忌融合协议。拾取或触发后，档案会逐步解密。'
  },
  enemies: {
    label: '敌人档案',
    tabs: ['enemies_normal', 'enemies_elite', 'enemies_boss'],
    summary: '敌人档案按威胁阶级封存普通单位、精英单位与首领敌人。遭遇后才会公开真实记录。'
  }
};
const BESTIARY_TAB_META = {
  items_basic: { label: '基础模块', code: 'MODULE' },
  items_fusion: { label: '融合协议', code: 'FUSION' },
  enemies_normal: { label: '普通单位', code: 'COMMON' },
  enemies_elite: { label: '精英单位', code: 'ELITE' },
  enemies_boss: { label: '首领敌人', code: 'BOSS' },
};
let discoveredBestiary = {
  powerups: new Set(),
  fusions: new Set(),
  normals: new Set(),
  elites: new Set(),
  bosses: new Set(),
};

function makeEmptyBestiaryDiscovery() {
  return {
    powerups: new Set(),
    fusions: new Set(),
    normals: new Set(),
    elites: new Set(),
    bosses: new Set(),
  };
}

function loadBestiaryDiscovery() {
  try {
    const raw = localStorage.getItem(BESTIARY_DISCOVERY_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      discoveredBestiary = {
        powerups: new Set(data.powerups || []),
        fusions: new Set(data.fusions || []),
        normals: new Set(data.normals || data.enemies_normal || []),
        elites: new Set(data.elites || []),
        bosses: new Set(data.bosses || []),
      };
      return;
    }
  } catch(e) {}
  discoveredBestiary = makeEmptyBestiaryDiscovery();
}

function saveBestiaryDiscovery() {
  try {
    localStorage.setItem(BESTIARY_DISCOVERY_KEY, JSON.stringify({
      powerups: [...discoveredBestiary.powerups],
      fusions: [...discoveredBestiary.fusions],
      normals: [...discoveredBestiary.normals],
      elites: [...discoveredBestiary.elites],
      bosses: [...discoveredBestiary.bosses],
    }));
  } catch(e) {}
}

function discoverBestiary(kind, id) {
  if (!kind || !id || !discoveredBestiary[kind]) return;
  if (discoveredBestiary[kind].has(id)) return;
  discoveredBestiary[kind].add(id);
  saveBestiaryDiscovery();
}

function getBestiarySectionForTab(tab) {
  for (const [sectionId, section] of Object.entries(BESTIARY_SECTIONS)) {
    if (section.tabs.includes(tab)) return sectionId;
  }
  return 'items';
}

function renderBestiaryNavigation() {
  const section = BESTIARY_SECTIONS[bestiarySection] || BESTIARY_SECTIONS.items;
  for (const sectionId of Object.keys(BESTIARY_SECTIONS)) {
    const el = document.getElementById('section-' + sectionId);
    if (el) el.classList.toggle('active', bestiarySection === sectionId);
  }
  const tabs = document.getElementById('bestiary-tabs');
  if (tabs) {
    tabs.innerHTML = section.tabs.map(tab => {
      const meta = BESTIARY_TAB_META[tab] || { label: tab, code: 'ARC' };
      const active = bestiaryTab === tab ? 'active' : '';
      const id = 'tab-' + tab.replace('_', '-');
      return `<button class="best-tab ${active}" id="${id}" onclick="switchBestiaryTab('${tab}')">
        <span class="best-tab-code">${escapeHtml(meta.code)}</span>${escapeHtml(meta.label)}
      </button>`;
    }).join('');
  }
  const summary = document.getElementById('bestiary-summary');
  if (summary) summary.textContent = section.summary;
}

function getNormalEnemyDescription(kind) {
  switch (kind) {
    case 'scout': return '标准侦察单位，弹幕稀疏但会持续牵制走位';
    case 'runner': return '高速突击单位，擅长贴近后用短间隔火力逼迫转向';
    case 'brute': return '重装推进单位，血量更高，会压缩玩家活动空间';
    case 'artillery': return '远程炮击单位，偏好保持距离并进行预判射击';
    default: return '灰域中最常见的无人作战单位';
  }
}

function getNormalEnemyName(kind) {
  switch (kind) {
    case 'scout': return '巡哨车';
    case 'runner': return '疾袭车';
    case 'brute': return '重铠车';
    case 'artillery': return '弧炮车';
    default: return '敌方单位';
  }
}

function renderBestiary() {
  const grid = document.getElementById('bestiary-grid');
  let items = [];
  if (bestiaryTab === 'items_basic') {
    items = powerUpDefs.map(p => {
      const tier = normalizeItemTier(p.tier);
      const tc = ITEM_TIER_CONFIG[tier] || ITEM_TIER_CONFIG.basic;
      return {
      iconType: 'hexgear', glyph: getEnemyVisualProfile('powerup').glyph, color: p.color, classLabel: tc.code + '-MODULE',
      name: p.name, desc: p.desc, powerType: p.type,
      tag: p.duration > 0 ? (p.duration/60).toFixed(0) + '秒' : '即时',
      subTag: tc.label,
      lore: BESTIARY_LORE.powerups[p.type],
      tier,
      unlocked: discoveredBestiary.powerups.has(p.type),
      lockedName: '未解析补给模块',
      lockedDesc: '???',
    };
    });
  } else if (bestiaryTab === 'items_fusion') {
    items = FUSION_RECIPES.map(f => ({
      iconType: 'merged', glyph: getEnemyVisualProfile('fusion').glyph, color: '#f6e5aa', classLabel: 'RELIC-FUSION',
      name: f.name, fusionId: f.id,
      desc: f.desc,
      tag: f.requires.map(r => powerUpDefs.find(p => p.type === r)?.name || r).join(' + '),
      subTag: '融合协议',
      lore: BESTIARY_LORE.fusions[f.id],
      unlocked: discoveredBestiary.fusions.has(f.id),
      lockedName: '未解密融合协议',
      lockedDesc: '???',
    }));
  } else if (bestiaryTab === 'enemies_normal') {
    items = enemyTypes.map(e => {
      const profile = getEnemyVisualProfile(e.kind);
      const faction = getFactionInfo(e.faction);
      return {
        iconType: profile.iconType, glyph: profile.glyph, color: profile.color, classLabel: profile.label,
        name: getNormalEnemyName(e.kind), desc: getNormalEnemyDescription(e.kind), tag: '普通',
        subTag: faction.code + ' · HP ' + e.hp + ' · SPD ' + e.speed,
        lore: BESTIARY_LORE.normals[e.kind],
        faction: faction.name, factionColor: faction.color,
        unlocked: discoveredBestiary.normals.has(e.kind),
        lockedName: '未知普通单位',
        lockedDesc: '???',
      };
    });
  } else if (bestiaryTab === 'enemies_elite') {
    items = eliteTypes.map(e => {
      const profile = getEnemyVisualProfile(e.special);
      const faction = getFactionInfo(e.faction);
      return {
        iconType: profile.iconType, glyph: profile.glyph, color: faction.color || profile.color, classLabel: profile.label,
        name: e.name, desc: getEliteDescription(e.special), tag: '精英',
        subTag: faction.code + ' · HP ' + e.hp + ' · SPD ' + e.speed,
        lore: appendFactionLore(BESTIARY_LORE.elites[e.special], e.faction),
        faction: faction.name, factionColor: faction.color,
        threat: profile.threat === '裁断' ? 5 : (profile.threat === '重装' ? 4 : 3),
        unlocked: discoveredBestiary.elites.has(e.special),
        lockedName: '未知精英单位',
        lockedDesc: '???',
      };
    });
  } else if (bestiaryTab === 'enemies_boss') {
    const bossProfile = getEnemyVisualProfile('boss');
    items = BOSS_TYPES.map(b => {
      const faction = getFactionInfo(b.faction);
      return {
        glyph: bossProfile.glyph, color: faction.color || b.turret || bossProfile.color, classLabel: bossProfile.label,
        name: b.name,
        desc: b.desc + ' · ' + b.phases.map(p => p.name).join(' → '),
        tag: 'HP ' + b.hp,
        subTag: faction.code + ' · ' + b.phases.length + '阶段战术',
        lore: appendFactionLore(BESTIARY_LORE.bosses[b.name], b.faction),
        faction: faction.name, factionColor: faction.color,
        threat: 5,
        unlocked: discoveredBestiary.bosses.has(b.name),
        lockedName: '未识别首领',
        lockedDesc: '???',
      };
    });
  }
  // Group items by category
  const grouped = groupBestiaryItems(items, bestiaryTab);
  grid.innerHTML = grouped.map(buildBestiaryRow).join('');
  renderBestiaryCanvases();
}

function switchBestiaryTab(tab) {
  bestiaryTab = BESTIARY_TAB_IDS.includes(tab) ? tab : 'items_basic';
  bestiarySection = getBestiarySectionForTab(bestiaryTab);
  renderBestiaryNavigation();
  renderBestiary();
}

function switchBestiarySection(sectionId) {
  bestiarySection = BESTIARY_SECTIONS[sectionId] ? sectionId : 'items';
  const section = BESTIARY_SECTIONS[bestiarySection];
  if (!section.tabs.includes(bestiaryTab)) bestiaryTab = section.tabs[0];
  renderBestiaryNavigation();
  renderBestiary();
}

function showBestiary() {
  switchBestiaryTab('items_basic');
  document.getElementById('bestiary-screen').style.display = 'flex';
  document.getElementById('start-screen').style.display = 'none';
}

function hideBestiary() {
  document.getElementById('bestiary-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'flex';
  renderDifficultyButtons();
}

// --- Input ---
const keys = {};
let mouse = { x: W/2, y: H/2 };
let mouseDown = false;

window.addEventListener('keydown', e => {
  if (handleTankSelectKeyboard(e)) return;
  keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === 'r' && gameOverFlag) quickRestart();
  if (e.key.toLowerCase() === 'p') {
    if (isPaused) resumeGame();
    else pauseGame();
  }
  if (e.key === 'Escape') {
    if (isPaused) resumeGame();
    else if (gameRunning && !gameOverFlag) pauseGame();
    else if (document.getElementById('lab-screen').style.display === 'flex') hideLabScreen();
    else if (document.getElementById('protocol-screen').style.display === 'flex') hideProtocolScreen();
    else if (document.getElementById('leaderboard-screen').style.display === 'flex') hideLeaderboard();
    else if (document.getElementById('bestiary-screen').style.display === 'flex') hideBestiary();
    else if (document.getElementById('achievements-screen').style.display === 'flex') hideAchievements();
  }
  if (e.key === 'F3') { togglePerfMonitor(); e.preventDefault(); }
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / (rect.width || 1);
  const scaleY = canvas.height / (rect.height || 1);
  mouse.x = (e.clientX - rect.left) * scaleX;
  mouse.y = (e.clientY - rect.top) * scaleY;
});
canvas.addEventListener('mousedown', e => { if (e.button === 0) mouseDown = true; });
canvas.addEventListener('mouseup', e => { if (e.button === 0) mouseDown = false; });
canvas.addEventListener('contextmenu', e => e.preventDefault());

function pauseGame() {
  if (!gameRunning || gameOverFlag || isPaused) return;
  isPaused = true;
  gameRunning = false;
  mouseDown = false;
  stopMusic();
  sfxPauseState(true);
  document.getElementById('pause-screen').style.display = 'flex';
}

function resumeGame() {
  if (!isPaused) return;
  isPaused = false;
  gameRunning = true;
  document.getElementById('pause-screen').style.display = 'none';
  sfxPauseState(false);
  startMusic();
}  if (isFirstRun()) { setTimeout(runNewPlayerTips, 1200); markFirstRunComplete(); }


function returnHomeFromPause() {
  isPaused = false;
  document.getElementById('pause-screen').style.display = 'none';
  restartGame();
}

// --- Floating Damage Numbers ---
const dmgNumbers = [];
class DamageNumber {
  constructor(x, y, value, type) {
    this.x = x + (Math.random() - 0.5) * 16;
    this.y = y;
    this.value = value;
    this.type = type || 'normal'; // normal/crit/pierce/explosive/freeze/bounce
    this.life = 50;
    this.maxLife = 50;
    this.vy = -1.2 - value * 0.12;
    this.scale = 1 + Math.min(value * 0.04, 0.6); // bigger damage = bigger text
  }
  update() {
    this.y += this.vy;
    this.vy *= 0.96;
    this.life--;
    if (this.life < 20) this.scale = Math.max(0.3, this.scale * 0.95);
  }
  draw(ctx) {
    const colors = { normal:'#ffffff', crit:'#ffdd00', pierce:'#88ccff', explosive:'#ff8844', freeze:'#88eeff', bounce:'#aaddff', heal:'#88ff88' };
    const color = colors[this.type] || colors.normal;
    const size = 12 + Math.min(this.value * 0.8, 10);
    ctx.save();
    ctx.globalAlpha = Math.min(1, this.life / 25);
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    if (this.type === 'crit') {
      ctx.shadowColor = '#ff0'; ctx.shadowBlur = 8;
    } else if (this.type === 'explosive') {
      ctx.shadowColor = '#f80'; ctx.shadowBlur = 6;
    }
    ctx.font = 'bold ' + size + 'px "Courier New", monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.value, 0, 0);
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}
function spawnDamageNumber(x, y, value, type) {
  if (isNaN(value) || value <= 0) return;
  const t = type || (value >= 3 ? 'crit' : 'normal');
  dmgNumbers.push(new DamageNumber(x, y, value, t));
}

// --- Particles ---
const particles = [];
let ambientParticleTimer = 0;
function spawnAmbientParticles() {
  ambientParticleTimer++;
  if (ambientParticleTimer < 18) return;
  ambientParticleTimer = 0;
  // Limit total ambient particles
  const ambientCount = particles.filter(p => p._ambient).length;
  if (ambientCount >= 20) return;
  // Biome-based ambient particles
  const safeWave = Math.max(1, Number.isFinite(wave) ? wave : 1);
  const biome = (safeWave - 1) % 8;
  const biomeColors = {
    0: ['rgba(200,180,150,0.4)', 'rgba(180,160,140,0.3)'], // clear: dust motes
    1: ['rgba(140,180,220,0.5)', 'rgba(160,200,240,0.35)'], // rain: water spray
    2: ['rgba(160,180,200,0.3)', 'rgba(180,190,210,0.2)'], // fog: mist
    3: ['rgba(200,160,100,0.4)', 'rgba(180,140,80,0.35)'], // dust: sand
    4: ['rgba(255,200,100,0.5)', 'rgba(200,160,80,0.4)'], // sparks: embers
    5: ['rgba(220,235,255,0.45)', 'rgba(200,220,240,0.35)'], // snow: flakes
    6: ['rgba(200,120,60,0.4)', 'rgba(160,80,40,0.35)'], // ash: cinders
    7: ['rgba(100,180,240,0.35)', 'rgba(140,200,255,0.25)'], // ion: glow
  };
  const colors = biomeColors[biome] || biomeColors[0];
  const p = new Particle(
    20 + rng() * (W - 40),
    20 + rng() * (H - 40),
    colors[Math.floor(rng() * colors.length)],
    0.3 + rng() * 0.6
  );
  p.radius = 1 + rng() * 2.5;
  p.decay = 0.003 + rng() * 0.008;
  p._ambient = true;
  p.vx = (rng() - 0.5) * 0.4;
  p.vy = -0.2 - rng() * 0.6;
  particles.push(p);
}

class Particle {
  constructor(x, y, color, speed) {
    this.x = x; this.y = y;
    this.vx = (Math.random() - 0.5) * speed;
    this.vy = (Math.random() - 0.5) * speed;
    this.life = 1;
    this.decay = 0.02 + Math.random() * 0.04;
    this.color = color;
    this.radius = 1.5 + Math.random() * 2.5;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
  }
  draw(ctx) {
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function spawnExplosion(x, y, count, color1, color2) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, Math.random() < 0.5 ? color1 : color2, 3 + Math.random() * 5));
  }
  if (count >= 15) { sfxExplosion(count < 20); triggerShake(count >= 20 ? 6 : 3, count >= 20 ? 12 : 6); }
}

function withGlow(ctx, color, blur, drawFn) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  drawFn();
  ctx.restore();
}

function drawArmorPanel(ctx, x, y, w, h, fill, stroke, notch) {
  const cut = notch || 3;
  ctx.beginPath();
  ctx.moveTo(x + cut, y);
  ctx.lineTo(x + w - cut, y);
  ctx.lineTo(x + w, y + cut);
  ctx.lineTo(x + w, y + h - cut);
  ctx.lineTo(x + w - cut, y + h);
  ctx.lineTo(x + cut, y + h);
  ctx.lineTo(x, y + h - cut);
  ctx.lineTo(x, y + cut);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

function drawTechCore(ctx, x, y, r, inner, outer) {
  const pulse = Math.sin(Date.now() / 180 + x * 0.05 + y * 0.05) * 0.2 + 0.8;
  withGlow(ctx, outer, 10 * pulse, () => {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.55, outer);
    grad.addColorStop(1, 'rgba(255,255,255,0.08)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r + 1.5, 0, Math.PI * 2);
  ctx.stroke();
}

function drawTankTracks(ctx, leftX, rightX, y, h, w, treadColor, accentColor) {
  ctx.fillStyle = '#101317';
  ctx.fillRect(leftX, y, w, h);
  ctx.fillRect(rightX, y, w, h);
  ctx.fillStyle = treadColor;
  ctx.fillRect(leftX + 1, y + 2, w - 2, h - 4);
  ctx.fillRect(rightX + 1, y + 2, w - 2, h - 4);
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 0.8;
  for (let ty = y + 4; ty < y + h - 2; ty += 5) {
    ctx.beginPath(); ctx.moveTo(leftX + 1.5, ty); ctx.lineTo(leftX + w - 1.5, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rightX + 1.5, ty); ctx.lineTo(rightX + w - 1.5, ty); ctx.stroke();
  }
}

function drawWeaponBarrel(ctx, x, y, w, h, fill, stroke, tipColor) {
  drawArmorPanel(ctx, x, y, w, h, fill, stroke, 2);
  if (tipColor) {
    ctx.fillStyle = tipColor;
    ctx.fillRect(x + w - 3, y + 1, 3, Math.max(1, h - 2));
  }
}

function drawTankEvolutionOverlay(ctx, evoLevel, tankType, accentColor) {
  if (!evoLevel) return;
  const finalForm = evoLevel >= 2;
  const t = Date.now() / (finalForm ? 520 : 260);
  const pulse = finalForm ? 0.2 + Math.sin(t) * 0.05 : 0.55 + Math.sin(t) * 0.18;
  const holy = finalForm ? '#d8c68a' : '#8ce8ff';
  const ember = accentColor || '#f49800';

  ctx.save();
  ctx.globalAlpha = finalForm ? 0.62 : 0.92;
  ctx.strokeStyle = finalForm ? 'rgba(246,229,170,0.2)' : 'rgba(140,232,255,0.38)';
  ctx.lineWidth = finalForm ? 0.8 : 1.1;
  ctx.beginPath();
  ctx.arc(0, 0, finalForm ? 27 + pulse : 24 + evoLevel * 3 + pulse * 2, -Math.PI * 0.82, Math.PI * 0.82);
  ctx.stroke();

  const plateFill = finalForm ? 'rgba(12,10,9,0.58)' : 'rgba(9,15,21,0.78)';
  const plateStroke = finalForm ? 'rgba(246,229,170,0.34)' : 'rgba(140,232,255,0.52)';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * 13, -16);
    ctx.lineTo(side * (finalForm ? 22 : 23 + evoLevel * 2), -10);
    ctx.lineTo(side * (finalForm ? 22 : 21 + evoLevel * 3), 10);
    ctx.lineTo(side * 13, 16);
    ctx.lineTo(side * (finalForm ? 16 : 16 + evoLevel), 4);
    ctx.lineTo(side * (finalForm ? 16 : 16 + evoLevel), -4);
    ctx.closePath();
    ctx.fillStyle = plateFill;
    ctx.fill();
    ctx.strokeStyle = plateStroke;
    ctx.stroke();
  }

  withGlow(ctx, holy, finalForm ? 4 : 8, () => {
    ctx.strokeStyle = holy;
    ctx.lineWidth = finalForm ? 0.8 : 1;
    ctx.beginPath();
    ctx.moveTo(-7, -18);
    ctx.lineTo(0, finalForm ? -24 : -25 - evoLevel * 2);
    ctx.lineTo(7, -18);
    ctx.moveTo(0, finalForm ? -24 : -25 - evoLevel * 2);
    ctx.lineTo(0, -10);
    ctx.stroke();
  });

  if (finalForm) {
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = 'rgba(244,152,0,0.3)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-14, 18);
    ctx.lineTo(-5, 22);
    ctx.lineTo(0, 18);
    ctx.lineTo(5, 22);
    ctx.lineTo(14, 18);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(246,229,170,0.18)';
    ctx.beginPath();
    ctx.arc(0, 0, 31, Math.PI * 1.14, Math.PI * 1.86);
    ctx.stroke();
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = ember;
    ctx.fillRect(-1.5, -2, 3, 4);
  }
  ctx.restore();
}

function traceHexCell(ctx, radius, inset) {
  const cut = inset || 0;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 3;
    const r = i % 2 === 0 ? radius : Math.max(4, radius - cut);
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawTechModuleShell(ctx, outer, inner, accentColor, glowColor) {
  const shellGrad = ctx.createRadialGradient(0, 0, inner * 0.1, 0, 0, outer);
  shellGrad.addColorStop(0, 'rgba(255,255,255,0.18)');
  shellGrad.addColorStop(0.42, accentColor);
  shellGrad.addColorStop(1, 'rgba(8,14,20,0.96)');
  ctx.fillStyle = shellGrad;
  traceHexCell(ctx, outer, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(220,235,255,0.22)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(8,16,22,0.75)';
  ctx.beginPath();
  ctx.arc(0, 0, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = glowColor || accentColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, inner + 2, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPowerUpGlyph(ctx, p, size) {
  const x = p.x;
  const y = p.y;
  const s = size;
  const pulse = Math.sin(Date.now() / 220 + x * 0.04) * 0.18 + 0.82;
  ctx.strokeStyle = '#dce7f5';
  ctx.fillStyle = '#f3f8ff';
  ctx.lineWidth = 1.4;
  switch (p.type) {
    case 'speed':
      ctx.beginPath(); ctx.moveTo(x - s * 0.2, y - s * 0.55); ctx.lineTo(x + s * 0.05, y - s * 0.1); ctx.lineTo(x - s * 0.02, y - s * 0.1); ctx.lineTo(x + s * 0.22, y + s * 0.55); ctx.lineTo(x - s * 0.08, y + s * 0.1); ctx.lineTo(x + s * 0.02, y + s * 0.1); ctx.closePath(); ctx.fill();
      break;
    case 'railgun':
      drawWeaponBarrel(ctx, x - s * 0.55, y - s * 0.18, s * 1.05, s * 0.36, '#c4a3ff', '#5f2e9e', '#f2e7ff');
      ctx.beginPath(); ctx.arc(x - s * 0.45, y, s * 0.12, 0, Math.PI * 2); ctx.fill();
      break;
    case 'ricochet':
      ctx.beginPath(); ctx.arc(x, y, s * 0.32, 0, Math.PI * 1.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + s * 0.18, y - s * 0.28); ctx.lineTo(x + s * 0.46, y - s * 0.28); ctx.lineTo(x + s * 0.34, y - s * 0.52); ctx.stroke();
      break;
    case 'shield':
      ctx.beginPath(); ctx.moveTo(x, y - s * 0.58); ctx.lineTo(x + s * 0.46, y - s * 0.2); ctx.lineTo(x + s * 0.28, y + s * 0.46); ctx.lineTo(x, y + s * 0.62); ctx.lineTo(x - s * 0.28, y + s * 0.46); ctx.lineTo(x - s * 0.46, y - s * 0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
    case 'rapid':
      for (let i = -1; i <= 1; i++) drawWeaponBarrel(ctx, x - s * 0.52, y + i * s * 0.2 - s * 0.09, s * 1.04, s * 0.18, '#ff8c78', '#6f1f1f', '#fff4d8');
      break;
    case 'repair':
      ctx.fillRect(x - s * 0.12, y - s * 0.5, s * 0.24, s);
      ctx.fillRect(x - s * 0.5, y - s * 0.12, s, s * 0.24);
      break;
    case 'freeze':
      for (let i = 0; i < 3; i++) {
        const a = i * Math.PI / 3;
        ctx.beginPath();
        ctx.moveTo(x - Math.cos(a) * s * 0.52, y - Math.sin(a) * s * 0.52);
        ctx.lineTo(x + Math.cos(a) * s * 0.52, y + Math.sin(a) * s * 0.52);
        ctx.stroke();
      }
      break;
    case 'multishot':
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.arc(x + i * s * 0.28, y + Math.abs(i) * s * 0.04, s * 0.14, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 'magnet':
      ctx.beginPath(); ctx.moveTo(x - s * 0.42, y - s * 0.45); ctx.lineTo(x - s * 0.1, y - s * 0.45); ctx.lineTo(x - s * 0.1, y + s * 0.18); ctx.arc(x, y + s * 0.18, s * 0.1, Math.PI, 0); ctx.lineTo(x + s * 0.1, y - s * 0.45); ctx.lineTo(x + s * 0.42, y - s * 0.45); ctx.lineTo(x + s * 0.42, y + s * 0.28); ctx.arc(x, y + s * 0.28, s * 0.42, 0, Math.PI, true); ctx.closePath(); ctx.fill();
      break;
    case 'pierce':
      ctx.beginPath(); ctx.moveTo(x - s * 0.45, y + s * 0.25); ctx.lineTo(x + s * 0.1, y - s * 0.32); ctx.lineTo(x + s * 0.45, y - s * 0.25); ctx.lineTo(x - s * 0.1, y + s * 0.32); ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
    case 'vampire':
      ctx.beginPath(); ctx.moveTo(x, y + s * 0.56); ctx.bezierCurveTo(x + s * 0.44, y + s * 0.18, x + s * 0.44, y - s * 0.28, x, y - s * 0.56); ctx.bezierCurveTo(x - s * 0.44, y - s * 0.28, x - s * 0.44, y + s * 0.18, x, y + s * 0.56); ctx.fill();
      break;
    case 'double_score':
      ctx.font = 'bold ' + Math.floor(s * 1.1) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('x2', x, y);
      break;
    case 'big_bullet':
      ctx.beginPath(); ctx.arc(x - s * 0.12, y, s * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x - s * 0.12, y - s * 0.2, s * 0.42, s * 0.4);
      break;
    case 'explosive':
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * s * 0.14, y + Math.sin(a) * s * 0.14); ctx.lineTo(x + Math.cos(a) * s * 0.54, y + Math.sin(a) * s * 0.54); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(x, y, s * 0.18, 0, Math.PI * 2); ctx.fill();
      break;
    case 'invisible':
      ctx.beginPath(); ctx.ellipse(x, y, s * 0.58, s * 0.34, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, s * 0.16, 0, Math.PI * 2); ctx.fill();
      break;
    case 'thorns':
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * s * 0.58, y + Math.sin(a) * s * 0.58); ctx.stroke();
      }
      break;
    case 'overdrive':
      drawTechCore(ctx, x, y, s * 0.28, '#fff4ca', '#ff9838');
      ctx.beginPath(); ctx.moveTo(x - s * 0.5, y + s * 0.28); ctx.lineTo(x + s * 0.5, y + s * 0.28); ctx.stroke();
      break;
    case 'timewarp':
      ctx.beginPath(); ctx.arc(x, y, s * 0.48, -Math.PI * 0.75, Math.PI * 1.15); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - s * 0.24); ctx.lineTo(x + s * 0.22, y + s * 0.08); ctx.stroke();
      break;
    case 'goldrush':
      drawTechCore(ctx, x, y, s * 0.34, '#fff7b0', '#f8b400');
      ctx.strokeStyle = '#4a3000';
      ctx.beginPath(); ctx.arc(x, y, s * 0.34, 0, Math.PI * 2); ctx.stroke();
      break;
    default:
      ctx.beginPath(); ctx.arc(x, y, s * 0.3 * pulse, 0, Math.PI * 2); ctx.fill();
  }
}

function drawFusionGlyph(ctx, fusionId, x, y, size) {
  const s = size;
  ctx.save();
  ctx.strokeStyle = 'rgba(246,229,170,0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, s * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  switch (fusionId) {
    case 'gold_magnet':
      drawPowerUpGlyph(ctx, { type:'magnet', x: x - s * 0.18, y }, s * 0.78);
      drawPowerUpGlyph(ctx, { type:'double_score', x: x + s * 0.28, y }, s * 0.72);
      break;
    case 'railgun_plus':
      drawPowerUpGlyph(ctx, { type:'railgun', x, y: y - s * 0.02 }, s * 0.84);
      ctx.strokeStyle = '#fff1b0';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x - s * 0.42, y + s * 0.34); ctx.lineTo(x + s * 0.42, y - s * 0.34); ctx.stroke();
      break;
    case 'frost_blast':
      drawPowerUpGlyph(ctx, { type:'freeze', x, y }, s * 0.82);
      ctx.strokeStyle = '#ffae7a';
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2 + Math.PI / 4;
        ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * s * 0.1, y + Math.sin(a) * s * 0.1); ctx.lineTo(x + Math.cos(a) * s * 0.5, y + Math.sin(a) * s * 0.5); ctx.stroke();
      }
      break;
    case 'undying_thorns':
      drawPowerUpGlyph(ctx, { type:'vampire', x: x - s * 0.12, y: y + s * 0.04 }, s * 0.8);
      drawPowerUpGlyph(ctx, { type:'thorns', x: x + s * 0.16, y: y - s * 0.04 }, s * 0.66);
      break;
    case 'bullet_storm':
      drawPowerUpGlyph(ctx, { type:'big_bullet', x: x - s * 0.12, y }, s * 0.8);
      drawPowerUpGlyph(ctx, { type:'multishot', x: x + s * 0.2, y }, s * 0.62);
      break;
    default:
      drawTechCore(ctx, x, y, s * 0.28, '#fff0fb', '#f3a8ff');
  }
}

function getBestiaryVisual(item) {
  if (item.unlocked === false) {
    const lockColor = item.color || '#58677a';
    return `<div class="bst-emblem locked-emblem" style="--lock-color:${escapeHtml(lockColor)}">
      <div class="bst-lock-frame"></div>
      <div class="bst-lock-sigil">?</div>
    </div>`;
  }
  if (item.fusionId) return `<canvas class="bst-preview-canvas" width="36" height="36" data-kind="fusion" data-id="${escapeHtml(item.fusionId)}"></canvas>`;
  if (item.powerType) return `<canvas class="bst-preview-canvas" width="36" height="36" data-kind="powerup" data-id="${escapeHtml(item.powerType)}" data-tier="${escapeHtml(item.tier || 'basic')}"></canvas>`;
  return `<div class="bst-emblem" style="--emblem-color:${escapeHtml(item.color || '#f49800')}">
    <div class="bst-emblem-inner">${getBestiaryGlyphSvg(item.iconType || 'diamond', item.color)}</div>
  </div>`;
}

function renderBestiaryCanvases() {
  const canvases = document.querySelectorAll('#bestiary-grid .bst-preview-canvas');
  canvases.forEach(canvas => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    const kind = canvas.dataset.kind;
    const id = canvas.dataset.id;
    if (kind === 'powerup') {
      const def = powerUpDefs.find(p => p.type === id);
      const accent = def ? def.color : '#f49800';
      const tier = normalizeItemTier(canvas.dataset.tier || (def && def.tier));
      const tc = ITEM_TIER_CONFIG[tier] || ITEM_TIER_CONFIG.basic;
      const outer = tier === 'relic' ? 16 : (tier === 'advanced' ? 15 : 14);
      const glow = tc.glowColor || accent;
      drawTechModuleShell(ctx, outer, 8.5, accent, glow);
      if (tier !== 'basic') {
        ctx.strokeStyle = glow;
        ctx.globalAlpha = tier === 'relic' ? 0.68 : 0.46;
        ctx.lineWidth = tier === 'relic' ? 1.2 : 0.9;
        ctx.beginPath();
        ctx.arc(0, 0, outer + 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      drawPowerUpGlyph(ctx, { type:id, x:0, y:0 }, 8.4);
    } else if (kind === 'fusion') {
      drawFusionRelicShell(ctx, 16, 9, '#f3a8ff', '#f6e5aa');
      drawFusionGlyph(ctx, id, 0, 0, 9.5);
    }
    ctx.restore();
  });
}

function drawBuffBadge(ctx, type, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  const outer = size;
  const inner = Math.max(3.5, size * 0.56);
  withGlow(ctx, color, 5, () => {
    drawTechModuleShell(ctx, outer, inner, color, color);
  });
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-outer * 0.55, 0);
  ctx.lineTo(outer * 0.55, 0);
  ctx.stroke();
  drawPowerUpGlyph(ctx, { type, x: 0, y: 0 }, inner * 0.88);
  ctx.restore();
}

function drawFusionRelicShell(ctx, outer, inner, accentColor, glowColor) {
  ctx.save();
  const pulse = Math.sin(Date.now() / 360) * 0.5 + 0.5;
  ctx.strokeStyle = accentColor;
  ctx.fillStyle = 'rgba(16,8,22,0.94)';
  ctx.lineWidth = 1.6;
  withGlow(ctx, glowColor || accentColor, 12 + pulse * 8, () => {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 4;
      const r = i % 2 === 0 ? outer : outer * 0.72;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
  ctx.strokeStyle = 'rgba(246,229,170,0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, inner + 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = accentColor;
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (inner + 2), Math.sin(a) * (inner + 2));
    ctx.lineTo(Math.cos(a) * (outer + 4), Math.sin(a) * (outer + 4));
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(246,229,170,0.16)';
  ctx.fillRect(-outer * 0.55, -1, outer * 1.1, 2);
  ctx.fillRect(-1, -outer * 0.55, 2, outer * 1.1);
  ctx.restore();
}

function drawSupplyChest(ctx, chest, t) {
  const pulse = Math.sin(t * 3.6 + chest.x * 0.08) * 0.5 + 0.5;
  const frame = chest.isBossChest ? '#ffe47b' : '#d59a54';
  const body = chest.isBossChest ? '#5f4310' : '#4d3120';
  const lid = chest.isBossChest ? '#b57b17' : '#8a5634';
  const glow = chest.isBossChest ? '#ffd64d' : '#f49800';
  ctx.save();
  ctx.translate(chest.x, chest.y);
  withGlow(ctx, glow, 10 + pulse * 6, () => {
    drawArmorPanel(ctx, -15, -10, 30, 20, body, frame, 4);
  });
  drawArmorPanel(ctx, -13, -9, 26, 8, lid, frame, 3);
  drawArmorPanel(ctx, -11, 0, 22, 7, 'rgba(18,22,28,0.86)', frame, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(-10, -7, 20, 2);
  ctx.fillStyle = chest.isBossChest ? '#7a5918' : '#6f4429';
  ctx.fillRect(-17, -7, 3, 14);
  ctx.fillRect(14, -7, 3, 14);
  ctx.strokeStyle = 'rgba(255,240,210,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-9, -12);
  ctx.lineTo(-3, -15);
  ctx.lineTo(3, -15);
  ctx.lineTo(9, -12);
  ctx.stroke();
  drawTechCore(ctx, 0, -1, chest.isBossChest ? 4.3 : 3.5, '#fff6d4', glow);
  ctx.strokeStyle = glow;
  ctx.lineWidth = chest.isBossChest ? 1.4 : 1;
  ctx.beginPath();
  ctx.arc(0, -16, chest.isBossChest ? 6 + pulse * 1.8 : 4.5 + pulse * 1.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-4, -16);
  ctx.lineTo(4, -16);
  ctx.moveTo(0, -20);
  ctx.lineTo(0, -12);
  ctx.stroke();
  if (chest.isBossChest) {
    ctx.strokeStyle = 'rgba(255,232,140,0.32)';
    ctx.beginPath();
    ctx.arc(0, 0, 19 + pulse * 1.6, -Math.PI * 0.18, Math.PI * 0.86);
    ctx.stroke();
  }
  ctx.restore();
}

const ENEMY_VISUAL_PROFILE = {
  normal: { glyph: '◇', iconType: 'diamond', color: '#7f8ea3', label: 'STANDARD', threat: '一般' },
  scout: { glyph: '◇', iconType: 'radar', color: '#ff7272', label: 'SCOUT', threat: '巡哨' },
  runner: { glyph: '⟫', iconType: 'chevron', color: '#ffbf72', label: 'RUSH', threat: '疾袭' },
  brute: { glyph: '⬒', iconType: 'shield', color: '#ca8cff', label: 'BULWARK', threat: '重铠' },
  artillery: { glyph: '⌁', iconType: 'crosshair', color: '#ff8bd4', label: 'ARTILLERY', threat: '弧炮' },
  heavy: { glyph: '⬒', iconType: 'plate', color: '#ff6767', label: 'ASSAULT', threat: '重装' },
  sniper: { glyph: '⟐', iconType: 'scope', color: '#8dff8d', label: 'PRECISION', threat: '狙击' },
  fast: { glyph: '⟫', iconType: 'streak', color: '#6bbcff', label: 'RAPID', threat: '高速' },
  flame: { glyph: '✦', iconType: 'flame', color: '#ff9a48', label: 'INCENDIARY', threat: '火焰' },
  summoner: { glyph: '◌', iconType: 'network', color: '#78e7ff', label: 'COMMAND', threat: '召唤' },
  stealth: { glyph: '⋄', iconType: 'ghost', color: '#b0b6c3', label: 'PHASE', threat: '隐匿' },
  splitter: { glyph: '⫶', iconType: 'segments', color: '#efb36a', label: 'SWARM', threat: '分裂' },
  regen: { glyph: '✚', iconType: 'cross', color: '#79f48d', label: 'REGEN', threat: '再生' },
  laser: { glyph: '⌁', iconType: 'beam', color: '#9ca8ff', label: 'BEAM', threat: '激光' },
  miner: { glyph: '▣', iconType: 'mine', color: '#f0c562', label: 'SAPPER', threat: '布雷' },
  barrier: { glyph: '⬡', iconType: 'dome', color: '#76fcff', label: 'BARRIER', threat: '护盾' },
  missile: { glyph: '➤', iconType: 'missile', color: '#ff9b7b', label: 'MISSILE', threat: '导弹' },
  warden: { glyph: '⌬', iconType: 'scales', color: '#f6e5aa', label: 'JUDICATOR', threat: '裁断' },
  phase: { glyph: '◇', iconType: 'rift', color: '#d9b6ff', label: 'RIFT', threat: '裂隙' },
  boss: { glyph: '◈', iconType: 'crown', color: '#ffd36f', label: 'BOSS', threat: '首领' },
  powerup: { glyph: '⬢', iconType: 'hexgear', color: '#f49800', label: 'MODULE', threat: '模组' },
  fusion: { glyph: '⟡', iconType: 'merged', color: '#f3a8ff', label: 'FUSION', threat: '融合' },
};


// --- SVG Glyphs for Bestiary & Lab ---
function getBestiaryGlyphSvg(iconType, color) {
  const c = color || '#7f8ea3';
  var m = {
    diamond: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><polygon points="10,2 17,10 10,18 3,10" fill="none" stroke="${c}" stroke-width="1.2" stroke-linejoin="round"/><circle cx="10" cy="10" r="2.5" fill="${c}" opacity="0.5"/></svg>`,
    radar: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="${c}" stroke-width="1.1"/><path d="M10 3 Q12 10 10 17" fill="none" stroke="${c}" stroke-width="1" stroke-linecap="round"/><circle cx="10" cy="10" r="1.5" fill="${c}"/><line x1="10" y1="3" x2="10" y2="6" stroke="${c}" stroke-width="0.8"/></svg>`,
    chevron: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><polyline points="4,7 10,4 16,7" fill="none" stroke="${c}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><polyline points="4,12 10,9 16,12" fill="none" stroke="${c}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><line x1="10" y1="4" x2="10" y2="16" stroke="${c}" stroke-width="0.7" stroke-linecap="round" opacity="0.5"/></svg>`,
    shield: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M10 2 L17 5 L17 12 Q17 17 10 19 Q3 17 3 12 L3 5 Z" fill="none" stroke="${c}" stroke-width="1.2" stroke-linejoin="round"/><line x1="10" y1="7" x2="10" y2="14" stroke="${c}" stroke-width="1.1" stroke-linecap="round"/><line x1="7" y1="10" x2="13" y2="10" stroke="${c}" stroke-width="1.1" stroke-linecap="round"/></svg>`,
    crosshair: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="none" stroke="${c}" stroke-width="1"/><line x1="10" y1="2" x2="10" y2="6" stroke="${c}" stroke-width="1.1" stroke-linecap="round"/><line x1="10" y1="14" x2="10" y2="18" stroke="${c}" stroke-width="1.1" stroke-linecap="round"/><line x1="2" y1="10" x2="6" y2="10" stroke="${c}" stroke-width="1.1" stroke-linecap="round"/><line x1="14" y1="10" x2="18" y2="10" stroke="${c}" stroke-width="1.1" stroke-linecap="round"/><circle cx="10" cy="10" r="1.5" fill="${c}" opacity="0.6"/></svg>`,
    plate: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><rect x="4" y="4" width="12" height="12" rx="2" fill="none" stroke="${c}" stroke-width="1.2"/><rect x="7" y="7" width="6" height="6" rx="1.5" fill="none" stroke="${c}" stroke-width="0.8"/><circle cx="10" cy="10" r="1.2" fill="${c}" opacity="0.7"/></svg>`,
    scope: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="${c}" stroke-width="1"/><circle cx="10" cy="10" r="2.5" fill="none" stroke="${c}" stroke-width="0.9"/><line x1="2" y1="2" x2="7" y2="7" stroke="${c}" stroke-width="0.9" stroke-linecap="round"/><line x1="18" y1="2" x2="13" y2="7" stroke="${c}" stroke-width="0.9" stroke-linecap="round"/><line x1="2" y1="18" x2="7" y2="13" stroke="${c}" stroke-width="0.9" stroke-linecap="round"/><line x1="18" y1="18" x2="13" y2="13" stroke="${c}" stroke-width="0.9" stroke-linecap="round"/><circle cx="10" cy="10" r="0.8" fill="${c}"/></svg>`,
    streak: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><polyline points="3,17 10,10 17,3" fill="none" stroke="${c}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><polyline points="10,10 10,3 17,3" fill="none" stroke="${c}" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><circle cx="3" cy="17" r="1.2" fill="${c}"/></svg>`,
    flame: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M10 18 Q6 12 7 8 Q8 4 10 2 Q12 4 13 8 Q14 12 10 18 Z" fill="none" stroke="${c}" stroke-width="1.1" stroke-linejoin="round"/><path d="M10 16 Q8 12 9 9 Q9.5 6 10 4 Q10.5 6 11 9 Q12 12 10 16 Z" fill="none" stroke="${c}" stroke-width="0.8"/><circle cx="10" cy="12" r="1" fill="${c}" opacity="0.7"/></svg>`,
    network: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="1.8" fill="${c}"/><circle cx="3" cy="5" r="1.3" fill="${c}" opacity="0.6"/><circle cx="17" cy="5" r="1.3" fill="${c}" opacity="0.6"/><circle cx="5" cy="17" r="1.3" fill="${c}" opacity="0.6"/><circle cx="15" cy="17" r="1.3" fill="${c}" opacity="0.6"/><line x1="10" y1="8.5" x2="4" y2="6" stroke="${c}" stroke-width="0.6" opacity="0.4"/><line x1="10" y1="8.5" x2="16" y2="6" stroke="${c}" stroke-width="0.6" opacity="0.4"/><line x1="7" y1="15" x2="5" y2="15.5" stroke="${c}" stroke-width="0.6" opacity="0.4"/><line x1="13" y1="15" x2="15" y2="15.5" stroke="${c}" stroke-width="0.6" opacity="0.4"/></svg>`,
    ghost: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M10 3 Q5 3 5 8 L5 15 Q5 17 6.5 15 L9 17 L10 15 L11 17 L13.5 15 L15 17 Q15 15 15 15 L15 8 Q15 3 10 3 Z" fill="none" stroke="${c}" stroke-width="1" stroke-linejoin="round" opacity="0.6"/><line x1="8" y1="8" x2="12" y2="8" stroke="${c}" stroke-width="0.7" stroke-linecap="round" opacity="0.5"/><line x1="8" y1="11" x2="12" y2="11" stroke="${c}" stroke-width="0.7" stroke-linecap="round" opacity="0.5"/></svg>`,
    segments: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="none" stroke="${c}" stroke-width="0.8" stroke-dasharray="1.5 2"/><circle cx="10" cy="10" r="3" fill="none" stroke="${c}" stroke-width="0.8" stroke-dasharray="0.8 1.5"/><circle cx="10" cy="10" r="1" fill="${c}" opacity="0.5"/><line x1="10" y1="4" x2="10" y2="0.5" stroke="${c}" stroke-width="0.7" stroke-linecap="round"/><line x1="16" y1="10" x2="19.5" y2="10" stroke="${c}" stroke-width="0.7" stroke-linecap="round"/><line x1="10" y1="16" x2="10" y2="19.5" stroke="${c}" stroke-width="0.7" stroke-linecap="round"/></svg>`,
    cross: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><rect x="8" y="3" width="4" height="14" rx="1" fill="none" stroke="${c}" stroke-width="1.1"/><rect x="3" y="8" width="14" height="4" rx="1" fill="none" stroke="${c}" stroke-width="1.1"/><circle cx="10" cy="10" r="2" fill="${c}" opacity="0.35"/></svg>`,
    beam: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><line x1="10" y1="2" x2="10" y2="18" stroke="${c}" stroke-width="1.2" stroke-linecap="round"/><line x1="4" y1="6" x2="10" y2="10" stroke="${c}" stroke-width="0.6" stroke-linecap="round" opacity="0.5"/><line x1="16" y1="6" x2="10" y2="10" stroke="${c}" stroke-width="0.6" stroke-linecap="round" opacity="0.5"/><line x1="4" y1="14" x2="10" y2="10" stroke="${c}" stroke-width="0.6" stroke-linecap="round" opacity="0.5"/><line x1="16" y1="14" x2="10" y2="10" stroke="${c}" stroke-width="0.6" stroke-linecap="round" opacity="0.5"/><circle cx="10" cy="10" r="2" fill="${c}" opacity="0.4"/></svg>`,
    mine: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><polygon points="10,2 13,7 18,7 14,11 16,16 10,13 4,16 6,11 2,7 7,7" fill="none" stroke="${c}" stroke-width="1" stroke-linejoin="round"/><circle cx="10" cy="9" r="2.5" fill="${c}" opacity="0.35"/><circle cx="10" cy="9" r="1" fill="${c}" opacity="0.6"/></svg>`,
    dome: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M3 14 Q10 2 17 14" fill="none" stroke="${c}" stroke-width="1.2" stroke-linecap="round"/><line x1="3" y1="14" x2="3" y2="18" stroke="${c}" stroke-width="1" stroke-linecap="round"/><line x1="17" y1="14" x2="17" y2="18" stroke="${c}" stroke-width="1" stroke-linecap="round"/><line x1="3" y1="16" x2="17" y2="16" stroke="${c}" stroke-width="0.6" stroke-dasharray="1.5 1.5" opacity="0.5"/><polygon points="10,5 12,11 8,11" fill="none" stroke="${c}" stroke-width="0.9"/></svg>`,
    missile: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><polygon points="18,10 6,5 6,15" fill="none" stroke="${c}" stroke-width="1.1" stroke-linejoin="round"/><rect x="2" y="6" width="5" height="8" rx="1" fill="none" stroke="${c}" stroke-width="1"/><line x1="6" y1="10" x2="1" y2="10" stroke="${c}" stroke-width="0.8" stroke-linecap="round"/><circle cx="15" cy="10" r="1" fill="${c}" opacity="0.5"/></svg>`,
    scales: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><line x1="10" y1="2" x2="10" y2="5" stroke="${c}" stroke-width="0.8" stroke-linecap="round"/><path d="M3 5 L17 5 L10 10 Z" fill="none" stroke="${c}" stroke-width="1" stroke-linejoin="round"/><line x1="5" y1="7" x2="5" y2="15" stroke="${c}" stroke-width="0.8" stroke-linecap="round"/><line x1="15" y1="7" x2="15" y2="15" stroke="${c}" stroke-width="0.8" stroke-linecap="round"/><path d="M2 15 L8 15 M12 15 L18 15" fill="none" stroke="${c}" stroke-width="0.8" stroke-linecap="round"/><circle cx="5" cy="14" r="1" fill="${c}" opacity="0.5"/><circle cx="15" cy="14" r="1" fill="${c}" opacity="0.5"/></svg>`,
    rift: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><ellipse cx="10" cy="10" rx="7" ry="2" fill="none" stroke="${c}" stroke-width="1.1" transform="rotate(-30 10 10)"/><ellipse cx="10" cy="10" rx="7" ry="2" fill="none" stroke="${c}" stroke-width="0.9" transform="rotate(30 10 10)"/><ellipse cx="10" cy="10" rx="4.5" ry="1.2" fill="none" stroke="${c}" stroke-width="0.7"/><circle cx="10" cy="10" r="1.8" fill="${c}" opacity="0.4"/></svg>`,
    crown: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><polyline points="3,14 5,5 10,9 15,5 17,14" fill="none" stroke="${c}" stroke-width="1.2" stroke-linejoin="round"/><rect x="3" y="14" width="14" height="3" rx="0.5" fill="none" stroke="${c}" stroke-width="1"/><circle cx="10" cy="7" r="2" fill="none" stroke="${c}" stroke-width="0.7"/><circle cx="10" cy="7" r="0.8" fill="${c}" opacity="0.6"/></svg>`,
    hexgear: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><polygon points="10,1.5 15.5,4.5 15.5,10.5 10,13.5 4.5,10.5 4.5,4.5" fill="none" stroke="${c}" stroke-width="1.1" stroke-linejoin="round"/><circle cx="10" cy="7.5" r="2.8" fill="none" stroke="${c}" stroke-width="0.8"/><circle cx="10" cy="7.5" r="1" fill="${c}" opacity="0.5"/><line x1="10" y1="4.5" x2="10" y2="2" stroke="${c}" stroke-width="0.7"/></svg>`,
    merged: `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><circle cx="6" cy="7" r="4" fill="none" stroke="${c}" stroke-width="0.9" opacity="0.5"/><circle cx="14" cy="13" r="4" fill="none" stroke="${c}" stroke-width="0.9" opacity="0.5"/><circle cx="10" cy="10" r="5" fill="none" stroke="${c}" stroke-width="1.2"/><circle cx="10" cy="10" r="2" fill="none" stroke="${c}" stroke-width="0.8"/><circle cx="10" cy="10" r="0.8" fill="${c}" opacity="0.6"/></svg>`
  };
  return m[iconType] || m.diamond;
}
function getEnemyVisualProfile(type) {
  return ENEMY_VISUAL_PROFILE[type] || ENEMY_VISUAL_PROFILE.normal;
}

function drawEnemyMarker(ctx, x, y, type, size, accentOverride) {
  const profile = getEnemyVisualProfile(type);
  const accent = accentOverride || profile.color;
  const outer = size || 10;
  const inner = Math.max(4, outer * 0.58);
  ctx.save();
  ctx.translate(x, y);
  // Outer faction ring with subtle pulse
  const ringPulse = 0.16 + Math.sin(Date.now() / 380 + x * 0.03) * 0.06;
  ctx.strokeStyle = accent;
  ctx.globalAlpha = ringPulse;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, outer + 2.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  // Tech shell - hexagonal base with radial gradient
  const shellGrad = ctx.createRadialGradient(0, 0, inner * 0.12, 0, 0, outer);
  shellGrad.addColorStop(0, 'rgba(255,255,255,0.14)');
  shellGrad.addColorStop(0.4, accent);
  shellGrad.addColorStop(1, 'rgba(5,10,16,0.94)');
  ctx.fillStyle = shellGrad;
  traceHexCell(ctx, outer, 3);
  ctx.fill();
  ctx.strokeStyle = 'rgba(220,235,255,0.16)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Inner dark core
  ctx.fillStyle = 'rgba(5,12,18,0.82)';
  ctx.beginPath();
  ctx.arc(0, 0, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, inner + 1, 0, Math.PI * 2);
  ctx.stroke();
  // Procedural role icon
  drawEnemyRoleIcon(ctx, profile.iconType || 'diamond', inner * 0.7, accent);
  ctx.restore();
}

function drawEnemyRoleIcon(ctx, iconType, r, color) {
  const s = r * 1.05;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1, r * 0.22);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = r * 0.35;

  switch (iconType) {
    case 'radar': // Scout - radar dish / eye
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.7, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.68);
      ctx.lineTo(0, -s * 0.92);
      ctx.stroke();
      break;

    case 'chevron': // Runner - speed chevron
      ctx.beginPath();
      ctx.moveTo(s * 0.75, 0);
      ctx.lineTo(0, -s * 0.7);
      ctx.lineTo(-s * 0.1, 0);
      ctx.moveTo(s * 0.75, 0);
      ctx.lineTo(0, s * 0.7);
      ctx.lineTo(-s * 0.1, 0);
      ctx.stroke();
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(s * 0.45, 0);
      ctx.lineTo(-s * 0.25, -s * 0.48);
      ctx.moveTo(s * 0.45, 0);
      ctx.lineTo(-s * 0.25, s * 0.48);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;

    case 'shield': // Brute/Bulwark - heavy shield
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.85);
      ctx.lineTo(s * 0.7, -s * 0.4);
      ctx.lineTo(s * 0.7, s * 0.35);
      ctx.lineTo(0, s * 0.85);
      ctx.lineTo(-s * 0.7, s * 0.35);
      ctx.lineTo(-s * 0.7, -s * 0.4);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.25;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.3);
      ctx.lineTo(0, s * 0.3);
      ctx.stroke();
      break;

    case 'crosshair': // Artillery - crosshair with arc
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.9, 0);
      ctx.lineTo(-s * 0.5, 0);
      ctx.moveTo(s * 0.5, 0);
      ctx.lineTo(s * 0.9, 0);
      ctx.moveTo(0, -s * 0.9);
      ctx.lineTo(0, -s * 0.5);
      ctx.moveTo(0, s * 0.5);
      ctx.lineTo(0, s * 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, s * 0.15, s * 0.65, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      break;

    case 'plate': // Heavy assault - armored plate
      ctx.strokeRect(-s * 0.7, -s * 0.55, s * 1.4, s * 1.1);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.2;
      ctx.fillRect(-s * 0.7, -s * 0.55, s * 1.4, s * 1.1);
      ctx.globalAlpha = 1;
      // Internal notches
      for (let nx = -s * 0.4; nx <= s * 0.4; nx += s * 0.4) {
        ctx.beginPath();
        ctx.moveTo(nx, -s * 0.55);
        ctx.lineTo(nx, -s * 0.25);
        ctx.stroke();
      }
      break;

    case 'scope': // Sniper - precision scope with dot
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = Math.max(0.8, r * 0.12);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, 0);
      ctx.lineTo(-s * 0.85, 0);
      ctx.moveTo(s * 0.5, 0);
      ctx.lineTo(s * 0.85, 0);
      ctx.moveTo(0, -s * 0.5);
      ctx.lineTo(0, -s * 0.85);
      ctx.moveTo(0, s * 0.5);
      ctx.lineTo(0, s * 0.85);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;

    case 'streak': // Fast - speed lines
      ctx.beginPath();
      ctx.moveTo(s * 0.8, -s * 0.6);
      ctx.lineTo(0, 0);
      ctx.lineTo(s * 0.8, s * 0.6);
      ctx.stroke();
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(s * 0.45, -s * 0.45);
      ctx.lineTo(-s * 0.3, -s * 0.1);
      ctx.moveTo(s * 0.45, s * 0.45);
      ctx.lineTo(-s * 0.3, s * 0.1);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;

    case 'flame': // Flame/Incendiary
      ctx.beginPath();
      ctx.moveTo(0, s * 0.8);
      ctx.quadraticCurveTo(-s * 0.55, s * 0.25, -s * 0.35, -s * 0.15);
      ctx.quadraticCurveTo(-s * 0.2, -s * 0.55, 0, -s * 0.85);
      ctx.quadraticCurveTo(s * 0.2, -s * 0.55, s * 0.35, -s * 0.15);
      ctx.quadraticCurveTo(s * 0.55, s * 0.25, 0, s * 0.8);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
      break;

    case 'network': // Summoner/Command - three linked nodes
      const na = s * 0.5;
      ctx.beginPath();
      ctx.arc(0, -na, s * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-na * 0.87, na * 0.5, s * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(na * 0.87, na * 0.5, s * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = Math.max(0.6, r * 0.12);
      ctx.beginPath();
      ctx.moveTo(0, -na);
      ctx.lineTo(-na * 0.87, na * 0.5);
      ctx.lineTo(na * 0.87, na * 0.5);
      ctx.closePath();
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;

    case 'ghost': // Stealth/Phase - fading diamond
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.8);
      ctx.lineTo(s * 0.6, 0);
      ctx.lineTo(0, s * 0.8);
      ctx.lineTo(-s * 0.6, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
      break;

    case 'segments': // Splitter/Swarm - three horizontal segments
      for (let sx = -s * 0.5; sx <= s * 0.5; sx += s * 0.5) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sx, 0, s * 0.18, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = Math.max(0.5, r * 0.1);
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, 0);
      ctx.lineTo(s * 0.5, 0);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;

    case 'cross': // Regen - medical cross
      ctx.fillStyle = color;
      ctx.fillRect(-s * 0.18, -s * 0.65, s * 0.36, s * 1.3);
      ctx.fillRect(-s * 0.65, -s * 0.18, s * 1.3, s * 0.36);
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = Math.max(0.5, r * 0.1);
      ctx.strokeRect(-s * 0.65, -s * 0.18, s * 1.3, s * 0.36);
      ctx.globalAlpha = 1;
      break;

    case 'beam': // Laser - horizontal beam
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = Math.max(0.8, r * 0.15);
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(-s * 0.85, 0);
      ctx.lineTo(s * 0.85, 0);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1.2, r * 0.25);
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(-s * 0.5, 0);
      ctx.lineTo(s * 0.5, 0);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-s * 0.55, 0, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'mine': // Miner/Sapper - diamond mine
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.8);
      ctx.lineTo(s * 0.7, 0);
      ctx.lineTo(0, s * 0.8);
      ctx.lineTo(-s * 0.7, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'dome': // Barrier - shield dome
      ctx.beginPath();
      ctx.arc(0, s * 0.1, s * 0.7, Math.PI, 0);
      ctx.stroke();
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.moveTo(-s * 0.7, s * 0.1);
      ctx.lineTo(s * 0.7, s * 0.1);
      ctx.stroke();
      break;

    case 'missile': // Missile - arrow with exhaust
      ctx.beginPath();
      ctx.moveTo(s * 0.8, 0);
      ctx.lineTo(0, -s * 0.4);
      ctx.lineTo(-s * 0.35, 0);
      ctx.lineTo(0, s * 0.4);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.25;
      ctx.fill();
      ctx.globalAlpha = 1;
      // Exhaust lines
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.moveTo(-s * 0.35, -s * 0.2);
      ctx.lineTo(-s * 0.7, 0);
      ctx.lineTo(-s * 0.35, s * 0.2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;

    case 'scales': // Warden/Judicator - scales of judgment
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.75);
      ctx.lineTo(0, s * 0.75);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.65, -s * 0.3);
      ctx.lineTo(s * 0.65, s * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-s * 0.45, -s * 0.35, s * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s * 0.45, s * 0.25, s * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;

    case 'rift': // Phase/Rift - broken circle
      ctx.setLineDash([s * 0.35, s * 0.25]);
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;

    case 'crown': // Boss - crown/star
      for (let ci = 0; ci < 5; ci++) {
        const ca = (ci / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ca) * s * 0.35, Math.sin(ca) * s * 0.35);
        ctx.lineTo(Math.cos(ca) * s * 0.8, Math.sin(ca) * s * 0.8);
        ctx.stroke();
      }
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;

    case 'hexgear': // Powerup - hex gear
      ctx.beginPath();
      for (let gi = 0; gi < 6; gi++) {
        const ga = (gi / 6) * Math.PI * 2;
        const gx = Math.cos(ga) * s * 0.5;
        const gy = Math.sin(ga) * s * 0.5;
        if (gi === 0) ctx.moveTo(gx, gy);
        else ctx.lineTo(gx, gy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'merged': // Fusion - merged circles
      ctx.beginPath();
      ctx.arc(-s * 0.25, 0, s * 0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s * 0.25, 0, s * 0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;

    default: // Diamond (normal/default)
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.75);
      ctx.lineTo(s * 0.55, 0);
      ctx.lineTo(0, s * 0.75);
      ctx.lineTo(-s * 0.55, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
  }
  ctx.restore();
}

function drawEnemyInfoPlate(ctx, x, y, w, hpRatio, accent, name, label, extraText) {
  const width = w || 92;
  const height = 28;
  const ratio = Math.max(0, Math.min(1, hpRatio || 0));
  ctx.save();
  ctx.translate(x, y);
  const hw = -width / 2, hh = -height / 2;
  drawArmorPanel(ctx, hw, hh, width, height, 'rgba(5,9,14,0.88)', 'rgba(160,200,230,0.14)', 4);
  const stripeGrad = ctx.createLinearGradient(hw, 0, hw + 5, 0);
  stripeGrad.addColorStop(0, accent);
  stripeGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = stripeGrad;
  ctx.fillRect(hw + 2, hh + 2, 4, height - 4);
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = 'bold 9px "Courier New",monospace';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(label, hw + 12, hh + 7);
  ctx.fillStyle = '#d8e0eb';
  ctx.font = 'bold 11px "Segoe UI","Microsoft YaHei",sans-serif';
  ctx.fillText(name, hw + 12, hh + 18);
  const barX = hw + 10, barY = hh + height - 10, barW = width - 24, barH = 5;
  ctx.fillStyle = 'rgba(15,22,30,0.7)';
  ctx.fillRect(barX, barY, barW, barH);
  for (let n = 1; n < 4; n++) {
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(barX + barW * n / 4, barY + 1); ctx.lineTo(barX + barW * n / 4, barY + barH - 1); ctx.stroke();
  }
  const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  if (ratio > 0.6) { hpGrad.addColorStop(0, '#7ae880'); hpGrad.addColorStop(1, accent); }
  else if (ratio > 0.3) { hpGrad.addColorStop(0, '#f4b840'); hpGrad.addColorStop(1, '#ff7a3d'); }
  else { hpGrad.addColorStop(0, '#ff5a4a'); hpGrad.addColorStop(1, '#d42030'); }
  ctx.fillStyle = hpGrad;
  ctx.fillRect(barX, barY, barW * ratio, barH);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 0.8;
  ctx.strokeRect(barX, barY, barW, barH);
  if (extraText) {
    ctx.fillStyle = accent; ctx.globalAlpha = 0.7;
    ctx.font = '8px "Courier New",monospace'; ctx.textAlign = 'right';
    ctx.fillText(extraText, hw + width - 12, hh + 18); ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function getEliteDescription(special) {
  switch (special) {
    case 'heavy': return '40%概率格挡伤害，高血量';
    case 'sniper': return '高速远程精准射击';
    case 'fast': return '极快移速，双发齐射';
    case 'flame': return '扇形五连火焰弹幕';
    case 'summoner': return '周期性召唤小兵增援';
    case 'stealth': return '周期性隐身，降低被命中率';
    case 'splitter': return '定期自我增殖，越拖越多';
    case 'regen': return '周期性自动恢复生命值';
    case 'laser': return '高速穿透激光束';
    case 'miner': return '布置触碰爆炸的地雷';
    case 'barrier': return '周期性再生护盾，免疫伤害';
    case 'missile': return '发射追踪导弹，远程威胁';
    case 'warden': return '预告裁断线后齐射，逼迫玩家提前换位';
    case 'phase': return '短距折跃并释放裂隙弹，擅长扰乱安全区';
    default: return '强大的精英敌人';
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderMoonstoneChip(amount, extra = '') {
  const safeExtra = extra ? `<span class="moonstone-extra">${escapeHtml(extra)}</span>` : '';
  return `<span class="moonstone-chip ${extra ? 'has-extra' : ''}">
    <span class="moonstone-crystal" aria-hidden="true"></span>
    <span class="moonstone-label">MOONSTONE</span>
    <span class="moonstone-value">${escapeHtml(amount)}</span>
    ${safeExtra}
  </span>`;
}

function groupBestiaryItems(items, tab) {
  if (!items.length) return items;
  const tierOrder = { relic:3, advanced:2, basic:1 };
  const sortFn = (a, b) => {
    // Sort by tier (relic > advanced > basic), then by name
    const ta = tierOrder[a.tier] || 0;
    const tb = tierOrder[b.tier] || 0;
    if (ta !== tb) return tb - ta;
    return (a.name || '').localeCompare(b.name || '');
  };

  const groups = [];
  if (tab === 'items_basic') {
    const cats = {
      '火力强化': { pred: t => ['railgun','rapid','multishot','big_bullet','explosive','overdrive','pierce'].includes(t.powerType), color: '#ff5a4a' },
      '生存保障': { pred: t => ['shield','repair','vampire','invisible','thorns'].includes(t.powerType), color: '#5ee870' },
      '机动支援': { pred: t => ['speed','magnet','ricochet','freeze','double_score','timewarp','goldrush'].includes(t.powerType), color: '#60b0ff' },
    };
    for (const [label, cfg] of Object.entries(cats)) {
      const grp = items.filter(cfg.pred).sort(sortFn);
      if (grp.length) { groups.push({ _isHeader: true, name: label, count: grp.length, color: cfg.color }); groups.push(...grp); }
    }
    const used = new Set(Object.values(cats).flatMap(cfg => items.filter(cfg.pred).map(i => i.powerType)));
    const rest = items.filter(i => !used.has(i.powerType)).sort(sortFn);
    if (rest.length) { groups.push({ _isHeader: true, name: '其他', count: rest.length, color: '#888' }); groups.push(...rest); }
    return groups;
  }
  if (tab === 'enemies_elite' || tab === 'enemies_boss' || tab === 'enemies_normal') {
    const factions = {};
    for (const e of items) {
      const f = e.faction || '未知势力';
      if (!factions[f]) factions[f] = [];
      factions[f].push(e);
    }
    const factionColors = {
      '月面兵工厂': '#ff4040', '虚空教派': '#a080f0', '灰域教会': '#ffb060',
      '风暴修会': '#60d0ff', '观星台': '#80d0f0', '灰域残骸群': '#ff8040',
    };
    const sortedFactions = Object.entries(factions).sort((a, b) => b[1].length - a[1].length);
    for (const [fname, ents] of sortedFactions) {
      ents.sort((a, b) => (b.threat || b.hp || 0) - (a.threat || a.hp || 0));
      groups.push({ _isHeader: true, name: fname, count: ents.length, color: factionColors[fname] || '#888' });
      groups.push(...ents);
    }
    return groups;
  }
  if (tab === 'items_fusion') {
    groups.push({ _isHeader: true, name: '融合协议', count: items.length });
    groups.push(...items);
    return groups;
  }
  return items;
}

function buildBestiaryRow(it) {
  if (it._isHeader) {
    const hdrColor = it.color || '#f49800';
    return `<div class="best-group-header" style="--hdr-color:${hdrColor}">
      <span style="color:${hdrColor}">&#9656; ${escapeHtml(it.name)}</span>
      <span class="bst-count">${it.count} 项</span>
    </div>`;
  }
  const unlocked = it.unlocked !== false;
  const threatColor = unlocked ? (it.color || '#f49800') : '#58677a';
  const name = unlocked ? it.name : (it.lockedName || '未解锁档案');
  const desc = unlocked ? it.desc : (it.lockedDesc || '???');
  const lore = unlocked ? it.lore : '档案加密中。遭遇、拾取或完成对应协议后，图鉴将自动解锁记录。';
  const tag = unlocked ? it.tag : 'LOCKED';
  const subTag = unlocked ? it.subTag : '资料封存';
  const threatLevel = unlocked ? Math.min(5, Math.ceil((it.threat || 2) / 2)) : 0;
  const threatDots = Array.from({length: 5}, (_, i) =>
    `<span class="bst-threat-dot ${i < threatLevel ? 'active' : ''}" style="${i < threatLevel ? '--dot-color:' + threatColor : ''}"></span>`
  ).join('');
  const factionBadge = unlocked && it.faction ? `<span class="bst-faction-badge" style="--faction-color:${escapeHtml(it.factionColor || threatColor)}">${escapeHtml(it.faction)}</span>` : '';
  return `<div class="best-row ${unlocked ? 'unlocked' : 'locked'}" tabindex="0" style="--threat:${escapeHtml(threatColor)}">
    <div class="bst-icon">${getBestiaryVisual(it)}</div>
    <div class="bst-info">
      <div class="bst-head">
        <div class="bst-name">${escapeHtml(name)}</div>
        <div class="bst-class">${escapeHtml(it.classLabel || '')}</div>
      </div>
      <div class="bst-desc">${escapeHtml(desc)}</div>
      ${unlocked ? `<div class="bst-threat-row">${threatDots}</div>` : ''}
      <div class="bst-meta">
        ${factionBadge}
        <span class="bst-tag">${escapeHtml(tag || '')}</span>
        ${subTag ? `<span class="bst-tag">${escapeHtml(subTag)}</span>` : ''}
      </div>
      ${lore ? `<div class="bst-lore"><span>档案</span>${escapeHtml(lore)}</div>` : ''}
    </div>
  </div>`;
}

// --- Bullets ---
class Bullet {
  constructor(x, y, angle, speed, color, fromPlayer, damage) {
    this.x = x; this.y = y;
    this.angle = angle;
    this.color = color;
    this.fromPlayer = fromPlayer;
    this.speed = fromPlayer ? speed : speed * getEnemyBulletSpeedMul();
    this.damage = damage || 1;
    this.radius = 3;
    this.alive = true;
    this.ricochet = false;
    this.railgun = false;
    this.freeze = false;
    this.pierce = false;
    this.explosive = false;
    this.bounces = 0;
    this.homing = false;
    this.homingStrength = 0;
    this.drainOnHit = 0;
    this.shardBurst = 0;
  }
  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // Homing: player shots hunt enemies; enemy missiles only bend lightly toward the player.
    if (this.homing) {
      let targetObj = null;
      let nearestDist = this.fromPlayer ? 200 : 520;
      if (this.fromPlayer) {
        for (const enemy of enemies) {
          if (!enemy.alive) continue;
          const hdx = enemy.x - this.x, hdy = enemy.y - this.y;
          const hd = Math.sqrt(hdx * hdx + hdy * hdy);
          if (hd < nearestDist) { nearestDist = hd; targetObj = enemy; }
        }
      } else if (player && player.alive && buffs.invisible <= 0) {
        const hdx = player.x - this.x, hdy = player.y - this.y;
        const hd = Math.sqrt(hdx * hdx + hdy * hdy);
        if (hd < nearestDist) targetObj = player;
      }
      if (targetObj) {
        const target = Math.atan2(targetObj.y - this.y, targetObj.x - this.x);
        let diff = target - this.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const steer = this.fromPlayer ? (this.homingStrength || 0.03) : Math.min(0.024, this.homingStrength || 0.014);
        this.angle += Math.sign(diff) * Math.min(Math.abs(diff), steer);
      }
    }

    // Ricochet off walls
    if (this.ricochet && this.bounces > 0) {
      let bounced = false;
      if (this.x < 5) { this.x = 5; this.angle = Math.PI - this.angle; bounced = true; }
      if (this.x > W - 5) { this.x = W - 5; this.angle = Math.PI - this.angle; bounced = true; }
      if (this.y < 5) { this.y = 5; this.angle = -this.angle; bounced = true; }
      if (this.y > H - 5) { this.y = H - 5; this.angle = -this.angle; bounced = true; }
      if (bounced) this.bounces--;
    }

    if (this.x < -20 || this.x > W + 20 || this.y < -20 || this.y > H + 20) {
      this.alive = false;
    }
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.railgun ? 12 : 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    if (this.railgun) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(this.x - Math.cos(this.angle) * 12, this.y - Math.sin(this.angle) * 12);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }
}

// --- Tanks ---
class Tank {
  constructor(x, y, color, turretColor, speed, hp) {
    this.x = x; this.y = y;
    this.width = 36; this.height = 36;
    this.color = color;
    this.turretColor = turretColor;
    this.speed = speed;
    this.hp = hp;
    this.maxHp = hp;
    this.turretAngle = 0;
    this.alive = true;
    this.shootCooldown = 0;
    this.shootDelay = 40;
    this.fireSlowTimer = 0;
    this.fireSlowDuration = 0;
    this.fireSlowMul = 1;
  }
  applyFireSlow(duration = 18, mul = 0.72) {
    const safeDuration = Math.max(1, Math.floor(Number.isFinite(duration) ? duration : 18));
    const safeMul = Math.max(0.35, Math.min(1, Number.isFinite(mul) ? mul : 0.72));
    const currentMul = this.fireSlowTimer > 0 ? (this.fireSlowMul || 1) : 1;
    this.fireSlowTimer = safeDuration;
    this.fireSlowDuration = safeDuration;
    this.fireSlowMul = Math.min(currentMul, safeMul);
  }
  getFireSlowMultiplier() {
    if (!this.fireSlowTimer || this.fireSlowTimer <= 0) return 1;
    const ratio = Math.max(0, Math.min(1, this.fireSlowTimer / Math.max(1, this.fireSlowDuration || this.fireSlowTimer)));
    return 1 - (1 - (this.fireSlowMul || 1)) * ratio;
  }
  tickFireSlow() {
    if (!this.fireSlowTimer || this.fireSlowTimer <= 0) return;
    this.fireSlowTimer--;
    if (this.fireSlowTimer <= 0) {
      this.fireSlowTimer = 0;
      this.fireSlowDuration = 0;
      this.fireSlowMul = 1;
    }
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Tracks
    ctx.fillStyle = '#222';
    ctx.fillRect(-19, -14, 6, 28);
    ctx.fillRect(13, -14, 6, 28);

    // Track treads
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = -12; i < 14; i += 5) {
      ctx.beginPath();
      ctx.moveTo(-18, i); ctx.lineTo(-14, i); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(14, i); ctx.lineTo(18, i); ctx.stroke();
    }

    // Body
    ctx.fillStyle = this.color;
    ctx.fillRect(-15, -12, 30, 24);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-15, -12, 30, 24);

    // Body detail
    ctx.fillStyle = this.darken(this.color, 0.7);
    ctx.fillRect(-10, -8, 20, 16);

    // Turret base
    ctx.fillStyle = this.turretColor;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Turret barrel
    ctx.save();
    ctx.rotate(this.turretAngle);
    ctx.fillStyle = this.turretColor;
    ctx.fillRect(3, -3, 16, 6);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(3, -3, 16, 6);
    ctx.restore();

    // HP bar
    if (this.hp < this.maxHp) {
      const barW = 30, barH = 4;
      ctx.fillStyle = '#400';
      ctx.fillRect(-barW/2, -24, barW, barH);
      ctx.fillStyle = '#0f0';
      ctx.fillRect(-barW/2, -24, barW * (this.hp / this.maxHp), barH);
    }
    ctx.restore();
  }
  darken(color, factor) {
    const r = parseInt(color.slice(1,3), 16) * factor;
    const g = parseInt(color.slice(3,5), 16) * factor;
    const b = parseInt(color.slice(5,7), 16) * factor;
    return `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
  }
}

class PlayerTank extends Tank {
  constructor(tankType, inputSource) {
    const type = getPlayerTankDefinition(tankType || 'spread');
    const baseHp = difficultySettings[currentDifficulty].playerHp;
    super(W/2, H - 70, type.color, type.turret, type.speed, Math.max(3, baseHp + type.hpBonus));
    this.tankType = tankType || 'spread';
    this.shootDelay = type.shootDelay;
    this.invincible = 0;
    this._tankDef = type;
    this.shotCounter = 0;
    this.magSize = Math.max(1, type.magSize || 6);
    this.ammo = this.magSize;
    this.reloadTimer = 0;
    this.reloadDuration = Math.max(30, type.reloadTime || 110);
    this.partialReloading = false;
    this.visualScale = type.visualScale || 1;
    this.hitboxSize = type.hitboxSize || 36;
    this.inputSource = inputSource || 'kbm';
    this._gpAimAngle = 0;
  }
  update() {
    if (!this.alive) return;
    if (this.invincible > 0) this.invincible--;
    if (this.shootCooldown > 0) this.shootCooldown--;
    this.tickFireSlow();
    const wantsToShoot = mouseDown || keys[' '] || keys['j'];
    if (wantsToShoot && this.partialReloading && this.reloadTimer > 0 && this.ammo > 0) {
      this.reloadTimer = 0;
      this.partialReloading = false;
      this.reloadDuration = getEffectiveReloadTime();
    }
    if (this.reloadTimer > 0) {
      this.reloadTimer--;
      if (this.reloadTimer <= 0) {
        this.ammo = this.magSize;
        this.partialReloading = false;
        this.reloadDuration = getEffectiveReloadTime();
        spawnExplosion(this.x, this.y, 5, '#8ce8ff', '#f6e5aa');
      }
    }

    let dx = 0, dy = 0;
    if (this.inputSource === 'gamepad') {
      // Gamepad left stick movement
      dx = gamepadState.leftX;
      dy = gamepadState.leftY;
      const mag = Math.sqrt(dx*dx + dy*dy);
      if (mag > 1) { dx /= mag; dy /= mag; }
    } else {
      // Keyboard movement
      if (keys['w'] || keys['arrowup']) dy = -1;
      if (keys['s'] || keys['arrowdown']) dy = 1;
      if (keys['a'] || keys['arrowleft']) dx = -1;
      if (keys['d'] || keys['arrowright']) dx = 1;
      if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
      }
    }

    // Check terrain slow
    let slowFactor = 1;
    for (const obs of obstacles) {
      if (obs.slow && this.x - 18 < obs.x + obs.w && this.x + 18 > obs.x &&
          this.y - 18 < obs.y + obs.h && this.y + 18 > obs.y) {
        slowFactor = Math.min(slowFactor, obs.slow);
      }
    }

    const effSpeed = getEffectiveSpeed() * slowFactor;
    const newX = this.x + dx * effSpeed;
    const newY = this.y + dy * effSpeed;
    const hb = this.hitboxSize || 36;
    const margin = Math.max(22, hb / 2 + 7);
    if (newX > margin && newX < W - margin && !tankCollidesObstacle(newX, this.y, hb, hb)) this.x = newX;
    if (newY > margin && newY < H - margin && !tankCollidesObstacle(this.x, newY, hb, hb)) this.y = newY;

    // Turret aiming
    let targetAngle;
    if (this.inputSource === 'gamepad') {
      // Right stick aim or auto-aim nearest enemy
      const rMag = Math.sqrt(gamepadState.rightX*gamepadState.rightX + gamepadState.rightY*gamepadState.rightY);
      if (rMag > 0.08) {
        targetAngle = Math.atan2(gamepadState.rightY, gamepadState.rightX);
      } else {
        // Auto-aim: prioritize Boss > Elite > nearest enemy
        let target = null, bestScore = -1;
        for (const enemy of enemies) {
          if (!enemy.alive) continue;
          const edx = enemy.x - this.x, edy = enemy.y - this.y;
          const dist = Math.sqrt(edx*edx + edy*edy);
          if (dist > 350) continue;
          // Score: boss=1000, elite=500, normal=0 — minus distance
          const score = (enemy.bossDef ? 1000 : enemy.isElite ? 500 : 0) - dist;
          if (score > bestScore) { bestScore = score; target = enemy; }
        }
        if (target) targetAngle = Math.atan2(target.y - this.y, target.x - this.x);
        else targetAngle = this.turretAngle;
      }
    } else {
      targetAngle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
    }
    let pSpeed = TURRET_SPEED_PLAYER[this.tankType] || 0.12;
    if (this.inputSource === 'gamepad') pSpeed *= 2.0; // Faster tracking for gamepad
    this.turretAngle = rotateTurretToward(this.turretAngle, targetAngle, pSpeed);

    // Shooting
    const wantsToShoot2 = this.inputSource === 'gamepad' ? gamepadState.shoot : wantsToShoot;
    if (!wantsToShoot2 && this.ammo < this.magSize && this.reloadTimer <= 0) {
      this.startReload(true);
    }

    // Shoot
    if (wantsToShoot2 && this.shootCooldown <= 0 && this.reloadTimer <= 0) {
      this.shoot();
      this.shootCooldown = getEffectiveShootDelay();
    }
  }
  startReload(partial = false) {
    if (this.reloadTimer > 0) return;
    this.reloadDuration = getEffectiveReloadTime();
    const missingRatio = 1 - (this.ammo / Math.max(1, this.magSize));
    this.partialReloading = partial && this.ammo > 0;
    this.reloadTimer = partial
      ? Math.max(26, Math.floor(this.reloadDuration * (0.45 + missingRatio * 0.55)))
      : this.reloadDuration;
    sfxReload(this.tankType);
  }
  shoot() {
    if (this.ammo <= 0) {
      this.startReload();
      return;
    }
    const bx = this.x + Math.cos(this.turretAngle) * 18;
    const by = this.y + Math.sin(this.turretAngle) * 18;
    const def = this._tankDef;
    this.shotCounter++;
    this.ammo = Math.max(0, this.ammo - 1);

    const isSpecial = def.specialInterval && (this.shotCounter % def.specialInterval === 0);
    const spType = isSpecial ? def.specialType : null;

    // Base properties (power-up overrides take priority)
    let baseSpeed = def.bulletSpeed;
    let baseColor = '#ff0';
    let baseRadius = 3;
    let isRailgun = false, isPierce = false, isFreeze = false, isExplosive = false, isRicochet = false;
    let bounceCount = 0;
    let isHoming = false;
    let homingStr = 0;

    // Power-up overrides
    if (buffs.railgun > 0) { baseSpeed = 4.0 + (def.railgunSpeedBonus || 0); baseColor = '#a4f'; baseRadius = 5; isRailgun = true; }
    else if (buffs.freeze > 0) { baseColor = '#8cf'; isFreeze = true; }
    else if (buffs.explosive > 0) { baseColor = '#f84'; isExplosive = true; }
    if (buffs.big_bullet > 0) baseRadius = 6;
    if (buffs.pierce > 0) isPierce = true;
    if (buffs.ricochet > 0) { isRicochet = true; bounceCount = 3; }

    // Modifier multipliers
    baseSpeed *= bulletSpeedMul;

    // Tank-inherent special (only if no conflicting power-up active)
    if (isSpecial && spType) {
      switch(spType) {
        case 'pierce':
          if (!buffs.pierce && !buffs.railgun) { isPierce = true; baseColor = '#ff8'; }
          break;
        case 'railgun':
          if (!buffs.railgun) { isRailgun = true; baseSpeed = 4.0 + (def.railgunSpeedBonus || 0); baseColor = '#a4f'; baseRadius = 5; }
          break;
        case 'freeze':
          if (!buffs.freeze) { isFreeze = true; baseColor = '#8cf'; }
          break;
        case 'explosive':
          if (!buffs.explosive) { isExplosive = true; baseColor = '#f84'; }
          break;
        case 'super_pierce':
          isRailgun = true; isPierce = true; baseSpeed = 5.5 + (def.railgunSpeedBonus || 0); baseColor = '#e8f'; baseRadius = 5;
          if (def.sniperSpecialHoming) {
            isHoming = true;
            homingStr = Math.max(homingStr, 0.05);
          }
          break;
        case 'homing_burst':
          isHoming = true; homingStr = 0.06; baseSpeed = 2.2; baseColor = '#f8f'; baseRadius = 4;
          if (def.sniperSpecialHoming) homingStr = Math.max(homingStr, 0.08);
          break;
        case 'rift':
          isRicochet = true;
          bounceCount = 2 + (def.riftBounceBonus || 0);
          isHoming = true;
          homingStr = Math.max(homingStr, def.riftHoming || 0.032);
          baseSpeed = Math.max(baseSpeed, 2.75 + (def.riftSpeedBonus || 0));
          baseColor = '#d9b6ff';
          baseRadius = 4;
          break;
        case 'phantom_slash':
          isPierce = true;
          baseSpeed = Math.max(baseSpeed, 3.15 + (def.slashSpeedBonus || 0));
          baseColor = '#bdfcff';
          baseRadius = 3.4;
          break;
        case 'blood_lance':
          isRailgun = true;
          isPierce = true;
          baseSpeed = Math.max(baseSpeed, 4.25 + (def.lanceSpeedBonus || 0));
          baseColor = '#ff5d73';
          baseRadius = 4.8;
          break;
        case 'astral_orbit':
          isRicochet = true;
          bounceCount = 2 + (def.orbitBounceBonus || 0);
          isHoming = true;
          homingStr = Math.max(homingStr, def.orbitHoming || 0.026);
          if (!buffs.freeze) isFreeze = true;
          baseSpeed = Math.max(baseSpeed, 2.15 + (def.orbitSpeedBonus || 0));
          baseColor = '#9fe2ff';
          baseRadius = 4.2;
          break;
      }
    }
    if (def.baseHomingStrength) {
      isHoming = true;
      homingStr = Math.max(homingStr, def.baseHomingStrength);
    }

    const count = buffs.multishot > 0 ? def.bulletCount + 2 : def.bulletCount;
    const spread = buffs.multishot > 0 ? Math.max(def.spreadAngle, 0.14) : def.spreadAngle;
    const halfSpread = spread * (count - 1) / 2;
    recordShot(count);
    for (let i = 0; i < count; i++) {
      const angleOffset = count === 1 ? 0 : -halfSpread + i * spread;
      let dmg = Math.ceil(def.bulletDamage * playerBulletDmgMul) + (buffs.overdrive > 0 ? 1 : 0);
      if (spType === 'pierce' || spType === 'super_pierce' || spType === 'phantom_slash' || spType === 'blood_lance' || buffs.pierce > 0) dmg += (def.pierceDamageBonus || 0);
      if (spType === 'blood_lance') dmg += (def.lanceDamageBonus || 0);
      const b = new Bullet(bx, by, this.turretAngle + angleOffset, baseSpeed, baseColor, true, dmg);
      b.radius = baseRadius;
      b.ricochet = isRicochet;
      b.railgun = isRailgun;
      b.freeze = isFreeze;
      b.pierce = isPierce;
      b.explosive = isExplosive;
      b.bounces = bounceCount;
      b.homing = isHoming;
      b.homingStrength = homingStr;
      if (spType === 'phantom_slash') b.shardBurst = 1 + (def.slashShardBonus || 0);
      if (spType === 'blood_lance') b.drainOnHit = Math.min(0.6, 0.22 + (def.lanceDrainBonus || 0));
      playerBullets.push(b);
    }
    const fireSlow = getPlayerFireSlowProfile(this.tankType, def);
    this.applyFireSlow(fireSlow.duration, fireSlow.mul);
    sfxShoot(this.tankType);
    if (isSpecial && spType) {
      spawnExplosion(bx, by, 6, baseColor, '#fff');
    }
    if (this.ammo <= 0) this.startReload();
  }
  draw(ctx) {
    if (this.invincible > 0 && Math.floor(this.invincible / 4) % 2 === 0) return;
    ctx.save();
    if (buffs.shield > 0) {
      ctx.shadowColor = '#4ff';
      ctx.shadowBlur = 14;
    }
    // Custom tank model per type
    this.drawTankModel(ctx);
    ctx.shadowBlur = 0;
    // HP bar
    if (this.hp < this.maxHp) {
      const barW = 30, barH = 4;
      ctx.fillStyle = '#400';
      ctx.fillRect(this.x - barW/2, this.y - 28, barW, barH);
      ctx.fillStyle = '#0f0';
      ctx.fillRect(this.x - barW/2, this.y - 28, barW * (this.hp / this.maxHp), barH);
    }
    // Special shot charge bar
    const tdef = this._tankDef;
    if (tdef && tdef.specialInterval) {
      const shotsUntil = tdef.specialInterval - (this.shotCounter % tdef.specialInterval);
      const chargeRatio = 1 - (shotsUntil / tdef.specialInterval);
      const cw = 30, ch = 3;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(this.x - cw/2, this.y + 20, cw, ch);
      const spColors = {pierce:'#ff8',railgun:'#a4f',freeze:'#8cf',explosive:'#f84',super_pierce:'#e8f',homing_burst:'#f8f',rift:'#d9b6ff',phantom_slash:'#bdfcff',blood_lance:'#ff5d73',astral_orbit:'#9fe2ff'};
      ctx.fillStyle = spColors[tdef.specialType] || '#fff';
      ctx.fillRect(this.x - cw/2, this.y + 20, cw * chargeRatio, ch);
    }

    // Magazine and reload feedback: visible during combat without opening HUD.
    const magW = 34, magH = 5;
    const reloadRatio = this.reloadTimer > 0 ? 1 - (this.reloadTimer / Math.max(1, this.reloadDuration)) : (this.ammo / Math.max(1, this.magSize));
    ctx.fillStyle = 'rgba(5,8,12,0.82)';
    ctx.fillRect(this.x - magW / 2, this.y + 26, magW, magH);
    ctx.fillStyle = this.reloadTimer > 0 ? '#8ce8ff' : '#f6e5aa';
    ctx.fillRect(this.x - magW / 2, this.y + 26, magW * Math.max(0, Math.min(1, reloadRatio)), magH);
    ctx.strokeStyle = 'rgba(246,229,170,0.42)';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x - magW / 2, this.y + 26, magW, magH);
    for (let i = 1; i < this.magSize; i++) {
      const sx = this.x - magW / 2 + magW * i / this.magSize;
      ctx.strokeStyle = 'rgba(5,8,12,0.65)';
      ctx.beginPath();
      ctx.moveTo(sx, this.y + 26);
      ctx.lineTo(sx, this.y + 26 + magH);
      ctx.stroke();
    }
    if (this.reloadTimer > 0) {
      ctx.fillStyle = '#8ce8ff';
      ctx.font = 'bold 8px "Courier New",monospace';
      ctx.textAlign = 'center';
      ctx.fillText('RELOAD', this.x, this.y + 39);
    }

    // Buff indicator badges
    const activeBuffs = [];
    if (buffs.speed > 0) activeBuffs.push({type:'speed', c:'#4af'});
    if (buffs.railgun > 0) activeBuffs.push({type:'railgun', c:'#a4f'});
    if (buffs.ricochet > 0) activeBuffs.push({type:'ricochet', c:'#fa4'});
    if (buffs.shield > 0) activeBuffs.push({type:'shield', c:'#4ff'});
    if (buffs.rapid > 0) activeBuffs.push({type:'rapid', c:'#f44'});
    if (buffs.freeze > 0) activeBuffs.push({type:'freeze', c:'#8cf'});
    if (buffs.multishot > 0) activeBuffs.push({type:'multishot', c:'#f8f'});
    if (buffs.magnet > 0) activeBuffs.push({type:'magnet', c:'#c8f'});
    if (buffs.pierce > 0) activeBuffs.push({type:'pierce', c:'#ff8'});
    if (buffs.vampire > 0) activeBuffs.push({type:'vampire', c:'#f66'});
    if (buffs.double_score > 0) activeBuffs.push({type:'double_score', c:'#ff0'});
    if (buffs.big_bullet > 0) activeBuffs.push({type:'big_bullet', c:'#f80'});
    if (buffs.explosive > 0) activeBuffs.push({type:'explosive', c:'#f84'});
    if (buffs.invisible > 0) activeBuffs.push({type:'invisible', c:'#aaa'});
    if (buffs.thorns > 0) activeBuffs.push({type:'thorns', c:'#8f8'});
    if (buffs.overdrive > 0) activeBuffs.push({type:'overdrive', c:'#ff9a42'});
    if (buffs.timewarp > 0) activeBuffs.push({type:'timewarp', c:'#9fe2ff'});
    if (buffs.goldrush > 0) activeBuffs.push({type:'goldrush', c:'#ffd95c'});
    for (let i = 0; i < activeBuffs.length; i++) {
      const row = Math.floor(i / 8);
      const col = i % 8;
      drawBuffBadge(ctx, activeBuffs[i].type, this.x - 28 + col * 8, this.y - 28 + row * 10, 4.8, activeBuffs[i].c);
    }
    ctx.restore();
  }
  drawTankModel(ctx) {
    const { x, y, color, turretColor, turretAngle, tankType } = this;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(this._tankDef?.visualScale || this.visualScale || 1, this._tankDef?.visualScale || this.visualScale || 1);
    const body = color, turretC = turretColor;
    const t = Date.now() / 220;
    const evoLevel = this._tankDef?.evoLevel || 0;

    switch(tankType) {

    case 'spread': {
      drawTankTracks(ctx, -19, 13, -13, 26, 7, '#2b0f12', '#5a2228');
      drawArmorPanel(ctx, -16, -11, 32, 22, body, '#6a1818', 4);
      drawArmorPanel(ctx, -10, -7, 20, 14, '#9f2f35', '#ff7a7a', 3);
      ctx.strokeStyle = 'rgba(255,210,210,0.22)';
      ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.stroke();
      drawTechCore(ctx, 0, 0, 5.5, '#ffd0d0', '#ff5b5b');
      ctx.save(); ctx.rotate(turretAngle);
      for (let i = -1; i <= 1; i++) {
        drawWeaponBarrel(ctx, 2, i * 4 - 1.5, 13, 3, turretC, '#71161d', '#fff1f1');
      }
      ctx.strokeStyle = 'rgba(255,150,150,0.35)';
      ctx.beginPath(); ctx.moveTo(6, -6); ctx.lineTo(16, 0); ctx.lineTo(6, 6); ctx.stroke();
      ctx.restore();
      break;
    }

    case 'focus': {
      drawTankTracks(ctx, -14, 10, -10, 20, 4, '#3b3410', '#6f6220');
      ctx.fillStyle = body; ctx.beginPath();
      ctx.moveTo(16, 0); ctx.lineTo(0, -11); ctx.lineTo(-14, -4); ctx.lineTo(-14, 4); ctx.lineTo(0, 11); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#6c5a12'; ctx.lineWidth = 2; ctx.stroke();
      drawArmorPanel(ctx, -7, -5, 17, 10, '#d1a13a', '#fff0a6', 2);
      drawTechCore(ctx, 1, 0, 4, '#fff8bd', '#ffe349');
      ctx.strokeStyle = 'rgba(255,245,170,0.4)';
      ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(12, 0); ctx.stroke();
      ctx.save(); ctx.rotate(turretAngle);
      drawWeaponBarrel(ctx, 3, -3, 22, 6, turretC, '#5c4810', '#fff7c0');
      withGlow(ctx, '#ffe85a', 10, () => {
        ctx.fillStyle = '#ffe85a';
        ctx.fillRect(22, -2, 5, 4);
      });
      ctx.restore();
      break;
    }

    case 'wide': {
      drawTankTracks(ctx, -21, 15, -12, 24, 6, '#10263c', '#24486d');
      drawArmorPanel(ctx, -18, -10, 36, 20, body, '#19557b', 4);
      drawArmorPanel(ctx, -13, -6, 26, 12, '#5ec0ff', '#d1f3ff', 3);
      for (let i = -1; i <= 1; i++) {
        ctx.strokeStyle = 'rgba(210,245,255,0.22)';
        ctx.beginPath(); ctx.moveTo(-11, i * 4); ctx.lineTo(11, i * 4); ctx.stroke();
      }
      drawTechCore(ctx, 0, 0, 6, '#d8fbff', '#68e5ff');
      ctx.save(); ctx.rotate(turretAngle);
      for (let i = -2; i <= 2; i++) {
        const ba = i * 0.16;
        ctx.save(); ctx.rotate(ba);
        drawWeaponBarrel(ctx, 4, -2, 11, 4, turretC, '#1b4a69', '#e5fbff');
        ctx.restore();
      }
      ctx.restore();
      break;
    }

    case 'burst': {
      drawTankTracks(ctx, -22, 14, -14, 28, 8, '#321512', '#703128');
      drawArmorPanel(ctx, -19, -12, 38, 24, body, '#6f2215', 4);
      drawArmorPanel(ctx, -14, -8, 28, 16, '#cf623a', '#ffc097', 3);
      for (let rx = -13; rx <= 11; rx += 6) {
        for (let ry = -8; ry <= 6; ry += 5) {
          ctx.fillStyle = '#78311e';
          ctx.beginPath(); ctx.arc(rx, ry, 1.1, 0, Math.PI * 2); ctx.fill();
        }
      }
      drawTechCore(ctx, 0, 0, 7, '#ffd5be', '#ff8f48');
      ctx.save(); ctx.rotate(turretAngle);
      for (let i = -3; i <= 3; i++) {
        drawWeaponBarrel(ctx, 5, -6.5 + i * 3.5, 10, 2.8, turretC, '#662416', '#fff0d0');
      }
      withGlow(ctx, '#ff9a42', 10, () => {
        ctx.strokeStyle = '#ff9a42';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(15, 0); ctx.lineTo(-8, 10); ctx.stroke();
      });
      ctx.restore();
      for (let v = -1; v <= 1; v += 2) {
        ctx.strokeStyle = 'rgba(255,180,120,0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(v * 15, -10); ctx.lineTo(v * 18, -14); ctx.stroke();
      }
      break;
    }

    case 'sniper': {
      drawTankTracks(ctx, -12, 9, -9, 18, 3, '#221733', '#48305d');
      drawArmorPanel(ctx, -11, -8, 14, 16, body, '#4d2a76', 3);
      drawArmorPanel(ctx, 2, -6, 10, 12, '#d3a7ff', '#f1ddff', 3);
      drawTechCore(ctx, -1.5, -3, 3.2, '#ffffff', '#c36bff');
      ctx.strokeStyle = 'rgba(236,219,255,0.26)';
      ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(9, 0); ctx.stroke();
      ctx.save(); ctx.rotate(turretAngle);
      const grad = ctx.createLinearGradient(6, 0, 30, 0);
      grad.addColorStop(0, turretC); grad.addColorStop(1, '#f6deff');
      ctx.fillStyle = grad;
      drawArmorPanel(ctx, 6, -2.4, 26, 4.8, grad, '#4b2b79', 2);
      withGlow(ctx, '#d872ff', 10, () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(29, -3, 4, 6);
      });
      ctx.strokeStyle = 'rgba(222,174,255,0.35)';
      ctx.beginPath(); ctx.moveTo(10, -4.5); ctx.lineTo(22, -4.5); ctx.stroke();
      ctx.restore();
      break;
    }

    case 'homing': {
      drawTankTracks(ctx, -15, 11, -11, 22, 4, '#241227', '#55255a');
      ctx.fillStyle = body; ctx.beginPath();
      ctx.moveTo(18, 0); ctx.lineTo(8, -10); ctx.lineTo(-10, -8);
      ctx.lineTo(-12, 0); ctx.lineTo(-10, 8); ctx.lineTo(8, 10); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#6b2870'; ctx.lineWidth = 2; ctx.stroke();
      drawTechCore(ctx, -4, -4, 5.5, '#ffe6ff', '#ff8eff');
      drawTechCore(ctx, 2, 0, 4.8, '#ffe0ff', '#d96cff');
      ctx.save(); ctx.rotate(turretAngle);
      drawWeaponBarrel(ctx, 5, -4.2, 14, 3.4, turretC, '#612365', '#fff3ff');
      drawWeaponBarrel(ctx, 5, 0.8, 14, 3.4, turretC, '#612365', '#fff3ff');
      drawTechCore(ctx, 15, -2, 2.7, '#ffffff', '#ff8eff');
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,136,255,0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 24 + Math.sin(t) * 1.5, -Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
      break;
    }

    case 'border': {
      const pulse = Math.sin(t * 1.35) * 0.5 + 0.5;
      drawTankTracks(ctx, -17, 12, -10, 20, 4, '#171023', '#3b275d');
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(15, -5);
      ctx.lineTo(12, 10);
      ctx.lineTo(0, 15);
      ctx.lineTo(-12, 10);
      ctx.lineTo(-15, -5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#b9a2ff';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      drawArmorPanel(ctx, -9, -7, 18, 14, '#2f2348', '#d9b6ff', 3);
      ctx.strokeStyle = 'rgba(217,182,255,' + (0.22 + pulse * 0.18) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, 21 + evoLevel * 2, -Math.PI * 0.75, Math.PI * 0.25); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 15, Math.PI * 0.35, Math.PI * 1.45); ctx.stroke();
      drawTechCore(ctx, -3, -2, 4.8, '#fff2ff', '#d9b6ff');
      drawTechCore(ctx, 5, 3, 3.2, '#fff9d9', '#f6e5aa');
      ctx.save(); ctx.rotate(turretAngle);
      drawWeaponBarrel(ctx, 4, -3.2, 14, 3.2, turretC, '#40265d', '#fff2ff');
      drawWeaponBarrel(ctx, 4, 1.2, 14, 3.2, turretC, '#40265d', '#fff2ff');
      ctx.strokeStyle = 'rgba(246,229,170,0.48)';
      ctx.beginPath();
      ctx.moveTo(18, -6); ctx.lineTo(25, -1); ctx.lineTo(18, 4);
      ctx.stroke();
      ctx.restore();
      if (evoLevel > 0) {
        ctx.strokeStyle = 'rgba(217,182,255,0.28)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(-20, -14); ctx.lineTo(20, 14);
        ctx.moveTo(20, -14); ctx.lineTo(-20, 14);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      break;
    }

    case 'blade': {
      const pulse = Math.sin(t * 1.9) * 0.5 + 0.5;
      drawTankTracks(ctx, -14, 10, -10, 20, 3.8, '#0c2d32', '#39d4d8');
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(17, 0);
      ctx.lineTo(5, -11);
      ctx.lineTo(-13, -8);
      ctx.lineTo(-17, 0);
      ctx.lineTo(-13, 8);
      ctx.lineTo(5, 11);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#bdfcff';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      drawArmorPanel(ctx, -7, -5, 16, 10, '#103b42', '#bdfcff', 2);
      drawTechCore(ctx, -1, 0, 4.4, '#efffff', '#3fd5da');
      ctx.strokeStyle = 'rgba(189,252,255,' + (0.22 + pulse * 0.2) + ')';
      ctx.beginPath();
      ctx.moveTo(-14, -12); ctx.lineTo(12, -4); ctx.lineTo(19, -8);
      ctx.moveTo(-14, 12); ctx.lineTo(12, 4); ctx.lineTo(19, 8);
      ctx.stroke();
      ctx.save(); ctx.rotate(turretAngle);
      drawWeaponBarrel(ctx, 4, -4.4, 17, 2.8, turretC, '#0e5058', '#efffff');
      drawWeaponBarrel(ctx, 4, 1.6, 17, 2.8, turretC, '#0e5058', '#efffff');
      withGlow(ctx, '#bdfcff', 7, () => {
        ctx.strokeStyle = '#bdfcff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(15, -7); ctx.lineTo(26, -2);
        ctx.moveTo(15, 7); ctx.lineTo(26, 2);
        ctx.stroke();
      });
      ctx.restore();
      if (evoLevel > 0) {
        ctx.strokeStyle = 'rgba(189,252,255,0.28)';
        ctx.beginPath();
        ctx.arc(0, 0, 18 + evoLevel * 3, -Math.PI * 0.45, Math.PI * 0.45);
        ctx.stroke();
      }
      break;
    }

    case 'scarlet': {
      const pulse = Math.sin(t * 1.15) * 0.5 + 0.5;
      drawTankTracks(ctx, -20, 14, -13, 26, 6, '#2a0710', '#8f1024');
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(8, -13);
      ctx.lineTo(-14, -12);
      ctx.lineTo(-20, -3);
      ctx.lineTo(-20, 3);
      ctx.lineTo(-14, 12);
      ctx.lineTo(8, 13);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ff5d73';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      drawArmorPanel(ctx, -12, -7, 24, 14, '#3d1019', '#ff5d73', 3);
      drawTechCore(ctx, -4, 0, 5.2, '#ffe0e5', '#ff5d73');
      ctx.strokeStyle = 'rgba(255,93,115,' + (0.22 + pulse * 0.22) + ')';
      ctx.beginPath();
      ctx.moveTo(-15, -9); ctx.lineTo(10, 0); ctx.lineTo(-15, 9);
      ctx.stroke();
      ctx.save(); ctx.rotate(turretAngle);
      drawWeaponBarrel(ctx, 3, -3.4, 25, 6.8, turretC, '#4a0b18', '#ffe6ea');
      withGlow(ctx, '#ff5d73', 9, () => {
        ctx.fillStyle = '#ff5d73';
        ctx.fillRect(25, -4.8, 5, 9.6);
      });
      ctx.strokeStyle = 'rgba(246,229,170,0.38)';
      ctx.beginPath();
      ctx.moveTo(6, -6); ctx.lineTo(20, -6);
      ctx.moveTo(6, 6); ctx.lineTo(20, 6);
      ctx.stroke();
      ctx.restore();
      if (evoLevel > 0) {
        ctx.fillStyle = 'rgba(255,93,115,0.18)';
        ctx.beginPath();
        ctx.arc(-14, -11, 2.4 + evoLevel * 0.6, 0, Math.PI * 2);
        ctx.arc(-14, 11, 2.4 + evoLevel * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'astral': {
      const pulse = Math.sin(t * 0.9) * 0.5 + 0.5;
      drawTankTracks(ctx, -18, 12, -12, 24, 6, '#0c1a28', '#285a8f');
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(16, -7);
      ctx.lineTo(16, 7);
      ctx.lineTo(0, 15);
      ctx.lineTo(-16, 7);
      ctx.lineTo(-16, -7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#9fe2ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      drawArmorPanel(ctx, -10, -8, 20, 16, '#17324f', '#9fe2ff', 3);
      ctx.strokeStyle = 'rgba(159,226,255,' + (0.2 + pulse * 0.18) + ')';
      ctx.beginPath(); ctx.arc(0, 0, 19, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, 23 + evoLevel * 2, 8 + pulse, Math.PI / 5, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, 23 + evoLevel * 2, 8 + pulse, -Math.PI / 5, 0, Math.PI * 2); ctx.stroke();
      drawTechCore(ctx, 0, 0, 5.8, '#eff9ff', '#9fe2ff');
      ctx.save(); ctx.rotate(turretAngle);
      drawWeaponBarrel(ctx, 4, -5.2, 15, 3.4, turretC, '#17324f', '#eff9ff');
      drawWeaponBarrel(ctx, 4, 1.8, 15, 3.4, turretC, '#17324f', '#eff9ff');
      drawTechCore(ctx, 18, 0, 3, '#ffffff', '#9fe2ff');
      ctx.restore();
      if (evoLevel > 0) {
        for (let i = 0; i < 4; i++) {
          const a = t * 0.35 + i * Math.PI / 2;
          ctx.fillStyle = 'rgba(246,229,170,0.5)';
          ctx.beginPath();
          ctx.arc(Math.cos(a) * (18 + evoLevel * 2), Math.sin(a) * (18 + evoLevel * 2), 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }

    default: // fallback to basic drawing
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-19, -14, 6, 28); ctx.fillRect(13, -14, 6, 28);
      ctx.fillStyle = body; ctx.fillRect(-15, -12, 30, 24);
      ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(-15, -12, 30, 24);
      ctx.fillStyle = turretC; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.save(); ctx.rotate(turretAngle);
      ctx.fillStyle = turretC; ctx.fillRect(3, -3, 16, 6);
      ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.strokeRect(3, -3, 16, 6);
      ctx.restore();
    }

    drawTankEvolutionOverlay(ctx, evoLevel, tankType, turretC);
    // P1/P2 label for dual mode
    if (isDualMode) {
      const isP2 = this.inputSource === 'gamepad';
      ctx.fillStyle = isP2 ? 'rgba(255,136,0,0.85)' : 'rgba(255,255,255,0.75)';
      ctx.font = 'bold 10px "Courier New",monospace';
      ctx.textAlign = 'center';
      ctx.fillText(isP2 ? 'P2' : 'P1', 0, this.hitboxSize ? this.hitboxSize/2 + 10 : 28);
    }
    ctx.restore();
  }
  hit(source) {
    if (this.invincible > 0) return false;
    if (buffs.shield > 0) {
      sfxShieldBlock('player');
      return false;
    }
    this.hp--;
    if (typeof source === 'string') recordPlayerDamageCause(source);
    this.invincible = 60;
    gotHitThisLevel = true;
    sessionGotHit = true;
    spawnExplosion(this.x, this.y, 8, '#f80', '#ff0');
    
    sfxPlayerHurt();
    if (this.hp <= 0) {
      this.alive = false;
      spawnExplosion(this.x, this.y, 30, '#f44', '#f80');
      return true;
    }
    return false;
  }
}

class EnemyTank extends Tank {
  constructor(x, y, color, turretColor, speed, hp, kind) {
    super(x, y, color, turretColor, speed, hp);
    this.aiTimer = rng() * 60;
    this.moveDir = rng() < 0.5 ? -1 : 1;
    this.moveAxis = rng() < 0.5 ? 'x' : 'y';
    this.aiChangeTime = 40 + rng() * 80;
    this.shootDelay = 90 + rng() * 60;
    this.preferredRange = 170 + rng() * 80;
    this.strafeBias = rng() < 0.5 ? -1 : 1;
    this.burstMemory = 0;
    this.peekTimer = Math.floor(rng() * 50);
    this.lostSightTimer = 0;
    this.frozen = 0;
    this._origSpeed = speed;
    this.armor = false;
    this.isElite = false;
    this.kind = kind || 'scout';
    this.faction = enemyTypes.find(t => t.kind === this.kind)?.faction || 'moon_arsenal';
  }
  update() {
    if (!this.alive) return;
    if (this.shootCooldown > 0) this.shootCooldown--;
    this.tickFireSlow();
    if (this.frozen > 0) {
      this.frozen--;
      this.speed = this._origSpeed * 0.4;
      if (this.frozen <= 0) this.speed = this._origSpeed;
    }

    this.aiTimer++;

    // Movement AI — periodic behavior change
    if (this.aiTimer % this.aiChangeTime < 2) {
      this.moveDir = rng() < 0.5 ? -1 : 1;
      this.moveAxis = rng() < 0.5 ? 'x' : 'y';
      this.strafeBias *= rng() < 0.72 ? 1 : -1;
      this.aiChangeTime = 44 + rng() * 72;
    }

    // Faction-based AI modifiers
    const factionAI = {
      observatory:    { prefRange: 280, strafe: 0.15, approachMul: 0.5,  lead: 18, retreatBias: 0.4 },
      storm_cloister: { prefRange: 110, strafe: 0.85, approachMul: 0.9,  lead: 6,  retreatBias: -0.3 },
      void_cult:      { prefRange: 190, strafe: 0.55, approachMul: 0.7,  lead: 12, retreatBias: 0.1 },
      moon_arsenal:   { prefRange: 145, strafe: 0.25, approachMul: 1.0,  lead: 10, retreatBias: 0.0 },
      ash_church:     { prefRange: 210, strafe: 0.30, approachMul: 0.5,  lead: 14, retreatBias: 0.2 },
      graveyard:      { prefRange: 120, strafe: 0.10, approachMul: 0.8,  lead: 8,  retreatBias: -0.1 },
    };
    const fai = factionAI[this.faction] || factionAI.moon_arsenal;
    this.preferredRange = fai.prefRange + rng() * 50;

    // Chase player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));

    // Turret aim at player
    const leadFrames = fai.lead + (this.kind === 'artillery' ? 6 : (this.kind === 'sniper' ? 10 : 0));
    const playerInput = getPlayerInputVector();
    const playerSpeed = getEffectiveSpeed();
    const predictedX = player.x + playerInput.x * playerSpeed * leadFrames;
    const predictedY = player.y + playerInput.y * playerSpeed * leadFrames;
    const targetAngle = Math.atan2(predictedY - this.y, predictedX - this.x);
    const eSpeed = TURRET_SPEED_FACTION[this.faction] || 0.08;
    this.turretAngle = rotateTurretToward(this.turretAngle, targetAngle, eSpeed);
    const lineOfSight = hasLineOfSight(this.x, this.y, predictedX, predictedY);
    if (lineOfSight) this.lostSightTimer = 0;
    else this.lostSightTimer++;
    this.peekTimer = Math.max(0, this.peekTimer - 1);

    // Move
    let moveX = 0, moveY = 0;
    const canSee = buffs.invisible <= 0 || dist < 120;
    if (canSee) {
      const rangeError = dist - this.preferredRange;
      const approach = Math.max(-0.72, Math.min(0.72, rangeError / 150));
      const coverProbe = lineOfSight ? 1 : (this.lostSightTimer > 35 ? 0.85 : 0.35);
      moveX += (dx / dist) * approach * fai.approachMul * coverProbe;
      moveY += (dy / dist) * approach * fai.approachMul * coverProbe;
      moveX += (-dy / dist) * this.strafeBias * fai.strafe * (lineOfSight ? 1 : 1.35);
      moveY += (dx / dist) * this.strafeBias * fai.strafe * (lineOfSight ? 1 : 1.35);
      // Retreat bias for long-range types
      if (fai.retreatBias > 0 && dist < this.preferredRange * 0.6) {
        moveX -= (dx / dist) * fai.retreatBias;
        moveY -= (dy / dist) * fai.retreatBias;
      }
      if (!lineOfSight && this.lostSightTimer > 50) {
        moveX += (dx / dist) * 0.28;
        moveY += (dy / dist) * 0.28;
      }
    }
    if (this.moveAxis === 'x') moveX += this.moveDir * 0.18;
    else moveY += this.moveDir * 0.18;
    for (const other of enemies) {
      if (other === this || !other.alive) continue;
      const odx = this.x - other.x, ody = this.y - other.y;
      const od = Math.max(1, Math.sqrt(odx * odx + ody * ody));
      if (od < 62) {
        moveX += (odx / od) * 0.42;
        moveY += (ody / od) * 0.42;
      }
    }

    // Terrain slow
    let enemySlow = 1;
    for (const obs of obstacles) {
      if (obs.slow && this.x - 18 < obs.x + obs.w && this.x + 18 > obs.x &&
          this.y - 18 < obs.y + obs.h && this.y + 18 > obs.y) {
        enemySlow = Math.min(enemySlow, obs.slow);
      }
    }

    const fireSlow = this.getFireSlowMultiplier();
    const newX = this.x + moveX * this.speed * enemySlow * fireSlow;
    const newY = this.y + moveY * this.speed * enemySlow * fireSlow;
    if (newX > 25 && newX < W - 25 && !tankCollidesObstacle(newX, this.y, 36, 36)) this.x = newX;
    else { this.moveDir *= -1; this.strafeBias *= -1; }
    if (newY > 25 && newY < H - 25 && !tankCollidesObstacle(this.x, newY, 36, 36)) this.y = newY;
    else { this.moveDir *= -1; this.strafeBias *= -1; }

    // Shoot at player
    const firingRange = this.kind === 'artillery' ? 430 : (this.kind === 'runner' ? 255 : 360);
    const canFire = lineOfSight || (this.kind === 'artillery' && dist < 260 && this.peekTimer <= 0);
    if (this.shootCooldown <= 0 && canSee && canFire && dist < firingRange) {
      this.shoot();
      this.burstMemory = (this.burstMemory + 1) % (this.kind === 'runner' ? 3 : 2);
      this.shootCooldown = this.burstMemory === 0 ? Math.floor(this.shootDelay * 1.35) : Math.floor(this.shootDelay * 0.62);
      if (!lineOfSight) this.peekTimer = 90 + Math.floor(rng() * 60);
    }

    // Collision with player
    if (dist < 32) {
      if (buffs.thorns > 0) {
        this.hp = 0;
        this.alive = false;
        spawnExplosion(this.x, this.y, 20, '#8f8', '#0f0');
        onEnemyKilled(this);
      } else {
        this.hp = 0;
        this.alive = false;
        spawnExplosion(this.x, this.y, 20, '#f80', '#ff0');
        onEnemyKilled(this);
        player.hit('敌方单位撞击');
      }
    }
  }
  draw(ctx) {
    const accentMap = { scout:'#68b8e8', runner:'#48a8f0', brute:'#e84848', artillery:'#d0a040', sniper:'#50a8d8', sapper:'#e08040', buffer:'#90c860', fissure:'#9880e0' };
    const accent = accentMap[this.kind] || '#f49800';
    const t = Date.now() / 300;
    ctx.save();
    ctx.shadowColor = this.frozen > 0 ? '#8cf' : accent;
    ctx.shadowBlur = this.frozen > 0 ? 10 : 7;
    ctx.translate(this.x, this.y);

    switch(this.kind) {
      case 'runner': {
        // === SLEEK INTERCEPTOR ===
        drawTankTracks(ctx, -16, 9, -12, 24, 5, '#1a0c08', '#4a2018');
        const rBodyGrad = ctx.createLinearGradient(-14, -10, 14, -10);
        rBodyGrad.addColorStop(0, '#cc5a2a'); rBodyGrad.addColorStop(0.5, '#ff8c4a'); rBodyGrad.addColorStop(1, '#cc5a2a');
        ctx.fillStyle = rBodyGrad;
        ctx.beginPath();
        ctx.moveTo(20, 0); ctx.lineTo(4, -12); ctx.lineTo(-8, -10); ctx.lineTo(-14, -4);
        ctx.lineTo(-14, 4); ctx.lineTo(-8, 10); ctx.lineTo(4, 12); ctx.closePath();
        ctx.fill(); ctx.strokeStyle = '#ff5a1f'; ctx.lineWidth = 1.8; ctx.stroke();
        drawArmorPanel(ctx, -2, -6, 12, 12, 'rgba(20,8,4,0.8)', '#ff7a3d', 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
        for (let c = 0; c < 3; c++) {
          ctx.beginPath();
          ctx.moveTo(-11 + c * 3, -8 + c); ctx.lineTo(-6 + c * 3, 0); ctx.lineTo(-11 + c * 3, 8 - c); ctx.stroke();
        }
        const rBurnGlow = ctx.createRadialGradient(-14, 0, 0, -14, 0, 8);
        rBurnGlow.addColorStop(0, 'rgba(255,200,60,0.9)'); rBurnGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rBurnGlow; ctx.beginPath(); ctx.arc(-14, 0, 8, 0, Math.PI * 2); ctx.fill();
        drawTechCore(ctx, 2, 0, 3.8, '#fff2cc', accent);
        ctx.save(); ctx.rotate(this.turretAngle);
        drawWeaponBarrel(ctx, 4, -1.8, 14, 3.6, '#cc5a2a', '#ff5a1f', '#ffe8c0');
        ctx.restore();
        break;
      }
      case 'brute': {
        // === HEAVY JUGGERNAUT ===
        drawTankTracks(ctx, -22, 16, -14, 28, 7, '#150825', '#3a1e5a');
        const bBodyGrad = ctx.createLinearGradient(-18, -12, 18, -12);
        bBodyGrad.addColorStop(0, '#5a2890'); bBodyGrad.addColorStop(0.5, '#8248cc'); bBodyGrad.addColorStop(1, '#5a2890');
        ctx.fillStyle = bBodyGrad;
        ctx.beginPath();
        ctx.moveTo(10, -14); ctx.lineTo(-18, -7); ctx.lineTo(-18, 7); ctx.lineTo(10, 14); ctx.closePath();
        ctx.fill(); ctx.strokeStyle = '#9148e0'; ctx.lineWidth = 2.5; ctx.stroke();
        [[-18, -3, 6, 6], [12, -3, 6, 6]].forEach(([px, py, pw, ph]) => {
          drawArmorPanel(ctx, px, py, pw, ph, '#3a1e5a', '#7a48c0', 2);
        });
        const shieldPulse = Math.sin(t * 3 + this.x * 0.02) * 0.15 + 0.55;
        ctx.strokeStyle = 'rgba(180,100,255,' + shieldPulse.toFixed(2) + ')';
        ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.stroke();
        drawTechCore(ctx, 0, 0, 5.5, '#f0e0ff', accent);
        ctx.save(); ctx.rotate(this.turretAngle);
        drawWeaponBarrel(ctx, 5, -3, 16, 6, '#5a2890', '#9148e0', '#fff7ff');
        ctx.restore();
        break;
      }
      case 'artillery': {
        // === SIEGE PLATFORM ===
        drawTankTracks(ctx, -20, 14, -14, 28, 6, '#1a0a22', '#4a2070');
        const aBodyGrad = ctx.createLinearGradient(-16, -10, 16, -10);
        aBodyGrad.addColorStop(0, '#8a2060'); aBodyGrad.addColorStop(0.5, '#d84090'); aBodyGrad.addColorStop(1, '#8a2060');
        ctx.fillStyle = aBodyGrad;
        ctx.beginPath();
        ctx.moveTo(8, -12); ctx.lineTo(-16, -5); ctx.lineTo(-16, 5); ctx.lineTo(8, 12); ctx.closePath();
        ctx.fill(); ctx.strokeStyle = '#ff60b0'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#6a1850';
        ctx.beginPath(); ctx.moveTo(-16, -5); ctx.lineTo(-24, -14); ctx.lineTo(-16, -2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-16, 5); ctx.lineTo(-24, 14); ctx.lineTo(-16, 2); ctx.fill();
        for (let r = 0; r < 3; r++) {
          ctx.strokeStyle = 'rgba(255,160,210,' + (0.5 - r * 0.14) + ')';
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.arc(-6, 0, 6 + r * 3, -Math.PI * 0.35, Math.PI * 0.35); ctx.stroke();
        }
        drawTechCore(ctx, 2, -1, 4.5, '#fff0fa', accent);
        ctx.save(); ctx.rotate(this.turretAngle);
        drawWeaponBarrel(ctx, 5, -2, 19, 4, '#8a2060', '#ff60b0', '#fff0fa');
        ctx.fillStyle = '#ffd0f0'; ctx.beginPath(); ctx.arc(19, 0, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        break;
      }
      case 'scout':
      default: {
        // === LIGHT RECON ===
        drawTankTracks(ctx, -14, 9, -10, 20, 4, '#1a0808', '#5a1818');
        const sBodyGrad = ctx.createLinearGradient(-12, -8, 12, -8);
        sBodyGrad.addColorStop(0, '#b82828'); sBodyGrad.addColorStop(0.5, '#e84040'); sBodyGrad.addColorStop(1, '#b82828');
        ctx.fillStyle = sBodyGrad;
        ctx.beginPath();
        ctx.moveTo(16, 0); ctx.lineTo(0, -10); ctx.lineTo(-12, -3); ctx.lineTo(-12, 3); ctx.lineTo(0, 10); ctx.closePath();
        ctx.fill(); ctx.strokeStyle = '#ff5040'; ctx.lineWidth = 1.8; ctx.stroke();
        ctx.strokeStyle = '#ff7060'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(2, -10); ctx.lineTo(2, -16); ctx.stroke();
        ctx.fillStyle = 'rgba(255,100,80,0.7)';
        ctx.beginPath(); ctx.arc(2, -16, 2.5, 0, Math.PI * 2); ctx.fill();
        const scanPulse = Math.sin(t * 4 + this.x * 0.03) * 0.3 + 0.7;
        ctx.strokeStyle = 'rgba(255,100,80,' + (scanPulse * 0.4).toFixed(2) + ')';
        ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(2, -16, 5 + Math.sin(t * 3) * 1, 0, Math.PI * 2); ctx.stroke();
        drawTechCore(ctx, 1, 0, 4.2, '#ffe0e0', accent);
        ctx.save(); ctx.rotate(this.turretAngle);
        drawWeaponBarrel(ctx, 4, -1.8, 11, 3.6, '#b82828', '#ff5040', '#fff0f0');
        ctx.restore();
        break;
      }
      case 'sniper': {
        // === LONG-RANGE PRECISION ===
        drawTankTracks(ctx, -12, 8, -8, 16, 4, '#0a1220', '#1a3050');
        const snGrad = ctx.createLinearGradient(-10, -8, 10, -8);
        snGrad.addColorStop(0, '#2848a0'); snGrad.addColorStop(0.5, '#5088e0'); snGrad.addColorStop(1, '#2848a0');
        ctx.fillStyle = snGrad;
        ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(-8, -4); ctx.lineTo(-8, 4); ctx.lineTo(10, 10); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#80b0ff'; ctx.lineWidth = 1.6; ctx.stroke();
        drawTechCore(ctx, 2, 0, 3.2, '#e0eeff', accent);
        ctx.save(); ctx.rotate(this.turretAngle);
        drawWeaponBarrel(ctx, 3, -1.5, 22, 3, '#2848a0', '#80b0ff', '#f0f8ff');
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(24, 0, 2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        break;
      }
      case 'sapper': {
        // === MINE-LAYER ===
        drawTankTracks(ctx, -14, 10, -10, 20, 4, '#1a0c04', '#4a2810');
        const mnGrad = ctx.createLinearGradient(-10, -8, 10, -8);
        mnGrad.addColorStop(0, '#a06020'); mnGrad.addColorStop(0.5, '#e08030'); mnGrad.addColorStop(1, '#a06020');
        ctx.fillStyle = mnGrad;
        ctx.beginPath(); ctx.moveTo(8, -10); ctx.lineTo(-12, -4); ctx.lineTo(-12, 4); ctx.lineTo(8, 10); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ffa040'; ctx.lineWidth = 1.6; ctx.stroke();
        // Mine dispenser on back
        ctx.fillStyle = '#301008'; ctx.fillRect(-14, -6, 6, 12);
        for (let m = 0; m < 3; m++) { ctx.fillStyle = '#ff6020'; ctx.beginPath(); ctx.arc(-11, -4 + m * 6, 2, 0, Math.PI * 2); ctx.fill(); }
        drawTechCore(ctx, 2, 0, 3.5, '#ffe8d0', accent);
        ctx.save(); ctx.rotate(this.turretAngle);
        drawWeaponBarrel(ctx, 3, -1.8, 10, 3.6, '#a06020', '#ffa040', '#fff0e0');
        ctx.restore();
        break;
      }
      case 'buffer': {
        // === BUFFER/HEALER ===
        drawTankTracks(ctx, -15, 12, -10, 22, 5, '#0a1608', '#1a4020');
        const spGrad = ctx.createLinearGradient(-12, -10, 12, -10);
        spGrad.addColorStop(0, '#308030'); spGrad.addColorStop(0.5, '#60c060'); spGrad.addColorStop(1, '#308030');
        ctx.fillStyle = spGrad;
        ctx.beginPath(); ctx.moveTo(12, -12); ctx.lineTo(-10, -6); ctx.lineTo(-14, 6); ctx.lineTo(12, 12); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#80e080'; ctx.lineWidth = 1.6; ctx.stroke();
        // Support aura ring
        const auraPulse = Math.sin(t * 2 + this.x * 0.02) * 0.2 + 0.7;
        ctx.strokeStyle = 'rgba(100,255,100,' + (auraPulse * 0.4).toFixed(2) + ')';
        ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.stroke();
        drawTechCore(ctx, 0, 0, 4.5, '#e0ffe0', accent);
        ctx.save(); ctx.rotate(this.turretAngle);
        drawWeaponBarrel(ctx, 3, -1.5, 9, 3, '#308030', '#80e080', '#f0fff0');
        ctx.restore();
        break;
      }
      case 'fissure': {
        // === SELF-DUPLICATING ===
        drawTankTracks(ctx, -13, 9, -9, 18, 4, '#140a20', '#381860');
        const spGrad2 = ctx.createRadialGradient(0, 0, 2, 0, 0, 12);
        spGrad2.addColorStop(0, '#c0a0f0'); spGrad2.addColorStop(0.5, '#6040a0'); spGrad2.addColorStop(1, '#1a0830');
        ctx.fillStyle = spGrad2;
        ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#c0a0f0'; ctx.lineWidth = 1.6; ctx.stroke();
        // Internal split lines
        ctx.strokeStyle = 'rgba(200,160,240,0.3)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-10, -6); ctx.lineTo(10, 6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(10, -6); ctx.lineTo(-10, 6); ctx.stroke();
        drawTechCore(ctx, 0, 0, 3.8, '#f0e8ff', accent);
        ctx.save(); ctx.rotate(this.turretAngle);
        drawWeaponBarrel(ctx, 3, -1.6, 8, 3.2, '#381860', '#c0a0f0', '#f8f0ff');
        ctx.restore();
        break;
      }
    }

    ctx.shadowBlur = 0;
    if (this.hp < this.maxHp) {
      const hpColor = this.hp / this.maxHp > 0.5 ? '#79f48d' : (this.hp / this.maxHp > 0.25 ? '#ffd36f' : '#ff6a6a');
      drawEnemyInfoPlate(ctx, 0, -25, 74, this.hp / this.maxHp, hpColor, this.kind.toUpperCase(), 'HOSTILE', 'HP');
      drawEnemyMarker(ctx, -47, -25, 'normal', 6.2, accent);
    }

    if (this.frozen > 0) {
      ctx.globalAlpha = 0.24;
      ctx.fillStyle = '#8cf';
      ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();    

  }
  shoot() {
    const bx = this.x + Math.cos(this.turretAngle) * 18;
    const by = this.y + Math.sin(this.turretAngle) * 18;
    const ebs = 1.7;
    const dmg = 1 + (this.bulletDamageBonus || 0);
    const color = this.turretColor || '#f44';
    // Elite patterns (special-based)
    if (this.isElite) {
      const s = this.special;
      if (s === 'heavy') {
        for (let i = -1; i <= 1; i++) {
          const b = new Bullet(bx, by, this.turretAngle + i * 0.14, ebs * 0.65, '#c44', false, dmg + 1);
          b.radius = 4; enemyBullets.push(b);
        }
      } else if (s === 'sniper') {
        const sb = new Bullet(bx, by, this.turretAngle + (rng() - 0.5) * 0.03, 4.2, '#6f6', false, 3);
        sb.radius = 1.8; enemyBullets.push(sb);
      } else if (s === 'fast') {
        for (let s = -1; s <= 1; s += 2) {
          const b = new Bullet(bx, by, this.turretAngle + s * 0.1, 2.8, '#4af', false, dmg);
          b.radius = 1.6; enemyBullets.push(b);
        }
      } else if (s === 'flame') {
        for (let i = -2; i <= 2; i++) {
          const b = new Bullet(bx, by, this.turretAngle + i * 0.1, 1.2 + Math.abs(i) * 0.3, '#f80', false, dmg);
          b.radius = 2.5; enemyBullets.push(b);
        }
      } else if (s === 'laser') {
        const lb = new Bullet(bx, by, this.turretAngle, 3.5, '#aaf', true, dmg + 1);
        lb.radius = 2; enemyBullets.push(lb);
        for (let i = -2; i <= 2; i += 4) {
          const b = new Bullet(this.x, this.y, this.turretAngle + i * 0.35, 1.2, '#88f', false, 1);
          b.radius = 1.8; enemyBullets.push(b);
        }
      } else if (s === 'missile') {
        const mb = new Bullet(bx, by, this.turretAngle, 1.2, '#f84', false, 2);
        mb.radius = 5; mb.isMissile = true; enemyBullets.push(mb);
      } else if (s === 'summoner') {
        for (let i = 0; i < 4; i++) {
          const a = this.turretAngle + (i - 1.5) * 0.15;
          const b = new Bullet(bx, by, a, 1.3, '#6cf', false, dmg);
          b.radius = 2.2; enemyBullets.push(b);
        }
      } else if (s === 'barrier') {
        for (let i = 0; i < 3; i++) {
          const a = this.turretAngle - 0.15 + i * 0.15;
          const b = new Bullet(bx, by, a, 1.1, '#4ff', false, 1);
          b.radius = 2; enemyBullets.push(b);
        }
      } else if (s === 'miner') {
        const mb = new Bullet(bx, by, this.turretAngle, 1.5, '#ca4', false, dmg);
        mb.radius = 2.5; enemyBullets.push(mb);
      } else if (s === 'warden') {
        for (let i = -1; i <= 1; i++) {
          const b = new Bullet(bx, by, this.turretAngle + i * 0.06, 2.8, '#f6e5aa', false, 2);
          b.radius = 3; enemyBullets.push(b);
        }
      } else {
        // Default elite: 2-shot spread
        for (let i = -1; i <= 1; i += 2) {
          const b = new Bullet(bx, by, this.turretAngle + i * 0.1, ebs, color, false, dmg);
          b.radius = 2.5; enemyBullets.push(b);
        }
      }
      const fireSlow = getEnemyFireSlowProfile(this);
      this.applyFireSlow(fireSlow.duration, fireSlow.mul);
      sfxEnemyShoot(this.special || 'elite');
      return;
    }
    // Normal enemy kind-based patterns
    switch (this.kind) {
      case 'sniper':
        // Fast single shot, very accurate
        const sb = new Bullet(bx, by, this.turretAngle + (rng()-0.5)*0.04, 3.8, '#adf', false, 2);
        sb.radius = 2; enemyBullets.push(sb); break;
      case 'runner':
        // Fast double shot — alternating sides
        for (let s = -1; s <= 1; s += 2) {
          const b = new Bullet(bx, by, this.turretAngle + s * 0.12 + this.aiTimer*0.02, ebs*1.1, '#fa8', false, dmg);
          b.radius = 1.8; enemyBullets.push(b);
        }
        break;
      case 'brute':
        // Slow wide cone — 3 shots
        for (let i = -1; i <= 1; i++) {
          const b = new Bullet(bx, by, this.turretAngle + i * 0.15, ebs*0.75, '#c6f', false, dmg+1);
          b.radius = 3.5; enemyBullets.push(b);
        }
        break;
      case 'artillery':
        // Arc shot — 2 slow wide bullets
        for (let s = -1; s <= 1; s += 2) {
          const b = new Bullet(bx, by, this.turretAngle + s * 0.1, ebs*0.6, '#f6c', false, dmg+1);
          b.radius = 4; enemyBullets.push(b);
        }
        break;
      case 'sapper':
        // Single shot + trailing delay shot
        const mb = new Bullet(bx, by, this.turretAngle, ebs, '#fa6', false, dmg);
        mb.radius = 2.2; enemyBullets.push(mb);
        if (rng() < 0.4) {
          const tb = new Bullet(bx, by, this.turretAngle + (rng()-0.5)*0.3, ebs*0.7, '#fa6', false, dmg);
          tb.radius = 2; enemyBullets.push(tb);
        }
        break;
      case 'buffer':
        // Support: fires slow ring of 3 weak bullets
        for (let i = 0; i < 3; i++) {
          const a = this.turretAngle - 0.2 + i * 0.2;
          const b = new Bullet(bx, by, a, ebs*0.55, '#bfb', false, 1);
          b.radius = 2.2; enemyBullets.push(b);
        }
        break;
      case 'fissure':
        // Erratic — 2 bullets with random angle offset
        for (let i = 0; i < 2; i++) {
          const b = new Bullet(bx, by, this.turretAngle + (rng()-0.5)*0.4, ebs*0.85, '#d8f', false, dmg);
          b.radius = 2.4; enemyBullets.push(b);
        }
        break;
      default: // scout
        const rb = new Bullet(bx, by, this.turretAngle + (rng()-0.5)*0.1, ebs, color, false, dmg);
        rb.radius = 2.2; enemyBullets.push(rb);
    }
    const fireSlow = getEnemyFireSlowProfile(this);
    this.applyFireSlow(fireSlow.duration, fireSlow.mul);
    sfxEnemyShoot(this.kind);
  }
  hit(bullet) {
    if (this.armor && rng() < 0.4) {
      spawnExplosion(this.x, this.y, 3, '#888', '#aaa');
      sfxArmorBlock();
      return false;
    }
    const dmg = bullet && bullet.damage ? bullet.damage : 1;
    const dmgType = bullet && bullet.railgun ? 'pierce' : (bullet && bullet.explosive ? 'explosive' : (bullet && bullet.freeze ? 'freeze' : (dmg >= 3 ? 'crit' : 'normal')));
    this.hp -= dmg;
    this.hitFlash = 6; // Brief white flash
    if (bullet && bullet.freeze && !this.frozen) {
      const freezeBonus = player && player._tankDef ? (player._tankDef.freezeDurationBonus || 0) : 0;
      const freezeMul = player && player._tankDef ? (player._tankDef.freezeDurationMul || 1) : 1;
      this.frozen = Math.floor((120 + freezeBonus) * freezeMul);
      this._origSpeed = this.speed;
      spawnExplosion(this.x, this.y, 8, '#8cf', '#fff');
      sfxStatus('freeze');
    }
    // Hit impact particles
    const pColors = { normal:'#ff0', crit:'#ff8', pierce:'#8cf', explosive:'#f80', freeze:'#8ff', bounce:'#aff' };
    const pCol = pColors[dmgType] || '#ff0';
    for (let p = 0; p < Math.min(dmg * 3, 8); p++) {
      particles.push(new Particle(this.x + (rng()-0.5)*12, this.y + (rng()-0.5)*12, pCol, 1.5 + dmg * 0.3));
    }
    spawnExplosion(this.x, this.y, 5 + Math.min(dmg, 4), pCol, '#fff');
    spawnDamageNumber(this.x, this.y - 10, dmg, dmgType);
    sfxEnemyHit();
    if (this.hp <= 0) {
      this.alive = false;
      spawnExplosion(this.x, this.y, 20, '#f80', '#f44');
      onEnemyKilled(this);
      if (this.isElite && rng() < Math.min(1, 0.7 + eliteDropMul)) {
        spawnPowerUp(this.x, this.y);
      }
    }
    return !this.alive;
  }
}

// --- Elite Enemies ---
const eliteTypes = [
  { name: '重装坦克', color: '#633', turret: '#c44', speed: 0.35, hp: 8, special: 'heavy', icon: 'ARM', faction: 'ash_church' },
  { name: '狙击坦克', color: '#363', turret: '#6c6', speed: 0.4,  hp: 4, special: 'sniper', icon: 'SNP', faction: 'observatory' },
  { name: '疾风坦克', color: '#336', turret: '#66c', speed: 1.1,  hp: 3, special: 'fast', icon: 'SPD', faction: 'graveyard' },
  { name: '火焰坦克', color: '#633', turret: '#c63', speed: 0.4,  hp: 5, special: 'flame', icon: 'FLM', faction: 'moon_arsenal' },
  { name: '召唤坦克', color: '#366', turret: '#6c6', speed: 0.35, hp: 6, special: 'summoner', icon: 'CMD', faction: 'observatory' },
  { name: '隐身坦克', color: '#555', turret: '#999', speed: 0.6,  hp: 4, special: 'stealth', icon: 'PHZ', faction: 'void_cult' },
  { name: '分裂坦克', color: '#653', turret: '#c84', speed: 0.5,  hp: 6, special: 'splitter', icon: 'SWM', faction: 'graveyard' },
  { name: '再生坦克', color: '#353', turret: '#6a6', speed: 0.4,  hp: 7, special: 'regen', icon: 'REG', faction: 'moon_arsenal' },
  { name: '激光坦克', color: '#335', turret: '#88f', speed: 0.35, hp: 5, special: 'laser', icon: 'BEA', faction: 'ash_church' },
  { name: '地雷坦克', color: '#553', turret: '#ca4', speed: 0.45, hp: 5, special: 'miner', icon: 'MIN', faction: 'graveyard' },
  { name: '护盾坦克', color: '#466', turret: '#4ff', speed: 0.35, hp: 6, special: 'barrier', icon: 'SHD', faction: 'ash_church' },
  { name: '导弹坦克', color: '#644', turret: '#f84', speed: 0.4,  hp: 4, special: 'missile', icon: 'MSL', faction: 'storm_cloister' },
  { name: '裁断坦克', color: '#5a5136', turret: '#f6e5aa', speed: 0.38, hp: 6, special: 'warden', icon: 'JDG', faction: 'ash_church' },
  { name: '裂隙坦克', color: '#39264f', turret: '#d9b6ff', speed: 0.55, hp: 5, special: 'phase', icon: 'RFT', faction: 'void_cult' },
];

class EliteEnemy extends EnemyTank {
  constructor(x, y, eliteDef) {
    const diff = difficultySettings[currentDifficulty];
    const hp = eliteDef.hp + 2 + Math.floor(wave / 6) + Math.floor(level / 3) + diff.enemyHpBonus;
    super(x, y, eliteDef.color, eliteDef.turret, eliteDef.speed * diff.enemySpeedMul, Math.max(3, hp));
    this.isElite = true;
    this.armor = eliteDef.special === 'heavy';
    this.special = eliteDef.special;
    this.eliteIcon = eliteDef.icon;
    this.eliteName = eliteDef.name;
    if (eliteDef.special === 'boss') discoverBestiary('bosses', eliteDef.name);
    else discoverBestiary('elites', eliteDef.special);
    this.shootDelay = 60 + rng() * 40;
    if (eliteDef.special === 'sniper') {
      this.shootDelay = 54 + rng() * 24;
      this.preferredRange = 330 + rng() * 70;
    }
    if (eliteDef.special === 'fast') {
      this.shootDelay = 42 + rng() * 20;
      this.preferredRange = 120 + rng() * 36;
    }
    if (eliteDef.special === 'heavy' || eliteDef.special === 'barrier') {
      this.preferredRange = 150 + rng() * 34;
    }
    if (eliteDef.special === 'flame') {
      this.preferredRange = 128 + rng() * 34;
    }
    if (eliteDef.special === 'laser' || eliteDef.special === 'missile') {
      this.preferredRange = 285 + rng() * 55;
    }
    if (eliteDef.special === 'summoner' || eliteDef.special === 'miner') {
      this.preferredRange = 250 + rng() * 50;
    }
    if (eliteDef.special === 'summoner') {
      this.summonCooldown = 100 + rng() * 80;
    }
    if (eliteDef.special === 'stealth') {
      this.stealthPhase = 0;
      this.stealthTimer = 0;
    }
    if (eliteDef.special === 'regen') {
      this.regenTimer = 0;
    }
    if (eliteDef.special === 'miner') {
      this.mineCooldown = 50 + rng() * 60;
    }
    if (eliteDef.special === 'splitter') {
      this.splitTimer = 300 + rng() * 200;
    }
    if (eliteDef.special === 'barrier') {
      this.barrierHP = 3; this.barrierTimer = 0;
    }
    if (eliteDef.special === 'missile') {
      this.missileCooldown = 0;
    }
    if (eliteDef.special === 'warden') {
      this.shootDelay = 72 + rng() * 20;
      this.preferredRange = 205 + rng() * 45;
      this.wardenCooldown = 110 + rng() * 70;
      this.wardenTelegraph = 0;
      this.wardenAngle = this.turretAngle;
    }
    if (eliteDef.special === 'phase') {
      this.shootDelay = 58 + rng() * 18;
      this.preferredRange = 225 + rng() * 55;
      this.phaseBlinkCooldown = 150 + rng() * 80;
      this.phaseAfterimage = 0;
    }
    // Faction assignment and traits
    this.faction = eliteDef.faction || 'graveyard';
    this.applyFactionTraits();
  }
  applyFactionTraits() {
    switch (this.faction) {
      case 'moon_arsenal':
        // Armor-piercing: shots do +1 damage to player
        this.bulletDamageBonus = 1;
        break;
      case 'ash_church':
        // Fortress: +2 bonus HP
        this.hp += 2; this.maxHp += 2;
        break;
      case 'observatory':
        // Scanner: slightly faster shooting
        this.shootDelay = Math.max(30, this.shootDelay - 8);
        break;
      case 'graveyard':
        // Salvaged: 15% chance to drop extra moonstone on death
        this.salvageDropChance = 0.15;
        break;
      case 'void_cult':
        // Phase: 8% chance per shot to teleport short distance
        this.phaseChance = 0.08;
        break;
      case 'storm_cloister':
        // Chain: shots travel 15% faster
        this.bulletSpeedMul = 1.15;
        break;
    }
  }
  update() {
    super.update();
    if (!this.alive) return;
    if (this.special === 'summoner' && this.summonCooldown > 0) {
      this.summonCooldown--;
      if (this.summonCooldown <= 0) {
        this.summonCooldown = 150 + rng() * 100;
        if (enemies.length < getWaveConcurrentEnemyCap() + 1 && waveEnemiesToSpawn > 0 && spawnEnemy()) {
          waveEnemiesToSpawn = Math.max(0, waveEnemiesToSpawn - 1);
          sfxEliteAbility('summoner');
        }
      }
    }
    if (this.special === 'stealth') {
      this.stealthTimer++;
      if (this.stealthTimer > 90) {
        this.stealthTimer = 0;
        this.stealthPhase = this.stealthPhase === 0 ? 1 : 0;
        sfxEliteAbility('stealth');
      }
    }
    if (this.special === 'regen') {
      this.regenTimer++;
      if (this.regenTimer >= 120 && this.hp < this.maxHp) {
        this.regenTimer = 0;
        this.hp = Math.min(this.hp + 1, this.maxHp);
        sfxEliteAbility('regen');
      }
    }
    if (this.special === 'miner') {
      this.mineCooldown--;
      if (this.mineCooldown <= 0) {
        this.mineCooldown = 60 + rng() * 60;
        mines.push({ x: this.x, y: this.y, life: 450, armed: true });
        sfxEliteAbility('mine');
      }
    }
    if (this.special === 'splitter' && enemies.length < getWaveConcurrentEnemyCap() + 1 && waveEnemiesToSpawn > 0) {
      this.splitTimer--;
      if (this.splitTimer <= 0) {
        this.splitTimer = 400 + rng() * 250;
        const sx = this.x + (rng() - 0.5) * 80;
        const sy = this.y + (rng() - 0.5) * 80;
        const spawn = findSafeTankSpawn({
          w: 36,
          h: 36,
          minEnemyDist: 48,
          minPlayerDist: 130,
          preferred: [{ x: Math.max(30, Math.min(W - 30, sx)), y: Math.max(30, Math.min(H - 30, sy)) }],
        });
        const nx = spawn.x;
        const ny = spawn.y;
        enemies.push(new EliteEnemy(nx, ny, eliteTypes[6])); // spawn another splitter
        waveEnemiesToSpawn = Math.max(0, waveEnemiesToSpawn - 1);
        spawnExplosion(this.x, this.y, 12, '#c84', '#fb0');
        sfxEliteAbility('splitter');
        showWaveNotification('', '分裂坦克增殖了!');
      }
    }
    if (this.special === 'barrier') {
      this.barrierTimer++;
      if (this.barrierTimer >= 300 && this.barrierHP < 3) {
        this.barrierTimer = 0; this.barrierHP = Math.min(3, this.barrierHP + 1);
        sfxEliteAbility('barrier');
      }
    }
    if (this.special === 'missile') {
      this.missileCooldown--;
    }
    if (this.special === 'warden') {
      if (this.wardenCooldown > 0) this.wardenCooldown--;
      if (this.wardenTelegraph > 0) {
        this.wardenTelegraph--;
        if (this.wardenTelegraph <= 0) {
          const lane = this.wardenAngle;
          for (let i = -1; i <= 1; i++) {
            const b = new Bullet(this.x + Math.cos(lane) * 18, this.y + Math.sin(lane) * 18, lane + i * 0.055, 2.55, '#f6e5aa', false, 2);
            b.radius = 4.2;
            enemyBullets.push(b);
          }
          spawnExplosion(this.x, this.y, 10, '#f6e5aa', '#fff');
          const fireSlow = getEnemyFireSlowProfile(this);
          this.applyFireSlow(fireSlow.duration, fireSlow.mul);
          sfxEliteShoot('warden');
          this.wardenCooldown = 150 + rng() * 80;
        }
      } else if (this.wardenCooldown <= 0 && player && player.alive) {
        this.wardenAngle = Math.atan2(player.y - this.y, player.x - this.x);
        this.wardenTelegraph = 36;
        sfxEliteAbility('warden');
      }
    }
    if (this.special === 'phase') {
      if (this.phaseAfterimage > 0) this.phaseAfterimage--;
      if (this.phaseBlinkCooldown > 0) this.phaseBlinkCooldown--;
      if (this.phaseBlinkCooldown <= 0 && player && player.alive) {
        const angle = Math.atan2(player.y - this.y, player.x - this.x) + (rng() < 0.5 ? 1 : -1) * (Math.PI * 0.52 + rng() * 0.35);
        const dist = 175 + rng() * 80;
        const spawn = findSafeTankSpawn({
          w: 36,
          h: 36,
          minEnemyDist: 62,
          minPlayerDist: 155,
          preferred: [{
            x: Math.max(40, Math.min(W - 40, player.x + Math.cos(angle) * dist)),
            y: Math.max(40, Math.min(H - 40, player.y + Math.sin(angle) * dist)),
          }],
        });
        spawnExplosion(this.x, this.y, 12, '#d9b6ff', '#fff');
        this.x = spawn.x;
        this.y = spawn.y;
        this.phaseAfterimage = 46;
        this.phaseBlinkCooldown = 190 + rng() * 85;
        spawnExplosion(this.x, this.y, 15, '#d9b6ff', '#6044a8');
        sfxEliteAbility('phase');
      }
    }
  }
  shoot() {
    if (this.special === 'flame') {
      for (let a = -0.32; a <= 0.32; a += 0.16) {
        const bx = this.x + Math.cos(this.turretAngle + a) * 18;
        const by = this.y + Math.sin(this.turretAngle + a) * 18;
        enemyBullets.push(new Bullet(bx, by, this.turretAngle + a, 2.0, '#f84', false));
      }
    } else if (this.special === 'sniper') {
      const bx = this.x + Math.cos(this.turretAngle) * 18;
      const by = this.y + Math.sin(this.turretAngle) * 18;
      enemyBullets.push(new Bullet(bx, by, this.turretAngle, 3.2, '#6f6', false));
    } else if (this.special === 'laser') {
      const bx = this.x + Math.cos(this.turretAngle) * 18;
      const by = this.y + Math.sin(this.turretAngle) * 18;
      const b = new Bullet(bx, by, this.turretAngle, 5.8, '#88f', false);
      b.radius = 2;
      b.railgun = true;
      enemyBullets.push(b);
    } else if (this.special === 'fast') {
      for (let i = 0; i < 2; i++) {
        const spread = (i === 0 ? -0.08 : 0.08);
        const bx = this.x + Math.cos(this.turretAngle + spread) * 18;
        const by = this.y + Math.sin(this.turretAngle + spread) * 18;
        enemyBullets.push(new Bullet(bx, by, this.turretAngle + spread, 1.8, '#4af', false));
      }
    } else if (this.special === 'missile' && this.missileCooldown <= 0) {
      this.missileCooldown = 40 + rng() * 30;
      const b = new Bullet(this.x, this.y, this.turretAngle, 1.6, '#f84', false, 1);
      b.homing = true; b.homingStrength = 0.04; b.radius = 4;
      enemyBullets.push(b);
    } else if (this.special === 'warden') {
      for (let i = -1; i <= 1; i++) {
        const a = this.turretAngle + i * 0.12;
        const b = new Bullet(this.x + Math.cos(a) * 18, this.y + Math.sin(a) * 18, a, 2.05, '#f6e5aa', false, i === 0 ? 2 : 1);
        b.radius = i === 0 ? 4 : 3;
        enemyBullets.push(b);
      }
    } else if (this.special === 'phase') {
      for (let i = -2; i <= 2; i++) {
        const a = this.turretAngle + i * 0.11;
        const b = new Bullet(this.x + Math.cos(a) * 18, this.y + Math.sin(a) * 18, a, 2.15 + Math.abs(i) * 0.08, '#d9b6ff', false, 1);
        b.ricochet = Math.abs(i) === 2;
        b.bounces = b.ricochet ? 1 : 0;
        b.homing = Math.abs(i) <= 1;
        b.homingStrength = 0.012;
        b.radius = 3.2;
        enemyBullets.push(b);
      }
    } else {
      super.shoot();
      return;
    }
    const fireSlow = getEnemyFireSlowProfile(this);
    this.applyFireSlow(fireSlow.duration, fireSlow.mul);
    sfxEliteShoot(this.special);
  }
  draw(ctx) {
    if (this.special === 'stealth' && this.stealthPhase === 1) {
      ctx.globalAlpha = 0.25;
    }
    ctx.save();
    ctx.translate(this.x, this.y);

    let glowColor = '#ff0';
    if (this.special === 'heavy') glowColor = '#f44';
    else if (this.special === 'sniper') glowColor = '#6f6';
    else if (this.special === 'fast') glowColor = '#4af';
    else if (this.special === 'flame') glowColor = '#f80';
    else if (this.special === 'summoner') glowColor = '#6cf';
    else if (this.special === 'stealth') glowColor = '#999';
    else if (this.special === 'splitter') glowColor = '#c84';
    else if (this.special === 'regen') glowColor = '#4f4';
    else if (this.special === 'laser') glowColor = '#88f';
    else if (this.special === 'miner') glowColor = '#ca4';
    else if (this.special === 'barrier') glowColor = '#4ff';
    else if (this.special === 'missile') glowColor = '#f84';
    else if (this.special === 'warden') glowColor = '#f6e5aa';
    else if (this.special === 'phase') glowColor = '#d9b6ff';

    // Faction aura tint
    const factionInfo = getFactionInfo(this.faction);
    if (factionInfo && factionInfo.color) {
      ctx.save();
      ctx.globalAlpha = 0.22 + Math.sin(Date.now() / 400) * 0.08;
      ctx.strokeStyle = factionInfo.color;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8 + Math.sin(Date.now() / 200) * 3;

    const t = Date.now() / 300;
    const body = this.color, turretC = this.turretColor;

    ctx.save();
    switch(this.special) {

      case 'heavy':
        drawTankTracks(ctx, -22, 16, -14, 28, 7, '#200808', '#601818');
        const hvGrad = ctx.createLinearGradient(-20, -12, 20, -12);
        hvGrad.addColorStop(0, '#601818'); hvGrad.addColorStop(0.5, '#a02020'); hvGrad.addColorStop(1, '#601818');
        ctx.fillStyle = hvGrad;
        ctx.beginPath(); ctx.moveTo(14, -16); ctx.lineTo(-22, -7); ctx.lineTo(-22, 7); ctx.lineTo(14, 16); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#d03030'; ctx.lineWidth = 2.5; ctx.stroke();
        drawArmorPanel(ctx, -14, -6, 12, 12, 'rgba(20,4,4,0.8)', '#d03030', 2);
        drawArmorPanel(ctx, 6, -6, 10, 12, 'rgba(20,4,4,0.8)', '#d03030', 2);
        ctx.fillStyle = '#401010';
        for (let a = 0; a < 3; a++) { ctx.fillRect(-20, -4 + a * 5, 4, 3); ctx.fillRect(16, -4 + a * 5, 4, 3); }
        drawTechCore(ctx, 0, 0, 5, '#ffcccc', glowColor);
        ctx.save(); ctx.rotate(this.turretAngle); drawWeaponBarrel(ctx, 5, -3.5, 16, 7, '#601818', '#d03030', '#fff0f0'); ctx.restore();
        break;

      case 'sniper':
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-16, -10, 5, 20); ctx.fillRect(11, -10, 5, 20);
        ctx.fillStyle = body; ctx.fillRect(-13, -10, 26, 20);
        ctx.strokeStyle = '#1a1'; ctx.lineWidth = 2; ctx.strokeRect(-13, -10, 26, 20);
        ctx.fillStyle = '#4a4'; ctx.fillRect(-9, -7, 18, 14);
        ctx.fillStyle = turretC; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#1a1'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -3, 2, 0, Math.PI*2); ctx.fill();
        ctx.save(); ctx.rotate(this.turretAngle);
        ctx.fillStyle = turretC; ctx.fillRect(4, -2, 28, 4);
        ctx.strokeStyle = '#1a1'; ctx.lineWidth = 1; ctx.strokeRect(4, -2, 28, 4);
        ctx.fillStyle = '#8f8'; ctx.fillRect(28, -3, 4, 6);
        ctx.restore();
        break;

      case 'fast':
        const fvGrad = ctx.createLinearGradient(-16, -10, 16, -10);
        fvGrad.addColorStop(0, '#1050a0'); fvGrad.addColorStop(0.5, '#3a90f0'); fvGrad.addColorStop(1, '#1050a0');
        ctx.fillStyle = fvGrad;
        ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(-4, -14); ctx.lineTo(-16, -5); ctx.lineTo(-16, 5); ctx.lineTo(-4, 14); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#60b0ff'; ctx.lineWidth = 2; ctx.stroke();
        // Afterburner vents
        for (let v = -1; v <= 1; v += 2) {
          ctx.fillStyle = '#082858';
          ctx.beginPath(); ctx.moveTo(-16, v * 5); ctx.lineTo(-22, v * 10); ctx.lineTo(-16, v * 3); ctx.fill();
        }
        const fab = ctx.createRadialGradient(-20, 0, 0, -20, 0, 7);
        fab.addColorStop(0, 'rgba(100,180,255,0.8)'); fab.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fab; ctx.beginPath(); ctx.arc(-20, 0, 7, 0, Math.PI * 2); ctx.fill();
        drawTechCore(ctx, 3, 0, 4, '#d0e8ff', glowColor);
        ctx.save(); ctx.rotate(this.turretAngle); drawWeaponBarrel(ctx, 4, -2, 14, 4, '#1050a0', '#60b0ff', '#e0f0ff'); ctx.restore();
        ctx.globalAlpha = this.special === 'stealth' && this.stealthPhase === 1 ? 0.25 : 1;
        break;

      case 'flame':
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-19, -12, 6, 24); ctx.fillRect(13, -12, 6, 24);
        ctx.fillStyle = body; ctx.fillRect(-16, -10, 32, 20);
        ctx.strokeStyle = '#420'; ctx.lineWidth = 2; ctx.strokeRect(-16, -10, 32, 20);
        ctx.fillStyle = '#a53'; ctx.fillRect(-12, -7, 24, 14);
        ctx.fillStyle = '#632'; ctx.fillRect(15, -8, 5, 16);
        ctx.strokeStyle = '#420'; ctx.lineWidth = 1; ctx.strokeRect(15, -8, 5, 16);
        ctx.save(); ctx.rotate(this.turretAngle);
        ctx.fillStyle = '#854'; ctx.fillRect(3, -5, 8, 10); ctx.fillRect(11, -3, 6, 6);
        ctx.strokeStyle = '#420'; ctx.lineWidth = 1; ctx.strokeRect(3, -5, 8, 10);
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = ['#f80','#f60','#ff0'][i];
          ctx.beginPath(); ctx.arc(14 + Math.random()*6, (Math.random()-0.5)*8, 2+Math.random()*3, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
        break;

      case 'summoner':
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-18, -12, 6, 24); ctx.fillRect(12, -12, 6, 24);
        ctx.fillStyle = body; ctx.beginPath();
        const hexR = 14;
        for (let i = 0; i < 6; i++) {
          const a = Math.PI/6 + i * Math.PI/3;
          const hx = Math.cos(a) * hexR, hy = Math.sin(a) * hexR;
          i === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
        }
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#266'; ctx.lineWidth = 2; ctx.stroke();
        ctx.strokeStyle = '#6cf'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, -2, 16, -Math.PI*0.7, -Math.PI*0.3); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, -2, 12, -Math.PI*0.65, -Math.PI*0.35); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, -2, 8, -Math.PI*0.6, -Math.PI*0.4); ctx.stroke();
        ctx.fillStyle = '#6cf'; ctx.fillRect(-1, -20, 2, 8);
        ctx.beginPath(); ctx.arc(0, -20, 3, 0, Math.PI*2); ctx.fill();
        ctx.save(); ctx.rotate(this.turretAngle);
        ctx.fillStyle = turretC; ctx.fillRect(2, -2, 8, 4);
        ctx.restore();
        break;

      case 'stealth':
        ctx.fillStyle = body; ctx.beginPath();
        ctx.moveTo(16, 0); ctx.lineTo(8, -10); ctx.lineTo(-12, -8);
        ctx.lineTo(-16, -2); ctx.lineTo(-12, 6); ctx.lineTo(8, 10); ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#666'; ctx.lineWidth = 2; ctx.stroke();
        ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(2, -6); ctx.lineTo(-8, -1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-2, 6); ctx.lineTo(-10, 2); ctx.stroke();
        ctx.save(); ctx.rotate(this.turretAngle);
        ctx.fillStyle = turretC; ctx.beginPath();
        ctx.moveTo(10, 0); ctx.lineTo(4, -4); ctx.lineTo(-2, -3); ctx.lineTo(-2, 3); ctx.lineTo(4, 4); ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = '#888'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(8, -10); ctx.lineTo(-12, -8);
        ctx.lineTo(-16, -2); ctx.lineTo(-12, 6); ctx.lineTo(8, 10); ctx.closePath(); ctx.stroke();
        ctx.setLineDash([]);
        break;

      case 'splitter':
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-18, -12, 5, 24); ctx.fillRect(13, -12, 5, 24);
        ctx.fillStyle = body; ctx.fillRect(-15, -10, 14, 20);
        ctx.strokeStyle = '#532'; ctx.lineWidth = 2; ctx.strokeRect(-15, -10, 14, 20);
        ctx.fillStyle = '#764'; ctx.fillRect(1, -8, 14, 18);
        ctx.strokeStyle = '#532'; ctx.lineWidth = 2; ctx.strokeRect(1, -8, 14, 18);
        ctx.strokeStyle = '#fb0'; ctx.lineWidth = 2; ctx.shadowColor = '#fb0'; ctx.shadowBlur = 6;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 12); ctx.stroke();
        ctx.setLineDash([]); ctx.shadowBlur = 0;
        for (let s = -1; s <= 1; s += 2) {
          ctx.fillStyle = turretC; ctx.beginPath(); ctx.arc(s * 7, -2, 5, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = '#532'; ctx.lineWidth = 1; ctx.stroke();
          ctx.save(); ctx.rotate(this.turretAngle + s * 0.1);
          ctx.fillStyle = turretC; ctx.fillRect(s * 7 + 2, -4, 8, 3);
          ctx.restore();
        }
        break;

      case 'regen':
        ctx.fillStyle = '#1a2a1a';
        ctx.fillRect(-17, -11, 5, 22); ctx.fillRect(12, -11, 5, 22);
        ctx.fillStyle = body; ctx.beginPath();
        ctx.ellipse(0, 0, 15, 11, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#1a3a1a'; ctx.lineWidth = 2; ctx.stroke();
        ctx.strokeStyle = '#4f4'; ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath(); ctx.moveTo(-8 + i*5, -8); ctx.lineTo(-4 + i*4, 6); ctx.stroke();
        }
        ctx.fillStyle = turretC; ctx.beginPath();
        ctx.ellipse(2, -1, 8, 6, 0.3, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#1a3a1a'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.save(); ctx.rotate(this.turretAngle);
        ctx.fillStyle = turretC; ctx.fillRect(4, -3, 12, 5);
        ctx.restore();
        ctx.fillStyle = '#4f4'; ctx.globalAlpha = 0.15 + Math.sin(t * 2) * 0.1;
        ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = this.special === 'stealth' && this.stealthPhase === 1 ? 0.25 : 1;
        ctx.fillStyle = '#4f4';
        ctx.fillRect(-2, -16, 4, 1.5); ctx.fillRect(-0.75, -18, 1.5, 5.5);
        break;

      case 'laser':
        drawTankTracks(ctx, -16, 12, -10, 24, 5, '#0a0a18', '#282860');
        const lvGrad = ctx.createLinearGradient(-14, -10, 14, -10);
        lvGrad.addColorStop(0, '#282880'); lvGrad.addColorStop(0.5, '#4848cc'); lvGrad.addColorStop(1, '#282880');
        ctx.fillStyle = lvGrad;
        ctx.beginPath(); ctx.moveTo(12, -12); ctx.lineTo(-14, -4); ctx.lineTo(-14, 4); ctx.lineTo(12, 12); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#7070ff'; ctx.lineWidth = 2; ctx.stroke();
        // Capacitor nodes
        for (let n = 0; n < 3; n++) {
          ctx.strokeStyle = 'rgba(120,120,255,' + (0.4 + n * 0.15) + ')'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(-6 + n * 6, 0, 4, 0, Math.PI * 2); ctx.stroke();
        }
        const corePulse = Math.sin(t * 3) * 0.3 + 0.7;
        drawTechCore(ctx, 2, 0, 4.5, '#e0e0ff', glowColor);
        ctx.save(); ctx.rotate(this.turretAngle);
        const lgrad = ctx.createLinearGradient(3, 0, 20, 0);
        lgrad.addColorStop(0, '#88f'); lgrad.addColorStop(0.6, '#ccf'); lgrad.addColorStop(1, '#fff');
        ctx.fillStyle = lgrad; ctx.fillRect(3, -3, 20, 6);
        ctx.strokeStyle = '#6060cc'; ctx.lineWidth = 1; ctx.strokeRect(3, -3, 20, 6);
        // Emitter tip
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(22, 0, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        break;

      case 'miner':
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-20, -12, 7, 24); ctx.fillRect(13, -12, 7, 24);
        for (let i = -10; i < 12; i += 5) {
          ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(-19, i); ctx.lineTo(-15, i); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(14, i); ctx.lineTo(18, i); ctx.stroke();
        }
        ctx.fillStyle = body; ctx.fillRect(-17, -10, 34, 20);
        ctx.strokeStyle = '#430'; ctx.lineWidth = 2; ctx.strokeRect(-17, -10, 34, 20);
        ctx.fillStyle = '#a85'; ctx.fillRect(-13, -7, 26, 14);
        ctx.fillStyle = '#630'; ctx.fillRect(-14, 8, 8, 5); ctx.fillRect(6, 8, 8, 5);
        for (let s = -1; s <= 1; s += 2) {
          ctx.fillStyle = '#420'; ctx.beginPath(); ctx.arc(s * 15, 2, 6, 0, Math.PI*2); ctx.fill();
          ctx.strokeStyle = '#630'; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = '#f80'; ctx.beginPath(); ctx.arc(s * 15, 2, 2.5, 0, Math.PI*2); ctx.fill();
        }
        ctx.fillStyle = turretC; ctx.beginPath(); ctx.arc(0, -1, 8, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#430'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.save(); ctx.rotate(this.turretAngle);
        ctx.fillStyle = turretC; ctx.fillRect(3, -3, 10, 6);
        ctx.strokeStyle = '#430'; ctx.lineWidth = 1; ctx.strokeRect(3, -3, 10, 6);
        ctx.restore();
        break;

      case 'barrier':
        ctx.fillStyle = '#1a2a2a';
        ctx.fillRect(-18, -12, 6, 24); ctx.fillRect(12, -12, 6, 24);
        ctx.fillStyle = body; ctx.fillRect(-15, -10, 30, 20);
        ctx.strokeStyle = '#066'; ctx.lineWidth = 2; ctx.strokeRect(-15, -10, 30, 20);
        ctx.fillStyle = '#4cc'; ctx.fillRect(-11, -7, 22, 14);
        ctx.fillStyle = turretC; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#066'; ctx.lineWidth = 2; ctx.stroke();
        // Barrier shield ring
        if (this.barrierHP > 0) {
          const bpulse = Math.sin(Date.now()/150)*0.3+0.7;
          ctx.strokeStyle = '#4ff'; ctx.lineWidth = this.barrierHP;
          ctx.shadowColor = '#4ff'; ctx.shadowBlur = 8 * bpulse;
          ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2); ctx.stroke();
          ctx.fillStyle = '#4ff'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(this.barrierHP, 0, -22);
        }
        ctx.save(); ctx.rotate(this.turretAngle);
        ctx.fillStyle = turretC; ctx.fillRect(4, -2, 12, 4);
        ctx.strokeStyle = '#066'; ctx.lineWidth = 1.5; ctx.strokeRect(4, -2, 12, 4);
        ctx.restore();
        break;

      case 'missile':
        drawTankTracks(ctx, -16, 13, -12, 22, 6, '#180a04', '#5a2810');
        const mvGrad = ctx.createLinearGradient(-14, -10, 14, -10);
        mvGrad.addColorStop(0, '#803010'); mvGrad.addColorStop(0.5, '#e05020'); mvGrad.addColorStop(1, '#803010');
        ctx.fillStyle = mvGrad;
        ctx.beginPath(); ctx.moveTo(10, -12); ctx.lineTo(-14, -4); ctx.lineTo(-14, 4); ctx.lineTo(10, 12); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ff6020'; ctx.lineWidth = 2.2; ctx.stroke();
        // Missile racks (shoulder mounted)
        for (let s = -1; s <= 1; s += 2) {
          ctx.fillStyle = '#301008'; ctx.strokeStyle = '#ff6020'; ctx.lineWidth = 1.2;
          ctx.fillRect(s * 10 - 6, -16, 12, 10); ctx.strokeRect(s * 10 - 6, -16, 12, 10);
          for (let m = 0; m < 3; m++) {
            ctx.fillStyle = '#ff8040'; ctx.strokeStyle = '#ff6020'; ctx.lineWidth = 0.6;
            ctx.fillRect(s * 10 - 4 + m * 2.5, -15, 2, 8); ctx.strokeRect(s * 10 - 4 + m * 2.5, -15, 2, 8);
            ctx.fillStyle = '#ff0'; ctx.beginPath(); ctx.arc(s * 10 - 3 + m * 2.5, -15, 1, 0, Math.PI * 2); ctx.fill();
          }
        }
        drawTechCore(ctx, 0, 0, 4.5, '#ffe0d0', glowColor);
        ctx.save(); ctx.rotate(this.turretAngle); drawWeaponBarrel(ctx, 4, -2.5, 16, 5, '#803010', '#ff6020', '#fff0e0'); ctx.restore();
        break;

      case 'warden':
        drawTankTracks(ctx, -20, 13, -12, 26, 5, '#18140d', '#5a4724');
        drawArmorPanel(ctx, -17, -12, 34, 24, body, '#a88748', 4);
        drawArmorPanel(ctx, -11, -8, 22, 16, 'rgba(246,229,170,0.26)', '#f6e5aa', 3);
        ctx.strokeStyle = 'rgba(246,229,170,0.55)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -14); ctx.lineTo(0, 14);
        ctx.moveTo(-9, -4); ctx.lineTo(9, -4);
        ctx.moveTo(-7, 5); ctx.lineTo(7, 5);
        ctx.stroke();
        drawTechCore(ctx, 0, 0, 5.2, '#fff6d4', '#f6e5aa');
        ctx.save(); ctx.rotate(this.turretAngle);
        drawWeaponBarrel(ctx, 5, -3.5, 20, 7, turretC, '#6f5627', '#fff6d4');
        ctx.restore();
        if (this.wardenTelegraph > 0) {
          const alpha = 0.16 + (this.wardenTelegraph / 36) * 0.22;
          ctx.save();
          ctx.rotate((this.wardenAngle || this.turretAngle) - this.turretAngle);
          ctx.strokeStyle = 'rgba(246,229,170,' + alpha + ')';
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.moveTo(18, 0);
          ctx.lineTo(92, 0);
          ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,' + (alpha * 0.65) + ')';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(18, 0);
          ctx.lineTo(104, 0);
          ctx.stroke();
          ctx.restore();
        }
        break;

      case 'boss': {
        const bossAccent = this.bossDef ? (this.bossDef.turret || glowColor) : glowColor;
        const brt = Date.now() / 250;
        const maxPh = (this.bossDef && this.bossDef.phases) ? this.bossDef.phases.length : 1;
        // === GROUND SHADOW — massive ===
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath(); ctx.ellipse(0, 36, 38, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath(); ctx.ellipse(0, 34, 24, 4, 0, 0, Math.PI * 2); ctx.fill();
        // === MASSIVE TRACKS ===
        drawTankTracks(ctx, -34, 26, -22, 44, 10, '#06020c', '#1a0c30');
        // Track plates with mechanical detail
        for (const side of [-1, 1]) {
          const tx = side * 26;
          ctx.fillStyle = '#080310'; ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 0.6;
          ctx.fillRect(tx, 20, 10, 32);
          for (let s = 0; s < 7; s++) {
            ctx.beginPath(); ctx.moveTo(tx, 22 + s * 5); ctx.lineTo(tx + 10, 22 + s * 5); ctx.stroke();
          }
          // Track wheel nodes
          for (let w = 0; w < 5; w++) {
            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            ctx.beginPath(); ctx.arc(tx + 5, 24 + w * 6, 4, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.arc(tx + 5, 24 + w * 6, 4.5, 0, Math.PI * 2); ctx.stroke();
          }
        }
        // === OUTER BASTION ARMOR (widest layer) ===
        for (const side of [-1, 1]) {
          const bx = side * 28;
          // Sloped outer armor
          ctx.fillStyle = '#060210'; ctx.strokeStyle = bossAccent; ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(bx + side * 10, -28); ctx.lineTo(bx, -14); ctx.lineTo(bx - side * 4, -4);
          ctx.lineTo(bx - side * 4, 14); ctx.lineTo(bx, 24); ctx.lineTo(bx + side * 10, 28);
          ctx.closePath(); ctx.fill(); ctx.stroke();
          // Weapon slots in bastion
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          for (let w = 0; w < 3; w++) {
            ctx.fillRect(bx - side * 2 - 2, -10 + w * 12, 8, 4);
            ctx.fillStyle = bossAccent;
            ctx.globalAlpha = 0.3 + w * 0.15 + Math.sin(brt + w) * 0.2;
            ctx.fillRect(bx - side * 2, -9 + w * 12, 6, 2);
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
          }
        }
        // === ANGULAR MAIN CHASSIS ===
        const chGrad = ctx.createLinearGradient(-32, -28, 32, -28);
        chGrad.addColorStop(0, '#080310'); chGrad.addColorStop(0.2, '#100820'); chGrad.addColorStop(0.5, '#1a1035'); chGrad.addColorStop(0.8, '#100820'); chGrad.addColorStop(1, '#080310');
        ctx.fillStyle = chGrad;
        ctx.beginPath();
        ctx.moveTo(24, -28); ctx.lineTo(-20, -20); ctx.lineTo(-32, -8); ctx.lineTo(-36, 4);
        ctx.lineTo(-32, 16); ctx.lineTo(-20, 22); ctx.lineTo(24, 28);
        ctx.lineTo(32, 12); ctx.lineTo(34, 0); ctx.lineTo(32, -16); ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 3.5; ctx.stroke();
        ctx.strokeStyle = bossAccent; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(24, -28); ctx.lineTo(24, 28); ctx.stroke();
        // === ARMOR PANELING (decorative seams) ===
        ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 0.5;
        for (let sx = -22; sx < 24; sx += 9) {
          const topY = -22 + Math.abs(sx) * 0.2;
          const botY = 22 - Math.abs(sx) * 0.15;
          ctx.beginPath(); ctx.moveTo(sx, topY); ctx.lineTo(sx, botY); ctx.stroke();
        }
        // Horizontal seam bands
        for (let sy = -16; sy < 20; sy += 8) {
          ctx.beginPath(); ctx.moveTo(-28 + Math.abs(sy) * 0.5, sy); ctx.lineTo(28 - Math.abs(sy) * 0.3, sy); ctx.stroke();
        }
        // === CENTRAL COMMAND NODE ===
        drawArmorPanel(ctx, -14, -10, 28, 20, 'rgba(0,0,0,0.88)', bossAccent, 4);
        // Inner tech frame
        drawArmorPanel(ctx, -10, -6, 20, 12, 'rgba(4,2,10,0.9)', 'rgba(255,255,255,0.1)', 2);
        // Multi-lens optic array
        const eyePulse = Math.sin(brt) * 0.25 + 0.75;
        for (let e = 0; e < 3; e++) {
          const ex = -5 + e * 6;
          ctx.fillStyle = bossAccent;
          ctx.globalAlpha = eyePulse * (0.5 + e * 0.2);
          ctx.beginPath(); ctx.ellipse(ex, -1, 3.5, 2, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.ellipse(ex, -1, 1.5, 1, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        // Threat rating indicator bars
        for (let t = 0; t < 5; t++) {
          ctx.fillStyle = t < 3 + this.currentPhase ? bossAccent : 'rgba(255,255,255,0.06)';
          ctx.globalAlpha = t < 3 + this.currentPhase ? (0.5 + t * 0.1) : 0.2;
          ctx.fillRect(-12 + t * 5, 9, 3, 2);
        }
        ctx.globalAlpha = 1;
        // === POWER GENERATOR UNIT (rear) ===
        ctx.fillStyle = '#080310'; ctx.strokeStyle = bossAccent; ctx.lineWidth = 1.5;
        drawArmorPanel(ctx, -32, -6, 10, 14, '#080310', bossAccent, 2);
        for (let v = 0; v < 3; v++) {
          ctx.fillStyle = bossAccent;
          ctx.globalAlpha = 0.5 + Math.sin(brt * 2 + v) * 0.3;
          ctx.fillRect(-30, -3 + v * 5, 6, 2);
        }
        ctx.globalAlpha = 1;
        // === PHASE CROWN (orbital arcs) ===
        for (let r = 0; r < maxPh; r++) {
          const active = r <= this.currentPhase;
          ctx.strokeStyle = active ? bossAccent : 'rgba(255,255,255,0.03)';
          ctx.lineWidth = active ? 3 : 1.5;
          ctx.globalAlpha = active ? (0.65 + r * 0.15) : 0.1;
          ctx.beginPath(); ctx.arc(0, -8, 28 + r * 8, -Math.PI * 0.6, Math.PI * 0.6); ctx.stroke();
          if (active) {
            // Crown node dots
            for (let n = 0; n < 3; n++) {
              const na = -Math.PI * 0.45 + n * Math.PI * 0.45;
              ctx.fillStyle = bossAccent; ctx.globalAlpha = 0.8;
              ctx.beginPath(); ctx.arc(Math.cos(na) * (28 + r * 8), -8 + Math.sin(na) * (28 + r * 8), 2.5, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1;
          }
        }
        ctx.globalAlpha = 1;
        // === MAIN SIEGE CANNON ===
        ctx.save(); ctx.rotate(this.turretAngle);
        // Cannon housing
        drawArmorPanel(ctx, 6, -8, 14, 16, '#060210', bossAccent, 4);
        // Heavy barrel
        drawWeaponBarrel(ctx, 8, -5, 32, 10, '#0a0618', bossAccent, '#ffffff');
        // Triple reinforcement collar
        for (let c = 0; c < 3; c++) {
          const cx = 13 + c * 8;
          ctx.strokeStyle = bossAccent; ctx.lineWidth = 2;
          ctx.globalAlpha = 0.5 + Math.sin(brt * 1.5 + c) * 0.25;
          ctx.beginPath(); ctx.arc(cx, 0, 5.5, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.beginPath(); ctx.arc(cx, 0, 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        // Muzzle brake
        ctx.fillStyle = '#fff'; ctx.fillRect(34, -5, 6, 10);
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1;
        for (let mb = 0; mb < 2; mb++) { ctx.beginPath(); ctx.moveTo(34, -4 + mb * 6); ctx.lineTo(40, -4 + mb * 6); ctx.stroke(); }
        // Barrel energy glow
        ctx.fillStyle = bossAccent;
        ctx.globalAlpha = 0.4 + Math.sin(brt) * 0.3;
        ctx.beginPath(); ctx.arc(41, 0, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(41, 0, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
        // === TOP AUXILIARY WEAPONS ===
        for (let m = 0; m < 3; m++) {
          const mx = -10 + m * 10;
          ctx.fillStyle = '#080310'; ctx.strokeStyle = bossAccent; ctx.lineWidth = 1.2;
          drawArmorPanel(ctx, mx - 4, -32, 8, 12, '#080310', bossAccent, 2);
          ctx.fillStyle = bossAccent; ctx.globalAlpha = 0.7;
          ctx.beginPath(); ctx.arc(mx, -32, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
          // Launch tube glow
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath(); ctx.arc(mx, -34, 1.5, 0, Math.PI * 2); ctx.fill();
        }
        // === REAR EXHAUST ===
        const exhGrad = ctx.createRadialGradient(-36, 4, 0, -36, 4, 10);
        exhGrad.addColorStop(0, 'rgba(255,255,255,0.6)'); exhGrad.addColorStop(0.3, bossAccent);
        exhGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = exhGrad;
        ctx.beginPath(); ctx.arc(-36, 4, 10, 0, Math.PI * 2); ctx.fill();
        // === PHASE TRANSITION BLAST ===
        if (this.phaseFlash > 0) {
          const pf = this.phaseFlash / 180;
          ctx.globalAlpha = pf * 0.7; ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = bossAccent; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.arc(0, 0, 52, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = 1;
        }
        break;
      }

      case 'phase':
        if (this.phaseAfterimage > 0) {
          ctx.globalAlpha = 0.18;
          ctx.strokeStyle = '#d9b6ff';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(-7, 0, 20, 13, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(8, -13);
        ctx.lineTo(-13, -10);
        ctx.lineTo(-19, 0);
        ctx.lineTo(-13, 10);
        ctx.lineTo(8, 13);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#d9b6ff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(217,182,255,0.38)';
        ctx.beginPath();
        ctx.arc(0, 0, 20, -Math.PI * 0.7 + t, Math.PI * 0.2 + t);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 13, Math.PI * 0.45 - t, Math.PI * 1.35 - t);
        ctx.stroke();
        drawTechCore(ctx, -2, 0, 4.6, '#fff2ff', '#d9b6ff');
        ctx.save(); ctx.rotate(this.turretAngle);
        drawWeaponBarrel(ctx, 4, -2.4, 16, 4.8, turretC, '#40265d', '#fff2ff');
        ctx.restore();
        break;

    }
    ctx.restore();

    ctx.shadowBlur = 0;
    if (this.hp < this.maxHp) {
      drawEnemyInfoPlate(ctx, 0, -30, 92, this.hp / this.maxHp, glowColor, this.eliteName, getEnemyVisualProfile(this.special).label, this.special.toUpperCase());
      drawEnemyMarker(ctx, -56, -30, this.special, 7.5, glowColor);
    } else {
      drawEnemyMarker(ctx, 0, -28, this.special, 6.8, glowColor);
    }

    if (this.frozen > 0) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#8cf';
      ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = this.special === 'stealth' && this.stealthPhase === 1 ? 0.25 : 1;
    }

    ctx.restore();
    if (this.special === 'stealth' && this.stealthPhase === 1) {
      ctx.globalAlpha = 1;
    }
  }
  hit(bullet) {
    if (this.special === 'barrier' && this.barrierHP > 0) {
      this.barrierHP--;
      spawnExplosion(this.x, this.y, 6, '#4ff', '#fff');
      return false;
    }
    if (this.special === 'stealth' && this.stealthPhase === 1 && rng() < 0.35) {
      spawnExplosion(this.x, this.y, 3, '#888', '#aaa');
      return false;
    }
    const dead = super.hit(bullet);
    if (dead && this.special === 'splitter') {
      spawnExplosion(this.x, this.y, 15, '#c84', '#fb0');
    }
    return dead;
  }
}

// --- Boss System ---
let isBossWave = false;
let bossRef = null;
let bossWarningTimer = 0;
let bossWarningDef = null;
let bossWarningSpawn = null;

const BOSS_TYPES = [
  { name:'巨兽坦克', color:'#833', turret:'#f44', speed:0.34, hp:150, icon:'BST', faction:'moon_arsenal', tier:1,
    desc:'重型压制Boss，装甲轰杀+过载冲击',
    phases:[
      { name:'装甲镇压', hpPct:1.0, attack:'spiral', shootDelay:40, burstShots:3, burstRest:126, telegraph:46, recover:112, bulletCount:11, bulletSpeed:1.58, pressure:0.9, cue:'BREACH ARC', hint:'环形压制后有装甲空窗' },
      { name:'过载破城', hpPct:0.58, attack:'enrage', shootDelay:38, burstShots:3, burstRest:156, telegraph:56, recover:132, bulletCount:12, bulletSpeed:1.92, pressure:1.18, cue:'SIEGE BURN', hint:'正面破城弹后短暂过热' },
    ]},
  { name:'幻影坦克', color:'#448', turret:'#88f', speed:0.68, hp:112, icon:'PHZ', faction:'void_cult', tier:1,
    desc:'高速相位Boss，折跃猎杀+镜像围杀',
    phases:[
      { name:'折跃猎杀', hpPct:1.0, attack:'teleport', shootDelay:46, burstShots:3, burstRest:140, telegraph:42, recover:116, bulletCount:7, bulletSpeed:1.82, pressure:0.86, cue:'PHASE LOCK', hint:'折跃前会锁定安全距离' },
      { name:'镜像歼灭', hpPct:0.6, attack:'clone_barrage', shootDelay:44, burstShots:3, burstRest:176, telegraph:52, recover:142, bulletCount:7, bulletSpeed:1.95, pressure:1.08, cue:'MIRROR LOCK', hint:'镜像结阵后本体短暂停顿' },
    ]},
  { name:'要塞坦克', color:'#664', turret:'#ca4', speed:0.08, hp:180, icon:'FRT', faction:'ash_church', tier:2,
    desc:'堡垒压场Boss，多炮塔火网+雷区封锁',
    phases:[
      { name:'重炮幕墙', hpPct:1.0, attack:'turret_salvo', shootDelay:50, burstShots:3, burstRest:138, telegraph:56, recover:126, bulletCount:9, bulletSpeed:1.82, pressure:1.0, cue:'CITADEL LINE', hint:'炮线展开后侧翼可反击' },
      { name:'湮灭雷暴', hpPct:0.57, attack:'mine_storm', shootDelay:46, burstShots:3, burstRest:166, telegraph:64, recover:150, bulletCount:9, bulletSpeed:2.0, pressure:1.24, cue:'MINE LITURGY', hint:'雷区封锁结束后炮塔冷却' },
    ]},
  { name:'虚空坦克', color:'#424', turret:'#a4f', speed:0.44, hp:132, icon:'VOID', faction:'void_cult', tier:2,
    desc:'奇点操控Boss，引力洪流+黑洞撕裂',
    phases:[
      { name:'引力洪流', hpPct:1.0, attack:'gravity_wave', shootDelay:46, burstShots:3, burstRest:132, telegraph:50, recover:120, bulletCount:9, bulletSpeed:1.7, pressure:0.98, cue:'GRAVITY TIDE', hint:'引力波后奇点短暂失稳' },
      { name:'黑洞撕裂', hpPct:0.6, attack:'black_hole', shootDelay:44, burstShots:3, burstRest:162, telegraph:60, recover:148, bulletCount:9, bulletSpeed:1.9, pressure:1.24, cue:'BLACK WELL', hint:'吸引结束后核心暴露' },
    ]},
  { name:'风暴坦克', color:'#446', turret:'#4ff', speed:0.56, hp:126, icon:'STM', faction:'storm_cloister', tier:2,
    desc:'天候支配Boss，电弧锁链+雷暴空袭',
    phases:[
      { name:'电弧狩猎', hpPct:1.0, attack:'lightning_chain', shootDelay:42, burstShots:3, burstRest:124, telegraph:42, recover:110, bulletCount:7, bulletSpeed:2.32, pressure:0.98, cue:'ARC JUDGMENT', hint:'电弧直线清晰，横移可避' },
      { name:'雷霆天幕', hpPct:0.58, attack:'thunder_storm', shootDelay:40, burstShots:3, burstRest:160, telegraph:54, recover:138, bulletCount:9, bulletSpeed:2.38, pressure:1.25, cue:'STORM CANOPY', hint:'落雷前会标记区域' },
    ]},
  { name:'观星者坦克', color:'#244', turret:'#4ec', speed:0.42, hp:138, icon:'OBS', faction:'observatory', tier:2,
    desc:'数据支配Boss，扫描标记+轨道轰炸',
    phases:[
      { name:'扫描标记', hpPct:1.0, attack:'scan_mark', shootDelay:44, burstShots:3, burstRest:136, telegraph:48, recover:118, bulletCount:8, bulletSpeed:1.76, pressure:0.96, cue:'SCAN LOCK', hint:'扫描束间隙可闪避，被标记后子弹会追踪' },
      { name:'轨道审判', hpPct:0.56, attack:'orbital_strike', shootDelay:42, burstShots:3, burstRest:172, telegraph:62, recover:146, bulletCount:10, bulletSpeed:2.08, pressure:1.28, cue:'ORBITAL JUDGMENT', hint:'光束锁定区域后短暂撤退' },
    ]}
,
  { name:'废铁巨像', color:'#643', turret:'#c84', speed:0.16, hp:165, icon:'SCP', faction:'graveyard', tier:1,
    desc:'残骸支配Boss，废铁回收+过载狂潮',
    phases:[
      { name:'残骸回收', hpPct:1.0, attack:'salvage_swarm', shootDelay:52, burstShots:3, burstRest:148, telegraph:50, recover:134, bulletCount:10, bulletSpeed:1.48, pressure:0.88, cue:'SALVAGE PROTOCOL', hint:'碎片弹幕密度高但速度慢，横移可规避' },
      { name:'废铁觉醒', hpPct:0.54, attack:'scrap_overload', shootDelay:44, burstShots:3, burstRest:158, telegraph:58, recover:140, bulletCount:12, bulletSpeed:1.82, pressure:1.16, cue:'OVERLOAD AWAKENING', hint:'全向弹幕后巨像核心短暂暴露' },
    ]},
  { name:'雷霆执政官', color:'#348', turret:'#6ff', speed:0.48, hp:114, icon:'ARB', faction:'storm_cloister', tier:3,
    desc:'天罚支配Boss，电弧裁决+雷域展开',
    phases:[
      { name:'电弧裁决', hpPct:1.0, attack:'arc_judgment', shootDelay:38, burstShots:3, burstRest:120, telegraph:40, recover:108, bulletCount:6, bulletSpeed:2.62, pressure:1.02, cue:'ARC JUDGMENT', hint:'电弧直线清晰可辨，横移躲避' },
      { name:'雷域展开', hpPct:0.55, attack:'storm_domain', shootDelay:36, burstShots:3, burstRest:156, telegraph:56, recover:136, bulletCount:10, bulletSpeed:2.48, pressure:1.35, cue:'DOMAIN EXPANSION', hint:'雷域边缘安全，但中心持续高压' },
    ]},
  { name:'轨道炮台', color:'#533', turret:'#f84', speed:0.12, hp:140, icon:'ORB', faction:'moon_arsenal', tier:1,
    desc:'远距狙击Boss，激光锁定+光束扫射',
    phases:[
      { name:'激光锁定', hpPct:1.0, attack:'laser_snipe', shootDelay:48, burstShots:1, burstRest:160, telegraph:90, recover:70, bulletCount:1, bulletSpeed:5.5, pressure:0.85, cue:'TARGET LOCK', hint:'躲开激光瞄准线' },
      { name:'光束扫射', hpPct:0.55, attack:'beam_sweep', shootDelay:42, burstShots:3, burstRest:180, telegraph:60, recover:90, bulletCount:5, bulletSpeed:2.8, pressure:1.15, cue:'SWEEP ARRAY', hint:'光束间隙可闪避' },
    ]},
  { name:'圣龛守卫', color:'#864', turret:'#fd0', speed:0.22, hp:175, icon:'SCT', faction:'ash_church', tier:1,
    desc:'神圣堡垒Boss，圣光弹幕+护盾反弹',
    phases:[
      { name:'圣光帷幕', hpPct:1.0, attack:'holy_barrage', shootDelay:50, burstShots:3, burstRest:140, telegraph:48, recover:112, bulletCount:12, bulletSpeed:1.35, pressure:0.9, cue:'SANCTUM LIGHT', hint:'圣光规律密集可读，穿行间隙' },
      { name:'圣盾反制', hpPct:0.52, attack:'shield_counter', shootDelay:46, burstShots:3, burstRest:170, telegraph:54, recover:136, bulletCount:8, bulletSpeed:1.95, pressure:1.1, cue:'SHIELD RETORT', hint:'护盾展开时反弹子弹，关闭后自愈' },
    ]},
  { name:'星象仪', color:'#1a2a3a', turret:'#4ce', speed:0.30, hp:128, icon:'AST', faction:'observatory', tier:1,
    desc:'几何弹幕Boss，星轨旋转环+星座阵列',
    phases:[
      { name:'星轨共鸣', hpPct:1.0, attack:'star_rings', shootDelay:44, burstShots:3, burstRest:150, telegraph:52, recover:122, bulletCount:14, bulletSpeed:1.2, pressure:0.92, cue:'STAR HARMONY', hint:'三层旋转环，逆向观察找稳定空隙' },
      { name:'星座阵列', hpPct:0.5, attack:'constellation', shootDelay:40, burstShots:3, burstRest:168, telegraph:56, recover:140, bulletCount:18, bulletSpeed:1.55, pressure:1.2, cue:'CONSTELLATION', hint:'弹幕排列成几何图形，识破图案找突破口' },
    ]},
  { name:'缝合巨兽', color:'#543', turret:'#c84', speed:0.18, hp:195, icon:'PTC', faction:'graveyard', tier:3,
    desc:'吸收进化Boss，碎片散射+吞噬爆发',
    phases:[
      { name:'碎片回收', hpPct:1.0, attack:'patchwork_swarm', shootDelay:52, burstShots:3, burstRest:148, telegraph:50, recover:126, bulletCount:12, bulletSpeed:1.5, pressure:0.88, cue:'SALVAGE SWARM', hint:'碎片不规则散射，保持移动可规避' },
      { name:'吞噬爆发', hpPct:0.5, attack:'devour_burst', shootDelay:44, burstShots:3, burstRest:172, telegraph:58, recover:152, bulletCount:16, bulletSpeed:1.85, pressure:1.22, cue:'DEVOUR BURST', hint:'吞噬尸体后释放冲击波，远离Boss中心' },
    ]},
  { name:'双子坦克', color:'#426', turret:'#a4f', speed:0.52, hp:100, icon:'GEM', faction:'void_cult', tier:1,
    desc:'双体镜像Boss，交叉火力+狂暴',
    phases:[
      { name:'交叉弹幕', hpPct:1.0, attack:'gemini_cross', shootDelay:40, burstShots:3, burstRest:130, telegraph:44, recover:106, bulletCount:8, bulletSpeed:2.0, pressure:1.0, cue:'MIRROR DANCE', hint:'两体弹幕交织成网，找网眼穿行' },
      { name:'镜像狂暴', hpPct:0.0, attack:'gemini_rage', shootDelay:28, burstShots:3, burstRest:90, telegraph:30, recover:70, bulletCount:18, bulletSpeed:2.6, pressure:1.45, cue:'RAGE AWAKENING', hint:'一体死亡后另一体狂暴，弹幕密度×3' },
    ]},
  { name:'迅影', color:'#123', turret:'#4ff', speed:0.92, hp:90, icon:'SWF', faction:'storm_cloister', tier:3,
    desc:'忍者刺客Boss，手里剑+瞬移背刺',
    phases:[
      { name:'影舞', hpPct:1.0, attack:'shuriken_fan', shootDelay:34, burstShots:3, burstRest:112, telegraph:36, recover:98, bulletCount:5, bulletSpeed:2.8, pressure:0.95, cue:'SHADOW DANCE', hint:'手里剑扇形三发，横移即可规避' },
      { name:'瞬杀连舞', hpPct:0.45, attack:'teleport_flurry', shootDelay:22, burstShots:3, burstRest:140, telegraph:42, recover:114, bulletCount:12, bulletSpeed:3.2, pressure:1.3, cue:'FLURRY STRIKE', hint:'连续瞬移背刺，注意360°手里剑环' },
    ]},
  { name:'圣龛织者', color:'#864', turret:'#fd0', speed:0.10, hp:200, icon:'WEV', faction:'ash_church', tier:3,
    desc:'纯召唤Boss，不攻击但不断召唤精英护卫',
    phases:[
      { name:'织网召唤', hpPct:1.0, attack:'weave_summon', shootDelay:80, burstShots:1, burstRest:280, telegraph:48, recover:180, bulletCount:0, bulletSpeed:0, pressure:0.7, cue:'WEAVE PATTERN', hint:'先清小兵再打Boss，召唤间隔约6秒' },
      { name:'加速编织', hpPct:0.45, attack:'weave_frenzy', shootDelay:52, burstRest:240, burstShots:1, telegraph:38, recover:140, bulletCount:0, bulletSpeed:0, pressure:0.9, cue:'FRENZY WEAVE', hint:'小兵带追踪弹，召唤速度加快但上限降低' },
    ]},
  { name:'灰域剑圣', color:'#411', turret:'#f84', speed:0.68, hp:130, icon:'BLD', faction:'moon_arsenal', tier:3,
    desc:'近战武士Boss，能量巨刃+冲刺斩击',
    phases:[
      { name:'剑术三式', hpPct:1.0, attack:'blade_sweep', shootDelay:42, burstShots:3, burstRest:130, telegraph:44, recover:100, bulletCount:6, bulletSpeed:3.5, pressure:1.0, cue:'BLADE STANCE', hint:'扇形横扫范围大，保持距离后反击' },
      { name:'终焉剑舞', hpPct:0.48, attack:'blade_dance', shootDelay:38, burstShots:3, burstRest:170, telegraph:38, recover:120, bulletCount:10, bulletSpeed:3.8, pressure:1.35, cue:'FINAL DANCE', hint:'旋转斩后有短暂停顿，输出窗口' },
    ]},
  { name:'陷阱师', color:'#542', turret:'#c84', speed:0.22, hp:155, icon:'TRP', faction:'graveyard', tier:2,
    desc:'陷阱Boss，布雷+减速带+弹射器',
    phases:[
      { name:'陷阱阵列', hpPct:1.0, attack:'trap_deploy', shootDelay:55, burstShots:1, burstRest:180, telegraph:42, recover:138, bulletCount:0, bulletSpeed:0, pressure:0.8, cue:'TRAP ARRAY', hint:'注意地面，踩中陷阱会减速和受伤' },
      { name:'雷区狂暴', hpPct:0.5, attack:'trap_frenzy', shootDelay:38, burstShots:1, burstRest:140, telegraph:32, recover:108, bulletCount:0, bulletSpeed:0, pressure:1.1, cue:'MINE FRENZY', hint:'追踪雷+密集地雷阵，小心移动' },
    ]},
  { name:'镜像体', color:'#333', turret:'#999', speed:0.50, hp:120, icon:'MIR', faction:'void_cult', tier:2,
    desc:'复制型Boss，模仿玩家武器弹幕',
    phases:[
      { name:'完美镜像', hpPct:1.0, attack:'mirror_copy', shootDelay:44, burstShots:3, burstRest:140, telegraph:40, recover:110, bulletCount:6, bulletSpeed:2.5, pressure:1.0, cue:'MIRROR COPY', hint:'换不同坦克可打破镜像规律' },
      { name:'强化镜像', hpPct:0.5, attack:'mirror_enhance', shootDelay:34, burstShots:3, burstRest:120, telegraph:34, recover:90, bulletCount:8, bulletSpeed:3.0, pressure:1.25, cue:'ENHANCE', hint:'弹幕速度+20%，弹丸增大' },
    ]},
  { name:'沙暴', color:'#864', turret:'#c84', speed:0.35, hp:145, icon:'SND', faction:'graveyard', tier:2,
    desc:'环境Boss，沙尘降可见度+沙虫突刺',
    phases:[
      { name:'沙尘帷幕', hpPct:1.0, attack:'sand_veil', shootDelay:48, burstShots:3, burstRest:156, telegraph:46, recover:128, bulletCount:10, bulletSpeed:1.6, pressure:0.9, cue:'SAND VEIL', hint:'注意沙尘中弹幕方向，靠小地图走位' },
      { name:'沙虫肆虐', hpPct:0.52, attack:'sand_worm', shootDelay:40, burstShots:3, burstRest:170, telegraph:52, recover:142, bulletCount:14, bulletSpeed:2.0, pressure:1.2, cue:'WORM STRIKE', hint:'地面预警圈即沙虫突刺位置' },
    ]},
  { name:'重力锚', color:'#345', turret:'#8cf', speed:0.18, hp:175, icon:'GRV', faction:'moon_arsenal', tier:3,
    desc:'引力操控Boss，重力井吸引+锚链裁决',
    phases:[
      { name:'重力井', hpPct:1.0, attack:'gravity_well', shootDelay:50, burstShots:3, burstRest:148, telegraph:52, recover:126, bulletCount:12, bulletSpeed:1.5, pressure:0.92, cue:'GRAVITY WELL', hint:'持续被拉向Boss，反向移动保持距离' },
      { name:'锚链裁决', hpPct:0.52, attack:'anchor_judgment', shootDelay:40, burstShots:3, burstRest:162, telegraph:48, recover:138, bulletCount:16, bulletSpeed:1.9, pressure:1.22, cue:'ANCHOR JUDGMENT', hint:'引力+追踪锚弹，利用障碍物阻挡追踪弹' },
    ]},
  { name:'多头蛇', color:'#262', turret:'#4e4', speed:0.40, hp:155, icon:'HYD', faction:'void_cult', tier:2,
    desc:'多头再生Boss，三头齐射+多头狂乱',
    phases:[
      { name:'三头齐射', hpPct:1.0, attack:'triple_strike', shootDelay:42, burstShots:3, burstRest:132, telegraph:44, recover:110, bulletCount:9, bulletSpeed:2.0, pressure:0.96, cue:'TRIPLE STRIKE', hint:'三方向弹幕各120°，找夹角空隙' },
      { name:'多头狂乱', hpPct:0.48, attack:'hydra_frenzy', shootDelay:32, burstShots:3, burstRest:148, telegraph:40, recover:118, bulletCount:15, bulletSpeed:2.3, pressure:1.28, cue:'HYDRA FRENZY', hint:'五头齐射+持续再生，爆发输出' },
    ]},

];

const BESTIARY_LORE = {
  powerups: {
    speed: '灰域运输队的遗物，履带内侧刻着“不要回头”。装上它的人通常真的没有回头。',
    railgun: '第七观测站用来击穿月壳样本的试验炮。后来样本醒了，炮也被送上前线。',
    ricochet: '圣城钟楼坍塌后回收的相位合金。弹道会记住墙壁，如同记住一次失败的祈祷。',
    shield: '机装研究室称它为“短时赦免”。护盾亮起时，驾驶舱里能听见很远处的钟声。',
    rapid: '过热阀门被故意拆除后的产物。它不让武器冷静，也不让驾驶员冷静。',
    repair: '旧时代工程兵留下的手册残页，夹着一枚干枯的月白花。修复装甲，也修复一点点胆量。',
    freeze: '来自北方冷却塔的禁运弹种。它冻结的不是金属，而是敌方装置里那一瞬间的“命令”。',
    multishot: '群星修会早期的防空方案。没有一发子弹被赋予姓名，所以它们一起抵达。',
    magnet: '矿区孩子用月光石碎屑做成的玩具。长大后，玩具被军方重新命名为回收协议。',
    pierce: '祈械外壳太厚，普通弹药只会留下火花。穿甲弹的尖端封存着一段低声咏唱。',
    vampire: '红色模块总是被单独封箱。说明书说它吸收热量，老兵说它吸收遗憾。',
    double_score: '战术终端的结算插件。它让每一次击毁都更有价值，也更像一笔无法注销的账。',
    big_bullet: '将月核碎片粗暴压铸后的弹体。它飞得不快，却像一座小型审判庭。',
    explosive: '灰域爆破队的签名武器。爆光散开时，能短暂照亮地面下埋藏的城市街牌。',
    invisible: '不是隐形，而是让敌人的索敌协议忘记你。被遗忘太久的人会开始怀疑自己是否还活着。',
    thorns: '圣城外环的殉爆装甲。它相信伤害应当被归还，哪怕归还得并不精确。',
    overdrive: '解除安全栓后的红线模式。研究员称它为效率，驾驶员称它为把明天提前烧掉。',
    timewarp: '观测站的失败钟摆。它不能改变时间，只能让敌人的子弹在一瞬间想起重力。',
    goldrush: '月光石粉尘被高温点燃后的短暂丰收。所有仪表都会亮成金色，像末日前的庆典。',
  },
  normals: {
    scout: '巡哨车来自灰域最廉价的侦察批次。它们没有名字，只有路线；路线越简单，牺牲越容易被统计。',
    runner: '疾袭车的引擎常年过热，像一颗拒绝熄灭的心脏。它们被派去撞开阵线，也撞开幸存者的犹豫。',
    brute: '重铠车由旧矿区拖车改造而来，装甲上仍能看到矿尘。它们不懂胜利，只懂把前方压成道路。',
    artillery: '弧炮车的炮口总是微微上扬，仿佛在向碎月祈祷。炮弹落下时，祈祷才抵达地面。',
    sniper: '观星台的远距压制单元，配备长焦光学瞄具与穿甲弹头。驾驶舱里总是安静得像档案馆。',
    sapper: '残骸群最廉价的拒止手段。它们在身后留下地雷，像留下一个未完的省略号。',
    buffer: '灰域教会的移动祝祷台。它不主动攻击，光环却让友军弹链更密、装甲更厚。',
    fissure: '虚空教派的自裂兵器。击毁它只是教会它一种新的分形方式。',
  },
  elites: {
    heavy: '圣城正门的旧守卫，装甲层比墓碑还厚。它们不追击，只把战线向前推。',
    sniper: '观测站失联前发送的最后一种坐标兵器。它开火前会停顿，像在确认你是否值得被记录。',
    fast: '灰域风暴里的侦察机装，轻得像一枚弹壳。它的履带声通常晚于炮火抵达。',
    flame: '焚化区的巡逻单元，把净化和燃烧写进同一个函数。它不憎恨生命，只憎恨潮湿。',
    summoner: '移动中继塔，腹部装着未完成的生产祈文。每次呼叫援军，车体都会短暂像祭坛一样发亮。',
    stealth: '光学迷彩的军用原型，驾驶舱早已空置。雷达显示它不存在，残骸却证明它来过。',
    splitter: '自修复程序被月核污染后的产物。击毁它只是在告诉它，应该以更小的形态继续战斗。',
    regen: '机装研究室的“永续样机”。它把伤口当成接口，把时间当成备用零件。',
    laser: '圣城塔顶拆下的裁决镜阵。光束扫过时，地面会留下像经文一样整齐的焦痕。',
    miner: '灰域布雷队的无人残部。它们播撒的不是地雷，而是未来某一秒的噩耗。',
    barrier: '护教军的移动圣龛。护盾展开时，周围弹片会像朝圣者一样改变方向。',
    missile: '末日前的远程火力平台，导航系统被月相噪声磨坏。它仍会追踪目标，只是不再理解“目标”是什么。',
    warden: '圣城裁断庭的无人执行器，开火前会把弹道像判词一样亮出来。它不是给你警告，而是在宣读结论。',
    phase: '虚月教团把失败折跃者的残响装进车体。它出现时，雷达会先显示一个洞，然后才承认敌人存在。',
  },
  bosses: {
    '巨兽坦克': '破城级攻城机装，曾拖着三座城门走过灰域。二阶段启动时，它会把自己的装甲当作弹药燃烧。',
    '幻影坦克': '相位试验的幸存者，也是失败者。它的镜像并非幻觉，而是没有死成的其他可能性。',
    '要塞坦克': '一座被压缩进履带里的移动堡垒。雷区展开时，战场会短暂恢复成它记忆中的城防图。',
    '虚空坦克': '第七观测站试图用它封存月洞。现在月洞反过来驾驶它，在战场上寻找新的边界。',
    '风暴坦克': '气象控制塔的核心残骸。它召来的雷并非来自天空，而是来自碎月背面的静电海。',
  },
    '废铁巨像': '灰域深处，无人认领的残骸在月光下开始互相寻找。废铁巨像不是被制造的——它是被废弃之物共同的记忆。',
    '雷霆执政官': '修会最高审判庭的唯一机动席位。它携带的不是武器，是已然生效的判决。雷声只是宣读。',
    '观星者坦克': '第七观测站把一座天文台倒置装进车体。它不是在射击——它在记录。每一次光束扫描都是一份证词，每一轮轨道打击都是一次结案。',
  fusions: {
    gold_magnet: '回收协议与结算插件互相吞并后的产物。它会吸来补给，也会吸来贪婪。',
    railgun_plus: '观测炮与穿甲祈文的重叠协议。发射瞬间，炮口会出现一圈微型月蚀。',
    frost_blast: '冷却塔弹芯被灰域炸药强行唤醒。冰先让敌人停下，火再解释原因。',
    undying_thorns: '红色模块与殉爆装甲的禁忌并联。它不保证你活着，只保证敌人也要付账。',
    bullet_storm: '重弹体进入散射阵列后的失控礼花。每一发都像在替某座失守城市回信。',
  },
};

class BossEnemy extends EliteEnemy {
  constructor(x, y, bossDef) {
    const diff = difficultySettings[currentDifficulty];
    const diffIdx = Math.max(0, DIFFICULTY_ORDER.indexOf(currentDifficulty));
    const scaling = 1 + Math.max(0, wave - 4) * 0.045 + Math.max(0, level - 1) * 0.035 + diffIdx * 0.08;
    const hp = Math.floor((bossDef.hp + level * 10 + diff.enemyHpBonus * 18 + Math.floor(wave * 3.2)) * scaling * (diff.bossHpMul || 1) * getBossDuelHpMultiplier(wave) * getDualModeEnemyMul());
    super(x, y, {name:bossDef.name, color:bossDef.color, turret:bossDef.turret, speed:bossDef.speed, hp:Math.max(140,hp), special:'boss', icon:bossDef.icon});
    this.bossDef = bossDef;
    this.maxHp = this.hp;
    this.currentPhase = 0;
    this.phaseTimer = 0;
    this.eliteName = bossDef.name;
    this.eliteIcon = bossDef.icon;
    this.shootDelay = bossDef.phases[0].shootDelay;
    this.baseSpeed = bossDef.speed * diff.enemySpeedMul;
    this.speed = this.baseSpeed;
    this.pressure = bossDef.phases[0].pressure || 1;
    this.phaseFlash = 0;
    this.uiPulse = 0;
    this.transitionLock = 0;
    this.phaseBurstCooldown = 90;
    this.summonCooldown = 300;
    this.attackState = 'recover';
    this.attackStateTimer = 72;
    this.attackStateDuration = 72;
    this.attackRestTimer = 72;
    this.attackBurstShots = 0;
    this.attackCycleLength = bossDef.phases[0].burstRest || 90;
    this.zoneTimer = 0;
    this.auraRadius = 88;
    this.ramTimer = 0;
    this.telegraphTimer = 0;
    this.telegraphX = x;
    this.telegraphY = y;
    this.telegraphAngle = 0;
    this.pendingTeleport = null;
    this.attackCue = bossDef.phases[0].cue || 'BOSS ART';
    this.recoverVulnerable = false;
    this.threatRating = 6.8;
    this.hitFlash = 0;
    // Sandstorm boss: override weather to dust
    if (bossDef.name === '沙暴') {
      weatherOverridden = true;
      weatherType = 'dust';
      weatherIntensity = Math.max(weatherIntensity, 0.42);
      weatherParticles = [];
      const count = 110;
      for (let i = 0; i < count; i++) {
        weatherParticles.push({
          x: rng() * W, y: rng() * H,
          vx: (rng() - 0.5) * 2.5,
          vy: (rng() - 0.5) * 2,
          life: rng() * 180, maxLife: 180 + rng() * 120,
          size: 2 + rng() * 3,
          alpha: 0.15 + rng() * 0.22,
        });
      }
    }
  }
  getPhaseDef() {
    return this.bossDef.phases[Math.max(0, this.currentPhase)] || this.bossDef.phases[0];
  }
  getBossTelegraphDuration(phase) {
    const base = phase.telegraph || 48;
    return Math.max(26, Math.floor(base * (this.currentPhase > 0 ? 0.84 : 0.96)));
  }
  getBossRecoverDuration(phase) {
    const base = phase.recover || phase.burstRest || 120;
    return Math.max(52, Math.floor(base * (this.currentPhase > 0 ? 0.78 : 0.92)));
  }
  setAttackState(state, duration) {
    this.attackState = state;
    this.attackStateDuration = Math.max(1, Math.floor(duration || 1));
    this.attackStateTimer = this.attackStateDuration;
    this.attackRestTimer = state === 'recover' ? this.attackStateTimer : 0;
    this.recoverVulnerable = state === 'recover';
    if (state === 'telegraph') {
      this.attackBurstShots = 0;
      this.prepareTelegraph();
    } else if (state === 'firing') {
      this.shootCooldown = 0;
      this.turretAngle = this.telegraphAngle;
    }
  }
  prepareTelegraph() {
    const phase = this.getPhaseDef();
    this.pendingTeleport = null;
    const dx = player ? player.x - this.x : Math.cos(this.turretAngle);
    const dy = player ? player.y - this.y : Math.sin(this.turretAngle);
    this.telegraphAngle = Math.atan2(dy, dx);
    this.turretAngle = this.telegraphAngle;
    if (phase.attack === 'clone_barrage' || phase.attack === 'thunder_storm') {
      this.telegraphX = player ? player.x : this.x;
      this.telegraphY = player ? player.y : this.y;
      if (phase.attack === 'clone_barrage') {
        this.pendingTeleport = this.findTeleportPoint(235);
      }
    } else if (phase.attack === 'mine_storm') {
      this.telegraphX = this.x;
      this.telegraphY = this.y;
    } else if (phase.attack === 'teleport') {
      this.pendingTeleport = this.findTeleportPoint(this.currentPhase > 0 ? 235 : 195);
      this.telegraphX = this.pendingTeleport.x;
      this.telegraphY = this.pendingTeleport.y;
      if (player) this.telegraphAngle = Math.atan2(player.y - this.telegraphY, player.x - this.telegraphX);
    } else {
      this.telegraphX = this.x;
      this.telegraphY = this.y;
    }
    this.attackCue = phase.cue || 'BOSS ART';
    this.telegraphTimer = this.getBossTelegraphDuration(phase);
    if (this.telegraphTimer % 2 === 0) sfxBossAttack('telegraph', this.currentPhase);
  }
  advanceAttackState(phase) {
    if (this.transitionLock > 0) return;
    if (this.attackStateTimer > 0) this.attackStateTimer--;
    if (this.attackState === 'recover') {
      this.attackRestTimer = this.attackStateTimer;
      if (this.attackStateTimer <= 0) this.setAttackState('telegraph', this.getBossTelegraphDuration(phase));
      return;
    }
    if (this.attackState === 'telegraph') {
      this.telegraphTimer = Math.max(0, this.attackStateTimer);
      if (this.attackStateTimer <= 0) {
        this.setAttackState('firing', Math.max(1, phase.burstShots || 3));
      }
      return;
    }
    if (this.attackState === 'firing' && this.shootCooldown <= 0) {
      this.shoot();
      this.attackBurstShots++;
      const burstLimit = phase.burstShots || (this.currentPhase > 0 ? 4 : 3);
      if (this.attackBurstShots >= burstLimit) {
        this.attackBurstShots = 0;
        this.attackCycleLength = this.getBossRecoverDuration(phase);
        this.setAttackState('recover', this.attackCycleLength);
        this.shootCooldown = Math.max(18, Math.floor((phase.shootDelay || this.shootDelay) * 0.55));
      } else {
        this.shootCooldown = Math.max(18, phase.shootDelay || this.shootDelay);
      }
    }
  }
  findTeleportPoint(minPlayerDist) {
    return findSafeTankSpawn({
      w: 54,
      h: 54,
      minEnemyDist: 90,
      minPlayerDist: minPlayerDist || 180,
      preferred: [
        { x: player.x + 180, y: player.y - 90 },
        { x: player.x - 180, y: player.y - 90 },
        { x: player.x + 180, y: player.y + 90 },
        { x: player.x - 180, y: player.y + 90 },
        { x: W / 2, y: H * 0.25 },
      ].map(p => ({
        x: Math.max(48, Math.min(W - 48, p.x)),
        y: Math.max(48, Math.min(H - 48, p.y)),
      })),
    });
  }
  pushPlayer(amountX, amountY) {
    if (!player || !player.alive) return;
    const hb = player.hitboxSize || 36;
    const margin = Math.max(25, hb / 2 + 7);
    const targetX = Math.max(margin, Math.min(W - margin, player.x + amountX));
    const targetY = Math.max(margin, Math.min(H - margin, player.y + amountY));
    if (!tankCollidesObstacle(targetX, player.y, hb, hb)) player.x = targetX;
    if (!tankCollidesObstacle(player.x, targetY, hb, hb)) player.y = targetY;
  }
  update() {
    if (!this.alive) return;
    if (this.shootCooldown > 0) this.shootCooldown--;
    this.tickFireSlow();
    if (this.frozen > 0) {
      this.frozen--;
      this.speed = this.baseSpeed * 0.5;
      if (this.frozen <= 0) this.speed = this.baseSpeed;
    } else {
      this.speed = this.baseSpeed;
    }
    this.phaseTimer++;
    if (this.phaseFlash > 0) this.phaseFlash--;
    if (this.transitionLock > 0) this.transitionLock--;
    if (this.phaseBurstCooldown > 0) this.phaseBurstCooldown--;
    if (this.hitFlash > 0) this.hitFlash--;
    this.uiPulse = (this.uiPulse + 1) % 9999;
    this.zoneTimer++;
    this.ramTimer++;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    if (this.attackState !== 'firing') {
      const bTarget = Math.atan2(dy, dx);
      const bFaction = this.bossDef?.faction;
      const bSpeed = (TURRET_SPEED_FACTION[bFaction] || 0.09) * 1.3;
      this.turretAngle = rotateTurretToward(this.turretAngle, bTarget, bSpeed);
    }

    let phase = this.bossDef.phases[Math.max(0, this.currentPhase)] || this.bossDef.phases[0];
    const hpRatio = this.hp / this.maxHp;
    this.pressure = phase.pressure || 1;

    // Phase transition
    const phases = this.bossDef.phases;
    for (let i = phases.length - 1; i >= 0; i--) {
      if (this.hp / this.maxHp <= phases[i].hpPct && i > this.currentPhase) {
        this.currentPhase = i;
        this.shootDelay = phases[i].shootDelay;
        this.pressure = phases[i].pressure || this.pressure;
        this.phaseFlash = 180;
        this.transitionLock = 54;
        this.phaseBurstCooldown = 120;
        this.shootCooldown = Math.max(this.shootCooldown, 34);
        this.attackBurstShots = 0;
        this.attackCycleLength = phases[i].burstRest || 86;
        this.baseSpeed *= 1.08;
        recordBossPhaseChange(this, phases[i]);
        triggerShake(12, 18);
        spawnExplosion(this.x, this.y, 60, '#fff', this.bossDef.turret || '#ff0');
        sfxBossPhase();
        showWaveNotification('PHASE ' + (i + 1), this.bossDef.name + ' 进入第二阶段压制');
        this.setAttackState('telegraph', this.getBossTelegraphDuration(phases[i]) + 18);
      }
    }
    phase = this.bossDef.phases[Math.max(0, this.currentPhase)] || this.bossDef.phases[0];

    this.auraRadius = 90 + Math.sin(Date.now() / 180 + this.uiPulse * 0.02) * 6 + this.currentPhase * 16;
    this.threatRating = Math.min(10, 6.2 + wave * 0.08 + level * 0.06 + this.currentPhase * 1.45 + (1 - hpRatio) * 1.2);

    let moveX = 0;
    let moveY = 0;
    const strafeDir = Math.sin(this.phaseTimer / (this.currentPhase > 0 ? 18 : 26)) >= 0 ? 1 : -1;
    if (this.bossDef.name === '巨兽坦克') {
      if (dist > 170) {
        moveX += dx / dist * 0.95;
        moveY += dy / dist * 0.95;
      } else if (dist < 110) {
        moveX -= dx / dist * 0.6;
        moveY -= dy / dist * 0.6;
      }
      if (this.currentPhase > 0 && this.ramTimer > 105) {
        moveX += dx / dist * 0.85;
        moveY += dy / dist * 0.85;
        this.ramTimer = 0;
      }
    } else if (this.bossDef.name === '幻影坦克') {
      moveX += -dy / dist * strafeDir * 0.68;
      moveY += dx / dist * strafeDir * 0.68;
      if (dist > 210) {
        moveX += dx / dist * 0.4;
        moveY += dy / dist * 0.4;
      }
      if (this.currentPhase > 0 && this.zoneTimer % 110 === 0) {
        this.teleportToSafePoint(220);
      }
    } else if (this.bossDef.name === '要塞坦克') {
      if (dist < 150) {
        moveX -= dx / dist * 0.35;
        moveY -= dy / dist * 0.35;
      }
      if (this.currentPhase > 0 && this.attackState === 'recover' && this.zoneTimer % 150 === 0) {
        this.deployMines(3, 160);
      }
    } else if (this.bossDef.name === '虚空坦克') {
      moveX += -dy / dist * strafeDir * 0.45;
      moveY += dx / dist * strafeDir * 0.45;
      if (dist > 210) {
        moveX += dx / dist * 0.42;
        moveY += dy / dist * 0.42;
      }
      if (this.attackState === 'firing' && this.zoneTimer % (this.currentPhase > 0 ? 24 : 32) === 0 && dist < 320) {
        const pull = this.currentPhase > 0 ? 2.2 : 1.15;
        this.pushPlayer(-(dx / dist) * pull, -(dy / dist) * pull);
      }
    } else if (this.bossDef.name === '风暴坦克') {
      moveX += -dy / dist * strafeDir * 0.72;
      moveY += dx / dist * strafeDir * 0.72;
      if (dist > 180) {
        moveX += dx / dist * 0.36;
        moveY += dy / dist * 0.36;
      }
      if (this.currentPhase > 0 && this.attackState === 'firing' && this.zoneTimer % 110 === 0) {
        this.spawnStormLances(2);
      }
    } else if (this.bossDef.name === '观星者坦克') {
      // Keeps medium-long distance, slowly strafes
      if (dist < 200) { moveX -= dx/dist * 0.5; moveY -= dy/dist * 0.5; }
      else if (dist > 340) { moveX += dx/dist * 0.5; moveY += dy/dist * 0.5; }
      moveX += -dy/dist * strafeDir * 0.35;
      moveY += dx/dist * strafeDir * 0.35;
    } else if (this.bossDef.name === '废铁巨像') {
      // Very slow, lumbering advance — never backs off
      moveX += dx/dist * 0.65;
      moveY += dy/dist * 0.65;
    } else if (this.bossDef.name === '雷霆执政官') {
      moveX += -dy/dist * strafeDir * 0.82;
      moveY += dx/dist * strafeDir * 0.82;
      if (dist > 260) { moveX += dx/dist * 0.55; moveY += dy/dist * 0.55; }
      else if (dist < 100) { moveX -= dx/dist * 0.45; moveY -= dy/dist * 0.45; }
    } else if (this.bossDef.name === '轨道炮台') {
      if (dist < 280) { moveX -= dx/dist * 0.6; moveY -= dy/dist * 0.6; }
      else if (dist > 400) { moveX += dx/dist * 0.4; moveY += dy/dist * 0.4; }
      moveX += -dy/dist * strafeDir * 0.3; moveY += dx/dist * strafeDir * 0.3;
    } else if (this.bossDef.name === '圣龛守卫') {
      if (dist < 140) { moveX -= dx/dist * 0.35; moveY -= dy/dist * 0.35; }
      else if (dist > 220) { moveX += dx/dist * 0.25; moveY += dy/dist * 0.25; }
      moveX += -dy/dist * strafeDir * 0.15; moveY += dx/dist * strafeDir * 0.15;
    } else if (this.bossDef.name === '星象仪') {
      if (dist < 180) { moveX -= dx/dist * 0.4; moveY -= dy/dist * 0.4; }
      else if (dist > 300) { moveX += dx/dist * 0.3; moveY += dy/dist * 0.3; }
      moveX += -dy/dist * strafeDir * 0.4; moveY += dx/dist * strafeDir * 0.4;
    } else if (this.bossDef.name === '双子坦克') {
      const isTwin = !!this.geminiMaster;
      const side = isTwin ? -1 : 1;
      if (dist < 130) { moveX -= dx/dist * 0.4; moveY -= dy/dist * 0.4; }
      else if (dist > 240) { moveX += dx/dist * 0.4; moveY += dy/dist * 0.4; }
      moveX += -dy/dist * strafeDir * 0.6 * side; moveY += dx/dist * strafeDir * 0.6 * side;
    } else if (this.bossDef.name === '迅影') {
      moveX += -dy/dist * strafeDir * 0.9; moveY += dx/dist * strafeDir * 0.9;
      if (dist > 200) { moveX += dx/dist * 0.6; moveY += dy/dist * 0.6; }
      else if (dist < 60) { moveX -= dx/dist * 0.3; moveY -= dy/dist * 0.3; }
    } else if (this.bossDef.name === '圣龛织者') {
      if (dist < 100) { moveX -= dx/dist * 0.15; moveY -= dy/dist * 0.15; }
    } else if (this.bossDef.name === '灰域剑圣') {
      moveX += dx/dist * 0.8; moveY += dy/dist * 0.8;
      if (dist < 80) moveX += -dy/dist * strafeDir * 0.3;
    } else if (this.bossDef.name === '陷阱师') {
      if (dist < 160) { moveX -= dx/dist * 0.3; moveY -= dy/dist * 0.3; }
      else if (dist > 280) { moveX += dx/dist * 0.25; moveY += dy/dist * 0.25; }
      moveX += -dy/dist * strafeDir * 0.5; moveY += dx/dist * strafeDir * 0.5;
    } else if (this.bossDef.name === '镜像体') {
      if (dist < 150) { moveX -= dx/dist * 0.5; moveY -= dy/dist * 0.5; }
      else if (dist > 250) { moveX += dx/dist * 0.4; moveY += dy/dist * 0.4; }
      moveX += -dy/dist * strafeDir * 0.5; moveY += dx/dist * strafeDir * 0.5;
    } else if (this.bossDef.name === '沙暴') {
      // Drifting movement — slow, random wobble
      moveX += (dx/dist * 0.2 + (rng()-0.5) * 0.3);
      moveY += (dy/dist * 0.2 + (rng()-0.5) * 0.3);
    } else if (this.bossDef.name === '重力锚') {
      // Heavy anchor — slow drift toward player, constant gravity pull
      moveX += dx/dist * 0.15;
      moveY += dy/dist * 0.15;
      if (this.zoneTimer % (this.currentPhase > 0 ? 10 : 18) === 0 && dist < 370) {
        const pull = this.currentPhase > 0 ? 3.2 : 1.8;
        this.pushPlayer(-(dx/dist) * pull, -(dy/dist) * pull);
      }
    } else if (this.bossDef.name === '多头蛇') {
      // Circling at medium range, regenerates in P2
      if (dist < 130) { moveX -= dx/dist * 0.4; moveY -= dy/dist * 0.4; }
      else if (dist > 250) { moveX += dx/dist * 0.3; moveY += dy/dist * 0.3; }
      moveX += -dy/dist * strafeDir * 0.65; moveY += dx/dist * strafeDir * 0.65;
      if (this.currentPhase > 0 && this.zoneTimer % 160 === 0 && this.hp < this.maxHp) {
        this.hp = Math.min(this.maxHp, this.hp + 6);
        spawnExplosion(this.x + rng()*20-10, this.y + rng()*20-10, 6, '#4f4', '#0f0');
      }
    } else if (this.bossDef.name === '缝合巨兽') {
      moveX += dx/dist * 0.5 + (rng() - 0.5) * 0.15;
      moveY += dy/dist * 0.5 + (rng() - 0.5) * 0.15;
      // Absorb nearby dead enemies to heal
      if (this.zoneTimer % 120 === 0) {
        for (const e of enemies) {
          if (!e.alive && e !== this && e.hp <= 0) {
            const edx = this.x - e.x, edy = this.y - e.y;
            if (Math.sqrt(edx*edx + edy*edy) < 80) {
              this.hp = Math.min(this.maxHp, this.hp + 8);
              spawnExplosion(e.x, e.y, 10, '#c84', '#964');
            }
          }
        }
      }
    }

    const slowMul = this.currentPhase > 0 ? 1.18 : 1;
    const stateMoveMul = this.attackState === 'telegraph' ? 0.42 : (this.attackState === 'firing' ? 0.58 : 0.86);
    const fireSlow = this.getFireSlowMultiplier();
    const newX = this.x + moveX * this.speed * slowMul * fireSlow * stateMoveMul;
    const newY = this.y + moveY * this.speed * slowMul * fireSlow * stateMoveMul;
    if (newX > 34 && newX < W - 34 && !tankCollidesObstacle(newX, this.y, 54, 54)) this.x = newX;
    if (newY > 34 && newY < H - 34 && !tankCollidesObstacle(this.x, newY, 54, 54)) this.y = newY;

    if (this.currentPhase > 0 && this.attackState === 'recover' && this.summonCooldown > 0) this.summonCooldown--;
    if (this.currentPhase > 0 && this.attackState === 'recover' && this.summonCooldown <= 0) {
      this.spawnBossEscort();
      this.summonCooldown = this.bossDef.name === '幻影坦克' ? 360 : 330;
    }

    this.advanceAttackState(phase);

    if (dist < 50) {
      triggerShake(8, 10);
      player.hit('Boss 近身撞击');
      const knock = 35;
      this.pushPlayer((dx / dist) * knock, (dy / dist) * knock);
    }
  }
  shoot() {
    const phase = this.bossDef.phases[Math.max(0, this.currentPhase)] || this.bossDef.phases[0];
    const bx = this.x + Math.cos(this.turretAngle) * 22;
    const by = this.y + Math.sin(this.turretAngle) * 22;
    const hpRatio = this.hp / this.maxHp;
    const rageSpeed = this.currentPhase > 0 ? 0.14 : 0;
    const bonusBullets = this.currentPhase > 0 ? 2 : 0;
    if (phase.attack === 'spiral') {
      // === BEHEMOTH P1: 破城弹幕 — expanding rings + forward cone ===
      const total = phase.bulletCount + bonusBullets;
      // Expanding ring from boss center (shockwave feel)
      const ringCount = this.currentPhase > 0 ? 12 : 9;
      for (let i = 0; i < ringCount; i++) {
        const a = this.phaseTimer * 0.1 + (i / ringCount) * Math.PI * 2;
        const b = new Bullet(this.x, this.y, a, 1.55 + this.currentPhase * 0.2, '#f44', false, 1);
        b.radius = 3.5;
        enemyBullets.push(b);
      }
      // Forward dense cone
      for (let i = 0; i < total; i++) {
        const a = this.turretAngle + (i - total/2) * 0.22;
        const b = new Bullet(bx, by, a, phase.bulletSpeed + rageSpeed, '#ff6040', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = this.currentPhase > 0 ? 4 : 3.2;
        enemyBullets.push(b);
      }
      if (this.currentPhase > 0) {
        // Second ring, counter-rotating
        for (let i = 0; i < 8; i++) {
          const a = -this.phaseTimer * 0.07 + (i / 8) * Math.PI * 2;
          const b = new Bullet(this.x, this.y, a, 1.35, '#ffb25d', false, 1);
          b.radius = 2.8; enemyBullets.push(b);
        }
      }
    } else if (phase.attack === 'enrage') {
      // === BEHEMOTH P2: 过热狂潮 — spiral + scatter burst ===
      const total = phase.bulletCount + bonusBullets + 2;
      // Dense forward barrage
      for (let i = 0; i < total; i++) {
        const a = this.turretAngle + (i - total/2) * 0.14;
        const b = new Bullet(bx, by, a, phase.bulletSpeed + 0.25, '#f80', false, 2);
        b.radius = 4.2; enemyBullets.push(b);
      }
      // Rotating scatter ring
      for (let ring = 0; ring < 2; ring++) {
        const ringCount = 10 + ring * 4;
        for (let i = 0; i < ringCount; i++) {
          const a = this.phaseTimer * (0.08 + ring * 0.04) + (i / ringCount) * Math.PI * 2;
          const b = new Bullet(this.x, this.y, a, 1.6 + ring * 0.3, '#ffb25d', false, 1);
          b.radius = 2.6 + ring; enemyBullets.push(b);
        }
      }
      if (this.currentPhase > 0) triggerShake(3, 4);
    } else if (phase.attack === 'teleport') {
      if (this.attackBurstShots === 0) this.teleportToSafePoint(this.currentPhase > 0 ? 235 : 195);
      const total = phase.bulletCount + bonusBullets;
      for (let i = 0; i < total; i++) {
        const a = (i / total) * Math.PI * 2 + this.phaseTimer * 0.04;
        const b = new Bullet(this.x, this.y, a, phase.bulletSpeed + rageSpeed, '#88f', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = this.currentPhase > 0 ? 3.8 : 3;
        enemyBullets.push(b);
      }
      if (this.currentPhase > 0) {
        for (let i = 0; i < 4; i++) {
          const a = this.turretAngle + (i - 1.5) * 0.09;
          const b = new Bullet(this.x, this.y, a, 3.15, '#d9e6ff', false, 1);
          b.radius = 2.6;
          enemyBullets.push(b);
        }
      }
    } else if (phase.attack === 'clone_barrage') {
      const clusters = 2;
      const baseX = this.telegraphX || (player ? player.x : this.x);
      const baseY = this.telegraphY || (player ? player.y : this.y);
      for (let j = 0; j < clusters; j++) {
        const angle = (j / clusters) * Math.PI * 2 + this.phaseTimer * 0.05;
        const cx = baseX + Math.cos(angle) * (this.currentPhase > 0 ? 112 : 90);
        const cy = baseY + Math.sin(angle) * (this.currentPhase > 0 ? 92 : 70);
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + angle * 0.4;
          const b = new Bullet(cx, cy, a, phase.bulletSpeed + 0.15, '#aaf', false, 1);
          b.radius = 3;
          enemyBullets.push(b);
        }
      }
      if (this.attackBurstShots === 0) this.teleportToSafePoint(235);
    } else if (phase.attack === 'turret_salvo') {
      // === FORTRESS P1: 弹幕围墙 — moving wall of bullets ===
      const offsets = [-30, -15, 0, 15, 30];
      for (const offset of offsets) {
        const tx = this.x + offset;
        for (let i = 0; i < 4; i++) {
          const a = this.telegraphAngle + (i - 1.5) * 0.08;
          const b = new Bullet(tx, this.y + (i-1.5)*12, a, phase.bulletSpeed + rageSpeed, '#ca4', false, this.currentPhase > 0 ? 2 : 1);
          b.radius = 3.5; enemyBullets.push(b);
        }
      }
      // Rotating wall ring
      for (let i = 0; i < 12; i++) {
        const a = this.phaseTimer * 0.05 + (i / 12) * Math.PI * 2;
        const b = new Bullet(this.x + Math.cos(a)*25, this.y + Math.sin(a)*25, a + Math.PI/2, 1.45, '#da4', false, 1);
        b.radius = 2.8; enemyBullets.push(b);
      }
      if (this.currentPhase > 0) this.deployMines(2, 180);
    } else if (phase.attack === 'mine_storm') {
      this.deployMines(this.currentPhase > 0 ? 4 : 3, this.currentPhase > 0 ? 215 : 175);
      for (let i = 0; i < phase.bulletCount + bonusBullets; i++) {
        const a = this.turretAngle + (i - (phase.bulletCount + bonusBullets) / 2) * 0.085;
        const b = new Bullet(bx, by, a, phase.bulletSpeed + 0.1, '#ff0', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = this.currentPhase > 0 ? 3.8 : 3;
        enemyBullets.push(b);
      }
    } else if (phase.attack === 'gravity_wave') {
      // === VOID P1: 旋涡吸积 — inward spiral + forward cone ===
      const total = phase.bulletCount + bonusBullets;
      // Inward spiral (bullets spiral toward boss)
      for (let i = 0; i < total + 4; i++) {
        const a = this.phaseTimer * 0.08 + (i / (total + 4)) * Math.PI * 2;
        const dist = 15 + i * 3;
        const b = new Bullet(this.x + Math.cos(a) * dist, this.y + Math.sin(a) * dist, a + Math.PI/2, 1.4, '#c4f', false, 1);
        b.radius = 3.5; enemyBullets.push(b);
      }
      // Forward cone from barrel
      for (let i = 0; i < total; i++) {
        const a = this.turretAngle + (i - total/2) * 0.18;
        const b = new Bullet(bx, by, a, phase.bulletSpeed + rageSpeed, '#c4f', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = this.currentPhase > 0 ? 5 : 4; enemyBullets.push(b);
      }
      if (this.currentPhase > 0 && hpRatio < 0.4 && this.phaseBurstCooldown <= 0) {
        this.phaseBurstCooldown = 105;
        this.emitPhaseBurst(false);
      }
    } else if (phase.attack === 'black_hole') {
      // === VOID P2: 黑洞弹幕花 — gravity pull + concentric petals ===
      const pdx = player.x - this.x, pdy = player.y - this.y;
      const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pdist > 30 && pdist < 350) {
        this.pushPlayer(-(pdx / pdist) * (this.currentPhase > 0 ? 2.2 : 1.6), -(pdy / pdist) * (this.currentPhase > 0 ? 2.2 : 1.6));
      }
      // Concentric rings (petal pattern)
      for (let ring = 0; ring < 3; ring++) {
        const count = 8 + ring * 6;
        for (let i = 0; i < count; i++) {
          const a = this.phaseTimer * (0.04 + ring * 0.02) + (i / count) * Math.PI * 2;
          const dist = 12 + ring * 10;
          const b = new Bullet(this.x, this.y, a, 1.2 + ring * 0.35, '#a4f', false, 1);
          b.radius = 2.5 + ring; enemyBullets.push(b);
        }
      }
      // Direct shots at player
      for (let i = 0; i < phase.bulletCount + bonusBullets; i++) {
        const a = this.phaseTimer * 0.06 + (i / (phase.bulletCount + bonusBullets)) * Math.PI * 2;
        const b = new Bullet(this.x, this.y, a, phase.bulletSpeed + 0.25, '#a4f', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = this.currentPhase > 0 ? 4.2 : 3.4; enemyBullets.push(b);
      }
      spawnExplosion(this.x, this.y, this.currentPhase > 0 ? 18 : 12, '#a4f', '#fff');
      triggerShake(this.currentPhase > 0 ? 10 : 6, 10);
    } else if (phase.attack === 'lightning_chain') {
      for (let i = 0; i < phase.bulletCount + bonusBullets; i++) {
        const a = this.turretAngle + (i - (phase.bulletCount + bonusBullets) / 2) * 0.085;
        const b = new Bullet(bx, by, a, phase.bulletSpeed + rageSpeed, '#4ff', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = 2;
        b.railgun = true; // piercing lightning bolts
        enemyBullets.push(b);
      }
      if (this.currentPhase > 0) this.spawnStormLances(2);
    } else if (phase.attack === 'thunder_storm') {
      const strikes = this.currentPhase > 0 ? 4 : 3;
      const baseX = this.telegraphX || (player ? player.x : this.x);
      const baseY = this.telegraphY || (player ? player.y : this.y);
      for (let j = 0; j < strikes; j++) {
        const angle = (j / strikes) * Math.PI * 2 + this.phaseTimer * 0.03;
        const sx = baseX + Math.cos(angle) * (120 + rng() * 80);
        const sy = baseY + Math.sin(angle) * (80 + rng() * 60);
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          const b = new Bullet(sx, sy, a, phase.bulletSpeed + 0.1, '#4ff', false, this.currentPhase > 0 ? 2 : 1);
          b.radius = this.currentPhase > 0 ? 3.2 : 2.8;
          enemyBullets.push(b);
        }
      }
      spawnExplosion(this.x, this.y, this.currentPhase > 0 ? 28 : 20, '#4ff', '#fff');
      triggerShake(this.currentPhase > 0 ? 8 : 5, 8);
    } else if (phase.attack === 'scan_mark') {
      // Observatory Phase 1: Scanning beam fan + marking rounds
      const total = phase.bulletCount + bonusBullets;
      const scanWidth = 0.7 + this.phaseTimer * 0.01;
      for (let i = 0; i < total; i++) {
        const a = this.turretAngle + (i - total / 2) * scanWidth / total;
        const b = new Bullet(bx, by, a, phase.bulletSpeed + rageSpeed, '#4ec', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = 3;
        b.isMarking = true; // Marks player for tracking
        enemyBullets.push(b);
      }
      // Side scanner pulses
      for (let s = -1; s <= 1; s += 2) {
        for (let i = 0; i < 3; i++) {
          const a = this.turretAngle + s * (0.4 + i * 0.15);
          const b = new Bullet(bx, by, a, phase.bulletSpeed + 0.3, '#3cc', false, 1);
          b.radius = 2.4;
          enemyBullets.push(b);
        }
      }
      if (this.currentPhase > 0) {
        for (let i = 0; i < 5; i++) {
          const a = this.turretAngle + (i - 2) * 0.08;
          const b = new Bullet(bx, by, a, 2.45, '#aff', false, 1);
          b.radius = 3.2;
          enemyBullets.push(b);
        }
      }
    } else if (phase.attack === 'orbital_strike') {
      // === OBSERVER P2: 轨道审判 — concentric rings + cardinal bombardment ===
      const baseX = this.telegraphX || (player ? player.x : this.x);
      const baseY = this.telegraphY || (player ? player.y : this.y);
      // 4 cardinal strikes
      const strikeRadius = this.currentPhase > 0 ? 155 : 125;
      const directions = [0, Math.PI/2, Math.PI, Math.PI*1.5];
      for (const dir of directions) {
        const sx = baseX + Math.cos(dir) * strikeRadius;
        const sy = baseY + Math.sin(dir) * strikeRadius;
        for (let i = 0; i < Math.floor((phase.bulletCount + bonusBullets) / 4); i++) {
          const a = dir + Math.PI + (i - 1) * 0.12;
          const b = new Bullet(sx, sy, a, phase.bulletSpeed + rageSpeed, '#0ee', false, this.currentPhase > 0 ? 2 : 1);
          b.radius = 3.6; enemyBullets.push(b);
        }
        spawnExplosion(sx, sy, 8, '#4ec', '#0ee');
      }
      // Concentric rings (Touhou-style)
      for (let ring = 0; ring < 3; ring++) {
        const count = 10 + ring * 6;
        for (let i = 0; i < count; i++) {
          const a = this.phaseTimer * (0.03 + ring * 0.02) + (i / count) * Math.PI * 2;
          const dist = 25 + ring * 20;
          const b = new Bullet(baseX + Math.cos(a)*dist, baseY + Math.sin(a)*dist, a + Math.PI/2, 1.3 + ring * 0.25, '#0ee', false, 1);
          b.radius = 2.2; enemyBullets.push(b);
        }
      }
      // Center burst
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + this.phaseTimer * 0.05;
        const b = new Bullet(baseX, baseY, a, 1.5, '#0ee', false, 1);
        b.radius = 2; enemyBullets.push(b);
      }
      triggerShake(this.currentPhase > 0 ? 12 : 8, 12);
      spawnExplosion(baseX, baseY, 22, '#4ec', '#aff');    } else if (phase.attack === 'salvage_swarm') {
      // === SCRAP P1: 碎片风暴 — random sector bursts ===
      const total = phase.bulletCount + bonusBullets;
      // Random sector burst (fires in one direction, rotates each volley)
      const sectorAngle = this.phaseTimer * 0.3;
      for (let i = 0; i < total + 4; i++) {
        const a = sectorAngle + (i - (total+4)/2) * 0.18;
        const b = new Bullet(this.x, this.y, a, phase.bulletSpeed + (i % 3) * 0.25, '#c84', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = 2.8 + (i % 2) * 1.4; enemyBullets.push(b);
      }
      // Scatter debris
      for (let i = 0; i < 6; i++) {
        const a = this.phaseTimer * 0.07 + (i / 6) * Math.PI * 2;
        const b = new Bullet(this.x + Math.cos(a) * 22, this.y + Math.sin(a) * 22, a + rng() * 0.5, 1.5, '#964', false, 1);
        b.radius = 3.5; enemyBullets.push(b);
      }
      if (this.currentPhase > 0 && rng() < 0.35) this.deployMines(1, 120);
    } else if (phase.attack === 'scrap_overload') {
      // === SCRAP P2: 弹片雨 — 360° with random gaps + splitting debris ===
      const total = phase.bulletCount + bonusBullets + 2;
      // Dense 360 burst with intentional gaps
      const gapCount = 3 + rng() * 2;
      const gaps = new Set();
      for (let g = 0; g < gapCount; g++) gaps.add(Math.floor(rng() * 18));
      for (let i = 0; i < 18; i++) {
        if (gaps.has(i)) continue; // Skip gap sectors
        const a = this.phaseTimer * 0.06 + (i / 18) * Math.PI * 2;
        for (let j = 0; j < 2; j++) {
          const b = new Bullet(this.x, this.y, a + j * 0.08, 1.7 + j * 0.3, '#f84', false, 1);
          b.radius = 3 + j; enemyBullets.push(b);
        }
      }
      // Fast directed shards
      for (let i = 0; i < 5; i++) {
        const a = this.turretAngle + (i - 2) * 0.18;
        const b = new Bullet(bx, by, a, 3.0, '#fa3', false, 2);
        b.radius = 2.8; enemyBullets.push(b);
      }
      spawnExplosion(this.x, this.y, 16, '#c84', '#964');
      triggerShake(6, 8);
    } else if (phase.attack === 'arc_judgment') {
      // Storm Phase 1: Precision lightning bolts
      const total = phase.bulletCount + bonusBullets;
      for (let i = 0; i < total; i++) {
        const a = this.turretAngle + (i - total / 2) * 0.065;
        const b = new Bullet(bx, by, a, phase.bulletSpeed + rageSpeed, '#6ff', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = 2.2;
        b.railgun = true;
        enemyBullets.push(b);
      }
      for (let s = -1; s <= 1; s += 2) {
        const a = this.turretAngle + s * 0.38;
        const b = new Bullet(bx, by, a, 2.95, '#0ee', false, 1);
        b.radius = 1.8;
        b.railgun = true;
        enemyBullets.push(b);
      }
      if (this.currentPhase > 0) this.spawnStormLances(1);
    } else if (phase.attack === 'storm_domain') {
      // Storm Phase 2: Expanding lightning domain
      const baseX = this.telegraphX || (player ? player.x : this.x);
      const baseY = this.telegraphY || (player ? player.y : this.y);
      const rings = this.currentPhase > 0 ? 3 : 2;
      const ringRadii = [75, 120, 170];
      for (let r = 0; r < Math.min(rings, ringRadii.length); r++) {
        const count = 6 + r * 3;
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2 + this.phaseTimer * 0.04 * (r + 1) * (r % 2 ? -1 : 1);
          const sx = baseX + Math.cos(a) * ringRadii[r];
          const sy = baseY + Math.sin(a) * ringRadii[r];
          const b = new Bullet(sx, sy, a + Math.PI / 2, phase.bulletSpeed + r * 0.3, '#6ff', false, this.currentPhase > 0 ? 2 : 1);
          b.radius = 2.4;
          enemyBullets.push(b);
        }
      }
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const b = new Bullet(baseX, baseY, a, 1.55, '#0ff', false, 1);
        b.radius = 2;
        enemyBullets.push(b);
      }
      spawnExplosion(baseX, baseY, 26, '#6ff', '#fff');
      triggerShake(this.currentPhase > 0 ? 10 : 7, 10);
    } else if (phase.attack === 'laser_snipe') {
      // === ORBITAL CANNON P1: Single high-speed railgun snipe ===
      const a = this.telegraphAngle;
      const b = new Bullet(bx, by, a, phase.bulletSpeed + 3.0, '#f84', true, this.currentPhase > 0 ? 3 : 2);
      b.radius = 3.5; b.railgun = true;
      enemyBullets.push(b);
      // Warning beam visual is handled by telegraph
      triggerShake(3, 5);
    } else if (phase.attack === 'beam_sweep') {
      const total = phase.bulletCount + bonusBullets;
      for (let line = 0; line < 3; line++) {
        const sweepAngle = this.telegraphAngle + (line - 1) * 0.35 + Math.sin(this.phaseTimer * 0.02 + line) * 0.15;
        for (let i = 0; i < total; i++) {
          const a = sweepAngle + (i - total/2) * 0.06;
          const b = new Bullet(this.x, this.y, a, phase.bulletSpeed + line * 0.3, '#f84', false, this.currentPhase > 0 ? 2 : 1);
          b.radius = 2.5; enemyBullets.push(b);
        }
      }
      triggerShake(4, 8);
    } else if (phase.attack === 'holy_barrage') {
      // === SANCTUM GUARD P1: Slow golden ring barrage ===
      const total = phase.bulletCount + bonusBullets;
      for (let i = 0; i < total; i++) {
        const a = this.phaseTimer * 0.03 + (i / total) * Math.PI * 2;
        const b = new Bullet(this.x, this.y, a, phase.bulletSpeed, '#fd0', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = 4; enemyBullets.push(b);
      }
      // Second ring, counter-rotating
      for (let i = 0; i < total - 4; i++) {
        const a = -this.phaseTimer * 0.035 + (i / (total - 4)) * Math.PI * 2;
        const b = new Bullet(this.x, this.y, a, phase.bulletSpeed * 0.85, '#da0', false, 1);
        b.radius = 3.2; enemyBullets.push(b);
      }
    } else if (phase.attack === 'shield_counter') {
      const total = phase.bulletCount + bonusBullets;
      for (let i = 0; i < total; i++) {
        const a = this.turretAngle + (i - total/2) * 0.15;
        const b = new Bullet(bx, by, a, phase.bulletSpeed, '#fd0', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = 3.5; enemyBullets.push(b);
      }
      if (this.hp < this.maxHp) this.hp = Math.min(this.maxHp, this.hp + 3);
      spawnExplosion(this.x, this.y, 14, '#fd0', '#fff');
    } else if (phase.attack === 'star_rings') {
      // === ASTROLABE P1: 3 concentric rotating rings ===
      const rings = [{count: 10, speed: 0.04, dist: 10, dir: 1},
                     {count: 14, speed: -0.03, dist: 22, dir: -1},
                     {count: 18, speed: 0.025, dist: 35, dir: 1}];
      rings.forEach(ring => {
        for (let i = 0; i < ring.count; i++) {
          const a = this.phaseTimer * ring.speed * ring.dir + (i / ring.count) * Math.PI * 2;
          const b = new Bullet(this.x + Math.cos(a) * ring.dist, this.y + Math.sin(a) * ring.dist, a + Math.PI/2 * ring.dir, phase.bulletSpeed, '#4ce', false, this.currentPhase > 0 ? 2 : 1);
          b.radius = 2.5; enemyBullets.push(b);
        }
      });
    } else if (phase.attack === 'constellation') {
      const shapes = ['cross', 'triangle', 'hexagon'];
      const shape = shapes[this.attackBurstShots % 3];
      const pts = shape === 'cross' ? 4 : shape === 'triangle' ? 3 : 6;
      const cx = this.x, cy = this.y;
      for (let i = 0; i < pts; i++) {
        const a = this.phaseTimer * 0.02 + (i / pts) * Math.PI * 2;
        const dist = shape === 'hexagon' ? 28 : 35;
        const dx = cx + Math.cos(a) * dist, dy = cy + Math.sin(a) * dist;
        for (let j = 0; j < 4; j++) {
          const b = new Bullet(dx, dy, a + j * 0.08, phase.bulletSpeed, '#0ee', false, this.currentPhase > 0 ? 2 : 1);
          b.radius = 2.8; enemyBullets.push(b);
        }
      }
      const centerCount = Math.floor((phase.bulletCount + bonusBullets) / 2);
      for (let i = 0; i < centerCount; i++) {
        const a = (i / centerCount) * Math.PI * 2;
        const b = new Bullet(cx, cy, a, 1.3, '#0ff', false, 1);
        b.radius = 2.2; enemyBullets.push(b);
      }
    } else if (phase.attack === 'patchwork_swarm') {
      // === PATCHWORK P1: Irregular debris scatter ===
      const total = phase.bulletCount + bonusBullets;
      for (let i = 0; i < total; i++) {
        const a = this.turretAngle + (i - total/2) * 0.25 + (rng() - 0.5) * 0.15;
        const b = new Bullet(bx, by, a, phase.bulletSpeed + rng() * 0.4, '#c84', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = 2.5 + rng() * 2; enemyBullets.push(b);
      }
      // Random scatter from weld seams
      for (let i = 0; i < 6; i++) {
        const a = this.phaseTimer * 0.07 + (i / 6) * Math.PI * 2;
        const b = new Bullet(this.x + Math.cos(a) * 22, this.y + Math.sin(a) * 22, a + rng() * 0.5, 1.4, '#964', false, 1);
        b.radius = 3; enemyBullets.push(b);
      }
    } else if (phase.attack === 'devour_burst') {
      // === PATCHWORK P2: Devour + shockwave burst ===
      // === GEMINI P1: Cross-fire — bullets aimed toward twin's position ===
      const twin = this.geminiTwin || this.geminiMaster;
      const twinX = twin ? twin.x : this.x + (Math.random() > 0.5 ? 120 : -120);
      const twinY = twin ? twin.y : this.y + (Math.random() > 0.5 ? 80 : -80);
      const crossAngle = Math.atan2(twinY - this.y, twinX - this.x);
      const total = phase.bulletCount + bonusBullets;
      for (let i = 0; i < total; i++) {
        const a = crossAngle + (i - total/2) * 0.12;
        const b = new Bullet(bx, by, a, phase.bulletSpeed, '#a4f', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = 3; enemyBullets.push(b);
      }
    } else if (phase.attack === 'gemini_rage') {
      // === GEMINI RAGE (P2): Triple density chaotic spray ===
      const total = phase.bulletCount + bonusBullets;
      for (let wave = 0; wave < 3; wave++) {
        for (let i = 0; i < total; i++) {
          const a = this.phaseTimer * (0.04 + wave * 0.02) + (i / total) * Math.PI * 2;
          const b = new Bullet(this.x, this.y, a, phase.bulletSpeed + wave * 0.3, '#d8f', false, 2);
          b.radius = 2.8; enemyBullets.push(b);
        }
      }
      spawnExplosion(this.x, this.y, 12, '#a4f', '#f0f');
    } else if (phase.attack === 'gemini_cross') {
      const twin = this.geminiTwin || this.geminiMaster;
      const tx = twin ? twin.x : this.x + 120, ty = twin ? twin.y : this.y;
      const crossAngle = Math.atan2(ty - this.y, tx - this.x);
      const total = phase.bulletCount + bonusBullets;
      for (let i = 0; i < total; i++) {
        const a = crossAngle + (i - total/2) * 0.12;
        const b = new Bullet(bx, by, a, phase.bulletSpeed, '#a4f', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = 3; enemyBullets.push(b);
      }
    } else if (phase.attack === 'gemini_rage') {
      const total = phase.bulletCount + bonusBullets;
      for (let wave = 0; wave < 3; wave++) {
        for (let i = 0; i < total; i++) {
          const a = this.phaseTimer * 0.06 + (i / total) * Math.PI * 2;
          const b = new Bullet(this.x, this.y, a, phase.bulletSpeed + wave * 0.3, '#d8f', false, 2);
          b.radius = 2.8; enemyBullets.push(b);
        }
      }
      spawnExplosion(this.x, this.y, 12, '#a4f', '#f0f');
    } else if (phase.attack === 'shuriken_fan') {
      // === SWIFT SHADOW P1: Fan of 3 shurikens + smoke ===
      for (let s = -1; s <= 1; s++) {
        const a = this.turretAngle + s * 0.15;
        const b = new Bullet(bx, by, a, phase.bulletSpeed + Math.abs(s) * 0.5, '#4ff', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = 2.2; enemyBullets.push(b);
      }
      // Smoke — reduce player visibility briefly
      if (player && rng() < 0.5) {
        spawnExplosion(this.x + (rng()-0.5)*40, this.y + (rng()-0.5)*40, 15, '#888', '#aaa');
      }
    } else if (phase.attack === 'weave_summon') {
      // === WEAVER: Summon 2-3 elite escorts (slower, fewer) ===
      const count = 2 + Math.floor(rng() * 2);
      for (let i = 0; i < count; i++) {
        if (enemies.length < 18) {
          const idx = Math.floor(rng() * Math.min(4, eliteTypes.length));
          const etype = eliteTypes[idx];
          const sx = this.x + (rng() - 0.5) * 100, sy = this.y + (rng() - 0.5) * 80;
          const elite = new EliteEnemy(Math.max(40, Math.min(W-40, sx)), Math.max(40, Math.min(H-40, sy)), etype);
          elite.hp = Math.floor(elite.hp * 0.8);
          elite.maxHp = elite.hp;
          enemies.push(elite);
          spawnExplosion(sx, sy, 8, '#fd0', '#fff');
        }
      }
      spawnExplosion(this.x, this.y, 16, '#fd0', '#ff0');
    } else if (phase.attack === 'blade_sweep') {
      // === ASH BLADE P1: 120° sweep arc + dash slash ===
      const total = phase.bulletCount + bonusBullets;
      for (let i = 0; i < total; i++) {
        const a = this.turretAngle + (i - total/2) * (Math.PI * 0.35 / total);
        const b = new Bullet(bx, by, a, phase.bulletSpeed, '#f84', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = 3.2; enemyBullets.push(b);
      }
      // Dash forward — leave burning trail (guard against zero-dist)
      if (dist > 1) {
        const dashX = this.x + dx/dist * 60, dashY = this.y + dy/dist * 60;
        for (let d = 0; d < 6; d++) {
          const px = this.x + (dashX - this.x) * d/6, py = this.y + (dashY - this.y) * d/6;
          spawnExplosion(px + rng()*8, py + rng()*8, 4, '#f80', '#fc0');
        }
        this.x = Math.max(40, Math.min(W-40, dashX));
        this.y = Math.max(40, Math.min(H-40, dashY));
      }
    } else if (phase.attack === 'trap_deploy') {
      // === TRAPPER P1: Deploy minefield + slowdown zones ===
      this.deployMines(3 + this.currentPhase, 180);
      // Drop slowing traps around the boss
      for (let i = 0; i < 4; i++) {
        const tx = this.x + (rng()-0.5)*160, ty = this.y + (rng()-0.5)*140;
        spawnExplosion(tx, ty, 8, '#c84', '#da0');
      }
      if (rng() < 0.3) this.deployMines(2, 120);
    } else if (phase.attack === 'mirror_copy') {
      // === MIRROR SHELL P1: Copy player's weapon pattern ===
      const pt = player && player._tankDef ? player._tankDef.tankType : 'spread';
      const mirrorCfg = { spread:{c:3, a:0.12}, focus:{c:1, a:0}, wide:{c:5, a:0.15}, burst:{c:7, a:0.2}, sniper:{c:1, a:0}, homing:{c:2, a:0.08} };
      const cfg = mirrorCfg[pt] || mirrorCfg.spread;
      for (let i = 0; i < cfg.c; i++) {
        const a = this.turretAngle + (i - (cfg.c-1)/2) * cfg.a;
        const b = new Bullet(bx, by, a, phase.bulletSpeed, '#999', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = 2.5; enemyBullets.push(b);
      }
      // Flash to show mirroring
      spawnExplosion(this.x, this.y, 6, '#fff', '#888');
    } else if (phase.attack === 'sand_veil') {
      // === SANDSTORM P1: Random direction bursts from sand cloud ===
      const total = phase.bulletCount + bonusBullets;
      for (let burst = 0; burst < 3; burst++) {
        const dir = this.phaseTimer * 0.04 + burst * Math.PI * 2 / 3;
        for (let i = 0; i < Math.floor(total / 3); i++) {
          const a = dir + (i - Math.floor(total/6)) * 0.15;
          const b = new Bullet(this.x + Math.cos(dir)*20, this.y + Math.sin(dir)*20, a, phase.bulletSpeed + rng()*0.3, '#c84', false, this.currentPhase > 0 ? 2 : 1);
          b.radius = 2.8; enemyBullets.push(b);
        }
      }
    } else if (phase.attack === 'sand_worm') {
      // === SANDSTORM P2: Worm strike circles + eruption ===
      for (let w = 0; w < 4; w++) {
        const wx = this.x + (rng()-0.5)*300, wy = this.y + (rng()-0.5)*250;
        // Warning circle
        spawnExplosion(wx, wy, 14, '#c84', '#da0');
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const b = new Bullet(wx, wy, a, 1.8, '#c84', false, this.currentPhase > 0 ? 2 : 1);
          b.radius = 3; enemyBullets.push(b);
        }
      }
      const total = phase.bulletCount + bonusBullets;
      for (let i = 0; i < total; i++) {
        const a = this.turretAngle + (i - total/2) * 0.2;
        const b = new Bullet(bx, by, a, phase.bulletSpeed, '#c84', false, 2);
        b.radius = 3.2; enemyBullets.push(b);
      }
    } else if (phase.attack === 'gravity_well') {
      // === GRAVITY ANCHOR P1: Shockwave ring + heavy center burst ===
      const total = phase.bulletCount + bonusBullets;
      // Expanding ring
      const ringCount = this.currentPhase > 0 ? 14 : 10;
      for (let i = 0; i < ringCount; i++) {
        const a = this.phaseTimer * 0.08 + (i / ringCount) * Math.PI * 2;
        const b = new Bullet(this.x, this.y, a, 1.4 + this.currentPhase * 0.1, '#8cf', false, 1);
        b.radius = 3.2; enemyBullets.push(b);
      }
      // Heavy center burst toward player
      for (let i = 0; i < total; i++) {
        const a = this.turretAngle + (i - total/2) * 0.25;
        const b = new Bullet(bx, by, a, phase.bulletSpeed, '#adf', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = 3.5; enemyBullets.push(b);
      }
    } else if (phase.attack === 'anchor_judgment') {
      // === GRAVITY ANCHOR P2: Ring + homing anchor chains ===
      const total = phase.bulletCount + bonusBullets;
      // Ring burst
      for (let i = 0; i < total; i++) {
        const a = this.phaseTimer * 0.06 + (i / total) * Math.PI * 2;
        const b = new Bullet(this.x, this.y, a, phase.bulletSpeed - 0.15, '#8cf', false, 1);
        b.radius = 3; enemyBullets.push(b);
      }
      // Homing anchor projectiles
      const homingCount = this.currentPhase > 0 ? 5 : 3;
      for (let i = 0; i < homingCount; i++) {
        const a = this.turretAngle + (i - (homingCount-1)/2) * 0.35;
        const b = new Bullet(bx, by, a, 1.3 + rng()*0.5, '#adf', true, 2);
        b.radius = 3.8; b.homingStrength = 0.025;
        enemyBullets.push(b);
      }
    } else if (phase.attack === 'triple_strike') {
      // === HYDRA P1: 3 heads fire in 120° spread ===
      const total = phase.bulletCount + bonusBullets;
      for (let head = 0; head < 3; head++) {
        const headAngle = this.turretAngle + (head - 1) * Math.PI * 2 / 3;
        const hx = this.x + Math.cos(headAngle) * 14, hy = this.y + Math.sin(headAngle) * 14;
        for (let i = 0; i < Math.floor(total / 3); i++) {
          const a = headAngle + (i - Math.floor(total/6)) * 0.14;
          const b = new Bullet(hx, hy, a, phase.bulletSpeed + rng()*0.3, '#4e4', false, this.currentPhase > 0 ? 2 : 1);
          b.radius = 2.6; enemyBullets.push(b);
        }
      }
    } else if (phase.attack === 'hydra_frenzy') {
      // === HYDRA P2: 5 heads + poison spray ===
      const total = phase.bulletCount + bonusBullets;
      const heads = 5;
      for (let head = 0; head < heads; head++) {
        const headAngle = this.turretAngle + (head - (heads-1)/2) * 0.38;
        const hx = this.x + Math.cos(headAngle) * 14, hy = this.y + Math.sin(headAngle) * 14;
        for (let i = 0; i < Math.floor(total / heads); i++) {
          const a = headAngle + (i - Math.floor(total/heads/2)) * 0.1;
          const b = new Bullet(hx, hy, a, phase.bulletSpeed + rng()*0.4, '#3a3', false, 2);
          b.radius = 2.8; enemyBullets.push(b);
        }
      }
      // Poison cloud — slow lingering bullets
      for (let i = 0; i < 6; i++) {
        const a = rng() * Math.PI * 2;
        const spd = 0.6 + rng() * 0.8;
        const b = new Bullet(this.x + rng()*40-20, this.y + rng()*40-20, a, spd, '#060', false, 1);
        b.radius = 2.2; enemyBullets.push(b);
      }
    } else if (phase.attack === 'mirror_enhance') {
      // === MIRROR SHELL P2: Enhanced copy — faster + bigger ===
      const pt = player && player._tankDef ? player._tankDef.tankType : 'spread';
      const mirrorCfg = { spread:{c:3, a:0.12}, focus:{c:1, a:0}, wide:{c:5, a:0.15}, burst:{c:7, a:0.2}, sniper:{c:1, a:0}, homing:{c:2, a:0.08} };
      const cfg = mirrorCfg[pt] || mirrorCfg.spread;
      for (let i = 0; i < cfg.c + 2; i++) {
        const a = this.turretAngle + (i - (cfg.c+1)/2) * cfg.a;
        const b = new Bullet(bx, by, a, phase.bulletSpeed, '#bbb', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = 3.5; enemyBullets.push(b);
      }
      spawnExplosion(this.x, this.y, 10, '#fff', '#aaa');
    } else if (phase.attack === 'trap_frenzy') {
      // === TRAPPER P2: Dense minefield + homing mines ===
      this.deployMines(5 + this.currentPhase * 2, 200);
      // Homing mine — actually a slow bullet that acts like a mine
      for (let i = 0; i < 3; i++) {
        const a = this.phaseTimer * 0.04 + (i / 3) * Math.PI * 2;
        const b = new Bullet(this.x + Math.cos(a)*30, this.y + Math.sin(a)*30, a, 0.8, '#f80', false, 1);
        b.radius = 5; enemyBullets.push(b);
      }
      // Additional mine scatter
      this.deployMines(3, 150);
    } else if (phase.attack === 'blade_dance') {
      // === ASH BLADE P2: 360° spin + 2 energy rings ===
      const total = phase.bulletCount + bonusBullets;
      // Spin slash
      for (let i = 0; i < total; i++) {
        const a = (i / total) * Math.PI * 2 + this.phaseTimer * 0.08;
        const b = new Bullet(this.x, this.y, a, phase.bulletSpeed, '#f84', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = 3; enemyBullets.push(b);
      }
      // 2 expanding energy rings
      for (let ring = 0; ring < 2; ring++) {
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const dist = 15 + ring * 16 + this.phaseTimer * 0.5;
          const b = new Bullet(this.x + Math.cos(a) * dist, this.y + Math.sin(a) * dist, a + Math.PI/2, 1.8 + ring * 0.3, '#f80', false, 1);
          b.radius = 2.5; enemyBullets.push(b);
        }
      }
      spawnExplosion(this.x, this.y, 14, '#f80', '#ff0');
      triggerShake(6, 10);
    } else if (phase.attack === 'weave_frenzy') {
      // === WEAVER P2: Faster summon + tracking elites (capped lower) ===
      const count = 3 + Math.floor(rng() * 2);
      for (let i = 0; i < count; i++) {
        if (enemies.length < 22) {
          const idx = Math.floor(rng() * Math.min(6, eliteTypes.length));
          const etype = eliteTypes[idx];
          const sx = this.x + (rng() - 0.5) * 120, sy = this.y + (rng() - 0.5) * 100;
          const elite = new EliteEnemy(Math.max(40, Math.min(W-40, sx)), Math.max(40, Math.min(H-40, sy)), etype);
          elite.shootDelay = Math.max(30, elite.shootDelay * 0.6);
          enemies.push(elite);
          spawnExplosion(sx, sy, 8, '#fd0', '#ff0');
        }
      }
      // Vulnerable after minions cleared
      const hasMinions = enemies.some(e => e !== this && e.alive && e.isElite);
      if (!hasMinions) this.recoverVulnerable = true;
    } else if (phase.attack === 'teleport_flurry') {
      const safePoint = this.findTeleportPoint(this.currentPhase > 0 ? 150 : 120);
      if (safePoint) {
        spawnExplosion(this.x, this.y, 12, '#4ff', '#8ff');
        this.x = safePoint.x; this.y = safePoint.y;
      }
      // 360° shuriken ring at new position
      for (let i = 0; i < phase.bulletCount + bonusBullets; i++) {
        const a = (i / (phase.bulletCount + bonusBullets)) * Math.PI * 2;
        const b = new Bullet(this.x, this.y, a, phase.bulletSpeed * 0.8, '#4ff', false, this.currentPhase > 0 ? 2 : 1);
        b.radius = 2; enemyBullets.push(b);
      }
      spawnExplosion(this.x, this.y, 10, '#4ff', '#fff');
    }
    const fireSlow = getEnemyFireSlowProfile(this);
    this.applyFireSlow(fireSlow.duration, fireSlow.mul);
    sfxBossAttack(phase.attack, this.currentPhase);
  }
  emitPhaseBurst(isTransition) {
    const fireSlow = getEnemyFireSlowProfile(this);
    this.applyFireSlow(fireSlow.duration, fireSlow.mul);
    sfxBossAttack(phase.attack, this.currentPhase);
  }
  emitPhaseBurst(isTransition) {
    const count = isTransition ? 16 : (this.currentPhase > 0 ? 12 : 10);
    const speed = isTransition ? 2.45 : 2.05;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + this.phaseTimer * 0.05;
      const b = new Bullet(this.x, this.y, a, speed + (i % 2) * 0.45, this.bossDef.turret || '#ff9f4a', false, isTransition ? 2 : 1);
      b.radius = isTransition ? 3.6 : 2.8;
      enemyBullets.push(b);
    }
    const fireSlow = getEnemyFireSlowProfile(this);
    this.applyFireSlow(fireSlow.duration, fireSlow.mul);
    sfxBossAttack(isTransition ? 'phase_burst' : 'boss_burst', this.currentPhase);
  }
  drawTelegraph(ctx, phase, accent) {
    if (!phase || this.attackState !== 'telegraph') return;
    const duration = Math.max(1, this.attackStateDuration || 1);
    const progress = 1 - Math.max(0, Math.min(1, this.attackStateTimer / duration));
    const pulse = 0.45 + Math.sin(Date.now() / 65) * 0.18 + progress * 0.4;
    const alpha = Math.min(0.42, 0.12 + progress * 0.32);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 2 + progress * 2.6;
    ctx.strokeStyle = 'rgba(255,196,112,' + alpha + ')';
    ctx.fillStyle = 'rgba(255,80,56,' + (alpha * 0.22) + ')';
    ctx.shadowColor = accent;
    ctx.shadowBlur = 16 + progress * 18;

    const drawLineLane = (width, len) => {
      const a = this.telegraphAngle;
      const sx = this.x + Math.cos(a) * 18;
      const sy = this.y + Math.sin(a) * 18;
      const ex = sx + Math.cos(a) * len;
      const ey = sy + Math.sin(a) * len;
      const nx = -Math.sin(a) * width;
      const ny = Math.cos(a) * width;
      ctx.beginPath();
      ctx.moveTo(sx + nx, sy + ny);
      ctx.lineTo(ex + nx, ey + ny);
      ctx.lineTo(ex - nx, ey - ny);
      ctx.lineTo(sx - nx, sy - ny);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    if (phase.attack === 'turret_salvo' || phase.attack === 'lightning_chain' || phase.attack === 'enrage' || phase.attack === 'gravity_wave' || phase.attack === 'laser_snipe') {
      // Laser snipe: bright warning line along telegraph angle
      if (phase.attack === 'laser_snipe') {
        ctx.strokeStyle = 'rgba(255,80,40,' + (0.3 + progress * 0.4) + ')';
        ctx.lineWidth = 2.5;
        const lx = this.x + Math.cos(this.telegraphAngle) * 30;
        const ly = this.y + Math.sin(this.telegraphAngle) * 30;
        ctx.beginPath(); ctx.moveTo(lx, ly);
        ctx.lineTo(lx + Math.cos(this.telegraphAngle) * W, ly + Math.sin(this.telegraphAngle) * H);
        ctx.stroke();
        // Laser dot at end
        ctx.fillStyle = 'rgba(255,40,20,' + (0.5 + progress * 0.3) + ')';
        ctx.beginPath(); ctx.arc(lx + Math.cos(this.telegraphAngle) * (200 + progress * 100), ly + Math.sin(this.telegraphAngle) * (200 + progress * 100), 6 + progress * 2, 0, Math.PI*2); ctx.fill();
      }
      drawLineLane(18 + progress * 8, Math.max(W, H) * 0.8);
    } else if (phase.attack === 'clone_barrage' || phase.attack === 'thunder_storm') {
      const radius = phase.attack === 'thunder_storm' ? 110 + progress * 36 : 88 + progress * 28;
      ctx.beginPath();
      ctx.arc(this.telegraphX, this.telegraphY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2 + progress * Math.PI;
        ctx.beginPath();
        ctx.moveTo(this.telegraphX + Math.cos(a) * 24, this.telegraphY + Math.sin(a) * 24);
        ctx.lineTo(this.telegraphX + Math.cos(a) * radius, this.telegraphY + Math.sin(a) * radius);
        ctx.stroke();
      }
    } else if (phase.attack === 'mine_storm' || phase.attack === 'black_hole' || phase.attack === 'spiral') {
      const radius = phase.attack === 'black_hole' ? 132 + progress * 54 : 92 + progress * 44;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius * 0.62, -Math.PI * pulse, Math.PI * (0.35 + pulse));
      ctx.stroke();
    } else if (phase.attack === 'teleport') {
      const radius = 72 + progress * 32;
      ctx.beginPath();
      ctx.arc(this.telegraphX, this.telegraphY, radius, 0, Math.PI * 2);
      ctx.stroke();
      drawLineLane(12 + progress * 6, 260);
    }

    ctx.fillStyle = 'rgba(246,229,170,' + Math.min(0.85, 0.35 + progress * 0.5) + ')';
    ctx.font = 'bold 11px "Courier New",monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 10;
    ctx.fillText(this.attackCue || 'BOSS ART', this.telegraphX || this.x, Math.max(28, (this.telegraphY || this.y) - 38));
    ctx.restore();
  }
  teleportToSafePoint(minPlayerDist) {
    const safe = this.pendingTeleport || this.findTeleportPoint(minPlayerDist);
    spawnExplosion(this.x, this.y, 18, '#88f', '#fff');
    this.x = safe.x;
    this.y = safe.y;
    if (player) {
      this.telegraphAngle = Math.atan2(player.y - this.y, player.x - this.x);
      this.turretAngle = this.telegraphAngle;
    }
    this.pendingTeleport = null;
    spawnExplosion(this.x, this.y, 22, '#dfe8ff', this.bossDef.turret || '#88f');
    triggerShake(6, 8);
    sfxBossAttack('teleport', this.currentPhase);
  }
  deployMines(count, spread) {
    let placed = 0;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rng() * 0.4;
      const radius = 65 + rng() * (spread || 180);
      const mx = Math.max(36, Math.min(W - 36, this.x + Math.cos(angle) * radius));
      const my = Math.max(36, Math.min(H - 36, this.y + Math.sin(angle) * radius));
      if (!tankCollidesObstacle(mx, my, 18, 18)) {
        mines.push({ x: mx, y: my, life: 820, armed: true });
        placed++;
      }
    }
    if (placed > 0) sfxBossAttack('mine_storm', this.currentPhase);
  }
  spawnStormLances(count) {
    for (let i = 0; i < count; i++) {
      const angle = this.turretAngle + (i - (count - 1) / 2) * 0.28;
      const b = new Bullet(this.x, this.y, angle, 4.1 + i * 0.15, '#8fffff', false, 1);
      b.railgun = true;
      b.radius = 2.2;
      enemyBullets.push(b);
    }
    const fireSlow = getEnemyFireSlowProfile(this);
    this.applyFireSlow(fireSlow.duration, fireSlow.mul);
    sfxBossAttack('lightning_chain', this.currentPhase);
  }
  spawnBossEscort() {
    if (enemies.length >= getWaveConcurrentEnemyCap()) return;
    const activeEscorts = enemies.filter(e => e.alive && e !== this && e.isElite && e.bossEscort).length;
    if (activeEscorts >= 1) return;
    let escortDef = eliteTypes[0];
    if (this.bossDef.name === '巨兽坦克') escortDef = eliteTypes[0];
    else if (this.bossDef.name === '幻影坦克') escortDef = eliteTypes[2];
    else if (this.bossDef.name === '要塞坦克') escortDef = eliteTypes[9];
    else if (this.bossDef.name === '虚空坦克') escortDef = eliteTypes[6];
    else if (this.bossDef.name === '风暴坦克') escortDef = eliteTypes[8];
    const spawn = findSafeTankSpawn({
      w: 36,
      h: 36,
      minEnemyDist: 50,
      minPlayerDist: 130,
      preferred: [
        { x: this.x + 90, y: this.y + 70 },
        { x: this.x - 90, y: this.y + 70 },
        { x: this.x + 70, y: this.y - 80 },
        { x: this.x - 70, y: this.y - 80 },
      ].map(p => ({
        x: Math.max(36, Math.min(W - 36, p.x)),
        y: Math.max(36, Math.min(H - 36, p.y)),
      })),
    });
    const escort = new EliteEnemy(spawn.x, spawn.y, escortDef);
    escort.bossEscort = true;
    escort.maxHp = Math.max(2, Math.ceil(escort.maxHp * 0.72));
    escort.hp = Math.min(escort.hp, escort.maxHp);
    enemies.push(escort);
    waveEnemiesRemaining++;
    waveEnemiesTotal++;
    spawnExplosion(spawn.x, spawn.y, 12, escortDef.turret, '#fff');
    sfxEliteAbility('summoner');
  }
  draw(ctx) {
    const t = Date.now() / 300;
    const bpulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
    const hpRatio = this.hp / this.maxHp;
    const phaseRatio = this.currentPhase > 0 ? 1 : 0;
    const accent = this.bossDef.turret || '#ffd36f';
    const p = this.bossDef.phases[Math.max(0,this.currentPhase)];
    this.drawTelegraph(ctx, p, accent);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.shadowColor = accent;
    ctx.shadowBlur = 15 + bpulse * 8 + phaseRatio * 10;

    if (this.currentPhase > 0) {
      ctx.strokeStyle = 'rgba(255,125,70,0.22)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, this.auraRadius, -Math.PI * 0.2 + t * 0.3, Math.PI * 1.25 + t * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, this.auraRadius + 10, Math.PI * 0.15 - t * 0.25, Math.PI * 1.1 - t * 0.25);
      ctx.stroke();
    }

    // === BOSS TYPE-SPECIFIC FORTRESS VISUAL ===
    const bname = this.bossDef.name;
    const brt = Date.now() / 250;
    const maxPh = (this.bossDef && this.bossDef.phases) ? this.bossDef.phases.length : 1;
    const eyePulse = Math.sin(brt) * 0.25 + 0.75;
    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(0, 36, 38, 10, 0, 0, Math.PI * 2); ctx.fill();
    // Outer threat aura
    ctx.strokeStyle = accent; ctx.globalAlpha = 0.15 + Math.sin(brt) * 0.06; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    // === TYPE-SPECIFIC BODY ===
    if (bname === '巨兽坦克') {
      // === BEHEMOTH — triple-cannon siege breaker ===
      // Heavy chassis
      const bChGrad = ctx.createLinearGradient(-36, -28, 36, -28);
      bChGrad.addColorStop(0,'#1a0606');bChGrad.addColorStop(0.3,'#3a1010');bChGrad.addColorStop(0.5,'#4a1818');bChGrad.addColorStop(0.7,'#3a1010');bChGrad.addColorStop(1,'#1a0606');
      ctx.fillStyle=bChGrad;
      ctx.beginPath();ctx.moveTo(30,-28);ctx.lineTo(-28,-16);ctx.lineTo(-38,-2);ctx.lineTo(-38,14);ctx.lineTo(-28,26);ctx.lineTo(30,30);ctx.lineTo(40,12);ctx.lineTo(40,-14);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#ff4040';ctx.lineWidth=5;ctx.stroke();
      // Vertical armor slabs
      ctx.fillStyle='#501818';
      for(let a=-22;a<32;a+=9){ctx.fillRect(a,-22+Math.abs(a)*0.1,8,42-Math.abs(a)*0.4);}
      // Forward siege ram
      ctx.fillStyle='#601010';ctx.beginPath();ctx.moveTo(34,-12);ctx.lineTo(48,-6);ctx.lineTo(48,6);ctx.lineTo(34,12);ctx.closePath();ctx.fill();
      ctx.strokeStyle=accent;ctx.lineWidth=3.5;ctx.stroke();
      // Ram impact marks
      ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=0.8;
      for(let r=0;r<3;r++){ctx.beginPath();ctx.moveTo(38+r*3,-10+r);ctx.lineTo(48,-6);ctx.lineTo(38+r*3,10-r);ctx.stroke();}
      // Angry red core
      drawArmorPanel(ctx,-10,-8,20,16,'rgba(0,0,0,0.92)',accent,4);
      ctx.fillStyle=accent;ctx.globalAlpha=eyePulse*0.9;ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-2,-2,2.5,0,Math.PI*2);ctx.fill();
      // TRIPLE CANNONS
      ctx.save();ctx.rotate(this.turretAngle);
      // Center main cannon — huge
      drawWeaponBarrel(ctx,6,-7,24,14,'#400','#ff4040','#fff');
      // Left secondary — smaller, angled out
      ctx.save();ctx.translate(5,0);ctx.rotate(-0.22);
      drawWeaponBarrel(ctx,2,-3.5,16,7,'#300','#cc3030','#ffe0e0');
      ctx.restore();
      // Right secondary — smaller, angled out
      ctx.save();ctx.translate(5,0);ctx.rotate(0.22);
      drawWeaponBarrel(ctx,2,-3.5,16,7,'#300','#cc3030','#ffe0e0');
      ctx.restore();
      ctx.restore();
    } else if (bname === '幻影坦克') {
      // === PHANTOM — multi-port ghost blade ===
      // Afterimage ghosts
      for(let g=1;g<=3;g++){ctx.strokeStyle='rgba(100,140,255,'+(0.12-g*0.03)+')';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(26-g*6,0);ctx.lineTo(10,-14);ctx.lineTo(-18,-6);ctx.lineTo(-24+g*3,0);ctx.lineTo(-18,6);ctx.lineTo(10,14);ctx.closePath();ctx.stroke();}
      // Sleek angular hull
      ctx.fillStyle='#0a1030';ctx.beginPath();ctx.moveTo(28,0);ctx.lineTo(10,-16);ctx.lineTo(-20,-8);ctx.lineTo(-26,0);ctx.lineTo(-20,8);ctx.lineTo(10,16);ctx.closePath();ctx.fill();
      ctx.strokeStyle=accent;ctx.lineWidth=2.5;ctx.stroke();
      // Internal conduits
      for(let s=0;s<4;s++){ctx.strokeStyle='rgba(136,170,255,'+(0.2+s*0.06)+')';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-18+s*5,-8);ctx.lineTo(4+s*4,0);ctx.lineTo(-18+s*5,8);ctx.stroke();}
      drawTechCore(ctx,4,0,6,'#ddeeff',accent);
      // Multiple small emission ports instead of single barrel
      for(let p=0;p<4;p++){
        const pa=(p-1.5)*0.25;const px=6+Math.cos(pa)*10;const py=Math.sin(pa)*10;
        ctx.fillStyle=accent;ctx.globalAlpha=0.5+Math.sin(brt*2+p)*0.3;
        ctx.beginPath();ctx.arc(px,py,2.5,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.lineWidth=0.6;ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.stroke();
      }
      ctx.globalAlpha=1;
      // Telegraph ground markers for teleport/clone
      if(this.telegraphTimer>0&&this.attackState==='telegraph'){
        ctx.fillStyle='rgba(100,160,255,0.2)';
        ctx.beginPath();ctx.arc(this.telegraphX-this.x,this.telegraphY-this.y,16+Math.sin(brt*4)*3,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='rgba(136,180,255,0.5)';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.arc(this.telegraphX-this.x,this.telegraphY-this.y,16+Math.sin(brt*4)*3,0,Math.PI*2);ctx.stroke();
      }
    } else if (bname === '要塞坦克') {
      // === FORTRESS — bunker + shield satellites ===
      ctx.fillStyle='#1a1008';ctx.fillRect(-34,-20,68,40);ctx.strokeStyle='#640';ctx.lineWidth=4;ctx.strokeRect(-34,-20,68,40);
      ctx.fillStyle='#3a2810';ctx.fillRect(-30,-16,60,32);
      // 5 turrets
      for(let t=-24;t<=24;t+=16){ctx.fillStyle=this.turretColor;ctx.beginPath();ctx.arc(t,4,12,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#640';ctx.lineWidth=2.5;ctx.stroke();ctx.fillStyle=accent;ctx.beginPath();ctx.arc(t,4,4.5,0,Math.PI*2);ctx.fill();}
      // Armor slats
      ctx.fillStyle='rgba(0,0,0,0.5)';for(let d=0;d<8;d++){ctx.fillRect(-32+d*9,-14,5,28);}
      drawTechCore(ctx,0,-4,7,'#ffe8cc',accent);
      ctx.save();ctx.rotate(this.turretAngle);drawWeaponBarrel(ctx,5,-4,24,8,'#2a1808',accent,'#fff8e0');ctx.restore();
      // Floating shield satellites (2 orbiting)
      const satCount = 2 + this.currentPhase;
      for(let s=0;s<satCount;s++){
        const sa=brt*0.8+s*Math.PI*2/satCount;
        const sr=32+s*4;const sx=Math.cos(sa)*sr, sy=Math.sin(sa)*sr;
        // Hex shield plate
        ctx.save();ctx.translate(sx,sy);ctx.rotate(sa+Math.PI*0.5);
        const satAlpha=0.5+Math.sin(brt*2+s)*0.2;
        ctx.strokeStyle=accent;ctx.globalAlpha=satAlpha;ctx.lineWidth=2;
        traceHexCell(ctx,7,3);ctx.stroke();
        ctx.fillStyle='rgba(160,140,80,'+(satAlpha*0.3)+')';
        traceHexCell(ctx,6,3);ctx.fill();
        // Connector line to fortress
        ctx.strokeStyle='rgba(200,180,100,0.15)';ctx.lineWidth=0.8;ctx.globalAlpha=0.3;
        ctx.beginPath();ctx.moveTo(-sx,-sy);ctx.lineTo(0,0);ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha=1;
    } else if (bname === '虚空坦克') {
      // === VOID — gravity well (P1: barrel, P2: core burst) ===
      for(let r=3;r>=0;r--){ctx.strokeStyle='rgba(160,100,240,'+(0.08+r*0.08)+')';ctx.lineWidth=1.2+r*0.6;ctx.beginPath();ctx.arc(0,0,22+r*7,brt*0.6+r,brt*0.6+r+Math.PI*1.4);ctx.stroke();}
      ctx.fillStyle='#0a0418';ctx.beginPath();ctx.moveTo(20,-24);ctx.lineTo(-24,-10);ctx.lineTo(-30,0);ctx.lineTo(-24,10);ctx.lineTo(20,24);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#6040a0';ctx.lineWidth=2.5;ctx.stroke();
      // Prominent singularity core (for P2 360° burst)
      const vGrad=ctx.createRadialGradient(0,0,2,0,0,20);vGrad.addColorStop(0,'#fff');vGrad.addColorStop(0.15,accent);vGrad.addColorStop(0.4,'#1a0438');vGrad.addColorStop(1,'#000');
      ctx.fillStyle=vGrad;ctx.beginPath();ctx.arc(0,0,20,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fill();
      // Event horizon particles
      for(let d=0;d<5;d++){const da=d*Math.PI*2/5+brt*0.3;ctx.fillStyle=accent;ctx.globalAlpha=0.4;ctx.beginPath();ctx.arc(Math.cos(da)*26,Math.sin(da)*8,2,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
      // Small directional barrel (P1 only)
      ctx.save();ctx.rotate(this.turretAngle);
      ctx.fillStyle='#1a0438';ctx.strokeStyle=accent;ctx.lineWidth=1.5;
      ctx.fillRect(4,-2,14,4);ctx.strokeRect(4,-2,14,4);
      ctx.fillStyle='#fff';ctx.fillRect(16,-1.5,3,3);
      ctx.restore();
    } else if (bname === '风暴坦克') {
      // === STORM — tesla coils, no barrel ===
      ctx.fillStyle='#0a1028';ctx.beginPath();ctx.moveTo(22,-24);ctx.lineTo(-22,-12);ctx.lineTo(-28,0);ctx.lineTo(-22,12);ctx.lineTo(22,24);ctx.closePath();ctx.fill();
      ctx.strokeStyle=accent;ctx.lineWidth=2.5;ctx.stroke();
      // Twin Tesla coils — primary emission points
      for(let side of[-1,1]){
        ctx.fillStyle='#101840';ctx.strokeStyle=accent;ctx.lineWidth=1.5;
        ctx.fillRect(side*20-5,-28,10,16);ctx.strokeRect(side*20-5,-28,10,16);
        // Coil winding lines
        ctx.strokeStyle='rgba(200,240,255,0.3)';ctx.lineWidth=0.5;
        for(let w=0;w<3;w++){ctx.beginPath();ctx.moveTo(side*20-4,-26+w*5);ctx.lineTo(side*20+4,-26+w*5);ctx.stroke();}
        // Glowing tip
        ctx.fillStyle=accent;ctx.globalAlpha=0.6+Math.sin(brt*3+side)*0.35;
        ctx.beginPath();ctx.arc(side*20,-30,4.5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(side*20,-30,1.8,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=1;
      }
      // Arc conduits
      for(let a=0;a<4;a++){ctx.strokeStyle='rgba(80,200,255,'+(0.2+a*0.06)+')';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-18+a*6,-10);ctx.lineTo(-10+a*5,0);ctx.lineTo(-18+a*6,10);ctx.stroke();}
      drawTechCore(ctx,0,0,6.5,'#d0f0ff',accent);
      // Ball lightning
      for(let s=0;s<5;s++){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc((Math.sin(brt*6+s)*18),(Math.cos(brt*5+s)*14),1.8,0,Math.PI*2);ctx.fill();}
      // Arc between coils (firing indicator)
      if(this.attackState==='firing'){
        ctx.strokeStyle='rgba(100,220,255,'+(0.4+Math.sin(brt*5)*0.3)+')';ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(-18,-28);ctx.lineTo(-8,-20);ctx.lineTo(8,-20);ctx.lineTo(18,-28);ctx.stroke();
      }
    } else if (bname === '观星者坦克') {
      // === OBSERVER — radar platform ===
      ctx.fillStyle='#0a1a28';ctx.beginPath();ctx.moveTo(24,-18);ctx.lineTo(-24,-8);ctx.lineTo(-28,0);ctx.lineTo(-24,8);ctx.lineTo(24,18);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#4ce';ctx.lineWidth=2.5;ctx.stroke();
      // Large rotating radar dish (replaces barrel)
      const dishAngle=brt*0.4;
      ctx.save();ctx.translate(-4,-8);ctx.rotate(dishAngle);
      ctx.strokeStyle='#4ce';ctx.lineWidth=2;ctx.globalAlpha=0.5;
      ctx.beginPath();ctx.arc(0,0,18,-Math.PI*0.55,Math.PI*0.55);ctx.stroke();
      ctx.strokeStyle='rgba(80,200,240,0.3)';ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(0,0,22,-Math.PI*0.45,Math.PI*0.45);ctx.stroke();
      ctx.beginPath();ctx.arc(0,0,14,-Math.PI*0.6,Math.PI*0.6);ctx.stroke();
      // Feed horn
      ctx.fillStyle='#4ce';ctx.globalAlpha=0.7;ctx.beginPath();ctx.arc(0,-18,2.5,0,Math.PI*2);ctx.fill();
      ctx.restore();ctx.globalAlpha=1;
      // Antenna array
      for(let a=0;a<3;a++){ctx.strokeStyle='rgba(80,200,240,0.4)';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(-8+a*8,-16);ctx.lineTo(-8+a*8,-22);ctx.stroke();ctx.fillStyle='#4ce';ctx.beginPath();ctx.arc(-8+a*8,-22,1.5,0,Math.PI*2);ctx.fill();}
      drawTechCore(ctx,6,2,5.5,'#e0f8ff','#4ce');
      // Laser designator (thin line)
      ctx.strokeStyle='rgba(80,200,240,0.3)';ctx.lineWidth=0.5;
      ctx.beginPath();ctx.moveTo(6,2);ctx.lineTo(30,0);ctx.stroke();
    } else if (bname === '废铁巨像') {
      // === SCRAP COLOSSUS — asymmetric junk mech ===
      ctx.fillStyle='#1a0e08';ctx.beginPath();ctx.moveTo(24,-24);ctx.lineTo(-28,-14);ctx.lineTo(-32,4);ctx.lineTo(-24,18);ctx.lineTo(22,26);ctx.lineTo(32,6);ctx.lineTo(32,-14);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#c84';ctx.lineWidth=3;ctx.stroke();
      // Patchwork armor plates
      ctx.fillStyle='#3a2010';ctx.fillRect(-16,-16,10,28);ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=0.5;ctx.strokeRect(-16,-16,10,28);
      ctx.fillStyle='#4a2818';ctx.fillRect(4,-10,12,20);ctx.strokeRect(4,-10,12,20);
      ctx.fillStyle='#2a1810';ctx.fillRect(-24,-10,7,22);ctx.strokeRect(-24,-10,7,22);
      // Weld lines
      ctx.strokeStyle='rgba(200,140,80,0.2)';ctx.lineWidth=0.8;
      for(let w=0;w<4;w++){ctx.beginPath();ctx.moveTo(-20+w*10,-18);ctx.lineTo(-18+w*10,18);ctx.stroke();}
      // Left: wrecking ball on chain
      const ballAngle=Math.sin(brt*0.7)*0.4;
      ctx.save();ctx.translate(-24,6);ctx.rotate(ballAngle);
      ctx.strokeStyle='#886';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-18,14);ctx.stroke();
      ctx.fillStyle='#544';ctx.strokeStyle='#c84';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(-18,14,8,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.restore();
      // Right: cobbled barrel
      ctx.fillStyle='#3a2010';ctx.strokeStyle='#c84';ctx.lineWidth=1.5;
      ctx.fillRect(14,-4,16,10);ctx.strokeRect(14,-4,16,10);
      ctx.fillStyle='#fff';ctx.fillRect(28,-3,4,8);
      // Rusty core
      drawArmorPanel(ctx,-6,-6,12,12,'rgba(20,8,4,0.9)','#c84',3);
      ctx.fillStyle='#c84';ctx.globalAlpha=eyePulse*0.7;ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    } else if (bname === '雷霆执政官') {
      // === THUNDER ARCHON — floating angel of storms ===
      // Hovering — elevated above ground
      ctx.fillStyle='rgba(255,220,120,0.15)';ctx.beginPath();ctx.ellipse(0,20,24,6,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.4)';ctx.beginPath();ctx.ellipse(0,18,12,3,0,0,Math.PI*2);ctx.fill();
      // Sleek divine body
      ctx.fillStyle='#1a1830';ctx.beginPath();ctx.moveTo(10,-16);ctx.lineTo(-14,-8);ctx.lineTo(-16,0);ctx.lineTo(-14,8);ctx.lineTo(10,16);ctx.lineTo(18,0);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#48c';ctx.lineWidth=2.5;ctx.stroke();
      // Gold accent trim
      ctx.strokeStyle='rgba(255,220,100,0.3)';ctx.lineWidth=0.6;
      ctx.beginPath();ctx.moveTo(10,-16);ctx.lineTo(10,16);ctx.stroke();
      // Lightning wings (symmetrical)
      for(let side of[-1,1]){
        ctx.strokeStyle='#48c';ctx.lineWidth=1.8;ctx.globalAlpha=0.6+Math.sin(brt*2)*0.2;
        ctx.beginPath();
        ctx.moveTo(side*8,-10);ctx.lineTo(side*22,-28);ctx.lineTo(side*14,-14);
        ctx.lineTo(side*28,-18);ctx.lineTo(side*16,-4);
        ctx.lineTo(side*26,0);ctx.lineTo(side*14,4);
        ctx.lineTo(side*24,12);ctx.lineTo(side*12,10);
        ctx.stroke();
        // Wing nodes
        for(let n=0;n<5;n++){
          const nx=side*(8+n*4), ny=-24+n*8;
          ctx.fillStyle='#48c';ctx.beginPath();ctx.arc(nx,ny,1.5,0,Math.PI*2);ctx.fill();
        }
        ctx.globalAlpha=1;
      }
      // Halo
      ctx.strokeStyle='#ffd27a';ctx.lineWidth=2;ctx.globalAlpha=0.5+Math.sin(brt)*0.2;
      ctx.beginPath();ctx.arc(0,-18,14,-Math.PI*0.7,Math.PI*0.7);ctx.stroke();
      ctx.fillStyle='#ffd27a';ctx.globalAlpha=0.3;ctx.beginPath();ctx.arc(0,-18,3,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
      drawTechCore(ctx,0,0,5,'#ffffee','#ffd27a');
      // No barrel — emission from wings/halo
    } else if (bname === '沙暴') {
      // === SANDSTORM — dust-wrapped chassis + worm tentacles ===
      // Dust cloud aura
      for (let d = 0; d < 12; d++) {
        const da = brt * 0.3 + d * Math.PI * 2 / 12;
        const dr = 18 + Math.sin(brt + d) * 4;
        ctx.fillStyle = 'rgba(180,140,80,' + (0.08 + d * 0.01) + ')';
        ctx.beginPath(); ctx.arc(Math.cos(da)*dr, Math.sin(da)*dr, 3 + rng()*2, 0, Math.PI*2); ctx.fill();
      }
      // Core chassis — half-hidden
      ctx.fillStyle = '#4a3020'; ctx.strokeStyle = '#c84'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(0, 0, 18, 13, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      // Sand worm tentacles on sides
      for (let side of [-1, 1]) {
        ctx.strokeStyle = '#c84'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(side * 14, 0);
        ctx.quadraticCurveTo(side * 22 + Math.sin(brt)*5, -8, side * 20, 14); ctx.stroke();
        ctx.fillStyle = '#a60'; ctx.beginPath(); ctx.arc(side * 20, 14, 3, 0, Math.PI*2); ctx.fill();
      }
      // Vent spewing sand
      ctx.fillStyle = 'rgba(180,120,60,0.3)';
      for (let v = 0; v < 5; v++) {
        ctx.beginPath(); ctx.arc(rng()*12 - 4, rng()*4 - 16, 1 + rng()*2, 0, Math.PI*2); ctx.fill();
      }
      drawTechCore(ctx, 0, 0, 4, '#ffe0c0', '#c84');
      ctx.save(); ctx.rotate(this.turretAngle);
      drawWeaponBarrel(ctx, 3, -2.5, 10, 5, '#4a3020', '#c84', '#fff');
      ctx.restore();
    } else if (bname === '重力锚') {
      // === GRAVITY ANCHOR — heavy anchor hull + gravity field rings ===
      // Gravity distortion rings
      for (let r = 0; r < 3; r++) {
        const rr = 22 + r * 8 + Math.sin(brt * 2 + r) * 4;
        ctx.strokeStyle = 'rgba(120,180,255,' + (0.15 - r * 0.04) + ')';
        ctx.lineWidth = 1.2; ctx.setLineDash([3, 7]);
        ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
      }
      // Heavy anchor body — wide bottom, narrow top
      ctx.fillStyle = '#1a2a3a'; ctx.strokeStyle = '#8cf'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -18); ctx.lineTo(16, -4); ctx.lineTo(20, 10);
      ctx.lineTo(16, 18); ctx.lineTo(-16, 18); ctx.lineTo(-20, 10);
      ctx.lineTo(-16, -4); ctx.closePath(); ctx.fill(); ctx.stroke();
      // Anchor flukes at bottom
      for (let s of [-1, 1]) {
        ctx.fillStyle = '#2a3a4a';
        ctx.beginPath(); ctx.moveTo(s * 12, 16);
        ctx.lineTo(s * 28, 12); ctx.lineTo(s * 22, 22);
        ctx.lineTo(s * 8, 22); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#8cf'; ctx.lineWidth = 1.5; ctx.stroke();
      }
      // Gravity core
      const coreGlow = Math.sin(brt * 2.5) * 0.3 + 0.7;
      ctx.fillStyle = 'rgba(120,200,255,' + coreGlow + ')';
      ctx.shadowColor = '#8cf'; ctx.shadowBlur = 14 * coreGlow;
      ctx.beginPath(); ctx.arc(0, 2, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      drawTechCore(ctx, 0, 0, 4, '#d0e8ff', '#8cf');
      ctx.save(); ctx.rotate(this.turretAngle);
      drawWeaponBarrel(ctx, 3, -2.5, 11, 5, '#2a3a4a', '#8cf', '#fff');
      ctx.restore();
    } else if (bname === '多头蛇') {
      // === HYDRA — multi-head serpent body + venom glow ===
      const headCount = this.currentPhase > 0 ? 5 : 3;
      // Serpent body — long curved hull
      ctx.fillStyle = '#0a1a0a'; ctx.strokeStyle = '#4e4'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -10); ctx.lineTo(-14, -6);
      ctx.lineTo(-20, 2); ctx.lineTo(-16, 12);
      ctx.lineTo(0, 16); ctx.lineTo(16, 12);
      ctx.lineTo(20, 2); ctx.lineTo(14, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
      // Scales pattern
      ctx.strokeStyle = 'rgba(0,200,0,0.1)'; ctx.lineWidth = 0.5;
      for (let s = 0; s < 8; s++) {
        ctx.beginPath(); ctx.arc(-6 + s * 2, -4 + s * 2, 2.5 + s * 0.3, 0, Math.PI, false); ctx.stroke();
      }
      // Multiple heads
      for (let h = 0; h < headCount; h++) {
        const ha = (h - (headCount - 1) / 2) * 0.42;
        const hx = Math.cos(ha) * 14, hy = Math.sin(ha) * 10 - 12;
        ctx.save(); ctx.translate(hx, hy); ctx.rotate(ha);
        // Head shape
        ctx.fillStyle = '#0a2a0a'; ctx.strokeStyle = '#4e4'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.ellipse(0, 0, 6, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Eyes
        const eyeGlow = Math.sin(brt * 4 + h) * 0.3 + 0.6;
        ctx.fillStyle = 'rgba(0,255,0,' + eyeGlow + ')';
        ctx.shadowColor = '#0f0'; ctx.shadowBlur = 5 * eyeGlow;
        ctx.beginPath(); ctx.arc(3, -1.5, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        // Tongue/fang
        ctx.strokeStyle = '#0f0'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(5, 1); ctx.lineTo(8, 2); ctx.stroke();
        ctx.restore();
      }
      // Venom drip from body
      ctx.fillStyle = 'rgba(0,200,0,0.25)';
      for (let d = 0; d < 3; d++) {
        const dx = rng()*16 - 8, dy = 14 + rng()*4;
        ctx.beginPath(); ctx.arc(dx, dy, 1 + rng()*2, 0, Math.PI * 2); ctx.fill();
      }
      drawTechCore(ctx, 0, -2, 3.5, '#d0ffd0', '#4e4');
      ctx.save(); ctx.rotate(this.turretAngle);
      drawWeaponBarrel(ctx, 3, -2, 9, 4, '#0a1a0a', '#4e4', '#fff');
      ctx.restore();
    } else if (bname === '镜像体') {
      // === MIRROR SHELL — liquid metal, reflects player ===
      const playerColor = player ? (player._tankDef ? player._tankDef.color : '#d44') : '#d44';
      const mirrorGrad = ctx.createLinearGradient(-18, -12, 18, -12);
      mirrorGrad.addColorStop(0, playerColor); mirrorGrad.addColorStop(0.3, '#888');
      mirrorGrad.addColorStop(0.5, '#fff'); mirrorGrad.addColorStop(0.7, '#888');
      mirrorGrad.addColorStop(1, playerColor);
      ctx.fillStyle = mirrorGrad;
      ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(6, -14); ctx.lineTo(-14, -6);
      ctx.lineTo(-16, 0); ctx.lineTo(-14, 6); ctx.lineTo(6, 14); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#bbb'; ctx.lineWidth = 2.5; ctx.stroke();
      // Mirror surface highlights
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath(); ctx.arc(4, -4, 6, 0, Math.PI*2); ctx.fill();
      drawTechCore(ctx, 2, 0, 4.5, '#fff', '#ccc');
      ctx.save(); ctx.rotate(this.turretAngle);
      drawWeaponBarrel(ctx, 3, -2, 12, 4, '#555', '#bbb', '#fff');
      ctx.restore();
    } else if (bname === '陷阱师') {
      // === TRAPPER — hexagon carrier with mine payload ===
      ctx.fillStyle = '#3a2010'; ctx.strokeStyle = '#c84'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = Math.PI/6 + i * Math.PI/3;
        const px = Math.cos(a) * 22, py = Math.sin(a) * 16;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // Mine payload on back
      ctx.fillStyle = '#2a1808';
      for (let m = 0; m < 4; m++) {
        ctx.fillRect(-8 + m * 5, -18, 4, 8);
        ctx.fillStyle = '#f80'; ctx.beginPath(); ctx.arc(-6 + m * 5, -16, 1.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#2a1808';
      }
      // Deployment rails on rear
      ctx.strokeStyle = 'rgba(200,140,80,0.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-20, 10); ctx.lineTo(20, 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-16, 14); ctx.lineTo(16, 14); ctx.stroke();
      drawTechCore(ctx, 0, 0, 4, '#ffe0c0', '#c84');
      ctx.save(); ctx.rotate(this.turretAngle);
      drawWeaponBarrel(ctx, 3, -2, 8, 4, '#3a2010', '#c84', '#fff');
      ctx.restore();
    } else if (bname === '灰域剑圣') {
      // === ASH BLADE — asymmetrical mecha with energy katana ===
      ctx.fillStyle = '#200808';
      ctx.beginPath(); ctx.moveTo(12, -14); ctx.lineTo(-16, -8); ctx.lineTo(-18, 4);
      ctx.lineTo(-12, 14); ctx.lineTo(16, 12); ctx.lineTo(20, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = accent; ctx.lineWidth = 2.5; ctx.stroke();
      // Gold trim on armor
      ctx.strokeStyle = 'rgba(255,200,80,0.3)'; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(12, -14); ctx.lineTo(12, 12); ctx.stroke();
      // Energy blade on front
      const bladeAngle = this.turretAngle + 0.3;
      ctx.save(); ctx.translate(6, 0); ctx.rotate(bladeAngle);
      const bladeGlow = Math.sin(brt * 3) * 0.2 + 0.7;
      ctx.strokeStyle = 'rgba(255,120,40,' + bladeGlow + ')';
      ctx.lineWidth = 2; ctx.shadowColor = '#f80'; ctx.shadowBlur = 8 * bladeGlow;
      ctx.beginPath(); ctx.moveTo(8, -3); ctx.lineTo(30, 0); ctx.lineTo(8, 3); ctx.closePath(); ctx.stroke();
      ctx.shadowColor = '#fff'; ctx.shadowBlur = 4;
      ctx.strokeStyle = 'rgba(255,255,255,' + (bladeGlow * 0.5) + ')';
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(28, 0); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
      // Scar marks on hull
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 0.5;
      for (let sc = 0; sc < 3; sc++) {
        ctx.beginPath(); ctx.moveTo(-10 + sc*5, -10); ctx.lineTo(-6 + sc*4, 8); ctx.stroke();
      }
      drawTechCore(ctx, -2, 0, 4.5, '#ffe0d0', accent);
    } else if (bname === '圣龛织者') {
      // === SANCTUM WEAVER — wide loom platform + golden threads ===
      ctx.fillStyle = '#3a2810'; ctx.strokeStyle = '#c90'; ctx.lineWidth = 3;
      ctx.fillRect(-30, -14, 60, 28); ctx.strokeRect(-30, -14, 60, 28);
      // 3 spinning spindles on top
      for (let s = 0; s < 3; s++) {
        const sx = -10 + s * 10;
        ctx.save(); ctx.translate(sx, -16);
        ctx.rotate(brt * 1.5 + s);
        ctx.fillStyle = '#fd0'; ctx.strokeStyle = '#c90'; ctx.lineWidth = 1.2;
        ctx.fillRect(-3, -8, 6, 16); ctx.strokeRect(-3, -8, 6, 16);
        ctx.fillStyle = '#ff0'; ctx.beginPath(); ctx.arc(0, -8, 2, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
      // Golden threads hanging down
      for (let t = 0; t < 8; t++) {
        const tx = -22 + t * 6;
        ctx.strokeStyle = 'rgba(255,220,0,' + (0.15 + Math.sin(brt+t)*0.08) + ')';
        ctx.lineWidth = 0.6; ctx.setLineDash([2, 6]);
        ctx.beginPath(); ctx.moveTo(tx, -14); ctx.lineTo(tx + Math.sin(brt+t)*3, 18); ctx.stroke();
        ctx.setLineDash([]);
      }
      drawTechCore(ctx, 0, 2, 6, '#fff8d0', '#fd0');
      // Small barrel — rarely used
      ctx.save(); ctx.rotate(this.turretAngle);
      drawWeaponBarrel(ctx, 3, -2, 8, 4, '#5a4020', '#c90', '#fff8e0');
      ctx.restore();
    } else if (bname === '迅影') {
      // === SWIFT SHADOW — slim diamond + energy shuriken wings ===
      const swiftBody = ctx.createLinearGradient(-16, -10, 16, -10);
      swiftBody.addColorStop(0, '#081828'); swiftBody.addColorStop(0.5, '#0c2a3a'); swiftBody.addColorStop(1, '#081828');
      ctx.fillStyle = swiftBody;
      ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(4, -12); ctx.lineTo(-14, -4);
      ctx.lineTo(-16, 0); ctx.lineTo(-14, 4); ctx.lineTo(4, 12); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#4ff'; ctx.lineWidth = 2; ctx.stroke();
      // Energy shurikens on sides
      for (let s of [-1, 1]) {
        for (let d = 0; d < 3; d++) {
          ctx.save(); ctx.translate(s * 10 + d * 3, -10 + d * 8);
          ctx.rotate(brt * 3 + d + s);
          ctx.strokeStyle = 'rgba(80,255,255,' + (0.4 + d * 0.15) + ')'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(3, 0); ctx.lineTo(0, 5); ctx.lineTo(-2, 0); ctx.closePath(); ctx.stroke();
          ctx.restore();
        }
      }
      // Afterimage trail
      ctx.strokeStyle = 'rgba(80,255,255,0.12)'; ctx.lineWidth = 1;
      for (let t = 1; t <= 2; t++) {
        ctx.beginPath(); ctx.moveTo(24 - t*5, 0); ctx.lineTo(4, -12); ctx.lineTo(-14, -4); ctx.lineTo(-16 + t*3, 0); ctx.closePath(); ctx.stroke();
      }
      drawTechCore(ctx, 2, 0, 4, '#e0ffff', '#4ff');
      ctx.save(); ctx.rotate(this.turretAngle);
      drawWeaponBarrel(ctx, 3, -1.5, 10, 3, '#081828', '#4ff', '#e0ffff');
      ctx.restore();
    } else if (bname === '双子坦克') {
      const isDark = !!this.geminiMaster;
      const gemColor = isDark ? '#624' : '#426';
      const gemAccent = isDark ? '#d8f' : '#a4f';
      ctx.fillStyle = gemColor;
      ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(6, -14); ctx.lineTo(-14, -6);
      ctx.lineTo(-18, 0); ctx.lineTo(-14, 6); ctx.lineTo(6, 14); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = gemAccent; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,' + (isDark ? '0.08' : '0.2') + ')';
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 12); ctx.stroke();
      drawTechCore(ctx, 1, 0, 4.5, isDark ? '#f0e0ff' : '#e0e0ff', gemAccent);
      if (this.geminiTwin && this.geminiTwin.alive) {
        ctx.strokeStyle = 'rgba(180,140,255,0.12)'; ctx.lineWidth = 0.8; ctx.setLineDash([3, 6]);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(this.geminiTwin.x - this.x, this.geminiTwin.y - this.y); ctx.stroke();
        ctx.setLineDash([]);
      }
      if (this.currentPhase > 0) {
        ctx.strokeStyle = 'rgba(200,160,255,0.25)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2); ctx.stroke();
      }
      ctx.save(); ctx.rotate(this.turretAngle);
      drawWeaponBarrel(ctx, 3, -2, 12, 4, gemColor, gemAccent, '#fff');
      ctx.restore();
    } else if (bname === '缝合巨兽') {
      // === PATCHWORK BEHEMOTH — asymmetrical junk mech ===
      // Left side: scavenged scout tracks
      drawTankTracks(ctx, -28, 18, -16, 28, 6, '#1a0e08', '#5a2818');
      // Right side: brute heavy treads
      drawTankTracks(ctx, 14, 20, 24, 32, 8, '#150825', '#3a1e5a');
      // Main body — welded plates with different colors
      ctx.fillStyle = '#3a1a08';
      ctx.beginPath(); ctx.moveTo(22, -22); ctx.lineTo(-28, -14); ctx.lineTo(-32, 4); ctx.lineTo(-22, 18); ctx.lineTo(24, 24); ctx.lineTo(30, 6); ctx.lineTo(30, -12); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#c84'; ctx.lineWidth = 3; ctx.stroke();
      // Weld seam lines — messy
      ctx.strokeStyle = 'rgba(200,140,80,0.3)'; ctx.lineWidth = 0.8;
      for (let w = 0; w < 5; w++) {
        ctx.beginPath(); ctx.moveTo(-24 + w*10, -16 + w*2); ctx.lineTo(-20 + w*10, 16 - w*2); ctx.stroke();
      }
      // Patchwork plates — different colors from different tanks
      ctx.fillStyle = '#502020'; ctx.fillRect(-16, -14, 10, 14); // red — from brute
      ctx.fillStyle = '#204060'; ctx.fillRect(4, -10, 12, 12); // blue — from sniper
      ctx.fillStyle = '#506010'; ctx.fillRect(-12, 4, 14, 10); // green — from artillery
      // Left: cobbled chain ball
      const ballAngle = Math.sin(brt * 0.6) * 0.35;
      ctx.save(); ctx.translate(-26, 8); ctx.rotate(ballAngle);
      ctx.strokeStyle = '#886'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-16, 12); ctx.stroke();
      ctx.fillStyle = '#544'; ctx.strokeStyle = '#c84'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(-16, 12, 7, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.restore();
      // Right: scavenged barrel
      ctx.fillStyle = '#3a2010'; ctx.strokeStyle = '#c84'; ctx.lineWidth = 1.5;
      ctx.fillRect(16, -6, 16, 10); ctx.strokeRect(16, -6, 16, 10);
      // Rusty core
      drawArmorPanel(ctx, -6, -5, 12, 10, 'rgba(20,8,4,0.9)', '#c84', 3);
      ctx.fillStyle = '#c84'; ctx.globalAlpha = eyePulse * 0.7;
      ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    } else if (bname === '星象仪') {
      // === ASTROLABE — rotating armillary rings ===
      ctx.fillStyle = '#0a1a28'; ctx.strokeStyle = '#4ce'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      // 3 rotating metal rings at different angles
      const ringData = [
        { tilt: 0.2, speed: 0.3, r: 20, alpha: 0.5 },
        { tilt: -0.15, speed: -0.25, r: 16, alpha: 0.6 },
        { tilt: 0.35, speed: 0.2, r: 22, alpha: 0.35 },
      ];
      ringData.forEach((rd, idx) => {
        ctx.save();
        ctx.rotate(rd.tilt + brt * rd.speed);
        ctx.strokeStyle = 'rgba(80,220,240,' + rd.alpha + ')';
        ctx.lineWidth = 1.5 - idx * 0.3;
        ctx.beginPath(); ctx.ellipse(0, 0, rd.r, rd.r * 0.4, 0, 0, Math.PI*2); ctx.stroke();
        if (idx === 0) {
          ctx.strokeStyle = 'rgba(80,220,240,' + (rd.alpha + 0.2) + ')';
          ctx.beginPath(); ctx.ellipse(0, 0, rd.r, rd.r * 0.4, 0, Math.PI, Math.PI); ctx.stroke();
        }
        ctx.restore();
      });
      // Bright central star core
      const corePulse = Math.sin(brt * 1.8) * 0.2 + 0.7;
      drawTechCore(ctx, 0, 0, 6, '#e0f8ff', '#4ce');
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI*2); ctx.fill();
      // Tiny projection dots on rings
      for (let d = 0; d < 5; d++) {
        const da = brt * 0.4 + d * Math.PI*2/5;
        ctx.fillStyle = 'rgba(80,240,255,0.5)';
        ctx.beginPath(); ctx.arc(Math.cos(da)*18, Math.sin(da)*18, 1.5, 0, Math.PI*2); ctx.fill();
      }
      // Small barrel
      ctx.save(); ctx.rotate(this.turretAngle);
      drawWeaponBarrel(ctx, 3, -2, 12, 4, '#0a1a28', '#4ce', '#e0f8ff');
      ctx.restore();
    } else if (bname === '圣龛守卫') {
      // === SANCTUM GUARD — church stained glass + halo ===
      // Wide hexagonal chassis — like a cathedral platform
      ctx.fillStyle = '#3a2810'; ctx.strokeStyle = '#c90'; ctx.lineWidth = 3;
      drawArmorPanel(ctx, -26, -18, 52, 36, '#3a2810', '#fd0', 5);
      // Stained glass pattern — colored panels
      const glassColors = ['rgba(255,200,50,0.3)','rgba(200,150,30,0.25)','rgba(255,180,40,0.2)','rgba(180,120,20,0.3)'];
      for (let g = 0; g < 6; g++) {
        ctx.fillStyle = glassColors[g % 4];
        ctx.fillRect(-22 + g * 7, -15 + (g % 2) * 6, 6, 10);
      }
      // Golden halo ring
      const haloPulse = Math.sin(brt * 1.5) * 0.15 + 0.7;
      ctx.strokeStyle = 'rgba(255,220,0,' + haloPulse + ')';
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, -4, 24, -Math.PI * 0.7, Math.PI * 0.7); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,200,' + (haloPulse * 0.5) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, -4, 28, -Math.PI * 0.6, Math.PI * 0.6); ctx.stroke();
      // Floating sigils (small diamonds orbiting)
      for (let s = 0; s < 3; s++) {
        const sa = brt * 0.5 + s * Math.PI * 2 / 3;
        const sx = Math.cos(sa) * 26, sy = Math.sin(sa) * 22 - 4;
        ctx.fillStyle = '#fd0'; ctx.globalAlpha = 0.6 + Math.sin(brt + s) * 0.2;
        ctx.fillRect(sx - 2, sy - 2, 5, 5);
        ctx.globalAlpha = 1;
      }
      // Central core
      drawArmorPanel(ctx, -8, -6, 16, 12, 'rgba(0,0,0,0.8)', '#fd0', 3);
      drawTechCore(ctx, 0, 0, 5, '#fff8d0', '#fd0');
      // Cannon — modest
      ctx.save(); ctx.rotate(this.turretAngle);
      drawWeaponBarrel(ctx, 4, -3, 16, 6, '#5a4020', '#c90', '#fff8e0');
      ctx.restore();
    } else if (bname === '轨道炮台') {
      // === ORBITAL CANNON — long-range sniper platform ===
      // Large cannon barrel
      ctx.fillStyle = '#3a2020'; ctx.strokeStyle = accent; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, 0, 28, 18, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      // Massive barrel
      ctx.save(); ctx.rotate(this.turretAngle);
      drawWeaponBarrel(ctx, 6, -5, 36, 12, '#3a1818', accent, '#fff');
      // Heat sink fins on barrel
      for (let f = 0; f < 5; f++) {
        ctx.strokeStyle = 'rgba(200,100,50,0.5)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(12 + f*5, -6); ctx.lineTo(12 + f*5, 6); ctx.stroke();
      }
      // Muzzle glow
      ctx.fillStyle = 'rgba(255,120,40,0.4)';
      ctx.beginPath(); ctx.arc(40, 0, 4, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // Targeting laser beam during telegraph
      if (this.attackState === 'telegraph') {
        ctx.strokeStyle = 'rgba(255,80,40,'+(0.3+Math.sin(brt*3)*0.15)+')';
        ctx.lineWidth = 1.5; ctx.setLineDash([4, 8]);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(this.telegraphAngle)*W, Math.sin(this.telegraphAngle)*H);
        ctx.stroke(); ctx.setLineDash([]);
      }
      // Heat sink glow
      const heatGlow = Math.sin(brt*2) * 0.2 + 0.6;
      ctx.fillStyle = 'rgba(255,100,30,'+heatGlow+')';
      ctx.fillRect(-8, -22, 16, 6);
      drawTechCore(ctx, -2, 0, 5, '#ffe0d0', accent);
    } else {
      // Fallback for any unnamed boss
      ctx.fillStyle='#0a0614';ctx.beginPath();ctx.moveTo(26,-26);ctx.lineTo(-24,-16);ctx.lineTo(-32,0);ctx.lineTo(-24,16);ctx.lineTo(26,26);ctx.lineTo(34,8);ctx.lineTo(34,-12);ctx.closePath();ctx.fill();
      ctx.strokeStyle=accent;ctx.lineWidth=3.5;ctx.stroke();
      drawArmorPanel(ctx,-12,-8,24,16,'rgba(0,0,0,0.9)',accent,4);
      ctx.fillStyle=accent;ctx.globalAlpha=eyePulse*0.85;ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-2,-2,2.5,0,Math.PI*2);ctx.fill();
      ctx.save();ctx.rotate(this.turretAngle);drawWeaponBarrel(ctx,6,-5,28,10,'#0a0618',accent,'#fff');ctx.restore();
    }
    // === Phase crown (common to all bosses) ===
    for (let r = 0; r < maxPh; r++) {
      const active = r <= this.currentPhase;
      ctx.strokeStyle = active ? accent : 'rgba(255,255,255,0.03)'; ctx.lineWidth = active ? 2.5 : 1.2;
      ctx.globalAlpha = active ? (0.6 + r * 0.15) : 0.08;
      ctx.beginPath(); ctx.arc(0, -6, 32 + r * 7, -Math.PI * 0.55, Math.PI * 0.55); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.shadowBlur = 0;
    if (this.hitFlash > 0) {
      ctx.fillStyle = 'rgba(255,255,255,' + (this.hitFlash / 10 * 0.18) + ')';
      ctx.beginPath();
      ctx.arc(0, 0, 32 + this.hitFlash * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    // Phase indicator
    if (p) {
      drawArmorPanel(ctx, -62, -50, 124, 16, 'rgba(8,12,18,0.82)', 'rgba(255,255,255,0.14)', 4);
      ctx.fillStyle = this.currentPhase > 0 ? '#ffd27a' : '#ffffff';
      ctx.font = 'bold 10px "Segoe UI","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(p.name, 0, -38);
    }
    ctx.restore();

    if (this.phaseFlash > 0) {
      const flashProgress = this.phaseFlash / 180;
      const overlayAlpha = Math.min(0.28, flashProgress * 0.28);
      // Radial flash from boss center
      const gradient = ctx.createRadialGradient(this.x, this.y, 20, this.x, this.y, Math.max(W, H) * 0.82);
      gradient.addColorStop(0, 'rgba(255,140,80,0)');
      gradient.addColorStop(0.45, 'rgba(140,18,12,' + (overlayAlpha * 0.6) + ')');
      gradient.addColorStop(1, 'rgba(14,0,0,' + overlayAlpha + ')');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);
      // Screen-edge vignette - darker borders during phase change
      const vignetteAlpha = flashProgress * 0.35;
      const vignetteGrad = ctx.createRadialGradient(W/2, H/2, Math.min(W,H)*0.35, W/2, H/2, Math.max(W,H)*0.65);
      vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
      vignetteGrad.addColorStop(1, 'rgba(0,0,0,' + vignetteAlpha + ')');
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, W, H);
      // Large phase announcement text with fade
      if (this.currentPhase > 0 && flashProgress > 0.3) {
        const textAlpha = Math.min(1, (flashProgress - 0.3) / 0.5);
        const textScale = 1 + (1 - flashProgress) * 0.4;
        const phaseName = this.getPhaseDef().name || ('PHASE ' + (this.currentPhase + 1));
        ctx.save();
        ctx.globalAlpha = textAlpha * 0.85;
        ctx.translate(W / 2, H * 0.32);
        ctx.scale(textScale, textScale);
        // Backdrop
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.font = 'bold 42px "Segoe UI","Microsoft YaHei",sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(phaseName, 2, 4);
        // Glow text
        ctx.shadowColor = this.bossDef.turret || '#ff5a30';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#fff';
        ctx.fillText(phaseName, 0, 0);
        ctx.shadowBlur = 0;
        // Subtitle
        ctx.font = 'bold 16px "Courier New",monospace';
        ctx.fillStyle = this.bossDef.turret || '#ff7a40';
        ctx.globalAlpha = textAlpha * 0.7;
        ctx.fillText('WARNING: PRESSURE ESCALATION', 0, 34);
        ctx.restore();
      }
    }

    if (this.alive) {
      const bhpW = Math.min(560, W - 88);
      const panelX = W / 2 - bhpW / 2 - 22;
      const panelY = 4;
      const panelH = 58;
      const dangerPulse = Math.sin(Date.now() / 130) * 0.5 + 0.5;
      const warningAlpha = this.currentPhase > 0 ? 0.16 + dangerPulse * 0.08 : 0.08 + dangerPulse * 0.04;
      drawArmorPanel(ctx, panelX, panelY, bhpW + 44, panelH, 'rgba(6,10,16,0.92)', 'rgba(255,212,122,0.16)', 6);
      // Danger striping - aggressive in phase 2
      const stripeCount = this.currentPhase > 0 ? 12 : 8;
      const stripeAlpha = this.currentPhase > 0 ? warningAlpha * 2.2 : warningAlpha;
      ctx.fillStyle = 'rgba(255,60,30,' + stripeAlpha + ')';
      for (let i = 0; i < stripeCount; i++) {
        const stripeX = panelX + 8 + i * ((bhpW + 8) / stripeCount);
        ctx.beginPath();
        ctx.moveTo(stripeX, panelY + 6);
        ctx.lineTo(stripeX + 8, panelY + 6);
        ctx.lineTo(stripeX - 2, panelY + 18);
        ctx.lineTo(stripeX - 10, panelY + 18);
        ctx.closePath();
        ctx.fill();
      }
      // Phase 2 additional red glow under the bar
      if (this.currentPhase > 0) {
        const p2Glow = dangerPulse * 0.08;
        ctx.fillStyle = 'rgba(255,20,0,' + p2Glow + ')';
        ctx.fillRect(panelX, panelY, bhpW + 44, panelH);
      }

      drawEnemyMarker(ctx, panelX + 16, panelY + 31, 'boss', 10, accent);
      ctx.fillStyle = '#f7c774';
      ctx.font = 'bold 10px "Courier New",monospace';
      ctx.textAlign = 'left';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText('BOSS ALERT / THREAT ' + this.threatRating.toFixed(1), panelX + 34, panelY + 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Segoe UI","Microsoft YaHei",sans-serif';
      ctx.fillText(this.bossDef.name, panelX + 34, panelY + 37);
      ctx.font = 'bold 10px "Segoe UI","Microsoft YaHei",sans-serif';
      ctx.fillStyle = hpRatio > 0.5 ? '#a8f4c0' : (hpRatio > 0.24 ? '#ffd36f' : '#ff7676');
      ctx.fillText('PHASE ' + (this.currentPhase + 1) + '  /  ' + p.name + '  /  ' + Math.ceil(this.hp) + ' HP', panelX + 34, panelY + 51);

      const barX = panelX + 200;
      const barY = panelY + 24;
      const barW = bhpW - 210;
      const barH = 14;
      ctx.fillStyle = 'rgba(45,12,12,0.88)';
      ctx.fillRect(barX, barY, barW, barH);
      const hpGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      if (this.currentPhase > 0) {
        hpGrad.addColorStop(0, '#ff6030');
        hpGrad.addColorStop(0.3, '#ff8840');
        hpGrad.addColorStop(0.7, '#ff2a2a');
        hpGrad.addColorStop(1, '#cc0018');
      } else {
        hpGrad.addColorStop(0, accent);
        hpGrad.addColorStop(0.5, '#ffb45c');
        hpGrad.addColorStop(1, hpRatio > 0.3 ? '#ff5a5a' : '#ff2f4f');
      }
      ctx.fillStyle = hpGrad;
      ctx.fillRect(barX, barY, barW * hpRatio, barH);
      // Phase 2 pulsing glow on HP bar
      if (this.currentPhase > 0) {
        ctx.globalAlpha = dangerPulse * 0.22;
        ctx.fillStyle = '#ff3010';
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
        ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = this.currentPhase > 0 ? 'rgba(255,80,40,0.32)' : 'rgba(255,255,255,0.18)';
      ctx.lineWidth = this.currentPhase > 0 ? 1.5 : 1;
      ctx.strokeRect(barX, barY, barW, barH);
      for (let i = 1; i < 8; i++) {
        const gx = barX + barW * i / 8;
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.moveTo(gx, barY + 1);
        ctx.lineTo(gx, barY + barH - 1);
        ctx.stroke();
      }

      const sidePulse = this.currentPhase > 0 ? 1 : 0.6;
      ctx.strokeStyle = 'rgba(255,196,112,' + (0.32 + dangerPulse * 0.2 * sidePulse) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(panelX - 6, panelY + 18);
      ctx.lineTo(panelX + 4, panelY + 18);
      ctx.lineTo(panelX + 4, panelY + panelH - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(panelX + bhpW + 50, panelY + 18);
      ctx.lineTo(panelX + bhpW + 40, panelY + 18);
      ctx.lineTo(panelX + bhpW + 40, panelY + panelH - 10);
      ctx.stroke();
      ctx.shadowBlur = 0;

      const stateDuration = Math.max(1, this.attackStateDuration || 1);
      const stateProgress = 1 - Math.max(0, Math.min(1, this.attackStateTimer / stateDuration));
      const chargeX = barX;
      const chargeY = barY + barH + 5;
      const stateLabel = this.attackState === 'telegraph'
        ? 'CHARGING / ' + (this.attackCue || 'BOSS ART')
        : (this.attackState === 'recover' ? 'ARMOR BREAK / RECOVER' : 'FIRING / EVADE');
      const stateColor = this.attackState === 'telegraph'
        ? 'rgba(255,196,112,0.9)'
        : (this.attackState === 'recover' ? 'rgba(140,232,255,0.86)' : 'rgba(255,103,103,0.86)');
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(chargeX, chargeY, barW, 5);
      ctx.fillStyle = stateColor;
      ctx.fillRect(chargeX, chargeY, barW * stateProgress, 5);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.strokeRect(chargeX, chargeY, barW, 5);
      ctx.fillStyle = this.attackState === 'recover' ? '#8ce8ff' : (this.attackState === 'telegraph' ? '#f6e5aa' : '#ff9f70');
      ctx.font = 'bold 9px "Courier New",monospace';
      ctx.textAlign = 'right';
      ctx.fillText(stateLabel, chargeX + barW, chargeY - 2);
      if (p && p.hint) {
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(246,229,170,0.74)';
        ctx.fillText(p.hint, panelX + 34, panelY + panelH + 14);
      }
    }
  }
  hit(bullet) {
    if (this.transitionLock > 0) return false;
    const dead = super.hit(bullet);
    this.hitFlash = 6;
    if (dead && this.bossDef.name === '沙暴' && weatherOverridden) {
      weatherOverridden = false;
      weatherParticles = [];
      const safeWave = Math.max(1, Number.isFinite(wave) ? wave : 1);
      const biome = (safeWave - 1) % 8;
      const weatherMap = { 0:'clear', 1:'rain', 2:'fog', 3:'dust', 4:'sparks', 5:'snow', 6:'ash', 7:'ion' };
      const restoreType = weatherMap[biome] || 'clear';
      weatherType = restoreType;
      weatherIntensity = restoreType === 'clear' ? 0 : 0.18 + safeWave * 0.012;
      if (restoreType !== 'clear') {
        const count = restoreType === 'fog' ? 60 : restoreType === 'dust' ? 80 : restoreType === 'ash' ? 70 : restoreType === 'snow' ? 50 : restoreType === 'ion' ? 40 : 40;
        for (let i = 0; i < count; i++) {
          weatherParticles.push({
            x: rng() * W, y: rng() * H,
            vx: restoreType === 'dust' ? (rng() - 0.5) * 2.5 : restoreType === 'ash' ? (rng() - 0.5) * 1.8 : restoreType === 'snow' ? (rng() - 0.5) * 0.8 : restoreType === 'ion' ? (rng() - 0.5) * 0.15 : (rng() - 0.5) * 0.4,
            vy: restoreType === 'rain' ? 4 + rng() * 3 : restoreType === 'snow' ? 1.5 + rng() * 1.5 : restoreType === 'ash' ? 2 + rng() * 2 : restoreType === 'ion' ? (rng() - 0.5) * 0.6 : (restoreType === 'dust' ? (rng() - 0.5) * 2 : (rng() - 0.5) * 0.3),
            life: rng() * 180, maxLife: 180 + rng() * 120,
            size: restoreType === 'rain' ? 0.8 + rng() : restoreType === 'fog' ? 30 + rng() * 50 : restoreType === 'snow' ? 2 + rng() * 3 : restoreType === 'ash' ? 2 + rng() * 4 : restoreType === 'ion' ? 40 + rng() * 70 : (restoreType === 'dust' ? 1.5 + rng() * 2 : 1 + rng()),
            alpha: restoreType === 'fog' ? 0.015 + rng() * 0.03 : restoreType === 'snow' ? 0.25 + rng() * 0.35 : restoreType === 'ash' ? 0.15 + rng() * 0.25 : restoreType === 'ion' ? 0.03 + rng() * 0.05 : (restoreType === 'dust' ? 0.12 + rng() * 0.18 : 0.2 + rng() * 0.3),
          });
        }
      }
    }
    if (!dead && this.attackState === 'firing' && this.currentPhase > 0 && this.phaseBurstCooldown <= 0 && rng() < 0.04) {
      this.phaseBurstCooldown = 110;
      this.emitPhaseBurst(false);
    }
    return dead;
  }
}

// --- Tank Progression System ---
// --- Meta-Progression: Tank Unlocks + Per-Tank Upgrades + Evolution ---
const FRAGMENT_KEY = 'tankbattle_fragments';
const TANK_UNLOCK_KEY = 'tankbattle_tank_unlocks';
const TANK_UNLOCK_PROGRESS_KEY = 'tankbattle_tank_unlock_progress';
const TANK_UPGRADE_KEY = 'tankbattle_tank_upgrades';
const TANK_EVOLVE_KEY = 'tankbattle_tank_evolved';
const GLOBAL_RESEARCH_KEY = 'tankbattle_global_research';
const LEADERBOARD_KEY = 'tankbattle_leaderboard';
let leaderboardData = {};
let leaderboardMode = 'clear';
let leaderboardTab = 'easy';
let coreFragments = 0;
let unlockedTanks = new Set(['spread']);
let tankUnlockProgress = { maxWave: 0, maxEliteKills: 0, bossKills: 0, dailyClears: 0, borderEcho: false };
let tankUpgrades = {};   // { spread: {hp:0,dmg:0,spd:0,special:0}, ... }
let globalResearch = {};
let evolvedTanks = new Set();
let labSelectedTank = 'spread';
const PROTOCOL_MAP_SIZE = { width: 3800, height: 3000, centerX: 1900, centerY: 1500 };
const PROTOCOL_ZOOM_LIMITS = { min: 0.58, max: 1.45, step: 0.12 };
let protocolMapPan = { x: 0, y: 0, zoom: 1, initialized: false, dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 };

const GLOBAL_RESEARCH_BRANCHES = [
  { id:'body', code:'SAN', name:'圣骸机体', desc:'底盘、装甲、弹仓与装填仪式。它让每一台机体都像从同一座圣龛中醒来。', color:'#f6e5aa', rgb:'246,229,170' },
  { id:'ordnance', code:'ORD', name:'弹道礼仪', desc:'弹速、冷却、后坐与弹幕对撞。研究室把火力写成律法，再交给驾驶员执行。', color:'#8ce8ff', rgb:'140,232,255' },
  { id:'logistics', code:'LOG', name:'后勤残响', desc:'月光石、补给、维修与概率敕令。所谓奇迹，多半来自仍未断线的补给网络。', color:'#f49800', rgb:'244,152,0' },
  { id:'conflux', code:'CNF', name:'触点果实', desc:'两片协议区域的树枝互相贴近后，偶尔会结出不属于任何单一区域的果实。', color:'#d7c48a', rgb:'215,196,138' },
];

const TANK_UNLOCK_CONDITIONS = {
  spread: { cost:0, desc:'初始机体' },
  focus:  { cost:100, desc:'到达第5波 或 100月光石' },
  wide:   { cost:150, desc:'到达第8波 或 150月光石' },
  burst:  { cost:200, desc:'单局击杀5精英 或 200月光石' },
  sniper: { cost:250, desc:'击杀任意Boss 或 250月光石' },
  homing: { cost:300, desc:'完成每日挑战 或 300月光石' },
  border: { cost:360, desc:'观测境界残响 或 360月光石' },
  blade:  { cost:420, desc:'达成35连击 或 420月光石' },
  scarlet:{ cost:480, desc:'单局得分10000 或 480月光石' },
  astral: { cost:540, desc:'到达第20波 或 540月光石' },
};

const LAB_TANK_MARKS = {
  spread: { code:'H-01', role:'散华制压', motto:'花瓣状弹幕被封存在黑铁装甲内。' },
  focus:  { code:'L-02', role:'直线贯穿', motto:'把所有祈祷压缩成一束发烫的光。' },
  wide:   { code:'F-03', role:'冰域封锁', motto:'霜层不是装甲，是延迟死亡的仪式。' },
  burst:  { code:'B-04', role:'燃爆清场', motto:'火药与圣印共振，像末日里的钟声。' },
  sniper: { code:'S-05', role:'远距裁决', motto:'它开火前会停顿，像在替目标写墓志铭。' },
  homing: { code:'O-06', role:'命运追猎', motto:'导引线会绕过废墟，也绕不过命运。' },
  border: { code:'Y-07', role:'境界折返', motto:'它不突破墙壁，只说服空间承认另一条路。' },
  blade:  { code:'K-08', role:'斩魂突击', motto:'双刃在履带前方闭合，像给战场划下一道判决线。' },
  scarlet:{ code:'R-09', role:'红枪压制', motto:'血色长枪不追求连射，它只要求每一击都有回声。' },
  astral: { code:'P-10', role:'星仪术式', motto:'炮塔上方的星盘转动时，敌方弹道会短暂相信命运。' },
};

const LAB_PART_CODES = {
  bullets:'MUN',
  spread:'ARC',
  speed:'DRV',
  core:'COR',
  armor:'ARM',
  dmg:'WAR',
  firerate:'CLK',
  railgun:'MAG',
  mobility:'JET',
  stability:'FCS',
  freeze:'CRY',
  hp:'PLT',
  explosion:'BLZ',
  special:'SIG',
  tracking:'NAV',
  rift:'RFT',
  phase:'PHS',
  seal:'SEAL',
  slash:'KAT',
  sheath:'SHD',
  blood:'RED',
  lance:'LNC',
  ritual:'RIT',
  orbit:'ORB',
  tome:'TOM',


  prism:'PRI',
};

// --- Modifier Icon SVG Badges ---
function getModifierIconSvg(code, rgb) {
  const c = 'rgba(' + (rgb || '140,232,255') + ',0.9)';
  const c2 = 'rgba(' + (rgb || '140,232,255') + ',0.55)';
  const map = {
    WAR: '<svg viewBox="0 0 32 32" width="32" height="32"><polygon points="16,2 20,12 30,12 22,18 25,28 16,22 7,28 10,18 2,12 12,12" fill="none" stroke="' + c + '" stroke-width="1.2" stroke-linejoin="round"/><circle cx="16" cy="15" r="3" fill="' + c2 + '"/></svg>',
    CLK: '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="13" fill="none" stroke="' + c + '" stroke-width="1.1"/><polyline points="16,6 16,16 23,20" fill="none" stroke="' + c + '" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><line x1="10" y1="15" x2="13" y2="16" stroke="' + c2 + '" stroke-width="0.8" stroke-linecap="round"/></svg>',
    RLD: '<svg viewBox="0 0 32 32" width="32" height="32"><path d="M10 8 L22 8 L22 20 Q22 26 16 26 Q10 26 10 20 Z" fill="none" stroke="' + c + '" stroke-width="1.1" stroke-linejoin="round"/><path d="M6 4 L10 8 M26 4 L22 8" fill="none" stroke="' + c2 + '" stroke-width="0.9" stroke-linecap="round"/><line x1="13" y1="12" x2="19" y2="12" stroke="' + c + '" stroke-width="0.8" stroke-linecap="round"/><line x1="13" y1="16" x2="17" y2="16" stroke="' + c2 + '" stroke-width="0.6" stroke-linecap="round"/></svg>',
    MAG: '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="7" y="8" width="18" height="16" rx="2" fill="none" stroke="' + c + '" stroke-width="1.1"/><rect x="10" y="10" width="12" height="12" rx="1" fill="none" stroke="' + c2 + '" stroke-width="0.8"/><line x1="13" y1="14" x2="19" y2="14" stroke="' + c + '" stroke-width="1" stroke-linecap="round"/><line x1="13" y1="18" x2="17" y2="18" stroke="' + c2 + '" stroke-width="0.7" stroke-linecap="round"/><path d="M15 4 L17 4 L17 8 L15 8 Z" fill="none" stroke="' + c + '" stroke-width="0.9" stroke-linejoin="round"/></svg>',
    PLT: '<svg viewBox="0 0 32 32" width="32" height="32"><path d="M16 3 L25 7 L25 17 Q25 25 16 29 Q7 25 7 17 L7 7 Z" fill="none" stroke="' + c + '" stroke-width="1.1" stroke-linejoin="round"/><line x1="16" y1="10" x2="16" y2="21" stroke="' + c + '" stroke-width="1" stroke-linecap="round"/><line x1="11" y1="15" x2="21" y2="15" stroke="' + c + '" stroke-width="1" stroke-linecap="round"/><circle cx="16" cy="15" r="2" fill="' + c2 + '"/></svg>',
    REP: '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="12" fill="none" stroke="' + c + '" stroke-width="1"/><path d="M16 6 Q13 16 16 26 Q19 16 16 6" fill="none" stroke="' + c + '" stroke-width="1.1" stroke-linecap="round"/><path d="M8 12 Q16 9 24 12" fill="none" stroke="' + c2 + '" stroke-width="0.8" stroke-linecap="round"/><circle cx="16" cy="16" r="2.5" fill="' + c2 + '"/></svg>',
    DRV: '<svg viewBox="0 0 32 32" width="32" height="32"><polygon points="18,4 28,8 28,24 18,28 14,28 4,24 4,8 14,4" fill="none" stroke="' + c + '" stroke-width="1.1" stroke-linejoin="round"/><polyline points="6,14 18,18 26,14" fill="none" stroke="' + c + '" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><polyline points="6,20 14,22 22,20" fill="none" stroke="' + c2 + '" stroke-width="0.7" stroke-linecap="round"/><circle cx="18" cy="16" r="2" fill="' + c2 + '"/></svg>',
    VEL: '<svg viewBox="0 0 32 32" width="32" height="32"><line x1="4" y1="16" x2="28" y2="16" stroke="' + c + '" stroke-width="1.1" stroke-linecap="round"/><polygon points="28,11 28,21 32,16" fill="' + c + '"/><circle cx="16" cy="16" r="4" fill="none" stroke="' + c2 + '" stroke-width="0.7" stroke-dasharray="1.5 2"/><line x1="8" y1="10" x2="12" y2="14" stroke="' + c2 + '" stroke-width="0.7" stroke-linecap="round"/></svg>',
    SUP: '<svg viewBox="0 0 32 32" width="32" height="32"><rect x="6" y="6" width="20" height="20" rx="1" fill="none" stroke="' + c + '" stroke-width="1"/><polygon points="12,11 12,17 18,14" fill="' + c + '"/><path d="M6 22 L10 18 L14 22 L18 18 L22 22 L26 18" fill="none" stroke="' + c2 + '" stroke-width="0.6" stroke-linecap="round"/><line x1="16" y1="6" x2="16" y2="2" stroke="' + c + '" stroke-width="0.8" stroke-linecap="round" stroke-dasharray="2 0.8"/></svg>',
    SCO: '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="11" cy="16" r="3" fill="none" stroke="' + c + '" stroke-width="1"/><circle cx="22" cy="16" r="3" fill="none" stroke="' + c + '" stroke-width="1"/><circle cx="16.5" cy="10" r="2" fill="none" stroke="' + c + '" stroke-width="1"/><line x1="14" y1="14.5" x2="19" y2="14.5" stroke="' + c2 + '" stroke-width="0.7" stroke-linecap="round"/><line x1="12" y1="13" x2="16" y2="11" stroke="' + c2 + '" stroke-width="0.7" stroke-linecap="round"/></svg>',
    REC: '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="12" fill="none" stroke="' + c + '" stroke-width="1" stroke-dasharray="2.5 1.5"/><path d="M8 14 L12 10 L16 14 L20 10 L24 14" fill="none" stroke="' + c + '" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 20 L12 16 L16 20 L20 16 L24 20" fill="none" stroke="' + c2 + '" stroke-width="0.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    BLZ: '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="3.5" fill="' + c2 + '"/><line x1="16" y1="2" x2="16" y2="9" stroke="' + c + '" stroke-width="1" stroke-linecap="round"/><line x1="16" y1="23" x2="16" y2="30" stroke="' + c + '" stroke-width="1" stroke-linecap="round"/><line x1="2" y1="16" x2="9" y2="16" stroke="' + c + '" stroke-width="1" stroke-linecap="round"/><line x1="23" y1="16" x2="30" y2="16" stroke="' + c + '" stroke-width="1" stroke-linecap="round"/><line x1="6" y1="6" x2="11" y2="11" stroke="' + c + '" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/><line x1="26" y1="6" x2="21" y2="11" stroke="' + c + '" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/><line x1="6" y1="26" x2="11" y2="21" stroke="' + c + '" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/><line x1="26" y1="26" x2="21" y2="21" stroke="' + c + '" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/></svg>',
    AIG: '<svg viewBox="0 0 32 32" width="32" height="32"><polygon points="16,3 28,10 28,22 16,29 4,22 4,10" fill="none" stroke="' + c + '" stroke-width="1" stroke-linejoin="round"/><polygon points="16,7 23,11 23,21 16,25 9,21 9,11" fill="none" stroke="' + c2 + '" stroke-width="0.8" stroke-linejoin="round"/><circle cx="16" cy="16" r="2" fill="' + c + '"/></svg>',
    BOS: '<svg viewBox="0 0 32 32" width="32" height="32"><polygon points="16,2 18,10 26,10 19,14 22,22 16,16 10,22 13,14 6,10 14,10" fill="none" stroke="' + c + '" stroke-width="1" stroke-linejoin="round"/><circle cx="16" cy="12" r="3" fill="' + c2 + '"/><path d="M7 25 L25 25" stroke="' + c + '" stroke-width="0.7" stroke-linecap="round"/><path d="M10 28 L22 28" stroke="' + c2 + '" stroke-width="0.5" stroke-linecap="round"/></svg>',
    LIF: '<svg viewBox="0 0 32 32" width="32" height="32"><path d="M16 28 Q6 18 5 10 Q4 4 10 4 Q14 4 16 8 Q18 4 22 4 Q28 4 27 10 Q26 18 16 28 Z" fill="none" stroke="' + c + '" stroke-width="1.1" stroke-linejoin="round"/><circle cx="16" cy="14" r="2" fill="' + c2 + '"/><line x1="12" y1="14" x2="20" y2="14" stroke="' + c + '" stroke-width="0.8" stroke-linecap="round"/><line x1="16" y1="10" x2="16" y2="18" stroke="' + c + '" stroke-width="0.8" stroke-linecap="round"/></svg>',
    SAN: '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="11" fill="none" stroke="' + c + '" stroke-width="1"/><polygon points="16,3 17,13 27,13 18,16 22,28 16,18 10,28 14,16 5,13 15,13" fill="none" stroke="' + c + '" stroke-width="0.9" stroke-linejoin="round"/><circle cx="16" cy="15" r="3" fill="' + c2 + '"/></svg>',
    MS3: '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="11" fill="none" stroke="' + c + '" stroke-width="1"/><circle cx="16" cy="10" r="3" fill="' + c2 + '"/><circle cx="11" cy="20" r="3" fill="' + c2 + '"/><circle cx="21" cy="20" r="3" fill="' + c2 + '"/><line x1="14" y1="13" x2="12" y2="17" stroke="' + c + '" stroke-width="0.6"/><line x1="18" y1="13" x2="20" y2="17" stroke="' + c + '" stroke-width="0.6"/><line x1="11.5" y1="17" x2="20.5" y2="17" stroke="' + c + '" stroke-width="0.6"/></svg>',
    MS6: '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="11" fill="none" stroke="' + c + '" stroke-width="1.1"/><polygon points="16,4 28,16 16,28 4,16" fill="none" stroke="' + c2 + '" stroke-width="0.9"/><circle cx="16" cy="16" r="3" fill="' + c + '" opacity="0.5"/><circle cx="16" cy="10" r="1.5" fill="' + c2 + '" opacity="0.7"/><circle cx="21" cy="19" r="1.5" fill="' + c2 + '" opacity="0.7"/><circle cx="11" cy="19" r="1.5" fill="' + c2 + '" opacity="0.7"/></svg>',
    MS9: '<svg viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="12" fill="none" stroke="' + c + '" stroke-width="1.1"/><circle cx="16" cy="16" r="7" fill="none" stroke="' + c2 + '" stroke-width="0.9"/><circle cx="16" cy="16" r="2" fill="' + c + '"/><line x1="16" y1="4" x2="16" y2="9" stroke="' + c + '" stroke-width="1"/><line x1="16" y1="23" x2="16" y2="28" stroke="' + c + '" stroke-width="1"/><line x1="4" y1="16" x2="9" y2="16" stroke="' + c + '" stroke-width="1"/><line x1="23" y1="16" x2="28" y2="16" stroke="' + c + '" stroke-width="1"/><line x1="7.5" y1="7.5" x2="11" y2="11" stroke="' + c2 + '" stroke-width="0.8"/><line x1="24.5" y1="7.5" x2="21" y2="11" stroke="' + c2 + '" stroke-width="0.8"/><line x1="7.5" y1="24.5" x2="11" y2="21" stroke="' + c2 + '" stroke-width="0.8"/><line x1="24.5" y1="24.5" x2="21" y2="21" stroke="' + c2 + '" stroke-width="0.8"/></svg>',
  };
  return map[code] || ('<svg viewBox="0 0 32 32" width="32" height="32"><rect x="5" y="5" width="22" height="22" rx="2" fill="none" stroke="' + c + '" stroke-width="0.9"/><text x="16" y="22" text-anchor="middle" fill="' + c + '" font-size="12" font-weight="bold" font-family="monospace">' + (code || '?') + '</text></svg>');
}

const GLOBAL_RESEARCH_DEFS = [
  {
    id:'armor_line', branch:'body', row:1, code:'A-LINE', name:'圣龛基线', max:6, costBase:130,
    desc:l => '全机体最大HP +' + Math.floor(l / 4),
    next:l => '下一阶 HP +' + Math.floor((l + 1) / 4),
    lore:'最早的圣龛不是祭坛，而是装甲内侧一条拒绝熄灭的备用电路。',
    apply(t, lvl){ t.hpBonus += Math.floor(lvl / 4); },
  },
  {
    id:'mag_foundry', branch:'body', row:2, prereq:{ armor_line:2 }, code:'M-FND', name:'弹仓铸造', max:4, costBase:150,
    desc:l => '全机体弹夹 +' + Math.floor(l / 4),
    next:l => '下一阶 弹夹 +' + Math.floor((l + 1) / 4),
    lore:'弹仓工坊把空壳称作“未完成的祈祷”，每一枚都要登记去向。',
    apply(t, lvl){ t.magSize = Math.max(1, (t.magSize || 6) + Math.floor(lvl / 4)); },
  },
  {
    id:'reload_rite', branch:'body', row:3, prereq:{ mag_foundry:1 }, code:'R-RIT', name:'装填礼仪', max:5, costBase:145,
    desc:l => '装填时间 -' + (l * 0.7).toFixed(1) + '%',
    next:l => '下一阶 装填 -' + ((l + 1) * 0.7).toFixed(1) + '%',
    lore:'装填手册被写成赞美诗，是为了让士兵在恐惧时仍能按顺序呼吸。',
    apply(t, lvl){ t.reloadTime = Math.max(86, Math.floor((t.reloadTime || 110) * (1 - lvl * 0.007))); },
  },
  {
    id:'servo_step', branch:'body', row:2, prereq:{ armor_line:1 }, code:'S-DRV', name:'伺服步进', max:5, costBase:120,
    desc:l => '移动速度 +' + (l * 0.5).toFixed(1) + '%',
    next:l => '下一阶 移速 +' + ((l + 1) * 0.5).toFixed(1) + '%',
    lore:'灰域里的道路会移动，所以底盘也必须学会像幸存者一样改变步幅。',
    apply(t, lvl){ t.speed += lvl * 0.005; },
  },
  {
    id:'chassis_vow', branch:'body', row:4, prereq:{ armor_line:4, servo_step:2 }, code:'C-VOW', name:'底盘誓约', max:3, costBase:260,
    desc:l => '移速 +' + (l * 0.35).toFixed(2) + '% / 开火稳定 +' + (l * 0.3).toFixed(1) + '%',
    next:l => '下一阶 移速 +' + ((l + 1) * 0.35).toFixed(2) + '% / 开火稳定 +' + ((l + 1) * 0.3).toFixed(1) + '%',
    lore:'驾驶员签下誓约后，机体会记住他的恐惧，也记住他没有后退。',
    apply(t, lvl){ t.speed += lvl * 0.0035; t.fireSlowResist = (t.fireSlowResist || 0) + lvl * 0.003; },
  },
  {
    id:'ballistic_archive', branch:'ordnance', row:1, code:'B-ARC', name:'弹道档案', max:5, costBase:135,
    desc:l => '基础弹速 +' + (l * 0.02).toFixed(2),
    next:l => '下一阶 弹速 +' + ((l + 1) * 0.02).toFixed(2),
    lore:'档案员不记录命中，只记录偏离。所有胜利都从承认误差开始。',
    apply(t, lvl){ t.bulletSpeed += lvl * 0.02; },
  },
  {
    id:'special_sync', branch:'ordnance', row:3, prereq:{ ballistic_archive:2 }, code:'SIG-S', name:'特弹同步', max:4, costBase:175,
    desc:l => l >= 4 ? '特弹周期 -1 / 特化弹道稳定' : '特化弹道稳定 +' + l,
    next:l => (l + 1) >= 4 ? '下一阶 特弹周期 -1' : '下一阶 特化弹道稳定 +' + (l + 1),
    lore:'不同机体的奇迹被接入同一拍点，像战场深处的钟声终于对齐。',
    apply(t, lvl){
      if (t.specialInterval) t.specialInterval = Math.max(2, t.specialInterval - Math.floor(lvl / 4));
      t.railgunSpeedBonus = (t.railgunSpeedBonus || 0) + lvl * 0.012;
      t.riftSpeedBonus = (t.riftSpeedBonus || 0) + lvl * 0.006;
      t.orbitSpeedBonus = (t.orbitSpeedBonus || 0) + lvl * 0.006;
      t.baseHomingStrength = (t.baseHomingStrength || 0) + lvl * 0.0005;
    },
  },
  {
    id:'coolant_chapel', branch:'ordnance', row:2, prereq:{ ballistic_archive:1 }, code:'C-CHP', name:'冷却圣堂', max:5, costBase:170,
    desc:l => '射击冷却 -' + Math.floor(l / 3) + '帧',
    next:l => '下一阶 冷却 -' + Math.floor((l + 1) / 3) + '帧',
    lore:'圣堂不是为了降温而建。它只是让过热的炮膛学会忏悔。',
    apply(t, lvl){ t.shootDelay = Math.max(15, t.shootDelay - Math.floor(lvl / 3)); },
  },
  {
    id:'recoil_sanctum', branch:'ordnance', row:2, prereq:{ ballistic_archive:1 }, code:'R-SAN', name:'后坐圣所', max:4, costBase:155,
    desc:l => '开火减速惩罚缓和 +' + (l * 1.2).toFixed(1) + '%',
    next:l => '下一阶 减速缓和 +' + ((l + 1) * 1.2).toFixed(1) + '%',
    lore:'后坐力是炮火索取的税。圣所只是把税单写得慢一点。',
    apply(t, lvl){ t.fireSlowResist = (t.fireSlowResist || 0) + lvl * 0.006; },
  },
  {
    id:'clash_calculus', branch:'ordnance', row:4, prereq:{ special_sync:2, recoil_sanctum:2 }, code:'C-CLS', name:'对撞演算', max:3, costBase:255,
    desc:l => '我方子弹对撞强度 +' + Math.floor(l / 2),
    next:l => '下一阶 对撞强度 +' + Math.floor((l + 1) / 2),
    lore:'月面修会相信弹幕相撞时会产生预言。研究室只相信剩下的那一枚。',
  },
  {
    id:'salvage_prayer', branch:'logistics', row:1, code:'MS-R', name:'月石回收', max:5, costBase:160,
    desc:l => '战场MOONSTONE +' + (l * 0.8).toFixed(1) + '%',
    next:l => '下一阶 战场MS +' + ((l + 1) * 0.8).toFixed(1) + '%',
    lore:'回收队从不问月光石来自哪里。问了的人，后来都被调去清点空弹壳。',
  },
  {
    id:'supply_liturgy', branch:'logistics', row:2, prereq:{ salvage_prayer:1 }, code:'S-LIT', name:'补给礼拜', max:5, costBase:150,
    desc:l => '战场道具投放 +' + (l * 0.8).toFixed(1) + '%',
    next:l => '下一阶 投放 +' + ((l + 1) * 0.8).toFixed(1) + '%',
    lore:'补给舱降落前会广播三秒钟圣歌，好让仍活着的人知道自己还被记得。',
  },
  {
    id:'repair_canticle', branch:'logistics', row:3, prereq:{ supply_liturgy:2 }, code:'R-CAN', name:'自修圣歌', max:5, costBase:185,
    desc:l => '击杀修复概率 +' + (l * 0.4).toFixed(1) + '%',
    next:l => '下一阶 修复概率 +' + ((l + 1) * 0.4).toFixed(1) + '%',
    lore:'旧医官把维修臂叫作唱诗班。它们没有喉咙，却总在装甲闭合时发出回声。',
  },
  {
    id:'vault_cartography', branch:'logistics', row:2, prereq:{ salvage_prayer:2 }, code:'V-MAP', name:'宝库测绘', max:4, costBase:190,
    desc:l => '宝箱MOONSTONE +' + (l * 0.8).toFixed(1) + '%',
    next:l => '下一阶 宝箱MS +' + ((l + 1) * 0.8).toFixed(1) + '%',
    lore:'地图上标出的不是宝库，而是上一支远征队没能带走的遗言。',
  },
  {
    id:'reroll_writ', branch:'logistics', row:3, prereq:{ vault_cartography:1 }, code:'R-WRT', name:'重掷敕令', max:3, costBase:220,
    desc:l => '局内刷新花费 -' + (l * 2.2).toFixed(1) + '%',
    next:l => '下一阶 刷新花费 -' + ((l + 1) * 2.2).toFixed(1) + '%',
    lore:'概率不是神明，只是收费很高的书记员。敕令能让它少写几笔。',
  },
  {
    id:'field_sanctuary', branch:'logistics', row:4, prereq:{ repair_canticle:3, supply_liturgy:3 }, code:'F-SAN', name:'战地小圣所', max:3, costBase:285,
    desc:l => '击杀修复概率额外 +' + (l * 0.3).toFixed(1) + '% / 道具投放 +' + (l * 0.6).toFixed(1) + '%',
    next:l => '下一阶 修复 +' + ((l + 1) * 0.3).toFixed(1) + '% / 投放 +' + ((l + 1) * 0.6).toFixed(1) + '%',
    lore:'有些阵地没有名字，只有一盏灯。灯还亮着，就说明撤退命令尚未抵达。',
  },
  {
    id:'moon_tithe', branch:'logistics', row:5, prereq:{ field_sanctuary:2, vault_cartography:3 }, code:'M-TTH', name:'碎月什一税', max:2, costBase:360,
    desc:l => '战场与宝箱MOONSTONE额外 +' + (l * 1.2).toFixed(1) + '%',
    next:l => '下一阶 全域MS额外 +' + ((l + 1) * 1.2).toFixed(1) + '%',
    lore:'圣城不征税，它只要求所有幸存者证明自己为何值得继续得到补给。',
  },
  {
    id:'ordnance_doctrine', branch:'ordnance', row:5, prereq:{ clash_calculus:2, coolant_chapel:3 }, code:'O-DOC', name:'弹幕教义', max:2, costBase:345,
    desc:l => '弹速 +' + (l * 0.018).toFixed(3) + ' / 特化弹道稳定 +' + (l * 0.6).toFixed(1) + '%',
    next:l => '下一阶 弹速 +' + ((l + 1) * 0.018).toFixed(3) + ' / 特化弹道稳定 +' + ((l + 1) * 0.6).toFixed(1) + '%',
    lore:'教义最后一页写着：若必须开火，请让每一发都像不得不说出的真话。',
    apply(t, lvl){
      t.bulletSpeed += lvl * 0.018;
      t.railgunSpeedBonus = (t.railgunSpeedBonus || 0) + lvl * 0.006;
      t.riftSpeedBonus = (t.riftSpeedBonus || 0) + lvl * 0.004;
      t.orbitSpeedBonus = (t.orbitSpeedBonus || 0) + lvl * 0.004;
    },
  },
  {
    id:'sanctum_network', branch:'body', row:5, prereq:{ chassis_vow:2, reload_rite:3 }, code:'S-NET', name:'圣龛网路', max:2, costBase:340,
    desc:l => '弹夹 +' + (l >= 2 ? 1 : 0) + ' / 装填额外 -' + (l * 0.7).toFixed(1) + '%',
    next:l => '下一阶 弹夹 +' + ((l + 1) >= 2 ? 1 : 0) + ' / 装填额外 -' + ((l + 1) * 0.7).toFixed(1) + '%',
    lore:'当所有机体的圣龛互相听见，单台坦克的心跳就不再孤独。',
    apply(t, lvl){ t.magSize = Math.max(1, (t.magSize || 6) + (lvl >= 2 ? 1 : 0)); t.reloadTime = Math.max(86, Math.floor((t.reloadTime || 110) * (1 - lvl * 0.007))); },
  },
  {
    id:'sigil_bus', branch:'body', row:4, prereq:{ reload_rite:1 }, code:'S-BUS', name:'圣印总线', max:4, costBase:205,
    desc:l => '射击冷却 -' + Math.floor(l / 2) + '帧 / 装填 -' + (l * 0.4).toFixed(1) + '%',
    next:l => '下一阶 冷却 -' + Math.floor((l + 1) / 2) + '帧 / 装填 -' + ((l + 1) * 0.4).toFixed(1) + '%',
    lore:'研究室把祈祷词刻进铜线，命令就沿着圣印奔跑，像一群沉默的传令兵。',
    apply(t, lvl){ t.shootDelay = Math.max(15, t.shootDelay - Math.floor(lvl / 2)); t.reloadTime = Math.max(86, Math.floor((t.reloadTime || 110) * (1 - lvl * 0.004))); },
  },
  {
    id:'anchor_frame', branch:'body', row:4, prereq:{ servo_step:1, chassis_vow:1 }, code:'A-FRM', name:'锚定骨架', max:3, costBase:245,
    desc:l => '全机体HP +' + (l >= 3 ? 1 : 0) + ' / 开火减速缓和 +' + (l * 0.5).toFixed(1) + '%',
    next:l => '下一阶 HP +' + ((l + 1) >= 3 ? 1 : 0) + ' / 减速缓和 +' + ((l + 1) * 0.5).toFixed(1) + '%',
    lore:'锚不是为了停下，而是为了让机体在炮火中知道自己仍属于地面。',
    apply(t, lvl){ t.hpBonus += lvl >= 3 ? 1 : 0; t.fireSlowResist = (t.fireSlowResist || 0) + lvl * 0.005; },
  },
  {
    id:'memorial_core', branch:'body', row:6, prereq:{ sanctum_network:1, sigil_bus:1 }, code:'M-COR', name:'碑铭核心', max:2, costBase:405,
    desc:l => '全机体HP +' + (l >= 2 ? 1 : 0) + ' / 弹夹 +' + (l >= 2 ? 1 : 0),
    next:l => '下一阶 HP +' + ((l + 1) >= 2 ? 1 : 0) + ' / 弹夹 +' + ((l + 1) >= 2 ? 1 : 0),
    lore:'每一块核心都封存着一段失败撤离的录音。它们不提供勇气，只提醒驾驶员别浪费下一次机会。',
    apply(t, lvl){ t.hpBonus += lvl >= 2 ? 1 : 0; t.magSize = Math.max(1, (t.magSize || 6) + (lvl >= 2 ? 1 : 0)); },
  },
  {
    id:'parallax_sight', branch:'ordnance', row:2, prereq:{ ballistic_archive:1 }, code:'P-SGT', name:'视差照准', max:4, costBase:180,
    desc:l => '弹速 +' + (l * 0.016).toFixed(3) + ' / 开火减速缓和 +' + (l * 0.4).toFixed(1) + '%',
    next:l => '下一阶 弹速 +' + ((l + 1) * 0.016).toFixed(3) + ' / 减速缓和 +' + ((l + 1) * 0.4).toFixed(1) + '%',
    lore:'照准镜会显示目标尚未抵达的位置。老兵说那不是预测，是战场短暂承认了自己的悔意。',
    apply(t, lvl){ t.bulletSpeed += lvl * 0.016; t.fireSlowResist = (t.fireSlowResist || 0) + lvl * 0.004; },
  },
  {
    id:'muzzle_choir', branch:'ordnance', row:4, prereq:{ coolant_chapel:1, parallax_sight:1 }, code:'M-CHR', name:'炮口圣咏', max:4, costBase:215,
    desc:l => '基础伤害 +' + Math.floor(l / 4),
    next:l => '下一阶 基础伤害 +' + Math.floor((l + 1) / 4),
    lore:'炮口焰被调成同一音阶后，整条战线都会听见短促的赞歌。',
    apply(t, lvl){ t.bulletDamage += Math.floor(lvl / 4); },
  },
  {
    id:'counter_gospel', branch:'ordnance', row:5, prereq:{ clash_calculus:1 }, code:'C-GOS', name:'反制福音', max:2, costBase:330,
    desc:l => '子弹对撞强度额外 +' + Math.floor(l / 2),
    next:l => '下一阶 对撞强度额外 +' + Math.floor((l + 1) / 2),
    lore:'福音不是写给士兵的，而是写给飞来的敌弹：若你仍要前进，就先回答这道算式。',
  },
  {
    id:'terminal_firing_table', branch:'ordnance', row:6, prereq:{ ordnance_doctrine:1, counter_gospel:1 }, code:'T-TBL', name:'终末射表', max:2, costBase:420,
    desc:l => '基础伤害 +' + (l >= 2 ? 1 : 0) + ' / 弹速 +' + (l * 0.01).toFixed(3),
    next:l => '下一阶 伤害 +' + ((l + 1) >= 2 ? 1 : 0) + ' / 弹速 +' + ((l + 1) * 0.01).toFixed(3),
    lore:'射表末页没有坐标，只有一句手写批注：当世界足够黑，任何弹道都像一条归途。',
    apply(t, lvl){ t.bulletDamage += lvl >= 2 ? 1 : 0; t.bulletSpeed += lvl * 0.01; },
  },
  {
    id:'after_action_tithe', branch:'logistics', row:2, prereq:{ salvage_prayer:1 }, code:'A-TTH', name:'战后什一录', max:4, costBase:175,
    desc:l => '局内经验 +' + l + '%',
    next:l => '下一阶 经验 +' + (l + 1) + '%',
    lore:'每次交火后的损失都会被登记。记录员相信，幸存本身也是一种可征收的知识。',
  },
  {
    id:'black_box_routes', branch:'logistics', row:4, prereq:{ reroll_writ:1 }, code:'B-BOX', name:'黑箱航路', max:3, costBase:250,
    desc:l => '局内刷新费用额外 -' + (l * 1.2).toFixed(1) + '%',
    next:l => '下一阶 刷新费用额外 -' + ((l + 1) * 1.2).toFixed(1) + '%',
    lore:'补给机从不解释自己如何抵达。黑箱里只留下潮湿的灰、月石粉末和一串无法复述的坐标。',
  },
  {
    id:'saint_cache', branch:'logistics', row:5, prereq:{ field_sanctuary:1, black_box_routes:1 }, code:'S-CCH', name:'圣徒暗仓', max:3, costBase:310,
    desc:l => '道具投放 +' + (l * 0.7).toFixed(1) + '% / 宝箱MS +' + (l * 0.6).toFixed(1) + '%',
    next:l => '下一阶 投放 +' + ((l + 1) * 0.7).toFixed(1) + '% / 宝箱MS +' + ((l + 1) * 0.6).toFixed(1) + '%',
    lore:'暗仓不是仓库，是一批人选择把明天交给陌生驾驶员后的遗迹。',
  },
  {
    id:'pilgrimage_index', branch:'logistics', row:6, prereq:{ moon_tithe:1, after_action_tithe:1 }, code:'P-IDX', name:'远征索引', max:2, costBase:395,
    desc:l => '局内经验 +' + (l * 1.4).toFixed(1) + '% / 全域MS +' + (l * 0.6).toFixed(1) + '%',
    next:l => '下一阶 经验 +' + ((l + 1) * 1.4).toFixed(1) + '% / 全域MS +' + ((l + 1) * 0.6).toFixed(1) + '%',
    lore:'索引列出所有没能返航的路线。后来的驾驶员沿着它们前进，像沿着墓碑之间的窄路。',
  },
  {
    id:'reliquary_spine', branch:'body', row:7, prereq:{ memorial_core:1, anchor_frame:1 }, code:'R-SPN', name:'圣匣脊柱', max:3, costBase:470,
    desc:l => '最大HP +' + (l >= 3 ? 1 : 0) + ' / 开火稳定 +' + (l * 0.4).toFixed(1) + '%',
    next:l => '下一阶 HP +' + ((l + 1) >= 3 ? 1 : 0) + ' / 开火稳定 +' + ((l + 1) * 0.4).toFixed(1) + '%',
    lore:'圣匣脊柱不会让机体更勇敢，它只让每一次退缩都被装甲记住，然后慢慢纠正。',
    apply(t, lvl){ t.hpBonus += lvl >= 3 ? 1 : 0; t.fireSlowResist = (t.fireSlowResist || 0) + lvl * 0.004; },
  },
  {
    id:'martyr_hydraulics', branch:'body', row:7, prereq:{ sanctum_network:1, chassis_vow:1 }, code:'M-HYD', name:'殉道液压', max:3, costBase:450,
    desc:l => '移速 +' + (l * 0.35).toFixed(2) + '% / 装填 -' + (l * 0.35).toFixed(2) + '%',
    next:l => '下一阶 移速 +' + ((l + 1) * 0.35).toFixed(2) + '% / 装填 -' + ((l + 1) * 0.35).toFixed(2) + '%',
    lore:'液压管里流动的不是油，而是撤离名单上没被念完的名字。它们推着底盘继续向前。',
    apply(t, lvl){ t.speed += lvl * 0.0035; t.reloadTime = Math.max(86, Math.floor((t.reloadTime || 110) * (1 - lvl * 0.0035))); },
  },
  {
    id:'eclipse_rangefinder', branch:'ordnance', row:7, prereq:{ terminal_firing_table:1, muzzle_choir:1 }, code:'E-RNG', name:'蚀月测距仪', max:3, costBase:485,
    desc:l => '弹速 +' + (l * 0.012).toFixed(3) + ' / 特化弹道稳定 +' + (l * 0.5).toFixed(1) + '%',
    next:l => '下一阶 弹速 +' + ((l + 1) * 0.012).toFixed(3) + ' / 特化弹道稳定 +' + ((l + 1) * 0.5).toFixed(1) + '%',
    lore:'蚀月测距仪会在扣下扳机前闪烁一次。有人说那是距离，有人说那是命运被量出的误差。',
    apply(t, lvl){
      t.bulletSpeed += lvl * 0.012;
      t.railgunSpeedBonus = (t.railgunSpeedBonus || 0) + lvl * 0.005;
      t.riftSpeedBonus = (t.riftSpeedBonus || 0) + lvl * 0.003;
      t.orbitSpeedBonus = (t.orbitSpeedBonus || 0) + lvl * 0.003;
    },
  },
  {
    id:'interdiction_choir', branch:'ordnance', row:7, prereq:{ counter_gospel:1, recoil_sanctum:2 }, code:'I-CHR', name:'拦截唱诗班', max:2, costBase:465,
    desc:l => '子弹对撞强度 +' + (l >= 2 ? 1 : 0) + ' / 开火稳定 +' + (l * 0.6).toFixed(1) + '%',
    next:l => '下一阶 对撞 +' + ((l + 1) >= 2 ? 1 : 0) + ' / 开火稳定 +' + ((l + 1) * 0.6).toFixed(1) + '%',
    lore:'唱诗班的乐谱只写给飞来的敌弹。每一节休止符，都是一次被迫停止的杀意。',
    apply(t, lvl){ t.fireSlowResist = (t.fireSlowResist || 0) + lvl * 0.006; },
  },
  {
    id:'ashen_caravan', branch:'logistics', row:7, prereq:{ saint_cache:1, pilgrimage_index:1 }, code:'A-CVN', name:'灰烬商队', max:3, costBase:455,
    desc:l => '战场MS +' + (l * 0.5).toFixed(1) + '% / 道具投放 +' + (l * 0.35).toFixed(2) + '%',
    next:l => '下一阶 MS +' + ((l + 1) * 0.5).toFixed(1) + '% / 投放 +' + ((l + 1) * 0.35).toFixed(2) + '%',
    lore:'灰烬商队没有旗帜，只在履带印之间留下小小的补给封条。没人知道他们是否还算活人。',
  },
  {
    id:'mercy_accountant', branch:'logistics', row:7, prereq:{ black_box_routes:1, repair_canticle:3 }, code:'M-ACC', name:'慈悲账房', max:2, costBase:475,
    desc:l => '刷新折扣额外 -' + (l * 0.8).toFixed(1) + '% / 修复概率 +' + (l * 0.25).toFixed(2) + '%',
    next:l => '下一阶 折扣 -' + ((l + 1) * 0.8).toFixed(1) + '% / 修复 +' + ((l + 1) * 0.25).toFixed(2) + '%',
    lore:'账房把慈悲写进表格最末行。若余额足够，它会让奇迹看起来像一次普通报销。',
  },
  {
    id:'iron_procession_fruit', branch:'conflux', blend:['body','ordnance'], row:5, prereq:{ anchor_frame:1, recoil_sanctum:1 }, code:'C-FRT', name:'铁列果实', max:3, costBase:390,
    desc:l => '开火稳定 +' + (l * 0.6).toFixed(1) + '% / 弹速 +' + (l * 0.006).toFixed(3),
    next:l => '下一阶 稳定 +' + ((l + 1) * 0.6).toFixed(1) + '% / 弹速 +' + ((l + 1) * 0.006).toFixed(3),
    lore:'两条树枝在这里碰撞，结出的果实有铁锈味。驾驶员说它像一枚还没发射就先学会祈祷的炮弹。',
    apply(t, lvl){ t.fireSlowResist = (t.fireSlowResist || 0) + lvl * 0.006; t.bulletSpeed += lvl * 0.006; },
  },
  {
    id:'munition_tithe_fruit', branch:'conflux', blend:['ordnance','logistics'], row:6, prereq:{ ordnance_doctrine:1, saint_cache:1 }, code:'M-FRT', name:'弹税果实', max:2, costBase:455,
    desc:l => '局内经验 +' + (l * 0.8).toFixed(1) + '% / 对撞强度 +' + (l >= 2 ? 1 : 0),
    next:l => '下一阶 经验 +' + ((l + 1) * 0.8).toFixed(1) + '% / 对撞 +' + ((l + 1) >= 2 ? 1 : 0),
    lore:'后勤把弹壳算作税票，炮口把税票读成圣歌。果实成熟时，整条补给线都会闻到硝烟。',
  },
  {
    id:'pilgrim_chassis_fruit', branch:'conflux', blend:['logistics','body'], row:6, prereq:{ pilgrimage_index:1, sanctum_network:1 }, code:'P-FRT', name:'巡礼底盘果实', max:3, costBase:430,
    desc:l => '全域MS +' + (l * 0.4).toFixed(1) + '% / 移速 +' + (l * 0.25).toFixed(2) + '%',
    next:l => '下一阶 MS +' + ((l + 1) * 0.4).toFixed(1) + '% / 移速 +' + ((l + 1) * 0.25).toFixed(2) + '%',
    lore:'远征索引与圣龛网路在此交握。果实并不甜，却能让机体记住更远处的归路。',
    apply(t, lvl){ t.speed += lvl * 0.0025; },
  },
  {
    id:'triune_sanctum_fruit', branch:'conflux', blend:['body','ordnance','logistics'], row:8, prereq:{ reliquary_spine:1, eclipse_rangefinder:1, ashen_caravan:1 }, code:'T-FRT', name:'三相圣果', max:2, costBase:620,
    desc:l => 'HP +' + (l >= 2 ? 1 : 0) + ' / 弹速 +' + (l * 0.008).toFixed(3) + ' / 全域MS +' + (l * 0.4).toFixed(1) + '%',
    next:l => '下一阶 HP +' + ((l + 1) >= 2 ? 1 : 0) + ' / 弹速 +' + ((l + 1) * 0.008).toFixed(3) + ' / MS +' + ((l + 1) * 0.4).toFixed(1) + '%',
    lore:'三条主干都把影子伸到这里时，圣城会短暂沉默。三相圣果不是奖赏，而是系统承认你已经越过原本的设计边界。',
    apply(t, lvl){ t.hpBonus += lvl >= 2 ? 1 : 0; t.bulletSpeed += lvl * 0.008; },
  },
];

const GLOBAL_RESEARCH_LAYOUT = {
  armor_line:{ x:1900, y:1220 }, mag_foundry:{ x:1550, y:980 }, servo_step:{ x:2250, y:980 }, reload_rite:{ x:1290, y:720 },
  chassis_vow:{ x:2510, y:720 }, sigil_bus:{ x:1030, y:470 }, anchor_frame:{ x:2780, y:470 }, sanctum_network:{ x:1900, y:430 },
  memorial_core:{ x:1900, y:210 }, reliquary_spine:{ x:1650, y:80 }, martyr_hydraulics:{ x:2320, y:120 },
  ballistic_archive:{ x:2260, y:1730 }, parallax_sight:{ x:2620, y:1590 }, coolant_chapel:{ x:2680, y:1880 }, recoil_sanctum:{ x:2360, y:2110 },
  special_sync:{ x:3060, y:1730 }, clash_calculus:{ x:3010, y:2160 }, muzzle_choir:{ x:3350, y:1910 }, counter_gospel:{ x:3460, y:2440 },
  ordnance_doctrine:{ x:3180, y:2630 }, terminal_firing_table:{ x:3540, y:2820 }, eclipse_rangefinder:{ x:3360, y:2920 }, interdiction_choir:{ x:3680, y:2290 },
  salvage_prayer:{ x:1540, y:1740 }, supply_liturgy:{ x:1170, y:1880 }, vault_cartography:{ x:1490, y:2110 }, after_action_tithe:{ x:1080, y:1600 },
  repair_canticle:{ x:780, y:2150 }, reroll_writ:{ x:1240, y:2460 }, field_sanctuary:{ x:480, y:2520 }, black_box_routes:{ x:1640, y:2660 },
  saint_cache:{ x:950, y:2840 }, moon_tithe:{ x:260, y:2780 }, pilgrimage_index:{ x:650, y:1490 }, ashen_caravan:{ x:500, y:1240 }, mercy_accountant:{ x:1470, y:2920 },
  iron_procession_fruit:{ x:2570, y:1320 }, munition_tithe_fruit:{ x:2300, y:2570 }, pilgrim_chassis_fruit:{ x:1260, y:1260 }, triune_sanctum_fruit:{ x:1900, y:2920 },
};

const TANK_EVOLUTION = {
  spread: [
    { name:'夢想散華', icon:'MSK', bonus:'扩散密度提升', cost:180, effect(t){ t.bulletCount += 1; t.spreadAngle *= 0.94; } },
    { name:'結界弹阵', icon:'KAI', bonus:'稳定穿刺阵列', cost:320, effect(t){ t.bulletCount += 1; t.pierceDamageBonus = (t.pierceDamageBonus || 0) + 1; } },
  ],
  focus: [
    { name:'極限火花', icon:'IGN', bonus:'主炮输出强化', cost:180, effect(t){ t.bulletDamage += 1; t.bulletSpeed += 0.2; } },
    { name:'星脉贯穿', icon:'AST', bonus:'电磁压缩束', cost:320, effect(t){ t.railgunSpeedBonus = (t.railgunSpeedBonus || 0) + 0.3; t.shootDelay = Math.max(14, t.shootDelay - 1); } },
  ],
  wide: [
    { name:'永恆凍土', icon:'FRZ', bonus:'冰域滞留延长', cost:180, effect(t){ t.freezeDurationMul = (t.freezeDurationMul || 1) * 1.25; } },
    { name:'霜华矩阵', icon:'RIM', bonus:'广域压制稳定', cost:320, effect(t){ t.bulletCount += 1; t.spreadAngle *= 0.95; } },
  ],
  burst: [
    { name:'終焉爆碎', icon:'END', bonus:'爆燃半径提升', cost:180, effect(t){ t.explosionRadiusBonus = (t.explosionRadiusBonus || 0) + 0.18; } },
    { name:'灼界轰芯', icon:'PYR', bonus:'连爆节奏优化', cost:320, effect(t){ t.bulletDamage += 1; t.shootDelay = Math.max(34, t.shootDelay - 3); } },
  ],
  sniper: [
    { name:'神域狙擊', icon:'JDG', bonus:'狙击校准增强', cost:180, effect(t){ t.bulletDamage += 1; t.bulletSpeed += 0.35; } },
    { name:'天穹锁定', icon:'SKY', bonus:'终端追猎弹道', cost:320, effect(t){ t.sniperSpecialHoming = true; t.specialInterval = Math.max(2, (t.specialInterval || 3)); } },
  ],
  homing: [
    { name:'命運導引', icon:'FAT', bonus:'导引回路强化', cost:180, effect(t){ t.baseHomingStrength = Math.max(t.baseHomingStrength || 0, 0.018); } },
    { name:'星轨追猎', icon:'ORB', bonus:'多目标锁定优化', cost:320, effect(t){ t.bulletCount += 1; t.baseHomingStrength = Math.max(t.baseHomingStrength || 0, 0.028); } },
  ],
  border: [
    { name:'隙间回廊', icon:'GAP', bonus:'折射弹获得更稳定的追猎角', cost:210, effect(t){ t.riftBounceBonus = (t.riftBounceBonus || 0) + 1; t.riftHoming = Math.max(t.riftHoming || 0, 0.042); } },
    { name:'边界终端', icon:'LIM', bonus:'装填结构轻量化，特弹周期微调', cost:380, effect(t){ t.reloadTime = Math.max(108, t.reloadTime - 8); t.specialInterval = Math.max(3, (t.specialInterval || 4) - 1); t.riftSpeedBonus = (t.riftSpeedBonus || 0) + 0.12; } },
  ],
  blade: [
    { name:'半灵斩轨', icon:'HNR', bonus:'斩击弹速与轻装机动提升', cost:240, effect(t){ t.slashSpeedBonus = (t.slashSpeedBonus || 0) + 0.14; t.speed += 0.03; t.reloadTime = Math.max(102, t.reloadTime - 4); } },
    { name:'楼观终式', icon:'ROU', bonus:'碎刃展开，穿刺判定强化', cost:430, effect(t){ t.slashShardBonus = (t.slashShardBonus || 0) + 1; t.specialInterval = Math.max(4, (t.specialInterval || 5) - 1); t.pierceDamageBonus = (t.pierceDamageBonus || 0) + 1; } },
  ],
  scarlet: [
    { name:'红雾圣枪', icon:'VLA', bonus:'血枪弹速与汲取协议提升', cost:260, effect(t){ t.lanceSpeedBonus = (t.lanceSpeedBonus || 0) + 0.2; t.lanceDrainBonus = (t.lanceDrainBonus || 0) + 0.08; t.hpBonus += 1; } },
    { name:'绯月断罪', icon:'CRI', bonus:'低频高压穿刺，装填缩短', cost:460, effect(t){ t.lanceDamageBonus = (t.lanceDamageBonus || 0) + 1; t.reloadTime = Math.max(124, t.reloadTime - 8); t.specialInterval = Math.max(3, (t.specialInterval || 4) - 1); } },
  ],
  astral: [
    { name:'五曜星盘', icon:'GYO', bonus:'星仪折返与术式冻结增强', cost:250, effect(t){ t.orbitBounceBonus = (t.orbitBounceBonus || 0) + 1; t.orbitHoming = Math.max(t.orbitHoming || 0, 0.032); t.freezeDurationMul = (t.freezeDurationMul || 1) * 1.1; } },
    { name:'贤者天球', icon:'SPH', bonus:'轨道修正，慢速控场稳定化', cost:440, effect(t){ t.orbitSpeedBonus = (t.orbitSpeedBonus || 0) + 0.1; t.orbitHoming = Math.max(t.orbitHoming || 0, 0.04); t.reloadTime = Math.max(122, t.reloadTime - 6); } },
  ],
};

// --- Per-Tank Unique Upgrades ---
const TANK_UPGRADE_DEFS = {
  spread: [
    { id:'bullets', name:'散华装填', icon:'⬣', desc:'子弹+1', max:4, costBase:26, effect(t){ t.bulletCount+=1; } },
    { id:'spread', name:'扇面修正', icon:'⌯', desc:'扩散角-7%', max:4, costBase:24, effect(t){ t.spreadAngle*=0.93; } },
    { id:'speed', name:'履带调校', icon:'⇢', desc:'移速+0.04', max:4, costBase:22, effect(t){ t.speed+=0.04; } },
    { id:'core', name:'共鸣核心', icon:'◌', desc:'特殊弹伤+1', max:3, costBase:30, effect(t){ t.pierceDamageBonus = (t.pierceDamageBonus || 0) + 1; } },
    { id:'armor', name:'机壳稳固', icon:'▣', desc:'HP+1', max:3, costBase:24, effect(t){ t.hpBonus+=1; } },
  ],
  focus: [
    { id:'dmg', name:'聚能炮芯', icon:'✦', desc:'伤害+1', max:4, costBase:30, effect(t){ t.bulletDamage+=1; } },
    { id:'firerate', name:'冷却回路', icon:'▸', desc:'冷却-1帧', max:4, costBase:28, effect(t){ t.shootDelay=Math.max(14,t.shootDelay-1); } },
    { id:'railgun', name:'磁轨整流', icon:'⟐', desc:'电磁炮+0.2速', max:4, costBase:28, effect(t){ t.railgunSpeedBonus = (t.railgunSpeedBonus || 0) + 0.2; } },
    { id:'mobility', name:'姿态喷口', icon:'⇢', desc:'移速+0.03', max:3, costBase:24, effect(t){ t.speed+=0.03; } },
    { id:'stability', name:'射控稳定', icon:'⌁', desc:'弹速+0.15', max:3, costBase:24, effect(t){ t.bulletSpeed+=0.15; } },
  ],
  wide: [
    { id:'bullets', name:'扇区扩展', icon:'◫', desc:'子弹+1', max:4, costBase:28, effect(t){ t.bulletCount+=1; } },
    { id:'freeze', name:'低温堆栈', icon:'❄', desc:'冰冻+0.35秒', max:4, costBase:26, effect(t){ t.freezeDurationBonus = (t.freezeDurationBonus || 0) + 21; } },
    { id:'hp', name:'装甲层叠', icon:'▣', desc:'HP+1', max:4, costBase:24, effect(t){ t.hpBonus+=1; } },
    { id:'spread', name:'覆盖修正', icon:'⌯', desc:'扩散角+3%', max:3, costBase:22, effect(t){ t.spreadAngle+=0.03; } },
    { id:'speed', name:'悬挂减重', icon:'⇢', desc:'移速+0.03', max:3, costBase:22, effect(t){ t.speed+=0.03; } },
  ],
  burst: [
    { id:'explosion', name:'燃爆外壳', icon:'✹', desc:'爆炸+10%', max:4, costBase:28, effect(t){ t.explosionRadiusBonus = (t.explosionRadiusBonus || 0) + 0.1; } },
    { id:'dmg', name:'战斗部装填', icon:'✦', desc:'伤害+1', max:4, costBase:28, effect(t){ t.bulletDamage+=1; } },
    { id:'bullets', name:'散群火箭', icon:'⬢', desc:'子弹+1', max:4, costBase:26, effect(t){ t.bulletCount+=1; } },
    { id:'firerate', name:'抛射节律', icon:'⇆', desc:'冷却-2帧', max:3, costBase:30, effect(t){ t.shootDelay=Math.max(36,t.shootDelay-2); } },
    { id:'speed', name:'机体稳推', icon:'⇢', desc:'移速+0.03', max:3, costBase:22, effect(t){ t.speed+=0.03; } },
  ],
  sniper: [
    { id:'dmg', name:'贯穿聚焦', icon:'⟐', desc:'伤害+1', max:4, costBase:34, effect(t){ t.bulletDamage+=1; } },
    { id:'speed', name:'超音弹道', icon:'⇢', desc:'弹速+0.35', max:4, costBase:30, effect(t){ t.bulletSpeed+=0.35; } },
    { id:'special', name:'特弹校准', icon:'⌁', desc:'特殊弹-1', max:2, costBase:42, effect(t){ t.specialInterval=Math.max(2,(t.specialInterval||3)-1); } },
    { id:'firerate', name:'枪机回位', icon:'⇆', desc:'冷却-2帧', max:3, costBase:32, effect(t){ t.shootDelay=Math.max(40,t.shootDelay-2); } },
    { id:'stability', name:'轻量底盘', icon:'▣', desc:'移速+0.03', max:3, costBase:22, effect(t){ t.speed+=0.03; } },
  ],
  homing: [
    { id:'tracking', name:'导引回路', icon:'◉', desc:'追踪+0.008', max:4, costBase:28, effect(t){ t.baseHomingStrength = (t.baseHomingStrength || 0) + 0.008; } },
    { id:'speed', name:'矢量推进', icon:'⇢', desc:'弹速+0.18', max:4, costBase:24, effect(t){ t.bulletSpeed+=0.18; } },
    { id:'bullets', name:'多锁蜂群', icon:'⬡', desc:'子弹+1', max:4, costBase:28, effect(t){ t.bulletCount+=1; } },
    { id:'firerate', name:'联机校准', icon:'⇆', desc:'冷却-1帧', max:4, costBase:24, effect(t){ t.shootDelay=Math.max(28,t.shootDelay-1); } },
    { id:'armor', name:'导航外壳', icon:'▣', desc:'HP+1', max:3, costBase:24, effect(t){ t.hpBonus+=1; } },
  ],
  border: [
    { id:'rift', name:'隙间棱镜', icon:'◇', desc:'折射追踪+0.006', max:4, costBase:30, effect(t){ t.riftHoming = (t.riftHoming || 0.032) + 0.006; } },
    { id:'phase', name:'相位回廊', icon:'⌁', desc:'弹速+0.14', max:4, costBase:26, effect(t){ t.bulletSpeed += 0.14; } },
    { id:'firerate', name:'边界闸门', icon:'⇆', desc:'冷却-1帧', max:3, costBase:28, effect(t){ t.shootDelay = Math.max(34, t.shootDelay - 1); } },
    { id:'seal', name:'结界封钉', icon:'⬡', desc:'装填-3帧', max:3, costBase:28, effect(t){ t.reloadTime = Math.max(110, t.reloadTime - 3); } },
    { id:'speed', name:'裂隙步进', icon:'⇢', desc:'移速+0.03', max:4, costBase:24, effect(t){ t.speed += 0.03; } },
  ],
  blade: [
    { id:'slash', name:'魂刃导轨', icon:'KAT', desc:'斩击弹速+0.10', max:4, costBase:30, effect(t){ t.slashSpeedBonus = (t.slashSpeedBonus || 0) + 0.1; } },
    { id:'speed', name:'半灵履带', icon:'MOV', desc:'移速+0.035', max:4, costBase:26, effect(t){ t.speed += 0.035; } },
    { id:'firerate', name:'居合联锁', icon:'CYC', desc:'冷却-1帧', max:3, costBase:30, effect(t){ t.shootDelay = Math.max(20, t.shootDelay - 1); } },
    { id:'sheath', name:'白楼鞘仓', icon:'SHD', desc:'装填-4帧', max:3, costBase:28, effect(t){ t.reloadTime = Math.max(96, t.reloadTime - 4); } },
    { id:'armor', name:'轻甲骨架', icon:'ARM', desc:'HP+1', max:3, costBase:24, effect(t){ t.hpBonus += 1; } },
  ],
  scarlet: [
    { id:'lance', name:'红枪磁轨', icon:'LNC', desc:'血枪弹速+0.18', max:4, costBase:32, effect(t){ t.lanceSpeedBonus = (t.lanceSpeedBonus || 0) + 0.18; } },
    { id:'blood', name:'汲血回路', icon:'RED', desc:'命中汲取+5%', max:3, costBase:34, effect(t){ t.lanceDrainBonus = (t.lanceDrainBonus || 0) + 0.05; } },
    { id:'dmg', name:'绯枪弹芯', icon:'DMG', desc:'基础伤害+1', max:3, costBase:38, effect(t){ t.bulletDamage += 1; } },
    { id:'armor', name:'红雾装甲', icon:'ARM', desc:'HP+1', max:4, costBase:28, effect(t){ t.hpBonus += 1; } },
    { id:'ritual', name:'夜仪装填', icon:'RIT', desc:'装填-5帧', max:3, costBase:32, effect(t){ t.reloadTime = Math.max(120, t.reloadTime - 5); } },
  ],
  astral: [
    { id:'orbit', name:'星仪环轨', icon:'ORB', desc:'折返追踪+0.005', max:4, costBase:30, effect(t){ t.orbitHoming = (t.orbitHoming || 0.026) + 0.005; } },
    { id:'tome', name:'贤者术册', icon:'TOM', desc:'冰冻+0.25秒', max:4, costBase:28, effect(t){ t.freezeDurationBonus = (t.freezeDurationBonus || 0) + 15; } },
    { id:'prism', name:'七曜棱镜', icon:'PRI', desc:'星仪弹速+0.08', max:4, costBase:28, effect(t){ t.orbitSpeedBonus = (t.orbitSpeedBonus || 0) + 0.08; } },
    { id:'hp', name:'静止结界', icon:'ARM', desc:'HP+1', max:3, costBase:26, effect(t){ t.hpBonus += 1; } },
    { id:'firerate', name:'星盘校时', icon:'CYC', desc:'冷却-1帧', max:3, costBase:30, effect(t){ t.shootDelay = Math.max(42, t.shootDelay - 1); } },
  ],
};
Object.keys(TANK_UPGRADE_DEFS).forEach(k => {
  (TANK_UPGRADE_DEFS[k] || []).forEach(def => {
    const firstGate = getFirstEvolutionRequirement(def);
    def.firstGate = firstGate;
    const originalMax = def.max;
    def.max = Math.max(def.max, firstGate * 3);
    if (!def._rawEffect) def._rawEffect = def.effect;
    def.effect = function(t) {
      const applied = t.__upgradeApplyCount && t.__upgradeApplyCount[def.id] ? t.__upgradeApplyCount[def.id] : 0;
      if (applied < originalMax) {
        def._rawEffect(t);
        return;
      }
      const before = { ...t };
      def._rawEffect(t);
      const softMul = 0.16;
      Object.keys(t).forEach(prop => {
        if (typeof before[prop] === 'number' && typeof t[prop] === 'number' && t[prop] !== before[prop]) {
          t[prop] = before[prop] + (t[prop] - before[prop]) * softMul;
        }
      });
    };
  });
});
const PROGRESSION_VERSION = 6;
const TANK_PROGRESS_KEY = 'tankbattle_progress_version';

function loadProgression() {
  try {
    coreFragments = parseInt(localStorage.getItem(FRAGMENT_KEY)) || 0;
    const ul = localStorage.getItem(TANK_UNLOCK_KEY);
    if (ul) unlockedTanks = new Set(JSON.parse(ul));
    else unlockedTanks = new Set(['spread']);
    const tp = localStorage.getItem(TANK_UNLOCK_PROGRESS_KEY);
    tankUnlockProgress = normalizeTankUnlockProgress(tp ? JSON.parse(tp) : {});
    const ug = localStorage.getItem(TANK_UPGRADE_KEY);
    tankUpgrades = ug ? JSON.parse(ug) : {};
    const ev = localStorage.getItem(TANK_EVOLVE_KEY);
    evolvedTanks = ev ? new Set(JSON.parse(ev)) : new Set();
    const gr = localStorage.getItem(GLOBAL_RESEARCH_KEY);
    globalResearch = normalizeGlobalResearch(gr ? JSON.parse(gr) : {});
    syncTankUnlockProgressFromAchievements(false);
    migrateProgressionIfNeeded();
    // Ensure all tanks have upgrade entries
    Object.keys(tankTypes).forEach(k => {
      const defs = TANK_UPGRADE_DEFS[k] || [];
      if (!tankUpgrades[k]) tankUpgrades[k] = {};
      defs.forEach(d => { if (tankUpgrades[k][d.id] === undefined) tankUpgrades[k][d.id] = 0; });
    });
    globalResearch = normalizeGlobalResearch(globalResearch);
  } catch(e) { resetProgression(); }
}
function saveProgression() {
  try {
    globalResearch = normalizeGlobalResearch(globalResearch);
    localStorage.setItem(FRAGMENT_KEY, coreFragments.toString());
    localStorage.setItem(TANK_UNLOCK_KEY, JSON.stringify([...unlockedTanks]));
    localStorage.setItem(TANK_UNLOCK_PROGRESS_KEY, JSON.stringify(tankUnlockProgress));
    localStorage.setItem(TANK_UPGRADE_KEY, JSON.stringify(tankUpgrades));
    localStorage.setItem(TANK_EVOLVE_KEY, JSON.stringify([...evolvedTanks]));
    localStorage.setItem(GLOBAL_RESEARCH_KEY, JSON.stringify(globalResearch));
    localStorage.setItem(TANK_PROGRESS_KEY, String(PROGRESSION_VERSION));
  } catch(e) {}
}
function resetProgression() {
  coreFragments = 0;
  unlockedTanks = new Set(['spread']);
  tankUnlockProgress = getDefaultTankUnlockProgress();
  tankUpgrades = {};
  globalResearch = normalizeGlobalResearch({});
  evolvedTanks = new Set();
  Object.keys(tankTypes).forEach(k => {
    tankUpgrades[k] = {};
    (TANK_UPGRADE_DEFS[k]||[]).forEach(d => { tankUpgrades[k][d.id] = 0; });
  });
}

function normalizeGlobalResearch(raw = {}) {
  const data = raw && typeof raw === 'object' ? raw : {};
  const next = {};
  GLOBAL_RESEARCH_DEFS.forEach(def => {
    const parsed = parseInt(data[def.id], 10);
    const level = Number.isFinite(parsed) ? parsed : 0;
    next[def.id] = Math.max(0, Math.min(def.max, level));
  });
  return next;
}

function getGlobalResearchDef(id) {
  return GLOBAL_RESEARCH_DEFS.find(def => def.id === id) || null;
}

function getGlobalResearchLevel(id) {
  const def = getGlobalResearchDef(id);
  if (!def) return 0;
  return Math.max(0, Math.min(def.max, parseInt((globalResearch || {})[id], 10) || 0));
}

function getGlobalResearchCost(id) {
  const def = getGlobalResearchDef(id);
  if (!def) return 9999;
  const lvl = getGlobalResearchLevel(id);
  if (lvl >= def.max) return 9999;
  const rowPressure = Math.max(0, (def.row || 1) - 1) * 42;
  return Math.floor(def.costBase * Math.pow(1.58, lvl) + lvl * 58 + rowPressure);
}

function getGlobalResearchTotalLevel() {
  return GLOBAL_RESEARCH_DEFS.reduce((sum, def) => sum + getGlobalResearchLevel(def.id), 0);
}

function getGlobalResearchMaxLevel() {
  return GLOBAL_RESEARCH_DEFS.reduce((sum, def) => sum + def.max, 0);
}

function getGlobalResearchBranch(id) {
  return GLOBAL_RESEARCH_BRANCHES.find(b => b.id === id) || GLOBAL_RESEARCH_BRANCHES[0];
}

function getGlobalResearchBranchByDef(def) {
  return getGlobalResearchBranch((def && def.branch) || 'body');
}

function parseRgbTriple(rgb, fallback = [246, 229, 170]) {
  if (Array.isArray(rgb)) return rgb;
  const parts = String(rgb || '').split(',').map(v => parseInt(v.trim(), 10));
  return parts.length === 3 && parts.every(Number.isFinite) ? parts : fallback;
}

function mixRgbTriples(a, b, weight = 0.5) {
  const left = parseRgbTriple(a);
  const right = parseRgbTriple(b);
  const w = Math.max(0, Math.min(1, weight));
  return left.map((v, i) => Math.round(v * (1 - w) + right[i] * w));
}

function rgbTripleToString(rgb) {
  return parseRgbTriple(rgb).join(',');
}

function getGlobalResearchBlendBranches(def) {
  const ids = def && Array.isArray(def.blend) && def.blend.length ? def.blend : [((def && def.branch) || 'body')];
  return ids.map(id => getGlobalResearchBranch(id)).filter(Boolean);
}

function getGlobalResearchVisual(def) {
  const branches = getGlobalResearchBlendBranches(def);
  const primary = branches[0] || getGlobalResearchBranchByDef(def);
  const secondary = branches[1] || primary;
  const row = Math.max(1, Math.min(8, (def && def.row) || 1));
  const depth = (row - 1) / 7;
  const baseA = parseRgbTriple(primary.rgb);
  const baseB = parseRgbTriple(secondary.rgb);
  const branchOrder = { body: 0, ordnance: 1, logistics: 2, conflux: 3 };
  const wheelShift = ((branchOrder[(def && def.branch) || primary.id] || 0) * 0.16) + depth * 0.18;
  const wheelMix = mixRgbTriples(baseA, baseB, Math.min(0.72, 0.28 + wheelShift));
  const deepTone = mixRgbTriples(wheelMix, [3, 7, 12], Math.min(0.52, depth * 0.42));
  const secondaryTone = branches.length > 1
    ? mixRgbTriples(baseB, wheelMix, 0.34)
    : mixRgbTriples(wheelMix, [246, 229, 170], Math.max(0.08, 0.2 - depth * 0.08));
  return {
    primary: rgbTripleToString(deepTone),
    secondary: rgbTripleToString(secondaryTone),
    link: rgbTripleToString(mixRgbTriples(deepTone, secondaryTone, 0.4)),
    alpha: (0.075 + depth * 0.09).toFixed(3),
    bgAlpha: (0.64 + depth * 0.2).toFixed(3),
    borderAlpha: (0.18 + depth * 0.28).toFixed(3),
    glow: (0.08 + depth * 0.1).toFixed(3),
    depth: row,
    isConflux: branches.length > 1 || (def && def.branch === 'conflux'),
  };
}

function getGlobalResearchPrereqEntries(def) {
  return def && def.prereq ? Object.keys(def.prereq).map(id => [id, 1]) : [];
}

function isGlobalResearchVisible(def) {
  if (!def) return false;
  return getGlobalResearchPrereqEntries(def).every(([id, required]) => getGlobalResearchLevel(id) >= required);
}

function getGlobalResearchLockReason(def) {
  if (!def || !def.prereq) return '';
  const missing = getGlobalResearchPrereqEntries(def)
    .filter(([id, required]) => getGlobalResearchLevel(id) < required)
    .map(([id, required]) => {
      const pre = getGlobalResearchDef(id);
      return (pre ? pre.name : id) + ' LV ' + required;
    });
  return missing.length ? '需要先点亮：' + missing.join(' / ') : '';
}

function canPurchaseGlobalResearch(id) {
  const def = getGlobalResearchDef(id);
  if (!def) return false;
  return getGlobalResearchLevel(id) < def.max && !getGlobalResearchLockReason(def);
}

function getSalvageResearchMultiplier() {
  return 1 + getGlobalResearchLevel('salvage_prayer') * 0.008 + getGlobalResearchLevel('moon_tithe') * 0.012 + getGlobalResearchLevel('pilgrimage_index') * 0.006 + getGlobalResearchLevel('ashen_caravan') * 0.005 + getGlobalResearchLevel('pilgrim_chassis_fruit') * 0.004 + getGlobalResearchLevel('triune_sanctum_fruit') * 0.004;
}

function getVaultResearchMultiplier() {
  return 1 + getGlobalResearchLevel('vault_cartography') * 0.008 + getGlobalResearchLevel('moon_tithe') * 0.012 + getGlobalResearchLevel('saint_cache') * 0.006 + getGlobalResearchLevel('pilgrimage_index') * 0.006;
}

function getGlobalSupplyDropMultiplier() {
  return 1 + getGlobalResearchLevel('supply_liturgy') * 0.008 + getGlobalResearchLevel('field_sanctuary') * 0.006 + getGlobalResearchLevel('saint_cache') * 0.007 + getGlobalResearchLevel('ashen_caravan') * 0.0035;
}

function getGlobalRepairChance() {
  return getGlobalResearchLevel('repair_canticle') * 0.004 + getGlobalResearchLevel('field_sanctuary') * 0.003 + getGlobalResearchLevel('mercy_accountant') * 0.0025;
}

function getGlobalRerollDiscount() {
  return Math.min(0.18, getGlobalResearchLevel('reroll_writ') * 0.022 + getGlobalResearchLevel('black_box_routes') * 0.012 + getGlobalResearchLevel('mercy_accountant') * 0.008);
}

function getGlobalClashPowerBonus() {
  return Math.min(2, Math.floor((getGlobalResearchLevel('clash_calculus') + getGlobalResearchLevel('counter_gospel') + getGlobalResearchLevel('interdiction_choir') + getGlobalResearchLevel('munition_tithe_fruit')) / 3));
}

function getGlobalRunXpMultiplier() {
  return 1 + getGlobalResearchLevel('after_action_tithe') * 0.01 + getGlobalResearchLevel('pilgrimage_index') * 0.014 + getGlobalResearchLevel('munition_tithe_fruit') * 0.008;
}

function scaleBattleMoonstoneGain(amount, multiplier) {
  const raw = Math.max(0, amount) * Math.max(1, multiplier || 1);
  const whole = Math.floor(raw);
  const fraction = raw - whole;
  return Math.max(1, whole + (rng() < fraction ? 1 : 0));
}

function applyGlobalResearchToTank(t) {
  GLOBAL_RESEARCH_DEFS.forEach(def => {
    const lvl = getGlobalResearchLevel(def.id);
    if (lvl > 0 && typeof def.apply === 'function') {
      try { def.apply(t, lvl); } catch(e) {}
    }
  });
}

function purchaseGlobalResearch(id) {
  globalResearch = normalizeGlobalResearch(globalResearch);
  const def = getGlobalResearchDef(id);
  if (!def) return false;
  const lock = getGlobalResearchLockReason(def);
  if (lock) {
    showAchievementToast('LOCK', '协议尚未接通', lock, '#8ce8ff');
    return false;
  }
  const lvl = getGlobalResearchLevel(id);
  if (lvl >= def.max) return false;
  const cost = getGlobalResearchCost(id);
  if (coreFragments < cost) {
    showAchievementToast('MS', '月光石不足', def.name + ' 需要 ' + cost + ' MOONSTONE', '#ff6767');
    return false;
  }
  coreFragments -= cost;
  globalResearch[id] = lvl + 1;
  saveProgression();
  checkAchievements();
  sfxPowerUp();
  showAchievementToast(def.code, '全域协议点亮', def.name + ' Lv.' + globalResearch[id], '#f6e5aa');
  renderLabUI();
  renderProtocolTree();
  return true;
}

function getDefaultTankUnlockProgress() {
  return { maxWave: 0, maxEliteKills: 0, bossKills: 0, dailyClears: 0, borderEcho: false };
}

function normalizeTankUnlockProgress(raw) {
  const base = getDefaultTankUnlockProgress();
  const data = raw && typeof raw === 'object' ? raw : {};
  return {
    maxWave: Math.max(0, parseInt(data.maxWave, 10) || base.maxWave),
    maxEliteKills: Math.max(0, parseInt(data.maxEliteKills, 10) || base.maxEliteKills),
    bossKills: Math.max(0, parseInt(data.bossKills, 10) || base.bossKills),
    dailyClears: Math.max(0, parseInt(data.dailyClears, 10) || base.dailyClears),
    borderEcho: !!data.borderEcho,
  };
}

function updateTankUnlockProgress(updates, persist = true) {
  tankUnlockProgress = normalizeTankUnlockProgress(tankUnlockProgress);
  let changed = false;
  Object.entries(updates || {}).forEach(([key, value]) => {
    if (key === 'borderEcho') {
      const next = !!value || tankUnlockProgress.borderEcho;
      if (next !== tankUnlockProgress.borderEcho) {
        tankUnlockProgress.borderEcho = next;
        changed = true;
      }
      return;
    }
    const next = Math.max(tankUnlockProgress[key] || 0, parseInt(value, 10) || 0);
    if (next !== tankUnlockProgress[key]) {
      tankUnlockProgress[key] = next;
      changed = true;
    }
  });
  if (changed && persist) saveProgression();
  return changed;
}

function syncTankUnlockProgressFromAchievements(persist = true) {
  const updates = {};
  if (unlockedAchievements.has('survivor')) updates.maxWave = 5;
  if (unlockedAchievements.has('tenacious')) updates.maxWave = 10;
  if (unlockedAchievements.has('wave_15')) updates.maxWave = 15;
  if (unlockedAchievements.has('wave_20')) updates.maxWave = 20;
  if (unlockedAchievements.has('wave_25')) updates.maxWave = 25;
  if (unlockedAchievements.has('wave_30')) updates.maxWave = 30;
  if (unlockedAchievements.has('elite_hunter')) updates.maxEliteKills = 10;
  if (unlockedAchievements.has('elite_hunter_25')) updates.maxEliteKills = 25;
  if (unlockedAchievements.has('elite_hunter_40')) updates.maxEliteKills = 40;
  if (unlockedAchievements.has('boss_breaker') || unlockedAchievements.has('wave_15')) updates.bossKills = 1;
  if (unlockedAchievements.has('daily_clear')) updates.dailyClears = 1;
  if (unlockedAchievements.has('boss_breaker') || unlockedAchievements.has('wave_15')) updates.borderEcho = true;
  return updateTankUnlockProgress(updates, persist);
}

function getEvolutionLevel(tank) {
  const evoEntries = TANK_EVOLUTION[tank] || [];
  const marker = [...evolvedTanks].find(v => v === tank || v.startsWith(tank + ':'));
  if (!marker) return 0;
  if (marker === tank) return Math.min(1, evoEntries.length);
  const parts = marker.split(':');
  const lvl = parseInt(parts[1], 10);
  return Number.isFinite(lvl) ? Math.max(0, Math.min(evoEntries.length, lvl)) : 0;
}

function setEvolutionLevel(tank, level) {
  [...evolvedTanks].forEach(v => {
    if (v === tank || v.startsWith(tank + ':')) evolvedTanks.delete(v);
  });
  if (level > 0) evolvedTanks.add(tank + ':' + level);
}

function migrateProgressionIfNeeded() {
  const version = parseInt(localStorage.getItem(TANK_PROGRESS_KEY) || '1', 10);
  if (version >= PROGRESSION_VERSION) return;
  Object.keys(tankTypes).forEach(k => {
    if (!tankUpgrades[k]) tankUpgrades[k] = {};
    (TANK_UPGRADE_DEFS[k] || []).forEach(def => {
      const current = tankUpgrades[k][def.id] || 0;
      tankUpgrades[k][def.id] = Math.min(current, def.max);
    });
    const legacyEvolved = evolvedTanks.has(k);
    if (legacyEvolved) setEvolutionLevel(k, 1);
    const evoLevel = getEvolutionLevel(k);
    if (version < 3 && evoLevel === 0) {
      (TANK_UPGRADE_DEFS[k] || []).forEach(def => {
        const cap = getCurrentPartCap(def, 0);
        tankUpgrades[k][def.id] = Math.min(tankUpgrades[k][def.id] || 0, cap);
      });
    }
  });
  [...evolvedTanks].forEach(v => {
    if (!v.includes(':') && !tankTypes[v]) evolvedTanks.delete(v);
  });
}

function earnFragments(amount) {
  coreFragments += amount;
  saveProgression();
  const toast = document.getElementById('achieve-toast');
  toast.querySelector('.achieve-icon').textContent = 'MS';
  toast.querySelector('.achieve-name').textContent = '+' + amount + ' 月光石';
  toast.querySelector('.achieve-label').textContent = '总计: ' + coreFragments;
  toast.querySelector('.achieve-name').style.color = '#da0';
  toast.style.display = 'block'; toast.style.animation = 'none'; toast.offsetHeight;
  toast.style.animation = 'toastIn 0.4s ease-out';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => { toast.style.display = 'none'; }, 2500);
}

function canUnlockTank(tankType) {
  if (unlockedTanks.has(tankType)) return true;
  const cond = TANK_UNLOCK_CONDITIONS[tankType];
  if (!cond) return false;
  if (cond.cost === 0) return true;
  return getTankUnlockConditionStatus(tankType).met || coreFragments >= cond.cost;
}

function getTankUnlockConditionStatus(tankType) {
  tankUnlockProgress = normalizeTankUnlockProgress(tankUnlockProgress);
  const maxWaveSeen = Math.max(tankUnlockProgress.maxWave || 0, wave || 0);
  const maxEliteSeen = Math.max(tankUnlockProgress.maxEliteKills || 0, sessionEliteKills || 0);
  const dailyDone = (tankUnlockProgress.dailyClears || 0) > 0 || dailyCompletedToday || dailyTargetAchieved;
  const borderEchoSeen = tankUnlockProgress.borderEcho || maxWaveSeen >= 12 || (tankUnlockProgress.bossKills || 0) >= 2;
  const combo35Seen = maxComboReached >= 35 || unlockedAchievements.has('combo_35');
  const score10000Seen = score >= 10000 || unlockedAchievements.has('score_10000');
  const wave20Seen = maxWaveSeen >= 20 || unlockedAchievements.has('wave_20');
  switch (tankType) {
    case 'spread': return { met: true, label: '初始机体' };
    case 'focus': return { met: maxWaveSeen >= 5, label: '已到达第5波' };
    case 'wide': return { met: maxWaveSeen >= 8, label: '已到达第8波' };
    case 'burst': return { met: maxEliteSeen >= 5, label: '单局精英击杀已达5' };
    case 'sniper': return { met: (tankUnlockProgress.bossKills || 0) >= 1, label: 'Boss击杀记录已归档' };
    case 'homing': return { met: dailyDone, label: '每日挑战已完成' };
    case 'border': return { met: borderEchoSeen, label: '境界残响已观测' };
    case 'blade': return { met: combo35Seen, label: '35连击记录已归档' };
    case 'scarlet': return { met: score10000Seen, label: '10000分战斗记录已归档' };
    case 'astral': return { met: wave20Seen, label: '第20波观测记录已归档' };
    default: return { met: false, label: '' };
  }
}

function tryUnlockTank(tankType) {
  if (unlockedTanks.has(tankType)) return true;
  const cond = TANK_UNLOCK_CONDITIONS[tankType];
  if (!cond) return false;
  if (cond.cost === 0 || getTankUnlockConditionStatus(tankType).met) {
    unlockedTanks.add(tankType);
    saveProgression();
    checkAchievements();
    sfxAchievement();
    showAchievementToast('KEY', '机体解锁', (tankTypes[tankType]?.name || tankType) + ' 已授权出击', '#f6e5aa');
    return true;
  }
  if (coreFragments >= cond.cost) {
    coreFragments -= cond.cost;
    unlockedTanks.add(tankType);
    saveProgression();
    checkAchievements();
    sfxAchievement();
    showAchievementToast('MS', '机体解锁', (tankTypes[tankType]?.name || tankType) + ' 已授权出击', '#f6e5aa');
    return true;
  }
  return false;
}

function getTankUpgradeCost(tank, statId) {
  const def = (TANK_UPGRADE_DEFS[tank] || []).find(d => d.id === statId);
  if (!def) return 999;
  const lvl = (tankUpgrades[tank] && tankUpgrades[tank][statId]) || 0;
  const firstGate = getFirstEvolutionRequirement(def);
  const stageMul = lvl >= firstGate ? 1.72 : 1;
  const stageTax = lvl >= firstGate ? (lvl - firstGate + 1) * 12 : 0;
  return Math.floor((def.costBase * Math.pow(1.31, lvl) + lvl * 9 + stageTax) * stageMul);
}

function getUpgradePartCode(def) {
  return LAB_PART_CODES[def?.id] || String(def?.id || 'MOD').slice(0, 3).toUpperCase();
}

function getFirstEvolutionRequirement(def) {
  if (Number.isFinite(def.firstGate)) return def.firstGate;
  return Math.max(1, Math.min(def.max, Math.ceil(def.max * 0.6)));
}

function getStageRequirementForPart(def, evoLevel) {
  if (evoLevel <= 0) return getFirstEvolutionRequirement(def);
  if (evoLevel === 1) return def.max;
  return def.max;
}

function getCurrentPartCap(def, evoLevel) {
  if (evoLevel <= 0) return getFirstEvolutionRequirement(def);
  return def.max;
}

function getTotalLevelsForStage(def, evoLevel) {
  if (evoLevel <= 0) return getFirstEvolutionRequirement(def);
  return Math.max(1, def.max - getFirstEvolutionRequirement(def));
}

function getTankStageStatus(tank) {
  const defs = TANK_UPGRADE_DEFS[tank] || [];
  const ug = tankUpgrades[tank] || {};
  const evoLevel = getEvolutionLevel(tank);
  const nextLevel = Math.min(evoLevel + 1, (TANK_EVOLUTION[tank] || []).length);
  const partStatus = defs.map(def => {
    const lvl = ug[def.id] || 0;
    const gate = getStageRequirementForPart(def, evoLevel);
    const cap = getCurrentPartCap(def, evoLevel);
    const floor = evoLevel <= 0 ? 0 : getFirstEvolutionRequirement(def);
    const stageProgress = Math.max(0, lvl - floor);
    const stageTotal = getTotalLevelsForStage(def, evoLevel);
    return { def, lvl, gate, cap, floor, stageProgress, stageTotal, ready: lvl >= gate, capped: lvl >= cap, fullyCapped: lvl >= def.max };
  });
  const readyParts = partStatus.filter(p => p.ready).length;
  return {
    evoLevel,
    nextLevel,
    partStatus,
    readyParts,
    totalParts: defs.length,
    ready: defs.length > 0 && readyParts === defs.length,
  };
}

function purchaseTankUpgrade(tank, statId) {
  if (!unlockedTanks.has(tank)) return;
  const def = (TANK_UPGRADE_DEFS[tank] || []).find(d => d.id === statId);
  if (!def) return;
  const lvl = (tankUpgrades[tank] && tankUpgrades[tank][statId]) || 0;
  const stageCap = getCurrentPartCap(def, getEvolutionLevel(tank));
  if (lvl >= stageCap) return;
  const cost = getTankUpgradeCost(tank, statId);
  if (coreFragments < cost) {
    // Flash the fragment display
    const fragEl = document.getElementById('lab-fragments');
    if (fragEl) { fragEl.style.color = '#f44'; setTimeout(() => { fragEl.style.color = '#da0'; }, 800); }
    return;
  }
  coreFragments -= cost;
  if (!tankUpgrades[tank]) tankUpgrades[tank] = {};
  tankUpgrades[tank][statId] = (tankUpgrades[tank][statId] || 0) + 1;
  saveProgression();
  checkAchievements();
  renderLabUI();
  sfxPowerUp();
}

function canEvolve(tank) {
  const evoLevel = getEvolutionLevel(tank);
  const evoEntries = TANK_EVOLUTION[tank] || [];
  if (evoLevel >= evoEntries.length) return false;
  return getTankStageStatus(tank).ready;
}
function tryEvolveTank(tank) {
  if (!canEvolve(tank)) return false;
  const evoLevel = getEvolutionLevel(tank);
  const evo = (TANK_EVOLUTION[tank] || [])[evoLevel];
  if (!evo) return false;
  if (coreFragments < evo.cost) return false;
  coreFragments -= evo.cost;
  setEvolutionLevel(tank, evoLevel + 1);
  saveProgression();
  checkAchievements();
  sfxAchievement();
  renderLabUI();
  return true;
}

function getPlayerTankDefinition(tankType) {
  const baseDef = tankTypes[tankType] || tankTypes.spread;
  const ug = tankUpgrades[tankType] || {};
  const t = {
    ...baseDef,
    explosionRadiusBonus: 0,
    freezeDurationBonus: 0,
    freezeDurationMul: 1,
    baseHomingStrength: 0,
    sniperSpecialHoming: false,
    railgunSpeedBonus: 0,
    pierceDamageBonus: 0,
  };
  const evoLevel = getEvolutionLevel(tankType);
  t.evoLevel = evoLevel;
  t.labMark = LAB_TANK_MARKS[tankType] || LAB_TANK_MARKS.spread;
  const defs = TANK_UPGRADE_DEFS[tankType] || [];
  defs.forEach(d => {
    const lvl = ug[d.id] || 0;
    for (let i = 0; i < lvl; i++) {
      t.__upgradeApplyCount = t.__upgradeApplyCount || {};
      t.__upgradeApplyCount[d.id] = i;
      try { d.effect(t); } catch(e) {}
    }
  });
  delete t.__upgradeApplyCount;
  const evoEntries = TANK_EVOLUTION[tankType] || [];
  for (let i = 0; i < evoLevel; i++) {
    const evo = evoEntries[i];
    if (evo && evo.effect) evo.effect(t);
  }
  applyGlobalResearchToTank(t);
  t.visualScale = getTankFormFactor(tankType, evoLevel, 'visual');
  t.hitboxSize = 36 * getTankFormFactor(tankType, evoLevel, 'hit');
  return t;
}

function applyTankUpgrades(tankType) {
  if (!player) return;
  const t = getPlayerTankDefinition(tankType);
  player._tankDef = t;
  player.speed = t.speed;
  player.shootDelay = t.shootDelay;
  player.visualScale = t.visualScale || 1;
  player.hitboxSize = t.hitboxSize || 36;
  const prevMag = player.magSize || t.magSize || 6;
  const prevAmmoRatio = prevMag > 0 ? (player.ammo || prevMag) / prevMag : 1;
  player.magSize = Math.max(1, (t.magSize || 6) + playerMagBonus);
  player.ammo = Math.max(1, Math.min(player.magSize, Math.ceil(prevAmmoRatio * player.magSize)));
  player.reloadDuration = Math.max(30, t.reloadTime || 110);
  if (player.reloadTimer > 0) player.reloadTimer = Math.min(player.reloadTimer, player.reloadDuration);
  const baseHp = difficultySettings[currentDifficulty].playerHp;
  player.maxHp = Math.max(3, baseHp + t.hpBonus + playerMaxHpBonus);
  if (player.hp > player.maxHp) player.hp = player.maxHp;
}

function buildLabProgressCells(status) {
  return status.partStatus.map(p => {
    const cls = p.ready ? 'gate' : (p.lvl > 0 ? 'filled' : '');
    return `<span class="lab-progress-cell ${cls}" title="${escapeHtml(p.def.name)} ${p.lvl}/${p.def.max}"></span>`;
  }).join('');
}

function renderProtocolTreeLegacyList() {
  const panel = document.getElementById('protocol-panel');
  if (!panel) return;
  globalResearch = normalizeGlobalResearch(globalResearch);
  const total = getGlobalResearchTotalLevel();
  const maxTotal = getGlobalResearchMaxLevel();
  const branchHtml = GLOBAL_RESEARCH_BRANCHES.map(branch => {
    const defs = GLOBAL_RESEARCH_DEFS
      .filter(def => (def.branch || 'body') === branch.id)
      .sort((a, b) => (a.row || 0) - (b.row || 0) || a.name.localeCompare(b.name));
    const nodes = defs.map(def => {
      const lvl = getGlobalResearchLevel(def.id);
      const capped = lvl >= def.max;
      const lock = getGlobalResearchLockReason(def);
      const cost = capped ? 9999 : getGlobalResearchCost(def.id);
      const canAfford = coreFragments >= cost;
      const available = !capped && !lock;
      const effect = lvl > 0 ? def.desc(lvl) : def.next(0);
      const buttonText = capped ? 'MAX' : (lock ? 'LOCKED' : cost + ' MS');
      const cls = capped ? 'capped' : (available ? 'available' : 'locked');
      return `<div class="protocol-node ${cls}" style="--branch-rgb:${escapeHtml(branch.rgb)}">
        <div class="node-orb">${escapeHtml(def.code.split('-')[0].slice(0, 3))}</div>
        <div class="node-body">
          <div class="node-name-row">
            <span class="node-name">${escapeHtml(def.name)}</span>
            <span class="node-level">LV ${lvl}/${def.max}</span>
          </div>
          <div class="node-effect">${escapeHtml(effect)}</div>
          <div class="node-lore">${escapeHtml(def.lore || '该协议仍在整理档案。')}</div>
          ${lock ? `<div class="node-lock">${escapeHtml(lock)}</div>` : ''}
          <button class="node-buy ${canAfford ? '' : 'no-funds'}" onclick="purchaseGlobalResearch('${def.id}')" ${(!available || capped) ? 'disabled' : ''}>${escapeHtml(buttonText)}</button>
        </div>
      </div>`;
    }).join('');
    return `<section class="protocol-branch" style="--branch-rgb:${escapeHtml(branch.rgb)}">
      <div class="branch-head">
        <div class="branch-mark">${escapeHtml(branch.code)}</div>
        <div>
          <div class="branch-name">${escapeHtml(branch.name)}</div>
          <div class="branch-desc">${escapeHtml(branch.desc)}</div>
        </div>
      </div>
      ${nodes}
    </section>`;
  }).join('');
  panel.innerHTML = `<div class="protocol-header">
    <div>
      <div class="protocol-title">GLOBAL PROTOCOL / 圣城总纲</div>
      <div class="protocol-lore">全域协议不属于任何一台机体。它是研究室、补给线与前线墓碑共同写下的底层律法，点亮越深，所有机体越像同一支远征军。</div>
    </div>
    <div class="protocol-progress">PROGRESS ${total}/${maxTotal}<br>${Math.round(total / Math.max(1, maxTotal) * 100)}%</div>
  </div>
  <div class="protocol-tree">${branchHtml}</div>`;
  const fragDisplay = document.getElementById('protocol-fragments');
  if (fragDisplay) fragDisplay.innerHTML = renderMoonstoneChip(coreFragments, 'PROTOCOL RESERVE');
}

function renderProtocolTreeSplitMap() {
  const panel = document.getElementById('protocol-panel');
  if (!panel) return;
  globalResearch = normalizeGlobalResearch(globalResearch);
  const total = getGlobalResearchTotalLevel();
  const maxTotal = getGlobalResearchMaxLevel();
  const branchHtml = GLOBAL_RESEARCH_BRANCHES.map(branch => {
    const defs = GLOBAL_RESEARCH_DEFS
      .filter(def => (def.branch || 'body') === branch.id)
      .sort((a, b) => (a.row || 0) - (b.row || 0) || a.name.localeCompare(b.name));
    const visibleDefs = defs.filter(def => isGlobalResearchVisible(def));
    const visibleIds = new Set(visibleDefs.map(def => def.id));
    const links = visibleDefs.flatMap(def => getGlobalResearchPrereqEntries(def).map(([parentId]) => ({ parentId, childId:def.id })))
      .filter(link => visibleIds.has(link.parentId) && visibleIds.has(link.childId))
      .map(link => {
        const parent = GLOBAL_RESEARCH_LAYOUT[link.parentId] || { x:50, y:50 };
        const child = GLOBAL_RESEARCH_LAYOUT[link.childId] || { x:50, y:50 };
        const cls = getGlobalResearchLevel(link.childId) > 0 ? 'lit' : 'ready';
        return `<line class="${cls}" x1="${parent.x}%" y1="${parent.y}%" x2="${child.x}%" y2="${child.y}%"></line>`;
      }).join('');
    const nodes = visibleDefs.map(def => {
      const lvl = getGlobalResearchLevel(def.id);
      const capped = lvl >= def.max;
      const lock = getGlobalResearchLockReason(def);
      const cost = capped ? 9999 : getGlobalResearchCost(def.id);
      const canAfford = coreFragments >= cost;
      const available = !capped && !lock;
      const effect = lvl > 0 ? def.desc(lvl) : def.next(0);
      const buttonText = capped ? 'MAX' : (lock ? 'LOCKED' : cost + ' MS');
      const layout = GLOBAL_RESEARCH_LAYOUT[def.id] || { x:50, y:50 };
      const root = getGlobalResearchPrereqEntries(def).length === 0;
      const cls = `${capped ? 'capped' : (available ? 'available' : 'locked')} ${lvl > 0 ? 'lit' : ''} ${root ? 'root' : ''}`;
      return `<div class="protocol-node ${cls}" data-protocol-id="${escapeHtml(def.id)}" style="--branch-rgb:${escapeHtml(branch.rgb)};--node-x:${layout.x};--node-y:${layout.y}">
        <div class="node-orb">${escapeHtml(def.code.split('-')[0].slice(0, 3))}</div>
        <div class="node-body">
          <div class="node-name-row">
            <span class="node-name">${escapeHtml(def.name)}</span>
            <span class="node-level">LV ${lvl}/${def.max}</span>
          </div>
          <div class="node-effect">${escapeHtml(effect)}</div>
          <div class="node-lore">${escapeHtml(def.lore || '该协议仍在整理档案。')}</div>
          ${lock ? `<div class="node-lock">${escapeHtml(lock)}</div>` : ''}
          <button class="node-buy ${canAfford ? '' : 'no-funds'}" onclick="purchaseGlobalResearch('${def.id}')" ${(!available || capped) ? 'disabled' : ''}>${escapeHtml(buttonText)}</button>
        </div>
      </div>`;
    }).join('');
    return `<section class="protocol-branch" style="--branch-rgb:${escapeHtml(branch.rgb)}">
      <div class="branch-head">
        <div class="branch-mark">${escapeHtml(branch.code)}</div>
        <div>
          <div class="branch-name">${escapeHtml(branch.name)}</div>
          <div class="branch-desc">${escapeHtml(branch.desc)}</div>
          <div class="branch-revealed">REVEALED ${visibleDefs.length}/${defs.length} · FIRST SPARK UNSEALS NEXT NODE</div>
        </div>
      </div>
      <div class="protocol-map">
        <svg class="protocol-links" viewBox="0 0 100 100" preserveAspectRatio="none">${links}</svg>
        ${nodes || '<div class="protocol-empty">NO ACTIVE PROTOCOL</div>'}
      </div>
    </section>`;
  }).join('');
  panel.innerHTML = `<div class="protocol-header">
    <div>
      <div class="protocol-title">GLOBAL PROTOCOL / 圣城总纲</div>
      <div class="protocol-lore">全域协议不是一张清单，而是一张仍在醒来的星图。每个节点只需第一次点亮，后续分支便会显现；继续投入月光石，则是在同一枚圣印中刻下更深的命令。</div>
    </div>
    <div class="protocol-progress">PROGRESS ${total}/${maxTotal}<br>${Math.round(total / Math.max(1, maxTotal) * 100)}%</div>
  </div>
  <div class="protocol-tree">${branchHtml}</div>`;
  const fragDisplay = document.getElementById('protocol-fragments');
  if (fragDisplay) fragDisplay.innerHTML = renderMoonstoneChip(coreFragments, 'PROTOCOL RESERVE');
}

function clampProtocolPan() {
  const viewport = document.getElementById('protocol-viewport');
  if (!viewport) return;
  protocolMapPan.zoom = Math.max(PROTOCOL_ZOOM_LIMITS.min, Math.min(PROTOCOL_ZOOM_LIMITS.max, protocolMapPan.zoom || 1));
  const scaledW = PROTOCOL_MAP_SIZE.width * protocolMapPan.zoom;
  const scaledH = PROTOCOL_MAP_SIZE.height * protocolMapPan.zoom;
  const minX = Math.min(0, viewport.clientWidth - scaledW - 28);
  const minY = Math.min(0, viewport.clientHeight - scaledH - 28);
  protocolMapPan.x = Math.max(minX, Math.min(28, protocolMapPan.x));
  protocolMapPan.y = Math.max(minY, Math.min(28, protocolMapPan.y));
}

function updateProtocolMapPan() {
  clampProtocolPan();
  const map = document.getElementById('protocol-map');
  if (map) {
    map.style.setProperty('--pan-x', Math.round(protocolMapPan.x) + 'px');
    map.style.setProperty('--pan-y', Math.round(protocolMapPan.y) + 'px');
    map.style.setProperty('--map-zoom', Number(protocolMapPan.zoom || 1).toFixed(3));
  }
  const readout = document.getElementById('protocol-zoom-readout');
  if (readout) {
    readout.textContent = 'ZOOM ' + Math.round((protocolMapPan.zoom || 1) * 100) + '%';
  }
}

function zoomProtocolMap(delta, clientX, clientY) {
  const viewport = document.getElementById('protocol-viewport');
  if (!viewport) return;
  const oldZoom = Math.max(PROTOCOL_ZOOM_LIMITS.min, Math.min(PROTOCOL_ZOOM_LIMITS.max, protocolMapPan.zoom || 1));
  const direction = delta < 0 ? 1 : -1;
  const nextZoom = Math.max(PROTOCOL_ZOOM_LIMITS.min, Math.min(PROTOCOL_ZOOM_LIMITS.max, oldZoom + direction * PROTOCOL_ZOOM_LIMITS.step));
  if (Math.abs(nextZoom - oldZoom) < 0.001) return;
  const rect = viewport.getBoundingClientRect();
  const vx = Number.isFinite(clientX) ? clientX - rect.left : viewport.clientWidth / 2;
  const vy = Number.isFinite(clientY) ? clientY - rect.top : viewport.clientHeight / 2;
  const mapX = (vx - protocolMapPan.x) / oldZoom;
  const mapY = (vy - protocolMapPan.y) / oldZoom;
  protocolMapPan.zoom = nextZoom;
  protocolMapPan.x = vx - mapX * nextZoom;
  protocolMapPan.y = vy - mapY * nextZoom;
  updateProtocolMapPan();
}

function setupProtocolMapDrag() {
  const viewport = document.getElementById('protocol-viewport');
  if (!viewport || viewport.dataset.dragReady === '1') return;
  viewport.dataset.dragReady = '1';
  const beginDrag = e => {
    if (e.target.closest && e.target.closest('.protocol-node')) return;
    protocolMapPan.dragging = true;
    protocolMapPan.startX = e.clientX;
    protocolMapPan.startY = e.clientY;
    protocolMapPan.originX = protocolMapPan.x;
    protocolMapPan.originY = protocolMapPan.y;
    viewport.classList.add('dragging');
    viewport.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  };
  const moveDrag = e => {
    if (!protocolMapPan.dragging) return;
    protocolMapPan.x = protocolMapPan.originX + e.clientX - protocolMapPan.startX;
    protocolMapPan.y = protocolMapPan.originY + e.clientY - protocolMapPan.startY;
    updateProtocolMapPan();
  };
  const endDrag = e => {
    if (!protocolMapPan.dragging) return;
    protocolMapPan.dragging = false;
    viewport.classList.remove('dragging');
    try { viewport.releasePointerCapture?.(e.pointerId); } catch(err) {}
  };
  const wheelZoom = e => {
    zoomProtocolMap(e.deltaY, e.clientX, e.clientY);
    e.preventDefault();
  };
  viewport.addEventListener('pointerdown', beginDrag);
  viewport.addEventListener('pointermove', moveDrag);
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('pointerleave', endDrag);
  viewport.addEventListener('wheel', wheelZoom, { passive: false });
  window.addEventListener('resize', updateProtocolMapPan);
}

function centerProtocolMapOnCore(force = false) {
  const viewport = document.getElementById('protocol-viewport');
  if (!viewport) return;
  if (!force && protocolMapPan.initialized) {
    updateProtocolMapPan();
    return;
  }
  protocolMapPan.zoom = Math.max(PROTOCOL_ZOOM_LIMITS.min, Math.min(PROTOCOL_ZOOM_LIMITS.max, protocolMapPan.zoom || 1));
  protocolMapPan.x = Math.round(viewport.clientWidth / 2 - PROTOCOL_MAP_SIZE.centerX * protocolMapPan.zoom);
  protocolMapPan.y = Math.round(viewport.clientHeight / 2 - PROTOCOL_MAP_SIZE.centerY * protocolMapPan.zoom);
  protocolMapPan.initialized = true;
  updateProtocolMapPan();
}

function resetProtocolMapView() {
  protocolMapPan.zoom = 1;
  protocolMapPan.x = 0;
  protocolMapPan.y = 0;
  protocolMapPan.dragging = false;
  protocolMapPan.initialized = false;
  centerProtocolMapOnCore(true);
}

function renderProtocolTree() {
  const panel = document.getElementById('protocol-panel');
  if (!panel) return;
  globalResearch = normalizeGlobalResearch(globalResearch);
  const total = getGlobalResearchTotalLevel();
  const maxTotal = getGlobalResearchMaxLevel();
  const visibleDefs = GLOBAL_RESEARCH_DEFS.filter(def => isGlobalResearchVisible(def));
  const visibleIds = new Set(visibleDefs.map(def => def.id));
  const links = [];
  visibleDefs.forEach(def => {
    const branch = getGlobalResearchBranchByDef(def);
    const visual = getGlobalResearchVisual(def);
    const child = GLOBAL_RESEARCH_LAYOUT[def.id] || { x:PROTOCOL_MAP_SIZE.centerX, y:PROTOCOL_MAP_SIZE.centerY };
    const prereqs = getGlobalResearchPrereqEntries(def);
    if (!prereqs.length) {
      const cls = getGlobalResearchLevel(def.id) > 0 ? 'lit' : 'ready';
      const mx = (PROTOCOL_MAP_SIZE.centerX + child.x) / 2;
      const my = (PROTOCOL_MAP_SIZE.centerY + child.y) / 2;
      links.push(`<path class="${cls}" style="--link-rgb:${escapeHtml(visual.link || branch.rgb)}" d="M ${PROTOCOL_MAP_SIZE.centerX} ${PROTOCOL_MAP_SIZE.centerY} Q ${mx} ${my} ${child.x} ${child.y}"></path>`);
      return;
    }
    prereqs.forEach(([parentId]) => {
      if (!visibleIds.has(parentId)) return;
      const parent = GLOBAL_RESEARCH_LAYOUT[parentId] || { x:PROTOCOL_MAP_SIZE.centerX, y:PROTOCOL_MAP_SIZE.centerY };
      const cls = getGlobalResearchLevel(def.id) > 0 ? 'lit' : 'ready';
      const dx = child.x - parent.x;
      const dy = child.y - parent.y;
      const bend = Math.max(-90, Math.min(90, dx * 0.12));
      const cx = parent.x + dx * 0.52 - dy * 0.04;
      const cy = parent.y + dy * 0.48 + bend;
      links.push(`<path class="${cls}" style="--link-rgb:${escapeHtml(visual.link || branch.rgb)}" d="M ${parent.x} ${parent.y} Q ${Math.round(cx)} ${Math.round(cy)} ${child.x} ${child.y}"></path>`);
    });
  });
  const nodes = visibleDefs.map(def => {
    const branch = getGlobalResearchBranchByDef(def);
    const visual = getGlobalResearchVisual(def);
    const lvl = getGlobalResearchLevel(def.id);
    const capped = lvl >= def.max;
    const lock = getGlobalResearchLockReason(def);
    const cost = capped ? 9999 : getGlobalResearchCost(def.id);
    const canAfford = coreFragments >= cost;
    const available = !capped && !lock;
    const effect = lvl > 0 ? def.desc(lvl) : def.next(0);
    const buttonText = capped ? 'MAX' : (lock ? 'LOCKED' : cost + ' MS');
    const layout = GLOBAL_RESEARCH_LAYOUT[def.id] || { x:PROTOCOL_MAP_SIZE.centerX, y:PROTOCOL_MAP_SIZE.centerY };
    const root = getGlobalResearchPrereqEntries(def).length === 0;
    const cls = `${capped ? 'capped' : (available ? 'available' : 'locked')} ${lvl > 0 ? 'lit' : ''} ${root ? 'root' : ''} ${visual.isConflux ? 'conflux' : ''}`;
    const nodeStyle = [
      `--branch-rgb:${escapeHtml(branch.rgb)}`,
      `--node-rgb:${escapeHtml(visual.primary)}`,
      `--node-rgb-2:${escapeHtml(visual.secondary)}`,
      `--node-alpha:${visual.alpha}`,
      `--node-bg-alpha:${visual.bgAlpha}`,
      `--node-border-alpha:${visual.borderAlpha}`,
      `--node-glow:${visual.glow}`,
      `--node-depth:${visual.depth}`,
      `--node-x:${layout.x}`,
      `--node-y:${layout.y}`
    ].join(';');
    return `<div class="protocol-node ${cls}" data-protocol-id="${escapeHtml(def.id)}" style="${nodeStyle}">
      <div class="node-body">
        <div class="node-branch">${escapeHtml(visual.isConflux ? 'CNF / 触点果实' : branch.code + ' / ' + branch.name)}</div>
        <div class="node-name-row">
          <span class="node-name">${escapeHtml(def.name)}</span>
          <span class="node-level">LV ${lvl}/${def.max}</span>
        </div>
        <div class="node-effect">${escapeHtml(effect)}</div>
        <div class="node-lore">${escapeHtml(def.lore || '该协议仍在整理档案。')}</div>
        ${lock ? `<div class="node-lock">${escapeHtml(lock)}</div>` : ''}
        <button class="node-buy ${canAfford ? '' : 'no-funds'}" onclick="purchaseGlobalResearch('${def.id}')" ${(!available || capped) ? 'disabled' : ''}>${escapeHtml(buttonText)}</button>
      </div>
    </div>`;
  }).join('');
  const branchSummary = GLOBAL_RESEARCH_BRANCHES.map(branch => {
    const defs = GLOBAL_RESEARCH_DEFS.filter(def => (def.branch || 'body') === branch.id);
    const revealed = defs.filter(def => isGlobalResearchVisible(def)).length;
    const lit = defs.filter(def => getGlobalResearchLevel(def.id) > 0).length;
    return `<div class="protocol-axis-chip" style="--branch-rgb:${escapeHtml(branch.rgb)}">
      <span class="axis-code">${escapeHtml(branch.code)}</span><span class="axis-name">${escapeHtml(branch.name)}</span>
      <span class="axis-progress">${lit}/${defs.length} 已点亮 · ${revealed} 显现</span>
    </div>`;
  }).join('');
  const panStyle = `--pan-x:${Math.round(protocolMapPan.x)}px;--pan-y:${Math.round(protocolMapPan.y)}px;--map-zoom:${Number(protocolMapPan.zoom || 1).toFixed(3)};`;
  panel.innerHTML = `<div class="protocol-header">
    <div>
      <div class="protocol-title">GLOBAL PROTOCOL / 圣城心智树</div>
      <div class="protocol-lore">全域协议不是三张清单，而是一张从圣城中枢生长出来的心智树。三枚基础协议围绕核心点亮，机体、弹道、后勤三条主干向不同方向延展；后续节点只在前置协议第一次点亮后显现。</div>
    </div>
    <div class="protocol-progress">PROGRESS ${total}/${maxTotal}<br>${Math.round(total / Math.max(1, maxTotal) * 100)}%</div>
  </div>
  <div class="protocol-status-rail">
    <div class="protocol-status-title">ONE MAP / THREE TRUNKS / CONFLUX FRUITS / DRAG TO PAN</div>
    <div class="protocol-axis-list">${branchSummary}</div>
  </div>
  <div class="protocol-drag-hint">在空白区域按住拖拽，像查看脑图一样探索整张协议树；滚轮可缩放视角，节点第一次点亮后才显现下一段树枝。<span class="protocol-zoom-readout" id="protocol-zoom-readout">ZOOM ${Math.round((protocolMapPan.zoom || 1) * 100)}%</span></div>
  <div class="protocol-viewport" id="protocol-viewport">
    <div class="protocol-map" id="protocol-map" style="${panStyle}">
      <svg class="protocol-links" viewBox="0 0 ${PROTOCOL_MAP_SIZE.width} ${PROTOCOL_MAP_SIZE.height}" preserveAspectRatio="none">${links.join('')}</svg>
      <div class="protocol-core"><div><strong>SANCTUM</strong><span>圣城中枢<br>${total}/${maxTotal}</span></div></div>
      ${nodes}
    </div>
  </div>`;
  const fragDisplay = document.getElementById('protocol-fragments');
  if (fragDisplay) fragDisplay.innerHTML = renderMoonstoneChip(coreFragments, 'PROTOCOL RESERVE');
  setupProtocolMapDrag();
  centerProtocolMapOnCore(false);
}

function renderLabPreviewCanvas() {
  const canvas = document.getElementById('lab-preview-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const tankType = canvas.dataset.tank || labSelectedTank || currentTankType || 'spread';
  const evoLevel = parseInt(canvas.dataset.evo || String(getEvolutionLevel(tankType)), 10) || 0;
  const base = tankTypes[tankType] || tankTypes.spread;
  const mark = LAB_TANK_MARKS[tankType] || LAB_TANK_MARKS.spread;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0, 'rgba(8,12,16,0.98)');
  bg.addColorStop(0.55, 'rgba(17,16,14,0.94)');
  bg.addColorStop(1, 'rgba(6,9,13,0.98)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(246,229,170,0.08)';
  ctx.lineWidth = 1;
  for (let x = 18; x < canvas.width; x += 18) {
    ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x, canvas.height - 12); ctx.stroke();
  }
  for (let y = 18; y < canvas.height; y += 18) {
    ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(canvas.width - 10, y); ctx.stroke();
  }

  const finalPreview = evoLevel >= 2;
  ctx.strokeStyle = finalPreview ? 'rgba(246,229,170,0.16)' : 'rgba(140,232,255,0.25)';
  ctx.beginPath();
  if (finalPreview) {
    ctx.arc(canvas.width / 2, canvas.height / 2 + 8, 58, Math.PI * 0.14, Math.PI * 0.86);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2 + 8, 58, Math.PI * 1.14, Math.PI * 1.86);
  } else {
    ctx.arc(canvas.width / 2, canvas.height / 2 + 8, 54 + evoLevel * 10, 0, Math.PI * 2);
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 70, canvas.height / 2 + 44);
  ctx.lineTo(canvas.width / 2 + 70, canvas.height / 2 + 44);
  ctx.stroke();

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2 + 13);
  ctx.scale(2.05, 2.05);
  const previewTank = {
    x: 0,
    y: 0,
    color: base.color,
    turretColor: base.turret,
    turretAngle: -Math.PI / 10,
    tankType,
    _tankDef: { evoLevel },
    drawTankModel: PlayerTank.prototype.drawTankModel,
  };
  previewTank.drawTankModel(ctx);
  ctx.restore();

  ctx.fillStyle = 'rgba(246,229,170,0.82)';
  ctx.font = "700 11px 'Courier New','Microsoft YaHei',monospace";
  ctx.textAlign = 'left';
  ctx.fillText(mark.code + ' / ' + (evoLevel ? 'EVOLVED-' + evoLevel : 'BASE'), 14, 20);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(140,232,255,0.68)';
  ctx.fillText(mark.role, canvas.width - 14, canvas.height - 16);
  ctx.restore();
}

// Tank Lab UI (replaces old upgrade screen)
function renderLabUI() {
  const grid = document.getElementById('lab-tank-grid');
  const detail = document.getElementById('lab-detail');
  if (!grid) return;
  const tankKeys = Object.keys(tankTypes);
  const selected = labSelectedTank;
  grid.innerHTML = tankKeys.map(k => {
    const unlocked = unlockedTanks.has(k);
    const status = getTankStageStatus(k);
    const evoLevel = getEvolutionLevel(k);
    const evoEntries = TANK_EVOLUTION[k] || [];
    const evolved = evoLevel > 0;
    const isSelected = (selected === k);
    const cond = TANK_UNLOCK_CONDITIONS[k];
    const mark = LAB_TANK_MARKS[k] || LAB_TANK_MARKS.spread;
    const cardCode = unlocked ? (evolved ? evoEntries[evoLevel - 1].icon : mark.code) : 'LOCK';
    const lockedLabel = cond && cond.cost > 0 ? `COST ${cond.cost}` : 'SEALED';
    return `<div class="lab-tank-card ${unlocked?'':'locked'} ${isSelected?'selected':''} ${evolved?'evolved':''}" onclick="${unlocked?'selectLabTank(\''+k+'\')':'tryUnlockFromLab(\''+k+'\')'}">
      <span class="lab-tank-icon">${renderCodeIcon(cardCode, mark.role, k)}</span>
      <div class="lab-tank-name">${unlocked ? tankTypes[k].name : '???'}</div>
      <div class="lab-tank-dots">${unlocked ? buildLabProgressCells(status) : `<span class="lab-lock-cost">${escapeHtml(lockedLabel)}</span>`}</div>
      ${evolved ? `<div class="lab-evo-badge">E${evoLevel}</div>` : ''}
      ${isSelected ? '<div class="lab-current-flag">ACTIVE VIEW</div>' : ''}
    </div>`;
  }).join('');
  // Detail panel
  if (!detail) return;
  try {
  const k = labSelectedTank;
  const unlocked = unlockedTanks.has(k);
  const ug = tankUpgrades[k] || {};
  const evoEntries = TANK_EVOLUTION[k] || [];
  const evoLevel = getEvolutionLevel(k);
  const evolved = evoLevel > 0;
  const evoDef = evolved ? evoEntries[evoLevel - 1] : null;
  const nextEvo = evoEntries[evoLevel] || null;
  const fragDisplay = document.getElementById('lab-fragments');
  if (fragDisplay) fragDisplay.innerHTML = renderMoonstoneChip(coreFragments, 'LAB RESERVE');

  if (!unlocked) {
    const cond = TANK_UNLOCK_CONDITIONS[k];
    const mark = LAB_TANK_MARKS[k] || LAB_TANK_MARKS.spread;
    const unlockStatus = getTankUnlockConditionStatus(k);
    const unlockButtonText = unlockStatus.met ? 'AUTHORIZE / 条件解锁' : `UNSEAL / ${cond.cost} MS`;
    detail.innerHTML = `<div class="lab-locked-panel">
      <div class="lab-locked-title">LOCKED / ${escapeHtml(mark.code)}</div>
      <canvas class="lab-preview-canvas" id="lab-preview-canvas" width="240" height="170" data-tank="${escapeHtml(k)}" data-evo="0"></canvas>
      <div class="lab-locked-desc">${escapeHtml(tankTypes[k].name)} · ${escapeHtml(mark.role)}<br>${escapeHtml(cond.desc)}${unlockStatus.met ? '<br>' + escapeHtml(unlockStatus.label) : ''}</div>
      ${cond.cost > 0 ? `<button class="lab-btn" onclick="tryUnlockTank('${k}');renderLabUI();">${escapeHtml(unlockButtonText)}</button>` : ''}</div>`;
  } else {
    const status = getTankStageStatus(k);
    const defs = TANK_UPGRADE_DEFS[k] || [];
    const totalCurrent = defs.reduce((s,d) => s + (ug[d.id] || 0), 0);
    const totalMax = defs.reduce((s,d) => s + d.max, 0);
    const stageReady = canEvolve(k);
    const mark = LAB_TANK_MARKS[k] || LAB_TANK_MARKS.spread;
    const stageText = nextEvo
      ? (evoLevel === 0 ? '一阶改装要求：5个部件全部达到中段校准' : '二阶进化要求：5个部件全部满级')
      : '二阶进化已完成：机体进入终末稳定态';
    const stageHTML = [0,1,2].map(stage => {
      const cls = stage < evoLevel ? 'done' : (stage === evoLevel ? 'active' : '');
      const label = stage === 0 ? 'E0 原型' : (stage === 1 ? 'E1 改装' : 'E2 终式');
      const sub = stage === 0 ? '部件校准' : (stage === 1 ? '重构装甲' : '圣痕核心');
      return `<div class="lab-stage-chip ${cls}">${label}<span>${sub}</span></div>`;
    }).join('');
    let evoHTML = '';
    if (evolved) {
      evoHTML += `<div class="lab-evo-current">CURRENT E${evoLevel}: ${renderCodeIcon(evoDef.icon, evoDef.name, k)} / ${escapeHtml(evoDef.name)} · ${escapeHtml(evoDef.bonus)}</div>`;
    }
    if (nextEvo) {
      evoHTML += `<div class="lab-evo-next">
        <button class="lab-btn lab-evo-btn ${stageReady ? 'ready' : 'locked'}" onclick="tryEvolveTank('${k}');renderLabUI();">
          ${stageReady ? 'AUTHORIZE' : 'SEALED'} / E${evoLevel + 1} ${escapeHtml(nextEvo.name)} / ${nextEvo.cost} MS
        </button>
      </div>`;
    }
    let statsHTML = '';
    for (const part of status.partStatus) {
      const d = part.def;
      const lvl = part.lvl;
      const capped = part.capped;
      const cost = capped ? 999 : getTankUpgradeCost(k, d.id);
      const canAfford = coreFragments >= cost;
      const costText = capped ? (part.fullyCapped ? 'MAX' : 'GATE') : (cost + ' MS');
      const barW = Math.floor((lvl / d.max) * 100);
      const desc = part.fullyCapped ? 'MAX' : `${lvl}/${d.max} · gate ${part.gate}`;
      statsHTML += `<div class="lab-stat-upgrade-row ${part.ready ? '' : 'gate-pending'}">
        <span class="lab-stat-icon">${renderCodeIcon(getUpgradePartCode(d), d.name, k)}</span>
        <span class="lab-stat-name">${escapeHtml(d.name)}</span>
        <span class="lab-stat-meter">
          <span class="lab-stat-fill ${capped ? 'capped' : (part.ready ? 'gated' : '')}" style="--fill:${barW}%;"></span>
        </span>
        <span class="lab-stat-desc ${capped ? 'capped' : ''}">${escapeHtml(desc)}</span>
        <button onclick="purchaseTankUpgrade('${k}','${d.id}');" ${capped?'disabled':''}
          class="lab-stat-buy ${canAfford ? '' : 'no-funds'}">${costText}</button>
      </div>`;
    }
    detail.innerHTML = `
      <div class="lab-detail-grid">
        <div class="lab-preview-panel">
          <div class="lab-preview-header"><span>${escapeHtml(mark.code)}</span><strong>E${evoLevel}</strong></div>
          <canvas class="lab-preview-canvas" id="lab-preview-canvas" width="240" height="170" data-tank="${escapeHtml(k)}" data-evo="${evoLevel}"></canvas>
          <div class="lab-preview-footer"><span>${escapeHtml(mark.role)}</span><strong>${evolved ? renderCodeIcon(evoDef.icon, evoDef.name, k) : 'BASE'}</strong></div>
          <div class="lab-preview-lore">${escapeHtml(mark.motto)}</div>
        </div>
        <div class="lab-data-panel">
          <div class="lab-detail-title">${escapeHtml(evolved ? evoDef.name : tankTypes[k].name)} ${(selected===k && selected===currentTankType) ? '/ SORTIE' : ''}</div>
          <div class="lab-detail-subtitle">${escapeHtml(tankTypes[k].desc)} · ${escapeHtml(stageText)}</div>
          <div class="lab-stage-row">${stageHTML}</div>
          <div class="lab-gate-note">阶段校准 ${status.readyParts}/${status.totalParts} · ${nextEvo ? (stageReady ? '进化许可已解锁，消耗月光石进行改装仪式。' : '每个部件都必须达到本阶段门槛，不能再用单项堆叠跳过改装。') : '所有进化完成，剩余升级仅作为终式维护记录。'}</div>
          ${evoHTML}
          <div class="lab-stats-wrap">${statsHTML}</div>
          <div class="lab-progress-note">MS ${coreFragments} · ${defs.length} PARTS · TOTAL ${totalCurrent}/${totalMax}</div>
        </div>
      </div>`;
  }
  renderLabPreviewCanvas();
  // Update fixed confirm button visibility
  const confirmBtn = document.getElementById('lab-confirm-btn');
  if (confirmBtn) {
    const sel = labSelectedTank;
    confirmBtn.style.display = (sel !== currentTankType && unlockedTanks.has(sel)) ? 'inline-block' : 'none';
    confirmBtn.textContent = 'SORTIE / ' + (tankTypes[sel]?.name || '??');
  }
  } catch(e) {
    if (detail) detail.innerHTML = '<div class="lab-error-panel">ERROR: ' + escapeHtml(e.message) + '<br><small>' + escapeHtml(e.stack.split('\\n')[0]) + '</small></div>';
  }
}
function selectLabTank(tank) {
  labSelectedTank = tank;
  renderLabUI();
}
function tryUnlockFromLab(tank) {
  labSelectedTank = tank;
  tryUnlockTank(tank);
  renderLabUI();
}
function confirmActiveTank(tank) {
  if (!unlockedTanks.has(tank)) return;
  currentTankType = tank;
  saveProgression();
  hideLabScreen();
}
function setActiveTank(tank) {
  labSelectedTank = tank;
  renderLabUI();
}
function showLabScreen() {
  labSelectedTank = currentTankType;
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('tank-select-screen').style.display = 'none';
  document.getElementById('lab-screen').style.display = 'flex';
  renderLabUI();
}
function hideLabScreen() {
  document.getElementById('lab-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'flex';
  renderDifficultyButtons();
}

// --- Save Data Diagnostics Panel ---
function showSaveDiagnostics() {
  const screen = document.getElementById('save-diag-screen');
  if (!screen) return;
  hideAllScreens();
  screen.style.display = 'flex';
  
  const content = document.getElementById('save-diag-content');
  if (!content) return;
  
  const rows = [];
  
  // Helper: safe parse
  const safeJson = (key) => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; }
    catch(e) { return { _error: e.message }; }
  };
  const safeVal = (key) => { try { return localStorage.getItem(key); } catch(e) { return null; } };
  
  // 1. Save version
  const version = safeVal('tankbattle_progress_version') || '1';
  const versionOk = parseInt(version) >= 1;
  rows.push({ label: '存档版本', value: 'v' + version, status: versionOk ? 'ok' : 'warn', detail: versionOk ? '版本格式正常' : '版本号异常，建议重置' });
  
  // 2. Moonstone
  const fragments = parseInt(safeVal('tankbattle_fragments') || '0', 10) || 0;
  rows.push({ label: '月光石', value: fragments + ' MS', status: 'ok', detail: '余额正常' });
  
  // 3. Tank unlocks
  const tankData = safeJson('tankbattle_tank_unlocks');
  const tankCount = tankData ? tankData.length : 0;
  rows.push({ label: '机体解锁', value: tankCount + ' / 10', status: tankCount >= 1 ? 'ok' : 'warn', detail: tankCount >= 1 ? '已解锁 ' + (tankData || []).join(' / ') : '未读取到解锁数据' });
  
  // 4. Tank evolutions
  const evoData = safeJson('tankbattle_tank_evolved');
  const evoCount = evoData ? evoData.length : 0;
  rows.push({ label: '机体进化', value: evoCount + ' 台', status: 'ok', detail: evoCount > 0 ? '已进化: ' + (evoData || []).join(' / ') : '尚未进化任何机体' });
  
  // 5. Tank upgrades
  const upgradeData = safeJson('tankbattle_tank_upgrades');
  let upgradeTotal = 0;
  if (upgradeData && typeof upgradeData === 'object') {
    Object.values(upgradeData).forEach(v => { if (v && typeof v === 'object') upgradeTotal += Object.values(v).reduce((a,b) => a + (b||0), 0); });
  }
  rows.push({ label: '部件升级', value: upgradeTotal + ' 次', status: upgradeTotal > 0 ? 'ok' : 'info', detail: '研究室各机体部件升级总次数' });
  
  // 6. Protocol tree
  const researchData = safeJson('tankbattle_global_research');
  let researchTotal = 0, researchMax = 0;
  if (researchData && typeof researchData === 'object') {
    researchTotal = Object.values(researchData).reduce((a,b) => a + (b||0), 0);
    researchMax = 80;
  }
  rows.push({ label: '协议树点亮', value: researchTotal + ' / ~' + researchMax, status: researchTotal > 0 ? 'ok' : 'info', detail: '全域协议加点总次数' });
  
  // 7. Achievements
  const achData = safeJson('tankbattle_achievements');
  const achCount = achData ? achData.length : 0;
  rows.push({ label: '成就解锁', value: achCount + ' / ~50', status: achCount > 0 ? 'ok' : 'info', detail: achCount > 0 ? '已解锁 ' + achCount + ' 个战绩' : '尚未解锁战绩' });
  
  // 8. Difficulty unlocks
  const diffData = safeJson('tankbattle_unlocks');
  const diffCount = diffData ? diffData.length : 0;
  rows.push({ label: '难度解锁', value: diffCount + ' / 5', status: diffCount >= 2 ? 'ok' : 'warn', detail: '已解锁难度: ' + (diffData || ['简单']).join(' / ') });
  
  // 9. Bestiary
  const bestData = safeJson('tankbattle_bestiary_discovered');
  let bestTotal = 0;
  if (bestData && typeof bestData === 'object') {
    Object.values(bestData).forEach(v => { if (v instanceof Set || Array.isArray(v)) bestTotal += (v.size || v.length || 0); });
  }
  rows.push({ label: '图鉴发现', value: bestTotal + ' 项', status: bestTotal > 0 ? 'ok' : 'info', detail: '已发现敌人/道具/融合档案' });
  
  // 10. Leaderboard
  const lbData = safeJson('tankbattle_leaderboard');
  const lbCount = lbData ? (Array.isArray(lbData) ? lbData.length : Object.keys(lbData).length) : 0;
  rows.push({ label: '排行榜', value: lbCount + ' 条', status: lbCount >= 0 ? 'ok' : 'warn', detail: '排行榜记录数' });
  
  // 11. First run
  const firstRun = safeVal('tankbattle_first_run_done');
  rows.push({ label: '新手引导', value: firstRun === '1' ? '已完成' : '未完成', status: 'ok', detail: firstRun === '1' ? '首次教程已标记完成' : '下次开局将显示引导' });
  
  // 12. Save size
  let totalSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.includes('tankbattle')) totalSize += (localStorage.getItem(k) || '').length;
  }
  rows.push({ label: '存档大小', value: (totalSize / 1024).toFixed(1) + ' KB', status: totalSize < 500000 ? 'ok' : 'warn', detail: totalSize < 500000 ? '存储空间正常' : '存档较大，建议清理旧数据' });
  
  // Render
  const statusIcon = { ok: '✓', warn: '!', info: '·', error: '✕' };
  const statusColor = { ok: '#79f48d', warn: '#f49800', info: '#8ce8ff', error: '#ff6767' };
  
  content.innerHTML = rows.map(r => `
    <div class="diag-row" style="--diag-color:${statusColor[r.status]}">
      <div class="diag-label">${r.label}</div>
      <div class="diag-value">${statusIcon[r.status]} ${r.value}</div>
      <div class="diag-detail">${r.detail}</div>
    </div>
  `).join('') + `
    <div class="diag-actions">
      <button class="diag-btn" onclick="exportSaveData()">导出存档 JSON</button>
      <button class="diag-btn diag-btn-danger" onclick="resetAllSaveData()">重置全部存档</button>
    </div>
  `;
}

function exportSaveData() {
  const exportObj = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.includes('tankbattle')) {
      try { exportObj[k] = JSON.parse(localStorage.getItem(k)); }
      catch(e) { exportObj[k] = localStorage.getItem(k); }
    }
  }
  const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'tankbattle_save_' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showAchievementToast('EXP', '存档导出', '已下载到本地', '#8ce8ff');
}

function resetAllSaveData() {
  if (!confirm('确定要重置全部存档数据？此操作不可撤销！')) return;
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && k.includes('tankbattle')) localStorage.removeItem(k);
  }
  location.reload();
}

function hideSaveDiagnostics() {
  const screen = document.getElementById('save-diag-screen');
  if (screen) screen.style.display = 'none';
  showHomeScreen();
}

function showProtocolScreen() {
  ['start-screen','tank-select-screen','lab-screen','achievements-screen','bestiary-screen','leaderboard-screen'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const protocolScreen = document.getElementById('protocol-screen');
  protocolScreen.scrollTop = 0;
  protocolScreen.style.display = 'flex';
  renderProtocolTree();
  requestAnimationFrame(() => {
    resetProtocolMapView();
    requestAnimationFrame(resetProtocolMapView);
  });
}
function hideProtocolScreen() {
  document.getElementById('protocol-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'flex';
  renderDifficultyButtons();
}

// --- Leaderboard ---
function createEmptyLeaderboardData() {
  return {
    clear: DIFFICULTY_ORDER.reduce((acc, d) => { acc[d] = []; return acc; }, {}),
    endless: DIFFICULTY_ORDER.reduce((acc, d) => { acc[d] = []; return acc; }, {}),
  };
}

function normalizeLeaderboardData(raw) {
  const data = createEmptyLeaderboardData();
  const source = raw && typeof raw === 'object' ? raw : {};
  const hasModes = source.clear || source.endless;
  if (hasModes) {
    ['clear', 'endless'].forEach(mode => {
      DIFFICULTY_ORDER.forEach(d => {
        data[mode][d] = Array.isArray(source[mode]?.[d]) ? source[mode][d] : [];
      });
    });
  } else {
    DIFFICULTY_ORDER.forEach(d => {
      data.endless[d] = Array.isArray(source[d]) ? source[d] : [];
    });
  }
  return data;
}

function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    leaderboardData = normalizeLeaderboardData(raw ? JSON.parse(raw) : {});
  } catch(e) { leaderboardData = createEmptyLeaderboardData(); }
}
function saveLeaderboard() {
  try { localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboardData)); } catch(e) {}
}
function addToLeaderboard(diff, scoreValue, tank, waveValue, mode = currentRunMode, victory = false) {
  leaderboardData = normalizeLeaderboardData(leaderboardData);
  const bucketMode = mode === 'endless' ? 'endless' : 'clear';
  if (bucketMode === 'clear' && !victory) return;
  if (!leaderboardData[bucketMode][diff]) leaderboardData[bucketMode][diff] = [];
  const report = runReport || {};
  const durationMs = report.endTime && report.startTime ? report.endTime - report.startTime : Math.max(0, runFrameCount * 1000 / 60);
  const bossAvg = report.bossKills > 0 ? Math.round((report.bossTimeFrames || 0) / report.bossKills / 60) : 0;
  const entry = {
    score: Math.max(0, Math.floor(scoreValue || 0)),
    tank,
    wave: Math.max(0, Math.floor(waveValue || 0)),
    date: new Date().toLocaleDateString('zh-CN'),
    durationMs,
    bossKills: report.bossKills || 0,
    bossAvg,
    damageTaken: report.damageTaken || 0,
    level,
    victory: !!victory,
  };
  leaderboardData[bucketMode][diff].push(entry);
  leaderboardData[bucketMode][diff].sort((a, b) => {
    if (bucketMode === 'clear') {
      if ((a.durationMs || 0) !== (b.durationMs || 0)) return (a.durationMs || 0) - (b.durationMs || 0);
      if ((a.damageTaken || 0) !== (b.damageTaken || 0)) return (a.damageTaken || 0) - (b.damageTaken || 0);
      return (b.score || 0) - (a.score || 0);
    }
    if ((b.wave || 0) !== (a.wave || 0)) return (b.wave || 0) - (a.wave || 0);
    if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
    return (b.bossKills || 0) - (a.bossKills || 0);
  });
  leaderboardData[bucketMode][diff] = leaderboardData[bucketMode][diff].slice(0, 8);
  saveLeaderboard();
}
function switchLeaderTab(diff) { leaderboardTab = diff; renderLeaderboard(); }
function switchLeaderMode(mode) { leaderboardMode = mode === 'endless' ? 'endless' : 'clear'; renderLeaderboard(); }
function renderLeaderboard() {
  leaderboardData = normalizeLeaderboardData(leaderboardData);
  const tabs = document.getElementById('leader-tabs');
  tabs.innerHTML = `<div class="leader-mode-tabs">
    <button class="leader-mode-tab${leaderboardMode==='clear'?' active':''}" onclick="switchLeaderMode('clear')">CLEAR ARCHIVE / 通关档案</button>
    <button class="leader-mode-tab${leaderboardMode==='endless'?' active':''}" onclick="switchLeaderMode('endless')">ENDLESS FRONT / 无尽战线</button>
  </div><div class="leader-diff-tabs">` + DIFFICULTY_ORDER.map(d =>
    `<button class="leader-tab${leaderboardTab===d?' active':''}" onclick="switchLeaderTab('${d}')">${difficultySettings[d].label}</button>`
  ).join('') + '</div>';
  const grid = document.getElementById('leader-grid');
  if (!leaderboardData[leaderboardMode][leaderboardTab]) leaderboardData[leaderboardMode][leaderboardTab] = [];
  const scores = leaderboardData[leaderboardMode][leaderboardTab] || [];
  if (scores.length === 0) {
    grid.innerHTML = '<div class="leader-empty">暂无记录<br>' + (leaderboardMode === 'clear'
      ? '通关固定战线后，会按用时与承伤归档'
      : '进入无尽战线后，会按最高波次与分数归档') + '</div>';
    return;
  }
  grid.innerHTML = scores.map((s, i) => {
    const rankClass = i === 0 ? 'gold' : (i === 1 ? 'silver' : (i === 2 ? 'bronze' : ''));
    const rankCodes = ['RK-I','RK-II','RK-III'];
    const tankNames = {spread:'扩散',focus:'集中',wide:'广域',burst:'爆裂',sniper:'狙击',homing:'追踪',border:'境界',blade:'斩魂',scarlet:'红枪',astral:'星仪'};
    const mainMetric = leaderboardMode === 'clear' ? formatMsAsTime(s.durationMs || 0) : 'WAVE ' + (s.wave || 0);
    const subMetric = leaderboardMode === 'clear'
      ? ('承伤 ' + (s.damageTaken || 0) + ' / Boss均时 ' + (s.bossAvg || 0) + 's')
      : ((s.score || 0).toLocaleString() + ' 分 / Boss ' + (s.bossKills || 0) + ' / LV ' + (s.level || 1));
    return `<div class="leader-row">
      <span class="leader-rank ${rankClass}">${rankCodes[i] || ('RK-' + String(i+1).padStart(2,'0'))}</span>
      <div class="leader-info">
        <div class="leader-score">${mainMetric}</div>
        <div class="leader-detail">${tankNames[s.tank]||'?'}型 / ${subMetric} / ${s.date}</div>
      </div>
    </div>`;
  }).join('');
}
function showLeaderboard() {
  renderLeaderboard();
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('leaderboard-screen').style.display = 'flex';
}
function hideLeaderboard() {
  document.getElementById('leaderboard-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'flex';
  renderDifficultyButtons();
}

// --- Game objects ---
let player;
let player2 = null;
let isDualMode = false;
let p2TankTypeGlobal = 'spread';
let dualSharedLives = 0;
let gamepadState = { leftX:0, leftY:0, rightX:0, rightY:0, shoot:false, connected:false };
let dualReviveCooldown = 0;
let p1DeadTimer = 0, p2DeadTimer = 0;
let enemies = [];
let playerBullets = [];
let enemyBullets = [];
const mines = [];
let spawnTimer = 0;
let difficultyTimer = 0;
const obstacles = [];

// --- Obstacle Types ---
const OBSTACLE_TYPES = {
  wall:   { color:'#4a4a4a', stroke:'#6a6a6a', passable:false, slow:0, minW:40, maxW:80, minH:30, maxH:60, weight:25 },
  bush:   { color:'#2a4a2a', stroke:'#3a6a3a', passable:true, slow:0.5, minW:25, maxW:55, minH:20, maxH:45, weight:15 },
  water:  { color:'#1a3366', stroke:'#2255aa', passable:true, slow:0.3, minW:30, maxW:70, minH:25, maxH:55, weight:12 },
  rubble: { color:'#554433', stroke:'#776655', passable:false, slow:0, minW:25, maxW:50, minH:20, maxH:40, weight:15 },
  crate:  { color:'#8a6a3a', stroke:'#aa8a5a', passable:false, slow:0, minW:18, maxW:28, minH:18, maxH:28, weight:12 },
  crystal:{ color:'#3a2a5a', stroke:'#7a5aaa', passable:false, slow:0, minW:15, maxW:25, minH:20, maxH:35, weight:8 },
  metal:  { color:'#445566', stroke:'#667788', passable:false, slow:0, minW:35, maxW:60, minH:25, maxH:45, weight:8 },
  bunker: { color:'#3a3028', stroke:'#5a5048', passable:false, slow:0, minW:50, maxW:90, minH:35, maxH:55, weight:5 },
  barrel:  { color:'#5a3010', stroke:'#c84', passable:false, slow:0, minW:20, maxW:28, minH:20, maxH:28, weight:8, explosive:true },
  bounce:  { color:'#304060', stroke:'#6af', passable:false, slow:0, minW:18, maxW:35, minH:12, maxH:20, weight:6, ricochet:true },
  brush:   { color:'#1a2a14', stroke:'#3a5a2a', passable:true, slow:0.2, minW:25, maxW:50, minH:20, maxH:40, weight:7, conceal:true },
  crater:  { color:'#332211', stroke:'#554433', passable:true,  slow:0.35, minW:45, maxW:90, minH:35, maxH:70, weight:10 },
  energy:  { color:'#1a2a3a', stroke:'#4a9acc', passable:true,  slow:0.25, minW:30, maxW:60, minH:25, maxH:50, weight:8 },
  wreck:   { color:'#443322', stroke:'#886644', passable:false, slow:0,    minW:35, maxW:70, minH:25, maxH:50, weight:10 },
  trench:  { color:'#1a1510', stroke:'#3a3020', passable:true,  slow:0.45, minW:55, maxW:120, minH:20, maxH:50, weight:6  },
  scorched:{ color:'#1a0c0a', stroke:'#4a2018', passable:true,  slow:0.2,  minW:35, maxW:75, minH:25, maxH:55, weight:7  },
  ruins:   { color:'#3a3428', stroke:'#6a6050', passable:false, slow:0,    minW:40, maxW:85, minH:30, maxH:60, weight:7  },
  reactor: { color:'#1a2828', stroke:'#2a8888', passable:false, slow:0,    minW:30, maxW:55, minH:30, maxH:55, weight:5  },
  spires:  { color:'#2a1a3a', stroke:'#5a3a7a', passable:false, slow:0,    minW:20, maxW:40, minH:30, maxH:65, weight:6  },
  stone_sm:{ color:'#4a4a44', stroke:'#6a6a60', passable:true, slow:0.15, minW:12, maxW:20, minH:10, maxH:18, weight:15 },
  stone_lg:{ color:'#3a3a38', stroke:'#5a5a50', passable:false, slow:0, minW:30, maxW:55, minH:25, maxH:45, weight:12 },
  plank:   { color:'#6a4a2a', stroke:'#8a6a4a', passable:false, slow:0, minW:25, maxW:50, minH:10, maxH:16, weight:9, destructible:true },
  iron:    { color:'#3a4048', stroke:'#6a7078', passable:false, slow:0, minW:30, maxW:65, minH:12, maxH:22, weight:8, spark:true },
  gravel:  { color:'#3a3028', stroke:'#5a4840', passable:true, slow:0.4, minW:20, maxW:45, minH:15, maxH:35, weight:11 },
  pipes:   { color:'#444440', stroke:'#6a6a50', passable:false, slow:0, minW:15, maxW:25, minH:30, maxH:55, weight:7 },
};

function refreshObstacles() {
  // Remove ~5% of obstacles far from player
  const removeCount = Math.max(1, Math.floor(obstacles.length * 0.05));
  for (let i = 0; i < removeCount; i++) {
    let bestIdx = 0, bestDist = 0;
    for (let j = 0; j < obstacles.length; j++) {
      const pdx = player ? (obstacles[j].x + obstacles[j].w/2 - player.x) : 0;
      const pdy = player ? (obstacles[j].y + obstacles[j].h/2 - player.y) : 0;
      const pDist = pdx*pdx + pdy*pdy;
      if (pDist > bestDist) { bestDist = pDist; bestIdx = j; }
    }
    if (obstacles.length > 8) obstacles.splice(bestIdx, 1);
  }
  // Add 5% new obstacles — never near player, weighted random
  const addCount = Math.max(1, Math.floor(obstacles.length * 0.05));
  const allTypes = Object.entries(OBSTACLE_TYPES);
  const totalWeight = allTypes.reduce((s, [,d]) => s + d.weight, 0);
  for (let i = 0; i < addCount; i++) {
    // Weighted random selection
    const roll = rng() * totalWeight;
    let cumulative = 0, obsKey = 'wall';
    for (const [key, d] of allTypes) {
      cumulative += d.weight;
      if (roll < cumulative) { obsKey = key; break; }
    }
    const def = OBSTACLE_TYPES[obsKey];
    let attempts = 0, ox, oy, ow, oh;
    do {
      ox = 50 + rng() * (W - 100); oy = 50 + rng() * (H - 100);
      ow = def.minW + rng() * (def.maxW - def.minW);
      oh = def.minH + rng() * (def.maxH - def.minH);
      attempts++;
    } while (attempts < 10 && player &&
      Math.abs((ox + ow/2) - player.x) < 80 && Math.abs((oy + oh/2) - player.y) < 80);
    if (attempts >= 10) continue;
    const obs = { x: ox, y: oy, w: ow, h: oh, type: obsKey,
      passable: def.passable, slow: def.slow, color: def.color, stroke: def.stroke };
    if (def.explosive) { obs.explosive = true; obs.hp = 2; }
    if (def.ricochet) obs.ricochet = true;
    if (def.destructible) obs.hp = 1;
    if (def.spark) obs.spark = true;
    obstacles.push(obs);
  }
}

function generateObstacles(countOverride) {
  const prevLen = obstacles.length;
  const count = countOverride || Math.max(18, 18 + wave * 1.5);
  const totalWeight = Object.values(OBSTACLE_TYPES).reduce((s, d) => s + d.weight, 0);
  const keepOutZones = [
    { x: W / 2, y: H - 70, r: 90 },
    { x: W / 2, y: H - 130, r: 72 },
  ];

  for (let i = 0; i < count; i++) {
    const roll = rng() * totalWeight;
    let cumulative = 0, obsType = 'wall';
    for (const [key, def] of Object.entries(OBSTACLE_TYPES)) {
      cumulative += def.weight;
      if (roll < cumulative) { obsType = key; break; }
    }
    const def = OBSTACLE_TYPES[obsType];
    const ox = 40 + rng() * (W - 80);
    const oy = 40 + rng() * (H - 80);
    const ow = def.minW + rng() * (def.maxW - def.minW);
    const oh = def.minH + rng() * (def.maxH - def.minH);
    const cx0 = ox + ow / 2, cy0 = oy + oh / 2;
    const blockedMain = keepOutZones.some(z => {
      const dx = cx0 - z.x, dy = cy0 - z.y;
      return Math.sqrt(dx * dx + dy * dy) < z.r;
    });
    if (blockedMain) continue;
    const obs = { x: ox, y: oy, w: ow, h: oh, type: obsType, passable: def.passable, slow: def.slow, color: def.color, stroke: def.stroke };
    if (def.explosive) { obs.explosive = true; obs.hp = 2; }
    if (def.ricochet) obs.ricochet = true;
    if (def.conceal) obs.conceal = true;
    if (def.destructible) obs.hp = 1;
    if (def.spark) obs.spark = true;
    obstacles.push(obs);

    // 30% chance to spawn 1-2 smaller obstacles nearby (cluster effect)
    if (rng() < 0.3) {
      for (let j = 0; j < 1 + Math.floor(rng() * 2); j++) {
        const cx = ox + (rng() - 0.5) * 60;
        const cy = oy + (rng() - 0.5) * 60;
        if (cx < 30 || cx > W - 30 || cy < 30 || cy > H - 30) continue;
        const ctype = obsType === 'wall' ? (rng() < 0.5 ? 'crate' : 'rubble') : obsType;
        const cd = OBSTACLE_TYPES[ctype];
        const cw = cd.minW + rng() * (cd.maxW - cd.minW) * 0.7;
        const ch = cd.minH + rng() * (cd.maxH - cd.minH) * 0.7;
        const ccx = cx + cw / 2, ccy = cy + ch / 2;
        const blockedCluster = keepOutZones.some(z => {
          const dx = ccx - z.x, dy = ccy - z.y;
          return Math.sqrt(dx * dx + dy * dy) < z.r;
        });
        if (blockedCluster) continue;
        const cobs = { x: cx, y: cy, w: cw, h: ch, type: ctype, passable: cd.passable, slow: cd.slow, color: cd.color, stroke: cd.stroke };
        if (cd.explosive) { cobs.explosive = true; cobs.hp = 2; }
        if (cd.ricochet) cobs.ricochet = true;
        if (cd.destructible) cobs.hp = 1;
        obstacles.push(cobs);
      }
    }
  }
}

function drawObstacles(ctx) {
  // Shadow under all obstacles for depth
  for (const obs of obstacles) {
    if (obs.passable) continue;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(obs.x + 3, obs.y + 3, obs.w, obs.h);
  }
  for (const obs of obstacles) {
    if (obs.type === 'wall') {
      // Concrete wall — brick seam pattern
      ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = obs.stroke; ctx.lineWidth = 2; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 0.6;
      for (let by = obs.y + 6; by < obs.y + obs.h; by += 10) {
        ctx.beginPath(); ctx.moveTo(obs.x + 2, by); ctx.lineTo(obs.x + obs.w - 2, by); ctx.stroke();
        // Staggered vertical seams
        const offset = (Math.floor((by - obs.y) / 10) % 2) * 15;
        for (let bx = obs.x + offset + 10; bx < obs.x + obs.w; bx += 30) {
          ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + 10); ctx.stroke();
        }
      }
      ctx.strokeStyle = '#555'; ctx.lineWidth = 0.5;
      for (let gx = obs.x + 5; gx < obs.x + obs.w; gx += 6) {
        ctx.beginPath(); ctx.moveTo(gx, obs.y); ctx.lineTo(gx, obs.y + obs.h); ctx.stroke();
      }
      for (let gy = obs.y + 5; gy < obs.y + obs.h; gy += 6) {
        ctx.beginPath(); ctx.moveTo(obs.x, gy); ctx.lineTo(obs.x + obs.w, gy); ctx.stroke();
      }
    } else if (obs.type === 'bush') {
      ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = obs.stroke; ctx.lineWidth = 1; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      ctx.fillStyle = '#3a7a3a';
      for (let j = 0; j < 10; j++) {
        const bx = obs.x + 3 + rng() * (obs.w - 6);
        const by = obs.y + 3 + rng() * (obs.h - 6);
        ctx.beginPath(); ctx.arc(bx, by, 2 + rng() * 3, 0, Math.PI*2); ctx.fill();
      }
    } else if (obs.type === 'water') {
      ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = obs.stroke; ctx.lineWidth = 1; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = '#4488cc'; ctx.lineWidth = 1;
      const t = Date.now() / 1000;
      for (let wy = obs.y + 3; wy < obs.y + obs.h; wy += 7) {
        ctx.beginPath();
        for (let wx = obs.x + 2; wx < obs.x + obs.w; wx += 2) {
          const wy2 = wy + Math.sin(t + wy * 0.1 + wx * 0.05) * 2;
          wx === obs.x + 2 ? ctx.moveTo(wx, wy2) : ctx.lineTo(wx, wy2);
        }
        ctx.stroke();
      }
    } else if (obs.type === 'rubble') {
      // Irregular rubble pile — jagged polygon
      ctx.fillStyle = obs.color; ctx.strokeStyle = obs.stroke; ctx.lineWidth = 1.2;
      ctx.beginPath();
      const pts = 5 + Math.floor(rng() * 3);
      for (let p = 0; p < pts; p++) {
        const a = (p / pts) * Math.PI * 2;
        const rx = obs.x + obs.w/2 + Math.cos(a) * (obs.w/2 - 3 + rng() * 6);
        const ry = obs.y + obs.h/2 + Math.sin(a) * (obs.h/2 - 3 + rng() * 4);
        if (p === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = obs.stroke; ctx.lineWidth = 1; ctx.stroke();
    } else if (obs.type === 'crate') {
      ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = obs.stroke; ctx.lineWidth = 2; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(obs.x, obs.y); ctx.lineTo(obs.x + obs.w, obs.y + obs.h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(obs.x + obs.w, obs.y); ctx.lineTo(obs.x, obs.y + obs.h); ctx.stroke();
      ctx.fillStyle = '#aa8a5a'; ctx.fillRect(obs.x + obs.w/2 - 4, obs.y + obs.h/2 - 4, 8, 8);
    } else if (obs.type === 'metal') {
      // Industrial steel plate — rivets + hazard stripe
      ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = obs.stroke; ctx.lineWidth = 2.5; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      ctx.fillStyle = 'rgba(255,180,0,0.3)'; ctx.fillRect(obs.x + 2, obs.y + obs.h/2 - 2, obs.w - 4, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      for (let r = 0; r < 3; r++) {
        const rx = obs.x + 6 + r * (obs.w / 3); const ry = obs.y + 6 + r * (obs.h / 3);
        ctx.beginPath(); ctx.arc(rx, ry, 2, 0, Math.PI*2); ctx.fill();
      }
    } else if (obs.type === 'crystal') {
      ctx.fillStyle = obs.color; ctx.strokeStyle = obs.stroke; ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let s = 0; s < 6; s++) {
        const sa = (s/6)*Math.PI*2 - Math.PI/2;
        const sr = obs.w/2 * (0.35 + (s%3)*0.25);
        const sx = obs.x + obs.w/2 + Math.cos(sa)*sr;
        const sy = obs.y + obs.h/2 + Math.sin(sa)*sr;
        ctx.lineTo(obs.x+obs.w/2, obs.y+obs.h/2); ctx.lineTo(sx, sy);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath();
      ctx.arc(obs.x+obs.w*0.35, obs.y+obs.h*0.3, obs.w*0.1, 0, Math.PI*2); ctx.fill();
      // Rivets
      ctx.fillStyle = '#8899aa';
      for (let rx = obs.x + 6; rx < obs.x + obs.w; rx += 14) {
        for (let ry = obs.y + 6; ry < obs.y + obs.h; ry += 14) {
          ctx.beginPath(); ctx.arc(rx, ry, 2, 0, Math.PI*2); ctx.fill();
        }
      }
      ctx.strokeStyle = '#556678'; ctx.lineWidth = 1;
      ctx.strokeRect(obs.x + 3, obs.y + 3, obs.w - 6, obs.h - 6);
    } else if (obs.type === 'bunker') {
      if (rng() < 0.35) {
        // L-shaped bunker variant
        ctx.fillStyle = obs.color;
        ctx.beginPath(); ctx.moveTo(obs.x, obs.y); ctx.lineTo(obs.x + obs.w, obs.y);
        ctx.lineTo(obs.x + obs.w, obs.y + obs.h * 0.4); ctx.lineTo(obs.x + obs.w * 0.4, obs.y + obs.h * 0.4);
        ctx.lineTo(obs.x + obs.w * 0.4, obs.y + obs.h); ctx.lineTo(obs.x, obs.y + obs.h); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = obs.stroke; ctx.lineWidth = 2.5; ctx.stroke();
      } else {
        ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeStyle = obs.stroke; ctx.lineWidth = 3; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      }
      // Gun slit
      ctx.fillStyle = '#111';
      ctx.fillRect(obs.x + obs.w/2 - 12, obs.y - 2, 24, 6);
      ctx.strokeStyle = '#888'; ctx.lineWidth = 1;
      ctx.strokeRect(obs.x + obs.w/2 - 12, obs.y - 2, 24, 6);
      // Concrete lines
      ctx.strokeStyle = '#4a4038'; ctx.lineWidth = 0.5;
      for (let ly = obs.y + obs.h * 0.4; ly < obs.y + obs.h; ly += obs.h * 0.3) {
        ctx.beginPath(); ctx.moveTo(obs.x, ly); ctx.lineTo(obs.x + obs.w, ly); ctx.stroke();
      }
    } else if (obs.type === 'crater') {
      ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = obs.stroke; ctx.lineWidth = 1.5; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      const cGrad = ctx.createRadialGradient(obs.x + obs.w/2, obs.y + obs.h/2, 4, obs.x + obs.w/2, obs.y + obs.h/2, obs.w * 0.4);
      cGrad.addColorStop(0, 'rgba(20,12,6,0.5)'); cGrad.addColorStop(1, obs.color);
      ctx.fillStyle = cGrad; ctx.fillRect(obs.x + 4, obs.y + 4, obs.w - 8, obs.h - 8);
    } else if (obs.type === 'energy') {
      ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = obs.stroke; ctx.lineWidth = 2; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      ctx.fillStyle = 'rgba(100,180,255,0.15)';
      ctx.fillRect(obs.x + 3, obs.y + 3, obs.w - 6, obs.h - 6);
    } else if (obs.type === 'wreck') {
      // Bent metal scrap — angular trapezoid
      ctx.fillStyle = obs.color; ctx.strokeStyle = obs.stroke; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(obs.x + 6, obs.y + obs.h);
      ctx.lineTo(obs.x + rng()*6, obs.y + 3);
      ctx.lineTo(obs.x + obs.w - 4, obs.y);
      ctx.lineTo(obs.x + obs.w - rng()*4, obs.y + obs.h - 2);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#553311'; ctx.lineWidth = 0.8;
      for (let lx = obs.x + 6; lx < obs.x + obs.w; lx += 14) {
        ctx.beginPath(); ctx.moveTo(lx, obs.y + 3); ctx.lineTo(lx + 5, obs.y + obs.h - 2); ctx.stroke();
      }
    } else if (obs.type === 'trench') {
      const tGrad = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.h);
      tGrad.addColorStop(0, '#2a2018'); tGrad.addColorStop(0.5, '#0d0a06'); tGrad.addColorStop(1, '#1a1008');
      ctx.fillStyle = tGrad; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = '#4a3828'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(obs.x, obs.y);
      for (let tx = obs.x; tx <= obs.x + obs.w; tx += 8) {
        ctx.lineTo(tx, obs.y + (Math.sin(tx * 0.3 + obs.x) * 4));
      }
      ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
      for (let tx = obs.x + obs.w; tx >= obs.x; tx -= 8) {
        ctx.lineTo(tx, obs.y + obs.h + (Math.sin(tx * 0.3 + obs.x) * 3));
      }
      ctx.closePath(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,150,30,0.3)'; ctx.lineWidth = 0.8;
      for (let lx = obs.x + 10; lx < obs.x + obs.w; lx += 20) {
        ctx.beginPath(); ctx.moveTo(lx, obs.y + 3); ctx.lineTo(lx + 6, obs.y + obs.h - 3); ctx.stroke();
      }
    } else if (obs.type === 'scorched') {
      const sGrad = ctx.createRadialGradient(obs.x + obs.w/2, obs.y + obs.h/2, 5, obs.x + obs.w/2, obs.y + obs.h/2, obs.w/1.5);
      sGrad.addColorStop(0, 'rgba(30,15,10,0.6)'); sGrad.addColorStop(0.5, 'rgba(20,8,5,0.5)'); sGrad.addColorStop(1, 'rgba(50,20,12,0.2)');
      ctx.fillStyle = sGrad; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = '#5a2818'; ctx.lineWidth = 1.5; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      ctx.fillStyle = 'rgba(255,120,30,0.35)';
      for (let e = 0; e < 6; e++) {
        const ex = obs.x + ((e * 37 + obs.x) % obs.w);
        const ey = obs.y + ((e * 53 + obs.y) % obs.h);
        ctx.beginPath(); ctx.arc(ex, ey, 1.5 + (e % 2), 0, Math.PI*2); ctx.fill();
      }
    } else if (obs.type === 'ruins') {
      ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = obs.stroke; ctx.lineWidth = 2.5; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = '#5a5040'; ctx.lineWidth = 1;
      for (let px = obs.x + 8; px < obs.x + obs.w; px += 20) {
        ctx.beginPath(); ctx.moveTo(px, obs.y + 4); ctx.lineTo(px, obs.y + obs.h - 4); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(244,152,0,0.25)';
      const rx = obs.x + obs.w/2, ry = obs.y + obs.h/2;
      ctx.beginPath(); ctx.arc(rx, ry, obs.w * 0.2, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx - obs.w*0.15, ry); ctx.lineTo(rx + obs.w*0.15, ry); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx, ry - obs.w*0.15); ctx.lineTo(rx, ry + obs.w*0.15); ctx.stroke();
    } else if (obs.type === 'reactor') {
      ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = obs.stroke; ctx.lineWidth = 2; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      const pulse = Math.sin(Date.now() / 400 + obs.x * 0.01) * 0.15 + 0.5;
      const cx = obs.x + obs.w/2, cy = obs.y + obs.h/2, cr = obs.w * 0.18;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      coreGrad.addColorStop(0, 'rgba(150,255,255,' + pulse.toFixed(2) + ')');
      coreGrad.addColorStop(0.5, 'rgba(30,180,180,' + (pulse*0.6).toFixed(2) + ')');
      coreGrad.addColorStop(1, 'rgba(0,60,60,0)');
      ctx.fillStyle = coreGrad; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(80,220,220,' + (pulse*0.5).toFixed(2) + ')'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, cr + 4, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = 'rgba(40,160,160,0.4)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.arc(cx, cy, cr + 10, 0, Math.PI*2); ctx.stroke();
    } else if (obs.type === 'spires') {
      const spireGrad = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.h);
      spireGrad.addColorStop(0, '#4a2a6a'); spireGrad.addColorStop(0.5, '#2a1a3a'); spireGrad.addColorStop(1, '#1a0a2a');
      ctx.fillStyle = spireGrad; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      const spireCount = 2 + Math.floor(obs.w / 20);
      for (let si = 0; si < spireCount; si++) {
        const sx = obs.x + (si + 0.5) * (obs.w / spireCount);
        const sh = obs.h * (0.5 + (si % 3) * 0.2);
        ctx.fillStyle = 'rgba(120,80,180,0.3)';
        ctx.beginPath(); ctx.moveTo(sx - 6, obs.y + obs.h);
        ctx.lineTo(sx, obs.y + obs.h - sh); ctx.lineTo(sx + 6, obs.y + obs.h); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#7a5aaa'; ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.fillStyle = 'rgba(200,160,255,0.5)';
      for (let sp = 0; sp < 3; sp++) {
        const spx = obs.x + ((sp * 47 + obs.x) % obs.w);
        const spy = obs.y + ((sp * 31 + obs.y) % (obs.h * 0.7));
        ctx.beginPath(); ctx.arc(spx, spy, 1.2, 0, Math.PI*2); ctx.fill();
      }
    } else if (obs.type === 'barrel') {
      ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = obs.stroke; ctx.lineWidth = 2; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      // Danger stripe
      ctx.fillStyle = '#fc0'; ctx.fillRect(obs.x + 4, obs.y + obs.h/2 - 2, obs.w - 8, 4);
      ctx.fillStyle = '#f00'; ctx.beginPath(); ctx.arc(obs.x + obs.w/2, obs.y + 3, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ff0'; ctx.beginPath(); ctx.arc(obs.x + obs.w/2, obs.y + 3, 1.5, 0, Math.PI*2); ctx.fill();
    } else if (obs.type === 'bounce') {
      const t = Date.now()/1000;
      ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = obs.stroke; ctx.lineWidth = 2; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      // Pulsing glow — highly readable
      const glow = Math.sin(t * 3 + obs.x * 0.02) * 0.3 + 0.7;
      ctx.shadowColor = '#6af'; ctx.shadowBlur = 6 * glow;
      ctx.strokeStyle = 'rgba(100,170,255,'+(0.3+Math.sin(t*2+obs.x)*0.15)+')'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(obs.x, obs.y+obs.h/2); ctx.lineTo(obs.x+obs.w, obs.y+obs.h/2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(obs.x+obs.w/2, obs.y); ctx.lineTo(obs.x+obs.w/2, obs.y+obs.h); ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (obs.type === 'brush') {
      ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = obs.stroke; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.strokeRect(obs.x, obs.y, obs.w, obs.h); ctx.setLineDash([]);
      for (let g = 0; g < 4; g++) {
        const gx = obs.x + 4 + g * (obs.w/5); const gy = obs.y + rng() * obs.h * 0.7;
        ctx.fillStyle = '#4a7a3a'; ctx.beginPath(); ctx.ellipse(gx, gy, 3, 8, rng(), 0, Math.PI*2); ctx.fill();
      }
    } else if (obs.type === 'stone_sm') {
      // Small gravel stones — irregular cluster
      ctx.fillStyle = obs.color; ctx.strokeStyle = obs.stroke; ctx.lineWidth = 1;
      for (let s = 0; s < 3; s++) {
        const sx = obs.x + s * (obs.w/3) + rng() * 3;
        const sy = obs.y + s * (obs.h/3) + rng() * 2;
        const sr = 3 + rng() * 3;
        ctx.beginPath(); ctx.arc(sx + sr, sy + sr, sr, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      }
    } else if (obs.type === 'stone_lg') {
      // Large boulder — rounded
      ctx.fillStyle = obs.color; ctx.strokeStyle = obs.stroke; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(obs.x + obs.w/2, obs.y + obs.h/2, obs.w/2, obs.h/2, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(obs.x + obs.w*0.3, obs.y + obs.h*0.35, obs.w*0.1, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(obs.x + obs.w*0.65, obs.y + obs.h*0.6, obs.w*0.07, 0, Math.PI*2); ctx.stroke();
    } else if (obs.type === 'plank') {
      // Wooden planks — horizontal grain
      ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = obs.stroke; ctx.lineWidth = 1.5; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = '#4a3a1a'; ctx.lineWidth = 0.5;
      for (let g = 0; g < obs.w / 6; g++) {
        ctx.beginPath(); ctx.moveTo(obs.x + g * 6, obs.y + 2); ctx.lineTo(obs.x + g * 6 + 3, obs.y + obs.h - 2); ctx.stroke();
      }
    } else if (obs.type === 'iron') {
      // Rusted iron plate — spark effect + triangular shard variant
      if (rng() < 0.4) {
        // Triangular scrap shard
        ctx.fillStyle = obs.color; ctx.strokeStyle = obs.stroke; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(obs.x + obs.w/2, obs.y);
        ctx.lineTo(obs.x, obs.y + obs.h); ctx.lineTo(obs.x + obs.w, obs.y + obs.h); ctx.closePath(); ctx.fill(); ctx.stroke();
      } else {
        ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeStyle = obs.stroke; ctx.lineWidth = 2.5; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      }
      ctx.fillStyle = '#5a3010'; ctx.fillRect(obs.x + 3, obs.y + 3, 8, 8);
      ctx.fillStyle = '#7a4020'; ctx.fillRect(obs.x + obs.w - 10, obs.y + obs.h - 10, 6, 6);
    } else if (obs.type === 'gravel') {
      // Loose gravel — many small dots
      ctx.fillStyle = obs.color; ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.strokeStyle = obs.stroke; ctx.lineWidth = 1; ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
      ctx.fillStyle = '#5a4840';
      for (let d = 0; d < 8; d++) {
        const dx = obs.x + 3 + ((d * 17) % obs.w); const dy = obs.y + 3 + ((d * 23) % obs.h);
        ctx.beginPath(); ctx.arc(dx, dy, 1.5 + (d%3)*0.5, 0, Math.PI*2); ctx.fill();
      }
    } else if (obs.type === 'pipes') {
      // Vertical industrial pipes
      ctx.fillStyle = obs.color; ctx.strokeStyle = obs.stroke; ctx.lineWidth = 1.5;
      const pipeW = obs.w / 3;
      for (let p = 0; p < 3; p++) {
        const px = obs.x + p * pipeW + 2;
        ctx.fillRect(px, obs.y, pipeW - 4, obs.h); ctx.strokeRect(px, obs.y, pipeW - 4, obs.h);
        ctx.fillStyle = '#222'; ctx.fillRect(px + 1, obs.y + 1, pipeW - 6, obs.h - 2);
        ctx.fillStyle = obs.color;
      }
    }
  }
}

function bulletHitsObstacle(bullet) {
  for (const obs of obstacles) {
    if (bullet.x > obs.x && bullet.x < obs.x + obs.w &&
        bullet.y > obs.y && bullet.y < obs.y + obs.h) {
      if (obs.explosive || obs.destructible) {
        obs.hp = (obs.hp || 1) - 1;
        if (obs.hp <= 0) {
          if (obs.explosive) {
            const cx = obs.x + obs.w/2, cy = obs.y + obs.h/2;
            spawnExplosion(cx, cy, 45, '#f80', '#ff0');
            triggerShake(4, 6);
            // Chain reaction: damage nearby explosive barrels
            for (const other of obstacles) {
              if (other === obs || !other.explosive) continue;
              const dx = (other.x + other.w/2) - cx, dy = (other.y + other.h/2) - cy;
              if (Math.sqrt(dx*dx + dy*dy) < 80) other.hp = (other.hp || 2) - 1;
            }
          } else {
            spawnExplosion(obs.x + obs.w/2, obs.y + obs.h/2, 12, '#a80', '#da0');
            // Small chance to drop power-up on destruction
            if (rng() < 0.15) spawnPowerUp(obs.x + obs.w/2, obs.y + obs.h/2);
          }
          obstacles.splice(obstacles.indexOf(obs), 1);
        } else { spawnExplosion(bullet.x, bullet.y, 5, obs.explosive ? '#f80' : '#a80', '#fc0'); }
        return true;
      }
      if (obs.spark) {
        spawnExplosion(bullet.x, bullet.y, 3, '#6af', '#fff');
        return true;
      }
      if (obs.ricochet) {
        // Bounce plate: reflected bullets get double damage
        bullet.damage = (bullet.damage || 1) + 1;
        const cx = obs.x + obs.w/2, cy = obs.y + obs.h/2;
        if (Math.abs(bullet.x - cx) / obs.w > Math.abs(bullet.y - cy) / obs.h) {
          bullet.angle = Math.PI - bullet.angle;
        } else {
          bullet.angle = -bullet.angle;
        }
        spawnExplosion(bullet.x, bullet.y, 3, '#6af', '#fff');
        return false;
      }
      if (obs.passable) return false;
      if (bullet.ricochet && bullet.bounces > 0) {
        const cx = obs.x + obs.w/2, cy = obs.y + obs.h/2;
        if (Math.abs(bullet.x - cx) / obs.w > Math.abs(bullet.y - cy) / obs.h) {
          bullet.angle = Math.PI - bullet.angle;
        } else {
          bullet.angle = -bullet.angle;
        }
        bullet.bounces--;
        spawnExplosion(bullet.x, bullet.y, 3, '#fa4', '#ff0');
        return false;
      }
      if (!bullet.railgun) {
        spawnExplosion(bullet.x, bullet.y, 4, '#aaa', '#888');
        return true;
      }
    }
  }
  return false;
}

function tankCollidesObstacle(x, y, w, h) {
  for (const obs of obstacles) {
    if (obs.passable) continue;
    if (x - w/2 < obs.x + obs.w && x + w/2 > obs.x &&
        y - h/2 < obs.y + obs.h && y + h/2 > obs.y) {
      return true;
    }
  }
  return false;
}

function hasLineOfSight(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= 1) return true;
  const steps = Math.min(42, Math.max(8, Math.ceil(dist / 22)));
  for (let i = 1; i < steps; i++) {
    const px = x1 + dx * i / steps;
    const py = y1 + dy * i / steps;
    for (const obs of obstacles) {
      if (px > obs.x - 4 && px < obs.x + obs.w + 4 &&
          py > obs.y - 4 && py < obs.y + obs.h + 4) {
        return false;
      }
    }
  }
  return true;
}

function distanceToNearestEnemy(x, y) {
  let nearest = Infinity;
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const dx = enemy.x - x, dy = enemy.y - y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < nearest) nearest = d;
  }
  return nearest;
}

function isSafeTankPosition(x, y, w, h, minEnemyDist, minPlayerDist) {
  if (x < 30 || x > W - 30 || y < 30 || y > H - 30) return false;
  if (tankCollidesObstacle(x, y, w, h)) return false;
  if (Number.isFinite(minEnemyDist) && distanceToNearestEnemy(x, y) < minEnemyDist) return false;
  if (player && Number.isFinite(minPlayerDist) && minPlayerDist > 0) {
    const pdx = player.x - x, pdy = player.y - y;
    if (Math.sqrt(pdx * pdx + pdy * pdy) < minPlayerDist) return false;
  }
  return true;
}

function findSafeTankSpawn(options = {}) {
  const w = options.w || 36;
  const h = options.h || 36;
  const minEnemyDist = options.minEnemyDist || 0;
  const minPlayerDist = options.minPlayerDist || 0;
  const preferred = options.preferred || [
    { x: W / 2, y: H - 70 },
    { x: W / 2, y: H - 120 },
    { x: W / 2, y: H * 0.75 },
    { x: W * 0.25, y: H * 0.75 },
    { x: W * 0.75, y: H * 0.75 },
    { x: W / 2, y: H / 2 },
  ];

  for (const p of preferred) {
    if (isSafeTankPosition(p.x, p.y, w, h, minEnemyDist, minPlayerDist)) return { x: p.x, y: p.y };
  }

  let best = null;
  let bestScore = -Infinity;
  for (let i = 0; i < 180; i++) {
    const x = 40 + rng() * (W - 80);
    const y = 40 + rng() * (H - 80);
    if (tankCollidesObstacle(x, y, w, h)) continue;
    if (player && minPlayerDist > 0) {
      const pdx = player.x - x, pdy = player.y - y;
      if (Math.sqrt(pdx * pdx + pdy * pdy) < minPlayerDist) continue;
    }
    const edgePenalty = Math.min(x, W - x, y, H - y);
    const enemyDist = Math.min(999, distanceToNearestEnemy(x, y));
    const playerDist = player ? Math.min(600, Math.sqrt((player.x - x) * (player.x - x) + (player.y - y) * (player.y - y))) : 160;
    const score = edgePenalty + enemyDist * 1.6 + playerDist * 0.75;
    if (enemyDist >= minEnemyDist && score > bestScore) {
      best = { x, y };
      bestScore = score;
    }
  }
  if (best) return best;

  for (let i = 0; i < 180; i++) {
    const x = 40 + rng() * (W - 80);
    const y = 40 + rng() * (H - 80);
    if (!tankCollidesObstacle(x, y, w, h) && (!player || minPlayerDist <= 0 || Math.sqrt((player.x - x) * (player.x - x) + (player.y - y) * (player.y - y)) >= minPlayerDist)) {
      return { x, y };
    }
  }
  return { x: W / 2, y: H - 70 };
}

function positionPlayerSafely(minEnemyDist) {
  if (!player) return;
  const hb = player.hitboxSize || 36;
  const safe = findSafeTankSpawn({ w: hb, h: hb, minEnemyDist: minEnemyDist || 140 });
  player.x = safe.x;
  player.y = safe.y;
}

// --- Spawn enemies ---
const enemyTypes = [
  // observatory: steel blue, precise
  { kind:'scout',    color: '#183050', turret: '#68b8e8', speed: 0.5,  hp: 2, label: 'Scout',     faction:'observatory' },
  { kind:'sniper',   color: '#142840', turret: '#50a8d8', speed: 0.38, hp: 1, label: 'Sniper',    faction:'observatory' },
  // storm_cloister: electric blue, fast
  { kind:'runner',   color: '#183060', turret: '#48a8f0', speed: 0.7,  hp: 1, label: 'Fast',      faction:'storm_cloister' },
  // moon_arsenal: dark red, heavy military
  { kind:'brute',    color: '#501818', turret: '#d84848', speed: 0.4,  hp: 3, label: 'Heavy',     faction:'moon_arsenal' },
  // ash_church: brown-gold, faithful
  { kind:'artillery',color: '#4a2810', turret: '#d0a040', speed: 0.6,  hp: 3, label: 'Elite',     faction:'ash_church' },
  { kind:'buffer',   color: '#3a2810', turret: '#90c860', speed: 0.45, hp: 3, label: 'Buffer',    faction:'ash_church' },
  // graveyard: rust brown, scavenged
  { kind:'sapper',   color: '#4a2010', turret: '#e08040', speed: 0.55, hp: 2, label: 'Sapper',    faction:'graveyard' },
  // void_cult: deep purple, alien
  { kind:'fissure',  color: '#2a1040', turret: '#9880e0', speed: 0.5,  hp: 2, label: 'Fissure',   faction:'void_cult' },
];

function spawnEnemy() {
  let x, y, safe;
  const diff = difficultySettings[currentDifficulty] || difficultySettings.normal;
  const minDistToPlayer = player && player.invincible > 0 ? 220 : 150;
  let attempts = 0;
  do {
    safe = true;
    const side = Math.floor(rng() * 4);
    if (side === 0) { x = 40; y = rng() * H; }
    else if (side === 1) { x = W - 40; y = rng() * H; }
    else if (side === 2) { x = rng() * W; y = 40; }
    else { x = rng() * W; y = H - 40; }
    safe = !tankCollidesObstacle(x, y, 36, 36);
    const pdx = player.x - x, pdy = player.y - y;
    safe = safe && Math.sqrt(pdx*pdx + pdy*pdy) > minDistToPlayer;
    if (safe) {
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        const edx = enemy.x - x, edy = enemy.y - y;
        if (Math.sqrt(edx * edx + edy * edy) < 60) { safe = false; break; }
      }
    }
    attempts++;
  } while (!safe && attempts < 80);

  if (!safe) {
    const rescue = findSafeTankSpawn({
      w: 36,
      h: 36,
      minEnemyDist: Math.max(80, minDistToPlayer - 30),
      minPlayerDist: minDistToPlayer,
      preferred: [
        { x: 40, y: 40 },
        { x: W - 40, y: 40 },
        { x: 40, y: H - 40 },
        { x: W - 40, y: H - 40 },
        { x: W / 2, y: 40 },
        { x: W / 2, y: H - 40 },
      ],
    });
    x = rescue.x;
    y = rescue.y;
  }

  // Chance to spawn elite (increases with level)
  const baseEliteChance = 0.09 + wave * 0.018 + level * 0.012;
  const eliteChance = Math.min(0.58, baseEliteChance * (diff.eliteChanceMul || 1));
  if (wave >= 3 && rng() < eliteChance) {
    const maxIdx = Math.min(eliteTypes.length - 1, Math.floor((wave + level) / 3));
    const idx = Math.floor(rng() * (maxIdx + 1));
    const etype = eliteTypes[idx];
    const elite = new EliteEnemy(x, y, etype);
    elite.hp = Math.floor((elite.hp + Math.floor(wave / 5)) * getDualModeEnemyMul());
    elite.maxHp = elite.hp;
    elite.shootDelay = Math.max(36, Math.floor(elite.shootDelay * 0.92));
    enemies.push(elite);
    return true;
  }

  const maxIdx = Math.min(enemyTypes.length - 1, Math.floor((wave + level) / 3));
  const idx = Math.floor(rng() * (maxIdx + 1));
  const type = enemyTypes[idx];
  const hp = Math.max(5, Math.floor((type.hp + 4 + Math.floor(wave / 2.4) + Math.floor(level / 3) + diff.enemyHpBonus) * getDualModeEnemyMul()));
  const speedMul = diff.enemySpeedMul * (1 + Math.min(0.46, wave * 0.014));
  const enemy = new EnemyTank(x, y, type.color, type.turret, type.speed * speedMul, hp, type.kind);
  enemy.shootDelay = Math.max(42, Math.floor(enemy.shootDelay * (type.kind === 'brute' ? 1.12 : (type.kind === 'runner' ? 0.82 : 0.95))));
  enemies.push(enemy);
  discoverBestiary('normals', type.kind);
  return true;
}

// --- Collision detection ---
function checkBulletTankCollisions(bullets, tanks, fromPlayer) {
  for (const bullet of bullets) {
    if (!bullet.alive) continue;
    for (const tank of tanks) {
      if (!tank.alive) continue;
      const dx = bullet.x - tank.x;
      const dy = bullet.y - tank.y;
      let hitRadius = bullet.railgun ? 24 : (fromPlayer && buffs.big_bullet > 0 ? 28 : 20);
      if (!fromPlayer && tank === player) {
        hitRadius = Math.max(16, Math.min(24, (player.hitboxSize || 36) * 0.54));
      }
      if (Math.sqrt(dx * dx + dy * dy) < hitRadius) {
        const hpBeforeHit = tank.hp || 0;
        if (!fromPlayer && tank === player) recordPlayerHit(bullet);
        if (!bullet.railgun && !bullet.pierce) bullet.alive = false;
        // Multi-hit protection: successive bullets from same volley do reduced damage to bosses
        if (fromPlayer && tank.bossDef) {
          const now = performance.now();
          if (now - (tank._lastHitTime || 0) < 120) {
            bullet.damage = Math.max(1, Math.floor((bullet.damage || 1) * 0.5));
          }
          tank._lastHitTime = now;
        }
        // Proximity damage scaling: point-blank shots do less to bosses
        if (fromPlayer && tank.bossDef) {
          const pdx = player.x - tank.x, pdy = player.y - tank.y;
          const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
          const minRange = 80;
          if (pDist < minRange) {
            const scale = 0.35 + (pDist / minRange) * 0.65;
            bullet.damage = Math.max(1, Math.ceil((bullet.damage || 1) * scale));
          }
        }
        const originalDamage = bullet.damage;
        if (fromPlayer && tank.bossDef && playerBossDamageMul > 1) {
          bullet.damage = Math.max(1, Math.ceil((bullet.damage || 1) * playerBossDamageMul));
        }
        if (fromPlayer && tank.bossDef && tank.recoverVulnerable) {
          bullet.damage = Math.max(1, Math.ceil((bullet.damage || 1) * 1.1));
        }
        const destroyed = tank.hit(bullet);
        if (fromPlayer && tank.bossDef && (playerBossDamageMul > 1 || tank.recoverVulnerable)) {
          bullet.damage = originalDamage;
        }
        if (fromPlayer) recordEnemyHit(tank, bullet, Math.max(0, hpBeforeHit - (tank.hp || 0)));
        if (bullet.drainOnHit > 0 && fromPlayer && player && player.alive && rng() < bullet.drainOnHit) {
          player.hp = Math.min(player.maxHp, player.hp + 1);
          
          sfxStatus('drain');
          bullet.drainOnHit = 0;
        }
        if (bullet.shardBurst > 0 && fromPlayer) {
          const shards = Math.min(3, bullet.shardBurst + 1);
          for (let s = 0; s < shards; s++) {
            const offset = (s - (shards - 1) / 2) * 0.32;
            const shard = new Bullet(bullet.x, bullet.y, bullet.angle + offset, Math.max(2.4, bullet.speed * 0.78), '#bdfcff', true, Math.max(1, Math.floor((bullet.damage || 1) * 0.55)));
            shard.radius = 2.4;
            shard.pierce = false;
            shard.homing = true;
            shard.homingStrength = 0.018;
            playerBullets.push(shard);
          }
          bullet.shardBurst = 0;
        }
        if (bullet.explosive && fromPlayer) {
          const explosionRadius = getExplosionRadius();
          for (const other of tanks) {
            if (other !== tank && other.alive) {
              const odx = bullet.x - other.x;
              const ody = bullet.y - other.y;
              if (Math.sqrt(odx * odx + ody * ody) < explosionRadius) {
                const otherHpBefore = other.hp || 0;
                other.hit(bullet);
                recordEnemyHit(other, bullet, Math.max(0, otherHpBefore - (other.hp || 0)));
              }
            }
          }
          spawnExplosion(bullet.x, bullet.y, 12, '#f84', '#ff0');
          bullet.alive = false;
        }
        if (destroyed && !fromPlayer) {
        }
        if (!bullet.railgun && !bullet.pierce) break;
      }
    }
    if (bullet.alive && bulletHitsObstacle(bullet)) {
      if (!bullet.ricochet) bullet.alive = false;
    }
  }
}

// --- Ground decoration ---
function drawGround(ctx) {
  // Biome tint
  const safeWave = Math.max(1, Number.isFinite(wave) ? wave : 1);
  const biome = (safeWave - 1) % 5;
  const tints = ['#0d1117','#101510','#0d1020','#1a0e0c','#0c1111'];
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, tints[biome]);
  grad.addColorStop(0.48, biome === 2 ? '#10172a' : '#0a0e14');
  grad.addColorStop(1, biome === 3 ? '#23110c' : '#06090d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Distant sacred-tech glow
  const glow = ctx.createRadialGradient(W * 0.76, H * 0.2, 20, W * 0.76, H * 0.2, W * 0.45);
  glow.addColorStop(0, biome === 3 ? 'rgba(244,120,60,0.14)' : 'rgba(244,152,0,0.10)');
  glow.addColorStop(0.38, 'rgba(140,232,255,0.035)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Grid pattern
  ctx.strokeStyle = biome === 1 ? 'rgba(62,95,62,0.22)' : (biome === 2 ? 'rgba(95,120,180,0.20)' : 'rgba(244,152,0,0.11)');
  ctx.lineWidth = 0.6;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = biome === 2 ? '#8ce8ff' : '#f49800';
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    const cx = ((i * 233 + safeWave * 47) % (W + 180)) - 90;
    const cy = ((i * 149 + safeWave * 31) % (H + 120)) - 60;
    const r = 34 + (i % 4) * 18;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.72, cy);
    ctx.lineTo(cx + r * 0.72, cy);
    ctx.moveTo(cx, cy - r * 0.72);
    ctx.lineTo(cx, cy + r * 0.72);
    ctx.stroke();
  }
  ctx.restore();

  // Ruined road plates
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = biome === 3 ? '#442016' : '#1a2530';
  ctx.strokeStyle = 'rgba(232,237,242,0.06)';
  for (let i = 0; i < 14; i++) {
    const px = ((i * 181 + safeWave * 29) % W);
    const py = ((i * 97 + safeWave * 61) % H);
    const pw = 54 + (i % 5) * 24;
    const ph = 14 + (i % 3) * 8;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(((i % 7) - 3) * 0.08);
    ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
    ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);
    ctx.restore();
  }
  ctx.restore();

  // Decorative scatter
  ctx.fillStyle = biome === 1 ? 'rgba(45,85,45,0.32)' : (biome === 2 ? 'rgba(80,110,170,0.20)' : 'rgba(120,90,55,0.18)');
  for (let i = 0; i < 42; i++) {
    const sx = ((i * 137 + safeWave * 53) % W);
    const sy = ((i * 251 + safeWave * 37) % H);
    ctx.beginPath();
    if (biome === 1) {
      ctx.arc(sx, sy, 2 + (i % 3), 0, Math.PI * 2); // grass tufts
    } else if (biome === 2) {
      ctx.arc(sx, sy, 2, 0, Math.PI * 2); // small rocks
    } else {
      ctx.fillRect(sx, sy, 3, 1); // dirt scratches
    }
    ctx.fill();
  }
}

// --- Game Loop ---
function updateGamepadInput() {
  if (!isDualMode) return;
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  let found = false;
  for (const gp of gamepads) {
    if (gp && gp.connected) {
      const dz = (v) => Math.abs(v) < 0.06 ? 0 : v; // Lower deadzone for precision
      gamepadState.connected = true;
      // Standard mapping: axes[0,1]=left stick, axes[2,3]=right stick
      // PlayStation/other: right stick may be at axes[2,5] or axes[3,4]
      const ax = gp.axes;
      if (gp.mapping === 'standard' || ax.length <= 4) {
        gamepadState.leftX = dz(ax[0] || 0);
        gamepadState.leftY = dz(ax[1] || 0);
        gamepadState.rightX = dz(ax[2] || 0);
        gamepadState.rightY = dz(ax[3] || 0);
      } else {
        // Non-standard: check all axes and use the two largest-magnitude pairs after left stick
        gamepadState.leftX = dz(ax[0] || 0);
        gamepadState.leftY = dz(ax[1] || 0);
        // Find right stick among remaining axes
        let bestR = 0, bestRX = 0, bestRY = 0;
        for (let i = 2; i < ax.length - 1; i += 2) {
          const mag = Math.abs(ax[i]||0) + Math.abs(ax[i+1]||0);
          if (mag > bestR) { bestR = mag; bestRX = dz(ax[i]||0); bestRY = dz(ax[i+1]||0); }
        }
        gamepadState.rightX = bestRX;
        gamepadState.rightY = bestRY;
      }
      gamepadState.shoot = (gp.buttons[7] && gp.buttons[7].value > 0.2) || (gp.buttons[0] && gp.buttons[0].pressed);
      found = true;
      break;
    }
  }
  if (!found) gamepadState.connected = false;
}

function update() {
  if (!gameRunning) return;
  runFrameCount++;
  if (isDualMode) updateGamepadInput();
  updateRunReportPeaks();

  // Boss warning countdown
  if (bossWarningTimer > 0) {
    bossWarningTimer--;
    // Screen shake during warning
    if (bossWarningTimer < 60 && bossWarningTimer % 8 === 0) triggerShake(3, 3);
    if (bossWarningTimer === 60) triggerShake(8, 6);
    if (bossWarningTimer <= 0 && bossWarningDef && bossWarningSpawn) {
      // Spawn the boss
      const bd = bossWarningDef;
      const bs = bossWarningSpawn;
      bossRef = new BossEnemy(bs.x, bs.y, bd);
      recordBossEncounter(bd, bossRef);
      enemies.push(bossRef);
      sfxBossIntro();
      // Gemini: spawn twin at mirrored position
      if (bd.name === '双子坦克') {
        const twinX = bs.x + (bs.x < W/2 ? 120 : -120);
        const twinY = bs.y + (bs.y < H/2 ? 80 : -80);
        const twin = new BossEnemy(Math.max(40, Math.min(W-40, twinX)), Math.max(40, Math.min(H-40, twinY)), bd);
        twin.color = '#624'; twin.turretColor = '#d8f'; // Dark variant
        twin.geminiMaster = bossRef;
        bossRef.geminiTwin = twin;
        recordBossEncounter(bd, twin);
        enemies.push(twin);
        spawnExplosion(twin.x, twin.y, 25, '#a4f', '#d8f');
      }
      // Boss entrance effects
      const bn = bossRef.bossDef.name;
      if (bn === '巨兽坦克') {
        triggerShake(16, 12);
        spawnExplosion(bs.x, bs.y, 60, '#f80', '#ff0');
      } else if (bn === '幻影坦克') {
        for (let i = 0; i < 5; i++) {
          spawnExplosion(bs.x + (rng()-0.5)*80, bs.y + (rng()-0.5)*60, 10, '#88f', '#ccf');
        }
      } else if (bn === '雷霆执政官') {
        spawnExplosion(bs.x, bs.y - 40, 30, '#ff0', '#fff');
        for (let i = 0; i < 4; i++) {
          spawnExplosion(bs.x + (i-1.5)*30, bs.y, 12, '#6ff', '#fff');
        }
      } else if (bn === '虚空坦克') {
        spawnExplosion(bs.x, bs.y, 40, '#a4f', '#fff');
        triggerShake(10, 10);
      } else if (bn === '废铁巨像') {
        triggerShake(14, 10);
        spawnExplosion(bs.x, bs.y, 50, '#c84', '#964');
      } else {
        spawnExplosion(bs.x, bs.y, 35, '#fff', '#ff0');
        triggerShake(8, 6);
      }
      // Spawn support enemies
      for (let i = 0; i < getBossSupportCount(wave); i++) {
        if (spawnEnemy()) waveEnemiesToSpawn = Math.max(0, waveEnemiesToSpawn - 1);
      }
      bossWarningDef = null; bossWarningSpawn = null;
    }
    return; // Don't update game during warning
  }

  // Update player
  player.update();
  if (isDualMode && player2) {
    player2.update();
    // Spawn P2 bullets as player bullets so they damage enemies
    // (PlayerTank.shoot already handles this via playerBullets array)
  }
  if (!player.alive && !gameOverFlag) {
    lives--;
    if (lives <= 0 && (!isDualMode || !player2 || !player2.alive)) {
      endGame();
      return;
    }
    // Respawn P1
    if (isDualMode && dualReviveCooldown > 0) {
      p1DeadTimer = dualReviveCooldown;
    } else {
      player = new PlayerTank(currentTankType, 'kbm');
      if (isDualMode && player2 && player2.alive) {
        player.x = player2.x + (rng()-0.5)*60; player.y = player2.y + (rng()-0.5)*40;
      }
      player.hp = player.maxHp;
      player.invincible = 120;
    }
  }
  // P2 death handling
  if (isDualMode && player2 && !player2.alive && !gameOverFlag) {
    if (dualReviveCooldown > 0) {
      p2DeadTimer = dualReviveCooldown;
    } else {
      lives--;
      if (lives <= 0 && !player.alive) { endGame(); return; }
      player2 = new PlayerTank(p2TankTypeGlobal, 'gamepad');
      player2.turretColor = '#ff8800';
      player2.color = '#331100';
      if (player.alive) {
        player2.x = player.x + (rng()-0.5)*60; player2.y = player.y + (rng()-0.5)*40;
      }
      player2.hp = player2.maxHp;
      player2.invincible = 120;
    }
  }

  // Update enemies
  for (const enemy of enemies) enemy.update();

  // Update bullets
  for (const b of playerBullets) b.update();
  for (const b of enemyBullets) b.update();

  // Collisions
  checkBulletBulletCollisions();
  checkBulletTankCollisions(playerBullets, enemies, true);
  const playerTargets = [player];
  if (isDualMode && player2) playerTargets.push(player2);
  checkBulletTankCollisions(enemyBullets, playerTargets, false);

  // Cleanup
  playerBullets = playerBullets.filter(b => b.alive);
  enemyBullets = enemyBullets.filter(b => b.alive);
  enemies = enemies.filter(e => e.alive);

  // Wave logic
  if (waveEnemiesRemaining <= 0 && enemies.length === 0) {
    // Wave cleared - pause before next wave
    if (wavePause === 0) {
      showWaveNotification('第 ' + wave + ' 波 清除!', (wave % 3 === 0) ? '补给时间! 准备迎接下一波' : '');
      if (shouldClearDifficulty()) {
        clearDifficulty();
        wavePause++; // prevent re-triggering every frame
        return;
      }
    }
    wavePause++;
    const pauseDuration = (wave % 3 === 0) ? 180 : 120;
    if (wavePause >= pauseDuration) {
      startNextWave();
    }
  } else {
    // Active wave - spawn remaining enemies
    spawnTimer++;
    const diff = difficultySettings[currentDifficulty];
    const spawnRate = getWaveSpawnRate(diff);
    const maxEnemies = getWaveConcurrentEnemyCap();
    if (spawnTimer >= spawnRate && waveEnemiesToSpawn > 0 && enemies.length < maxEnemies) {
      spawnTimer = 0;
      const batch = Math.min(1 + Math.floor(wave / 8), waveEnemiesToSpawn, maxEnemies - enemies.length);
      for (let i = 0; i < batch; i++) {
        if (spawnEnemy()) waveEnemiesToSpawn = Math.max(0, waveEnemiesToSpawn - 1);
      }
    }
  }

  // Combo timer
  if (comboTimer > 0) {
    comboTimer--;
    if (comboTimer <= 0) comboCount = 0;
  }
  // Ambient battlefield particles
  if (gameRunning) {
    spawnAmbientParticles();
    // Dynamic music intensity based on enemy count
    if (musicSys && musicSys.currentMode === 'combat') {
      const totalEnemies = enemies.length + (waveEnemiesToSpawn || 0);
      const maxExpected = getWaveEnemyBudget(wave);
      const intensity = Math.min(1, totalEnemies / Math.max(1, maxExpected));
      musicSys.setIntensity(intensity);
    }
  }

  // Wave notification timer
  if (waveNotificationTimer > 0) {
    waveNotificationTimer--;
    if (waveNotificationTimer <= 0) {
      document.getElementById('wave-notify').classList.remove('show');
    }
  }

  // Power-up spawn on map
  powerUpSpawnTimer++;
  if (powerUpSpawnTimer >= 1200 && powerUps.length < 2) {
    powerUpSpawnTimer = 0;
    const guaranteed = Math.max(1, Math.floor(powerUpDropMul));
    const extraChance = Math.max(0, powerUpDropMul - guaranteed);
    const spawnCount = Math.min(2, guaranteed);
    for (let i = 0; i < spawnCount; i++) {
      const px = 40 + rng() * (W - 80);
      const py = 40 + rng() * (H - 80);
      spawnPowerUp(px, py);
    }
    if (rng() < extraChance) {
      const px = 40 + rng() * (W - 80);
      const py = 40 + rng() * (H - 80);
      spawnPowerUp(px, py);
    }
  }

  // Pickup power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    powerUps[i].life--;
    if (powerUps[i].life <= 0) { powerUps.splice(i, 1); continue; }
    const pickupRange = buffs.magnet > 0 ? 80 : 30;
    let picked = false;
    const pickups = [player];
    if (isDualMode && player2 && player2.alive) pickups.push(player2);
    for (const p of pickups) {
      const dx = p.x - powerUps[i].x;
      const dy = p.y - powerUps[i].y;
      if (dx * dx + dy * dy < pickupRange * pickupRange) {
        applyPowerUp(powerUps[i]);
        powerUps.splice(i, 1);
        picked = true;
        break;
      }
    }
  }

  // Update chests
  for (let i = chests.length - 1; i >= 0; i--) {
    chests[i].life--;
    if (chests[i].life <= 0) { chests.splice(i, 1); continue; }
    const cdx = player.x - chests[i].x;
    const cdy = player.y - chests[i].y;
    if (cdx * cdx + cdy * cdy < 35 * 35) {
      openChest(chests[i]);
      chests.splice(i, 1);
    }
  }

  // Update mines
  for (let i = mines.length - 1; i >= 0; i--) {
    mines[i].life--;
    if (mines[i].life <= 0) { mines.splice(i, 1); continue; }
    if (mines[i].armed) {
      const mx = mines[i].x - player.x;
      const my = mines[i].y - player.y;
      if (mx * mx + my * my < 30 * 30) {
        sessionMinesTriggered = true;
        spawnExplosion(mines[i].x, mines[i].y, 15, '#f80', '#ff0');
        sfxStatus('mine');
        player.hit('地雷触发');
        mines.splice(i, 1);
      }
    }
  }

  // Update buff timers
  for (const key of Object.keys(buffs)) {
    if (buffs[key] > 0) buffs[key]--;
  }

  // Update screen shake
  if (shakeDuration > 0) {
    shakeDuration--;
    shakeIntensity *= 0.85;
    if (shakeDuration <= 0) shakeIntensity = 0;
  }

  // Update UI
  document.getElementById('score').textContent = score;
  document.getElementById('lives').textContent = lives;
  document.getElementById('level').textContent = level;
  // P2 UI in dual mode
  if (isDualMode && player2) {
    let p2ui = document.getElementById('p2-ui');
    if (!p2ui) {
      p2ui = document.createElement('div');
      p2ui.id = 'p2-ui';
      p2ui.style.cssText = 'position:absolute;top:4px;left:4px;z-index:10;' +
        'background:rgba(0,0,0,0.6);color:#f80;padding:4px 10px;' +
        'font:bold 13px "Courier New",monospace;border:1px solid #f80;border-radius:4px;';
      document.getElementById('game-container').appendChild(p2ui);
    }
    const p2hp = player2.alive ? Math.max(0, player2.hp) : 0;
    p2ui.textContent = 'P2  HP:' + p2hp + '/' + player2.maxHp + '  \u{1F3AE}';
    p2ui.style.display = 'block';
  } else {
    const p2ui = document.getElementById('p2-ui');
    if (p2ui) p2ui.style.display = 'none';
  }
  updateRunXpHud();
  const ammoEl = document.getElementById('ammo');
  if (ammoEl && player) {
    ammoEl.textContent = player.reloadTimer > 0
      ? '装填 ' + Math.ceil(player.reloadTimer / 60) + 's'
      : player.ammo + '/' + player.magSize;
  }
  checkChestMilestone();
  if (isDailyChallenge) {
    saveDailyBest(score);
    renderDailyTarget();
    checkDailyTarget();
  }

  // Update particles
  for (const p of particles) p.update();
  particles.length = Math.min(particles.length, 200);
  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].life <= 0) particles.splice(i, 1);
  }
  // Update damage numbers
  for (const d of dmgNumbers) d.update();
  for (let i = dmgNumbers.length - 1; i >= 0; i--) {
    if (dmgNumbers[i].life <= 0) dmgNumbers.splice(i, 1);
  }
}

function drawMinimap(ctx) {
  const mmW = 152, mmH = 112;
  const mmX = W - mmW - 16, mmY = H - mmH - 16;
  const scaleX = mmW / W, scaleY = mmH / H;
  const isSandstorm = weatherOverridden && weatherType === 'dust';

  // Rounded rect background
  const rr = 6;
  ctx.fillStyle = isSandstorm ? 'rgba(0,0,0,0.78)' : 'rgba(0,0,0,0.52)';
  ctx.strokeStyle = isSandstorm ? 'rgba(255,200,120,0.65)' : 'rgba(255,255,255,0.28)';
  ctx.lineWidth = isSandstorm ? 2 : 1.5;
  ctx.beginPath();
  ctx.moveTo(mmX + rr, mmY);
  ctx.lineTo(mmX + mmW - rr, mmY);
  ctx.arcTo(mmX + mmW, mmY, mmX + mmW, mmY + rr, rr);
  ctx.lineTo(mmX + mmW, mmY + mmH - rr);
  ctx.arcTo(mmX + mmW, mmY + mmH, mmX + mmW - rr, mmY + mmH, rr);
  ctx.lineTo(mmX + rr, mmY + mmH);
  ctx.arcTo(mmX, mmY + mmH, mmX, mmY + mmH - rr, rr);
  ctx.lineTo(mmX, mmY + rr);
  ctx.arcTo(mmX, mmY, mmX + rr, mmY, rr);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const mx = (wx) => mmX + wx * scaleX;
  const my = (wy) => mmY + wy * scaleY;

  // Border highlight for sandstorm
  if (isSandstorm) {
    ctx.strokeStyle = 'rgba(255,180,60,0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(mmX + rr, mmY);
    ctx.lineTo(mmX + mmW - rr, mmY);
    ctx.arcTo(mmX + mmW, mmY, mmX + mmW, mmY + rr, rr);
    ctx.lineTo(mmX + mmW, mmY + mmH - rr);
    ctx.arcTo(mmX + mmW, mmY + mmH, mmX + mmW - rr, mmY + mmH, rr);
    ctx.lineTo(mmX + rr, mmY + mmH);
    ctx.arcTo(mmX, mmY + mmH, mmX, mmY + mmH - rr, rr);
    ctx.lineTo(mmX, mmY + rr);
    ctx.arcTo(mmX, mmY, mmX + rr, mmY, rr);
    ctx.closePath();
    ctx.stroke();
  }

  // Obstacles
  ctx.fillStyle = 'rgba(140,140,140,0.22)';
  for (const obs of obstacles) {
    if (!obs.alive) continue;
    ctx.fillRect(mx(obs.x - obs.w / 2), my(obs.y - obs.h / 2),
      Math.max(1.2, obs.w * scaleX), Math.max(1.2, obs.h * scaleY));
  }

  // Enemy bullets (sampled)
  if (enemyBullets.length > 0) {
    ctx.fillStyle = 'rgba(255,100,50,0.45)';
    const step = Math.max(1, Math.floor(enemyBullets.length / 60));
    for (let i = 0; i < enemyBullets.length; i += step) {
      const b = enemyBullets[i];
      if (!b.alive) continue;
      ctx.fillRect(mx(b.x) - 0.5, my(b.y) - 0.5, 1.2, 1.2);
    }
  }

  // Mines
  if (mines.length > 0) {
    ctx.fillStyle = 'rgba(200,100,30,0.5)';
    for (const m of mines) {
      ctx.fillRect(mx(m.x) - 1, my(m.y) - 1, 2, 2);
    }
  }

  // Enemies
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const ex = mx(enemy.x), ey = my(enemy.y);
    if (enemy.bossDef) {
      const pulse = Math.sin(Date.now() / 220) * 1.2 + 3.8;
      ctx.fillStyle = '#ff3030';
      ctx.shadowColor = '#f00';
      ctx.shadowBlur = isSandstorm ? 12 : 7;
      ctx.beginPath(); ctx.arc(ex, ey, pulse, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // Cross marker
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(ex - pulse - 1, ey); ctx.lineTo(ex + pulse + 1, ey); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex, ey - pulse - 1); ctx.lineTo(ex, ey + pulse + 1); ctx.stroke();
    } else if (enemy.isElite) {
      ctx.fillStyle = '#fa0';
      ctx.beginPath(); ctx.arc(ex, ey, 2.4, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(210,95,75,0.65)';
      ctx.fillRect(ex - 1.2, ey - 1.2, 2.4, 2.4);
    }
  }

  // Player
  if (player && player.alive) {
    const px = mx(player.x), py = my(player.y);
    const pa = player.turretAngle || 0;
    // Glow
    ctx.fillStyle = '#0f0'; ctx.shadowColor = '#0f0'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(px, py, 3.8, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // Inner dot
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
    // Direction line
    ctx.strokeStyle = '#0f0'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(pa) * 7.5, py + Math.sin(pa) * 7.5);
    ctx.stroke();
  }

  // Label
  ctx.fillStyle = isSandstorm ? 'rgba(255,210,130,0.9)' : 'rgba(255,255,255,0.45)';
  ctx.font = 'bold 9px "Courier New",monospace';
  ctx.textAlign = 'center';
  ctx.fillText(isSandstorm ? '◈ 沙尘暴 · 视野受限 ◈' : '战场概览', mmX + mmW / 2, mmY - 5);
}

function draw() {
  if (ctx.setTransform) ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1;
  ctx.textAlign = 'start';
  ctx.textBaseline = 'alphabetic';
  ctx.clearRect(0, 0, W, H);

  // Screen shake
  if (shakeIntensity > 0.1) {
    ctx.save();
    const sx = (Math.random() - 0.5) * shakeIntensity * 2;
    const sy = (Math.random() - 0.5) * shakeIntensity * 2;
    ctx.translate(sx, sy);
  }

  // Ground
  drawGround(ctx);
  drawWeatherOverlay(ctx);
  drawWeather(ctx);

  // Obstacles
  drawObstacles(ctx);

  // Mines
  for (const m of mines) {
    const pulse = Math.sin(Date.now() / 300 + m.x) * 0.3 + 0.7;
    ctx.save();
    ctx.shadowColor = '#f80';
    ctx.shadowBlur = 8 * pulse;
    ctx.fillStyle = m.armed ? '#c40' : '#864';
    ctx.beginPath();
    ctx.arc(m.x, m.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f80';
    ctx.beginPath();
    ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Power-ups
  for (const p of powerUps) {
    const t = Date.now() / 1000;
    ctx.save();
    ctx.globalAlpha = 0.7 + Math.sin(t * 3 + p.x) * 0.3;
    const glowC = p.glowColor || p.color;
    ctx.shadowColor = glowC;
    ctx.shadowBlur = (p.glowColor ? 16 : 10) + Math.sin(t * 4) * 4;
    const sz = p.size || 10;
    const rotate = t * 1.2 + p.x * 0.01;
    ctx.translate(p.x, p.y);
    ctx.rotate(rotate);
    const outer = sz + 5;
    const inner = Math.max(6, sz - 2);
    const tier = normalizeItemTier(p.tier || p.rarity);
    drawTechModuleShell(ctx, outer, inner, p.color, glowC);
    if (p.glowColor) {
      ctx.strokeStyle = p.glowColor;
      ctx.lineWidth = tier === 'relic' ? 2.5 : 1.5;
      ctx.shadowBlur = tier === 'relic' ? 20 : 12;
      ctx.beginPath();
      ctx.arc(0, 0, outer + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI * 2 / 3 + t * 0.8;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(Math.cos(a) * (inner - 1) - 1, Math.sin(a) * (inner - 1) - 1, 2, 2);
    }
    ctx.rotate(-rotate);
    drawPowerUpGlyph(ctx, { ...p, x:0, y:0 }, inner * 0.95);
    ctx.restore();
  }

  // Chests
  for (const c of chests) {
    if (c.opened) continue;
    const ct = Date.now() / 1000;
    drawSupplyChest(ctx, c, ct);
  }

  // Bullets
  for (const b of playerBullets) b.draw(ctx);
  for (const b of enemyBullets) b.draw(ctx);

  // Enemies
  for (const enemy of enemies) {
    ctx.save();
    enemy.draw(ctx);
    ctx.restore();
    ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
  }

  // Enemy HP bar on crosshair hover
  if (gameRunning) {
    let nearestEnemy = null, nearestDist = 60;
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const edx = mouse.x - enemy.x, edy = mouse.y - enemy.y;
      const ed = Math.sqrt(edx*edx + edy*edy);
      if (ed < nearestDist) { nearestDist = ed; nearestEnemy = enemy; }
    }
    if (nearestEnemy) {
      let markerType = 'normal';
      let accent = '#8ea2bb';
      let label = 'STANDARD';
      let displayName = '敌方单位';
      if (nearestEnemy.isElite) {
        markerType = nearestEnemy.bossDef ? 'boss' : (nearestEnemy.special || 'normal');
        const profile = getEnemyVisualProfile(markerType);
        accent = nearestEnemy.bossDef ? (nearestEnemy.bossDef.turret || profile.color) : profile.color;
        label = nearestEnemy.bossDef ? 'BOSS LOCK' : profile.label;
        displayName = nearestEnemy.bossDef ? nearestEnemy.bossDef.name : (nearestEnemy.eliteName || nearestEnemy.constructor.name);
      }
      drawEnemyInfoPlate(ctx, nearestEnemy.x, nearestEnemy.y - 34, nearestEnemy.bossDef ? 118 : 96, nearestEnemy.hp / nearestEnemy.maxHp, accent, displayName, label, 'HP');
      drawEnemyMarker(ctx, nearestEnemy.x - (nearestEnemy.bossDef ? 68 : 57), nearestEnemy.y - 34, markerType, nearestEnemy.bossDef ? 8.2 : 7.2, accent);
    }
  }

  // Player
  ctx.globalAlpha = 1;
  if (player.alive) player.draw(ctx);
  if (isDualMode && player2 && player2.alive) player2.draw(ctx);

  // Particles
  for (const p of particles) {
    if (p.life > 0) p.draw(ctx);
  }

  // Damage numbers
  for (const d of dmgNumbers) {
    if (d.life > 0) d.draw(ctx);
  }

  // Low HP vignette
  if (player.alive && player.hp / player.maxHp < 0.4) {
    const hpRatio = player.hp / player.maxHp;
    const alpha = (0.4 - hpRatio) * 1.5;
    const gradient = ctx.createRadialGradient(W/2, H/2, W*0.35, W/2, H/2, W*0.7);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.7, 'rgba(120,0,0,' + (alpha * 0.3) + ')');
    gradient.addColorStop(1, 'rgba(80,0,0,' + (alpha * 0.6) + ')');
    ctx.fillStyle = gradient;
    ctx.fillRect(-20, -20, W + 40, H + 40);
  }

  // Boss warning overlay
  if (bossWarningTimer > 0 && bossWarningDef) {
    const warnProgress = 1 - (bossWarningTimer / 120);
    // Red vignette
    const vignetteGrad = ctx.createRadialGradient(W/2, H/2, W*0.35, W/2, H/2, W*0.7);
    vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vignetteGrad.addColorStop(0.5, 'rgba(80,0,0,' + (warnProgress * 0.3) + ')');
    vignetteGrad.addColorStop(1, 'rgba(40,0,0,' + (warnProgress * 0.6) + ')');
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, W, H);
    // WARNING text
    if (bossWarningTimer < 100) {
      const textAlpha = Math.min(1, (100 - bossWarningTimer) / 30);
      ctx.save(); ctx.globalAlpha = textAlpha;
      ctx.fillStyle = '#000'; ctx.font = 'bold 52px "Segoe UI","Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WARNING', W/2 + 3, H*0.35 + 3);
      ctx.fillStyle = '#ff2020';
      ctx.shadowColor = '#f00'; ctx.shadowBlur = 20;
      ctx.fillText('WARNING', W/2, H*0.35);
      ctx.shadowBlur = 0;
      // Boss name subtitle
      ctx.fillStyle = '#ff6060'; ctx.font = 'bold 20px "Courier New",monospace';
      ctx.fillText(bossWarningDef.name, W/2, H*0.35 + 40);
      ctx.globalAlpha = 1; ctx.restore();
    }
  }

  // Crosshair
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mouse.x - 12, mouse.y); ctx.lineTo(mouse.x + 12, mouse.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mouse.x, mouse.y - 12); ctx.lineTo(mouse.x, mouse.y + 12);
  ctx.stroke();
  ctx.fillStyle = '#f00';
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 2, 0, Math.PI * 2);
  ctx.fill();

  // Restore shake transform
  if (shakeIntensity > 0.1) ctx.restore();

  // Minimap
  if (gameRunning) drawMinimap(ctx);
}

function endGame(victory = false, runId = activeRunId) {
  if (runId !== activeRunId) return;
  gameOverFlag = true;
  gameRunning = false;
  isPaused = false;
  stopMusic();
  document.getElementById('pause-screen').style.display = 'none';
  sfxRunEnd(victory);
  if (isDailyChallenge) {
    saveDailyBest(score);
    renderDailyTarget();
  }
  const finalReport = ensureRunReport();
  finalizeActiveBossReports(victory ? 'victory' : 'run_end');
  finalReport.endTime = finalReport.endTime || Date.now();
  finalReport.victory = !!victory;
  if (!isDailyChallenge) addToLeaderboard(currentDifficulty, score, currentTankType, wave, currentRunMode, victory);
  document.getElementById('final-score').textContent = score;
  if (!isDailyChallenge) document.getElementById('daily-target').style.display = 'none';
  const gameOverPanel = document.getElementById('game-over');
  const finalTitle = document.getElementById('final-title');
  const endingStory = document.getElementById('ending-story');
  if (finalTitle) finalTitle.textContent = victory ? '难 度 通 关' : (currentRunMode === 'endless' ? '无 尽 战 线 中 断' : '游戏结束');
  if (endingStory) {
    endingStory.textContent = victory
      ? getEndingStory()
      : '雷达重新归零，灰域把这次失败收进尘埃。整备室仍保留着你的机体编号，等待下一次出击。';
    endingStory.style.display = victory ? 'block' : 'none';
  }
  renderRunReport(victory);
  gameOverPanel.classList.toggle('victory', !!victory);
  gameOverPanel.scrollTop = 0;
  gameOverPanel.classList.add('visible');
  // Show quick restart hint
  const hint = gameOverPanel;
  if (!hint.querySelector('.quick-hint')) {
    const span = document.createElement('p');
    span.className = 'quick-hint';
    span.style.cssText = 'color:#888;font-size:12px;margin-top:4px;';
    span.textContent = '按 R 快捷重开';
    hint.appendChild(span);
  }
}

function quickRestart() {
  if (!gameOverFlag) return;
  const savedDiff = currentDifficulty;
  const savedTank = currentTankType;
  hideRunOverlays(false);
  clearInputState();
  isPaused = false;
  if (isDailyChallenge) {
    const seed = getDailySeed();
    loadDailyChallengeStatus();
    startGame(savedDiff, savedTank, {
      dailyChallenge: true,
      mode: 'clear',
      seededRandom: mulberry32(seed),
      dailyTarget: getDailyTarget(seed),
    });
  } else {
    startGame(savedDiff, savedTank, { mode: currentRunMode });
  }
}

function checkBulletBulletCollisions() {
  let sparks = 0;
  for (const p of playerBullets) {
    if (!p.alive) continue;
    for (const e of enemyBullets) {
      if (!e.alive) continue;
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const r = (p.radius || 3) + (e.radius || 3) + 2;
      if (dx * dx + dy * dy <= r * r) {
        const pPower = Math.max(1, Math.ceil(p.damage || 1) + getGlobalClashPowerBonus() + rollRunClashPowerBonus());
        const ePower = Math.max(1, Math.ceil(e.damage || 1));
        if (pPower > ePower) {
          p.damage = pPower - ePower;
          e.alive = false;
        } else if (ePower > pPower) {
          e.damage = ePower - pPower;
          p.alive = false;
        } else {
          p.alive = false;
          e.alive = false;
        }
        recordBulletClash(pPower - ePower);
        if (sparks < 16) {
          const strongColor = pPower === ePower ? '#f6e5aa' : (pPower > ePower ? p.color : e.color);
          spawnExplosion((p.x + e.x) / 2, (p.y + e.y) / 2, pPower === ePower ? 4 : 5, strongColor, '#f6e5aa');
          sfxBulletClash(pPower - ePower);
          sparks++;
        }
        if (!p.alive) break;
      }
    }
  }
}

function cancelPendingRunCallbacks() {
  if (pendingEndGameTimer) {
    clearTimeout(pendingEndGameTimer);
    pendingEndGameTimer = null;
  }
}

function clearInputState() {
  mouseDown = false;
  Object.keys(keys).forEach(k => { keys[k] = false; });
}

function hideRunOverlays(showStart = false) {
  ['pause-screen','modifier-screen','tank-select-screen','achievements-screen','bestiary-screen','lab-screen','protocol-screen','leaderboard-screen'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const gameOverPanel = document.getElementById('game-over');
  const reportEl = document.getElementById('run-report');
  if (gameOverPanel) gameOverPanel.classList.remove('visible', 'victory');
  if (reportEl) reportEl.innerHTML = '';
  const startScreen = document.getElementById('start-screen');
  if (startScreen) startScreen.style.display = showStart ? 'flex' : 'none';
  const waveNotify = document.getElementById('wave-notify');
  if (waveNotify) {
    clearTimeout(waveNotify._timeout);
    waveNotify.classList.remove('show');
  }
  const comboEl = document.getElementById('combo-display');
  if (comboEl) {
    clearTimeout(comboEl._timeout);
    comboEl.classList.remove('active');
  }
  const hint = document.querySelector('.quick-hint');
  if (hint) hint.remove();
}

function resetRunState() {
  isPaused = false;
  wave = 0;
  waveEnemiesRemaining = 0;
  waveEnemiesToSpawn = 0;
  waveEnemiesTotal = 0;
  wavePause = 0;
  waveNotificationTimer = 0;
  comboCount = 0;
  comboTimer = 0;
  enemies = [];
  playerBullets = [];
  enemyBullets = [];
  obstacles.length = 0;
  mines.length = 0;
  player2 = null;
  isDualMode = false;
  dualSharedLives = 0;
  dualReviveCooldown = 0;
  p1DeadTimer = 0;
  p2DeadTimer = 0;
  // Clean P2 UI
  const p2ui = document.getElementById('p2-ui');
  if (p2ui) p2ui.style.display = 'none';
  powerUps.length = 0;
  chests.length = 0;
  powerUpSpawnTimer = 0;
  lastChestMilestone = 0;
  spawnTimer = 0;
  difficultyTimer = 0;
  particles.length = 0;
  dmgNumbers.length = 0;
  buffs = { speed:0, railgun:0, ricochet:0, shield:0, rapid:0, freeze:0, multishot:0, magnet:0, pierce:0, vampire:0, double_score:0, big_bullet:0, explosive:0, invisible:0, thorns:0, overdrive:0, timewarp:0, goldrush:0 };
  isBossWave = false;
  bossRef = null;
  runXp = 0;
  xpToNext = 100;
  modifierChoiceMode = 'level';
  runBossesSeen = new Set();
  lastBossName = null;
  difficultyCleared = false;
  resetModifiers();
  updateRunXpHud();
  const finalTitle = document.getElementById('final-title');
  const endingStory = document.getElementById('ending-story');
  const gameOverPanel = document.getElementById('game-over');
  const reportEl = document.getElementById('run-report');
  if (finalTitle) finalTitle.textContent = '游戏结束';
  if (endingStory) {
    endingStory.textContent = '';
    endingStory.style.display = 'none';
  }
  if (reportEl) reportEl.innerHTML = '';
  if (gameOverPanel) gameOverPanel.classList.remove('victory');
}

function restartGame() {
  activeRunId++;
  cancelPendingRunCallbacks();
  score = 0;
  lives = 3;
  level = 1;
  gameRunning = false;
  gameOverFlag = false;
  isPaused = false;
  stopMusic();
  clearInputState();
  resetRunState();
  hideRunOverlays(true);
  // Restart menu BGM
  if (musicSys) { musicSys.switchMode('menu'); musicSys.fadeIn(0.18); }
  currentRunMode = 'clear';
  selectedRunMode = 'clear';
  isDailyChallenge = false;
  seededRandom = null;
  dailyTarget = null;
  dailyTargetAchieved = false;
  dailyCompletedToday = false;
  dailyBestScore = 0;
  player = new PlayerTank(currentTankType);
  document.getElementById('daily-target').style.display = 'none';
  renderDifficultyButtons();
}

// --- Init ---
function init() {
  loadAchievements();
  loadAchievementRewards();
  loadBestiaryDiscovery();
  loadUnlocks();
  loadProgression();
  loadLeaderboard();
  loadDailyChallengeStatus();
  renderDifficultyButtons();
  player = new PlayerTank(currentTankType);
  gameRunning = false;
  document.getElementById('start-screen').style.display = 'flex';
  // Auto-scale game container to fit viewport
  scaleToFit();
  window.addEventListener('resize', scaleToFit);
}  ensurePerfOverlay();
  try { if (new URLSearchParams(location.search).has('debug')) { perfEnabled = true; document.getElementById('perf-overlay').style.display = 'block'; } } catch(e) {}

function scaleToFit() {
  const container = document.getElementById('game-container');
  const scaleX = (window.innerWidth - 20) / W;
  const scaleY = (window.innerHeight - 20) / H;
  const scale = Math.min(scaleX, scaleY, 1.0);
  container.style.transform = 'scale(' + scale + ')';
}


// --- New Player Tutorial ---
const FIRST_RUN_KEY = 'tankbattle_first_run_done';
let newPlayerTips = [];
let newPlayerTipIndex = 0;
let newPlayerTipTimer = null;

function showNewPlayerTip(text, duration = 6000) {
  const tip = document.createElement('div');
  tip.className = 'new-player-tip';
  tip.textContent = text;
  tip.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2000;pointer-events:none;' +
    'background:rgba(4,8,14,0.92);color:#f6e5aa;padding:14px 28px;font:12px "Courier New",monospace;letter-spacing:1.5px;' +
    'border:1px solid rgba(246,229,170,0.3);clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%);' +
    'opacity:0;transition:opacity 0.5s ease;text-align:center;line-height:1.5;';
  document.body.appendChild(tip);
  requestAnimationFrame(() => { tip.style.opacity = '1'; });
  setTimeout(() => {
    tip.style.opacity = '0';
    setTimeout(() => tip.remove(), 500);
  }, duration);
  newPlayerTips.push(tip);
  return tip;
}

function runNewPlayerTips() {
  const tips = [
    { text: 'WASD / 方向键 · 移动机体', delay: 800, duration: 4500 },
    { text: '鼠标 / 空格键 · 发射弹幕', delay: 3000, duration: 4500 },
    { text: '击杀敌人升级 · 四选一改造', delay: 6000, duration: 5000 },
    { text: 'ESC · 暂停 & 返回', delay: 9000, duration: 5000 },
  ];
  tips.forEach((t, i) => {
    setTimeout(() => {
      if (!gameRunning && i > 0) return; // stop if game ended
      showNewPlayerTip(t.text, t.duration);
    }, t.delay);
  });
}

function markFirstRunComplete() {
  try { localStorage.setItem(FIRST_RUN_KEY, '1'); } catch(e) {}
}

function isFirstRun() {
  try { return localStorage.getItem(FIRST_RUN_KEY) !== '1'; } catch(e) { return true; }
}

function startGame(difficulty, tankType, options = {}) {
  activeRunId++;
  dualModePending = false;
  cancelPendingRunCallbacks();
  stopMusic();
  clearInputState();
  hideRunOverlays(false);
  currentDifficulty = difficulty;
  currentRunMode = options.mode === 'endless' ? 'endless' : 'clear';
  if (tankType) currentTankType = tankType;
  // Ensure selected tank is unlocked
  if (!unlockedTanks.has(currentTankType)) currentTankType = 'spread';
  const diff = difficultySettings[difficulty] || difficultySettings.normal;
  lives = diff.lives;
  score = 0;
  level = 1;
  gameRunning = false;
  gameOverFlag = false;
  isPaused = false;
  initAudio();
  resetRunState();
  if (options.dailyChallenge) {
    isDailyChallenge = true;
    seededRandom = options.seededRandom || mulberry32(getDailySeed());
    dailyTarget = options.dailyTarget || getDailyTarget(getDailySeed());
    dailyTargetAchieved = false;
    loadDailyChallengeStatus();
  } else {
    isDailyChallenge = false;
    seededRandom = null;
    dailyTarget = null;
    dailyTargetAchieved = false;
    dailyCompletedToday = false;
    dailyBestScore = 0;
  }
  generateObstacles();
  isDualMode = options.dual || false;
  p2TankTypeGlobal = options.p2tank || currentTankType;
  if (isDualMode) {
    player = new PlayerTank(currentTankType, 'kbm');
    player2 = new PlayerTank(p2TankTypeGlobal, 'gamepad');
    dualSharedLives = Math.max(3, diff.lives * 2);
    lives = dualSharedLives;
    dualReviveCooldown = 0;
    p1DeadTimer = 0; p2DeadTimer = 0;
    applyTankUpgrades(currentTankType);
    player.x = W/2 - 80; player.y = H - 100;
    player2.x = W/2 + 80; player2.y = H - 100;
    player2.turretColor = '#ff8800';
    player2.color = '#331100';
  } else {
    player = new PlayerTank(currentTankType);
    player2 = null;
    applyTankUpgrades(currentTankType);
    positionPlayerSafely(220);
  }
  resetAchievementTracking();
  renderDailyTarget();
  initWeather();
  startNextWave();
  document.getElementById('lives').textContent = lives;
  document.getElementById('score').textContent = score;
  document.getElementById('level').textContent = level;
  updateRunXpHud();
  gameRunning = true;
  ensureGameLoopScheduled();
  startMusic();
}

init();

// --- Main Loop ---
let lastLoopErrorAt = 0;
let gameLoopScheduled = false;
function ensureGameLoopScheduled() {
  if (gameLoopScheduled) return;
  gameLoopScheduled = true;
  requestAnimationFrame(gameLoop);
}

// --- Performance Monitor (F3 toggle or ?debug URL param) ---
let perfEnabled = false;
let perfFrames = 0;
let perfLastTime = 0;
let perfFps = 0;
let perfMaxFps = 0;
let perfMinFps = 999;
let perfObjectCounts = '';

function togglePerfMonitor() {
  perfEnabled = !perfEnabled;
  const el = document.getElementById('perf-overlay');
  if (el) el.style.display = perfEnabled ? 'block' : 'none';
}

function updatePerfMonitor(now) {
  if (!perfEnabled) return;
  perfFrames++;
  if (perfLastTime === 0) perfLastTime = now;
  const elapsed = now - perfLastTime;
  if (elapsed >= 1000) {
    const fps = Math.round(perfFrames / (elapsed / 1000));
    perfFps = fps;
    if (fps > perfMaxFps) perfMaxFps = fps;
    if (fps < perfMinFps) perfMinFps = fps;
    perfFrames = 0;
    perfLastTime = now;
    const bullets = (playerBullets ? playerBullets.length : 0) + (enemyBullets ? enemyBullets.length : 0);
    const particles = particles2 ? particles2.length : 0;
    const pups = powerUps ? powerUps.length : 0;
    perfObjectCounts = 'OBJ:' + enemies.length + '/' + bullets + '/' + particles + '/' + pups;
    const el = document.getElementById('perf-overlay');
    if (el) {
      el.textContent = 'FPS:' + fps + ' | ' + perfObjectCounts + ' | W:' + wave + ' | MAX:' + perfMaxFps + ' MIN:' + perfMinFps;
    }
  }
}

function ensurePerfOverlay() {
  if (document.getElementById('perf-overlay')) return;
  const el = document.createElement('div');
  el.id = 'perf-overlay';
  el.style.cssText = 'position:fixed;top:4px;left:4px;z-index:9999;background:rgba(0,0,0,0.75);color:#0f0;' +
    'padding:3px 8px;font:10px monospace;display:none;pointer-events:none;';
  document.body.appendChild(el);
}

function gameLoop() {
  gameLoopScheduled = false;
  try {
    update();
    draw();
    updateWeather();
  } catch (err) {
    const now = Date.now();
    if (now - lastLoopErrorAt > 1000) {
      console.error('[Gengetsu Senki] game loop recovered:', err);
      lastLoopErrorAt = now;
    }
  }
  ensureGameLoopScheduled();
  if (perfEnabled) updatePerfMonitor(performance.now());
}

ensureGameLoopScheduled();
