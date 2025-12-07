/**
 * Test script to populate leaderboard with sample data
 * Run this in the browser console to add test scores
 */

const LEADERBOARD_STORAGE_KEY = 'harvest-leaderboard'

const testGames = [
  {
    players: [
      { name: 'Alice', score: 12500 },
      { name: 'Bob', score: 11800 },
      { name: 'Charlie', score: 10200 }
    ],
    target: 10000,
    winner: 'Alice',
    winnerScore: 12500,
    date: Date.now() - (2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    players: [
      { name: 'David', score: 15200 },
      { name: 'Eve', score: 14800 },
      { name: 'Frank', score: 13500 },
      { name: 'Grace', score: 12000 }
    ],
    target: 15000,
    winner: 'David',
    winnerScore: 15200,
    date: Date.now() - (1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    players: [
      { name: 'Alice', score: 20000 },
      { name: 'Bob', score: 19500 },
      { name: 'Charlie', score: 18000 },
      { name: 'David', score: 17500 },
      { name: 'Eve', score: 16000 }
    ],
    target: 20000,
    winner: 'Alice',
    winnerScore: 20000,
    date: Date.now() - (12 * 60 * 60 * 1000) // 12 hours ago
  },
  {
    players: [
      { name: 'Frank', score: 25000 },
      { name: 'Grace', score: 24000 },
      { name: 'Henry', score: 23000 }
    ],
    target: 25000,
    winner: 'Frank',
    winnerScore: 25000,
    date: Date.now() - (6 * 60 * 60 * 1000) // 6 hours ago
  },
  {
    players: [
      { name: 'Ivy', score: 30000 },
      { name: 'Jack', score: 28500 },
      { name: 'Karen', score: 27000 },
      { name: 'Larry', score: 25500 }
    ],
    target: 30000,
    winner: 'Ivy',
    winnerScore: 30000,
    date: Date.now() - (3 * 60 * 60 * 1000) // 3 hours ago
  },
  {
    players: [
      { name: 'Bob', score: 35000 },
      { name: 'Charlie', score: 34000 },
      { name: 'David', score: 33000 },
      { name: 'Eve', score: 32000 },
      { name: 'Frank', score: 31000 }
    ],
    target: 35000,
    winner: 'Bob',
    winnerScore: 35000,
    date: Date.now() - (1 * 60 * 60 * 1000) // 1 hour ago
  },
  {
    players: [
      { name: 'Alice', score: 45000 },
      { name: 'Grace', score: 42000 },
      { name: 'Henry', score: 40000 }
    ],
    target: 40000,
    winner: 'Alice',
    winnerScore: 45000,
    date: Date.now() - (30 * 60 * 1000) // 30 minutes ago
  },
  {
    players: [
      { name: 'Ivy', score: 50000 },
      { name: 'Jack', score: 48000 },
      { name: 'Karen', score: 46000 },
      { name: 'Larry', score: 44000 },
      { name: 'Mia', score: 42000 }
    ],
    target: 50000,
    winner: 'Ivy',
    winnerScore: 50000,
    date: Date.now() - (15 * 60 * 1000) // 15 minutes ago
  }
]

// Function to populate leaderboard
function populateTestLeaderboard() {
  try {
    // Get existing leaderboard
    const existing = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY)
    let leaderboard = existing ? JSON.parse(existing) : []
    
    // Add test games (they will be added to the beginning)
    testGames.forEach(game => {
      leaderboard.unshift(game)
    })
    
    // Limit to 50 entries
    if (leaderboard.length > 50) {
      leaderboard = leaderboard.slice(0, 50)
    }
    
    // Save to localStorage
    window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(leaderboard))
    
    console.log(`✅ Added ${testGames.length} test games to leaderboard`)
    console.log(`📊 Total games in leaderboard: ${leaderboard.length}`)
    return true
  } catch (error) {
    console.error('❌ Failed to populate test leaderboard:', error)
    return false
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.populateTestLeaderboard = populateTestLeaderboard
  console.log('💡 Run populateTestLeaderboard() in the console to add test data')
}

// Also export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { populateTestLeaderboard, testGames }
}

