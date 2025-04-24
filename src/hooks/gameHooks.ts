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
  
  // Reset the game state
  const resetGame = useCallback(() => {
    setGameState('selecting');
    setTimeLeft(settings.timeLimit);
    setCurrentItemIndex(0);
    setActionInProgress(false);
    setScore({
      correct: 0,
      skipped: 0,
      items: [],
    });
  }, [settings.timeLimit]);

  // Start the game
  const startGame = useCallback((items: string[]) => {
    if (items.length === 0) return;
    
    // Shuffle the items
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    setCurrentItems(shuffledItems);
    setGameState('ready');
  }, []);

  // Begin gameplay after countdown
  const beginPlay = useCallback(() => {
    setGameState('playing');
  }, []);

  // Mark current item as correct
  const markCorrect = useCallback(() => {
    if (gameState !== 'playing' || actionInProgress) return;
    
    setActionInProgress(true);
    setScore(prev => ({
      ...prev,
      correct: prev.correct + 1,
      items: [...prev.items, { text: currentItems[currentItemIndex], status: 'correct' }],
    }));

    // Add a delay before showing the next card
    setTimeout(() => {
      if (currentItemIndex < currentItems.length - 1) {
        setCurrentItemIndex(prev => prev + 1);
      } else {
        // End the game when we run out of words
        setGameState('finished');
      }
      setActionInProgress(false);
    }, 3000); // 500ms delay
  }, [gameState, currentItems, currentItemIndex, actionInProgress]);

  // Mark current item as skipped
  const markSkipped = useCallback(() => {
    if (gameState !== 'playing' || actionInProgress) return;
    
    setActionInProgress(true);
    setScore(prev => ({
      ...prev,
      skipped: prev.skipped + 1,
      items: [...prev.items, { text: currentItems[currentItemIndex], status: 'skipped' }],
    }));

    // Add a delay before showing the next card
    setTimeout(() => {
      if (currentItemIndex < currentItems.length - 1) {
        setCurrentItemIndex(prev => prev + 1);
      } else {
        // End the game when we run out of words
        setGameState('finished');
      }
      setActionInProgress(false);
    }, 500); // 500ms delay
  }, [gameState, currentItems, currentItemIndex, actionInProgress]);

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  return {
    gameState,
    timeLeft,
    currentItem: currentItems[currentItemIndex] || '',
    score,
    actionInProgress,
    resetGame,
    startGame,
    beginPlay,
    markCorrect,
    markSkipped,
  };
}

export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<{ beta: number | null }>({ beta: null });
  const [lastBeta, setLastBeta] = useState<number | null>(null);
  const [direction, setDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if DeviceOrientationEvent is available
    const supported = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
    setIsSupported(supported);

    if (!supported) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // beta is the front-to-back tilt in degrees, where front is positive
      if (e.beta !== null) {
        setOrientation({ beta: e.beta });
        
        if (lastBeta !== null) {
          const threshold = 35; // degrees of tilt to trigger
          
          if (e.beta < -threshold && (lastBeta >= -threshold || lastBeta === null)) {
            setDirection('up');
          } else if (e.beta > threshold && (lastBeta <= threshold || lastBeta === null)) {
            setDirection('down');
          } else if (Math.abs(e.beta) < threshold/2) {
            setDirection('neutral');
          }
        }
        
        setLastBeta(e.beta);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [lastBeta]);

  // Define interface for DeviceOrientationEvent with iOS-specific requestPermission
  interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
    requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
  }

  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof ((DeviceOrientationEvent as unknown) as DeviceOrientationEventiOS).requestPermission === 'function') {
      try {
        const permissionState = await ((DeviceOrientationEvent as unknown) as DeviceOrientationEventiOS).requestPermission?.();
        return permissionState === 'granted';
      } catch (e) {
        console.error('Error requesting device orientation permission:', e);
        return false;
      }
    }
    return true; // No permission needed or supported
  };

  return {
    orientation,
    direction,
    isSupported,
    requestPermission,
  };
}

export function useKeyboardControls() {
  const [keyDirection, setKeyDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setKeyDirection('down');
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setKeyDirection('up');
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setKeyDirection('neutral');
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keyDirection;
}
