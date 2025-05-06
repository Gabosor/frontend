import './assets/main.css'
import "leaflet/dist/leaflet.css";
import { plugin, defaultConfig } from '@formkit/vue'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import '@formkit/themes/genesis'
import config from '../formkit.config';

import { useToast } from 'vue-toast-notification';

import 'vue-toast-notification/dist/theme-sugar.css'

const $toast = useToast({
    duration: 5000,
    position: 'top-right'
})

const app = createApp(App)

app.provide('toast', $toast)

app.use(createPinia())
app.use(router)

app.use(plugin, defaultConfig(config))

app.mount('#app')
