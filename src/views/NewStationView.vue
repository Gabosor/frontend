<script lang="ts" setup>
    import { LMap, LMarker, LTileLayer, LIcon } from "@vue-leaflet/vue-leaflet";
    import useLocationMap from "@/composables/useLocationMap";
    import { inject, ref } from "vue";
    import { reset } from "@formkit/vue";
    import StationAPI from "@/api/StationAPI";
    import UploadAPI from "@/api/UploadAPI";
    const toast = inject('toast')
    const { zoom, center, pin } = useLocationMap()

    const fuels = ref([])
    const nameStation = ref('')

const handleSubmit = async ({text_2, text_3, image, fuels, ...formData}) => {
  try {              // <-- Extraemos el File real
    const newFuel = fuels.map((dato, indice) => ({
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
  } catch (error) {
    toast.error(error.response.data.msg)
  }
}


</script>
<template>
  <h1 class="text-4xl font-extrabold text-blue-600 text-center ">Registrar Nueva Estación</h1>

  <div class="grid grid-cols-1 md:grid-cols-2 mx-10 md:mx-56 border rounded-lg p-10 gap-8 bg-white">
    <!-- Formulario -->
    <div class="">
      <FormKit
        id="registerForm"
        type="form"
        :actions="false"
        incomplete-message="No se pudo enviar, revisa los campos"
        @submit="handleSubmit"
      >
        <FormKit
          type="text"
          label="Nombre de la estación"
          placeholder="Ej. Estación Central"
          v-model="nameStation"
          validation="required|length:5"
          name="name"
          :validation-messages="{
            required: 'El nombre de la estación es obligatorio',
            length: 'El nombre es muy corto'
          }"
        />

        <FormKit
          type="checkbox"
          label="Tipos de combustible que vende"
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
          file-item-icon="fileImage"
          file-remove-icon="trash"
          label="Imagen"
          name="image"
          accept="image/*"
          validation="required"
        />


        <FormKit
          type="text"
          label="Horario de Atención"
          placeholder="Ej. 06:00 - 22:00"
          name="hour"
          validation="required"
        />

        <FormKit
          type="text"
          label="Dirección de la estación"
          placeholder="Ej. Av. Cívica y Bolívar, Oruro"
          name="address"
          validation="required"
        />

        <FormKit
          type="tel"
          label="Teléfono de contacto"
          placeholder="Ej. 72567890"
          name="contact.phone"
        />

        <FormKit
          type="email"
          prefix-icon="email"
          label="Correo de contacto"
          placeholder="Ej. estacion@example.com"
          name="contact.email"
        />

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

        <FormKit type="submit" label="Registrar Estación" />
      </FormKit>
    </div>

    <!-- Mapa -->
    <div style="height:500px; width:100%">
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
          <LIcon
            :icon-size="[32,37]"
            :icon-anchor="[16, 37]"
            icon-url="/imageLogo.png"
          />
        </LMarker>
      </LMap>
    </div>
  </div>
</template>
