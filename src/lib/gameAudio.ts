let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function beep(freq: number, duration: number, vol = 0.2, type: OscillatorType = 'sine') {
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    o.stop(c.currentTime + duration);
  } catch { /* silent fail */ }
}

export const playCollect = () => { beep(880, 0.15, 0.15); setTimeout(() => beep(1100, 0.1, 0.12), 80); };
export const playHit = () => { beep(200, 0.3, 0.25, 'sawtooth'); };
export const playWin = () => { beep(523, 0.15, 0.15); setTimeout(() => beep(659, 0.15, 0.12), 150); setTimeout(() => beep(784, 0.25, 0.15), 300); };
export const playSelect = () => beep(660, 0.1, 0.1);
export const playBuy = () => { beep(440, 0.1, 0.12); setTimeout(() => beep(880, 0.15, 0.12), 100); };

export const characterSounds: Record<string, () => void> = {
  fish: () => { beep(600, 0.15, 0.1, 'sine'); setTimeout(() => beep(800, 0.1, 0.08), 100); },
  wolf: () => { beep(250, 0.3, 0.15, 'sawtooth'); },
  lion: () => { beep(180, 0.4, 0.2, 'square'); setTimeout(() => beep(220, 0.2, 0.15, 'square'), 200); },
};
