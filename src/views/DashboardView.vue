<script setup>
import StationTable from '@/components/StationTable.vue'
import SidebarAdmin from '@/components/SidebarAdmin.vue';
import HeaderAdmin from '@/components/HeaderAdmin.vue';
import { ref, onMounted, computed } from 'vue';
import { useStationsStore } from '@/stores/stations';
import { useServicesStore } from '@/stores/services';
import { useRoute } from 'vue-router';
import DashboardStats from '@/components/DashboardStats.vue';

const route = useRoute();
const stationsStore = useStationsStore();
const servicesStore = useServicesStore();
const loading = ref(true);

const showDashboard = computed(() => {
  return route.name === 'stations' || route.name === 'services';
});

onMounted(async () => {
  try {
    await Promise.all([
      stationsStore.fetchStations(),
      servicesStore.fetchServices()
    ]);
  } catch (error) {
    console.error('Error al cargar datos:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <SidebarAdmin />
    <HeaderAdmin />
    
    <div class="ml-64 pt-16 px-6">
      <!-- Dashboard Overview -->
      <DashboardStats v-if="showDashboard" class="mb-6" />

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <!-- Content Area -->
      <div v-else class="transition-all duration-300 ease-in-out">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
