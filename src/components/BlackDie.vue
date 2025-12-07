<template>
  <div class="w-full space-y-6">
    <!-- Banked Die Notice -->
    <div
      v-if="hasBanked"
      class="bg-yellow-900 border border-yellow-600 rounded-lg p-4 text-center"
    >
      <div class="text-yellow-400 font-medium mb-2">You have a banked bonus die!</div>
      <div class="text-sm text-yellow-300">After rolling, you can reroll (uses 1 banked reroll each time).</div>
    </div>
    
    <!-- Decision: Roll or Bank (dice mode only) -->
    <div
      v-if="!rolled && mode === 'dice'"
      class="space-y-3"
    >
      <div class="text-center text-lg font-medium mb-4">
        Choose before rolling:
      </div>
      <button
        @click="handleBank"
        class="w-full py-4 px-6 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors touch-target"
      >
        Bank Bonus Die
      </button>
      <button
        @click="handleRoll"
        class="w-full py-4 px-6 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors touch-target"
      >
        Roll Bonus Die
      </button>
    </div>
    
    <!-- Dice Display (if rolled, only in dice mode to prevent flicker in tracker mode) -->
    <div
      v-if="rolled && value !== null && mode === 'dice'"
      class="flex justify-center"
    >
      <div class="w-24 h-24 bg-black border-4 border-gray-700 rounded-lg flex items-center justify-center text-5xl font-bold text-white shadow-lg">
        {{ value }}
      </div>
    </div>
    
    <!-- Score Display (only in dice mode to prevent flicker in tracker mode) -->
    <div
      v-if="rolled && mode === 'dice'"
      class="text-center"
    >
      <div class="text-sm text-gray-400 mb-1">Score</div>
      <div class="text-4xl font-bold">{{ score.toLocaleString() }}</div>
      <div
        v-if="score === 0 && !hasBanked"
        class="text-sm text-gray-400 mt-2"
      >
        No bonus points
      </div>
    </div>
    
    <!-- Bank option for tracker mode (before rolling) -->
    <div
      v-if="!rolled && mode === 'tracker'"
      class="space-y-4"
    >
      <button
        @click="handleBank"
        class="w-full py-4 px-6 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors touch-target"
      >
        Bank Bonus Die
      </button>
      <div class="text-center text-lg font-medium mb-4">
        What did you roll?
      </div>
      <div class="grid grid-cols-3 gap-3">
        <button
          @click="handleSingleConfirm(1)"
          class="py-6 px-6 bg-green-600 text-white rounded-lg font-bold text-3xl hover:bg-green-700 transition-colors touch-target"
        >
          1
        </button>
        <button
          @click="handleSingleConfirm(5)"
          class="py-6 px-6 bg-green-600 text-white rounded-lg font-bold text-3xl hover:bg-green-700 transition-colors touch-target"
        >
          5
        </button>
        <button
          @click="handleSingleConfirm(0)"
          class="py-6 px-6 bg-gray-600 text-white rounded-lg font-bold text-lg hover:bg-gray-700 transition-colors touch-target"
        >
          None
        </button>
      </div>
    </div>
    
    <!-- Manual Reroll Entry (for tracker mode after initial roll) -->
    <div
      v-if="rolled && hasBanked && bankedCount > 0 && mode === 'tracker'"
      class="space-y-4"
    >
      <div class="text-center text-lg font-medium mb-4">
        Reroll? (x{{ bankedCount }} left)
      </div>
      <div class="grid grid-cols-3 gap-3">
        <button
          @click="handleRerollManual(1)"
          class="py-6 px-6 bg-yellow-600 text-white rounded-lg font-bold text-3xl hover:bg-yellow-700 transition-colors touch-target"
        >
          1
        </button>
        <button
          @click="handleRerollManual(5)"
          class="py-6 px-6 bg-yellow-600 text-white rounded-lg font-bold text-3xl hover:bg-yellow-700 transition-colors touch-target"
        >
          5
        </button>
        <button
          @click="handleRerollManual(0)"
          class="py-6 px-6 bg-gray-600 text-white rounded-lg font-bold text-lg hover:bg-gray-700 transition-colors touch-target"
        >
          None
        </button>
      </div>
    </div>
    
    <!-- Reroll Button (for dice mode after roll, only if banked rerolls available) -->
    <button
      v-if="rolled && mode === 'dice' && hasBanked && bankedCount > 0"
      @click="handleReroll"
      class="w-full py-4 px-6 bg-yellow-600 text-white rounded-lg font-bold text-lg hover:bg-yellow-700 transition-colors touch-target"
    >
      Reroll (x{{ bankedCount }} left)
    </button>
    
    <!-- Confirm Button (for dice mode after roll) -->
    <button
      v-if="rolled && mode === 'dice'"
      @click="handleConfirm"
      class="w-full py-4 px-6 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-colors touch-target"
    >
      Confirm Score
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  hasBanked: {
    type: Boolean,
    default: false
  },
  bankedCount: {
    type: Number,
    default: 0
  },
  rolled: {
    type: Boolean,
    default: false
  },
  value: {
    type: Number,
    default: null
  },
  score: {
    type: Number,
    default: 0
  },
  mode: {
    type: String,
    default: 'dice'
  }
})

const emit = defineEmits(['roll', 'bank', 'confirm', 'reroll', 'set-single', 'reroll-manual'])

const isConfirming = ref(false)

function handleRoll() {
  emit('roll')
  // Auto-confirm after roll if no banked rerolls (handled in parent via watcher on blackDieRolled)
}

function handleBank() {
  emit('bank')
}

function handleConfirm() {
  if (isConfirming.value) return
  isConfirming.value = true
  emit('confirm')
  isConfirming.value = false
}

function handleSingleConfirm(value) {
  // value can be 1, 5, or 0 (none)
  // For "none", we need to pass a value that's not 1 or 5 (e.g., 2, 3, 4, or 6)
  // But actually, we should pass the actual rolled value - let's use 2 as a placeholder for "none"
  // The scoring function will return 0 for anything that's not 1 or 5 anyway
  const rollValue = value === 0 ? 2 : value
  emit('set-single', rollValue)
  
  // Auto-confirm in tracker mode after setting value (if no banked rerolls)
  if (props.mode === 'tracker' && (!props.hasBanked || props.bankedCount === 0)) {
    setTimeout(() => {
      if (!isConfirming.value) {
        isConfirming.value = true
        emit('confirm')
        isConfirming.value = false
      }
    }, 100)
  }
}

function handleReroll() {
  emit('reroll')
}

function handleRerollManual(value) {
  // value can be 1, 5, or 0 (none)
  const rollValue = value === 0 ? 2 : value
  emit('reroll-manual', rollValue)
  
  // Auto-confirm after reroll if no more banked rerolls left
  if (props.bankedCount <= 1) {
    setTimeout(() => {
      if (!isConfirming.value) {
        isConfirming.value = true
        emit('confirm')
        isConfirming.value = false
      }
    }, 100)
  }
}

</script>

