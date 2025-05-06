<script lang="ts" setup>
import { LMap, LTileLayer, LMarker, LIcon, LPopup } from "@vue-leaflet/vue-leaflet";
import { ref } from "vue";
    import Sidebar from "@/components/Sidebar.vue";
    import Search from "@/components/Search.vue";
    import { useStationsStore } from "@/stores/stations";
    import { useServicesStore } from "@/stores/services";
    
    const store = useStationsStore()
    const servicesStore = useServicesStore()

    const zoom = ref(15);
    const API_URL = import.meta.env.VITE_BACKEND_URL


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
    <!-- Mapa de fondo -->
     <Search/>

      <LMap
        ref="map"
        v-model:zoom="zoom"
        :center="[-17.973244, -67.106225]"
        :use-global-leaflet="false"
        class="h-full w-full z-0"
      >
        <LTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        />
        <LMarker
          v-for="station in store.stations" :key="station._id"
          :lat-lng="station.point.coordinates"
        >
          <LPopup>
            {{ station.name }}
            <img :src="`${API_URL}${station.image_url}`" alt="Imagen de estación" class="w-64 rounded shadow" />

          </LPopup>
          <LIcon
                :icon-size="[32,37]"
                :icon-anchor="[16, 37]"
                icon-url="../public/imageLogo.png" 
          />
        </LMarker>

        <LMarker
          v-for="service in servicesStore.services" :key="service._id"
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

    <Sidebar/>

  </div>
</template>

<style>

</style>
