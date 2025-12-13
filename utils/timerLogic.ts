/**
 * Calculates the time allocated for a specific turn based on game state.
 * 
 * Formula: timer = baseTime + (3 * pieces) - (1 * successfulTurns) - dynamicGamePressure
 * Base Time: 15 seconds
 * Clamped: Between 10 and 40 seconds
 * 
 * @param pieces - Number of pieces to manipulate in this turn
 * @param successfulTurns - Number of turns successfully completed so far
 * @param timePercentage - Percentage of total game time remaining (0-100)
 * @returns number - Time in seconds for the turn
 */
export const calculateTurnTime = (
  pieces: number,
  successfulTurns: number,
  timePercentage: number
): number => {
  const BASE_TIME = 15;
  const MIN_TIME = 10;
  const MAX_TIME = 40;

  // Calculate Dynamic Pressure
  // 50% remaining: 0 seconds pressure (Assuming > 50%)
  // 50–20% remaining: 3 seconds pressure
  // <20% remaining: 5 seconds pressure
  let dynamicGamePressure = 0;
  if (timePercentage > 50) {
    dynamicGamePressure = 0;
  } else if (timePercentage >= 20) {
    dynamicGamePressure = 3;
  } else {
    dynamicGamePressure = 5;
  }

  // Calculate raw time
  let timer = BASE_TIME + (3 * pieces) - (1 * successfulTurns) - dynamicGamePressure;

  // Clamp result
  return Math.min(Math.max(timer, MIN_TIME), MAX_TIME);
};