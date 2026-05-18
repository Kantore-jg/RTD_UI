import api from './api'

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } }

export const attendanceService = {
  list(params = {}) {
    return api.get('/attendance', { params })
  },

  clockIn(formData) {
    return api.post('/attendance/clock-in', formData, multipart)
  },

  clockOut(formData) {
    return api.post('/attendance/clock-out', formData, multipart)
  },

  stats(params = {}) {
    return api.get('/attendance/stats', { params })
  },

  exportCsv(params = {}) {
    return api.get('/attendance/export', { params, responseType: 'blob' })
  },
}
