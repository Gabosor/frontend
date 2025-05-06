<script setup>
import { useServicesStore } from '@/stores/services'
const servicesStore = useServicesStore()
</script>

<template>
  <div class="bg-white p-6 rounded shadow">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Servicios Registrados</h2>
      <RouterLink :to="{name: 'new-service'}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Registrar Nuevo Servicio
      </RouterLink>
    </div>

    <table class="min-w-full text-left">
      <thead>
        <tr class="border-b">
          <th class="py-2">Nombre</th>
          <th class="py-2">Categoría</th>
          <th class="py-2">Dirección</th>
          <th class="py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="service in servicesStore.services"
          :key="service._id"
          class="border-b hover:bg-gray-50"
        >
          <td class="py-2">{{ service.name }}</td>
          <td class="py-2 capitalize">{{ service.category }}</td>
          <td class="py-2">{{ service.address }}</td>
          <td class="py-2 space-x-4">
            <button class="text-blue-600 hover:underline">Editar</button>
            <button class="text-red-600 hover:underline">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
