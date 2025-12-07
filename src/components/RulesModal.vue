<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="close"
  >
    <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold">Game Rules</h2>
        <button
          @click="close"
          class="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full text-xl font-bold transition-colors touch-target"
        >
          ×
        </button>
      </div>
      
      <div class="space-y-4 text-sm">
        <div>
          <h3 class="font-bold text-lg mb-2">Objective</h3>
          <p class="text-gray-300">
            Be the first player to reach the target score.
          </p>
        </div>
        
        <div>
          <h3 class="font-bold text-lg mb-2">White Dice Rounds</h3>
          <p class="text-gray-300 mb-2">
            Players take turns rolling 3 white dice. Each player rolls once per round.
          </p>
          <ul class="list-disc list-inside text-gray-300 space-y-1 ml-2">
            <li><strong>Double:</strong> 10× face value (e.g., two 3's = 300 points)</li>
            <li><strong>Triple:</strong> 30× face value (e.g., three 5's = 1,500 points)</li>
            <li><strong>Odds/Evens:</strong> 1,3,5 or 2,4,6 = 500 points</li>
            <li><strong>No match:</strong> 0 points</li>
          </ul>
          <p class="text-gray-300 mt-2">
            You get one free reroll of all white dice per turn. If your first roll scores 0, it will automatically reroll.
          </p>
        </div>
        
        <div>
          <h3 class="font-bold text-lg mb-2">Bonus Die Round</h3>
          <p class="text-gray-300 mb-2">
            Every 3rd round (rounds 3, 6, 9, etc.) is a special bonus die round.
          </p>
          <p class="text-gray-300 mb-2">
            <strong>Before rolling:</strong> You can choose to bank the bonus die or roll it immediately.
          </p>
          <ul class="list-disc list-inside text-gray-300 space-y-1 ml-2">
            <li><strong>Bank:</strong> Accumulates rerolls (each bank adds +1 reroll)</li>
            <li><strong>Roll:</strong> Roll the bonus die immediately</li>
          </ul>
          <p class="text-gray-300 mt-2 mb-2">
            <strong>Bonus Die Scoring:</strong>
          </p>
          <ul class="list-disc list-inside text-gray-300 space-y-1 ml-2">
            <li><strong>1:</strong> 1,500 points</li>
            <li><strong>5:</strong> 2,000 points</li>
            <li><strong>Anything else:</strong> 0 points</li>
          </ul>
          <p class="text-gray-300 mt-2">
            If you have banked rerolls, you can roll multiple times (1 + banked rerolls) and take the best result. Each reroll uses 1 banked reroll.
          </p>
        </div>
        
        <div>
          <h3 class="font-bold text-lg mb-2">Winning</h3>
          <p class="text-gray-300">
            The first player to reach or exceed the target score wins the game!
          </p>
        </div>
      </div>
      
      <button
        @click="close"
        class="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors touch-target mt-4"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<style scoped>
/* Modal overlay styles */
</style>

