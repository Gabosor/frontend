<script setup>
import { ref, onMounted, computed } from 'vue';
import UserAPI from '@/api/UserAPI';
import { inject } from 'vue';

const toast = inject('toast');
const users = ref([]);
const loading = ref(true);
const searchQuery = ref('');

const fetchUsers = async () => {
  loading.value = true;
  try {
    const { data } = await UserAPI.getUsers();
    users.value = data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    toast.error('Error al obtener usuarios');
  } finally {
    loading.value = false;
  }
};

const roles = ['admin', 'gasolinera', 'usuario'];

const updateUserRole = async (userId, newRole) => {
  try {
    // Validación del rol
    if (!roles.includes(newRole)) {
      toast.error('Rol no válido');
      return;
    }

    // Validación adicional para el rol de gasolinera
    if (newRole === 'gasolinera') {
      const user = users.value.find(u => u._id === userId);
      if (!user) {
        toast.error('Usuario no encontrado');
        return;
      }
    }

    // Actualizar el rol
    const response = await UserAPI.updateRole(userId, newRole);
    
    if (response.data) {
      toast.success('Rol actualizado correctamente');
      // Actualizar el usuario en la lista local
      const index = users.value.findIndex(u => u._id === userId);
      if (index !== -1) {
        users.value[index].rol = newRole;
      }
    } else {
      throw new Error('No se recibió respuesta del servidor');
    }
  } catch (error) {
    console.error('Error al actualizar el rol:', error);
    toast.error(error.response?.data?.message || 'Error al actualizar el rol');
    // Revertir el cambio en la UI
    await fetchUsers();
  }
};

onMounted(fetchUsers);

const currentPage = ref(1);
const itemsPerPage = 10;

const filteredUsers = computed(() => {
  return users.value.filter(user => 
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredUsers.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredUsers.value.length / itemsPerPage));
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
</script>

<template>
  <div class="bg-white p-8 rounded-2xl shadow-lg">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Gestión de Roles de Usuarios</h2>
      <div class="flex items-center space-x-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre o email..."
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

    <div v-else-if="filteredUsers.length === 0" class="text-center py-8 text-gray-500">
      No se encontraron usuarios
    </div>

    <div v-else>
      <div class="overflow-x-auto">
        <table class="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr class="bg-gray-50 text-gray-600 uppercase text-sm">
              <th class="py-3 px-4 text-left">Nombre</th>
              <th class="py-3 px-4 text-left">Email</th>
              <th class="py-3 px-4 text-left">Rol Actual</th>
              <th class="py-3 px-4 text-left">Actualizar Rol</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in paginatedUsers"
              :key="user._id"
              class="bg-white shadow hover:shadow-md transition-shadow duration-200"
            >
              <td class="py-3 px-4 font-semibold">{{ user.name }}</td>
              <td class="py-3 px-4">{{ user.email }}</td>
              <td class="py-3 px-4">
                <span
                  :class="{
                    'bg-purple-100 text-purple-800': user.rol === 'admin',
                    'bg-blue-100 text-blue-800': user.rol === 'gasolinera',
                    'bg-green-100 text-green-800': user.rol === 'usuario'
                  }"
                  class="px-3 py-1 rounded-full text-sm font-medium capitalize"
                >
                  {{ user.rol }}
                </span>
              </td>
              <td class="py-3 px-4">
                <select
                  :value="user.rol"
                  @change="updateUserRole(user._id, $event.target.value)"
                  class="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option v-for="role in roles" :key="role" :value="role" class="capitalize">
                    {{ role }}
                  </option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Mostrando {{ paginatedUsers.length }} de {{ filteredUsers.length }} usuarios
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
