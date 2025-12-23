import { Instruction, InstructionType } from '../types';

// --- 1. HELPERS FROM GAME A (Copied to keep Game B self-contained) ---

const ORIENTATIONS = ['horizontally', 'vertically', ''];

const getPieceText = (count: number): string => (count === 1 ? 'piece' : 'pieces');

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomOrientation = (): string => {
  return ORIENTATIONS[Math.floor(Math.random() * ORIENTATIONS.length)];
};

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// This is the Standard Game A Logic generator
const createStandardInstruction = (type: InstructionType): Instruction => {
  switch (type) {
    case 'NEW': {
      const pieces = getRandomInt(2, 6); 
      return {
        id: crypto.randomUUID(), // Generate ID here for standard ones
        type: 'NEW',
        pieces,
        text: `Create a new scaffold using ${pieces} ${getPieceText(pieces)}`
      };
    }
    case 'ADD': {
      const pieces = getRandomInt(1, 3);
      const orientation = getRandomOrientation();
      let orientationText = "on top of any existing scaffold";
      if (orientation) orientationText = `${orientation} ${orientationText}`;
      
      return {
        id: crypto.randomUUID(),
        type: 'ADD',
        pieces,
        text: `Place ${pieces} ${getPieceText(pieces)} ${orientationText}.`,
        secondaryText: `If there are no scaffolds, start a new one.`
      };
    }
    case 'REMOVE': {
      return {
        id: crypto.randomUUID(),
        type: 'REMOVE',
        pieces: 3,
        text: `Remove up to 3 pieces from any scaffold to give to other players.`,
        secondaryText: `Keep up to 2 pieces if any fall. If there are no scaffolds, take one piece.`
      };
    }
    default: // Fallback
      return { id: crypto.randomUUID(), type: 'ADD', pieces: 1, text: "Place 1 piece." };
  }
};

// --- 2. EXPERIMENTAL POOLS ---

const shapeChallenges = [
  { text: "Make a horse shape using 6 pieces", pieces: 6 },
  { text: "Make a goal using 3 pieces", pieces: 3 },
  { text: "Make a letter H using 5 pieces", pieces: 5 },
  { text: "Make a letter A using 6 pieces", pieces: 6 },
];

const destructiveChallenges = [
  { 
    text: "Demolish a tower!", 
    secondaryText: "No pieces from any other towers must fall", 
    type: 'KNOCK', 
    pieces: 0 
  },
  { 
    text: "Blow 1 piece off!", 
    secondaryText: "No other pieces must fall…", 
    type: 'NEW', 
    pieces: 0 
  }
];

// --- 3. THE MAIN GENERATOR ---

export const generateExperimentalInstruction = (
  history: Instruction[],
  stacksExist: boolean
): Instruction => {
  const turnCount = history.length;
  const id = crypto.randomUUID();

  // --- LOGIC: Turn 1 or No Stacks ---
  // Force creation to get the game moving.
  // 50% chance of Standard "New Scaffold", 50% chance of "Shape Challenge"
  if (!stacksExist || turnCount === 0) {
    if (Math.random() > 0.5) {
      return createStandardInstruction('NEW');
    } else {
      const pick = getRandom(shapeChallenges);
      return { id, type: 'NEW', ...pick };
    }
  }

  // --- LOGIC: Mid-Game Mixing ---
  
  const roll = Math.random();

  // 1. Destructive Chaos (15% Chance) - ONLY if stacks exist
  if (stacksExist && roll < 0.15) {
    const pick = getRandom(destructiveChallenges);
    return {
      id,
      text: pick.text,
      secondaryText: pick.secondaryText,
      type: pick.type as 'NEW' | 'KNOCK',
      pieces: pick.pieces,
    };
  }

  // 2. Shape Challenge (20% Chance)
  if (roll < 0.35) { // 0.15 to 0.35
    const pick = getRandom(shapeChallenges);
    return { id, type: 'NEW', ...pick };
  }

  // 3. Standard Game A Logic (65% Chance - The "Filler")
  // We use the same weighting logic as Game A (mostly ADD, rarely NEW)
  
  // Weights: ADD (85), NEW (15) - similar to standard game
  const standardRoll = Math.random() * 100;
  
  if (standardRoll < 85) {
    return createStandardInstruction('ADD');
  } else {
    return createStandardInstruction('NEW');
  }
};