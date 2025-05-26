<script setup>
import { useStationsStore } from '@/stores/stations';
import { useServicesStore } from '@/stores/services';
const stationsStore = useStationsStore();
const servicesStore = useServicesStore();
</script>
<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
    <!-- Total Estaciones -->
    <div class="bg-white p-6 rounded-xl shadow flex items-center justify-between">
      <div>
        <p class="text-gray-500 text-sm">Total Estaciones</p>
        <h3 class="text-2xl font-bold text-gray-800">{{ stationsStore.stations.length }}</h3>
      </div>
      <div class="p-3 bg-blue-100 rounded-xl">
        <i class="fas fa-gas-pump text-blue-500 text-2xl"></i>
      </div>
    </div>
    <!-- Total Servicios -->
    <div class="bg-white p-6 rounded-xl shadow flex items-center justify-between">
      <div>
        <p class="text-gray-500 text-sm">Total Servicios</p>
        <h3 class="text-2xl font-bold text-gray-800">{{ servicesStore.services.length }}</h3>
      </div>
      <div class="p-3 bg-green-100 rounded-xl">
        <i class="fas fa-concierge-bell text-green-500 text-2xl"></i>
      </div>
    </div>
    <!-- Total Usuarios (estático) -->
    <div class="bg-white p-6 rounded-xl shadow flex items-center justify-between">
      <div>
        <p class="text-gray-500 text-sm">Usuarios registrados</p>
        <h3 class="text-2xl font-bold text-gray-800">12</h3>
      </div>
      <div class="p-3 bg-gray-100 rounded-xl">
        <i class="fas fa-users text-gray-500 text-2xl"></i>
      </div>
    </div>
  </div>
</template> 