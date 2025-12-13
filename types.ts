export type ScreenState = 'splash' | 'players' | 'length' | 'game';

export interface Player {
  id: string;
  name: string;
}

export type GameDuration = 5 | 10 | 15;

export type GameStatus = 'setup' | 'playing' | 'finished' | 'winner';

export type InstructionType = 'ADD' | 'NEW' | 'KNOCK' | 'REMOVE';

export interface Instruction {
  text: string;
  type: InstructionType;
  pieces: number;
  orientation?: string;
}

export interface GameState {
  currentScreen: ScreenState;
  players: Player[];
  duration: GameDuration;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'cream' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export interface GameContextType {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  duration: GameDuration;
  setDuration: (duration: GameDuration) => void;
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  activePlayer: Player | null;
  nextPlayer: () => void;
  turnHistory: string[]; // Array of Player IDs
  winningPlayer: Player | null;
  setWinningPlayer: (player: Player | null) => void;
  
  // Timer & Game Logic State
  gameTimeRemaining: number; // in seconds
  turnTimeRemaining: number; // in seconds
  setTurnTimeRemaining: (time: number) => void;
  stacksExist: boolean;
  setStacksExist: (exists: boolean) => void;
  isGamePaused: boolean;
  
  // Turn Logic
  isTurnActive: boolean;
  isTurnTimedOut: boolean;
  currentInstruction: Instruction | null;
  startTurn: () => void;
  endTurn: (reason?: any) => void;
  acknowledgeTimeout: () => void;
  
  // Timer Control Functions
  startGameTimer: () => void;
  pauseTimer: () => void;
}