import { ref } from 'vue'

export default function useLocationMap()
{
    
    const zoom = ref(15)
    const center = ref([-17.964055, -67.114579])


    function pin(e)
    {
        const marker = e.target.getLatLng()
        center.value = [marker.lat, marker.lng]
    }



    return {
        zoom,
        center,
        pin
    }
}