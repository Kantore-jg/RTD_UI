import api from './api'

export const moduleService = {
  list() {
    return api.get('/modules')
  },

  get(id) {
    return api.get(`/modules/${id}`)
  },

  create(data) {
    return api.post('/modules', data)
  },

  update(id, data) {
    return api.put(`/modules/${id}`, data)
  },

  delete(id) {
    return api.delete(`/modules/${id}`)
  },
}

export const entryService = {
  list(moduleId, params = {}) {
    return api.get(`/modules/${moduleId}/entries`, { params })
  },

  create(moduleId, data) {
    return api.post(`/modules/${moduleId}/entries`, data)
  },

  delete(entryId) {
    return api.delete(`/entries/${entryId}`)
  },

  exportCsv(moduleId) {
    return api.get(`/modules/${moduleId}/entries/export`, { responseType: 'blob' })
  },
}
