import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { Player, GameDuration, GameStatus, GameContextType, Instruction } from '../types';
import { DEFAULT_PLAYERS } from '../constants';
import { generateInstruction } from '../utils/instructionLogic';
import { calculateTurnTime } from '../utils/timerLogic';

const GameContext = createContext<GameContextType | undefined>(undefined);

// AUDIO ASSETS
// Ensure you have a 'countdown.mp3' file that is exactly 10 seconds long.
const AUDIO_ASSETS = {
  START_TURN: '/sounds/whistle.wav', 
  TIMEOUT_FAIL: '/sounds/fail.mp3', 
  CELEBRATION: '/sounds/Success.mp3', 
  GAME_OVER: '/sounds/klaxon.mp3?raw=true', 
  COUNTDOWN: '/sounds/10-second-countdown.mp3' // NEW: Single 10s audio file
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
  // --- Global Settings State ---
  const [settings, setSettings] = useState({
    voiceEnabled: true,
    soundEnabled: true, // Master switch
    easyMode: false,    // +10 seconds
  });

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

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

  // Refs
  const turnTimeRef = useRef(turnTimeRemaining);
  const gameTimeRef = useRef(gameTimeRemaining);
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});
  
  // NEW: Specific ref to control the countdown audio (so we can stop it early)
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { turnTimeRef.current = turnTimeRemaining; }, [turnTimeRemaining]);
  useEffect(() => { gameTimeRef.current = gameTimeRemaining; }, [gameTimeRemaining]);

  // Sync gameTimeRemaining when duration changes during setup
  useEffect(() => {
    if (gameStatus === 'setup') {
      setGameTimeRemaining(duration * 60);
    }
  }, [duration, gameStatus]);

  // --- Audio Preloading & Helper ---
  useEffect(() => {
    Object.entries(AUDIO_ASSETS).forEach(([key, src]) => {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.load();
      audioCache.current[src] = audio;

      // Capture the countdown audio specifically
      if (key === 'COUNTDOWN') {
        countdownAudioRef.current = audio;
      }
    });
  }, []);

  const playSound = useCallback((src: string) => {
    // Master Sound Switch Check
    if (!settings.soundEnabled) return;

    const audio = audioCache.current[src];
    if (audio) {
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.play().catch(err => console.warn("Audio clone playback warning:", err));
    } else {
      new Audio(src).play().catch(err => console.warn("Fallback playback warning:", err));
    }
  }, [settings.soundEnabled]);

  // NEW: Helper to stop the countdown immediately
  const stopCountdownAudio = useCallback(() => {
    if (countdownAudioRef.current) {
      countdownAudioRef.current.pause();
      countdownAudioRef.current.currentTime = 0; // Rewind to start
    }
  }, []);

  // --- Fairness & Player Selection ---
  const calculateNextPlayer = useCallback((currentPlayers: Player[], currentHistory: string[]) => {
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
        if (last === p.id && secondLast === p.id) return false;
      }
      const projectedCount = turnCounts[p.id] + 1;
      return (projectedCount - minTurns <= 2);
    });

    if (candidates.length === 0) candidates = currentPlayers;
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }, []);

  const selectNextPlayerId = useCallback((historyOverride?: string[]) => {
    const historyToUse = historyOverride || turnHistory;
    const next = calculateNextPlayer(players, historyToUse);
    if (next) {
      setActivePlayer(next);
      return next.id;
    }
    return null;
  }, [players, turnHistory, calculateNextPlayer]);

  const nextPlayer = useCallback(() => { selectNextPlayerId(); }, [selectNextPlayerId]);

  // --- Timer Controls ---
  const startGameTimer = useCallback(() => setIsGamePaused(false), []);
  
  const pauseTimer = useCallback(() => {
    stopCountdownAudio(); // Stop sound when paused
    setIsGamePaused(true);
  }, [stopCountdownAudio]);

  // --- Initialization Effect ---
  useEffect(() => {
    if (gameStatus === 'playing' && !isGameInitialized) {
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

  // --- Turn Logic ---
  const endTurnRef = useRef<((reason?: any) => void) | null>(null);

  const endTurn = useCallback((reason?: any) => {
    stopCountdownAudio(); // Stop sound when turn ends
    
    const isManual = reason && reason.type === 'click';
    if (isManual) playSound(AUDIO_ASSETS.CELEBRATION);

    pauseTimer();

    let newHistory = [...turnHistory];
    if (activePlayer) {
      newHistory.push(activePlayer.id);
      setTurnHistory(newHistory);
    }
    
    if (currentInstruction) {
      setInstructionHistory(prev => [...prev, currentInstruction]);
      if (currentInstruction.type === 'KNOCK') setStacksExist(false);
      else if (currentInstruction.type === 'NEW') setStacksExist(true);
    }

    setCurrentInstruction(null);
    setTurnTimeRemaining(0);
    setIsTurnActive(false);
    setIsTurnTimedOut(false);
    selectNextPlayerId(newHistory);
  }, [activePlayer, turnHistory, currentInstruction, pauseTimer, selectNextPlayerId, playSound, stopCountdownAudio]);

  useEffect(() => { endTurnRef.current = endTurn; }, [endTurn]);

  const startTurn = useCallback(() => {
    if (!activePlayer) return;

    playSound(AUDIO_ASSETS.START_TURN);
    startGameTimer();

    const instr = generateInstruction(instructionHistory, stacksExist);
    setCurrentInstruction(instr);

    const timePercentage = (gameTimeRemaining / (duration * 60)) * 100;
    let time = calculateTurnTime(instr.pieces, instructionHistory.length, timePercentage);
    
    // --- EASY MODE LOGIC ---
    if (settings.easyMode) {
      time += 10; 
    }

    setTurnTimeRemaining(Math.round(time));
    setIsTurnActive(true);
    setIsTurnTimedOut(false);
  }, [startGameTimer, instructionHistory, stacksExist, gameTimeRemaining, duration, activePlayer, playSound, settings.easyMode]);

  const acknowledgeTimeout = useCallback(() => {
    stopCountdownAudio(); // Stop sound on timeout
    setIsTurnTimedOut(false);
    endTurnRef.current?.();
  }, [stopCountdownAudio]);

  // --- Timer Interval ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (gameStatus === 'playing') {
      interval = setInterval(() => {
        if (!isGamePaused) {
          const currentGameTime = gameTimeRef.current;
          if (currentGameTime <= 1) {
            setGameTimeRemaining(0);
            setGameStatus('finished');
            setIsGamePaused(true);
            playSound(AUDIO_ASSETS.GAME_OVER);
            return;
          } else {
            setGameTimeRemaining(currentGameTime - 1);
          }
        }

        if (isTurnActive) {
          const currentTime = turnTimeRef.current;
          const nextTime = currentTime - 1;
          
          if (nextTime <= 0) {
            stopCountdownAudio(); // Safety stop
            playSound(AUDIO_ASSETS.TIMEOUT_FAIL);
            setIsTurnActive(false); 
            pauseTimer();
            setIsTurnTimedOut(true);
            return;
          } else {
            setTurnTimeRemaining(nextTime);
            
            // NEW LOGIC: Play ONCE exactly at 10 seconds
            if (nextTime === 10 && settings.soundEnabled) {
               countdownAudioRef.current?.play().catch(e => console.warn(e));
            }
          }
        }
      }, 1000);
    }

    return () => { if (interval) clearInterval(interval); };
  }, [gameStatus, isGamePaused, isTurnActive, playSound, pauseTimer, settings.soundEnabled, stopCountdownAudio]);

  return (
    <GameContext.Provider
      value={{
        players, setPlayers,
        duration, setDuration,
        gameStatus, setGameStatus,
        activePlayer, nextPlayer,
        turnHistory, winningPlayer, setWinningPlayer,
        gameTimeRemaining, turnTimeRemaining, setTurnTimeRemaining,
        stacksExist, setStacksExist,
        isGamePaused, isTurnActive, isTurnTimedOut,
        currentInstruction,
        startTurn, endTurn, acknowledgeTimeout,
        startGameTimer, pauseTimer,
        settings, updateSettings // New settings exported here
      }}
    >
      {children}
    </GameContext.Provider>
  );
};