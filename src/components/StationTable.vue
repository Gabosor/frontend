<script setup>
import { useStationsStore } from '@/stores/stations'
import { ref, computed } from 'vue'
const stationsStore = useStationsStore()

const search = ref('')
const selectedFuel = ref('')

function fuelBadgeClass(type) {
  switch (type.toLowerCase()) {
    case 'gasolina':
      return 'bg-blue-100 text-blue-800';
    case 'diesel':
      return 'bg-yellow-100 text-yellow-800';
    case 'gasolina premium':
      return 'bg-green-100 text-green-800';
    case 'diesel uls':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

const allFuels = computed(() => {
  const fuels = new Set()
  stationsStore.stations.forEach(station => {
    station.fuels.forEach(fuel => fuels.add(fuel.type))
  })
  return Array.from(fuels)
})

const filteredStations = computed(() => {
  return stationsStore.stations.filter(station => {
    const matchesSearch =
      station.name.toLowerCase().includes(search.value.toLowerCase()) ||
      station.address.toLowerCase().includes(search.value.toLowerCase())
    const matchesFuel =
      !selectedFuel.value || station.fuels.some(fuel => fuel.type === selectedFuel.value)
    return matchesSearch && matchesFuel
  })
})
</script>

<template>
  <div class="bg-white p-8 rounded-2xl shadow-lg">
    <h2 class="text-xl font-bold mb-4">Estaciones Registradas</h2>
    <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
    
      <div class="flex items-center gap-2">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nombre o dirección..."
          class="px-4 py-2 rounded-lg border border-gray-300 focus:ring focus:ring-blue-100 focus:border-blue-400 outline-none w-64"
        />
        <select
          v-model="selectedFuel"
          class="px-4 py-2 rounded-lg border border-gray-300 focus:ring focus:ring-blue-100 focus:border-blue-400 outline-none"
        >
          <option value="">Todos los combustibles</option>
          <option v-for="fuel in allFuels" :key="fuel" :value="fuel">{{ fuel }}</option>
        </select>
      </div>
      <RouterLink class="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
        :to="{name: 'new-station'}"
      >
        <i class="fas fa-plus mr-2"></i> Registrar Nueva Estación
      </RouterLink>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr class="bg-gray-50 text-gray-600 uppercase text-sm">
            <th class="py-3 px-4 rounded-l-xl">Nombre</th>
            <th class="py-3 px-4">Horario</th>
            <th class="py-3 px-4">Dirección</th>
            <th class="py-3 px-4">Combustibles</th>
            <th class="py-3 px-4 rounded-r-xl">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="station in filteredStations" :key="station._id" class="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl text-gray-700">
            <td class="py-3 px-4 font-semibold">{{ station.name }}</td>
            <td class="py-3 px-4">{{ station.hour }}</td>
            <td class="py-3 px-4">{{ station.address }}</td>
            <td class="py-3 px-4">
              <div class="flex flex-wrap gap-2">
                <span v-for="fuel in station.fuels" :key="fuel.type" :class="'px-3 py-1 rounded-full text-xs font-semibold ' + fuelBadgeClass(fuel.type)">
                  {{ fuel.type }}
                </span>
              </div>
            </td>
            <td class="py-3 px-4 space-x-2 flex items-center">
              <button class="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors">
                Editar
              </button>
              <button class="text-red-600 hover:bg-red-50 p-2 rounded transition-colors">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
