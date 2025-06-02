<script lang="ts" setup>
    import { LMap, LMarker, LTileLayer, LIcon } from "@vue-leaflet/vue-leaflet";
    import useLocationMap from "@/composables/useLocationMap";
    import { inject, ref } from "vue";
    import { reset } from "@formkit/vue";
    import ServiceAPI from "@/api/ServiceAPI";
    import UploadAPI from "@/api/UploadAPI";
    const toast = inject('toast')
    const { zoom, center, pin } = useLocationMap()
    const nameStation = ref('')
    const locationInput = ref("");

    const handleSubmit = async ({text_2, text_3, image, ...formData}) => {
    try {     
        const fd = new FormData()
        fd.append('image', image[0].file)
        const { data } = await UploadAPI.upload(fd)

        formData.image_url = data.imageUrl
        formData.point = {
            type: "Point",
            coordinates: center.value
        }
        const result = await ServiceAPI.create(formData)
        toast.success(result.data.msg)
        reset('registerForm')
    } catch (error) {
        toast.error(error.response.data.msg)
    }
    }
    function dmsToDecimal(dms: string): [number, number] | null {
        // Intentar con formato clásico con símbolos
        let regex = /([0-9]{1,3})°([0-9]{1,2})'([0-9.]+)"?([NS])\s*([0-9]{1,3})°([0-9]{1,2})'([0-9.]+)"?([EW])/i;
        let match = dms.match(regex);
        if (!match) {
            // Intentar con formato con espacios y sin símbolos
            regex = /([0-9]{1,3})[°\s]+([0-9]{1,2})[\s']+([0-9.]+)[\s"]*([NS])\s+([0-9]{1,3})[°\s]+([0-9]{1,2})[\s']+([0-9.]+)[\s"]*([EW])/i;
            match = dms.match(regex);
        }
        if (!match) return null;
        const latDeg = parseInt(match[1]);
        const latMin = parseInt(match[2]);
        const latSec = parseFloat(match[3]);
        const latDir = match[4].toUpperCase();
        const lngDeg = parseInt(match[5]);
        const lngMin = parseInt(match[6]);
        const lngSec = parseFloat(match[7]);
        const lngDir = match[8].toUpperCase();
        let lat = latDeg + latMin / 60 + latSec / 3600;
        let lng = lngDeg + lngMin / 60 + lngSec / 3600;
        if (latDir === "S") lat = -lat;
        if (lngDir === "W") lng = -lng;
        return [lat, lng];
    }

    function handleConvertLocation() {
        const input = locationInput.value.trim();
        let lat = null, lng = null;
        if (input.startsWith('http')) {
            let match = input.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
            if (match) {
                lat = parseFloat(match[1]);
                lng = parseFloat(match[2]);
            } else {
                match = input.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (match) {
                    lat = parseFloat(match[1]);
                    lng = parseFloat(match[2]);
                }
            }
        }

        if (lat === null || lng === null) {
            let match = input.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
            if (match) {
                lat = parseFloat(match[1]);
                lng = parseFloat(match[2]);
            }
        }
        if (lat === null || lng === null) {
            const result = dmsToDecimal(input);
            if (result) {
                lat = result[0];
                lng = result[1];
            }
        }

        if (lat !== null && lng !== null) {
            center.value = [lat, lng];
        } else {
            toast && toast.error("Formato inválido. Puedes pegar una URL de Google Maps, coordenadas decimales o DMS. Ejemplo: https://www.google.com/maps/place/… o -17.97, -67.08 o 17 57 33.5 S 67 06 23.5 W");
        }
    }


</script>
<template>
  <div class="max-w-full mx-auto px-6">
    <div class="my-6">
      <h1 class="text-3xl font-bold text-gray-900">Registrar Nuevo Servicio</h1>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-0">
        <!-- Formulario -->
        <div class="p-6 overflow-y-auto lg:col-span-1" style="max-height: calc(100vh - 200px)">
      <FormKit
        id="registerForm"
        type="form"
        :actions="false"
        incomplete-message="No se pudo enviar, revisa los campos"
        @submit="handleSubmit"
      >
        <FormKit
          type="text"
          label="Nombre del Servicio"
          placeholder="Ingrese el nombre del servicio"
          validation="required|length:5"
          name="name"
          :validation-messages="{
            required: 'El nombre deL servicio es obligatorio',
            length: 'El nombre es muy corto'
          }"
        />

        <FormKit
          type="select"
          label="Tipo de servicio"
          validation="required"
          name="category"
          placeholder="Seleccione un Servicio"
          :validation-messages="{
            required: 'Debe seleccionar un servicio'
          }"
          :options="[
                { label: 'Restaurante', value: 'restaurante' },
                { label: 'Farmacia', value: 'farmacia' },
                { label: 'Baño público', value: 'baño' },
                { label: 'Tienda de barrio', value: 'tienda' },
                { label: 'Cajero automático', value: 'cajero' },
                { label: 'Hotel', value: 'hotel' },
                { label: 'Hostal', value: 'hostal' }
            ]"
        />
        <FormKit
          type="text"
          label="Dirección del Servicio"
          placeholder="Ingrese la direccion del servicio"
          name="address"
          validation="required"
        />
        
        <FormKit
          type="tel"
          label="Teléfono de contacto"
          placeholder="Ej. 72567890"
          name="contact.phone"
        />
        <!--  
        <FormKit
          type="email"
          prefix-icon="email"
          label="Correo de contacto"
          placeholder="Ingrese el correo"
          name="contact.email"
        />
        -->

        <FormKit
          type="file"
          file-item-icon="fileImage"
          file-remove-icon="trash"
          label="Imagen"
          name="image"
          accept="image/*"
          validation="required"
        />
        <div class="flex gap-2">
          <FormKit
              type="text"
              label="Latitud"
              v-model="center[0]"
              name=""
              disabled
            />
            <FormKit
              type="text"
              label="Longitud"
              v-model="center[1]"
              disabled
            />
        </div>
        

        <!-- Input para localización (URL, decimal o DMS) -->
        <div>
          <label class="font-medium text-gray-700 mb-1 block">Localización (URL, decimal o DMS)</label>
          <div class="flex gap-2">
            <input
              v-model="locationInput"
              type="text"
              placeholder="Ej. https://www.google.com/maps/place/... o -17.97, -67.08 o 17 57 33.5 S 67 06 23.5 W"
              class="w-full rounded-lg border-gray-400 border-2"
            />
            <button
              type="button"
              @click="handleConvertLocation"
              class="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Convertir
            </button>
          </div>
          <p class="text-gray-500 text-xs mt-1">Pega una URL de Google Maps, coordenadas decimales o DMS y presiona convertir</p>
        </div>

        <FormKit type="submit" label="Registrar Servicio" />
      </FormKit>
    </div>

   <div class="relative lg:col-span-2">
    <div class="sticky top-0 h-[calc(80vh-80px)]">
      <div class="h-full">
          <LMap ref="map" v-model:zoom="zoom" :center="center" :use-global-leaflet="false">
            <LTileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              layer-type="base"
              name="OpenStreetMap"
            />
            <LMarker
              :lat-lng="center"
              :draggable="true"
              @moveend="pin"
            >

            </LMarker>
          </LMap>
           <p class="absolute bottom-4 left-4 right-4 text-sm text-gray-600 bg-white/90 backdrop-blur-sm p-2 rounded-lg">
                Arrastra el marcador para ajustar la ubicación exacta de la estación
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
