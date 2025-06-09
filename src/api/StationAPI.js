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
    },
    updateFuel(id, data){
        return api.patch(`/stations/${id}/fuel`, data)
    },
    getStationConcurrency(idStation){
        return api.get(`/stations/${idStation}/concurrency`)
    },
    getAllActiveUserLocations(){
        return api.get('/user-locations/all-active')
    },
    assignStation(id, data){
        return api.put(`/stations/assign/${id}`, data)
    }
}