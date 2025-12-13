import { Instruction, InstructionType } from '../types';

// The orientations allowed by the rule (A), using the correct adverbial form
const ORIENTATIONS = [
  'horizontally',
  'vertically',
  'any orientation', 
];

// Helper to pluralize piece text
const getPieceText = (count: number): string => {
  return count === 1 ? 'piece' : 'pieces';
};

// Helper to get a random integer between min and max (inclusive)
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper to get a random orientation
const getRandomOrientation = (): string => {
  return ORIENTATIONS[Math.floor(Math.random() * ORIENTATIONS.length)];
};

/**
 * Helper to count occurrences of a specific instruction type in a history window.
 */
const countInstructionTypeInWindow = (
    history: Instruction[],
    windowSize: number,
    targetType: InstructionType
): number => {
    if (history.length === 0) return 0;
    const window = history.slice(-windowSize); 
    return window.filter(i => i.type === targetType).length;
};

/**
 * Helper to get the correct orientation text for Rule A.
 */
const getOrientationText = (orientation: string, pieces: number): string => {
    if (orientation === 'any orientation') {
        // FIX: Replaces 'any orientation' with 'either horizontally or vertically' for clarity
        return `either horizontally or vertically on top of any existing Stack`;
    }
    // Correct grammar: Place X pieces [adverb] on top of...
    return `${orientation} on top of any existing Stack`; 
};

/**
 * Internal helper to construct the instruction object based on type
 * Implements the specific text and piece counts for rules A, B, C, D.
 */
const createInstruction = (type: InstructionType, history: Instruction[]): Instruction => {
  switch (type) {
    case 'NEW': {
      // Rule B: Create a new Stack using [1–3] pieces.
      const pieces = getRandomInt(1, 3); 
      return {
        type: 'NEW',
        pieces,
        orientation: '',
        text: `Create a new Stack using ${pieces} ${getPieceText(pieces)}`
      };
    }
    case 'ADD': {
      // Rule A: Place [1–3] pieces [vertical/horizontal/any orientation] on top of any existing Stack.
      const pieces = getRandomInt(1, 3);
      const orientation = getRandomOrientation();
      return {
        type: 'ADD',
        pieces,
        orientation,
        text: `Place ${pieces} ${getPieceText(pieces)} ${getOrientationText(orientation, pieces)}`
      };
    }
    case 'KNOCK': {
      // Rule C: Knock down any Stack that is 3 pieces high or more. If any pieces fall, keep a maximum of 2.
      return {
        type: 'KNOCK',
        pieces: 0, 
        orientation: '',
        text: 'Knock down any Stack that is 3 pieces high or more. If any pieces from other towers fall, keep a maximum of 2'
      };
    }
    case 'REMOVE': {
      // Rule D: Remove [2 or 3] pieces from any Stack and give them to any other player. Keep any pieces that fall.
      // FIX: Piece count changed to 2 or 3, and brackets removed from (s).
      const pieces = getRandomInt(2, 3); 
      return {
        type: 'REMOVE',
        pieces,
        orientation: '',
        text: `Remove ${pieces} ${getPieceText(pieces)} from any Stack and give them to any other players. Keep any pieces that fall.`
      };
    }
  }
};

/**
 * Helper to check if a candidate instruction type is currently valid based on game state and history.
 */
const isInstructionValid = (
    type: InstructionType, 
    turnCount: number, 
    history: Instruction[]
): boolean => {
    switch (type) {
        case 'ADD':
            return true; 
        
        case 'NEW':
            // Constraint: Max 1 in last 5 turns.
            const newInLast4 = countInstructionTypeInWindow(history, 4, 'NEW');
            return newInLast4 === 0;

        case 'KNOCK':
            // Constraint: Only after Turn 4
            if (turnCount <= 4) return false;
            // Constraint: Max 1 in last 6 turns
            const knockInLast5 = countInstructionTypeInWindow(history, 5, 'KNOCK');
            return knockInLast5 === 0;

        case 'REMOVE':
            // Constraint: Only after Turn 6
            if (turnCount <= 6) return false;
            // Constraint: Max 1 in last 6 turns
            const removeInLast5 = countInstructionTypeInWindow(history, 5, 'REMOVE');
            return removeInLast5 === 0;

        default:
            return false;
    }
};

/**
 * Generates a single instruction based on game history and state.
 * * @param instructionHistory - Array of past instructions to check frequency constraints
 * @param stacksExist - Boolean indicating if there are currently stacks on the table
 * @returns Instruction object
 */
export const generateInstruction = (
  instructionHistory: Instruction[],
  stacksExist: boolean
): Instruction => {
  const turnCount = instructionHistory.length + 1;

  // --- Rule: Turn 1 or No Stacks ---
  if (turnCount === 1 || !stacksExist) {
    return createInstruction('NEW', instructionHistory);
  }

  // --- Weighted Selection with Constraints ---
  
  // Weights: ADD (50), NEW (30), KNOCK (10), REMOVE (10)
  const weights = [
      { type: 'ADD' as InstructionType, weight: 50 },
      { type: 'NEW' as InstructionType, weight: 30 },
      { type: 'KNOCK' as InstructionType, weight: 10 },
      { type: 'REMOVE' as InstructionType, weight: 10 },
  ];
  
  let attempts = 0;
  
  while (attempts < 20) {
    attempts++;
    const rand = Math.random() * 100;
    let cumulative = 0;
    
    let candidateType: InstructionType = 'ADD';

    // Select candidate based on weights
    for (const option of weights) {
        cumulative += option.weight;
        if (rand < cumulative) {
            candidateType = option.type;
            break;
        }
    }

    // --- Check Constraints ---
    if (isInstructionValid(candidateType, turnCount, instructionHistory)) {
        return createInstruction(candidateType, instructionHistory);
    }
  }

  // Fallback: If 20 attempts failed, default to ADD.
  return createInstruction('ADD', instructionHistory);
};