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
            'py-4 px-6 text-white rounded-lg font-bold text-lg transition-colors touch-target',
            pattern.value === 'double' || pattern.value === 'triple' 
              ? 'bg-green-600 hover:bg-green-700' 
              : pattern.value === 'zero'
              ? 'bg-gray-600 hover:bg-gray-700'
              : 'bg-blue-600 hover:bg-blue-700'
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
    
    <!-- Score Display - REMOVED for tracker mode to prevent flicker -->
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { calculateWhiteDiceScore } from '../utils/scoring'

const emit = defineEmits(['confirm'])

const patterns = [
  { value: 'double', label: 'DOUBLE' },
  { value: 'triple', label: 'TRIPLE' },
  { value: 'sequential', label: 'ODDS/EVENS' },
  { value: 'zero', label: 'NONE' }
]

const patternSelected = ref(null)
const faceValue = ref(null)
const score = ref(0)
const isConfirming = ref(false)

// Calculate dice array based on selection
const diceArray = computed(() => {
  if (patternSelected.value === 'sequential') {
    // Sequential pattern (1,3,5 or 2,4,6) - both score 500
    return [1, 3, 5]
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

// Watch for score calculation and auto-confirm (only for double/triple with face value)
watch(() => [patternSelected.value, faceValue.value], () => {
  if (isConfirming.value) return // Prevent duplicate confirmations
  
  // Skip sequential/zero - they're handled in selectPattern
  if (patternSelected.value === 'sequential' || patternSelected.value === 'zero') {
    return
  }
  
  if (diceArray.value && faceValue.value) {
    score.value = calculateWhiteDiceScore(diceArray.value)
    // Auto-confirm immediately when face value is selected for double/triple
    // No score display in tracker mode to prevent flicker
    handleConfirm()
  } else {
    score.value = 0
  }
}, { immediate: true })

function selectPattern(pattern) {
  // For sequential/zero, confirm immediately without showing score
  if (pattern === 'sequential' || pattern === 'zero') {
    const dice = pattern === 'sequential' ? [1, 3, 5] : [1, 2, 3]
    const calculatedScore = calculateWhiteDiceScore(dice)
    emit('confirm', dice, calculatedScore)
    // Don't set patternSelected to avoid flicker
    return
  }
  
  patternSelected.value = pattern
  faceValue.value = null
}

function selectFaceValue(face) {
  faceValue.value = face
  // Score will be calculated by watcher
}

function handleConfirm() {
  if (!diceArray.value || isConfirming.value) return
  isConfirming.value = true
  emit('confirm', diceArray.value, score.value)
  // Reset for next turn
  patternSelected.value = null
  faceValue.value = null
  score.value = 0
  isConfirming.value = false
}
</script>
