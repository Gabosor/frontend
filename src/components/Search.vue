<script lang="ts" setup>
</script>

<template>
  <div class="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-6xl border">
    <form @submit.prevent="() => {}">
      <div class="flex flex-col md:flex-row gap-3 md:gap-4 items-center bg-white shadow-lg p-3 rounded-full border border-gray-200">
        <input
          type="text"
          name="location"
          placeholder="Nombre de una estación"
          class="pl-10 pr-4 py-2 w-full text-center md:w-1/3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500"
        />
        <select
          name="fuel"
          class="pl-10 pr-4 py-2 w-full md:w-1/3 border border-gray-300 rounded-full text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none placeholder-gray-500"
        >
          <option disabled selected class=" text-center">Tipo de combustible</option>
          <option value="gasolina">Gasolina</option>
          <option value="diesel-uls">Diésel ULS +</option>
          <option value="diesel-premium">Diésel Premium</option>
        </select>
        <button
          type="submit"
          class="pl-10 pr-4 py-2 w-full md:w-1/3 bg-white border border-green-600 text-green-700 font-medium rounded-full text-sm shadow-sm hover:bg-green-50 transition duration-200"
        >
          Buscar
        </button>
      </div>
    </form>
  </div>
</template>
