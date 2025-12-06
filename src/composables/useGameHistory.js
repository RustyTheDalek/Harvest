import { ref, computed } from 'vue'

const MAX_HISTORY_SIZE = 100

export function useGameHistory() {
  const history = ref([])
  const currentIndex = ref(-1)
  
  // Check if we can undo
  const canUndo = computed(() => currentIndex.value > 0)
  
  // Check if we can redo
  const canRedo = computed(() => currentIndex.value < history.value.length - 1)
  
  /**
   * Create a snapshot of the current game state
   */
  function createSnapshot(gameState, actionDescription) {
    return {
      timestamp: Date.now(),
      action: actionDescription,
      state: JSON.parse(JSON.stringify(gameState)) // Deep clone
    }
  }
  
  /**
   * Add a new state to history
   * If we're not at the end of history (after undo or jump), truncate future history
   * This ensures that when you undo/jump and then take a new action, it starts fresh from that point
   */
  function addToHistory(snapshot) {
    // If we're in the middle of history (after undo or jump), remove future entries
    // This is critical - when you undo/jump and then take a new action, we truncate
    // the "future" history and start a new branch
    // We check if currentIndex is not at the end (meaning we've undone/jumped)
    // IMPORTANT: We must check BEFORE adding the new snapshot, because after adding,
    // currentIndex will be at the end and the check will fail
    const wasInMiddleOfHistory = currentIndex.value >= 0 && currentIndex.value < history.value.length - 1
    
    console.log('[HISTORY] addToHistory called:', {
      action: snapshot.action,
      currentIndex: currentIndex.value,
      historyLength: history.value.length,
      wasInMiddleOfHistory,
      willTruncate: wasInMiddleOfHistory
    })
    
    if (wasInMiddleOfHistory) {
      const beforeLength = history.value.length
      // Truncate: keep everything up to and including currentIndex
      // This removes all future history entries BEFORE adding the new one
      // This ensures that when you jump to a point and take a new action,
      // the old future actions are removed and replaced with the new action
      history.value = history.value.slice(0, currentIndex.value + 1)
      console.log('[HISTORY] TRUNCATED future history:', {
        beforeLength,
        afterLength: history.value.length,
        removedCount: beforeLength - history.value.length,
        keptUpToIndex: currentIndex.value
      })
    }
    
    // Add new snapshot (this becomes the new current state)
    history.value.push(snapshot)
    currentIndex.value = history.value.length - 1
    console.log('[HISTORY] Added new snapshot:', {
      newIndex: currentIndex.value,
      totalHistoryLength: history.value.length,
      action: snapshot.action
    })
    
    // Limit history size
    if (history.value.length > MAX_HISTORY_SIZE) {
      const removedCount = history.value.length - MAX_HISTORY_SIZE
      history.value = history.value.slice(removedCount)
      currentIndex.value = history.value.length - 1
      console.log('[HISTORY] Limited history size, removed', removedCount, 'old entries')
    }
  }
  
  /**
   * Get the current state from history
   */
  function getCurrentState() {
    if (currentIndex.value < 0 || currentIndex.value >= history.value.length) {
      return null
    }
    return history.value[currentIndex.value].state
  }
  
  /**
   * Undo - move back one step in history
   */
  function undo() {
    if (!canUndo.value) return null
    currentIndex.value--
    return getCurrentState()
  }
  
  /**
   * Redo - move forward one step in history
   */
  function redo() {
    if (!canRedo.value) return null
    currentIndex.value++
    return getCurrentState()
  }
  
  /**
   * Jump to a specific point in history
   */
  function jumpToIndex(index) {
    if (index < 0 || index >= history.value.length) {
      console.log('[HISTORY] jumpToIndex: Invalid index', index, 'history length:', history.value.length)
      return null
    }
    console.log('[HISTORY] jumpToIndex:', {
      fromIndex: currentIndex.value,
      toIndex: index,
      historyLength: history.value.length,
      action: history.value[index]?.action
    })
    currentIndex.value = index
    return getCurrentState()
  }
  
  /**
   * Clear all history
   */
  function clearHistory() {
    history.value = []
    currentIndex.value = -1
  }
  
  /**
   * Get history entries for display
   */
  function getHistoryEntries() {
    return history.value.map((entry, index) => ({
      index,
      timestamp: entry.timestamp,
      action: entry.action,
      isCurrent: index === currentIndex.value
    }))
  }
  
  return {
    history,
    currentIndex,
    canUndo,
    canRedo,
    createSnapshot,
    addToHistory,
    getCurrentState,
    undo,
    redo,
    jumpToIndex,
    clearHistory,
    getHistoryEntries
  }
}

