import { useState, useEffect, useCallback } from 'react';
import { GameSettings, GameScore, GameState } from '../utils/game';

export function useGameState(settings: GameSettings) {
  const [gameState, setGameState] = useState<GameState>('selecting');
  const [timeLeft, setTimeLeft] = useState(settings.timeLimit);
  const [currentItems, setCurrentItems] = useState<string[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [score, setScore] = useState<GameScore>({
    correct: 0,
    skipped: 0,
    items: [],
  });
  const [actionInProgress, setActionInProgress] = useState(false);
  const [lastActionTimestamp, setLastActionTimestamp] = useState(0);
  
  // Reset the game state
  const resetGame = useCallback(() => {
    setGameState('selecting');
    setTimeLeft(settings.timeLimit);
    setCurrentItemIndex(0);
    setActionInProgress(false);
    setLastActionTimestamp(0);
    setScore({
      correct: 0,
      skipped: 0,
      items: [],
    });
  }, [settings.timeLimit]);

  // Start the game
  const startGame = useCallback((items: string[]) => {
    if (items.length === 0) return;
