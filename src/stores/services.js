import ServiceAPI from "@/api/ServiceAPI";
import { defineStore } from "pinia";
import { onMounted, ref } from "vue";

export const  useServicesStore = defineStore('services', () => {
    const services = ref({})

    onMounted(async () => {
        try {
            const { data } = await ServiceAPI.all()
            services.value = data
        } catch (error) {
            console.log(error)
        }
    })




    return {
        services,
   
    }
})



