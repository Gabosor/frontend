<script setup>
const user = {
  name: 'Juan Pérez',
  email: 'juan@example.com'
}
</script>

<template>
  <header class="ml-64 bg-white shadow px-6 py-4 flex justify-between items-center">
    <div>
      <h1 class="text-xl font-bold">Bienvenido, {{ user.name }}</h1>
      <p class="text-sm text-gray-500">{{ user.email }}</p>
    </div>
    <button class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Cerrar Sesión</button>
  </header>
</template>
