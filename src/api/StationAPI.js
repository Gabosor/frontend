import api from "@/lib/axios"

export default {
    create(data){
        return api.post('/stations', data)
    },
    getSirveceID(idStation){
        return api.get(`/stations/${idStation}`)
    },
    all(){
        return api.get('/stations')
    }
}