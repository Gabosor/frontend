import ServiceAPI from "@/api/ServiceAPI";
import { defineStore } from "pinia";
import { ref, onMounted } from "vue";

export const useServicesStore = defineStore('services', () => {
    const services = ref([])

    const fetchServices = async () => {
        try {
            const { data } = await ServiceAPI.all()
            services.value = data
        } catch (error) {
            console.error('Error al cargar servicios:', error)
        }
    }

    onMounted(async () => {
        await fetchServices()
    })

    return {
        services,
        fetchServices
    }
})



