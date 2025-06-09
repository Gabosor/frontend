<script setup>
import {
  LMap,
  LTileLayer,
  LMarker,
  LIcon,
  LPopup,
  LPolyline,
  LGeoJson,
  LLayerGroup,
  LControl,
} from "@vue-leaflet/vue-leaflet"
import "leaflet/dist/leaflet.css"
import { ref, onMounted, computed, onUnmounted } from "vue"
import Search from "@/components/Search.vue"
import { useStationsStore } from "@/stores/stations"
import { useServicesStore } from "@/stores/services"
import useRouteMap from "@/composables/useRouteMap"
import * as turf from '@turf/turf'
import { inject } from "vue"
import RouteSidebar from "@/components/RouteSidebar.vue"
import StationAPI from "@/api/StationAPI"
import { useUserStore } from "@/stores/user"
const userStore = useUserStore()

const store = useStationsStore()
const servicesStore = useServicesStore()
const { from, to, route, calcularRuta, bufferGeoJson, steps, duration, distance } = useRouteMap()

const zoom = ref(15)
const center = ref([-17.973244, -67.106225])
const toast = inject('toast')
const API_URL = import.meta.env.VITE_BACKEND_URL

const showInstructions = ref(false)
const isMobileDrawerOpen = ref(false)

// Nuevos refs para filtros
const showStations = ref(true)
const showServices = ref(true)
const selectedFuelType = ref('all')
const selectedServiceType = ref('all')
const showRoute = ref(true)
const loading = ref(false)

// Añadir searchQuery
const searchQuery = ref('')
const availabilityRange = ref(0) // Nuevo ref para el rango de disponibilidad
const selectedFuels = ref([]) // Nuevo ref para múltiples combustibles

// Lista de tipos de combustible actualizada para coincidir con los valores almacenados
const fuelTypes = [
  { value: 'Gasolina', label: 'Gasolina', color: 'blue' },
  { value: 'Diesel', label: 'Diesel', color: 'yellow' },
  { value: 'Gasolina Premium', label: 'Gasolina Premium', color: 'green' },
  { value: 'Diesel ULS', label: 'Diesel ULS', color: 'purple' }
]

const serviceTypes = [
  { value: 'all', label: 'Todos los servicios' },
  { value: 'restaurante', label: 'Restaurantes' },
  { value: 'baño', label: 'Baños' },
  { value: 'tienda', label: 'Tiendas' },
  { value: 'cajero', label: 'Cajeros' },
  { value: 'hotel', label: 'Hoteles' },
  { value: 'hostal', label: 'Hostales' }
]

// Configuración del ícono por defecto
const userIcon = {
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}

// Agregar variable para el intervalo
let stationsIntervalId

// Modificar los refs para el buffer
const stationBuffers = ref({})
const bufferInfo = ref({})

// Función para crear el buffer
const createStationBuffer = async (station) => {
  try {
    const response = await StationAPI.getStationConcurrency(station._id)
    const { concurrencyCount, concurrencyLevel, radius, color } = response.data
    
    // Crear un círculo usando turf.js
    const center = [station.point.coordinates[1], station.point.coordinates[0]]
    const circle = turf.circle(center, radius / 1000, { 
      steps: 64, 
      units: 'kilometers',
      properties: {
        concurrencyCount,
        concurrencyLevel,
        radius,
        color
      }
    })
    
    // Guardar la información del buffer
    stationBuffers.value[station._id] = {
      circle,
      concurrencyCount,
      concurrencyLevel,
      radius,
      color
    }
  } catch (error) {
    console.error('Error al obtener la concurrencia:', error)
  }
}

// Modificar onMounted para crear los buffers automáticamente
onMounted(async () => {
  obtenerUbicacion()
  await Promise.all([
    store.fetchStations(),
    servicesStore.fetchServices()
  ])
  
  // Crear buffers para todas las estaciones
  for (const station of store.stations) {
    await createStationBuffer(station)
  }
  
  // Iniciar actualización automática cada 10 segundos
  stationsIntervalId = setInterval(async () => {
    await store.fetchStations()
    // Actualizar buffers para todas las estaciones
    for (const station of store.stations) {
      await createStationBuffer(station)
    }
  }, 10000)
})

// Agregar onUnmounted para limpiar el intervalo
onUnmounted(() => {
  if (stationsIntervalId) {
    clearInterval(stationsIntervalId)
  }
})

const obtenerUbicacion = () => {
  loading.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      const userPoint = [lat, lng]

      from.value = userPoint
      center.value = userPoint
      loading.value = false
      toast.success('Ubicación actualizada correctamente')
    },
    (error) => {
      loading.value = false
      // Definimos el punto de ubicación por defecto
      const defaultLocation = [-17.989048, -67.135683];

      switch(error.code) {
        case error.PERMISSION_DENIED:
          toast.error('Por favor, permite el acceso a tu ubicación para usar esta función. Se utilizará una ubicación por defecto.')
          // Si el permiso es denegado, usa la ubicación por defecto
          from.value = defaultLocation;
          center.value = defaultLocation;
          break
        case error.POSITION_UNAVAILABLE:
          toast.error('La información de ubicación no está disponible. Se utilizará una ubicación por defecto.')
          // Si la posición no está disponible, usa la ubicación por defecto
          from.value = defaultLocation;
          center.value = defaultLocation;
          break
        case error.TIMEOUT:
          toast.error('La solicitud de ubicación ha expirado. Se utilizará una ubicación por defecto.')
          // Si hay un timeout, usa la ubicación por defecto
          from.value = defaultLocation;
          center.value = defaultLocation;
          break
        default:
          toast.error('Error al obtener tu ubicación. Se utilizará una ubicación por defecto.')
          // Para cualquier otro error, usa la ubicación por defecto
          from.value = defaultLocation;
          center.value = defaultLocation;
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  )
}

const buscarEstacionCercana = async () => {
  if (!from.value) {
    obtenerUbicacion()
    return
  }
  
  loading.value = true
  try {
    const puntos = filteredStations.value
      .filter(st => st?.point?.coordinates?.length === 2)
      .map(st => turf.point(
        [st.point.coordinates[1], st.point.coordinates[0]],
        { ...st }
      ))
    
    if (!puntos.length) {
      toast.error('No hay estaciones disponibles con los filtros seleccionados')
      return
    }
    
    const featureCollection = turf.featureCollection(puntos)
    const userTurf = turf.point([from.value[1], from.value[0]])
    const nearest = turf.nearestPoint(userTurf, featureCollection)
    
    if (nearest?.geometry?.coordinates) {
      to.value = [nearest.geometry.coordinates[1], nearest.geometry.coordinates[0]]
       

      await calcularRuta()
      showRoute.value = true
      //showRoute.value = true
      showInstructions.value = true 
    }
  } catch (error) {
    toast.error('Error al buscar la estación más cercana')
  } finally {
    loading.value = false
  }
}

const getIconUrl = (category) => {
  const basePath = '/icons/'
  const icons = {
    restaurante: 'restaurante.svg',
    baño: 'banio.svg',
    tienda: 'tienda.svg',
    cajero: 'cajero.svg',
    hotel: 'hotel.svg',
    hostal: 'alojamiento.svg'
  }
  return `${basePath}${icons[category] || 'default.svg'}`
}

// Filtros computados mejorados
const filteredStations = computed(() => {
  if (!showStations.value) return []
  
  let filtered = store.stations

  // Filtrar por término de búsqueda
  if (searchQuery.value.trim()) {
    const searchTerm = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(station => 
      station.name.toLowerCase().includes(searchTerm) ||
      station.address?.toLowerCase().includes(searchTerm)
    )
  }

  // Filtrar por tipos de combustible seleccionados
  if (selectedFuels.value.length > 0) {
    filtered = filtered.filter(station => 
      station.fuels?.some(fuel => selectedFuels.value.includes(fuel.type))
    )
  }

  // Filtrar por disponibilidad mínima
  if (availabilityRange.value > 0) {
    filtered = filtered.filter(station => {
      // Si hay combustibles seleccionados, solo verificar esos
      if (selectedFuels.value.length > 0) {
        return selectedFuels.value.every(selectedFuel => {
          const fuel = station.fuels?.find(f => f.type === selectedFuel)
          return fuel && (fuel.available / fuel.capacity) * 100 >= availabilityRange.value
        })
      }
      // Si no hay combustibles seleccionados, verificar todos los combustibles
      return station.fuels?.every(fuel => 
        (fuel.available / fuel.capacity) * 100 >= availabilityRange.value
      )
    })
  }

  return filtered
})

// Filtrado de servicios mejorado
const filteredServices = computed(() => {
  if (!showServices.value) return []
  
  let filtered = servicesStore.services

  // Filtrar por término de búsqueda
  if (searchQuery.value.trim()) {
    const searchTerm = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(service => 
      service.name.toLowerCase().includes(searchTerm) ||
      service.address?.toLowerCase().includes(searchTerm)
    )
  }

  // Filtrar por tipo de servicio
  if (selectedServiceType.value !== 'all') {
    filtered = filtered.filter(service => 
      service.category.toLowerCase() === selectedServiceType.value.toLowerCase()
    )
  }

  return filtered
})

// Función para obtener la disponibilidad de un combustible específico
const getFuelAvailability = (station, fuelType) => {
  if (fuelType === 'all') return station.fuels[0]?.available || 0
  const fuel = station.fuels.find(f => f.type === fuelType) // Comparación exacta
  return fuel?.available || 0
}

// Función para obtener el estado del combustible
const getStationStatus = (station) => {
  const availability = getFuelAvailability(station, selectedFuelType.value)
  const capacity = station.fuels[0]?.capacity || 5000 // Capacidad por defecto
  const percentage = (availability / capacity) * 100

  if (percentage > 75) return 'bg-green-500'
  if (percentage > 25) return 'bg-yellow-500'
  return 'bg-red-500'
}

// Función para limpiar la búsqueda de estación cercana
const limpiarBusquedaCercana = () => {
  to.value = null
  route.value = []
  showRoute.value = false
  toast.success('Búsqueda de estación cercana eliminada')
}

// Agregar estas funciones después de getStationStatus
const getBatteryLevel = (available, capacity) => {
  const percentage = (available / capacity) * 100
  if (percentage >= 75) return 'bg-green-500'
  if (percentage >= 50) return 'bg-yellow-400'
  if (percentage >= 25) return 'bg-orange-400'
  return 'bg-red-500'
}

const fuelBadgeClass = (type) => {
  switch (type.toLowerCase()) {
    case 'gasolina': return 'bg-blue-100 text-blue-800'
    case 'diesel': return 'bg-yellow-100 text-yellow-800'
    case 'gasolina premium': return 'bg-green-100 text-green-800'
    case 'diesel uls': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-700'
  }
}


</script>

<template>
  <div class="relative h-screen w-screen">
    <!-- Panel de control responsivo -->
    <div class="hidden md:block absolute top-5 right-5 z-[1000] bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg w-96 space-y-4">
      <!-- Logo y título -->
      <div class="flex items-center gap-3 border-b pb-3">
        <img src="/imageLogo.png" alt="Logo" class="w-10 h-10 object-contain" />
        <div>
          <h3 class="font-semibold text-lg">Filtros de búsqueda</h3>
          <p class="text-xs text-gray-500">Encuentra estaciones y servicios</p>
        </div>
        <button
          @click="obtenerUbicacion"
          class="ml-auto text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition"
          :disabled="loading"
          title="Obtener mi ubicación"
        >
          <i class="fas fa-location-crosshairs"></i>
        </button>
      </div>

      <!-- Barra de búsqueda mejorada -->
      <div class="relative">
        <input
          type="text"
          placeholder="Buscar estación o servicio..."
          class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          v-model="searchQuery"
        />
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
      </div>

      <!-- Filtros de estaciones mejorados -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="showStations"
              class="form-checkbox"
              id="show-stations"
            />
            <label for="show-stations" class="text-sm font-medium flex items-center gap-2">
              <i class="fas fa-gas-pump text-green-600"></i>
              Estaciones
            </label>
          </div>
          <span class="text-xs text-gray-500">{{ filteredStations.length }} disponibles</span>
        </div>

        <!-- Filtro de combustibles múltiples -->
        <div v-if="showStations" class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Tipos de combustible</label>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="fuel in fuelTypes"
              :key="fuel.value"
              class="flex items-center gap-2"
            >
              <input
                type="checkbox"
                :value="fuel.value"
                v-model="selectedFuels"
                :id="'fuel-' + fuel.value"
                class="form-checkbox"
              />
              <label
                :for="'fuel-' + fuel.value"
                class="text-sm flex items-center gap-1"
              >
                <span
                  class="w-3 h-3 rounded-full"
                  :class="'bg-' + fuel.color + '-500'"
                ></span>
                {{ fuel.label }}
              </label>
            </div>
          </div>
        </div>

        <!-- Filtro de disponibilidad -->
        <div v-if="showStations" class="space-y-2">
          <div class="flex justify-between items-center">
            <label class="text-sm font-medium text-gray-700">Disponibilidad mínima</label>
            <span class="text-sm text-gray-500">{{ availabilityRange }}%</span>
          </div>
          <input
            type="range"
            v-model="availabilityRange"
            min="0"
            max="100"
            step="10"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div class="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <!-- Filtros de servicios -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="showServices"
              class="form-checkbox"
              id="show-services"
            />
            <label for="show-services" class="text-sm font-medium flex items-center gap-2">
              <i class="fas fa-concierge-bell text-blue-600"></i>
              Servicios
            </label>
          </div>
          <span class="text-xs text-gray-500">{{ filteredServices.length }} disponibles</span>
        </div>

        <select
          v-if="showServices"
          v-model="selectedServiceType"
          class="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option
            v-for="type in serviceTypes"
            :key="type.value"
            :value="type.value"
          >
            {{ type.label }}
          </option>
        </select>
      </div>

      <!-- Botones de acción -->
      <div class="flex gap-2">
        <button
          @click="buscarEstacionCercana"
          class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          :disabled="loading"
        >
          <i class="fas fa-gas-pump" v-if="!loading"></i>
          <i class="fas fa-spinner fa-spin" v-else></i>
          <span>{{ loading ? 'Buscando...' : 'Buscar cercana' }}</span>
        </button>

        <button
          v-if="route.length || to"
          @click="limpiarBusquedaCercana"
          class="bg-red-500 text-white px-3 py-2 rounded-lg shadow hover:bg-red-600 transition flex items-center justify-center"
          title="Limpiar búsqueda"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

    </div>


    <div>
      <button
        @click="handleUserButtonClick"
        class="fixed bottom-5 right-5 z-[1000] bg-green-600 text-white p-2 rounded-full shadow-lg hover:bg-green-700 transition flex items-center justify-center"
      >
        <template v-if="userStore.isAuthenticated">
          <img
            :src="userStore.user.imagen || '/default.jpg'"
            @error="e => e.target.src = '/default.jpg'"
            alt="Foto de perfil"
            class="w-12 h-12 rounded-full object-cover"
          />

          <button @click="userStore.logout" class="fas fa-user font-bold text-sm">
            Cerrar sesión
            <p class="text-xs">
              {{ userStore.user.email }}
            </p>
          </button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="fas fa-user text-xl">
            Iniciar sesión
          </RouterLink>
        </template>
      </button>
    </div>
      
    <!-- Botón flotante para móvil -->
    <button
      @click="isMobileDrawerOpen = true"
      class="md:hidden fixed bottom-5 right-5 z-[1000] bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition flex items-center gap-2"
    >
      <img src="/imageLogo.png" alt="Logo" class="w-6 h-6 object-contain" />
      <span class="font-medium">Filtros</span>
    </button>

    <!-- Drawer móvil -->
    <div
      v-if="isMobileDrawerOpen"
      class="md:hidden fixed inset-0 z-[1001]"
    >
      <!-- Overlay semitransparente -->
      <div
        class="absolute inset-0 bg-black/50"
        @click="isMobileDrawerOpen = false"
      ></div>

      <!-- Contenido del drawer -->
      <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 space-y-4 max-h-[80vh] overflow-y-auto">
        <!-- Header del drawer -->
        <div class="flex items-center gap-3 border-b pb-3">
          <img src="/imageLogo.png" alt="Logo" class="w-10 h-10 object-contain" />
          <div>
            <h3 class="font-semibold text-lg">Filtros de búsqueda</h3>
            <p class="text-xs text-gray-500">Encuentra estaciones y servicios</p>
          </div>
          <button
            @click="isMobileDrawerOpen = false"
            class="ml-auto text-gray-500 hover:text-gray-700"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Mismo contenido que el panel de escritorio -->
        <div class="relative">
          <input
            type="text"
            placeholder="Buscar estación o servicio..."
            class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            v-model="searchQuery"
          />
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>

        <!-- Filtros de combustible -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="showStations"
                class="form-checkbox"
                id="show-stations-mobile"
              />
              <label for="show-stations-mobile" class="text-sm font-medium flex items-center gap-2">
                <i class="fas fa-gas-pump text-green-600"></i>
                Estaciones
              </label>
            </div>
            <span class="text-xs text-gray-500">{{ filteredStations.length }} disponibles</span>
          </div>
          
          <!-- Filtro de combustibles múltiples para móvil -->
          <div v-if="showStations" class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Tipos de combustible</label>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="fuel in fuelTypes"
                :key="fuel.value"
                class="flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  :value="fuel.value"
                  v-model="selectedFuels"
                  :id="'fuel-mobile-' + fuel.value"
                  class="form-checkbox"
                />
                <label
                  :for="'fuel-mobile-' + fuel.value"
                  class="text-sm flex items-center gap-1"
                >
                  <span
                    class="w-3 h-3 rounded-full"
                    :class="'bg-' + fuel.color + '-500'"
                  ></span>
                  {{ fuel.label }}
                </label>
              </div>
            </div>
          </div>

          <!-- Filtro de disponibilidad para móvil -->
          <div v-if="showStations" class="space-y-2 mt-4">
            <div class="flex justify-between items-center">
              <label class="text-sm font-medium text-gray-700">Disponibilidad mínima</label>
              <span class="text-sm text-gray-500">{{ availabilityRange }}%</span>
            </div>
            <input
              type="range"
              v-model="availabilityRange"
              min="0"
              max="100"
              step="10"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div class="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <!-- Filtros de servicios -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="showServices"
                class="form-checkbox"
                id="show-services-mobile"
              />
              <label for="show-services-mobile" class="text-sm font-medium flex items-center gap-2">
                <i class="fas fa-concierge-bell text-blue-600"></i>
                Servicios
              </label>
            </div>
            <span class="text-xs text-gray-500">{{ filteredServices.length }} disponibles</span>
          </div>
          <select
            v-model="selectedServiceType"
            class="w-full p-2 border rounded-lg text-sm"
            :disabled="!showServices"
          >
            <option
              v-for="type in serviceTypes"
              :key="type.value"
              :value="type.value"
            >
              {{ type.label }}
            </option>
          </select>
        </div>

        <!-- Botones de acción -->
        <div class="flex gap-2">
          <button
            @click="buscarEstacionCercana"
            class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            :disabled="loading"
          >
            <i class="fas fa-gas-pump" v-if="!loading"></i>
            <i class="fas fa-spinner fa-spin" v-else></i>
            <span>{{ loading ? 'Buscando...' : 'Buscar cercana' }}</span>
          </button>

          <button
            v-if="route.length || to"
            @click="limpiarBusquedaCercana"
            class="bg-red-500 text-white px-3 py-2 rounded-lg shadow hover:bg-red-600 transition flex items-center justify-center"
            title="Limpiar búsqueda"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

    
        
      </div>
    </div>

    <LMap
      ref="map"
      v-model:zoom="zoom"
      :center="center"
      :use-global-leaflet="false"
      class="h-full w-full z-0"
    >
   

      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      />

      <LPolyline
        v-if="route.length && showRoute"
        :lat-lngs="route"
        :color="'blue'"
        :weight="4"
      />

      <!-- Marcador de ubicación del usuario -->
      <LMarker
        v-if="from"
        :lat-lng="from"
      >
        <LIcon
          :icon-url="userIcon.iconUrl"
          :shadow-url="userIcon.shadowUrl"
          :icon-size="userIcon.iconSize"
          :icon-anchor="userIcon.iconAnchor"
          :popup-anchor="userIcon.popupAnchor"
          :shadow-size="userIcon.shadowSize"
        />
        <LPopup>
          <div class="font-medium">Tu ubicación actual</div>
        </LPopup>
      </LMarker>



      <!-- Estaciones -->
      <LMarker
        v-for="station in filteredStations"
        :key="station._id"
        :lat-lng="station.point.coordinates"
      >
        <LPopup>
          <div class="max-w-sm">
            <h3 class="font-bold text-lg mb-2">{{ station.name }}</h3>
            <img
              :src="`${API_URL}${station.image_url}`"
              alt="Imagen de estación"
              class="w-full rounded shadow mb-2"
            />
            <div class="space-y-3">
              <div v-if="station.fuels" class="space-y-2">
                <span class="font-semibold">Combustibles:</span>
                <div v-for="fuel in station.fuels" :key="fuel.type" class="space-y-1">
                  <div class="flex justify-between items-center">
                    <span :class="fuelBadgeClass(fuel.type) + ' px-2 py-1 rounded text-sm'">
                      {{ fuel.type }}
                    </span>
                    <span class="text-sm text-gray-600">
                      {{ fuel.available }}L / {{ fuel.capacity }}L
                      ({{ Math.round((fuel.available / fuel.capacity) * 100) }}%)
                    </span>
                  </div>
                  <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full transition-all"
                      :class="getBatteryLevel(fuel.available, fuel.capacity)"
                      :style="{ width: (fuel.available / fuel.capacity * 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
              <div v-if="station.address" class="text-sm text-gray-600">
                <i class="fas fa-map-marker-alt mr-1"></i>
                {{ station.address }}
              </div>
              <div v-if="station.hour" class="text-sm text-gray-600">
                <i class="fas fa-clock mr-1"></i>
                {{ station.hour }}
              </div>
              
              <RouterLink
                v-if="!userStore.isAuthenticated"
                :to="{ name: 'login'}"
                class="w-full mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition inline-flex items-center justify-center font-semibold shadow-md "
              >
                <span class="text-white">Ver usuarios en el area</span>
              </RouterLink>
              <div v-else>
                  <LGeoJson
                        v-if="stationBuffers[station._id]"
                        :geojson="stationBuffers[station._id].circle"
                        :optionsStyle="{
                          color: stationBuffers[station._id].color || '#ff0000',
                          weight: 2,
                          opacity: 0.6,
                          fillOpacity: 0.2,
                          fillColor: stationBuffers[station._id].color || '#ff0000'
                        }"
                      >
                        <LPopup>
                          <div
                            class=" text-sm text-gray-800 space-y-2 w-64 "
                            :style="{ borderColor: stationBuffers[station._id].color }"
                          >
                            <h3 class="text-lg font-semibold text-gray-900 border-b pb-1 flex items-center gap-2">
                              Información de Concurrencia
                            </h3>

                            <p>
                              <span class="font-medium">Nivel:</span>
                              <span :style="{ color: stationBuffers[station._id].color }" class=" font-bold">
                                {{ stationBuffers[station._id].concurrencyLevel }}
                              </span>
                            </p>

                            <p class="flex items-center gap-1">
                              <svg class="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.92 6.01C18.72 5.42 18.15 5 17.5 5H6.5C5.85 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 6h11l1.72 5H4.78L6.5 6zM19 16c-.83 0-1.5-.67-1.5-1.5S18.17 13 19 13s1.5.67 1.5 1.5S19.83 16 19 16zm-14 0c-.83 0-1.5-.67-1.5-1.5S4.17 13 5 13s1.5.67 1.5 1.5S5.83 16 5 16z"/>
                              </svg>
                              <span class="font-medium">Autos en el área:</span>
                              {{ stationBuffers[station._id].concurrencyCount }}
                            </p>
                            <p>
                              <span class="font-medium">Radio:</span>
                              {{ stationBuffers[station._id].radius }} metros
                            </p>
                          </div>

                        </LPopup>
                      </LGeoJson>
              </div>
            </div>
          </div>
        </LPopup>
        <LIcon
          :icon-size="[32, 37]"
          :icon-anchor="[16, 37]"
          icon-url="../public/imageLogo.png"
        />
      </LMarker>

      <!-- Servicios -->
      <LMarker
        v-for="service in filteredServices"
        :key="service._id"
        :lat-lng="service.point.coordinates"
      >

        <LIcon
          :icon-url="getIconUrl(service.category)"
          :icon-size="[32, 32]"
          :icon-anchor="[16, 32]"
        />
        <LPopup>
          <div class="max-w-sm">
            <h3 class="font-bold text-lg mb-2">{{ service.name }}</h3>
            <img
              :src="`${API_URL}${service.image_url}`"
              alt="Imagen del lugar de servicio"
              class="w-full rounded shadow mb-2"
            />
            <div class="mt-2">
              <span class="font-semibold">Categoría:</span>
              <span class="ml-2">{{ service.category }}</span>
            </div>
          </div>
        </LPopup>
      </LMarker>

      <!-- Buffers de concurrencia -->

    </LMap>
  </div>
  <RouteSidebar
    :visible="showInstructions"
    :steps="steps"
    :duration="duration"
    :distance="distance"
    @close="showInstructions = false"
  />


</template>

<style scoped>
.form-checkbox {
  @apply rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.fa-spin {
  animation: spin 1s linear infinite;
}
.absolute {
  transition: all 0.3s ease-in-out;
}

/* Estilos para el input range personalizado */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #10b981;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  background: #059669;
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #10b981;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

input[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.1);
  background: #059669;
}
</style>
