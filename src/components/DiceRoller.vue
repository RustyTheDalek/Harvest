<template>
  <div class="w-full space-y-6">
    <!-- Dice Display -->
    <div class="flex justify-center gap-4">
      <div
        v-for="(die, index) in dice"
        :key="index"
        class="w-20 h-20 bg-white rounded-lg flex items-center justify-center text-4xl font-bold text-gray-900 shadow-lg"
      >
        {{ die || '?' }}
      </div>
    </div>
    
    <!-- Score Display -->
    <div
      v-if="rolled"
      class="text-center"
    >
      <div
        v-if="autoRerolled"
        class="text-sm text-yellow-400 mb-2 font-medium"
      >
        Auto-rerolled (first roll scored 0)
      </div>
      <div class="text-sm text-gray-400 mb-1">Score</div>
      <div class="text-4xl font-bold">{{ score.toLocaleString() }}</div>
    </div>
    
    <!-- Buttons -->
    <div class="space-y-3">
      <button
        v-if="!rolled"
        @click="handleRoll"
        class="w-full py-4 px-6 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors touch-target"
      >
        Roll Dice
      </button>
      
      <button
        v-if="rolled && !rerollUsed"
        @click="handleReroll"
        class="w-full py-4 px-6 bg-yellow-600 text-white rounded-lg font-bold text-lg hover:bg-yellow-700 transition-colors touch-target"
      >
        Reroll (Free)
      </button>
      
      <button
        v-if="rolled"
        @click="handleConfirm"
        class="w-full py-4 px-6 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-colors touch-target"
      >
        Confirm Score
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  dice: {
    type: Array,
    required: true
  },
  rolled: {
    type: Boolean,
    default: false
  },
  rerollUsed: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  },
  autoRerolled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['roll', 'reroll', 'confirm'])

function handleRoll() {
  emit('roll')
}

function handleReroll() {
  emit('reroll')
}

function handleConfirm() {
  emit('confirm')
}
</script>

