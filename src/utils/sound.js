let ctx;

const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
};

// 🔹 GENERIC PLAY FUNCTION
const playTone = ({ freq = 400, duration = 0.1, type = "sine", volume = 0.1 }) => {
  const context = getCtx();

  const osc = context.createOscillator();
  const gain = context.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, context.currentTime);

  gain.gain.setValueAtTime(volume, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

  osc.connect(gain);
  gain.connect(context.destination);

  osc.start();
  osc.stop(context.currentTime + duration);
};

// 🔥 MOVE (soft click with slight randomness)
export const moveSound = () => {
  playTone({
    freq: 350 + Math.random() * 100,
    duration: 0.06,
    type: "square",
    volume: 0.08
  });
};

// 🔥 MERGE (deeper pop, feels satisfying)
export const mergeSound = () => {
  playTone({
    freq: 200 + Math.random() * 80,
    duration: 0.12,
    type: "triangle",
    volume: 0.12
  });
};

// 🔥 WIN (ascending chime)
export const winSound = () => {
  const context = getCtx();
  [400, 600, 800].forEach((f, i) => {
    setTimeout(() => {
      playTone({ freq: f, duration: 0.15, volume: 0.15 });
    }, i * 120);
  });
};

// 🔥 GAME OVER (descending tone)
export const loseSound = () => {
  const context = getCtx();
  [500, 300, 150].forEach((f, i) => {
    setTimeout(() => {
      playTone({ freq: f, duration: 0.2, type: "sawtooth", volume: 0.15 });
    }, i * 150);
  });
};