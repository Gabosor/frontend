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
import { ref, onMounted, computed } from "vue"
import Search from "@/components/Search.vue"
import { useStationsStore } from "@/stores/stations"
import { useServicesStore } from "@/stores/services"
import useRouteMap from "@/composables/useRouteMap"
import * as turf from '@turf/turf'
import { inject } from "vue"
import RouteSidebar from "@/components/RouteSidebar.vue"

const store = useStationsStore()
const servicesStore = useServicesStore()
const { from, to, route, calcularRuta, bufferGeoJson, steps, duration, distance } = useRouteMap()

const zoom = ref(15)
const center = ref([-17.973244, -67.106225])
const toast = inject('toast')
const API_URL = import.meta.env.VITE_BACKEND_URL


const showInstructions = ref(false)




// Nuevos refs para filtros
const showStations = ref(true)
const showServices = ref(true)
const selectedFuelType = ref('all')
const selectedServiceType = ref('all')
const showRoute = ref(true)
const loading = ref(false)

// Añadir searchQuery
const searchQuery = ref('')

// Lista de tipos de combustible actualizada para coincidir con los valores almacenados
const fuelTypes = [
  { value: 'all', label: 'Todos los combustibles' },
  { value: 'Gasolina', label: 'Gasolina' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Gasolina Premium', label: 'Gasolina Premium' },
  { value: 'Diesel ULS', label: 'Diesel ULS' }
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

// Ref para múltiples tipos de combustible seleccionados
const selectedFuelTypes = ref([])

// Configuración del ícono por defecto
const userIcon = {
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}

onMounted(async () => {
  obtenerUbicacion()
  await Promise.all([
    store.fetchStations(),
    servicesStore.fetchServices()
  ])
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
    },
    () => {
      toast.error('No pudimos obtener tu ubicación')
      loading.value = false
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

  // Filtrar por tipo de combustible
  if (selectedFuelType.value !== 'all') {
    filtered = filtered.filter(station => 
      station.fuels?.some(fuel => 
        fuel.type === selectedFuelType.value // Comparación exacta sin transformación
      )
    )
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
</script>

<template>
  <div class="relative h-screen w-screen">
    <!-- Panel de control en el lado derecho -->
    <div class="absolute top-5 right-5 z-[1000] bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg w-80 space-y-4">
      <div class="flex items-center justify-between border-b pb-2">
        <h3 class="font-semibold text-lg">Filtros de búsqueda</h3>
        <div class="flex gap-2">
          <button
            @click="obtenerUbicacion"
            class="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition"
            :disabled="loading"
            title="Obtener mi ubicación"
          >
            <i class="fas fa-location-crosshairs"></i>
          </button>
        </div>
      </div>

      <!-- Barra de búsqueda integrada -->
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
              id="show-stations"
            />
            <label for="show-stations" class="text-sm font-medium">Estaciones</label>
          </div>
          <span class="text-xs text-gray-500">{{ filteredStations.length }} disponibles</span>
        </div>
        <select
          v-model="selectedFuelType"
          class="w-full p-2 border rounded-lg text-sm"
          :disabled="!showStations"
        >
          <option
            v-for="type in fuelTypes"
            :key="type.value"
            :value="type.value"
          >
            {{ type.label }}
          </option>
        </select>
      </div>

      <!-- Filtros de servicios -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              v-model="showServices"
              class="form-checkbox"
              id="show-services"
            />
            <label for="show-services" class="text-sm font-medium">Servicios</label>
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

      <!-- Leyenda -->
      <div class="border-t pt-2 text-sm">
        <h4 class="font-medium mb-2">Disponibilidad de combustible</h4>
        <div class="space-y-1.5">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="text-sm">Alta disponibilidad (>75%)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span class="text-sm">Media disponibilidad (25-75%)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <span class="text-sm">Baja disponibilidad (menor al 25%)</span>
          </div>
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
      <LGeoJson
        v-if="bufferGeoJson"
        :geojson="bufferGeoJson"
      />

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

      <LMarker
        v-if="to"
        :lat-lng="to"
      >
        <LPopup>Destino seleccionado</LPopup>
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
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div
                  :class="[
                    'w-3 h-3 rounded-full',
                    getStationStatus(station)
                  ]"
                ></div>
                <span>Disponibilidad: {{ getFuelAvailability(station, selectedFuelType) }}%</span>
              </div>
              <div v-if="station.fuels">
                <span class="font-semibold">Combustibles:</span>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span
                    v-for="fuel in station.fuels"
                    :key="fuel.type"
                    class="px-2 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {{ fuel.type }}
                  </span>
                </div>
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
</style>
