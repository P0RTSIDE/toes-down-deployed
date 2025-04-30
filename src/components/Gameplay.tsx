"use client";

import React, { useEffect, useState } from "react";
import {
  useGameState,
  useDeviceOrientation,
  useKeyboardControls,
} from "../hooks/gameHooks";
import GameResults from "./GameResults";

// Define interface for DeviceOrientationEvent with iOS permission API
interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<string>;
}

interface GameplayProps {
  gameItems: string[];
  timeLimit: number;
  onFinish: (score: { correct: number; skipped: number }) => void;
  onCancel: () => void;
}

export default function Gameplay({
  gameItems,
  timeLimit,
  onFinish,
  onCancel,
}: GameplayProps) {
  const [, setIsDeviceOrientationGranted] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showResults, setShowResults] = useState(false);

  const gameSettings = { selectedPacks: [], timeLimit };
  const {
    gameState,
    timeLeft,
    currentItem,
    score,
    actionInProgress,
    startGame,
    beginPlay,
    markCorrect,
    markSkipped,
    endGame,
  } = useGameState(gameSettings);

  const {
    direction: gyroDirection,
    isSupported: isGyroSupported,
    requestPermission,
  } = useDeviceOrientation();

  const keyDirection = useKeyboardControls();

  // Check for device orientation permission requirements
  useEffect(() => {
    if (
      isGyroSupported &&
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS)
        .requestPermission === "function"
    ) {
      setShowPermissionPrompt(true);
    } else {
      // No permission needed or not supported
      setIsDeviceOrientationGranted(true);
    }
  }, [isGyroSupported]);

  // Start game with items
  useEffect(() => {
    startGame(gameItems);
  }, [gameItems, startGame]);

  // Handle countdown
  useEffect(() => {
    if (gameState !== "ready") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          beginPlay();
          return 3;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, beginPlay]);

  // Handle direction changes from gyro or keyboard
  useEffect(() => {
    if (gameState !== "playing" || actionInProgress) return;

    const direction =
      gyroDirection !== "neutral" ? gyroDirection : keyDirection;

    if (direction === "up") {
      markCorrect();
    } else if (direction === "down") {
      markSkipped();
    }
  }, [
    gameState,
    actionInProgress,
    gyroDirection,
    keyDirection,
    markCorrect,
    markSkipped,
  ]);

  // Finish game when time is up
  useEffect(() => {
    if (gameState === "finished") {
      onFinish({
        correct: score.correct,
        skipped: score.skipped,
      });
    }
  }, [gameState, score, onFinish]);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    setIsDeviceOrientationGranted(granted);
    setShowPermissionPrompt(false);

    if (granted) {
      startGame(gameItems);
    }
  };

  const handleEndGame = () => {
    // Show the results screen instead of immediately calling onCancel
    setShowResults(true);
    
    // If endGame is available in your hook, use it to properly end the game state
    if (gameState === "playing" && typeof endGame === "function") {
      endGame();
    }
  };

  // Results screen
  if (showResults) {
    return (
      <GameResults 
        score={score}
        onPlayAgain={() => onFinish(score)}
      />
    );
  }

  // Permission prompt
  if (showPermissionPrompt) {
    return (
      <div className="container">
        <div className="card my-8 text-center">
          <h2 className="text-xl font-bold mb-4 text-[color:rgb(var(--info-color))]">
            Device Motion Required
          </h2>
          <p className="mb-4">
            This game uses your device&apos;s motion sensors for the best
            experience.
          </p>
          <button
            onClick={handleRequestPermission}
            className="button button-primary mb-2"
          >
            Grant Access
          </button>
          <button
            onClick={() => setIsDeviceOrientationGranted(true)}
            className="button block w-full"
          >
            Continue without Motion Access
          </button>
        </div>
      </div>
    );
  }

  // Countdown screen
  if (gameState === "ready") {
    return (
      <div className="container flex flex-col items-center justify-center h-[70vh]">
        <div className="text-center">
          <h2 className="text-6xl font-bold text-[color:rgb(var(--info-color))]">
            {countdown}
          </h2>
          <p className="mt-8">
            Get ready! Hold your device up to your forehead.
          </p>
          <p className="mt-2 text-sm opacity-70">
            Tilt <span className="rotate-180 inline-block">↓</span> for correct,
            and <span className="inline-block">↓</span> for skip
          </p>
        </div>
      </div>
    );
  }

  // Playing screen
  if (gameState === "playing") {
    return (
      <div className="container">
        {/* Timer bar */}
        <div className="w-full bg-[rgb(45,46,40)] h-2 mb-4 rounded-full overflow-hidden">
          <div
            className="bg-[rgb(var(--info-color))] h-full"
            style={{ width: `${(timeLeft / timeLimit) * 100}%` }}
          ></div>
        </div>

        {/* Time counter */}
        <div className="text-right mb-2">
          <span className="text-lg font-bold">{timeLeft}s</span>
        </div>

        {/* Game card */}
        <div
          className={`game-card ${gyroDirection === "up" ? "flipped" : ""} ${
            actionInProgress ? "opacity-70 pointer-events-none" : ""
          }`}
        >
          <div className="game-card-inner">
            <div className="game-card-front">
              <span>{currentItem}</span>
            </div>
            <div className="game-card-back">
              <span>CORRECT!</span>
            </div>
          </div>
        </div>

        {/* Gesture indicators */}
        <div className="flex justify-between items-center mt-8">
          <div className="text-center">
            <div className="text-2xl mb-1">↓</div>
            <div className="text-sm opacity-70">Skip</div>
          </div>
          <div>
            <div className="text-xl font-bold">
              <span className="correct">{score.correct}</span> |
              <span className="skipped"> {score.skipped}</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl rotate-180 mb-1">↓</div>
            <div className="text-sm opacity-70">Correct</div>
          </div>
        </div>

        {/* Cancel button */}
        <button onClick={handleEndGame} className="button mt-8 w-full">
          End Game
        </button>
      </div>
    );
  }

  // Default/fallback content
  return (
    <div className="container">
      <div className="text-center">Loading game...</div>
    </div>
  );
}
