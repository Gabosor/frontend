import StationAPI from "@/api/StationAPI";
import { defineStore } from "pinia";
import { ref, computed, onMounted } from "vue";

export const useStationsStore = defineStore('stations', () => {
    
    const stations = ref([])
    
    onMounted(async () => {
        try {
            const { data } = await StationAPI.all()
            stations.value = data
        } catch (error) {
            console.log(error)
        }
    })
     const fetchStations = async () => {
        try {
        const { data } = await StationAPI.all()
        stations.value = data
        } catch (error) {
        console.error("Error al cargar estaciones:", error)
        }
  }



    return {
        stations,
        fetchStations
    }
})