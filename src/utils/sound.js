let ctx;
const get = () =>
  ctx || (ctx = new (window.AudioContext || window.webkitAudioContext)());

const tone = (f, d = 0.1) => {
  const c = get(),
    o = c.createOscillator(),
    g = c.createGain();
  o.frequency.value = f;
  g.gain.value = 0.1;
  o.connect(g);
  g.connect(c.destination);
  o.start();
  o.stop(c.currentTime + d);
};

export const moveSound = () => tone(400);
export const mergeSound = () => tone(200);
export const winSound = () =>
  [400, 600, 800].forEach((f, i) => setTimeout(() => tone(f, 0.2), i * 100));
export const loseSound = () =>
  [500, 300, 100].forEach((f, i) => setTimeout(() => tone(f, 0.2), i * 100));
