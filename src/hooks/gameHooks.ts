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
    
    // Shuffle the items
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    setCurrentItems(shuffledItems);
    setGameState('ready');
  }, []);

  // Begin gameplay after countdown
  const beginPlay = useCallback(() => {
    setGameState('playing');
  }, []);

  // End the game manually
  const endGame = useCallback(() => {
    setGameState('finished');
  }, []);

  // Mark current item as correct with improved responsiveness
  const markCorrect = useCallback(() => {
    if (gameState !== 'playing') return;
    
    // Prevent rapid sequential actions (debounce)
    const now = Date.now();
    if (now - lastActionTimestamp < 300) return;
    setLastActionTimestamp(now);

    // Immediately update score and set action in progress
    setScore(prev => ({
      ...prev,
      correct: prev.correct + 1,
      items: [...prev.items, { text: currentItems[currentItemIndex], status: 'correct' }],
    }));
    
    setActionInProgress(true);

    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      // Shorter delay for better responsiveness
      setTimeout(() => {
        if (currentItemIndex < currentItems.length - 1) {
          setCurrentItemIndex(prev => prev + 1);
        } else {
          // End the game when we run out of words
          setGameState('finished');
        }
        setActionInProgress(false);
      }, 2000); // Reduced from 2000ms to 500ms for better responsiveness
    });
  }, [gameState, currentItems, currentItemIndex, lastActionTimestamp]);

  // Mark current item as skipped with improved responsiveness
  const markSkipped = useCallback(() => {
    if (gameState !== 'playing') return;
    
    // Prevent rapid sequential actions (debounce)
    const now = Date.now();
    if (now - lastActionTimestamp < 300) return;
    setLastActionTimestamp(now);

    // Immediately update score and set action in progress
    setScore(prev => ({
      ...prev,
      skipped: prev.skipped + 1,
      items: [...prev.items, { text: currentItems[currentItemIndex], status: 'skipped' }],
    }));
    
    setActionInProgress(true);

    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      // Shorter delay for better responsiveness
      setTimeout(() => {
        if (currentItemIndex < currentItems.length - 1) {
          setCurrentItemIndex(prev => prev + 1);
        } else {
          // End the game when we run out of words
          setGameState('finished');
        }
        setActionInProgress(false);
      }, 2000); // Reduced from 2000ms to 500ms for better responsiveness
    });
  }, [gameState, currentItems, currentItemIndex, lastActionTimestamp]);

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
    }, 1500);

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
    endGame,
    markCorrect,
    markSkipped,
  };
}

export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<{ beta: number | null }>({ beta: null });
  const [lastBeta, setLastBeta] = useState<number | null>(null);
  const [direction, setDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [isSupported, setIsSupported] = useState(false);
  const [lastDirectionChange, setLastDirectionChange] = useState(0);

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
          const threshold = 40; // Reduced threshold for more sensitivity
          const now = Date.now();
          
          // Add debounce to prevent direction flickering
          if (now - lastDirectionChange > 250) {
            if (e.beta < -threshold && (lastBeta >= -threshold || lastBeta === null)) {
              setDirection('up');
              setLastDirectionChange(now);
            } else if (e.beta > threshold && (lastBeta <= threshold || lastBeta === null)) {
              setDirection('down');
              setLastDirectionChange(now);
            } else if (Math.abs(e.beta) < threshold/2) {
              setDirection('neutral');
              // Only update the timestamp when changing from non-neutral to neutral
              if (direction !== 'neutral') {
                setLastDirectionChange(now);
              }
            }
          }
        }
        
        setLastBeta(e.beta);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [lastBeta, direction, lastDirectionChange]);

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
  const [lastKeyChange, setLastKeyChange] = useState(0);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      if (now - lastKeyChange < 150) return; // Debounce key presses
      
      if (e.key === 'ArrowDown') {
        setKeyDirection('down');
        setLastKeyChange(now);
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setKeyDirection('up');
        setLastKeyChange(now);
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
  }, [lastKeyChange]);

  return keyDirection;
}
