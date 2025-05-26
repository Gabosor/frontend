<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const user = useUserStore();
const currentRoute = ref(router.currentRoute.value.name);

const menuSections = [
  {
    title: 'Principal',
    items: [
      { name: 'dashboard-stats', icon: 'fas fa-home', label: 'Dashboard' },
    ],
  },
  {
    title: 'Mostrar registros',
    items: [
      { name: 'stations', icon: 'fas fa-gas-pump', label: 'Estaciones' },
      { name: 'services', icon: 'fas fa-concierge-bell', label: 'Servicios' },
    ],
  },
  {
    title: 'Registrar',
    items: [
      { name: 'new-station', icon: 'fas fa-plus-circle', label: 'Nueva Estación' },
      { name: 'new-service', icon: 'fas fa-plus', label: 'Nuevo Servicio' },
    ],
  },
];
</script>

<template>
  <aside class="bg-gradient-to-b from-blue-50 to-white border-r border-gray-200 w-64 h-screen fixed left-0 top-0 shadow-lg flex flex-col">
    <div class="px-6 py-6 flex-grow">
      <div class="flex items-center gap-3 mb-8">
        <img src="/imageLogo.png" alt="Logo" class="w-12 h-12 shadow rounded-full border-2 border-blue-200">
        <div>
          <h2 class="text-2xl font-extrabold text-blue-700">Admin Panel</h2>
          <p class="text-xs text-blue-400">Sistema de Gestión</p>
        </div>
      </div>

      <nav class="space-y-6">
        <div v-for="section in menuSections" :key="section.title">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2">{{ section.title }}</h3>
          <div class="space-y-1">
            <RouterLink
              v-for="item in section.items"
              :key="item.name"
              :to="{ name: item.name }"
              class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200"
              :class="[
                currentRoute === item.name
                  ? 'bg-blue-100 text-blue-700 font-semibold shadow'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
              ]"
            >
              <i :class="[item.icon, 'w-5 text-center text-lg']"></i>
              <span class="font-medium">{{ item.label }}</span>
            </RouterLink>
          </div>
          <div class="my-4 border-b border-gray-100"></div>
        </div>
      </nav>
    </div>

    <!-- Footer -->
    <div class="p-6 border-t bg-blue-50">
        <button
          @click="user.logout"
          class="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors font-semibold"
        >
          <i class="fas fa-sign-out-alt"></i>
          <span>Cerrar Sesión</span>
        </button>
    </div>
  </aside>
</template>

<style scoped>
.router-link-active {
  @apply bg-blue-50 text-blue-600;
}
</style>
