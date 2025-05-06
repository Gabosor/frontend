<script setup>

import StationTable from '@/components/StationTable.vue'
import SidebarAdmin from '@/components/SidebarAdmin.vue';
import HeaderAdmin from '@/components/HeaderAdmin.vue';
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <SidebarAdmin />
    <HeaderAdmin />
     <div class="ml-64 mt-12 px-6">
      <router-view />
    </div>
  </div>
  
</template>
