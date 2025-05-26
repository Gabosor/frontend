<script setup>
import { useUserStore } from '@/stores/user';
import { ref } from 'vue';

const user = useUserStore();
const showUserMenu = ref(false);

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};
</script>

<template>
  <header class="fixed top-0 right-0 left-64 bg-white border-b border-gray-200 z-10">
    <div class="px-6 py-4 flex justify-between items-center">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>

      <div class="relative">
        <button
          @click="toggleUserMenu"
          class="flex items-center gap-3 text-gray-700 hover:text-gray-900 focus:outline-none"
        >
          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span class="text-blue-600 font-medium text-lg">
              {{ user.getUserName.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div class="text-left">
            <p class="font-medium">{{ user.getUserName }}</p>
            <p class="text-sm text-gray-500">{{ user.getUserEmail }}</p>
          </div>
          <i class="fas fa-chevron-down ml-2"></i>
        </button>

        <!-- User Menu Dropdown -->
        <div
          v-if="showUserMenu"
          class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100"
        >
          <a
            href="#"
            class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            <i class="fas fa-user-circle mr-2"></i>
            Mi Perfil
          </a>
          <a
            href="#"
            class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            <i class="fas fa-cog mr-2"></i>
            Configuración
          </a>
          <hr class="my-2 border-gray-100">
          <button
            @click="user.logout"
            class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <i class="fas fa-sign-out-alt mr-2"></i>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.router-link-active {
  @apply bg-gray-100;
}
</style>
