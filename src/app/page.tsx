"use client";

import { useState } from "react";
import PackSelection from "@/components/PackSelection";
import Gameplay from "@/components/Gameplay";
import GameResults from "@/components/GameResults";

export default function Home() {
  const [gameState, setGameState] = useState<
    "selection" | "playing" | "results"
  >("selection");
  const [gameItems, setGameItems] = useState<string[]>([]);
  const [gameScore, setGameScore] = useState({ correct: 0, skipped: 0 });

  const handleStartGame = (items: string[]) => {
    setGameItems(items);
    setGameState("playing");
  };

  const handleGameFinish = (score: { correct: number; skipped: number }) => {
    setGameScore(score);
    setGameState("results");
  };

  const handlePlayAgain = () => {
    setGameState("selection");
  };

  return (
    <main className="min-h-screen flex flex-col">
      <div className="vscode-header">
        <span>Toes Down</span>
      </div>

      <div className="flex-grow py-6">
        {gameState === "selection" && (
          <PackSelection onStartGame={handleStartGame} />
        )}

        {gameState === "playing" && (
          <Gameplay
            gameItems={gameItems}
            timeLimit={60}
            onFinish={handleGameFinish}
            onCancel={() => setGameState("selection")}
          />
        )}

        {gameState === "results" && (
          <GameResults score={gameScore} onPlayAgain={handlePlayAgain} />
        )}
      </div>
    </main>
  );
}
