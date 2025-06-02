import { ref, computed } from 'vue'
import { getRoute } from '@/api/OsrmAPI'
import * as turf from '@turf/turf'

export default function useRouteMap() {
  const route = ref([])
  const from = ref(null)
  const to = ref(null)
  const steps = ref([])
  const duration = ref(0)
  const distance = ref(0)

  const calcularRuta = async () => {
    if (!from.value || !to.value) return
    try {
      const data = await getRoute(from.value, to.value)
      route.value = data.coordinates
      steps.value = data.steps
      duration.value = data.duration
      distance.value = data.distance
    } catch (error) {
      console.error('Error al calcular la ruta:', error.message)
    }
  }

  const bufferGeoJson = computed(() => {
    if (!from.value) return null
    const point = turf.point([from.value[1], from.value[0]]) // lng, lat
    return turf.buffer(point, 0.5, { units: 'kilometers' })
  })

  return {
    from,
    to,
    route,
    steps,
    duration,
    distance,
    calcularRuta,
    bufferGeoJson
  }
}
