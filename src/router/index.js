import { createRouter, createWebHistory } from 'vue-router'
import MapView from '@/views/MapView.vue'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MapView,
    },

    {
      path: '/precios',
      name: 'prices',
      component: () => import('../views/PricesView.vue')
    },
    
    
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      children: [
         {
          path: '',
          name: 'stations',
          component: () => import('@/components/StationTable.vue')
        },
        {
          path: 'registro-servicio',
          name: 'new-service',
          component: () => import('../views/NewServiceView.vue')
        },
        {
          path: '',
          name: 'services',
          component: () => import('@/components/ServicesTable.vue')
        },
        {
          path: '/registro-estacion',
          name: 'new-station',
          component: () => import('../views/NewStationView.vue')
        },
      ]

    },

    
  ],
})

export default router
