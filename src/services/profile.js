import api from './api'

export const profileService = {
  get() {
    return api.get('/profile')
  },

  update(data) {
    return api.put('/profile', data)
  },

  updateAvatar(formData) {
    return api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  removeAvatar() {
    return api.delete('/profile/avatar')
  },

  changePassword(data) {
    return api.post('/profile/change-password', data)
  },
}

export const settingsService = {
  getOrg() {
    return api.get('/settings/organization')
  },

  updateOrg(data) {
    return api.put('/settings/organization', data)
  },

  updateLogo(formData) {
    return api.post('/settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  removeLogo() {
    return api.delete('/settings/logo')
  },

  updateCredentials(data) {
    return api.put('/settings/credentials', data)
  },

  updateNotifications(data) {
    return api.put('/settings/notifications', data)
  },
}
