import api from './api'

export const employeeService = {
  list(params = {}) {
    return api.get('/employees', { params })
  },

  get(id) {
    return api.get(`/employees/${id}`)
  },

  create(data) {
    return api.post('/employees', data)
  },

  update(id, data) {
    return api.put(`/employees/${id}`, data)
  },

  delete(id) {
    return api.delete(`/employees/${id}`)
  },

  toggleStatus(id) {
    return api.patch(`/employees/${id}/toggle-status`)
  },

  exportCsv() {
    return api.get('/employees-export', { responseType: 'blob' })
  },
}
