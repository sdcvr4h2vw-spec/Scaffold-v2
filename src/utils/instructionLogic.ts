import { Instruction, InstructionType } from '../../types';

// The orientations allowed. Empty string represents "any orientation"
const ORIENTATIONS = [
  'horizontally',
  'vertically',
  '', 
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
 * Helper to construct the instruction object based on type
 */
const createInstruction = (type: InstructionType, history: Instruction[]): Instruction => {
  switch (type) {
    case 'NEW': {
      // Rule A: Create a new scaffold using [1-6] pieces.
      // CHANGE: Increased pieces to 1-6
      // CHANGE: "Stack" -> "scaffold"
      const pieces = getRandomInt(1, 6); 
      return {
        type: 'NEW',
        pieces,
        orientation: '',
        text: `Create a new scaffold using ${pieces} ${getPieceText(pieces)}`
      };
    }
    case 'ADD': {
      // Rule B: Place [1-3] pieces.
      // CHANGE: Text handles "no scaffolds" scenario
      // CHANGE: "Stack" -> "scaffold"
      const pieces = getRandomInt(1, 3);
      const orientation = getRandomOrientation();
      
      // Build the text based on orientation
      let orientationText = "on top of any existing scaffold";
      if (orientation) {
        orientationText = `${orientation} ${orientationText}`;
      }
      
      return {
        type: 'ADD',
        pieces,
        orientation,
        text: `Place ${pieces} ${getPieceText(pieces)} ${orientationText}. Start a new scaffold if there aren't any standing.`
      };
    }
    case 'KNOCK': {
      // DEPRECATED: This case is technically unreachable now based on weights,
      // but kept for type safety or future re-enabling.
      return {
        type: 'KNOCK',
        pieces: 0, 
        orientation: '',
        text: 'Knock down any scaffold.'
      };
    }
    case 'REMOVE': {
      // Rule C: Remove up to 3 pieces.
      // CHANGE: User chooses number (up to 3).
      // CHANGE: Handles "no scaffolds" scenario.
      const pieces = 3; // Max pieces for reference
      return {
        type: 'REMOVE',
        pieces,
        orientation: '',
        text: `Remove up to 3 pieces from any scaffold to give to other players. Keep any pieces that fall. If there are no scaffolds, take one piece.`
      };
    }
  }
};

/**
 * Helper to check if a candidate instruction type is currently valid.
 * CHANGE: Removed most constraints to make game more fluid.
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
             // CHANGE: Removed the "last 5 turns" constraint so it is more common.
            return true;

        case 'KNOCK':
            // Rule: Removed from game
            return false;

        case 'REMOVE':
            // CHANGE: Removed turn constraints to cater for "no scaffolds" logic.
            return true;

        default:
            return false;
    }
};

/**
 * Generates a single instruction based on game history and state.
 * @param instructionHistory - Array of past instructions
 * @param stacksExist - Boolean indicating if there are currently stacks on the table
 */
export const generateInstruction = (
  instructionHistory: Instruction[],
  stacksExist: boolean
): Instruction => {
  const turnCount = instructionHistory.length + 1;

  // --- Rule: Turn 1 ---
  // We still force NEW on the very first turn to get the game going.
  // CHANGE: We removed the `|| !stacksExist` check here. 
  // Now, even if no stacks exist later in the game, ADD or REMOVE can still appear
  // because their text now handles that scenario.
  if (turnCount === 1) {
    return createInstruction('NEW', instructionHistory);
  }

  // --- Weighted Selection ---
  // CHANGE: Weights updated to ADD (60), NEW (30), REMOVE (10)
  // KNOCK removed.
  const weights = [
      { type: 'ADD' as InstructionType, weight: 60 },
      { type: 'NEW' as InstructionType, weight: 30 },
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

  // Fallback
  return createInstruction('ADD', instructionHistory);
};