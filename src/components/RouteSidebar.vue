<template>
  <!-- Botón flotante para mostrar/ocultar el panel -->
<!-- Botón flotante -->
  <button
    v-if="!visible"
    @click="visible = !visible"
    class="fixed top-20 left-2 z-[1100] bg-green-600 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition"
  >
    <i :class="visible ? 'fas fa-chevron-left' : 'fas fa-chevron-right'">+</i>
  </button>

  <button
    v-if="visible"
    @click="visible = !visible"
    class="fixed top-3 left-80 z-[1100] bg-red-600 text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition"
  >
    <i :class="visible ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"></i>x
  </button>

  <!-- Panel lateral izquierdo -->
  <div
    v-if="visible"
    class="absolute top-0 left-0 z-[1000] h-full w-96 bg-white border-r border-gray-300 shadow-xl overflow-y-auto p-5"
  >
    <div class="mb-6 border-b pb-3 flex justify-between items-center">
      <h2 class="text-xl font-semibold">Ruta detallada</h2>
      <button @click="$emit('close')" class="text-gray-500 hover:text-red-600 text-lg">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Info general -->
    <div class="text-sm text-gray-600 mb-5">
      <strong>{{ (distance / 1000).toFixed(1) }} km</strong> •
      <strong>{{ Math.round(duration / 60) }} min</strong>
    </div>

    <!-- Lista de pasos -->
    <ul class="space-y-5">
      <li
        v-for="(step, index) in steps"
        :key="index"
        class="flex gap-4 items-start"
      >
        <div
          class="bg-gray-200 text-gray-700 rounded-full w-9 h-9 flex items-center justify-center text-base font-bold"
        >
          {{ getIcon(step.maneuver.type, step.maneuver.modifier) }}
        </div>
        <div class="flex-1">
          <div class="text-[15px] font-medium leading-snug">
            <template v-if="index === 0">
              Ubicación actual: {{ step.maneuver.instruction }}
            </template>
            <template v-else-if="index === steps.length - 1">
              Destino: {{ step.maneuver.instruction }}
            </template>
            <template v-else>
              {{ step.maneuver.instruction }}
            </template>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ step.name || 'Sin nombre de calle' }} • {{ Math.round(step.distance) }} m
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
const props = defineProps({
  steps: Array,
  distance: Number,
  duration: Number,
})
const visible = ref(false)
const getIcon = (type, modifier) => {
  const icons = {
    depart: 'A',
    arrive: '🏁',
    roundabout: '🌀',
    merge: '🔀',
    ramp: '↪️',
    fork: '🔀',
    end_of_road: '🔚',
    use_lane: '🚗',
    turn: {
      left: '⬅️',
      right: '➡️',
      straight: '⬆️',
      slight_left: '↖️',
      slight_right: '↗️',
      sharp_left: '↙️',
      sharp_right: '↘️',
    },
  }
  if (type === 'turn') {
    return icons.turn[modifier] || '➡️'
  }
  return icons[type] || '➡️'
}
</script>

<style scoped>
</style>
