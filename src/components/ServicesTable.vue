<script setup>
import { useServicesStore } from '@/stores/services'
import { ref, computed } from 'vue'
const servicesStore = useServicesStore()

const search = ref('')
const selectedCategory = ref('')

function categoryBadgeClass(category) {
  switch (category) {
    case 'restaurante':
      return 'bg-green-100 text-green-800';
    case 'baño':
      return 'bg-blue-100 text-blue-800';
    case 'tienda':
      return 'bg-yellow-100 text-yellow-800';
    case 'cajero':
      return 'bg-purple-100 text-purple-800';
    case 'hotel':
      return 'bg-pink-100 text-pink-800';
    case 'hostal':
      return 'bg-gray-200 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

const allCategories = computed(() => {
  const cats = new Set()
  servicesStore.services.forEach(service => cats.add(service.category))
  return Array.from(cats)
})

const filteredServices = computed(() => {
  return servicesStore.services.filter(service => {
    const matchesSearch =
      service.name.toLowerCase().includes(search.value.toLowerCase()) ||
      service.address.toLowerCase().includes(search.value.toLowerCase())
    const matchesCategory =
      !selectedCategory.value || service.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})
</script>

<template>
  <div class="bg-white p-8 rounded-2xl shadow-lg">
    <h2 class="text-xl font-bold mb-4">Servicios Registrados</h2>
    <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
      <div class="flex items-center gap-2">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nombre o dirección..."
          class="px-4 py-2 rounded-lg border border-gray-300 focus:ring focus:ring-blue-100 focus:border-blue-400 outline-none w-64"
        />
        <select
          v-model="selectedCategory"
          class="px-4 py-2 rounded-lg border border-gray-300 focus:ring focus:ring-blue-100 focus:border-blue-400 outline-none"
        >
          <option value="">Todas las categorías</option>
          <option v-for="cat in allCategories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
      <RouterLink :to="{name: 'new-service'}" class="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors">
        <i class="fas fa-plus mr-2"></i> Registrar Nuevo Servicio
      </RouterLink>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr class="bg-gray-50 text-gray-600 uppercase text-sm">
            <th class="py-3 px-4 rounded-l-xl">Nombre</th>
            <th class="py-3 px-4">Categoría</th>
            <th class="py-3 px-4">Dirección</th>
            <th class="py-3 px-4 rounded-r-xl">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="service in filteredServices"
            :key="service._id"
            class="bg-white shadow-sm hover:shadow-md transition-shadow rounded-xl text-gray-700"
          >
            <td class="py-3 px-4 font-semibold">{{ service.name }}</td>
            <td class="py-3 px-4 capitalize">
              <span :class="'px-3 py-1 rounded-full text-xs font-semibold ' + categoryBadgeClass(service.category)">
                {{ service.category }}
              </span>
            </td>
            <td class="py-3 px-4">{{ service.address }}</td>
            <td class="py-3 px-4 space-x-2 flex items-center">
              <button class="text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors">
                Editar
              </button>
              <button class="text-red-600 hover:bg-red-50 p-2 rounded transition-colors" >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
