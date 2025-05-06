<script lang="ts" setup>
    import { inject } from 'vue';
 
    
</script>

<template>
  <div class="flex items-center justify-center h-screen ">
    <div class="w-full max-w-md px-6">
      <h1 class="text-4xl font-extrabold  text-center mb-4">Iniciar Sesión</h1>
      <FormKit
        id="loginform"
        type="form"
        :actions="false"
        incomplete-message="No se pudo enviar, revisa las notificaciones"
      >
        <FormKit
          type="email"
          prefix-icon="email"
          label="Correo"
          name="email"
          placeholder="Email de Usuario"
          validation="required|email"
          :validation-messages="{
            required: 'El correo es obligatorio',
            email: 'Email no válido'
          }"
        />
        <FormKit
          type="password"
          
          label="Contraseña"
          name="password"
          placeholder="Password de usuario"
          validation="required"
          :validation-messages="{
            required: 'La contraseña es obligatorio',
          }"
          prefix-icon="password"
            suffix-icon="eyeClosed"
            @suffix-icon-click="handleIconClick"
            suffix-icon-class="hover:text-blue-500"
        />
        <FormKit type="submit">Iniciar Sesión</FormKit>
      </FormKit>
    </div>
  </div>
</template>
