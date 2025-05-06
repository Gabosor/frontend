import api from "@/lib/axios"

export default {
  upload(formData) {
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
