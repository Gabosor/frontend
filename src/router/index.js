import { createRouter, createWebHistory } from 'vue-router'
import MapView from '@/views/MapView.vue'
import DashboardView from '@/views/DashboardView.vue'
import AuthAPI from '@/api/AuthAPI'
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
      meta: { requiresAuth: true },
      component: DashboardView,
      children: [
        {
          path: '',
          name: 'dashboard-stats',
          component: () => import('../components/DashboardStats.vue')
        },
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
        {
          path: '/actualizar-combustible',
          name: 'fuel-update',
          component: () => import('../components/ActualizarCombustible.vue')
        },
        {
            path: '/asignar-roles',
            name: 'assign-role',
            component: () => import('@/views/AssignRolesView.vue'),
            meta: { requiresAuth: true, role: 'admin' },
        } ,
        {
            path: '/asignar-estacion',
            name: 'assign-station',
            component: () => import('@/views/AssignStationsView.vue'),
        }

        
      ]

    },

    
  ],
})
//Para autenticar al usuario
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (requiresAuth) {
    try {
      await AuthAPI.auth()
      next() // simplemente sigue
    } catch (error) {
      next({ name: 'login' })
    }
  } else {
    next()
  }
})

export default router
