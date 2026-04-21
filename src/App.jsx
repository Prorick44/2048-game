import React, { useState, useEffect } from "react";
import { initBoard } from "./utils/game";
import { left, right, up, down, gameOver, win } from "./utils/move";
import { getBest, setBest } from "./utils/storage";
import { moveSound, mergeSound, winSound, loseSound } from "./utils/sound";
import { submitScore, getTopScores } from "./firebase";

export default function App() {
  const [board, setBoard] = useState(initBoard());
  const [score, setScore] = useState(0);
  const [best, setBestScore] = useState(0);
  const [history, setHistory] = useState([]);
  const [dark, setDark] = useState(true);

  const [leaderboard, setLeaderboard] = useState([]);
  const [name, setName] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // 🔥 BEST SCORE (fresh start once)
  useEffect(() => {
    const freshStart = localStorage.getItem("freshBestStart");

    if (!freshStart) {
      localStorage.setItem("best", "0");
      localStorage.setItem("freshBestStart", "true");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBestScore(0);
    } else {
      setBestScore(getBest());
    }
  }, []);

  // 🔥 LOAD LEADERBOARD
  useEffect(() => {
    getTopScores().then(setLeaderboard);
  }, []);

  // 🔥 UPDATE BEST
  useEffect(() => {
    if (score > best) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBestScore(score);
      setBest(score);
    }
  }, [score]);

  // 🔥 KEYBOARD (NO SCROLL)
  useEffect(() => {
    const keyHandler = (e) => {
      const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

      if (keys.includes(e.key)) {
        e.preventDefault();

        // eslint-disable-next-line react-hooks/immutability
        if (e.key === "ArrowLeft") move("LEFT");
        if (e.key === "ArrowRight") move("RIGHT");
        if (e.key === "ArrowUp") move("UP");
        if (e.key === "ArrowDown") move("DOWN");
      }
    };

    window.addEventListener("keydown", keyHandler, { passive: false });
    return () => window.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    document.body.className = dark ? "dark" : "";
  }, [dark]);

  // 🔥 MOVE
  const move = (dir) => {
    let s = { score: 0 },
      nb;

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

      if (win(nb)) {
        winSound();
        setIsGameOver(true);
      } else if (gameOver(nb)) {
        loseSound();
        setIsGameOver(true);
      }
    }
  };

  // 🔥 UNDO
  const undo = () => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setBoard(last.board);
    setScore(last.score);
    setHistory((h) => h.slice(0, -1));
  };

  // 🔥 RESET
  const reset = () => {
    setBoard(initBoard());
    setScore(0);
    setHistory([]);
    setIsGameOver(false);
    setName("");
  };

  // 🔥 SAVE SCORE
  const saveScore = async () => {
    if (!name) return;
    await submitScore(name, score);
    setLeaderboard(await getTopScores());
    setName("");
  };

  return (
    <div className="app">
      <h1>2048</h1>

      {/* 🔥 COLLAPSIBLE RULES */}
      <div className="rules-box">
        <button
          className="rules-toggle"
          onClick={() => setShowRules((prev) => !prev)}
        >
          {showRules ? "Hide Rules ▲" : "Show Rules ▼"}
        </button>

        {showRules && (
          <p className="rules">
            Combine tiles using arrow keys. When two tiles with the same value
            collide, they merge into one with double the value. Each move adds a
            new tile (2 or 4). Avoid filling the board. Reach 2048 to win.
          </p>
        )}
      </div>

      <h2>
        Score: {score} | Best: {best}
      </h2>

      <div className="controls">
        <button onClick={undo}>Undo</button>
        <button onClick={reset}>Restart</button>
        <button onClick={() => setDark(!dark)}>Theme</button>
      </div>

      {/* 🔥 MODAL (GAME OVER / WIN + SUBMIT) */}
      {isGameOver && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{win(board) ? "🎉 You Win!" : "💀 Game Over"}</h2>
            <p>Score: {score}</p>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />

            <button disabled={!name} onClick={saveScore}>
              Submit Score
            </button>

            <div className="modal-actions">
              <button onClick={reset}>Play Again</button>
              <button onClick={undo}>Undo</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 GRID */}
      <div className="grid">
        {board.map((r, i) =>
          r.map((c, j) => (
            <div key={i + "-" + j} className={`cell v-${c}`}>
              {c || ""}
            </div>
          )),
        )}
      </div>

      {/* 🔥 LEADERBOARD DISPLAY ONLY */}
      <div className="leaderboard">
        <h3>Leaderboard</h3>
        {leaderboard.map((p, i) => (
          <div key={i}>
            {i + 1}. {p.name} - {p.score}
          </div>
        ))}
      </div>
    </div>
  );
}
