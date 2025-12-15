import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { Player, GameDuration, GameStatus, GameContextType, Instruction } from '../types';
import { DEFAULT_PLAYERS } from '../constants';
import { generateInstruction } from '../utils/instructionLogic';
import { calculateTurnTime } from '../utils/timerLogic';

const GameContext = createContext<GameContextType | undefined>(undefined);

// FIX: Audio asset names updated to reflect their intended use in the game,
// using your URLs for mapping.
const AUDIO_ASSETS = {
  START_TURN: 'https://github.com/sdcvr4h2vw-spec/Game-images/raw/refs/heads/main/whistle.wav', // Whistle for GO!
  TIMEOUT_FAIL: 'https://github.com/sdcvr4h2vw-spec/Game-images/raw/refs/heads/main/fail.mp3', // Gong/Fail for Turn Timeout
  CELEBRATION: 'https://github.com/sdcvr4h2vw-spec/Game-images/raw/refs/heads/main/Success.mp3', // Success sound for Manual End Turn
  GAME_OVER: 'https://github.com/sdcvr4h2vw-spec/Game-images/blob/main/klaxon.mp3?raw=true', // Klaxon sound for Game Over
  TICK: 'https://github.com/sdcvr4h2vw-spec/Game-images/blob/main/tick.m4a?raw=true' // Tick for 10 second countdown
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [duration, setDuration] = useState<GameDuration>(10);
  const [gameStatus, setGameStatus] = useState<GameStatus>('setup');
  const [turnHistory, setTurnHistory] = useState<string[]>([]);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [winningPlayer, setWinningPlayer] = useState<Player | null>(null);

  // --- Timer & Logic State ---
  const [gameTimeRemaining, setGameTimeRemaining] = useState<number>(duration * 60);
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number>(0);
  const [stacksExist, setStacksExist] = useState<boolean>(false);
  const [isGamePaused, setIsGamePaused] = useState<boolean>(true);
  // --- Turn Logic State ---
  const [isTurnActive, setIsTurnActive] = useState<boolean>(false);
  const [isTurnTimedOut, setIsTurnTimedOut] = useState<boolean>(false);
  const [currentInstruction, setCurrentInstruction] = useState<Instruction | null>(null);
  const [instructionHistory, setInstructionHistory] = useState<Instruction[]>([]);
  const [isGameInitialized, setIsGameInitialized] = useState<boolean>(false);

  // Ref to track timers inside the interval
  const turnTimeRef = useRef(turnTimeRemaining);
  const gameTimeRef = useRef(gameTimeRemaining);
  useEffect(() => {
    turnTimeRef.current = turnTimeRemaining;
  }, [turnTimeRemaining]);
  useEffect(() => {
    gameTimeRef.current = gameTimeRemaining;
  }, [gameTimeRemaining]);

  // Sync gameTimeRemaining when duration changes during setup
  useEffect(() => {
    if (gameStatus === 'setup') {
      setGameTimeRemaining(duration * 60);
    }
  }, [duration, gameStatus]);

  // --- Audio Preloading & Helper ---
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Preload all audio assets on mount
    Object.values(AUDIO_ASSETS).forEach((src) => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      // Loading it ensures the browser fetches headers/buffer
      audio.load();
      audioCache.current[src] = audio;
    });
  }, []);

  const playSound = useCallback((src: string) => {
    const audio = audioCache.current[src];
    if (audio) {
      // Use cloneNode to allow overlapping sounds (important for ticks)
      // casting to HTMLAudioElement because cloneNode returns Node
      const clone = audio.cloneNode() as HTMLAudioElement;
      
      // Ensure the clone is ready to play (though preloading helps)
      clone.play().catch(err => {
        console.warn("Audio clone playback warning:", err);
      });
    } else {
      // Fallback if not cached for some reason
      new Audio(src).play().catch(err => console.warn("Fallback playback warning:", err));
    }
  }, []);

  // --- Fairness Algorithm ---
  const calculateNextPlayer = useCallback((currentPlayers: Player[], currentHistory: string[]) => {
    // [Fairness Algorithm logic remains unchanged]
    const turnCounts: Record<string, number> = {};
    currentPlayers.forEach(p => turnCounts[p.id] = 0);
    currentHistory.forEach(id => {
      if (turnCounts[id] !== undefined) turnCounts[id]++;
    });

    const minTurns = Math.min(...Object.values(turnCounts));

    let candidates = currentPlayers.filter(p => {
      if (currentHistory.length >= 2) {
        const last = currentHistory[currentHistory.length - 1];
        const secondLast = currentHistory[currentHistory.length - 2];
        if (last === p.id && secondLast === p.id) {
          return false;
        }
      }

      const projectedCount = turnCounts[p.id] + 1;
      if (projectedCount - minTurns > 2) {
        return false;
      }

      return true;
    });

    if (candidates.length === 0) {
      candidates = currentPlayers;
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }, []);

  // --- Player Selection ---
  const selectNextPlayerId = useCallback((historyOverride?: string[]) => {
    const historyToUse = historyOverride || turnHistory;
    const next = calculateNextPlayer(players, historyToUse);
    if (next) {
      setActivePlayer(next);
      return next.id;
    }
    return null;
  }, [players, turnHistory, calculateNextPlayer]);

  const nextPlayer = useCallback(() => {
    selectNextPlayerId();
  }, [selectNextPlayerId]);

  // --- Timer Controls ---
  const startGameTimer = useCallback(() => {
    setIsGamePaused(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsGamePaused(true);
  }, []);
  // --- Initialization Effect ---
  useEffect(() => {
    if (gameStatus === 'playing' && !isGameInitialized) {
      // FIX: Explicitly set game time when initializing to ensure selected duration is used
      setGameTimeRemaining(duration * 60);
      
      setIsGamePaused(true);
      setIsTurnActive(false);
      setIsTurnTimedOut(false);
      setStacksExist(false);
      setInstructionHistory([]);
      setTurnHistory([]);
      selectNextPlayerId([]);
      setIsGameInitialized(true);
    } else if (gameStatus === 'setup') {
      setIsGamePaused(true);
      setIsGameInitialized(false);
    }
  }, [gameStatus, selectNextPlayerId, isGameInitialized, duration]);

  // --- GO / END TURN Logic (endTurn needs to be defined before startTurn) ---

  const endTurnRef = useRef<((reason?: any) => void) | null>(null);

  const endTurn = useCallback((reason?: any) => {
    const isManual = reason && reason.type === 'click';
    // FIX: Audio Trigger - Only CELEBRATION for manual press.
    if (isManual) {
      playSound(AUDIO_ASSETS.CELEBRATION);
    }

    // 1. Pause Main Clock
    pauseTimer();

    // 2. Update History
    let newHistory = [...turnHistory];
    if (activePlayer) {
      newHistory.push(activePlayer.id);
      setTurnHistory(newHistory);
    }
    // 3. Update Instruction/Stack History
    if (currentInstruction) {
      setInstructionHistory(prev => [...prev, currentInstruction]);
      if (currentInstruction.type === 'KNOCK') {
        setStacksExist(false);
      } else if (currentInstruction.type === 'NEW') {
        setStacksExist(true);
      }
    }

    // 4. Reset Turn State
    setCurrentInstruction(null);
    setTurnTimeRemaining(0);
    setIsTurnActive(false);
    setIsTurnTimedOut(false);

    // 5. Select Next Player IMMEDIATELY
    selectNextPlayerId(newHistory);

  }, [activePlayer, turnHistory, currentInstruction, pauseTimer, selectNextPlayerId, playSound]);

  useEffect(() => {
    endTurnRef.current = endTurn;
  }, [endTurn]);

  const startTurn = useCallback(() => {
    if (!activePlayer) return;

    // FIX: Play Start Sound (HORN for GO!)
    playSound(AUDIO_ASSETS.START_TURN);

    // 1. Start Main Clock
    startGameTimer();

    // 2. Generate Instruction
    const instr = generateInstruction(instructionHistory, stacksExist);
    setCurrentInstruction(instr);

    // 3. Calculate Time
    const timePercentage = (gameTimeRemaining / (duration * 60)) * 100;
    const time = calculateTurnTime(instr.pieces, instructionHistory.length, timePercentage);
    setTurnTimeRemaining(Math.round(time));

    // 4. Activate Turn
    setIsTurnActive(true);
    setIsTurnTimedOut(false);
  }, [startGameTimer, instructionHistory, stacksExist, gameTimeRemaining, duration, activePlayer, playSound]);

  const acknowledgeTimeout = useCallback(() => {
    setIsTurnTimedOut(false);
    // Proceed to end turn logic (selecting next player, etc.)
    endTurnRef.current?.();
  }, []);

  // --- Timer Interval Logic (FINAL FIX) ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (gameStatus === 'playing') {
      interval = setInterval(() => {
        // 1. Tick Game Timer (only if not paused)
        if (!isGamePaused) {
          const currentGameTime = gameTimeRef.current;
          if (currentGameTime <= 1) {
            // Game Over Condition
            setGameTimeRemaining(0);
            setGameStatus('finished');
            setIsGamePaused(true);
            // KLAXON now plays ONLY when game timer reaches 0 (Game Over)
            playSound(AUDIO_ASSETS.GAME_OVER);
            return;
          } else {
            setGameTimeRemaining(currentGameTime - 1);
          }
        }

        // 2. Tick Turn Timer (only if turn is active)
        if (isTurnActive) {
          const currentTime = turnTimeRef.current;
          const nextTime = currentTime - 1;
          
          // Check for timeout
          if (nextTime <= 0) {
            // 1. FAIL SOUND (GONG) plays instantly at t=0
            playSound(AUDIO_ASSETS.TIMEOUT_FAIL);
            
            // 2. Stop Timers but DO NOT select next player yet
            setIsTurnActive(false); 
            pauseTimer();

            // 3. Trigger Timeout UI
            setIsTurnTimedOut(true);
            
            return;
          } else {
            // Decrement Timer
            setTurnTimeRemaining(nextTime);
            // Audio Ticking Logic (FIXED LOGIC)
            // Tick every 1 second from 10 to 1
            if (nextTime <= 10 && nextTime > 0) {
              playSound(AUDIO_ASSETS.TICK);
            }
          }
        }

      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStatus, isGamePaused, isTurnActive, playSound, pauseTimer]);

  return (
    <GameContext.Provider
      value={{
        players,
        setPlayers,
        duration,
        setDuration,
        gameStatus,
        setGameStatus,
        activePlayer,
        nextPlayer,
        turnHistory,
        winningPlayer,
        setWinningPlayer,
        gameTimeRemaining,
        turnTimeRemaining,
        setTurnTimeRemaining,
        stacksExist,
        setStacksExist,
        isGamePaused,
        isTurnActive,
        isTurnTimedOut,
        currentInstruction,
        startTurn,
        endTurn,
        acknowledgeTimeout,

        startGameTimer,
        pauseTimer,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};