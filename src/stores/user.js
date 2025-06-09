import { ref, onMounted, computed } from "vue";
import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import AuthAPI from "@/api/AuthAPI";


export const useUserStore = defineStore('user', () => {
    const user = ref({})
    const router = useRouter()
    const loading = ref(true)
    onMounted(async () => {
        try {
            const { data } = await AuthAPI.auth()
            console.log(data)
            user.value = data      
        } catch (error) {
            console.log(error)
        } finally {
            loading.value = false
        }
    })
    function logout(){
        localStorage.removeItem('AUTH_TOKEN')
        user.value = {}
        router.push({name: 'login'})
    }
    const getUserName = computed(() => user.value?.name ? user.value?.name : '')
    const getUserEmail = computed(() => user.value?.email ? user.value?.email :'')
    const isAuthenticated = computed(() => {
            return !!user.value?.email && !!user.value?._id
        })

    


    return {
        user,
        loading,
        logout,
        getUserName,
        getUserEmail,
        isAuthenticated
    }
})