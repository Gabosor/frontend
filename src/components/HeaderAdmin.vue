<script setup>
import { useUserStore } from '@/stores/user';

const user = useUserStore();

</script>

<template>
  <header class="ml-64 bg-white shadow px-6 py-4 flex justify-between items-center">
    <div>
      <h1 class="text-xl font-bold">Bienvenido, <span class=" text-blue-500">{{ user.getUserName }}</span> </h1>
      <p class="text-sm text-gray-500">{{ user.getUserEmail }}</p>
    </div>
    <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      @click="user.logout"
    >Cerrar Sesión</button>

  </header>
</template>
