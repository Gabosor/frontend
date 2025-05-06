import api from "@/lib/axios";
import { all } from "axios";

export default {
    create(data){
        return api.post('/services', data)
    },
    all(){
        return api.get('/services')
    }
}