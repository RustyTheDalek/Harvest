<template>
  <div class="w-full bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
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
            <div class="text-xs opacity-75">{{ formatTime(entry.timestamp) }}</div>
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

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}
</script>

