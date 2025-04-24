"use client";

import React from "react";

interface GameResultsProps {
  score: {
    correct: number;
    skipped: number;
  };
  onPlayAgain: () => void;
}

export default function GameResults({ score, onPlayAgain }: GameResultsProps) {
  const totalItems = score.correct + score.skipped;
  const accuracy =
    totalItems > 0 ? Math.round((score.correct / totalItems) * 100) : 0;

  return (
    <div className="container">
      <div className="title-bar">
        <h1 className="text-xl font-bold">Game Results</h1>
      </div>

      <div className="card my-8 text-center">
        <h2 className="text-2xl font-bold mb-8 text-[color:rgb(var(--info-color))]">
          Game Over!
        </h2>

        <div className="mb-8">
          <div className="text-6xl font-bold">{score.correct}</div>
          <div className="text-xl mt-2 opacity-80">correct guesses</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card">
            <div className="text-2xl font-bold text-[color:rgb(var(--success-color))]">
              {accuracy}%
            </div>
            <div className="text-sm mt-1 opacity-80">accuracy</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-[color:rgb(var(--warning-color))]">
              {score.skipped}
            </div>
            <div className="text-sm mt-1 opacity-80">skipped</div>
          </div>
        </div>

        <button onClick={onPlayAgain} className="button button-primary w-full">
          Play Again
        </button>
      </div>
    </div>
  );
}
