<template>
  <div class="w-full space-y-6">
    <!-- Pattern Selection -->
    <div v-if="!patternSelected" class="space-y-4">
      <label class="block text-sm font-medium text-center">What did you roll?</label>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="pattern in patterns"
          :key="pattern.value"
          @click="selectPattern(pattern.value)"
          :class="[
            'py-4 px-6 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors touch-target',
            pattern.value === 'zero' ? 'col-span-2' : ''
          ]"
        >
          {{ pattern.label }}
        </button>
      </div>
    </div>
    
    <!-- Face Value Selection (for Double/Triple) -->
    <div v-if="patternSelected === 'double' || patternSelected === 'triple'" class="space-y-4">
      <label class="block text-sm font-medium text-center">
        Which face value? ({{ patternSelected === 'double' ? 'Double' : 'Triple' }})
      </label>
      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="face in [1, 2, 3, 4, 5, 6]"
          :key="face"
          @click="selectFaceValue(face)"
          class="py-4 px-6 bg-purple-600 text-white rounded-lg font-bold text-2xl hover:bg-purple-700 transition-colors touch-target"
        >
          {{ face }}
        </button>
      </div>
      <button
        @click="patternSelected = null"
        class="w-full py-3 px-6 bg-gray-600 text-white rounded-lg font-bold text-sm hover:bg-gray-700 transition-colors touch-target"
      >
        Back
      </button>
    </div>
    
    <!-- Score Display -->
    <div
      v-if="scoreCalculated"
      class="text-center"
    >
      <div class="text-sm text-gray-400 mb-1">Score</div>
      <div class="text-4xl font-bold">{{ score.toLocaleString() }}</div>
    </div>
    
    <!-- Reroll Option -->
    <div
      v-if="scoreCalculated && !rerollUsed"
      class="space-y-3"
    >
      <button
        @click="handleReroll"
        class="w-full py-4 px-6 bg-yellow-600 text-white rounded-lg font-bold text-lg hover:bg-yellow-700 transition-colors touch-target"
      >
        Reroll (Free)
      </button>
    </div>
    
    <!-- Confirm Button -->
    <button
      v-if="scoreCalculated"
      @click="handleConfirm"
      :class="[
        'w-full py-4 px-6 rounded-lg font-bold text-lg transition-colors touch-target',
        'bg-green-600 text-white hover:bg-green-700'
      ]"
    >
      Confirm Score
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { calculateWhiteDiceScore } from '../utils/scoring'

const props = defineProps({
  rerollUsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'reroll'])

const patterns = [
  { value: 'odds', label: 'ODDS (1,3,5)' },
  { value: 'evens', label: 'EVENS (2,4,6)' },
  { value: 'double', label: 'DOUBLE' },
  { value: 'triple', label: 'TRIPLE' },
  { value: 'zero', label: 'NONE' }
]

const patternSelected = ref(null)
const faceValue = ref(null)
const score = ref(0)
const scoreCalculated = ref(false)

// Calculate dice array based on selection
const diceArray = computed(() => {
  if (patternSelected.value === 'odds') {
    return [1, 3, 5]
  } else if (patternSelected.value === 'evens') {
    return [2, 4, 6]
  } else if (patternSelected.value === 'double' && faceValue.value) {
    // For double, we need two of the same and one different
    // We'll use the face value twice and a different value once
    const otherValue = faceValue.value === 1 ? 2 : 1
    return [faceValue.value, faceValue.value, otherValue]
  } else if (patternSelected.value === 'triple' && faceValue.value) {
    return [faceValue.value, faceValue.value, faceValue.value]
  } else if (patternSelected.value === 'zero') {
    // For zero score, return any combination that scores 0 (e.g., 1, 2, 3)
    return [1, 2, 3]
  }
  return null
})

// Watch for score calculation
watch(() => [patternSelected.value, faceValue.value], () => {
  if (diceArray.value) {
    score.value = calculateWhiteDiceScore(diceArray.value)
    scoreCalculated.value = true
  } else {
    score.value = 0
    scoreCalculated.value = false
  }
}, { immediate: true })

function selectPattern(pattern) {
  patternSelected.value = pattern
  faceValue.value = null
  
  // For odds/evens/zero, score is immediately calculated
  if (pattern === 'odds' || pattern === 'evens' || pattern === 'zero') {
    // Score will be calculated by watcher
  }
}

function selectFaceValue(face) {
  faceValue.value = face
  // Score will be calculated by watcher
}

function handleConfirm() {
  if (!diceArray.value) return
  emit('confirm', diceArray.value, score.value)
  // Reset for next turn
  patternSelected.value = null
  faceValue.value = null
  score.value = 0
  scoreCalculated.value = false
}

function handleReroll() {
  patternSelected.value = null
  faceValue.value = null
  score.value = 0
  scoreCalculated.value = false
  emit('reroll')
}
</script>
