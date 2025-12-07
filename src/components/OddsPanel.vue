<template>
  <div class="w-full bg-gray-800 rounded-lg p-4 max-h-96 ipad:max-h-[calc(100vh-8rem)] overflow-y-auto">
    <div class="text-lg font-bold mb-3 flex items-center justify-between">
      <span>Odds Calculator</span>
      <button
        @click="$emit('close')"
        class="w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold transition-colors"
      >
        ×
      </button>
    </div>
    
    <!-- Current Roll Odds (if dice are rolled) -->
    <div v-if="currentDice && currentDice.every(d => d !== null)" class="mb-4 pb-4 border-b border-gray-700">
      <div class="text-sm font-medium mb-2 text-blue-400">Current Roll</div>
      <div class="text-xs text-gray-400 mb-1">
        {{ currentDice.join(', ') }}
      </div>
      <div class="text-sm">
        <span class="text-gray-300">Probability: </span>
        <span :class="getProbabilityColorClass(currentRollProbability)">
          {{ formatProbability(currentRollProbability) }}
        </span>
        <span class="text-gray-500 ml-2">
          ({{ formatProbabilityAsOdds(currentRollProbability) }})
        </span>
      </div>
    </div>
    
    <!-- General Pattern Odds -->
    <div class="mb-4">
      <div class="text-sm font-medium mb-2">Pattern Probabilities</div>
      <div class="space-y-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-gray-300">Triple (any)</span>
          <div class="flex items-center gap-2">
            <span :class="getProbabilityColorClass(patternProbs.triple)">
              {{ formatProbability(patternProbs.triple) }}
            </span>
            <span class="text-gray-500 text-xs">
              ({{ formatProbabilityAsOdds(patternProbs.triple) }})
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-300">Double (any)</span>
          <div class="flex items-center gap-2">
            <span :class="getProbabilityColorClass(patternProbs.double)">
              {{ formatProbability(patternProbs.double) }}
            </span>
            <span class="text-gray-500 text-xs">
              ({{ formatProbabilityAsOdds(patternProbs.double) }})
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-300">Sequential (Odds/Evens)</span>
          <div class="flex items-center gap-2">
            <span :class="getProbabilityColorClass(patternProbs.sequential)">
              {{ formatProbability(patternProbs.sequential) }}
            </span>
            <span class="text-gray-500 text-xs">
              ({{ formatProbabilityAsOdds(patternProbs.sequential) }})
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-300">No Match</span>
          <div class="flex items-center gap-2">
            <span :class="getProbabilityColorClass(patternProbs.none)">
              {{ formatProbability(patternProbs.none) }}
            </span>
            <span class="text-gray-500 text-xs">
              ({{ formatProbabilityAsOdds(patternProbs.none) }})
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Specific Face Value Odds (Collapsible) -->
    <div class="mb-4">
      <button
        @click="showFaceValues = !showFaceValues"
        class="w-full text-sm font-medium mb-2 flex items-center justify-between text-left"
      >
        <span>Face Value Probabilities</span>
        <span class="text-gray-500">{{ showFaceValues ? '−' : '+' }}</span>
      </button>
      <div v-if="showFaceValues" class="space-y-2 text-xs">
        <div v-for="value in [1, 2, 3, 4, 5, 6]" :key="value" class="pl-4 space-y-1">
          <div class="flex items-center justify-between text-gray-300">
            <span>Triple {{ value }}</span>
            <div class="flex items-center gap-2">
              <span :class="getProbabilityColorClass(faceValueProbs[`triple_${value}`])">
                {{ formatProbability(faceValueProbs[`triple_${value}`]) }}
              </span>
              <span class="text-gray-500">
                ({{ formatProbabilityAsOdds(faceValueProbs[`triple_${value}`]) }})
              </span>
            </div>
          </div>
          <div class="flex items-center justify-between text-gray-400 pl-2">
            <span>Double {{ value }}</span>
            <div class="flex items-center gap-2">
              <span :class="getProbabilityColorClass(faceValueProbs[`double_${value}`])">
                {{ formatProbability(faceValueProbs[`double_${value}`]) }}
              </span>
              <span class="text-gray-500">
                ({{ formatProbabilityAsOdds(faceValueProbs[`double_${value}`]) }})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Cumulative Odds -->
    <div class="mb-4">
      <div class="text-sm font-medium mb-2">Cumulative Odds</div>
      <div class="flex items-center gap-2 mb-2">
        <label class="text-xs text-gray-400">Over</label>
        <input
          v-model.number="cumulativeTurns"
          type="number"
          min="1"
          max="100"
          class="w-16 px-2 py-1 bg-gray-700 text-white rounded text-sm"
        />
        <label class="text-xs text-gray-400">turns</label>
      </div>
      <div class="space-y-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-gray-300">Triple 6</span>
          <div class="flex items-center gap-2">
            <span :class="getProbabilityColorClass(cumulativeTriple6)">
              {{ formatProbability(cumulativeTriple6) }}
            </span>
            <span class="text-gray-500 text-xs">
              ({{ formatProbabilityAsOdds(cumulativeTriple6) }})
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-300">Any Triple</span>
          <div class="flex items-center gap-2">
            <span :class="getProbabilityColorClass(cumulativeAnyTriple)">
              {{ formatProbability(cumulativeAnyTriple) }}
            </span>
            <span class="text-gray-500 text-xs">
              ({{ formatProbabilityAsOdds(cumulativeAnyTriple) }})
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-300">Sequential</span>
          <div class="flex items-center gap-2">
            <span :class="getProbabilityColorClass(cumulativeSequential)">
              {{ formatProbability(cumulativeSequential) }}
            </span>
            <span class="text-gray-500 text-xs">
              ({{ formatProbabilityAsOdds(cumulativeSequential) }})
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bonus Die Odds (if in bonus die phase) -->
    <div v-if="isBonusDiePhase" class="mb-4 pb-4 border-t border-gray-700 pt-4">
      <div class="text-sm font-medium mb-2">Bonus Die Probabilities</div>
      <div class="space-y-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-gray-300">Value 1 (1500 pts)</span>
          <div class="flex items-center gap-2">
            <span :class="getProbabilityColorClass(1/6)">
              {{ formatProbability(1/6) }}
            </span>
            <span class="text-gray-500 text-xs">
              ({{ formatProbabilityAsOdds(1/6) }})
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-300">Value 5 (2000 pts)</span>
          <div class="flex items-center gap-2">
            <span :class="getProbabilityColorClass(1/6)">
              {{ formatProbability(1/6) }}
            </span>
            <span class="text-gray-500 text-xs">
              ({{ formatProbabilityAsOdds(1/6) }})
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-300">No Score (0 pts)</span>
          <div class="flex items-center gap-2">
            <span :class="getProbabilityColorClass(4/6)">
              {{ formatProbability(4/6) }}
            </span>
            <span class="text-gray-500 text-xs">
              ({{ formatProbabilityAsOdds(4/6) }})
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  getAllPatternProbabilities,
  getFaceValueProbabilities,
  getDicePatternProbability,
  getCumulativeProbability,
  getTripleOfValueProbability,
  getTripleProbability,
  getSequentialProbability,
  formatProbability,
  formatProbabilityAsOdds
} from '../utils/probability'

const props = defineProps({
  currentDice: {
    type: Array,
    default: null
  },
  isBonusDiePhase: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])

const showFaceValues = ref(false)
const cumulativeTurns = ref(10)

const patternProbs = getAllPatternProbabilities()
const faceValueProbs = getFaceValueProbabilities()

const currentRollProbability = computed(() => {
  if (!props.currentDice || props.currentDice.some(d => d === null)) {
    return 0
  }
  return getDicePatternProbability(props.currentDice)
})

const cumulativeTriple6 = computed(() => {
  return getCumulativeProbability(getTripleOfValueProbability(6), cumulativeTurns.value)
})

const cumulativeAnyTriple = computed(() => {
  return getCumulativeProbability(getTripleProbability(), cumulativeTurns.value)
})

const cumulativeSequential = computed(() => {
  return getCumulativeProbability(getSequentialProbability(), cumulativeTurns.value)
})

function getProbabilityColorClass(probability) {
  if (probability < 0.01) return 'text-red-400 font-bold' // < 1% - very rare
  if (probability < 0.05) return 'text-orange-400 font-medium' // < 5% - rare
  if (probability < 0.2) return 'text-yellow-400' // < 20% - uncommon
  if (probability < 0.5) return 'text-green-400' // < 50% - common
  return 'text-blue-400' // >= 50% - very common
}
</script>

