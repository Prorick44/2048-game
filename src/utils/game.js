export const GRID = 4;

export const emptyBoard = () =>
  Array(GRID).fill(0).map(() => Array(GRID).fill(0));

export const randomTile = (board) => {
  const empty = [];
  board.forEach((r, i) =>
    r.forEach((c, j) => c === 0 && empty.push({ i, j }))
  );

  if (!empty.length) return board;

  const { i, j } = empty[Math.floor(Math.random() * empty.length)];
  const newBoard = board.map(r => [...r]);
  newBoard[i][j] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
};

export const initBoard = () => {
  let b = emptyBoard();
  b = randomTile(b);
  b = randomTile(b);
  return b;
};