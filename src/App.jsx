import React, { useState, useEffect } from "react";
import { initBoard } from "./utils/game";
import { left, right, up, down, gameOver, win } from "./utils/move";
import { bestMove } from "./utils/ai";
import { getBest, setBest } from "./utils/storage";
import { moveSound, mergeSound, winSound, loseSound } from "./utils/sound";
import { submitScore, getTopScores } from "./firebase";

export default function App() {
  const [board, setBoard] = useState(initBoard());
  const [score, setScore] = useState(0);
  const [best, setBestScore] = useState(getBest());
  const [history, setHistory] = useState([]);
  const [dark, setDark] = useState(true);

  const [leaderboard, setLeaderboard] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    getTopScores().then(setLeaderboard);
  }, []);

  useEffect(() => {
    if (score > best) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBestScore(score);
      setBest(score);
    }
  }, [score]);

  useEffect(() => {
    const handleKey = (e) => {
      // eslint-disable-next-line react-hooks/immutability
      if (e.key === "ArrowLeft") move("LEFT");
      if (e.key === "ArrowRight") move("RIGHT");
      if (e.key === "ArrowUp") move("UP");
      if (e.key === "ArrowDown") move("DOWN");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  useEffect(() => {
    document.body.className = dark ? "dark" : "";
  }, [dark]);

  const move = (dir) => {
    let s = { score: 0 };
    let nb;

    if (dir === "LEFT") nb = left(board, s);
    if (dir === "RIGHT") nb = right(board, s);
    if (dir === "UP") nb = up(board, s);
    if (dir === "DOWN") nb = down(board, s);

    if (JSON.stringify(nb) !== JSON.stringify(board)) {
      setHistory((h) => [...h, { board, score }]);
      setBoard(nb);
      setScore((p) => p + s.score);

      moveSound();
      if (s.score) mergeSound();

      if (win(nb)) winSound();
      if (gameOver(nb)) loseSound();
    }
  };

  const auto = () => {
    let running = true;

    const loop = () => {
      if (!running) return;

      setBoard((prev) => {
        const m = bestMove(prev);
        if (!m) {
          running = false;
          return prev;
        }

        let s = { score: 0 };
        let nb;

        if (m === "LEFT") nb = left(prev, s);
        if (m === "RIGHT") nb = right(prev, s);
        if (m === "UP") nb = up(prev, s);
        if (m === "DOWN") nb = down(prev, s);

        setScore((p) => p + s.score);

        moveSound();
        if (s.score) mergeSound();

        setTimeout(loop, 70);
        return nb;
      });
    };

    loop();
  };

  const undo = () => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setBoard(last.board);
    setScore(last.score);
    setHistory((h) => h.slice(0, -1));
  };

  const reset = () => {
    setBoard(initBoard());
    setScore(0);
    setHistory([]);
  };

  const saveScore = async () => {
    if (!name) return;
    await submitScore(name, score);
    setLeaderboard(await getTopScores());
    setName("");
  };

  return (
    <div className="app">
      <div className="header">
        <h1>2048</h1>
        <div className="scores">
          <div>Score {score}</div>
          <div>Best {best}</div>
        </div>
      </div>

      <div className="controls">
        <button onClick={undo}>Undo</button>
        <button onClick={auto}>Auto</button>
        <button onClick={reset}>Restart</button>
        <button onClick={() => setDark(!dark)}>Theme</button>
      </div>

      {(gameOver(board) || win(board)) && (
        <div className="overlay">{win(board) ? "YOU WIN 🎉" : "GAME OVER"}</div>
      )}

      <div className="grid">
        {board.map((r, i) =>
          r.map((c, j) => (
            <div key={i + "-" + j} className={`cell v-${c}`}>
              {c || ""}
            </div>
          )),
        )}
      </div>

      <div className="leaderboard">
        <h3>Leaderboard</h3>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <button onClick={saveScore}>Submit</button>

        {leaderboard.map((p, i) => (
          <div key={i}>
            {i + 1}. {p.name} - {p.score}
          </div>
        ))}
      </div>
    </div>
  );
}
