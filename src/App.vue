<template>
  <div class="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-start overflow-y-auto">
    <div class="w-full max-w-md px-4 py-8 space-y-6">
      <h1 class="text-3xl font-bold text-center mb-4">Harvest</h1>
      
      <!-- Game Settings (before game starts) -->
      <GameSettings
        v-if="!gameStarted"
        @start="handleGameStart"
      />
      
      <!-- Game Board (always rendered, shows content when game started) -->
      <GameBoard
        ref="gameBoardRef"
        v-show="gameStarted"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import GameSettings from './components/GameSettings.vue'
import GameBoard from './components/GameBoard.vue'

const gameBoardRef = ref(null)
const gameStarted = ref(false)
const pendingGameConfig = ref(null)

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
</script>

<style scoped>
/* Additional app-specific styles if needed */
</style>
