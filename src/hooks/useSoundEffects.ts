// Synthetic sound effects using Web Audio API — no audio files needed

let ctx: AudioContext | null = null;
let muted = false;

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
}

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  // Resume if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

function shouldPlay(): boolean {
  return !muted;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.15,
  rampDown = true,
) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;
  if (rampDown) {
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  }
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

function playNoise(duration: number, volume = 0.1) {
  const c = getCtx();
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = c.createBufferSource();
  source.buffer = buffer;
  const gain = c.createGain();
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  source.connect(gain);
  gain.connect(c.destination);
  source.start(c.currentTime);
}

export const sfx = {
  poopDrop() {
    if (!shouldPlay()) return;
    playTone(600, 0.1, 'sine', 0.1);
    setTimeout(() => { if (shouldPlay()) playTone(300, 0.08, 'sine', 0.08); }, 50);
  },

  hitHuman() {
    if (!shouldPlay()) return;
    playNoise(0.15, 0.15);
    playTone(200, 0.1, 'square', 0.08);
    setTimeout(() => { if (shouldPlay()) playTone(120, 0.1, 'square', 0.06); }, 60);
  },

  humanShoot() {
    if (!shouldPlay()) return;
    playTone(800, 0.08, 'square', 0.1);
    setTimeout(() => { if (shouldPlay()) playTone(400, 0.12, 'square', 0.08); }, 40);
  },

  birdHit() {
    if (!shouldPlay()) return;
    playNoise(0.1, 0.2);
    playTone(250, 0.15, 'sawtooth', 0.12);
    setTimeout(() => { if (shouldPlay()) playTone(150, 0.2, 'square', 0.08); }, 80);
  },

  gameOver() {
    if (!shouldPlay()) return;
    playTone(400, 0.25, 'square', 0.1);
    setTimeout(() => { if (shouldPlay()) playTone(350, 0.25, 'square', 0.1); }, 200);
    setTimeout(() => { if (shouldPlay()) playTone(300, 0.25, 'square', 0.1); }, 400);
    setTimeout(() => { if (shouldPlay()) playTone(200, 0.5, 'square', 0.12); }, 600);
  },

  levelUp() {
    if (!shouldPlay()) return;
    playTone(400, 0.12, 'square', 0.1);
    setTimeout(() => { if (shouldPlay()) playTone(500, 0.12, 'square', 0.1); }, 100);
    setTimeout(() => { if (shouldPlay()) playTone(600, 0.12, 'square', 0.1); }, 200);
    setTimeout(() => { if (shouldPlay()) playTone(800, 0.25, 'square', 0.12); }, 300);
  },
};
