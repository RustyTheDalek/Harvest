<template>
  <div class="w-full space-y-6">
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
      
      <!-- Black Die Phase -->
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
          :reroll-used="rerollUsed"
          @confirm="handleScoreInputConfirm"
          @reroll="handleScoreInputReroll"
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
      <button
        @click="handleNewGame"
        class="w-full py-4 px-6 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors touch-target"
      >
        New Game
      </button>
    </div>
  </div>
</template>

<script setup>
import { useGameState } from '../composables/useGameState'
import RoundIndicator from './RoundIndicator.vue'
import PlayerList from './PlayerList.vue'
import DiceRoller from './DiceRoller.vue'
import BlackDie from './BlackDie.vue'
import ScoreInput from './ScoreInput.vue'

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
  resetGame
} = useGameState()

// Reset game and notify parent
function handleReset() {
  resetGame()
  // The watcher in App.vue should detect gameStarted becoming false
}

// Expose for parent
defineExpose({
  initializeGame,
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

function handleScoreInputReroll() {
  // Mark reroll as used (don't roll dice in manual mode)
  markRerollUsed()
  // ScoreInput component will reset its own input state
}

// Black die handlers
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

// New game
function handleNewGame() {
  resetGame()
  // Force parent to show settings by explicitly setting gameStarted to false
  // The watcher should catch this, but we'll ensure it happens
}
</script>

<style scoped>
.game-board {
  min-height: 200px;
}
</style>
