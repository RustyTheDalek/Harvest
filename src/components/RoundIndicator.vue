<template>
  <div class="text-center py-4">
    <div class="text-sm text-gray-400 mb-1">Round</div>
    <div class="text-3xl font-bold">{{ currentRound }}</div>
    <div
      v-if="isBlackDieRound"
      class="mt-2 text-yellow-400 font-medium"
    >
      Black Die Phase
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentRound: {
    type: Number,
    required: true
  },
  isBlackDieRound: {
    type: Boolean,
    default: false
  }
})
</script>

