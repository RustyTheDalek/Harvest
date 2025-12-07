<template>
  <div class="w-full max-w-md ipad:max-w-2xl ipad-pro:max-w-3xl mx-auto p-6 space-y-6">
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
    
    <!-- Player Names -->
    <div class="space-y-3">
      <label class="block text-sm font-medium">Player Names</label>
      <div class="space-y-2">
        <div
          v-for="(name, index) in playerNames"
          :key="index"
          :ref="el => { if (el) playerRefs[index] = el }"
          :class="[
            'flex items-center gap-2 bg-gray-800 rounded-lg p-2 transition-all touch-target',
            draggingIndex === index ? 'opacity-50 scale-95' : '',
            dragOverIndex === index ? 'border-2 border-blue-500' : 'border border-gray-700'
          ]"
        >
          <!-- Drag Handle -->
          <div 
            class="flex-shrink-0 text-gray-500 cursor-grab active:cursor-grabbing"
            @touchstart="handleTouchStart($event, index)"
            @touchmove="handleTouchMove($event, index)"
            @touchend="handleTouchEnd"
            @touchcancel="handleTouchEnd"
            @mousedown="handleMouseDown($event, index)"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
            </svg>
          </div>
          
          <!-- Player Name Input -->
          <input
            v-model="playerNames[index]"
            type="text"
            :placeholder="`Player ${index + 1}`"
            class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white touch-target"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            @touchstart.stop
            @touchmove.stop
            @mousedown.stop
            @focus.stop
          />
          
          <!-- Remove Button -->
          <button
            @click.stop="removePlayer(index)"
            :disabled="playerNames.length <= 1"
            :class="[
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors touch-target',
              playerNames.length > 1
                ? 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            ]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Add Player Button -->
      <button
        @click="addPlayer"
        class="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors touch-target flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Add Player
      </button>
    </div>
    
    <!-- Score Target -->
    <div class="space-y-3">
      <label class="block text-sm font-medium">Score Target</label>
      <div class="flex items-center gap-3">
        <!-- Decrement Button -->
        <button
          @click="decrementTarget"
          :disabled="selectedTarget <= 5000"
          :class="[
            'w-14 h-14 rounded-lg font-bold text-2xl transition-colors touch-target flex items-center justify-center',
            selectedTarget > 5000
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
            min="5000"
            step="5000"
            class="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-center text-xl font-medium touch-target"
            @input="validateTarget"
          />
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
import { ref, computed, onUnmounted } from 'vue'

const emit = defineEmits(['start'])

const selectedMode = ref('dice')
const playerNames = ref(['', ''])
const selectedTarget = ref(10000)
const playerRefs = ref({})

// Drag and drop state
const draggingIndex = ref(-1)
const dragOverIndex = ref(-1)
const touchStartY = ref(0)
const touchStartIndex = ref(-1)
const mouseStartY = ref(0)
const mouseStartIndex = ref(-1)
const isMouseDrag = ref(false)

const canStart = computed(() => {
  return (
    playerNames.value.length > 0 &&
    playerNames.value.every(name => name.trim() !== '')
  )
})

function addPlayer() {
  playerNames.value.push('')
}

function removePlayer(index) {
  if (playerNames.value.length <= 1) return
  playerNames.value.splice(index, 1)
  // Clean up refs
  const newRefs = {}
  Object.keys(playerRefs.value).forEach(key => {
    const keyNum = parseInt(key)
    if (keyNum < index) {
      newRefs[key] = playerRefs.value[key]
    } else if (keyNum > index) {
      newRefs[keyNum - 1] = playerRefs.value[key]
    }
  })
  playerRefs.value = newRefs
}

// Touch-based drag and drop
function handleTouchStart(event, index) {
  if (playerNames.value.length <= 1) return
  // Only prevent default if not on an input
  if (event.target.tagName !== 'INPUT' && !event.target.closest('input')) {
    event.preventDefault()
  }
  touchStartY.value = event.touches[0].clientY
  touchStartIndex.value = index
  draggingIndex.value = index
}

function handleTouchMove(event, index) {
  if (draggingIndex.value === -1) return
  event.preventDefault()
  
  const touchY = event.touches[0].clientY
  const deltaY = touchY - touchStartY.value
  
  // Find which element we're over
  let newDragOverIndex = touchStartIndex.value
  const threshold = 40 // pixels
  
  if (Math.abs(deltaY) > threshold) {
    const direction = deltaY > 0 ? 1 : -1
    const potentialIndex = touchStartIndex.value + direction
    
    if (potentialIndex >= 0 && potentialIndex < playerNames.value.length) {
      newDragOverIndex = potentialIndex
    }
  }
  
  dragOverIndex.value = newDragOverIndex
}

function handleTouchEnd() {
  if (draggingIndex.value === -1) return
  
  if (dragOverIndex.value !== -1 && dragOverIndex.value !== draggingIndex.value) {
    // Swap players
    const temp = playerNames.value[draggingIndex.value]
    playerNames.value[draggingIndex.value] = playerNames.value[dragOverIndex.value]
    playerNames.value[dragOverIndex.value] = temp
  }
  
  draggingIndex.value = -1
  dragOverIndex.value = -1
  touchStartIndex.value = -1
}

// Mouse-based drag and drop (for desktop)
function handleMouseDown(event, index) {
  if (playerNames.value.length <= 1) return
  // Only handle if clicking on drag handle (not input/button)
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'BUTTON' || event.target.closest('button') || event.target.closest('input')) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  mouseStartY.value = event.clientY
  mouseStartIndex.value = index
  draggingIndex.value = index
  isMouseDrag.value = true
  
  // Prevent text selection during drag
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'grabbing'
  
  // Add global mouse event listeners
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(event) {
  if (draggingIndex.value === -1 || !isMouseDrag.value) return
  
  const mouseY = event.clientY
  const deltaY = mouseY - mouseStartY.value
  
  // Find which element we're over
  let newDragOverIndex = mouseStartIndex.value
  const threshold = 40 // pixels
  
  if (Math.abs(deltaY) > threshold) {
    const direction = deltaY > 0 ? 1 : -1
    const potentialIndex = mouseStartIndex.value + direction
    
    if (potentialIndex >= 0 && potentialIndex < playerNames.value.length) {
      newDragOverIndex = potentialIndex
    }
  }
  
  dragOverIndex.value = newDragOverIndex
}

function handleMouseUp() {
  // Restore text selection
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
  
  if (draggingIndex.value === -1) {
    cleanupMouseEvents()
    return
  }
  
  if (dragOverIndex.value !== -1 && dragOverIndex.value !== draggingIndex.value) {
    // Swap players
    const temp = playerNames.value[draggingIndex.value]
    playerNames.value[draggingIndex.value] = playerNames.value[dragOverIndex.value]
    playerNames.value[dragOverIndex.value] = temp
  }
  
  draggingIndex.value = -1
  dragOverIndex.value = -1
  mouseStartIndex.value = -1
  isMouseDrag.value = false
  
  cleanupMouseEvents()
}

function cleanupMouseEvents() {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// Clean up event listeners on unmount
onUnmounted(() => {
  cleanupMouseEvents()
})

// Score target controls
function incrementTarget() {
  if (selectedTarget.value < 100000) {
    selectedTarget.value += 5000
  }
}

function decrementTarget() {
  if (selectedTarget.value > 5000) {
    selectedTarget.value -= 5000
  }
}

function validateTarget() {
  // Ensure target is a multiple of 5,000 and within bounds
  if (selectedTarget.value < 5000) {
    selectedTarget.value = 5000
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
    players: playerNames.value.map(name => name.trim() || `Player ${playerNames.value.indexOf(name) + 1}`)
  })
}
</script>
