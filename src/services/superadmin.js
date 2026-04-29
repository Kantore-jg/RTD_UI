import api from './api'

export const superAdminService = {
  dashboard() {
    return api.get('/super-admin/dashboard')
  },

  organizations(params = {}) {
    return api.get('/super-admin/organizations', { params })
  },

  createOrganization(data) {
    return api.post('/super-admin/organizations', data)
  },

  updateOrganization(id, data) {
    return api.put(`/super-admin/organizations/${id}`, data)
  },

  toggleOrganizationStatus(id) {
    return api.patch(`/super-admin/organizations/${id}/toggle-status`)
  },

  deleteOrganization(id) {
    return api.delete(`/super-admin/organizations/${id}`)
  },

  toggleModule(id, data) {
    return api.patch(`/super-admin/organizations/${id}/modules`, data)
  },

  payments(params = {}) {
    return api.get('/super-admin/payments', { params })
  },

  validatePayment(id) {
    return api.patch(`/super-admin/payments/${id}/validate`)
  },

  rejectPayment(id) {
    return api.patch(`/super-admin/payments/${id}/reject`)
  },

  paymentMethods() {
    return api.get('/super-admin/payment-methods')
  },

  createPaymentMethod(data) {
    return api.post('/super-admin/payment-methods', data)
  },

  deletePaymentMethod(id) {
    return api.delete(`/super-admin/payment-methods/${id}`)
  },

  contactMessages(params = {}) {
    return api.get('/super-admin/contact-messages', { params })
  },

  markContactMessageRead(id) {
    return api.patch(`/super-admin/contact-messages/${id}/read`)
  },

  adminMessages(params = {}) {
    return api.get('/super-admin/admin-messages', { params })
  },

  markAdminMessageRead(id) {
    return api.patch(`/super-admin/admin-messages/${id}/read`)
  },

  replyAdminMessage(id, data) {
    return api.post(`/super-admin/admin-messages/${id}/reply`, data)
  },

  replyContactMessage(id, data) {
    return api.post(`/super-admin/contact-messages/${id}/reply`, data)
  },

  newsletters(params = {}) {
    return api.get('/super-admin/newsletters', { params })
  },

  createNewsletter(data) {
    return api.post('/super-admin/newsletters', data)
  },

  sendNewsletter(id) {
    return api.post(`/super-admin/newsletters/${id}/send`)
  },

  deleteNewsletter(id) {
    return api.delete(`/super-admin/newsletters/${id}`)
  },
}
