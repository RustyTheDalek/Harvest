<template>
  <div class="w-full grid grid-cols-1 ipad:grid-cols-[1fr_350px] gap-6">
    <!-- Left Column: Main Game Content -->
    <div class="space-y-6">
      <!-- History Controls -->
      <div v-if="gameStarted" class="flex items-center gap-2 flex-wrap">
        <button
          @click="handleUndo"
          :disabled="!canUndo"
          :class="[
            'flex-1 py-2 px-4 rounded-lg font-medium transition-colors touch-target flex items-center justify-center gap-2',
            canUndo
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Undo
        </button>
        <button
          @click="handleRedo"
          :disabled="!canRedo"
          :class="[
            'flex-1 py-2 px-4 rounded-lg font-medium transition-colors touch-target flex items-center justify-center gap-2',
            canRedo
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          ]"
        >
          Redo
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </button>
        <button
          @click="showHistory = !showHistory"
          class="py-2 px-4 rounded-lg font-medium bg-gray-700 text-white hover:bg-gray-600 transition-colors touch-target ipad:hidden"
        >
          History
        </button>
        <button
          @click="handleQuitGame"
          class="py-2 px-4 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors touch-target"
        >
          Quit Game
        </button>
      </div>
      
      <!-- History Panel (mobile only, toggleable) -->
      <div v-if="showHistory && gameStarted" class="ipad:hidden">
        <HistoryPanel
          :history-entries="historyEntries"
        />
      </div>
      
      <!-- Round Indicator -->
      <RoundIndicator
        :current-round="currentRound"
        :is-black-die-round="blackDiePhaseActive"
      />
      
      <!-- Player List -->
      <PlayerList
        :players="players"
        :current-player-index="currentPlayerIndex"
        :endgame-target="endgameTarget"
        :game-ended="gameEnded"
        :black-die-banked="blackDieBanked"
      />
      
      <!-- Current Player Turn -->
      <div
        v-if="!gameEnded"
        class="bg-gray-800 rounded-lg p-6 space-y-6"
      >
        <div class="text-center">
          <div class="text-sm text-gray-400 mb-1">Current Turn</div>
          <div class="text-2xl font-bold">{{ currentPlayer?.name }}</div>
        </div>
        
          <!-- Bonus Die Phase -->
          <div v-if="blackDiePhaseActive">
            <BlackDie
            :has-banked="hasBankedBlackDie()"
            :banked-count="getBankedCount()"
            :rolled="blackDieRolled"
            :value="blackDieValue"
            :score="blackDieScore"
            :mode="gameMode"
            @roll="handleBlackDieRoll"
            @bank="handleBlackDieBank"
            @confirm="handleBlackDieConfirm"
            @reroll="handleBlackDieReroll"
            @set-single="handleBlackDieSetSingle"
            @reroll-manual="handleBlackDieRerollManual"
          />
        </div>
        
        <!-- White Dice Phase -->
        <div v-else>
          <!-- Dice Rolling Mode -->
          <DiceRoller
            v-if="gameMode === 'dice'"
            :dice="whiteDice"
            :rolled="whiteDiceRolled"
            :reroll-used="rerollUsed"
            :score="whiteDiceScore"
            :auto-rerolled="autoRerolled"
            @roll="handleWhiteDiceRoll"
            @reroll="handleWhiteDiceReroll"
            @confirm="handleWhiteDiceConfirm"
          />
          
          <!-- Score Tracker Mode -->
          <ScoreInput
            v-else
            @confirm="handleScoreInputConfirm"
          />
        </div>
      </div>
      
      <!-- Game Over -->
      <div
        v-if="gameEnded && winner"
        class="bg-green-900 border-2 border-green-600 rounded-lg p-6 text-center space-y-4"
      >
        <div class="text-3xl font-bold text-green-400">Game Over!</div>
        <div class="text-2xl font-bold">{{ winner.name }} Wins!</div>
        <div class="text-lg text-gray-300">Final Score: {{ winner.score.toLocaleString() }}</div>
        <div class="flex gap-3">
          <button
            @click="showLeaderboard = !showLeaderboard"
            class="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors touch-target"
          >
            Leaderboard
          </button>
          <button
            @click="handleNewGame"
            class="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors touch-target"
          >
            New Game
          </button>
        </div>
      </div>
      
      <!-- Leaderboard -->
      <Leaderboard
        v-if="showLeaderboard"
        ref="leaderboardRef"
      />
    </div>
    
    <!-- Right Column: History Panel (always visible on iPad) -->
    <div v-if="gameStarted" class="hidden ipad:block">
      <HistoryPanel
        :history-entries="historyEntries"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useGameState } from '../composables/useGameState'
import RoundIndicator from './RoundIndicator.vue'
import PlayerList from './PlayerList.vue'
import DiceRoller from './DiceRoller.vue'
import BlackDie from './BlackDie.vue'
import ScoreInput from './ScoreInput.vue'
import HistoryPanel from './HistoryPanel.vue'
import Leaderboard from './Leaderboard.vue'

const showHistory = ref(false)
const showLeaderboard = ref(false)
const leaderboardRef = ref(null)

const {
  gameMode,
  endgameTarget,
  players,
  currentRound,
  currentPlayerIndex,
  gameStarted,
  gameEnded,
  winner,
  whiteDice,
  whiteDiceRolled,
  rerollUsed,
  whiteDiceScore,
  autoRerolled,
  blackDieBanked,
  blackDiePhaseActive,
  blackDieRolled,
  blackDieValue,
  blackDieScore,
  currentPlayer,
  initializeGame,
  loadGameState,
  rollWhiteDice,
  setWhiteDice,
  rerollWhiteDice,
  markRerollUsed,
  setWhiteDiceScoreToZero,
  completeWhiteDiceTurn,
  bankBlackDie,
  rollBlackDie,
  setBlackDie,
  rerollBlackDie,
  rerollBlackDieManual,
  confirmBlackDieRoll,
  confirmBlackDieManual,
  getBankedCount,
  hasBankedBlackDie,
  resetGame,
  canUndo,
  canRedo,
  undo,
  redo,
  getHistoryEntries
} = useGameState()

const historyEntries = computed(() => getHistoryEntries())

// Reset game and notify parent
function handleReset() {
  resetGame()
  // The watcher in App.vue should detect gameStarted becoming false
}

// Expose for parent
defineExpose({
  initializeGame,
  loadGameState,
  resetGame: handleReset,
  get gameStarted() {
    return gameStarted.value
  }
})

// White dice handlers
function handleWhiteDiceRoll() {
  rollWhiteDice()
}

function handleWhiteDiceReroll() {
  rerollWhiteDice()
}

function handleWhiteDiceConfirm() {
  completeWhiteDiceTurn()
}

// Score input handlers (manual mode)
function handleScoreInputConfirm(dice, score) {
  setWhiteDice(dice)
  completeWhiteDiceTurn()
}

// Bonus die handlers
function handleBlackDieRoll() {
  if (gameMode.value === 'dice') {
    rollBlackDie()
  }
  // In tracker mode, user enters value manually via set-single or set-multiple
}

function handleBlackDieBank() {
  bankBlackDie()
}

function handleBlackDieConfirm() {
  if (gameMode.value === 'dice') {
    confirmBlackDieRoll()
  } else {
    confirmBlackDieManual()
  }
}

function handleBlackDieSetSingle(value) {
  setBlackDie(value)
  // In manual mode, don't auto-confirm - user can reroll or keep
}

function handleBlackDieReroll() {
  if (gameMode.value === 'dice') {
    rerollBlackDie()
  }
}

function handleBlackDieRerollManual(value) {
  rerollBlackDieManual(value)
}

// History handlers
function handleUndo() {
  if (confirm('Are you sure you want to undo? This will revert to the previous game state.')) {
    undo()
  }
}

function handleRedo() {
  redo()
}

// New game
function handleNewGame() {
  resetGame()
  showHistory.value = false
  showLeaderboard.value = false
  // Force parent to show settings by explicitly setting gameStarted to false
  // The watcher should catch this, but we'll ensure it happens
}

// Quit game
function handleQuitGame() {
  if (confirm('Are you sure you want to quit? Your current game progress will be lost.')) {
    resetGame()
    showHistory.value = false
    showLeaderboard.value = false
  }
}

// Watch for game end to reload leaderboard
watch(() => gameEnded.value, (ended) => {
  if (ended && leaderboardRef.value) {
    nextTick(() => {
      if (leaderboardRef.value) {
        leaderboardRef.value.reload()
      }
    })
  }
})
</script>

<style scoped>
.game-board {
  min-height: 200px;
}
</style>
