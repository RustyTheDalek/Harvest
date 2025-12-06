<template>
  <div class="w-full h-full bg-gray-900 text-white flex flex-col items-center justify-center">
    <div class="w-full max-w-md px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8">Harvest</h1>
      <GameBoard />
    </div>
  </div>
</template>

<script setup>
import GameBoard from './components/GameBoard.vue'
</script>

<style scoped>
/* Additional app-specific styles if needed */
</style>

