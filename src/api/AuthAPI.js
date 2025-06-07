import api from "@/lib/axios";

export default {
    login(data){
        return api.post('auth/login', data)
    },
    auth() {
    const token = localStorage.getItem('AUTH_TOKEN')
    return api.get('/auth/user', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  },
   loginConGoogle(payload) {
      return api.post('/auth/google', payload)
  }
}
