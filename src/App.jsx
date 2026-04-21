import React, { useState, useEffect } from "react";
import { initBoard } from "./utils/game";
import { left, right, up, down, gameOver, win } from "./utils/move";
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

  const [showRules, setShowRules] = useState(false);

  // 🔥 BEST SCORE INIT (fresh from now logic)
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

  // 🔥 FIX SCROLL ISSUE + CONTROLS
  useEffect(() => {
    const keyHandler = (e) => {
      const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

      if (keys.includes(e.key)) {
        e.preventDefault(); // 🚀 stops scrolling

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

      if (win(nb)) winSound();
      if (gameOver(nb)) loseSound();
    }
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

      {(gameOver(board) || win(board)) && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{win(board) ? "🎉 You Win!" : "💀 Game Over"}</h2>

            <p>Score: {score}</p>

            <div className="modal-actions">
              <button onClick={reset}>Play Again</button>
              <button onClick={undo}>Undo</button>
            </div>
          </div>
        </div>
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
