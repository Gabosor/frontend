<script setup>
import {
  LMap,
  LTileLayer,
  LMarker,
  LIcon,
  LPopup,
  LPolyline,
  LGeoJson
} from "@vue-leaflet/vue-leaflet"
import { ref, onMounted } from "vue"
import Search from "@/components/Search.vue"
import { useStationsStore } from "@/stores/stations"
import { useServicesStore } from "@/stores/services"
import useRouteMap from "@/composables/useRouteMap"
import * as turf from '@turf/turf'
import { inject } from "vue"
const store = useStationsStore()
const servicesStore = useServicesStore()
const { from, to, route, calcularRuta, bufferGeoJson } = useRouteMap()

const zoom = ref(15)
const center = ref([-17.973244, -67.106225])
const toast = inject('toast')
const API_URL = import.meta.env.VITE_BACKEND_URL

onMounted(() => {
  obtenerUbicacion()
})
const obtenerUbicacion = () =>
{
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      const userPoint = [lat, lng]

      from.value = userPoint
      center.value = userPoint
    },
    () => {
      toast.error('No pudimos obtener tu ubicación')
    }
  )
}
const buscarEstacionCercana = async () => {
  if (!from.value){
    obtenerUbicacion()
  }
  const puntos = store.stations
    .filter(st => st?.point?.coordinates?.length === 2)
    .map(st => turf.point(
      [st.point.coordinates[1], st.point.coordinates[0]],
      { ...st }
    ))
  if (!puntos.length){
    toast.error('No hay estaciones disponibles')
  }
  const featureCollection = turf.featureCollection(puntos)
  const userTurf = turf.point([from.value[1], from.value[0]])
  const nearest = turf.nearestPoint(userTurf, featureCollection)
  if (nearest?.geometry?.coordinates) {
    to.value = [nearest.geometry.coordinates[1], nearest.geometry.coordinates[0]]
    calcularRuta()
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
</script>

<template>
  <div class="relative h-screen w-screen">
    <Search />

    <button
      @click="buscarEstacionCercana"
      class="absolute top-5 left-5 z-[1000] bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition"
    >
      Buscar estación más cercana
    </button>

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

      <LPolyline v-if="route.length" :lat-lngs="route" :color="'blue'" :weight="4" />

      <LMarker v-if="from" :lat-lng="from">
        <LPopup>Tu ubicación</LPopup>
      </LMarker>

      <LMarker v-if="to" :lat-lng="to">
        <LPopup>Destino seleccionado</LPopup>
      </LMarker>

      <LMarker
        v-for="station in store.stations"
        :key="station._id"
        :lat-lng="station.point.coordinates"
      >
        <LPopup>
          {{ station.name }}
          <img :src="`${API_URL}${station.image_url}`" alt="Imagen de estación" class="w-64 rounded shadow" />
        </LPopup>
        <LIcon
          :icon-size="[32, 37]"
          :icon-anchor="[16, 37]"
          icon-url="../public/imageLogo.png"
        />
      </LMarker>

      <LMarker
        v-for="service in servicesStore.services"
        :key="service._id"
        :lat-lng="service.point.coordinates"
      >
        <LIcon
          :icon-url="getIconUrl(service.category)"
          :icon-size="[32, 32]"
          :icon-anchor="[16, 32]"
        />
        <LPopup>
          {{ service.name }}
          <img :src="`${API_URL}${service.image_url}`" alt="Imagen del lugar de servicio" class="w-64 rounded shadow" />
        </LPopup>
      </LMarker>
    </LMap>
  </div>
</template>
