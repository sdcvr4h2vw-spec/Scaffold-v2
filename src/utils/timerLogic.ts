/**
 * Calculates the time allocated for a specific turn based on game state.
 * * Formula: timer = baseTime + (3 * pieces) - (1 * successfulTurns) - dynamicGamePressure
 * Base Time: 15 seconds
 * Absolute Min: 10 seconds OR (3 seconds * pieces), whichever is higher.
 * Max Time: 40 seconds
 * * @param pieces - Number of pieces to manipulate in this turn
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
  const GLOBAL_MIN_TIME = 10; // The game never goes faster than this usually
  const MAX_TIME = 40;
  const SECONDS_PER_PIECE_FLOOR = 3; // The minimum safety net per piece

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

  // Calculate raw time based on difficulty progression
  let calculatedTimer = BASE_TIME + (3 * pieces) - (1 * successfulTurns) - dynamicGamePressure;

  // Determine the "Safety Floor"
  // This ensures that even late in the game, a 6-piece move gives you at least 18s (6 * 3),
  // but a 1-piece move still gives you at least 10s.
  const effectiveMinTime = Math.max(GLOBAL_MIN_TIME, pieces * SECONDS_PER_PIECE_FLOOR);

  // Clamp result
  // We ensure it's at least effectiveMinTime, but no more than MAX_TIME.
  return Math.min(Math.max(calculatedTimer, effectiveMinTime), MAX_TIME);
};