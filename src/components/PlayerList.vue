<template>
  <div class="w-full space-y-2">
    <div
      v-for="(player, index) in players"
      :key="player.id"
      :class="[
        'p-4 rounded-lg border-2 transition-all',
        index === currentPlayerIndex && !gameEnded
          ? 'bg-blue-900 border-blue-500'
          : 'bg-gray-800 border-gray-700'
      ]"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span
            v-if="index === currentPlayerIndex && !gameEnded"
            class="text-blue-400 font-bold"
          >
            →
          </span>
          <span class="font-medium text-lg">{{ player.name }}</span>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold">{{ player.score.toLocaleString() }}</div>
          <div
            v-if="player.score >= endgameTarget"
            class="text-xs text-green-400 font-medium"
          >
            WINNER!
          </div>
        </div>
      </div>
      <div
        v-if="blackDieBanked && blackDieBanked[index] > 0"
        class="mt-2 text-sm text-yellow-400"
      >
        Banked bonus die (x{{ blackDieBanked[index] }} reroll{{ blackDieBanked[index] === 1 ? '' : 's' }})
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  players: {
    type: Array,
    required: true
  },
  currentPlayerIndex: {
    type: Number,
    required: true
  },
  endgameTarget: {
    type: Number,
    required: true
  },
  gameEnded: {
    type: Boolean,
    default: false
  },
  blackDieBanked: {
    type: Object,
    default: () => ({})
  }
})
</script>

