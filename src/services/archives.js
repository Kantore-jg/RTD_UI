import api from './api'

export const folderService = {
  list() {
    return api.get('/folders')
  },

  create(data) {
    return api.post('/folders', data)
  },

  delete(id) {
    return api.delete(`/folders/${id}`)
  },
}

export const fileService = {
  list(params = {}) {
    return api.get('/files', { params })
  },

  get(id) {
    return api.get(`/files/${id}`)
  },

  upload(formData) {
    return api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  download(id) {
    return api.get(`/files/${id}/download`, { responseType: 'blob' })
  },

  delete(id) {
    return api.delete(`/files/${id}`)
  },
}
