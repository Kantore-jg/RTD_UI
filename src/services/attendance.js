import api from './api'

export const attendanceService = {
  list(params = {}) {
    return api.get('/attendance', { params })
  },

  clockIn(data = {}) {
    return api.post('/attendance/clock-in', data)
  },

  clockOut() {
    return api.post('/attendance/clock-out')
  },

  stats(params = {}) {
    return api.get('/attendance/stats', { params })
  },

  exportCsv(params = {}) {
    return api.get('/attendance/export', { params, responseType: 'blob' })
  },
}
