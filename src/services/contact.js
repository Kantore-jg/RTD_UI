import api from './api'

export const contactService = {
  send(data) {
    return api.post('/contact', data)
  },
}

export const adminMessageService = {
  send(data) {
    return api.post('/admin-messages', data)
  },
}
