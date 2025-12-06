<template>
  <div class="w-full max-w-md mx-auto p-6 space-y-6">
    <h2 class="text-2xl font-bold text-center mb-6">Game Setup</h2>
    
    <!-- Game Mode Selection -->
    <div class="space-y-3">
      <label class="block text-sm font-medium">Game Mode</label>
      <div class="flex gap-4">
        <button
          @click="selectedMode = 'dice'"
          :class="[
            'flex-1 py-3 px-4 rounded-lg font-medium transition-colors touch-target',
            selectedMode === 'dice'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          ]"
        >
          Dice Rolling
        </button>
        <button
          @click="selectedMode = 'tracker'"
          :class="[
            'flex-1 py-3 px-4 rounded-lg font-medium transition-colors touch-target',
            selectedMode === 'tracker'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          ]"
        >
          Score Tracker
        </button>
      </div>
    </div>
    
    <!-- Number of Players -->
    <div class="space-y-3">
      <label class="block text-sm font-medium">Number of Players</label>
      <input
        v-model.number="numPlayers"
        type="number"
        min="2"
        max="10"
        class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-center text-xl touch-target"
      />
    </div>
    
    <!-- Player Names -->
    <div class="space-y-3">
      <label class="block text-sm font-medium">Player Names</label>
      <div class="space-y-2">
        <input
          v-for="(name, index) in playerNames"
          :key="index"
          v-model="playerNames[index]"
          type="text"
          :placeholder="`Player ${index + 1}`"
          class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white touch-target"
        />
      </div>
    </div>
    
    <!-- Score Target -->
    <div class="space-y-3">
      <label class="block text-sm font-medium">Score Target</label>
      <div class="flex items-center gap-3">
        <!-- Decrement Button -->
        <button
          @click="decrementTarget"
          :disabled="selectedTarget <= 10000"
          :class="[
            'w-14 h-14 rounded-lg font-bold text-2xl transition-colors touch-target flex items-center justify-center',
            selectedTarget > 10000
              ? 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-500'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          ]"
        >
          −
        </button>
        
        <!-- Input Field -->
        <div class="flex-1 relative">
          <input
            v-model.number="selectedTarget"
            type="number"
            min="10000"
            step="5000"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-center text-xl font-medium touch-target"
            @input="validateTarget"
          />
          <div class="absolute -bottom-5 left-0 right-0 text-xs text-gray-500 text-center">
            (in 5,000s)
          </div>
        </div>
        
        <!-- Increment Button -->
        <button
          @click="incrementTarget"
          :disabled="selectedTarget >= 100000"
          :class="[
            'w-14 h-14 rounded-lg font-bold text-2xl transition-colors touch-target flex items-center justify-center',
            selectedTarget < 100000
              ? 'bg-gray-700 text-white hover:bg-gray-600 active:bg-gray-500'
              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
          ]"
        >
          +
        </button>
      </div>
    </div>
    
    <!-- Start Button -->
    <button
      @click="startGame"
      :disabled="!canStart"
      :class="[
        'w-full py-4 px-6 rounded-lg font-bold text-lg transition-colors touch-target',
        canStart
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
      ]"
    >
      Start Game
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['start'])

const selectedMode = ref('dice')
const numPlayers = ref(2)
const playerNames = ref(['', ''])
const selectedTarget = ref(10000)

const canStart = computed(() => {
  return (
    numPlayers.value >= 2 &&
    playerNames.value.slice(0, numPlayers.value).every(name => name.trim() !== '')
  )
})

// Update player names when numPlayers changes
function updatePlayerNames() {
  const current = playerNames.value.length
  if (numPlayers.value > current) {
    for (let i = current; i < numPlayers.value; i++) {
      playerNames.value.push('')
    }
  } else {
    playerNames.value = playerNames.value.slice(0, numPlayers.value)
  }
}

// Score target controls
function incrementTarget() {
  if (selectedTarget.value < 100000) {
    selectedTarget.value += 5000
  }
}

function decrementTarget() {
  if (selectedTarget.value > 10000) {
    selectedTarget.value -= 5000
  }
}

function validateTarget() {
  // Ensure target is a multiple of 5,000 and within bounds
  if (selectedTarget.value < 10000) {
    selectedTarget.value = 10000
  } else if (selectedTarget.value > 100000) {
    selectedTarget.value = 100000
  } else {
    // Round to nearest 5,000
    selectedTarget.value = Math.round(selectedTarget.value / 5000) * 5000
  }
}

function startGame() {
  if (!canStart.value) return
  
  emit('start', {
    mode: selectedMode.value,
    target: selectedTarget.value,
    players: playerNames.value.slice(0, numPlayers.value).map(name => name.trim() || `Player ${playerNames.value.indexOf(name) + 1}`)
  })
}

// Watch numPlayers
watch(numPlayers, updatePlayerNames)
</script>

