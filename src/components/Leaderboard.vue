<template>
  <div class="w-full bg-gray-800 rounded-lg p-6 space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">Leaderboard</h2>
      <button
        v-if="leaderboard.length > 0"
        @click="handleClear"
        class="py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors touch-target text-sm"
      >
        Clear
      </button>
    </div>
    
    <div v-if="leaderboard.length === 0" class="text-gray-400 text-center py-8">
      No games completed yet
    </div>
    
    <div v-else class="space-y-3">
      <div
        v-for="(game, index) in leaderboard"
        :key="index"
        class="bg-gray-700 rounded-lg p-4 space-y-2 relative"
      >
        <div class="relative text-center pr-8">
          <div class="text-md font-medium text-green-400">
            Winner: {{ game.winner }}
          </div>
          <button
            @click="handleRemoveEntry(index)"
            class="absolute top-0 right-0 w-6 h-6 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-full text-lg font-bold transition-colors touch-target"
            title="Remove this entry"
          >
            ×
          </button>
        </div>
        <div class="text-xs text-gray-500">
          Target: {{ game.target.toLocaleString() }}
        </div>
        <div class="pt-2 border-t border-gray-600">
          <div class="text-xs text-gray-400 mb-1">All Players:</div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="(player, pIndex) in game.players"
              :key="pIndex"
              :class="[
                'px-2 py-1 rounded text-xs',
                player.name === game.winner
                  ? 'bg-green-600 text-white font-medium'
                  : 'bg-gray-600 text-gray-300'
              ]"
            >
              {{ player.name }}: {{ player.score.toLocaleString() }}
            </div>
          </div>
        </div>
        <div class="text-xs text-gray-400 text-right">
          {{ formatDate(game.date) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { localStorage } from '../utils/storage'

const leaderboard = ref([])

function loadLeaderboard() {
  leaderboard.value = localStorage.getLeaderboard()
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

function handleClear() {
  if (confirm('Are you sure you want to clear the leaderboard?')) {
    localStorage.clearLeaderboard()
    loadLeaderboard()
  }
}

function handleRemoveEntry(index) {
  const game = leaderboard.value[index]
  const gameDate = formatDate(game.date)
  if (confirm(`Are you sure you want to remove the game from ${gameDate}?`)) {
    if (localStorage.removeLeaderboardEntry(index)) {
      loadLeaderboard()
    }
  }
}

onMounted(() => {
  loadLeaderboard()
})

// Expose reload function for parent
defineExpose({
  reload: loadLeaderboard
})
</script>
