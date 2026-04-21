import { randomTile } from "./game";

const slide = r => r.filter(x => x);

const merge = (r, scoreRef) => {
  for (let i = 0; i < r.length - 1; i++) {
    if (r[i] === r[i + 1]) {
      r[i] *= 2;
      scoreRef.score += r[i];
      r[i + 1] = 0;
    }
  }
  return r;
};

const operate = (r, s) => {
  let row = slide(r);
  row = merge(row, s);
  row = slide(row);
  while (row.length < 4) row.push(0);
  return row;
};

const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const left = (b, s) => {
  const nb = b.map(r => operate(r, s));
  return equal(b, nb) ? b : randomTile(nb);
};

export const right = (b, s) => {
  const nb = b.map(r => operate([...r].reverse(), s).reverse());
  return equal(b, nb) ? b : randomTile(nb);
};

export const up = (b, s) => {
  const t = b[0].map((_, i) => b.map(r => r[i]));
  const m = t.map(r => operate(r, s));
  const nb = m[0].map((_, i) => m.map(r => r[i]));
  return equal(b, nb) ? b : randomTile(nb);
};

export const down = (b, s) => {
  const t = b[0].map((_, i) => b.map(r => r[i]));
  const m = t.map(r => operate([...r].reverse(), s).reverse());
  const nb = m[0].map((_, i) => m.map(r => r[i]));
  return equal(b, nb) ? b : randomTile(nb);
};

export const gameOver = (b) => {
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      if (!b[i][j]) return false;
      if (j < 3 && b[i][j] === b[i][j + 1]) return false;
      if (i < 3 && b[i][j] === b[i + 1][j]) return false;
    }
  return true;
};

export const win = (b) => b.flat().includes(2048);