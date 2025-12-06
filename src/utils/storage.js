/**
 * Storage utilities for session and local storage
 */

const SESSION_STORAGE_KEY = 'harvest-game-state'
const LEADERBOARD_STORAGE_KEY = 'harvest-leaderboard'
const MAX_LEADERBOARD_ENTRIES = 50

/**
 * Session Storage - For ongoing games
 */
export const sessionStorage = {
  save(gameState) {
    try {
      const serialized = JSON.stringify(gameState)
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, serialized)
      return true
    } catch (error) {
      console.error('Failed to save game state to session storage:', error)
      return false
    }
  },

  load() {
    try {
      const serialized = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (!serialized) return null
      return JSON.parse(serialized)
    } catch (error) {
      console.error('Failed to load game state from session storage:', error)
      return null
    }
  },

  clear() {
    try {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
      return true
    } catch (error) {
      console.error('Failed to clear session storage:', error)
      return false
    }
  },

  hasSavedGame() {
    return window.sessionStorage.getItem(SESSION_STORAGE_KEY) !== null
  }
}

/**
 * Local Storage - For leaderboards
 */
export const localStorage = {
  saveGameResult(gameResult) {
    try {
      let leaderboard = this.getLeaderboard()
      
      // Add new entry
      leaderboard.unshift({
        ...gameResult,
        date: Date.now()
      })
      
      // Limit to max entries
      if (leaderboard.length > MAX_LEADERBOARD_ENTRIES) {
        leaderboard = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES)
      }
      
      const serialized = JSON.stringify(leaderboard)
      window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, serialized)
      return true
    } catch (error) {
      console.error('Failed to save game result to local storage:', error)
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        console.warn('Local storage quota exceeded, clearing old entries')
        // Try to clear old entries and save again
        const leaderboard = this.getLeaderboard()
        const trimmed = leaderboard.slice(0, Math.floor(MAX_LEADERBOARD_ENTRIES / 2))
        try {
          window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(trimmed))
          // Try saving again
          return this.saveGameResult(gameResult)
        } catch (retryError) {
          console.error('Failed to save after clearing old entries:', retryError)
        }
      }
      return false
    }
  },

  getLeaderboard() {
    try {
      const serialized = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY)
      if (!serialized) return []
      return JSON.parse(serialized)
    } catch (error) {
      console.error('Failed to load leaderboard from local storage:', error)
      return []
    }
  },

  clearLeaderboard() {
    try {
      window.localStorage.removeItem(LEADERBOARD_STORAGE_KEY)
      return true
    } catch (error) {
      console.error('Failed to clear leaderboard:', error)
      return false
    }
  }
}

