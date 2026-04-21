import { left, right, up, down } from "./move";

const MOVES = { LEFT: left, RIGHT: right, UP: up, DOWN: down };

const clone = (b) => b.map(r => [...r]);

const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const getEmpty = (b) => {
  let cells = [];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++)
      if (b[i][j] === 0) cells.push({ i, j });
  return cells;
};

// 🔥 WEIGHT MATRIX (corner strategy)
const WEIGHTS = [
  [65536, 16384, 4096, 1024],
  [256,   1024, 256,  64],
  [16,    64,   16,   4],
  [1,     4,    1,    0]
];

// 🔥 HEURISTIC FUNCTION (very strong)
const evaluate = (b) => {
  let score = 0;
  let empty = 0;

  // weighted board (keep max tile top-left)
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let v = b[i][j];
      if (v === 0) empty++;
      score += v * WEIGHTS[i][j];
    }
  }

  // smoothness (penalize big differences)
  let smooth = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; j++) {
      if (b[i][j] && b[i][j + 1]) {
        smooth -= Math.abs(Math.log2(b[i][j]) - Math.log2(b[i][j + 1]));
      }
      if (b[j][i] && b[j + 1][i]) {
        smooth -= Math.abs(Math.log2(b[j][i]) - Math.log2(b[j + 1][i]));
      }
    }
  }

  // monotonicity (prefer sorted rows/cols)
  let mono = 0;
  for (let i = 0; i < 4; i++) {
    let inc = 0, dec = 0;
    for (let j = 0; j < 3; j++) {
      if (b[i][j] > b[i][j + 1]) dec++;
      else inc++;
    }
    mono += Math.max(inc, dec);
  }

  return score + smooth * 100 + mono * 1000 + empty * 2000;
};

// 🔥 EXPECTIMAX WITH PRUNING
const expectimax = (board, depth, isPlayer, alpha = -Infinity) => {
  if (depth === 0) return evaluate(board);

  // PLAYER NODE
  if (isPlayer) {
    let best = -Infinity;

    for (let dir in MOVES) {
      let s = { score: 0 };
      let newBoard = MOVES[dir](clone(board), s);

      if (equal(board, newBoard)) continue;

      let val = expectimax(newBoard, depth - 1, false, best);
      best = Math.max(best, val);

      // pruning (huge speed boost)
      if (best > alpha) break;
    }

    return best === -Infinity ? evaluate(board) : best;
  }

  // CHANCE NODE (spawn 2 or 4)
  let cells = getEmpty(board);
  if (cells.length === 0) return evaluate(board);

  let total = 0;

  for (let { i, j } of cells) {
    let b2 = clone(board);
    b2[i][j] = 2;
    total += 0.9 * expectimax(b2, depth - 1, true);

    let b4 = clone(board);
    b4[i][j] = 4;
    total += 0.1 * expectimax(b4, depth - 1, true);
  }

  return total / cells.length;
};

// 🔥 DYNAMIC DEPTH (smart optimization)
const getDepth = (board) => {
  let empty = getEmpty(board).length;
  if (empty >= 8) return 3;
  if (empty >= 4) return 4;
  return 5; // late game deeper search
};

// 🔥 MAIN FUNCTION
export const bestMove = (board) => {
  let bestDir = null;
  let bestScore = -Infinity;

  const depth = getDepth(board);

  for (let dir in MOVES) {
    let s = { score: 0 };
    let newBoard = MOVES[dir](clone(board), s);

    if (equal(board, newBoard)) continue;

    let val = expectimax(newBoard, depth, false);

    if (val > bestScore) {
      bestScore = val;
      bestDir = dir;
    }
  }

  return bestDir;
};