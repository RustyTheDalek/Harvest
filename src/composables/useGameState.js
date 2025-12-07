import { ref, computed, watch } from 'vue'
import { calculateWhiteDiceScore, calculateBonusDieScore, isBonusDiePhase } from '../utils/scoring'
import { sessionStorage, localStorage } from '../utils/storage'
import { useGameHistory } from './useGameHistory'
import { triggerBonusDieConfetti, triggerTripleConfetti, triggerTripleSixConfetti, isTripleSix, isTriple } from '../utils/confetti'

export function useGameState() {
  // History tracking
  const {
    canUndo,
    canRedo,
    createSnapshot,
    addToHistory,
    undo: historyUndo,
    redo: historyRedo,
    jumpToIndex,
    clearHistory,
    getHistoryEntries,
    currentIndex,
    history
  } = useGameHistory()
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
  
  // Bonus die state
  const blackDieBanked = ref({}) // { playerIndex: true/false }
  const blackDiePhaseActive = ref(false)
  const blackDieRolled = ref(false)
  const blackDieValue = ref(null)
  const blackDieScore = ref(0)
  
  // Computed
  const currentPlayer = computed(() => players.value[currentPlayerIndex.value])
  const isBlackDieRound = computed(() => isBonusDiePhase(currentRound.value))
  const allPlayersHaveBanked = computed(() => {
    if (!blackDiePhaseActive.value) return false
    return players.value.every((_, index) => {
      return blackDieBanked.value[index] !== undefined
    })
  })
  
  // Initialize game
  function initializeGame(mode, target, playerNames) {
    clearHistory()
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
    trackHistory('Game started')
    saveGameState()
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
    if (!whiteDiceRolled.value) {
      console.log('[GAME STATE] completeWhiteDiceTurn: whiteDiceRolled is false, returning')
      return
    }
    
    const playerName = currentPlayer.value.name
    const scoreAdded = whiteDiceScore.value
    const oldScore = currentPlayer.value.score
    const newScore = oldScore + scoreAdded
    
    console.log('[GAME STATE] completeWhiteDiceTurn:', {
      player: playerName,
      round: currentRound.value,
      playerIndex: currentPlayerIndex.value,
      scoreAdded,
      oldScore,
      newScore
    })
    
    // Track history BEFORE making any changes - snapshot has state before action
    // This ensures undo restores to the exact state before the score was added
    trackHistory(`${playerName} scored ${scoreAdded} (Total: ${newScore})`)
    
    // Trigger confetti for good scores
    if (isTripleSix(whiteDice.value)) {
      triggerTripleSixConfetti()
    } else if (isTriple(whiteDice.value)) {
      triggerTripleConfetti()
    }
    
    // Add score to current player
    currentPlayer.value.score += whiteDiceScore.value
    
    // Check for winner
    if (currentPlayer.value.score >= endgameTarget.value) {
      gameEnded.value = true
      winner.value = currentPlayer.value
      saveGameState()
      saveToLeaderboard()
      return
    }
    
    // Move to next player or next round
    moveToNextPlayer()
    
    saveGameState()
  }
  
  // Move to next player
  function moveToNextPlayer() {
    const oldRound = currentRound.value
    const oldPlayerIndex = currentPlayerIndex.value
    
    console.log('[GAME STATE] moveToNextPlayer called:', {
      oldRound,
      oldPlayerIndex,
      totalPlayers: players.value.length
    })
    
    currentPlayerIndex.value++
    
    // If all players have gone, start new round
    if (currentPlayerIndex.value >= players.value.length) {
      // Check if bonus die phase BEFORE incrementing (check if we just completed round 3, 6, 9, etc.)
      const justCompletedRound = currentRound.value
      const willBeBlackDiePhase = justCompletedRound > 0 && justCompletedRound % 3 === 0
      
      console.log('[GAME STATE] Round complete, moving to next round:', {
        completedRound: justCompletedRound,
        willBeBlackDiePhase,
        newRound: currentRound.value + 1
      })
      
      // Update round and player index FIRST to get to a valid state
      currentRound.value++
      currentPlayerIndex.value = 0
      
      // Initialize bonus die state if needed
      if (willBeBlackDiePhase) {
        blackDiePhaseActive.value = true
        players.value.forEach((_, index) => {
          if (blackDieBanked.value[index] === undefined) {
            blackDieBanked.value[index] = 0
          }
        })
        // Track history AFTER state is updated to valid values
        trackHistory(`Round ${justCompletedRound} complete - Bonus Die Phase started - ${currentPlayer.value.name}'s turn`)
      } else {
        // Track history AFTER state is updated to valid values
        // Only track if round actually changed
        if (currentRound.value !== oldRound) {
          trackHistory(`Round ${currentRound.value} started - ${currentPlayer.value.name}'s turn`)
        }
      }
    } else {
      console.log('[GAME STATE] Moving to next player in same round:', {
        newPlayerIndex: currentPlayerIndex.value,
        player: currentPlayer.value?.name
      })
    }
    // Don't track turn changes for simple player advances - only track when round changes
    // This prevents duplicate history entries when undoing/redoing
    
    resetTurnState()
  }
  
  // Bank bonus die (before rolling)
  function bankBlackDie() {
    // Banking accumulates - each bank adds +1 reroll
    const currentBanked = blackDieBanked.value[currentPlayerIndex.value] || 0
    blackDieBanked.value[currentPlayerIndex.value] = currentBanked + 1
    blackDieRolled.value = true
    blackDieScore.value = 0
    trackHistory(`${currentPlayer.value.name} banked bonus die (${currentBanked + 1} reroll${currentBanked + 1 > 1 ? 's' : ''})`)
    moveToNextBlackDiePlayer()
    saveGameState()
  }
  
  // Roll bonus die (initial roll)
  function rollBlackDie() {
    // Always roll once initially
    blackDieValue.value = Math.floor(Math.random() * 6) + 1
    blackDieScore.value = calculateBonusDieScore(blackDieValue.value)
    blackDieRolled.value = true
    trackHistory(`${currentPlayer.value.name} rolled bonus die: ${blackDieValue.value} (${blackDieScore.value} points)`)
    saveGameState()
    // Don't auto-confirm - let user see the result and confirm manually
  }
  
  // Reroll bonus die (uses 1 banked reroll)
  function rerollBlackDie() {
    if (!blackDieRolled.value) return
    const rerollCount = getBankedCount()
    
    if (rerollCount > 0) {
      // Roll again and take the better result
      const newRoll = Math.floor(Math.random() * 6) + 1
      const newScore = calculateBonusDieScore(newRoll)
      const oldScore = blackDieScore.value
      
      // Take the better score
      if (newScore > blackDieScore.value) {
        blackDieValue.value = newRoll
        blackDieScore.value = newScore
        trackHistory(`${currentPlayer.value.name} rerolled bonus die: ${newRoll} (${newScore} points, was ${oldScore})`)
      } else {
        trackHistory(`${currentPlayer.value.name} rerolled bonus die: ${newRoll} (kept ${oldScore} points)`)
      }
      
      // Subtract 1 from banked rerolls
      blackDieBanked.value[currentPlayerIndex.value] = rerollCount - 1
      saveGameState()
    }
  }
  
  // Confirm bonus die roll and add score (keep current result)
  function confirmBlackDieRoll() {
    if (!blackDieRolled.value) return
    
    const playerName = currentPlayer.value.name
    const scoreAdded = blackDieScore.value
    const newScore = currentPlayer.value.score + scoreAdded
    
    // Track history BEFORE making any changes - snapshot has state before action
    // This ensures undo restores to the exact state before the score was added
    trackHistory(`${playerName} scored ${scoreAdded} from bonus die (Total: ${newScore})`)
    
    // Trigger confetti for bonus die (1 or 5)
    if (blackDieValue.value === 1 || blackDieValue.value === 5) {
      triggerBonusDieConfetti()
    }
    
    // Add score to current player
    currentPlayer.value.score += blackDieScore.value
    
    // Check for winner
    if (currentPlayer.value.score >= endgameTarget.value) {
      gameEnded.value = true
      winner.value = currentPlayer.value
      saveGameState()
      saveToLeaderboard()
      return
    }
    
    // Move to next player
    moveToNextBlackDiePlayer()
    
    saveGameState()
  }
  
  
  // Set bonus die (manual entry mode - single roll)
  function setBlackDie(value) {
    blackDieValue.value = value
    blackDieScore.value = calculateBonusDieScore(value)
    blackDieRolled.value = true
    trackHistory(`${currentPlayer.value.name} rolled bonus die: ${value} (${blackDieScore.value} points)`)
    saveGameState()
    // Don't move to next player yet - wait for confirmation or reroll
  }
  
  // Reroll bonus die manually (uses 1 banked reroll)
  function rerollBlackDieManual(newRoll) {
    if (!blackDieRolled.value) return
    const rerollCount = getBankedCount()
    
    if (rerollCount > 0) {
      const newScore = calculateBonusDieScore(newRoll)
      const oldScore = blackDieScore.value
      
      // Take the better score
      if (newScore > blackDieScore.value) {
        blackDieValue.value = newRoll
        blackDieScore.value = newScore
        trackHistory(`${currentPlayer.value.name} rerolled bonus die: ${newRoll} (${newScore} points, was ${oldScore})`)
      } else {
        trackHistory(`${currentPlayer.value.name} rerolled bonus die: ${newRoll} (kept ${oldScore} points)`)
      }
      
      // Subtract 1 from banked rerolls
      blackDieBanked.value[currentPlayerIndex.value] = rerollCount - 1
      saveGameState()
    }
  }
  
  // Confirm bonus die (for manual entry)
  function confirmBlackDieManual() {
    confirmBlackDieRoll()
  }
  
  // Move to next player in bonus die phase
  function moveToNextBlackDiePlayer() {
    currentPlayerIndex.value++
    
    // If all players have gone, end bonus die phase and start new round
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
  
  // Check if current player has banked bonus die
  function hasBankedBlackDie() {
    return getBankedCount() > 0
  }
  
  // Helper function to get current game state for snapshot
  function getGameState() {
    return {
      gameMode: gameMode.value,
      endgameTarget: endgameTarget.value,
      players: players.value.map(p => ({ name: p.name, score: p.score, id: p.id })),
      currentRound: currentRound.value,
      currentPlayerIndex: currentPlayerIndex.value,
      gameEnded: gameEnded.value,
      winner: winner.value ? { name: winner.value.name, score: winner.value.score, id: winner.value.id } : null,
      whiteDice: [...whiteDice.value],
      whiteDiceRolled: whiteDiceRolled.value,
      rerollUsed: rerollUsed.value,
      whiteDiceScore: whiteDiceScore.value,
      autoRerolled: autoRerolled.value,
      blackDieBanked: { ...blackDieBanked.value },
      blackDiePhaseActive: blackDiePhaseActive.value,
      blackDieRolled: blackDieRolled.value,
      blackDieValue: blackDieValue.value,
      blackDieScore: blackDieScore.value
    }
  }
  
  // Track history for an action
  function trackHistory(actionDescription) {
    if (!gameStarted.value) {
      console.log('[GAME STATE] trackHistory: Game not started, skipping')
      return
    }
    // Create snapshot AFTER state is fully updated
    const state = getGameState()
    console.log('[GAME STATE] trackHistory called:', {
      action: actionDescription,
      currentRound: state.currentRound,
      currentPlayerIndex: state.currentPlayerIndex,
      currentPlayer: state.players[state.currentPlayerIndex]?.name,
      playerScores: state.players.map(p => ({ name: p.name, score: p.score })),
      whiteDiceRolled: state.whiteDiceRolled,
      rerollUsed: state.rerollUsed
    })
    const snapshot = createSnapshot(state, actionDescription)
    console.log('[GAME STATE] Snapshot created with scores:', {
      players: snapshot.state.players.map(p => ({ name: p.name, score: p.score }))
    })
    // addToHistory will truncate future history if we're in the middle of history
    // (e.g., after undo or jump to history point)
    addToHistory(snapshot)
  }
  
  // Undo to previous state
  function undo() {
    const state = historyUndo()
    if (state) {
      console.log('[GAME STATE] Undo: Restoring state:', {
        players: state.players.map(p => ({ name: p.name, score: p.score })),
        currentRound: state.currentRound,
        currentPlayerIndex: state.currentPlayerIndex
      })
      // CRITICAL: Restore state first, then reset turn state
      restoreState(state)
      // Reset turn state after undo to prevent taking another turn immediately
      // The restored state might have whiteDiceRolled: true from a completed turn
      resetTurnState()
      // Force Vue to update by triggering a reactive update
      // Create a new array reference to ensure reactivity
      const currentPlayers = [...players.value]
      players.value = []
      players.value = currentPlayers
      console.log('[GAME STATE] Undo: State restored and turn state reset, current players:', {
        players: players.value.map(p => ({ name: p.name, score: p.score }))
      })
      saveGameState()
      return true
    }
    return false
  }
  
  // Redo to next state
  function redo() {
    const state = historyRedo()
    if (state) {
      console.log('[GAME STATE] Redo: Restoring state:', {
        players: state.players.map(p => ({ name: p.name, score: p.score })),
        currentRound: state.currentRound,
        currentPlayerIndex: state.currentPlayerIndex
      })
      // CRITICAL: Restore state first, then reset turn state
      restoreState(state)
      // Reset turn state after redo to ensure clean state
      resetTurnState()
      // Force Vue to update by triggering a reactive update
      // Create a new array reference to ensure reactivity
      const currentPlayers = [...players.value]
      players.value = []
      players.value = currentPlayers
      console.log('[GAME STATE] Redo: State restored and turn state reset, current players:', {
        players: players.value.map(p => ({ name: p.name, score: p.score }))
      })
      saveGameState()
      return true
    }
    return false
  }
  
  // Save game state to session storage
  function saveGameState() {
    if (!gameStarted.value) return
    
    const state = {
      gameMode: gameMode.value,
      endgameTarget: endgameTarget.value,
      players: players.value.map(p => ({ name: p.name, score: p.score, id: p.id })),
      currentRound: currentRound.value,
      currentPlayerIndex: currentPlayerIndex.value,
      gameEnded: gameEnded.value,
      winner: winner.value ? { name: winner.value.name, score: winner.value.score, id: winner.value.id } : null,
      whiteDice: whiteDice.value,
      whiteDiceRolled: whiteDiceRolled.value,
      rerollUsed: rerollUsed.value,
      whiteDiceScore: whiteDiceScore.value,
      autoRerolled: autoRerolled.value,
      blackDieBanked: { ...blackDieBanked.value },
      blackDiePhaseActive: blackDiePhaseActive.value,
      blackDieRolled: blackDieRolled.value,
      blackDieValue: blackDieValue.value,
      blackDieScore: blackDieScore.value
    }
    
    sessionStorage.save(state)
  }
  
  // Restore state from a snapshot
  function restoreState(state) {
    if (!state) return
    
    console.log('[GAME STATE] restoreState called with:', {
      players: state.players?.map(p => ({ name: p.name, score: p.score })),
      currentRound: state.currentRound,
      currentPlayerIndex: state.currentPlayerIndex
    })
    
    // Log current state before restore
    console.log('[GAME STATE] Current state before restore:', {
      players: players.value.map(p => ({ name: p.name, score: p.score }))
    })
    
    gameMode.value = state.gameMode
    endgameTarget.value = state.endgameTarget
    
    // CRITICAL: Completely replace the players array to ensure Vue reactivity
    // Create a completely new array with new objects to force reactivity
    if (state.players && Array.isArray(state.players)) {
      const newPlayers = state.players.map(p => ({
        name: p.name,
        score: typeof p.score === 'number' ? p.score : 0, // Ensure score is always a number
        id: p.id || Math.random().toString(36).substr(2, 9)
      }))
      console.log('[GAME STATE] Creating new players array:', {
        newPlayers: newPlayers.map(p => ({ name: p.name, score: p.score }))
      })
      // Clear existing array first to force reactivity
      players.value.splice(0, players.value.length)
      // Then push new players
      newPlayers.forEach(p => players.value.push(p))
      console.log('[GAME STATE] Players array assigned, current value:', {
        players: players.value.map(p => ({ name: p.name, score: p.score }))
      })
    }
    
    currentRound.value = state.currentRound || 1
    // Ensure currentPlayerIndex is valid
    const validIndex = Math.max(0, Math.min(state.currentPlayerIndex ?? 0, players.value.length - 1))
    currentPlayerIndex.value = validIndex
    gameStarted.value = true
    gameEnded.value = state.gameEnded || false
    
    // Restore winner - find by ID in the restored players array
    if (state.winner && state.winner.id) {
      winner.value = players.value.find(p => p.id === state.winner.id) || null
    } else {
      winner.value = null
    }
    
    whiteDice.value = state.whiteDice ? [...state.whiteDice] : [null, null, null]
    whiteDiceRolled.value = state.whiteDiceRolled || false
    rerollUsed.value = state.rerollUsed || false
    whiteDiceScore.value = state.whiteDiceScore || 0
    autoRerolled.value = state.autoRerolled || false
    
    blackDieBanked.value = state.blackDieBanked ? { ...state.blackDieBanked } : {}
    blackDiePhaseActive.value = state.blackDiePhaseActive || false
    blackDieRolled.value = state.blackDieRolled || false
    blackDieValue.value = state.blackDieValue ?? null
    blackDieScore.value = state.blackDieScore || 0
    
    console.log('[GAME STATE] restoreState completed, players now:', {
      players: players.value.map(p => ({ name: p.name, score: p.score }))
    })
  }
  
  // Load game state from session storage
  function loadGameState(savedState) {
    if (!savedState) return false
    
    try {
      restoreState(savedState)
      return true
    } catch (error) {
      console.error('Failed to load game state:', error)
      return false
    }
  }
  
  // Reset game
  function resetGame() {
    clearHistory()
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
    sessionStorage.clear()
  }
  
  // Save game result to leaderboard
  function saveToLeaderboard() {
    if (!gameEnded.value || !winner.value) return
    
    const gameResult = {
      players: players.value.map(p => ({
        name: p.name,
        score: p.score
      })),
      target: endgameTarget.value,
      winner: winner.value.name,
      winnerScore: winner.value.score
    }
    
    localStorage.saveGameResult(gameResult)
  }
  
  // Auto-save on state changes
  watch([gameStarted, gameEnded, currentRound, currentPlayerIndex, players, whiteDiceScore, blackDieScore], () => {
    if (gameStarted.value) {
      saveGameState()
    }
  }, { deep: true })
  
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
    saveGameState,
    loadGameState,
    // History
    canUndo,
    canRedo,
    undo,
    redo,
    getHistoryEntries,
    gameStarted
  }
}

