import api from "@/lib/axios";

export default {
  getUsers() {
    const token = localStorage.getItem('AUTH_TOKEN');
    return api.get('/users');
  },

  updateRole(userId, newRole) {
    return api.put(`/users/role/${userId}`, { rol: newRole });
  }
};
