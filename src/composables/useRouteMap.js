import { ref, computed } from 'vue'
import { getRoute } from '@/api/OsrmAPI'
import * as turf from '@turf/turf'

export default function useRouteMap() {
  const route = ref([])
  const from = ref(null)
  const to = ref(null)

  const calcularRuta = async () => {
    if (!from.value || !to.value) return
    try {
      route.value = await getRoute(from.value, to.value)
    } catch (error) {
      console.error('Error al calcular la ruta:', error.message)
    }
  }

  // 👉 Calcula un buffer de 500 metros alrededor del punto de origen
  const bufferGeoJson = computed(() => {
    if (!from.value) return null
    const point = turf.point([from.value[1], from.value[0]]) // lng, lat
    return turf.buffer(point, 0.5, { units: 'kilometers' })
  })

  return {
    from,
    to,
    route,
    calcularRuta,
    bufferGeoJson
  }
}
