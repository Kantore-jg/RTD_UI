import api from './api'

export const inventoryService = {
  stats(params = {}) {
    return api.get('/inventory/stats', { params })
  },
  alerts(params = {}) {
    return api.get('/inventory/alerts', { params })
  },
  categories() {
    return api.get('/inventory/categories')
  },
  createCategory(data) {
    return api.post('/inventory/categories', data)
  },
  updateCategory(id, data) {
    return api.patch(`/inventory/categories/${id}`, data)
  },
  deleteCategory(id) {
    return api.delete(`/inventory/categories/${id}`)
  },
  suppliers(params = {}) {
    return api.get('/inventory/suppliers', { params })
  },
  createSupplier(data) {
    return api.post('/inventory/suppliers', data)
  },
  updateSupplier(id, data) {
    return api.patch(`/inventory/suppliers/${id}`, data)
  },
  deleteSupplier(id) {
    return api.delete(`/inventory/suppliers/${id}`)
  },
  products(params = {}) {
    return api.get('/inventory/products', { params })
  },
  createProduct(data) {
    return api.post('/inventory/products', data)
  },
  updateProduct(id, data) {
    return api.patch(`/inventory/products/${id}`, data)
  },
  deleteProduct(id) {
    return api.delete(`/inventory/products/${id}`)
  },
  movements(params = {}) {
    return api.get('/inventory/stock-movements', { params })
  },
  createMovement(data) {
    return api.post('/inventory/stock-movements', data)
  },
  sales(params = {}) {
    return api.get('/inventory/sales', { params })
  },
  createSale(data) {
    return api.post('/inventory/sales', data)
  },
  invoices(params = {}) {
    return api.get('/inventory/invoices', { params })
  },
  createInvoice(data) {
    return api.post('/inventory/invoices', data)
  },
  async openInvoicePdf(id) {
    const res = await api.get(`/inventory/invoices/${id}/pdf`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  },
}
