<template>
  <aside class="bg-gray-800 text-white w-64 h-screen fixed left-0 top-0 px-6 py-8">
    <h2 class="text-2xl font-bold mb-8">Admin Panel</h2>
    <nav class="flex flex-col space-y-4 text-center font-bold">
      <RouterLink :to="{name: 'stations'}" class="hover:text-blue-400">Estaciones</RouterLink>
      <RouterLink :to="{name: 'services'}" class="hover:text-blue-400">Servicios</RouterLink>
    </nav>
  </aside>

</template>
