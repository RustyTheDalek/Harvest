import { ref, computed } from 'vue'
import { calculateWhiteDiceScore, calculateBlackDieScore, isBlackDiePhase } from '../utils/scoring'

export function useGameState() {
  // Game configuration
  const gameMode = ref('dice') // 'dice' or 'tracker'
  const endgameTarget = ref(10000)
  const players = ref([])
  
  // Game state
  const currentRound = ref(0)
  const currentPlayerIndex = ref(0)
  const gameStarted = ref(false)
  const gameEnded = ref(false)
  const winner = ref(null)
  
  // Turn state
  const whiteDice = ref([null, null, null])
  const whiteDiceRolled = ref(false)
  const rerollUsed = ref(false)
  const whiteDiceScore = ref(0)
  const autoRerolled = ref(false)
  
  // Black die state
  const blackDieBanked = ref({}) // { playerIndex: true/false }
  const blackDiePhaseActive = ref(false)
  const blackDieRolled = ref(false)
  const blackDieValue = ref(null)
  const blackDieScore = ref(0)
  
  // Computed
  const currentPlayer = computed(() => players.value[currentPlayerIndex.value])
  const isBlackDieRound = computed(() => isBlackDiePhase(currentRound.value))
  const allPlayersHaveBanked = computed(() => {
    if (!blackDiePhaseActive.value) return false
    return players.value.every((_, index) => {
      return blackDieBanked.value[index] !== undefined
    })
  })
  
  // Initialize game
  function initializeGame(mode, target, playerNames) {
    gameMode.value = mode
    endgameTarget.value = target
    players.value = playerNames.map(name => ({
      name,
      score: 0,
      id: Math.random().toString(36).substr(2, 9)
    }))
    currentRound.value = 1
    currentPlayerIndex.value = 0
    gameStarted.value = true
    gameEnded.value = false
    winner.value = null
    resetTurnState()
  }
  
  // Reset turn state
  function resetTurnState() {
    whiteDice.value = [null, null, null]
    whiteDiceRolled.value = false
    rerollUsed.value = false
    whiteDiceScore.value = 0
    autoRerolled.value = false
    // Don't reset blackDiePhaseActive here - it's managed separately
    blackDieRolled.value = false
    blackDieValue.value = null
    blackDieScore.value = 0
  }
  
  // Roll white dice
  function rollWhiteDice() {
    whiteDice.value = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ]
    whiteDiceRolled.value = true
    whiteDiceScore.value = calculateWhiteDiceScore(whiteDice.value)
    
    // Auto-reroll if score is 0 and reroll hasn't been used
    if (whiteDiceScore.value === 0 && !rerollUsed.value) {
      autoRerolled.value = true
      rerollUsed.value = true
      // Reroll immediately
      whiteDice.value = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]
      whiteDiceScore.value = calculateWhiteDiceScore(whiteDice.value)
    }
  }
  
  // Set white dice (for manual entry)
  function setWhiteDice(dice) {
    whiteDice.value = [...dice]
    whiteDiceRolled.value = true
    whiteDiceScore.value = calculateWhiteDiceScore(whiteDice.value)
    
    // Note: Auto-reroll for manual entry is handled by the UI component
    // (user can see score is 0 and choose to reroll)
  }
  
  // Reroll white dice
  function rerollWhiteDice() {
    if (rerollUsed.value) return
    // Reset autoRerolled flag for manual rerolls
    autoRerolled.value = false
    // Roll new dice
    whiteDice.value = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ]
    whiteDiceScore.value = calculateWhiteDiceScore(whiteDice.value)
    rerollUsed.value = true
  }
  
  // Mark reroll as used (for manual mode)
  function markRerollUsed() {
    rerollUsed.value = true
  }
  
  // Set score to 0 manually (override calculated score)
  function setWhiteDiceScoreToZero() {
    whiteDiceScore.value = 0
  }
  
  // Complete white dice turn
  function completeWhiteDiceTurn() {
    if (!whiteDiceRolled.value) return
    
    // Add score to current player
    currentPlayer.value.score += whiteDiceScore.value
    
    // Check for winner
    if (currentPlayer.value.score >= endgameTarget.value) {
      gameEnded.value = true
      winner.value = currentPlayer.value
      return
    }
    
    // Move to next player or next round
    moveToNextPlayer()
  }
  
  // Move to next player
  function moveToNextPlayer() {
    currentPlayerIndex.value++
    
    // If all players have gone, start new round
    if (currentPlayerIndex.value >= players.value.length) {
      // Check if black die phase BEFORE incrementing (check if we just completed round 3, 6, 9, etc.)
      const justCompletedRound = currentRound.value
      if (justCompletedRound > 0 && justCompletedRound % 3 === 0) {
        blackDiePhaseActive.value = true
        // Initialize black die state for all players (if not already set)
        players.value.forEach((_, index) => {
          if (blackDieBanked.value[index] === undefined) {
            blackDieBanked.value[index] = 0
          }
        })
      }
      
      currentRound.value++
      currentPlayerIndex.value = 0
    }
    
    resetTurnState()
  }
  
  // Bank black die (before rolling)
  function bankBlackDie() {
    // Banking accumulates - each bank adds +1 reroll
    const currentBanked = blackDieBanked.value[currentPlayerIndex.value] || 0
    blackDieBanked.value[currentPlayerIndex.value] = currentBanked + 1
    blackDieRolled.value = true
    blackDieScore.value = 0
    moveToNextBlackDiePlayer()
  }
  
  // Roll black die (initial roll)
  function rollBlackDie() {
    // Always roll once initially
    blackDieValue.value = Math.floor(Math.random() * 6) + 1
    blackDieScore.value = calculateBlackDieScore(blackDieValue.value)
    blackDieRolled.value = true
    // Don't move to next player yet - wait for confirmation or reroll
  }
  
  // Reroll black die (uses 1 banked reroll)
  function rerollBlackDie() {
    if (!blackDieRolled.value) return
    const rerollCount = getBankedCount()
    
    if (rerollCount > 0) {
      // Roll again and take the better result
      const newRoll = Math.floor(Math.random() * 6) + 1
      const newScore = calculateBlackDieScore(newRoll)
      
      // Take the better score
      if (newScore > blackDieScore.value) {
        blackDieValue.value = newRoll
        blackDieScore.value = newScore
      }
      // If new score is worse or equal, keep the current one
      
      // Subtract 1 from banked rerolls
      blackDieBanked.value[currentPlayerIndex.value] = rerollCount - 1
    }
  }
  
  // Confirm black die roll and add score (keep current result)
  function confirmBlackDieRoll() {
    if (!blackDieRolled.value) return
    
    // Add score to current player
    currentPlayer.value.score += blackDieScore.value
    
    // Check for winner
    if (currentPlayer.value.score >= endgameTarget.value) {
      gameEnded.value = true
      winner.value = currentPlayer.value
      return
    }
    
    // Don't clear banked rerolls - they persist until used
    // (They're only subtracted when you actually reroll)
    
    moveToNextBlackDiePlayer()
  }
  
  
  // Set black die (manual entry mode - single roll)
  function setBlackDie(value) {
    blackDieValue.value = value
    blackDieScore.value = calculateBlackDieScore(value)
    blackDieRolled.value = true
    // Don't move to next player yet - wait for confirmation or reroll
  }
  
  // Reroll black die manually (uses 1 banked reroll)
  function rerollBlackDieManual(newRoll) {
    if (!blackDieRolled.value) return
    const rerollCount = getBankedCount()
    
    if (rerollCount > 0) {
      const newScore = calculateBlackDieScore(newRoll)
      
      // Take the better score
      if (newScore > blackDieScore.value) {
        blackDieValue.value = newRoll
        blackDieScore.value = newScore
      }
      // If new score is worse or equal, keep the current one
      
      // Subtract 1 from banked rerolls
      blackDieBanked.value[currentPlayerIndex.value] = rerollCount - 1
    }
  }
  
  // Confirm black die (for manual entry)
  function confirmBlackDieManual() {
    confirmBlackDieRoll()
  }
  
  // Move to next player in black die phase
  function moveToNextBlackDiePlayer() {
    currentPlayerIndex.value++
    
    // If all players have gone, end black die phase and start new round
    if (currentPlayerIndex.value >= players.value.length) {
      // Banked counts persist until used
      
      blackDiePhaseActive.value = false
      currentRound.value++
      currentPlayerIndex.value = 0
    }
    
    resetTurnState()
  }
  
  // Get banked reroll count for current player
  function getBankedCount() {
    return blackDieBanked.value[currentPlayerIndex.value] || 0
  }
  
  // Check if current player has banked black die
  function hasBankedBlackDie() {
    return getBankedCount() > 0
  }
  
  // Reset game
  function resetGame() {
    gameStarted.value = false
    gameEnded.value = false
    winner.value = null
    gameMode.value = null
    endgameTarget.value = 10000
    players.value = []
    currentRound.value = 1
    currentPlayerIndex.value = 0
    blackDiePhaseActive.value = false
    blackDieBanked.value = {}
    resetTurnState()
  }
  
  return {
    // State
    gameMode,
    endgameTarget,
    players,
    currentRound,
    currentPlayerIndex,
    gameStarted,
    gameEnded,
    winner,
    whiteDice,
    whiteDiceRolled,
    rerollUsed,
    whiteDiceScore,
    autoRerolled,
    blackDieBanked,
    blackDiePhaseActive,
    blackDieRolled,
    blackDieValue,
    blackDieScore,
    
    // Computed
    currentPlayer,
    isBlackDieRound,
    allPlayersHaveBanked,
    
    // Methods
    initializeGame,
    rollWhiteDice,
    setWhiteDice,
    rerollWhiteDice,
    markRerollUsed,
    setWhiteDiceScoreToZero,
    completeWhiteDiceTurn,
    bankBlackDie,
    rollBlackDie,
    rerollBlackDie,
    confirmBlackDieRoll,
    setBlackDie,
    rerollBlackDieManual,
    confirmBlackDieManual,
    getBankedCount,
    hasBankedBlackDie,
    resetGame,
    gameStarted
  }
}

