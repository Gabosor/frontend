<script lang="ts" setup>
    import { inject, onMounted } from 'vue';
    import AuthAPI from '@/api/AuthAPI';
      import { useRouter } from 'vue-router';

      const router = useRouter()

      const toast = inject('toast')
      const handleSubmit = async (formData) => {
          try {
              const {data: {token}} = await AuthAPI.login(formData)
              localStorage.setItem('AUTH_TOKEN', token)
              router.push({name: 'dashboard'})
          } catch (error) {
              toast.open({
                  message: error.response.data.msg,
                  type: 'error',
                  Number: 3000
              })
            // toast.error(error.response.data.msg)
          }

      }
    const handleCredentialResponse = async (response) => {
      try {
        const credential = response.credential
        //const { data } = await AuthAPI.loginGoogle({ credential })
        const { data } = await AuthAPI.loginConGoogle({ credential })

        localStorage.setItem('AUTH_TOKEN', data.token)
        toast.open({
          message: 'Inicio de sesión exitoso',
          type: 'success',
        })
        router.push({ name: 'home' })
      } catch (error) {
        console.error('Error autenticando con Google:', error)
        toast.open({
          message: 'Error al iniciar sesión con Google',
          type: 'error',
        })
      }
    }
    onMounted(() => {
      console.log('CLIENT ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)

      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse
        })

        window.google.accounts.id.renderButton(
          document.getElementById('google-button'),
          { theme: 'outline', size: 'large', text: 'continue_with' }
        )
      } else {
        console.error('Google Identity Services no cargado')
      }
    })
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
        @submit="handleSubmit"
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
            suffix-icon-class="hover:text-blue-500"
        />
        <FormKit type="submit"
          
        >Iniciar Sesión</FormKit>
      </FormKit>
      <div class="flex items-center justify-center my-4">
        <hr class="w-full border-gray-300" />
        <span class="mx-4 text-gray-500 text-sm whitespace-nowrap">o iniciar con</span>
        <hr class="w-full border-gray-300" />
      </div>

      <!-- ✅ ID corregido aquí -->
      <div id="google-button" class="w-full flex justify-center"></div>
    </div>
  </div>
</template>
