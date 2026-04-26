import api from './api'

export const financeService = {
  list(params = {}) {
    return api.get('/finance', { params })
  },

  create(data) {
    return api.post('/finance', data)
  },

  delete(id) {
    return api.delete(`/finance/${id}`)
  },

  summary() {
    return api.get('/finance/summary')
  },
}

export const companyPaymentService = {
  list(params = {}) {
    return api.get('/company-payments', { params })
  },

  create(data) {
    return api.post('/company-payments', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  delete(id) {
    return api.delete(`/company-payments/${id}`)
  },
}

export const paymentMethodService = {
  list() {
    return api.get('/payment-methods')
  },
}
