import api from './api'

export const libraryService = {
  stats(params = {}) {
    return api.get('/library/stats', { params })
  },
  bookCategories() {
    return api.get('/library/book-categories')
  },
  createBookCategory(data) {
    return api.post('/library/book-categories', data)
  },
  updateBookCategory(id, data) {
    return api.patch(`/library/book-categories/${id}`, data)
  },
  deleteBookCategory(id) {
    return api.delete(`/library/book-categories/${id}`)
  },
  authors(params = {}) {
    return api.get('/library/authors', { params })
  },
  createAuthor(data) {
    return api.post('/library/authors', data)
  },
  updateAuthor(id, data) {
    return api.patch(`/library/authors/${id}`, data)
  },
  deleteAuthor(id) {
    return api.delete(`/library/authors/${id}`)
  },
  books(params = {}) {
    return api.get('/library/books', { params })
  },
  searchBooks(q) {
    return api.get('/library/books/search', { params: { q } })
  },
  createBook(data) {
    return api.post('/library/books', data)
  },
  updateBook(id, data) {
    return api.patch(`/library/books/${id}`, data)
  },
  deleteBook(id) {
    return api.delete(`/library/books/${id}`)
  },
  members(params = {}) {
    return api.get('/library/members', { params })
  },
  createMember(data) {
    return api.post('/library/members', data)
  },
  updateMember(id, data) {
    return api.patch(`/library/members/${id}`, data)
  },
  deleteMember(id) {
    return api.delete(`/library/members/${id}`)
  },
  borrowings(params = {}) {
    return api.get('/library/borrowings', { params })
  },
  createBorrowing(data) {
    return api.post('/library/borrowings', data)
  },
  returnBorrowing(id) {
    return api.post(`/library/borrowings/${id}/return`)
  },
}
