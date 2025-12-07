<template>
  <div class="w-full h-full bg-gray-900 text-white flex flex-col">
    <div class="flex-1 overflow-y-auto">
      <div class="w-full max-w-md ipad:max-w-4xl ipad-pro:max-w-6xl mx-auto px-4 py-8 space-y-6">
        <h1 class="text-3xl font-bold text-center mb-4">Harvest</h1>
        
        <!-- Resume Game Prompt -->
        <div
          v-if="showResumePrompt"
          class="bg-blue-900 border-2 border-blue-600 rounded-lg p-6 space-y-4"
        >
          <div class="text-xl font-bold text-center">Resume Game?</div>
          <div class="text-sm text-gray-300 text-center">
            You have a saved game in progress. Would you like to resume it?
          </div>
          <div class="flex gap-3">
            <button
              @click="handleResumeGame"
              class="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors touch-target"
            >
              Resume
            </button>
            <button
              @click="handleDiscardGame"
              class="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors touch-target"
            >
              New Game
            </button>
          </div>
        </div>
        
        <!-- Main Menu -->
        <div v-if="!gameStarted && !showResumePrompt && currentPage === 'menu'" class="grid grid-cols-1 ipad:grid-cols-[1fr_400px] gap-6 ipad:items-center">
          <!-- Left Column: Menu Buttons -->
          <div class="space-y-4">
            <!-- Play Game Button -->
            <button
              @click="currentPage = 'setup'"
              class="w-full py-4 px-6 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-colors touch-target"
            >
              Play Game
            </button>
            
            <!-- Rules Button -->
            <button
              @click="showRules = true"
              class="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors touch-target"
            >
              Rules
            </button>
            
            <!-- Credits Button -->
            <button
              @click="showCredits = true"
              class="w-full py-3 px-4 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors touch-target"
            >
              Credits
            </button>
            
            <!-- Leaderboard Toggle Button (only on mobile) -->
            <button
              @click="showLeaderboard = !showLeaderboard"
              class="w-full ipad:hidden py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors touch-target"
            >
              {{ showLeaderboard ? 'Hide Leaderboard' : 'View Leaderboard' }}
            </button>
            
            <!-- Leaderboard (mobile only, toggleable) -->
            <div
              v-if="showLeaderboard"
              class="w-full ipad:hidden"
            >
              <Leaderboard ref="leaderboardRef" />
            </div>
          </div>
          
          <!-- Right Column: Leaderboard (always visible on iPad) -->
          <div class="hidden ipad:block">
            <Leaderboard ref="leaderboardRef" />
          </div>
        </div>
        
        <!-- Game Setup Page -->
        <div v-if="!gameStarted && !showResumePrompt && currentPage === 'setup'" class="space-y-4">
          <!-- Back Button -->
          <button
            @click="currentPage = 'menu'"
            class="w-full py-3 px-4 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors touch-target flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Menu
          </button>
          
          <!-- Game Settings -->
          <GameSettings
            @start="handleGameStart"
          />
        </div>
        
        <!-- Rules Modal -->
        <RulesModal
          :show="showRules"
          @close="showRules = false"
        />
        
        <!-- Credits Modal -->
        <CreditsModal
          :show="showCredits"
          @close="showCredits = false"
        />
        
        <!-- Game Board (always rendered, shows content when game started) -->
        <GameBoard
          ref="gameBoardRef"
          v-show="gameStarted"
        />
      </div>
    </div>
    
    <!-- Copyright Footer (anchored to bottom) -->
    <footer class="w-full py-4 border-t border-gray-800">
      <div class="w-full max-w-md ipad:max-w-4xl ipad-pro:max-w-6xl mx-auto px-4">
        <div class="text-center text-xs text-gray-500">
          © Braylon Thomas 2025
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import GameSettings from './components/GameSettings.vue'
import GameBoard from './components/GameBoard.vue'
import Leaderboard from './components/Leaderboard.vue'
import RulesModal from './components/RulesModal.vue'
import CreditsModal from './components/CreditsModal.vue'
import { sessionStorage } from './utils/storage'

const gameBoardRef = ref(null)
const gameStarted = ref(false)
const pendingGameConfig = ref(null)
const showResumePrompt = ref(false)
const showLeaderboard = ref(false)
const showRules = ref(false)
const showCredits = ref(false)
const leaderboardRef = ref(null)
const currentPage = ref('menu') // 'menu' or 'setup'

function handleGameStart(config) {
  // Store config
  pendingGameConfig.value = config
  
  // Always wait for nextTick to ensure GameBoard is mounted
  nextTick(() => {
    if (gameBoardRef.value && pendingGameConfig.value) {
      gameBoardRef.value.initializeGame(
        pendingGameConfig.value.mode,
        pendingGameConfig.value.target,
        pendingGameConfig.value.players
      )
      // Set gameStarted to true after initialization
      gameStarted.value = true
      pendingGameConfig.value = null
      currentPage.value = 'menu' // Return to menu when game starts
    }
  })
}

// Watch for game reset - check the exposed gameStarted getter
watch(() => {
  if (!gameBoardRef.value) return undefined
  try {
    return gameBoardRef.value.gameStarted
  } catch {
    return undefined
  }
}, (started) => {
  // Only react to false (game reset), not true (game start)
  if (started === false) {
    gameStarted.value = false
    pendingGameConfig.value = null
    currentPage.value = 'menu' // Return to menu when game ends
  }
})

// Check for saved game on mount
onMounted(() => {
  if (sessionStorage.hasSavedGame()) {
    showResumePrompt.value = true
  }
})

function handleResumeGame() {
  const savedState = sessionStorage.load()
  if (savedState && gameBoardRef.value) {
    nextTick(() => {
      if (gameBoardRef.value) {
        const loaded = gameBoardRef.value.loadGameState(savedState)
        if (loaded) {
          gameStarted.value = true
          showResumePrompt.value = false
        } else {
          // Failed to load, clear and show settings
          sessionStorage.clear()
          showResumePrompt.value = false
        }
      }
    })
  } else {
    showResumePrompt.value = false
  }
}

function handleDiscardGame() {
  sessionStorage.clear()
  showResumePrompt.value = false
}
</script>

<style scoped>
/* Additional app-specific styles if needed */
</style>
