<script setup>
import { useStationsStore } from '@/stores/stations'
const stationsStore = useStationsStore()
</script>

<template>
  <div class="bg-white p-6 rounded shadow ">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Estaciones Registradas</h2>
      <RouterLink class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        :to="{name: 'new-station'}"
      >
        Registrar Nueva Estación
      </RouterLink>
    </div>

    <table class="min-w-full text-left">
      <thead>
        <tr class="border-b">
          <th class="py-2">Nombre</th>
          <th class="py-2">Horario</th>
          <th class="py-2">Dirección</th>
          <th class="py-2">Combustibles</th>
          <th class="py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="station in stationsStore.stations" :key="station._id" class="border-b hover:bg-gray-50">
          <td class="py-2">{{ station.name }}</td>
          <td class="py-2">{{ station.hour }}</td>
          <td class="py-2">{{ station.address }}</td>
          <td class="py-2">
            <ul class="list-disc list-inside">
              <li v-for="fuel in station.fuels" :key="fuel.type">{{ fuel.type }}</li>
            </ul>
          </td>
          <td class="py-2 space-x-4">
            <button class="text-blue-600 hover:underline">Editar</button>
            <button class="text-red-600 hover:underline">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
