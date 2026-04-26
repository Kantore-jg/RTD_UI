import api from './api'

export const channelService = {
  list() {
    return api.get('/channels')
  },

  create(data) {
    return api.post('/channels', data)
  },

  delete(id) {
    return api.delete(`/channels/${id}`)
  },

  getMessages(channelId, params = {}) {
    return api.get(`/channels/${channelId}/messages`, { params })
  },

  sendMessage(channelId, text) {
    return api.post(`/channels/${channelId}/messages`, { text })
  },
}

export const suggestionService = {
  list(params = {}) {
    return api.get('/suggestions', { params })
  },

  create(data) {
    return api.post('/suggestions', data)
  },

  vote(id) {
    return api.post(`/suggestions/${id}/vote`)
  },

  updateStatus(id, status) {
    return api.patch(`/suggestions/${id}/status`, { status })
  },
}
