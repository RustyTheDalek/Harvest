<template>
  <div class="w-full bg-gray-800 rounded-lg p-4 max-h-96 ipad:max-h-[calc(100vh-8rem)] ipad:sticky ipad:top-4 overflow-y-auto">
    <div class="text-lg font-bold mb-3">Game History</div>
    <div v-if="historyEntries.length === 0" class="text-gray-400 text-sm text-center py-4">
      No history yet
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="(entry, index) in historyEntries"
        :key="index"
        :class="[
          'p-3 rounded cursor-default transition-colors',
          entry.isCurrent
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300'
        ]"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="text-sm font-medium">{{ entry.action }}</div>
            <div v-if="entry.odds" class="text-xs mt-1" :class="getOddsColorClass(entry.odds.probability, entry.isCurrent)">
              <span>{{ entry.odds.formatted }}</span>
              <span :class="entry.isCurrent ? 'text-blue-200 ml-2' : 'text-gray-400 ml-2'">({{ entry.odds.oddsRatio }})</span>
              <span v-if="entry.odds.dice" :class="entry.isCurrent ? 'text-blue-200 ml-2' : 'text-gray-400 ml-2'">
                [{{ entry.odds.dice.join(', ') }}]
              </span>
            </div>
          </div>
          <div v-if="entry.isCurrent" class="ml-2 text-xs">Current</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  historyEntries: {
    type: Array,
    required: true
  }
})

function getOddsColorClass(probability, isCurrent) {
  // Use a simple, readable color scheme that works on both backgrounds
  // For better readability, use consistent colors with good contrast
  if (isCurrent) {
    // For current entry (blue-600 background), use white/light gray for readability
    return 'text-white opacity-90'
  } else {
    // For normal entries (gray-700 background), use a light gray that's readable
    return 'text-gray-300'
  }
}
</script>

