<script setup>
import { ref, onMounted, computed } from 'vue';
import StationAPI from '@/api/StationAPI';
import UserAPI from '@/api/UserAPI';
import { inject } from 'vue';

const toast = inject('toast');
const stations = ref([]);
const users = ref([]);
const loading = ref(true);
const searchQuery = ref('');

const fetchData = async () => {
  loading.value = true;
  try {
    const [stationsResponse, usersResponse] = await Promise.all([
      StationAPI.all(),
      UserAPI.getUsers()
    ]);
    
    stations.value = stationsResponse.data;
    // Filtrar solo usuarios con rol de gasolinera
    users.value = usersResponse.data.filter(user => user.rol === 'gasolinera');
  } catch (error) {
    console.error('Error al obtener datos:', error);
    toast.error('Error al cargar los datos');
  } finally {
    loading.value = false;
  }
};

const assignStation = async (stationId, userId) => {
  try {
    await StationAPI.assignStation(stationId, { userId, action: 'add' });
    toast.success('Usuario asignado correctamente');
    await fetchData(); // Recargar datos
  } catch (error) {
    console.error('Error al asignar usuario:', error);
    toast.error('Error al asignar el usuario');
  }
};

const removeAssignment = async (stationId, userId) => {
  try {
    await StationAPI.assignStation(stationId, { userId, action: 'remove' });
    toast.success('Usuario removido correctamente');
    await fetchData(); // Recargar datos
  } catch (error) {
    console.error('Error al remover usuario:', error);
    toast.error('Error al remover el usuario');
  }
};

onMounted(fetchData);

const currentPage = ref(1);
const itemsPerPage = 10;

const filteredStations = computed(() => {
  return stations.value.filter(station => 
    station.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const paginatedStations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredStations.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredStations.value.length / itemsPerPage));
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const resetSearch = () => {
  searchQuery.value = '';
  currentPage.value = 1;
};

// Función para verificar si un usuario ya está asignado a una estación
const isUserAssigned = (station, userId) => {
  return station.assigned_users?.some(user => user._id === userId);
};
</script>

<template>
  <div class="bg-white p-8 rounded-2xl shadow-lg">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Gestión de Asignación de Estaciones</h2>
      <div class="flex items-center space-x-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre o dirección..."
            class="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            @input="currentPage = 1"
          />
          <svg
            class="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          v-if="searchQuery"
          @click="resetSearch"
          class="text-gray-600 hover:text-gray-800"
        >
          Limpiar
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="filteredStations.length === 0" class="text-center py-8 text-gray-500">
      No se encontraron estaciones
    </div>

    <div v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr class="bg-gray-50 text-gray-600 uppercase text-sm">
              <th class="py-3 px-4 text-left">Nombre</th>
              <th class="py-3 px-4 text-left">Dirección</th>
              <th class="py-3 px-4 text-left">Usuarios Asignados</th>
              <th class="py-3 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="station in paginatedStations"
              :key="station._id"
              class="bg-white shadow hover:shadow-md transition-shadow duration-200"
            >
              <td class="py-3 px-4 font-semibold">{{ station.name }}</td>
              <td class="py-3 px-4">{{ station.address }}</td>
              <td class="py-3 px-4">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="user in station.assigned_users"
                    :key="user._id"
                    class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 flex items-center gap-2"
                  >
                    <div class="flex flex-col">
                      <span class="font-semibold">{{ user.name }}</span>
                      <span class="text-xs text-blue-600">{{ user.email }}</span>
                    </div>
                    <button
                      @click="removeAssignment(station._id, user._id)"
                      class="text-blue-600 hover:text-blue-800 ml-1"
                      title="Remover usuario"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                  <span
                    v-if="!station.assigned_users?.length"
                    class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    Sin usuarios asignados
                  </span>
                </div>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center space-x-2">
                  <select
                    v-model="selectedUser"
                    @change="assignStation(station._id, selectedUser)"
                    class="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar usuario</option>
                    <option
                      v-for="user in users"
                      :key="user._id"
                      :value="user._id"
                      :disabled="isUserAssigned(station, user._id)"
                    >
                      {{ user.name }}
                    </option>
                  </select>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Mostrando {{ paginatedStations.length }} de {{ filteredStations.length }} estaciones
        </div>
        <div class="flex gap-2 items-center">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Anterior
          </button>

          <span class="text-sm text-gray-600">
            Página {{ currentPage }} de {{ totalPages }}
          </span>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 