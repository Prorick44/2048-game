import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";

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
  const [showRules, setShowRules] = useState(false);

  const [leaderboard, setLeaderboard] = useState([]);
  const [name, setName] = useState("");

  const [isGameOver, setIsGameOver] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);

  // 🔥 best score fresh start
  useEffect(() => {
    const flag = localStorage.getItem("freshBestStart");
    if (!flag) {
      localStorage.setItem("best", "0");
      localStorage.setItem("freshBestStart", "true");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBestScore(0);
    } else {
      setBestScore(getBest());
    }
  }, []);

  // 🔥 leaderboard
  useEffect(() => {
    getTopScores().then(setLeaderboard);
  }, []);

  // 🔥 update best
  useEffect(() => {
    if (score > best) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBestScore(score);
      setBest(score);
      setIsNewBest(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  // 🔥 keyboard control (NO SCROLL)
  useEffect(() => {
    const handler = (e) => {
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
    window.addEventListener("keydown", handler, { passive: false });
    return () => window.removeEventListener("keydown", handler);
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

      if (win(nb)) {
        winSound();
        confetti({ particleCount: 120, spread: 70 });
        setIsGameOver(true);
      } else if (gameOver(nb)) {
        loseSound();
        setIsGameOver(true);
      }
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
    setIsGameOver(false);
    setName("");
    setIsSubmitted(false);
    setIsNewBest(false);
  };

  const saveScore = async () => {
    if (!name || isSubmitted) return;
    await submitScore(name, score);
    setLeaderboard(await getTopScores());
    setIsSubmitted(true);
  };

  return (
    <div className="app">
      <h1>2048</h1>

      {/* Rules */}
      <div className="rules-box">
        <button onClick={() => setShowRules((p) => !p)}>
          {showRules ? "Hide Rules ▲" : "Show Rules ▼"}
        </button>
        {showRules && (
          <p className="rules">
            Combine tiles using arrow keys. Same numbers merge. Reach 2048.
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

      {/* MODAL */}
      {isGameOver && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{win(board) ? "🎉 You Win!" : "💀 Game Over"}</h2>
            <p>Score: {score}</p>

            {isNewBest && <p className="new-best">🏆 New High Score!</p>}

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              onKeyDown={(e) => e.key === "Enter" && saveScore()}
            />

            <button disabled={!name || isSubmitted} onClick={saveScore}>
              {isSubmitted ? "Submitted ✔" : "Submit Score"}
            </button>

            <div className="modal-actions">
              <button onClick={reset}>Play Again</button>
              <button onClick={undo}>Undo</button>
            </div>
          </div>
        </div>
      )}

      {/* GRID */}
      <div className="grid">
        {board.map((r, i) =>
          r.map((c, j) => (
            <div key={i + "-" + j} className={`cell v-${c}`}>
              {c || ""}
            </div>
          )),
        )}
      </div>

      {/* Leaderboard */}
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
