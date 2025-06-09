<template>
    <div class="max-w-3xl mx-auto p-6">
      <h1 class="text-2xl font-bold mb-6 text-blue-700">Actualizar Combustible</h1>
  
      <!-- Sección de estaciones asignadas para usuarios gasolinera -->
      <div v-if="userStore.user.rol === 'gasolinera'" class="mb-8 bg-blue-50 p-4 rounded-lg">
        <h2 class="text-lg font-semibold mb-3 text-blue-700">Mis Estaciones Asignadas</h2>
        <div v-if="estacionesAsignadas.length" class="grid gap-3">
          <div v-for="estacion in estacionesAsignadas" :key="estacion._id" 
               class="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
            <h3 class="font-medium text-blue-800">{{ estacion.name }}</h3>
            <p class="text-sm text-gray-600">{{ estacion.address }}</p>
            <div class="mt-2 text-sm">
              <span class="text-gray-700">Combustibles disponibles:</span>
              <ul class="list-disc list-inside text-gray-600">
                <li v-for="fuel in estacion.fuels" :key="fuel.type">
                  {{ fuel.type }}: {{ fuel.available }}/{{ fuel.capacity }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p v-else class="text-gray-600 italic">No tienes estaciones asignadas</p>
      </div>
  
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
        <p class="text-sm text-gray-600 mb-2">Dirección: {{ estacionSeleccionada.address }}</p>
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
          :max="combustibleSeleccionado.capacity"
          class="w-full px-4 py-2 border rounded-lg mb-4"
        />
        <div class="flex items-center gap-2 mb-4">
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              class="bg-blue-600 h-2.5 rounded-full" 
              :style="{ width: `${(nuevaCantidad || combustibleSeleccionado.available) / combustibleSeleccionado.capacity * 100}%` }"
            ></div>
          </div>
          <span class="text-sm text-gray-600">
            {{ Math.round((nuevaCantidad || combustibleSeleccionado.available) / combustibleSeleccionado.capacity * 100) }}%
          </span>
        </div>
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
  import { ref, computed, onMounted } from 'vue'
  import { useStationsStore } from '@/stores/stations'
  import { useUserStore } from '@/stores/user'
  import StationAPI from '@/api/StationAPI'
  import { useToast } from 'vue-toast-notification'
  
  const toast = useToast()
  const store = useStationsStore()
  const userStore = useUserStore()
  const busqueda = ref('')
  const resultados = ref([])
  const estacionSeleccionada = ref(null)
  const combustibleSeleccionado = ref(null)
  const nuevaCantidad = ref(null)

  // Computed para obtener las estaciones asignadas al usuario
  const estacionesAsignadas = computed(() => {
    if (userStore.user.rol === 'gasolinera') {
      return store.stations.filter(station => 
        station.assigned_users?.some(user => user._id === userStore.user._id)
      )
    }
    return []
  })

  // Computed para filtrar estaciones según el rol
  const estacionesDisponibles = computed(() => {
    if (userStore.user.rol === 'admin') {
      return store.stations
    } else if (userStore.user.rol === 'gasolinera') {
      return estacionesAsignadas.value
    }
    return []
  })
  
  const filtrarEstaciones = () => {
    if (!busqueda.value.trim()) {
      resultados.value = []
      return
    }
    const termino = busqueda.value.toLowerCase()
    resultados.value = estacionesDisponibles.value.filter(est =>
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

      // Validar que la cantidad no exceda la capacidad
      if (nuevaCantidad.value > combustibleSeleccionado.value.capacity) {
        toast.error(`La cantidad no puede exceder la capacidad máxima de ${combustibleSeleccionado.value.capacity}`)
        return
      }

      // Validar que la cantidad no sea negativa
      if (nuevaCantidad.value < 0) {
        toast.error('La cantidad no puede ser negativa')
        return
      }

      // Validar permisos
      if (userStore.user.rol === 'gasolinera' && 
          !estacionSeleccionada.value.assigned_users?.some(user => user._id === userStore.user._id)) {
        toast.error('No tienes permiso para actualizar esta estación')
        return
      }
  
      await StationAPI.updateFuel(estacionSeleccionada.value._id, {
        fuelType: combustibleSeleccionado.value.type,
        available: nuevaCantidad.value
      })
  
      toast.success('Cantidad actualizada correctamente')
      await store.fetchStations()
      
      // Resetear el formulario
      estacionSeleccionada.value = null
      combustibleSeleccionado.value = null
      nuevaCantidad.value = null
      busqueda.value = ''

    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al actualizar la cantidad')
      console.error(error)
    }
  }

  onMounted(async () => {
    await store.fetchStations()
  })
  </script>
  
  <style scoped>
  </style>
  