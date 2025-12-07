<template>
  <div class="w-full h-full bg-gray-900 text-white flex flex-col">
    <div class="flex-1 overflow-y-auto">
      <div class="w-full max-w-md mx-auto px-4 py-8 space-y-6">
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
        
        <!-- Game Settings (before game starts) -->
        <GameSettings
          v-if="!gameStarted && !showResumePrompt"
          @start="handleGameStart"
        />
        
        <!-- Rules Button (main menu) -->
        <button
          v-if="!gameStarted && !showResumePrompt"
          @click="showRules = true"
          class="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors touch-target"
        >
          Rules
        </button>
        
        <!-- Credits Button (main menu) -->
        <button
          v-if="!gameStarted && !showResumePrompt"
          @click="showCredits = true"
          class="w-full py-3 px-4 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors touch-target"
        >
          Credits
        </button>
        
        <!-- Leaderboard Toggle Button (main menu) -->
        <button
          v-if="!gameStarted && !showResumePrompt"
          @click="showLeaderboard = !showLeaderboard"
          class="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors touch-target"
        >
          {{ showLeaderboard ? 'Hide Leaderboard' : 'View Leaderboard' }}
        </button>
        
        <!-- Leaderboard (accessible from main menu) -->
        <div
          v-if="!gameStarted && !showResumePrompt && showLeaderboard"
          class="w-full"
        >
          <Leaderboard ref="leaderboardRef" />
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
      <div class="w-full max-w-md mx-auto px-4">
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
