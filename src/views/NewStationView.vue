<script lang="ts" setup>
    import { LMap, LMarker, LTileLayer, LIcon } from "@vue-leaflet/vue-leaflet";
    import useLocationMap from "@/composables/useLocationMap";
    import { inject, ref, watch } from "vue";
    import { reset } from "@formkit/vue";
    import StationAPI from "@/api/StationAPI";
    import UploadAPI from "@/api/UploadAPI";
    import { useRouter } from 'vue-router';

    const toast = inject('toast') as any
    const router = useRouter()
    const { zoom, center, pin } = useLocationMap()

    const fuels = ref([])
    const nameStation = ref('')
    const previewImage = ref('')
    const loading = ref(false)
    const locationInput = ref("")

    const handleImagePreview = (event) => {
        const file = event.target.files[0];
        if (file) {
            previewImage.value = URL.createObjectURL(file);
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

    const handleSubmit = async ({text_2, text_3, image, fuels, ...formData}) => {
        loading.value = true;
        try {
            const newFuel = fuels.map((dato) => ({
                type: dato,
                capacity: 5000,
                available: 10000
            }));
            formData.fuels = newFuel
            const fd = new FormData()
            fd.append('image', image[0].file)
            const { data } = await UploadAPI.upload(fd)
            formData.image_url = data.imageUrl
            formData.point = {
                type: "Point",
                coordinates: center.value
            }
            const result = await StationAPI.create(formData)
            toast.success(result.data.msg)
            reset('registerForm')
            router.push({ name: 'stations' })
        } catch (error) {
            toast.error(error.response.data.msg)
        } finally {
            loading.value = false
        }
    }

</script>
<template>
  <div class="max-w-full mx-auto px-6">
    <div class="my-6">
      <h1 class="text-3xl font-bold text-gray-900">Registrar Nueva Estación</h1>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-0">
        <!-- Formulario -->
        <div class="p-6 overflow-y-auto lg:col-span-1" style="max-height: calc(100vh - 200px)">
          <FormKit
            id="registerForm"
            type="form"
            :actions="false"
            incomplete-message="Por favor, complete todos los campos requeridos"
            @submit="handleSubmit"
            :disabled="loading"
          >
            <div class="space-y-6">
              <FormKit
                type="text"
                label="Nombre de la estación"
                placeholder="Ej. Estación Central"
                v-model="nameStation"
                validation="required|length:5"
                name="name"
                :validation-messages="{
                  required: 'El nombre de la estación es obligatorio',
                  length: 'El nombre debe tener al menos 5 caracteres'
                }"
                :classes="{
                  input: 'w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200',
                  label: 'font-medium text-gray-700 mb-1',
                  message: 'text-red-500 text-sm mt-1'
                }"
              />

              <FormKit
                type="checkbox"
                label="Tipos de combustible disponibles"
                v-model="fuels"
                validation="required"
                name="fuels"
                :validation-messages="{
                  required: 'Debe seleccionar al menos un tipo de combustible'
                }"
                :options="[
                  'Gasolina',
                  'Diesel',
                  'Gasolina Premium',
                  'Diesel ULS'
                ]"

              />

              <FormKit
                type="file"
                label="Imagen de la estación"
                name="image"
                accept="image/*"
                validation="required"
                @change="handleImagePreview"
                :classes="{
                  outer: 'space-y-2',
                  label: 'font-medium text-gray-700',
                  input: 'w-full',
                  message: 'text-red-500 text-sm mt-1'
                }"
              />

              <FormKit
                type="text"
                label="Horario de Atención"
                placeholder="Ej. 06:00 - 22:00"
                name="hour"
                validation="required"
                :classes="{
                  input: 'w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200',
                  label: 'font-medium text-gray-700 mb-1',
                  message: 'text-red-500 text-sm mt-1'
                }"
              />

              <FormKit
                type="text"
                label="Dirección de la estación"
                placeholder="Ej. Av. Cívica y Bolívar, Oruro"
                name="address"
                validation="required"
                :classes="{
                  input: 'w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200',
                  label: 'font-medium text-gray-700 mb-1',
                  message: 'text-red-500 text-sm mt-1'
                }"
              />

            <!--   <FormKit
                type="tel"
                label="Teléfono de contacto"
                placeholder="Ej. 72567890"
                name="contact.phone"
                :classes="{
                  input: 'w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200',
                  label: 'font-medium text-gray-700 mb-1',
                  message: 'text-red-500 text-sm mt-1'
                }"
              />

              <FormKit
                type="email"
                label="Correo de contacto"
                placeholder="Ej. estacion@example.com"
                name="contact.email"
                :classes="{
                  input: 'w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200',
                  label: 'font-medium text-gray-700 mb-1',
                  message: 'text-red-500 text-sm mt-1'
                }"
              />
                -->
              <!-- Input para localización DMS -->
              <div>
                <label class="font-medium text-gray-700 mb-1 block">Localización (DMS)</label>
                <div class="flex gap-2">
                  <input
                    v-model="locationInput"
                    type="text"
                    placeholder='Ej. 17 57 33.5 S 67 06 23.5 W'
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
              <div class="flex gap-2">
                   <FormKit
                    type="text"
                    label="Latitud"
                    v-model="center[0]"
                    disabled
                    :classes="{
                      input: 'w-full rounded-lg bg-gray-50 border-gray-300',
                      label: 'font-medium text-gray-700 mb-1'
                    }"
                  />
                  <FormKit
                    type="text"
                    label="Longitud"
                    v-model="center[1]"
                    disabled
                    :classes="{
                      input: 'w-full rounded-lg bg-gray-50 border-gray-300',
                      label: 'font-medium text-gray-700 mb-1'
                    }"
                  />
              </div>
              <!-- Preview de imagen -->
              <div v-if="previewImage" class="mt-4">
                <h3 class="font-medium text-gray-700 mb-2">Vista previa de imagen</h3>
                <img
                  :src="previewImage"
                  alt="Preview"
                  class="w-full h-48 object-cover rounded-lg"
                />
              </div>

              <div class=" gap-4">

                <FormKit
                  type="submit"
                  :disabled="loading"
                  :classes="{
                    input: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
                  }"
                >
                  {{ loading ? 'Registrando...' : 'Registrar Estación' }}
                </FormKit>
              </div>
            </div>
          </FormKit>
        </div>

        <!-- Mapa -->
        <div class="relative lg:col-span-2">
          <div class="sticky top-0 h-[calc(90vh-80px)]">
            <div class="h-full">
              <LMap
                ref="map"
                v-model:zoom="zoom"
                :center="center"
                :use-global-leaflet="false"
                class="h-full w-full"
              >
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
                  <LIcon
                    :icon-size="[32,37]"
                    :icon-anchor="[16, 37]"
                    icon-url="/imageLogo.png"
                  />
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

<style scoped>
.formkit-form {
  @apply space-y-6;
}
</style>
