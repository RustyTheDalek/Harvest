/**
 * Probability calculations for dice scoring patterns
 * Total outcomes for 3 dice: 6³ = 216
 */

const TOTAL_OUTCOMES = 216

/**
 * Calculate probability of getting a triple (any value)
 * There are 6 possible triples: (1,1,1), (2,2,2), ..., (6,6,6)
 */
export function getTripleProbability() {
  return 6 / TOTAL_OUTCOMES // 1/36 ≈ 2.78%
}

/**
 * Calculate probability of getting a triple of a specific value
 * Only 1 way to get triple X: (X,X,X)
 */
export function getTripleOfValueProbability(value) {
  return 1 / TOTAL_OUTCOMES // ≈ 0.46%
}

/**
 * Calculate probability of getting a double (any value)
 * For each value 1-6: 3 ways to arrange (X,X,Y) where Y≠X
 * 6 values × 5 other values × 3 positions = 90 outcomes
 */
export function getDoubleProbability() {
  return 90 / TOTAL_OUTCOMES // 5/12 ≈ 41.67%
}

/**
 * Calculate probability of getting a double of a specific value
 * For value X: 5 other values × 3 positions = 15 outcomes
 */
export function getDoubleOfValueProbability(value) {
  return 15 / TOTAL_OUTCOMES // ≈ 6.94%
}

/**
 * Calculate probability of getting a sequential pattern (1,3,5 or 2,4,6)
 * Each sequence has 3! = 6 permutations
 * 2 sequences × 6 permutations = 12 outcomes
 */
export function getSequentialProbability() {
  return 12 / TOTAL_OUTCOMES // 1/18 ≈ 5.56%
}

/**
 * Calculate probability of getting no match (no double, triple, or sequential)
 * Total - (triples + doubles + sequential)
 * 216 - (6 + 90 + 12) = 108
 */
export function getNoMatchProbability() {
  return 108 / TOTAL_OUTCOMES // 1/2 = 50%
}

/**
 * Get probability for a specific score from white dice
 * @param {number} score - The score achieved
 * @param {number[]} dice - The dice values (optional, for more specific calculation)
 * @returns {number} Probability as a decimal (0-1)
 */
export function getScoreProbability(score, dice = null) {
  if (score === 0) {
    return getNoMatchProbability()
  }
  
  if (score === 500) {
    return getSequentialProbability()
  }
  
  // Check if it's a triple score (300 × value)
  if (score % 300 === 0) {
    const value = score / 300
    if (value >= 1 && value <= 6) {
      return getTripleOfValueProbability(value)
    }
  }
  
  // Check if it's a double score (100 × value)
  if (score % 100 === 0) {
    const value = score / 100
    if (value >= 1 && value <= 6) {
      return getDoubleOfValueProbability(value)
    }
  }
  
  // If we have dice, calculate more precisely
  if (dice && dice.length === 3) {
    return getDicePatternProbability(dice)
  }
  
  return 0
}

/**
 * Calculate probability of a specific dice pattern
 * @param {number[]} dice - Array of 3 dice values
 * @returns {number} Probability as a decimal
 */
export function getDicePatternProbability(dice) {
  if (dice.length !== 3) return 0
  
  const sorted = [...dice].sort((a, b) => a - b)
  const counts = {}
  for (const die of dice) {
    counts[die] = (counts[die] || 0) + 1
  }
  
  // Check for triple
  for (const [value, count] of Object.entries(counts)) {
    if (count === 3) {
      return getTripleOfValueProbability(parseInt(value))
    }
  }
  
  // Check for sequential
  if ((sorted[0] === 1 && sorted[1] === 3 && sorted[2] === 5) ||
      (sorted[0] === 2 && sorted[1] === 4 && sorted[2] === 6)) {
    return getSequentialProbability()
  }
  
  // Check for double
  for (const [value, count] of Object.entries(counts)) {
    if (count === 2) {
      // For double X, we need to count how many ways to get double X
      // The third die can be any of the 5 other values, and there are 3 positions
      return getDoubleOfValueProbability(parseInt(value))
    }
  }
  
  // No match
  return getNoMatchProbability()
}

/**
 * Calculate cumulative probability over N turns
 * Probability of getting at least one success in N independent trials
 * P(at least one) = 1 - (1 - p)^N
 * @param {number} singleProbability - Probability of success in one turn
 * @param {number} turns - Number of turns
 * @returns {number} Cumulative probability
 */
export function getCumulativeProbability(singleProbability, turns) {
  if (turns <= 0) return 0
  if (singleProbability >= 1) return 1
  return 1 - Math.pow(1 - singleProbability, turns)
}

/**
 * Calculate probability of a pattern sequence
 * @param {string[]} patterns - Array of pattern names (e.g., ['double', 'triple'])
 * @returns {number} Probability of getting this sequence
 */
export function getPatternSequenceProbability(patterns) {
  if (!patterns || patterns.length === 0) return 0
  
  let probability = 1
  for (const pattern of patterns) {
    let patternProb = 0
    switch (pattern) {
      case 'triple':
        patternProb = getTripleProbability()
        break
      case 'double':
        patternProb = getDoubleProbability()
        break
      case 'sequential':
        patternProb = getSequentialProbability()
        break
      case 'none':
      case 'zero':
        patternProb = getNoMatchProbability()
        break
      default:
        patternProb = 0
    }
    probability *= patternProb
  }
  
  return probability
}

/**
 * Format probability as percentage
 * @param {number} probability - Probability as decimal (0-1)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export function formatProbability(probability, decimals = 2) {
  return `${(probability * 100).toFixed(decimals)}%`
}

/**
 * Format probability as "1 in X"
 * @param {number} probability - Probability as decimal (0-1)
 * @returns {string} Formatted as "1 in X"
 */
export function formatProbabilityAsOdds(probability) {
  if (probability <= 0) return 'Never'
  if (probability >= 1) return 'Always'
  const odds = 1 / probability
  if (odds < 2) {
    return `1 in ${odds.toFixed(2)}`
  }
  return `1 in ${Math.round(odds)}`
}

/**
 * Get probability for bonus die score
 * @param {number} value - Bonus die value (1-6)
 * @returns {number} Probability (1/6 for any value)
 */
export function getBonusDieProbability(value) {
  return 1 / 6 // ≈ 16.67%
}

/**
 * Get probability for bonus die score
 * @param {number} score - Bonus die score (1500 for 1, 2000 for 5, 0 otherwise)
 * @returns {number} Probability
 */
export function getBonusDieScoreProbability(score) {
  if (score === 1500) return 1 / 6 // Value 1
  if (score === 2000) return 1 / 6 // Value 5
  if (score === 0) return 4 / 6 // Values 2, 3, 4, 6
  return 0
}

/**
 * Get all pattern probabilities for display
 * @returns {Object} Object with probabilities for each pattern
 */
export function getAllPatternProbabilities() {
  return {
    triple: getTripleProbability(),
    double: getDoubleProbability(),
    sequential: getSequentialProbability(),
    none: getNoMatchProbability()
  }
}

/**
 * Get probability for specific face value patterns
 * @returns {Object} Object with probabilities for each face value
 */
export function getFaceValueProbabilities() {
  const result = {}
  for (let value = 1; value <= 6; value++) {
    result[`triple_${value}`] = getTripleOfValueProbability(value)
    result[`double_${value}`] = getDoubleOfValueProbability(value)
  }
  return result
}

