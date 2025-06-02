<template>
    <div class="max-w-3xl mx-auto p-6">
      <h1 class="text-2xl font-bold mb-6 text-blue-700">Actualizar Combustible</h1>
  
      <!-- Selección de estación -->
      <div class="mb-6">
        <label class="block mb-2 text-sm font-medium text-gray-700">Buscar estación</label>
        <input
          type="text"
          v-model="busqueda"
          @input="filtrarEstaciones"
          placeholder="Nombre o dirección..."
          class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
        <ul v-if="resultados.length" class="mt-2 border rounded-lg divide-y max-h-48 overflow-y-auto">
          <li
            v-for="estacion in resultados"
            :key="estacion._id"
            @click="seleccionarEstacion(estacion)"
            class="px-4 py-2 cursor-pointer hover:bg-blue-50"
          >
            {{ estacion.name }} - {{ estacion.address }}
          </li>
        </ul>
      </div>
  
      <!-- Mostrar información y seleccionar tipo de combustible -->
      <div v-if="estacionSeleccionada" class="mb-6">
        <h2 class="text-lg font-semibold mb-2 text-blue-600">Estación: {{ estacionSeleccionada.name }}</h2>
        <label class="block mb-2 text-sm font-medium text-gray-700">Tipo de combustible</label>
        <select v-model="combustibleSeleccionado" class="w-full px-4 py-2 border rounded-lg">
          <option disabled value="">Seleccione un tipo</option>
          <option v-for="f in estacionSeleccionada.fuels" :key="f.type" :value="f">
            {{ f.type }} (Disponible: {{ f.available }} / Capacidad: {{ f.capacity }})
          </option>
        </select>
      </div>
  
      <!-- Actualizar disponibilidad -->
      <div v-if="combustibleSeleccionado">
        <label class="block mb-2 text-sm font-medium text-gray-700">Nueva cantidad disponible</label>
        <input
          type="number"
          v-model.number="nuevaCantidad"
          :placeholder="combustibleSeleccionado.available"
          class="w-full px-4 py-2 border rounded-lg mb-4"
        />
        <button
          @click="actualizarCombustible"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Actualizar
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useStationsStore } from '@/stores/stations'
  import StationAPI from '@/api/StationAPI'
  import { useToast } from 'vue-toast-notification'
  
  const toast = useToast()
  const store = useStationsStore()
  const busqueda = ref('')
  const resultados = ref([])
  const estacionSeleccionada = ref(null)
  const combustibleSeleccionado = ref(null)
  const nuevaCantidad = ref(null)
  
  const filtrarEstaciones = () => {
    if (!busqueda.value.trim()) {
      resultados.value = []
      return
    }
    const termino = busqueda.value.toLowerCase()
    resultados.value = store.stations.filter(est =>
      est.name.toLowerCase().includes(termino) ||
      (est.address || '').toLowerCase().includes(termino)
    )
  }
  
  const seleccionarEstacion = (estacion) => {
    estacionSeleccionada.value = estacion
    resultados.value = []
    busqueda.value = estacion.name
    combustibleSeleccionado.value = ''
    nuevaCantidad.value = null
  }
  
  const actualizarCombustible = async () => {
    try {
      if (!estacionSeleccionada.value || !combustibleSeleccionado.value || nuevaCantidad.value == null) {
        toast.warning('Por favor, complete todos los campos.')
        return
      }
  
      await StationAPI.updateFuel(estacionSeleccionada.value._id, {
        fuelType: combustibleSeleccionado.value.type,
        available: nuevaCantidad.value
      })
  
      toast.success('Cantidad actualizada correctamente')
      await store.fetchStations()
      estacionSeleccionada = ''


    } catch (error) {
      toast.error(error.response.data.mensaje)
      console.error(error)
    }
  }
  </script>
  
  <style scoped>
  </style>
  