<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="close"
  >
    <div class="bg-gray-800 rounded-lg p-6 max-w-md ipad:max-w-2xl ipad-pro:max-w-3xl w-full space-y-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold">Credits</h2>
        <button
          @click="close"
          class="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full text-xl font-bold transition-colors touch-target"
        >
          ×
        </button>
      </div>
      
      <div class="space-y-4 text-sm">
        <div>
          <p class="text-gray-300">
            Game idea by <strong class="text-white">Braylon Thomas</strong>
          </p>
        </div>
        
        <div>
          <p class="text-gray-300">
            Site made by <strong class="text-white">Ian Jones</strong>
          </p>
        </div>
      </div>
      
      <button
        @click="close"
        class="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors touch-target mt-4"
      >
        Close
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<style scoped>
/* Modal overlay styles */
</style>

