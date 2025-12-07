/**
 * Calculate score for 3 white dice
 * @param {number[]} dice - Array of 3 dice values (1-6)
 * @returns {number} Score for the roll
 */
export function calculateWhiteDiceScore(dice) {
  if (dice.length !== 3) {
    return 0
  }

  // Sort dice for easier pattern matching
  const sorted = [...dice].sort((a, b) => a - b)

  // Check for sequential patterns
  if (sorted[0] === 1 && sorted[1] === 3 && sorted[2] === 5) {
    return 500 // Odd sequence
  }
  if (sorted[0] === 2 && sorted[1] === 4 && sorted[2] === 6) {
    return 500 // Even sequence
  }

  // Count occurrences of each number
  const counts = {}
  for (const die of dice) {
    counts[die] = (counts[die] || 0) + 1
  }

  // Check for triple
  for (const [value, count] of Object.entries(counts)) {
    if (count === 3) {
      return 300 * parseInt(value)
    }
  }

  // Check for double
  for (const [value, count] of Object.entries(counts)) {
    if (count === 2) {
      return 100 * parseInt(value)
    }
  }

  // No match
  return 0
}

/**
 * Calculate score for bonus die
 * @param {number} value - Bonus die value (1-6)
 * @returns {number} Score for the roll (0 if not 1 or 5)
 */
export function calculateBonusDieScore(value) {
  if (value === 1) return 1500
  if (value === 5) return 2000
  return 0
}

/**
 * Check if dice values are valid (all between 1-6)
 * @param {number[]} dice - Array of dice values
 * @returns {boolean}
 */
export function isValidDiceRoll(dice) {
  return dice.length === 3 && dice.every(d => d >= 1 && d <= 6)
}

/**
 * Check if it's a bonus die phase (every 3rd round)
 * @param {number} round - Current round number
 * @returns {boolean}
 */
export function isBonusDiePhase(round) {
  return round > 0 && round % 3 === 0
}

